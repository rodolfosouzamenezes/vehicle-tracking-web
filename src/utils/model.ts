import type { DirectionsResponseData } from '@googlemaps/google-maps-services-js'

export type Place = { name: string; location: { lat: number; lng: number } }

export type Route = {
  id: string
  name: string
  source: Place
  destination: Place
  distance: number
  duration: number
  directions: DirectionsResponseData & { request: any }
  created_at: Date
  updated_at: Date
}
