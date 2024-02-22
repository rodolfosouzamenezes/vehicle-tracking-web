'use client'

import { useMap } from '@/hooks/useMap'
import { fetcher } from '@/utils/http'
import { Route } from '@/utils/model'
import { sleep } from '@/utils/sleep'
import { useRef } from 'react'
import useSWR from 'swr'

export default function DriverPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const map = useMap(mapContainerRef)

  const { data: routes, isLoading } = useSWR<Route[]>(
    'http://localhost:3000/routes',
    fetcher,
    {
      fallback: [],
    },
  )

  const handleStartRoute = async () => {
    const routeId = (document.getElementById('route') as HTMLSelectElement)
      .value
    const response = await fetch(`http://localhost:3000/routes/${routeId}`)
    const route: Route = await response.json()

    map?.removeAllRoutes()

    await map?.addRouteWithIcons({
      routeId,
      startMarkerOptions: {
        position: route.directions.routes[0].legs[0].start_location,
      },
      endMarkerOptions: {
        position: route.directions.routes[0].legs[0].end_location,
      },
      carMarkerOptions: {
        position: route.directions.routes[0].legs[0].start_location,
      },
    })

    const { steps } = route.directions.routes[0].legs[0]

    for (const step of steps) {
      await sleep(2000)
      map?.moveCar(routeId, step.start_location)

      await sleep(2000)
      map?.moveCar(routeId, step.end_location)
    }
  }

  return (
    <div className="flex flex-row h-full w-full">
      <div>
        <h1>Minha Viagem</h1>
        <div className="flex flex-col">
          <select id="route">
            {isLoading && <option>Carregando rotas...</option>}
            {routes &&
              routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
          </select>
          <button type="submit" onClick={handleStartRoute}>
            Iniciar viagem
          </button>
        </div>
      </div>
      <div ref={mapContainerRef} className="flex-1 bg-red-50"></div>
    </div>
  )
}
