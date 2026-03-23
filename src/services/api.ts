const API_BASE_URL = 'http://localhost:8080'

export type ChatRequest = {
  userId: string
  message: string
}

export type ChatApiResponse = {
  message?: string
  messages?: string[]
  predictionType?: string
  reason?: string
  confidence?: number
}

export type FeedbackApiResponse = {
  message?: string
  reply?: string
}

export async function sendChatMessage(
  payload: ChatRequest,
): Promise<ChatApiResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to send chat message')
  }

  return (await response.json()) as ChatApiResponse
}

export async function submitFeedback(
  userId: string,
  rating: number,
): Promise<FeedbackApiResponse> {
  const response = await fetch(`${API_BASE_URL}/api/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      rating,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to submit feedback')
  }

  return (await response.json()) as FeedbackApiResponse
}
