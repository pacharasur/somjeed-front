import { useEffect, useRef, useState } from 'react'
import { sendChatMessage } from '../services/api'
import type { Message } from '../types/chat'

const ERROR_MESSAGE = 'Sorry, I could not get a response right now.'
const INACTIVITY_MESSAGE_1 = 'Do you need any further assistance?'
const CLOSING_MESSAGE_1 = 'Thanks for chatting with me today.'
const CLOSING_MESSAGE_2 =
  'Before you go, could you rate your experience?'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const hasInitializedRef = useRef(false)
  const userActivityIdRef = useRef(0)
  const timerOneRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerTwoRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasClosingMessageRef = useRef(false)

  const addMessages = (sender: Message['sender'], texts: string[]) => {
    const newMessages = texts
      .map((text) => text.trim())
      .filter((text) => text.length > 0)
      .map((text) => ({ sender, text }))

    if (newMessages.length === 0) {
      return
    }

    setMessages((previousMessages) => [...previousMessages, ...newMessages])
  }

  const sendBotMessage = (message: string) => {
    addMessages('bot', [message])
  }

  const clearInactivityTimers = () => {
    if (timerOneRef.current) {
      clearTimeout(timerOneRef.current)
      timerOneRef.current = null
    }

    if (timerTwoRef.current) {
      clearTimeout(timerTwoRef.current)
      timerTwoRef.current = null
    }
  }

  const sendClosingMessage = () => {
    if (hasClosingMessageRef.current) {
      return
    }

    hasClosingMessageRef.current = true
    sendBotMessage(CLOSING_MESSAGE_1)
    sendBotMessage(CLOSING_MESSAGE_2)
    setShowFeedback(true)
  }

  const resetInactivityTimer = (activityId: number) => {
    clearInactivityTimers()

    timerOneRef.current = setTimeout(() => {
      if (userActivityIdRef.current === activityId && !hasClosingMessageRef.current) {
        sendBotMessage(INACTIVITY_MESSAGE_1)
      }
    }, 10000)

    timerTwoRef.current = setTimeout(() => {
      if (userActivityIdRef.current === activityId && !hasClosingMessageRef.current) {
        sendClosingMessage()
      }
    }, 10000)
  }

  useEffect(() => {
    if (hasInitializedRef.current) {
      return
    }
    hasInitializedRef.current = true

    const loadInitialGreeting = async () => {
      setLoading(true)

      try {
        const data = await sendChatMessage({
          userId: 'user_001',
          message: 'hello',
        })
        addMessages('bot', [data.message || ERROR_MESSAGE])
      } catch (error) {
        console.error('Initial greeting error:', error)
        addMessages('bot', ['Sorry, I could not load the greeting right now.'])
      } finally {
        setLoading(false)
      }
    }

    void loadInitialGreeting()

    return () => {
      clearInactivityTimers()
    }
  }, [])

  const sendMessage = async (message: string) => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || loading) {
      return
    }

    userActivityIdRef.current += 1
    hasClosingMessageRef.current = false
    setShowFeedback(false)
    clearInactivityTimers()
    addMessages('user', [trimmedMessage])
    setLoading(true)

    try {
      const data = await sendChatMessage({
        userId: 'user_001',
        message: trimmedMessage,
      })
      addMessages('bot', [data.message || ERROR_MESSAGE])
      resetInactivityTimer(userActivityIdRef.current)
    } catch (error) {
      console.error('Chat API error:', error)
      addMessages('bot', [ERROR_MESSAGE])
      resetInactivityTimer(userActivityIdRef.current)
    } finally {
      setLoading(false)
    }
  }

  const hideFeedback = () => {
    setShowFeedback(false)
  }

  return {
    messages,
    loading,
    sendMessage,
    showFeedback,
    hideFeedback,
  }
}
