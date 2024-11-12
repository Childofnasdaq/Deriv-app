// App/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function DerivTrader() {
  const [isConnected, setIsConnected] = useState(false)
  const [apiToken, setApiToken] = useState('')
  const [symbol, setSymbol] = useState('R_100')
  const [amount, setAmount] = useState(10)
  const [logs, setLogs] = useState<string[]>([])
  const [isTrading, setIsTrading] = useState(false)
  const [balance, setBalance] = useState(0)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      addLog('Connecting to Deriv...')
      const response = await fetch('/api/deriv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect', apiToken })
      })
      if (!response.ok) throw new Error('Failed to connect to Deriv')
      const data = await response.json()
      setIsConnected(true)
      setBalance(data.balance)
      addLog(`Connected to Deriv. Balance: $${data.balance}`)
    } catch (error) {
      addLog(`Connection failed: ${error.message}`)
    }
  }

  const handleTrade = async () => {
    if (!isConnected) {
      addLog('Not connected to Deriv. Please connect first.')
      return
    }
    setIsTrading(true)
    addLog('Starting automated trading...')
  }

  const stopTrading = () => {
    setIsTrading(false)
    addLog('Automated trading stopped.')
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTrading) {
      interval = setInterval(async () => {
        try {
          const tradeType = Math.random() > 0.5 ? 'CALL' : 'PUT'
          addLog(`Attempting to open ${tradeType} trade for ${symbol}...`)
          const response = await fetch('/api/deriv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'trade', symbol, amount, type: tradeType })
          })
          if (!response.ok) throw new Error('Failed to open trade')
          const result = await response.json()
          addLog(`Trade opened: ${result.message}`)
          setBalance(result.balance)
        } catch (error) {
          addLog(`Trade failed: ${error.message}`)
        }
      }, 60000) // Try to open a trade every minute
    }
    return () => clearInterval(interval)
  }, [isTrading, symbol, amount])

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Deriv Trader</CardTitle>
          <CardDescription>Connect to your Deriv account and start automated trading</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Automated trading carries significant risks. Use at your own risk and always monitor your trades.
            </AlertDescription>
          </Alert>
          {!isConnected ? (
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiToken">API Token</Label>
                <Input id="apiToken" type="password" value={apiToken} onChange={(e) => setApiToken(e.target.value)} required />
              </div>
              <Button type="submit">Connect to Deriv</Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p>Connected to Deriv. Balance: ${balance}</p>
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input id="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Trade Amount ($)</Label>
                <Input id="amount" type="number" step="1" min="1" value={amount} onChange={(e) => setAmount(parseInt(e.target.value))} />
              </div>
              <Button onClick={isTrading ? stopTrading : handleTrade}>
                {isTrading ? 'Stop Trading' : 'Start Automated Trading'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Trading Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-y-auto bg-gray-100 p-2 rounded">
            {logs.map((log, index) => (
              <p key={index} className="text-sm">{log}</p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
