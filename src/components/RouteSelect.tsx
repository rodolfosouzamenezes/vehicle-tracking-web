'use client'

import { fetcher } from '@/utils/http'
import { Route } from '@/utils/model'
import { NativeSelect, NativeSelectProps } from '@mui/material'
import useSWR from 'swr'

export async function getRoutes(): Promise<Route[]> {
  const response = await fetch('http://localhost:3000/routes')

  return await response.json()
}

export type RouteSelectProps = NativeSelectProps & {
  onChange?: (place_id: string) => void
}

export function RouteSelect({ onChange, ...props }: RouteSelectProps) {
  const { data: routes, isLoading } = useSWR<Route[]>(
    'http://localhost:3001/routes',
    fetcher,
    {
      fallback: [],
    },
  )

  return (
    <NativeSelect
      onChange={(e) => onChange && onChange(e.target.value)}
      {...props}
    >
      {isLoading && <option value="">Carregando rotas...</option>}
      {routes && (
        <>
          <option value="">Selecione uma rota...</option>
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.name}
            </option>
          ))}
        </>
      )}
    </NativeSelect>
  )
}
