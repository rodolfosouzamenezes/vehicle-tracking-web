'use client'

import { useMap } from '@/hooks/useMap'
import type {
  DirectionsResponseData,
  FindPlaceFromTextResponseData,
} from '@googlemaps/google-maps-services-js'
import { FormEvent, useRef } from 'react'

export default function NewRoutePage() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const map = useMap(mapContainerRef)

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

    const directionsData: DirectionsResponseData & { request: any } =
      await directionsResponse.json()

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

  return (
    <div className="flex flex-row h-full w-full">
      <div>
        <h1>Nova Rota</h1>
        <form onSubmit={handleSearchPlaces} className="flex flex-col">
          <div>
            <input id="source" type="text" placeholder="Origem..." />
          </div>
          <div>
            <input id="destination" type="text" placeholder="Destino..." />
          </div>
          <button type="submit">Pesquisar</button>
        </form>
      </div>
      <div ref={mapContainerRef} className="flex-1 bg-red-50"></div>
    </div>
  )
}
