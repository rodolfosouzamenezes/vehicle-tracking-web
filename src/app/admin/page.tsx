'use client'

import { useMap } from '@/hooks/useMap'
import { Route } from '@/utils/model'
import { socket } from '@/utils/socket-io'
import { useEffect, useRef } from 'react'

export default function AdminPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const map = useMap(mapContainerRef)

  useEffect(() => {
    socket.connect()
    socket.on(
      'admin-new-points',
      async (data: { route_id: string; lat: number; lng: number }) => {
        console.log(data)

        if (!map?.hasRoute(data.route_id)) {
          const response = await fetch(
            `http://localhost:3001/routes/${data.route_id}`,
          )
          const route: Route = await response.json()

          map?.removeRoute(data.route_id)
          await map?.addRouteWithIcons({
            routeId: data.route_id,
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
        }

        map?.moveCar(data.route_id, {
          lat: data.lat,
          lng: data.lng,
        })
      },
    )

    return () => {
      socket.disconnect()
    }
  }, [map])

  return (
    <div className="flex h-screen">
      <div ref={mapContainerRef} className="flex-1 bg-red-50"></div>
    </div>
  )
}
