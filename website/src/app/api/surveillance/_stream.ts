type SseClient = {
  send: (event: string, data: unknown) => void
  close: () => void
}

const clients = new Set<SseClient>()

export function addSurveillanceClient(client: SseClient) {
  clients.add(client)
  return () => {
    clients.delete(client)
  }
}

export function broadcastSurveillanceEvent(event: string, data: unknown) {
  for (const client of clients) {
    try {
      client.send(event, data)
    } catch {
      try {
        client.close()
      } catch {
        // ignore
      }
      clients.delete(client)
    }
  }
}

export function getSurveillanceClientCount() {
  return clients.size
}

