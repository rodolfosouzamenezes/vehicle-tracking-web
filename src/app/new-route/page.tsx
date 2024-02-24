'use client'

import { IDirectionsResponseData } from '@/@types/maps'
import { useMap } from '@/hooks/useMap'
import type { FindPlaceFromTextResponseData } from '@googlemaps/google-maps-services-js'
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import { FormEvent, useRef, useState } from 'react'

export default function NewRoutePage() {
  const [open, setOpen] = useState(false)

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const map = useMap(mapContainerRef)
  const [directionsData, setDirectionsData] =
    useState<IDirectionsResponseData>()

  const handleSearchPlaces = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const sourceText = (document.getElementById('source') as HTMLInputElement)
      .value
    const destiantionText = (
      document.getElementById('destination') as HTMLInputElement
    ).value

    const [sourceResponse, destiantionResponse] = await Promise.all([
      fetch(`http://localhost:3001/places?text=${sourceText}`),
      fetch(`http://localhost:3001/places?text=${destiantionText}`),
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
      `http://localhost:3001/directions?originId=${placeSourceId}&destinationId=${placeDestinationId}`,
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

    const response = await fetch('http://localhost:3001/routes', {
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
    route && setOpen(true)
  }

  return (
    <Grid2 container sx={{ display: 'flex', flex: 1 }}>
      <Grid2
        xs={4}
        p={4}
        alignItems="center"
        gap={4}
        display="flex"
        flexDirection="column"
      >
        <Typography variant="h4" textTransform="uppercase">
          Nova Rota
        </Typography>
        <form onSubmit={handleSearchPlaces}>
          <TextField
            id="source"
            label="Origem"
            fullWidth
            sx={{ marginBottom: 2 }}
          />

          <TextField
            id="destination"
            label="Destino"
            fullWidth
            sx={{ marginBottom: 2 }}
          />
          <Button variant="contained" fullWidth>
            Pesquisar
          </Button>
        </form>
        {directionsData && (
          <Card sx={{ mt: 1, width: '100%' }}>
            <CardContent>
              <List>
                <ListItem>
                  <ListItemText
                    primary={'Origem'}
                    secondary={
                      directionsData?.routes[0]!.legs[0]!.start_address
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={'Destino'}
                    secondary={directionsData?.routes[0]!.legs[0]!.end_address}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={'Distância'}
                    secondary={
                      directionsData?.routes[0]!.legs[0]!.distance.text
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={'Duração'}
                    secondary={
                      directionsData?.routes[0]!.legs[0]!.duration.text
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
            <CardActions
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                px: 4,
                pb: 4,
              }}
            >
              <Button
                type="button"
                variant="contained"
                onClick={handleCreateRoute}
                fullWidth
              >
                Adicionar rota
              </Button>
            </CardActions>
          </Card>
        )}
      </Grid2>
      <Grid2 ref={mapContainerRef} xs={8}></Grid2>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
      >
        <Alert onClose={() => setOpen(false)} severity="success">
          Rota cadastrada com sucesso
        </Alert>
      </Snackbar>
    </Grid2>
  )
}
