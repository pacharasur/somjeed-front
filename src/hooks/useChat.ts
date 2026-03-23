import { useEffect, useRef, useState } from 'react'
import { sendChatMessage } from '../services/api'
import type { Message } from '../types/chat'

const FOLLOW_UP_MESSAGE = 'Do you need any further assistance?'
const CLOSING_MESSAGE_1 = 'Thanks for chatting with me today.'
const CLOSING_MESSAGE_2 = 'Before you go, could you rate your experience?'
const ERROR_MESSAGE = 'Sorry, something went wrong. Please try again.'
const GREETING_ERROR_MESSAGE = 'Failed to load greeting'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [userId, setUserId] = useState('')

  const firstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const secondTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activityTokenRef = useRef(0)
  const requestTokenRef = useRef(0)
  const closingShownRef = useRef(false)

  const appendMessage = (message: Message) => {
    setMessages((prev) => [...prev, message])
  }

  const sendBotMessage = (text: string) => {
    appendMessage({ sender: 'bot', text })
  }

  const clearInactivityTimers = () => {
    if (firstTimerRef.current) {
      clearTimeout(firstTimerRef.current)
      firstTimerRef.current = null
    }

    if (secondTimerRef.current) {
      clearTimeout(secondTimerRef.current)
      secondTimerRef.current = null
    }
  }

  const sendClosingMessage = (token: number) => {
    if (closingShownRef.current || token !== activityTokenRef.current) {
      return
    }

    closingShownRef.current = true
    sendBotMessage(CLOSING_MESSAGE_1)
    sendBotMessage(CLOSING_MESSAGE_2)
    setShowFeedback(true)
  }

  const resetInactivityTimer = (token: number) => {
    clearInactivityTimers()
    firstTimerRef.current = setTimeout(() => {
      if (token === activityTokenRef.current && !closingShownRef.current) {
        sendBotMessage(FOLLOW_UP_MESSAGE)
      }
    }, 10000)

    secondTimerRef.current = setTimeout(() => {
      if (token === activityTokenRef.current && !closingShownRef.current) {
        sendClosingMessage(token)
      }
    }, 20000)
  }

  const sendMessage = async (message: string, overrideUserId?: string) => {
    const resolvedUserId = overrideUserId || userId
    const trimmedInput = message.trim()

    if (!trimmedInput || !resolvedUserId) {
      return
    }

    const isInitMessage = trimmedInput === 'INIT'
    const requestToken = requestTokenRef.current + 1
    requestTokenRef.current = requestToken

    activityTokenRef.current += 1
    const nextActivityToken = activityTokenRef.current
    closingShownRef.current = false
    setShowFeedback(false)
    clearInactivityTimers()

    if (!isInitMessage) {
      appendMessage({ sender: 'user', text: trimmedInput })
    }

    setLoading(true)

    try {
      const response = await sendChatMessage({
        userId: resolvedUserId,
        message: trimmedInput,
      })

      if (requestToken !== requestTokenRef.current) {
        return
      }

      const botMessages =
        response.messages && response.messages.length > 0
          ? response.messages
          : [response.message || ERROR_MESSAGE]

      botMessages.forEach((botText) => {
        sendBotMessage(botText)
      })
      resetInactivityTimer(nextActivityToken)
    } catch (error) {
      console.error('Chat API error:', error)

      if (requestToken !== requestTokenRef.current) {
        return
      }

      sendBotMessage(isInitMessage ? GREETING_ERROR_MESSAGE : ERROR_MESSAGE)
      resetInactivityTimer(nextActivityToken)
    } finally {
      if (requestToken === requestTokenRef.current) {
        setLoading(false)
      }
    }
  }

  const handleUserChange = async (nextUserId: string) => {
    setUserId(nextUserId)
    setMessages([])
    setShowFeedback(false)
    setLoading(false)

    requestTokenRef.current += 1
    closingShownRef.current = false
    clearInactivityTimers()

    if (!nextUserId) {
      return
    }

    await sendMessage('INIT', nextUserId)
  }

  useEffect(() => {
    return () => {
      clearInactivityTimers()
    }
  }, [])

  return {
    messages,
    loading,
    showFeedback,
    userId,
    sendMessage,
    handleUserChange,
  }
}
