type WebPushPayload = {
  title: string;
  body: string;
  tag?: string;
  data?: Record<string, unknown>;
};

/**
 * Web push supprimé : tout passe désormais par les notifications Windows (agent).
 */
export async function sendWebPushToActiveSubscriptions(_payload: WebPushPayload) {
  return { sent: 0, failed: 0, archived: 0 };
}

