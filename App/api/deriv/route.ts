// App/api/deriv/route.ts

import { NextResponse } from 'next/server'
import { DerivAPI } from '@/utils/deriv-api'

let derivAPI: DerivAPI | null = null

export async function POST(request: Request) {
  const body = await request.json()

  if (body.action === 'connect') {
    try {
      derivAPI = new DerivAPI(body.apiToken)
      await derivAPI.connect()
      const balance = await derivAPI.getBalance()
      return NextResponse.json({ message: 'Connected to Deriv successfully', balance })
    } catch (error) {
      return NextResponse.json({ error: 'Failed to connect to Deriv' }, { status: 400 })
    }
  } else if (body.action === 'trade') {
    if (!derivAPI) {
      return NextResponse.json({ error: 'Deriv API is not connected' }, { status: 400 })
    }
    try {
      const result = await derivAPI.openTrade(body.symbol, body.amount, body.type)
      const balance = await derivAPI.getBalance()
      return NextResponse.json({ message: `Trade opened successfully. Contract ID: ${result.contract_id}`, balance })
    } catch (error) {
      return NextResponse.json({ error: 'Failed to open trade' }, { status: 400 })
    }
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}
