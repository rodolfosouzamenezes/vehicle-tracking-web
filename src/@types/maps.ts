import type { DirectionsResponseData } from '@googlemaps/google-maps-services-js'

export interface IDirectionsResponseData extends DirectionsResponseData {
  request: any
}
