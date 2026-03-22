export type MessageMeta = {
  predictionType?: string
  reason?: string
  confidence?: number
}

export type Message = {
  sender: 'user' | 'bot'
  text: string
  meta?: MessageMeta
}
