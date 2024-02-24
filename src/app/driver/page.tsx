'use client'

import { RouteSelect } from '@/components/RouteSelect'
import { useMap } from '@/hooks/useMap'
import { Route } from '@/utils/model'
import { sleep } from '@/utils/sleep'
import { socket } from '@/utils/socket-io'
import { Alert, Button, Snackbar, Typography } from '@mui/material'
import Grid2 from '@mui/material/Unstable_Grid2/Grid2'
import { useEffect, useRef, useState } from 'react'

export default function DriverPage() {
  const [open, setOpen] = useState(false)

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const map = useMap(mapContainerRef)

  useEffect(() => {
    socket.connect()

    return () => {
      socket.disconnect()
    }
  }, [])

  const handleStartRoute = async () => {
    const routeId = (document.getElementById('route') as HTMLSelectElement)
      .value
    const response = await fetch(`http://localhost:3001/api/routes/${routeId}`)
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
      socket.emit('new-points', {
        route_id: routeId,
        lat: step.start_location.lat,
        lng: step.start_location.lng,
      })

      await sleep(2000)
      map?.moveCar(routeId, step.end_location)
      socket.emit('new-points', {
        route_id: routeId,
        lat: step.end_location.lat,
        lng: step.end_location.lng,
      })
    }
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
          Minha Viagem
        </Typography>
        <div className="flex flex-col space-y-4">
          <RouteSelect id="route" />
          <Button variant="contained" onClick={handleStartRoute}>
            Iniciar viagem
          </Button>
        </div>
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
