import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)

  const placeSourceId = url.searchParams.get('originId')
  const placeDestinationId = url.searchParams.get('destinationId')

  const response = await fetch(
    `http://host.docker.internal:3001/directions?originId=${placeSourceId}&destinationId=${placeDestinationId}`,
    {
      next: {
        revalidate: 60,
      },
    },
  )

  return NextResponse.json(await response.json())
}
