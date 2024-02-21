'use client'

import { useMap } from '@/hooks/useMap'
import { fetcher } from '@/utils/http'
import { Route } from '@/utils/model'
import type {
  DirectionsResponseData,
  FindPlaceFromTextResponseData,
} from '@googlemaps/google-maps-services-js'
import { FormEvent, useRef, useState } from 'react'
import useSWR from 'swr'

interface IDirectionsResponseData extends DirectionsResponseData {
  request: any
}

export default function DriverPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const map = useMap(mapContainerRef)
  const [directionsData, setDirectionsData] =
    useState<IDirectionsResponseData>()

  const {
    data: routes,
    error,
    isLoading,
  } = useSWR<Route[]>('http://localhost:3000/routes', fetcher, {
    fallback: [],
  })

  const handleSearchPlaces = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const sourceText = (document.getElementById('source') as HTMLInputElement)
      .value
    const destiantionText = (
      document.getElementById('destination') as HTMLInputElement
    ).value

    const [sourceResponse, destiantionResponse] = await Promise.all([
      fetch(`http://localhost:3000/places?text=${sourceText}`),
      fetch(`http://localhost:3000/places?text=${destiantionText}`),
    ])

    const [sourcePlace, destinationPlace]: FindPlaceFromTextResponseData[] =
      await Promise.all([sourceResponse.json(), destiantionResponse.json()])

    if (sourcePlace.status !== 'OK') {
      console.error(sourcePlace)
      return alert('Não foi possível encontrar a origem')
    }

    if (destinationPlace.status !== 'OK') {
      console.error(destinationPlace)
      return alert('Não foi possível encontrar o destino')
    }

    const placeSourceId = sourcePlace.candidates[0].place_id
    const placeDestinationId = destinationPlace.candidates[0].place_id

    const directionsResponse = await fetch(
      `http://localhost:3000/directions?originId=${placeSourceId}&destinationId=${placeDestinationId}`,
    )

    const directionsData: IDirectionsResponseData =
      await directionsResponse.json()

    setDirectionsData(directionsData)
    map?.removeAllRoutes()

    await map?.addRouteWithIcons({
      routeId: '1',
      startMarkerOptions: {
        position: directionsData.routes[0].legs[0].start_location,
      },
      endMarkerOptions: {
        position: directionsData.routes[0].legs[0].end_location,
      },
      carMarkerOptions: {
        position: directionsData.routes[0].legs[0].start_location,
      },
    })
  }

  const handleCreateRoute = async () => {
    const startAddress = directionsData!.routes[0].legs[0].start_address
    const destinationAddress = directionsData!.routes[0].legs[0].end_address

    const response = await fetch('http://localhost:3000/routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${startAddress} - ${destinationAddress}`,
        source_id: directionsData!.request.origin.place_id,
        destination_id: directionsData!.request.destination.place_id,
      }),
    })

    const route = await response.json()
    console.log(route)
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
          <button type="submit">Iniciar viagem</button>
        </div>
      </div>
      <div ref={mapContainerRef} className="flex-1 bg-red-50"></div>
    </div>
  )
}
