'use client'

import type { FindPlaceFromTextResponseData } from '@googlemaps/google-maps-services-js'
import { FormEvent } from 'react'

export default function NewRoutePage() {
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

    const [sourcePlace, destiantionPlace]: FindPlaceFromTextResponseData[] =
      await Promise.all([sourceResponse.json(), destiantionResponse.json()])

    if (sourcePlace.status !== 'OK') {
      console.error(sourcePlace)
      return alert('Não foi possível encontrar a origem')
    }

    if (destiantionPlace.status !== 'OK') {
      console.error(destiantionPlace)
      return alert('Não foi possível encontrar o destino')
    }
  }

  return (
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
  )
}
