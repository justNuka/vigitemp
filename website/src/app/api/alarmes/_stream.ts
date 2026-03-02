type SseClient = {
  send: (event: string, data: unknown) => void
  close: () => void
  canReceive?: (event: string, data: unknown) => boolean
}

const clients = new Set<SseClient>()

export function addAlarmClient(client: SseClient) {
  clients.add(client)
  return () => {
    clients.delete(client)
  }
}

export function broadcastAlarmEvent(event: string, data: unknown) {
  for (const client of clients) {
    try {
      if (client.canReceive && !client.canReceive(event, data)) {
        continue
      }
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

export function getAlarmClientCount() {
  return clients.size
}
