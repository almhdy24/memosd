import { useEffect, useRef, useState } from 'react'

export function useWebSocket(url, userId, onMessage) {
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const connect = () => {
    if (!userId) return
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
      reconnectAttemptsRef.current = 0
      ws.send(JSON.stringify({ type: 'auth', userId }))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (e) {
        console.error('WebSocket parse error:', e)
      }
    }

    ws.onerror = (err) => {
      console.error('WebSocket error:', err)
    }

    ws.onclose = () => {
      console.log('WebSocket closed')
      setIsConnected(false)
      wsRef.current = null

      // Reconnect with exponential backoff
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000)
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++
          connect()
        }, delay)
      }
    }
  }

  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [url, userId])

  const send = (data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
      return true
    }
    return false
  }

  return { isConnected, send }
}
