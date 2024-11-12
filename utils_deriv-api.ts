import WebSocket from 'ws'

export class DerivAPI {
  private ws: WebSocket | null = null
  private apiToken: string

  constructor(apiToken: string) {
    this.apiToken = apiToken
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089')

      this.ws.onopen = () => {
        this.sendRequest({ authorize: this.apiToken })
          .then(() => resolve())
          .catch(reject)
      }

      this.ws.onerror = (error) => {
        reject(error)
      }
    })
  }

  private sendRequest(request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws) {
        reject(new Error('WebSocket is not connected'))
        return
      }

      this.ws.send(JSON.stringify(request))

      const responseHandler = (event: WebSocket.MessageEvent) => {
        const response = JSON.parse(event.data.toString())
        if (response.error) {
          reject(new Error(response.error.message))
        } else {
          resolve(response)
        }
        this.ws!.removeEventListener('message', responseHandler)
      }

      this.ws.addEventListener('message', responseHandler)
    })
  }

  async getBalance(): Promise<number> {
    const response = await this.sendRequest({ balance: 1, subscribe: 1 })
    return response.balance.balance
  }

  async openTrade(symbol: string, amount: number, contractType: 'CALL' | 'PUT'): Promise<any> {
    const response = await this.sendRequest({
      buy: 1,
      parameters: {
        amount,
        basis: 'stake',
        contract_type: contractType,
        symbol,
        duration: 60,
        duration_unit: 's',
      }
    })
    return response.buy
  }
}