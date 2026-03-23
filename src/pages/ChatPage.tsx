import { useEffect, useRef, useState } from 'react'
import ChatWindow from '../components/ChatWindow'
import Feedback from '../components/Feedback'
import UserSelector from '../components/UserSelector'
import { sendChatMessage } from '../services/api'
import type { Message } from '../types/chat'

const FOLLOW_UP_MESSAGE = 'Do you need any further assistance?'
const CLOSING_MESSAGE_1 = 'Thanks for chatting with me today.'
const CLOSING_MESSAGE_2 = 'Before you go, could you rate your experience?'
const ERROR_MESSAGE = 'Sorry, something went wrong. Please try again.'

type InactivityTimerState = {
  first: number | null
  second: number | null
}

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [inactivityTimer, setInactivityTimer] = useState<InactivityTimerState>({
    first: null,
    second: null,
  })
  const activityTokenRef = useRef(0)
  const closingShownRef = useRef(false)
  const requestTokenRef = useRef(0)

  const canSend = input.trim().length > 0 && !loading
  const canSelectUser = userId.length > 0

  const appendMessage = (message: Message) => {
    setMessages((prev) => [...prev, message])
  }

  const sendBotMessage = (message: string) => {
    appendMessage({ sender: 'bot', text: message })
  }

  const clearInactivityTimer = () => {
    if (inactivityTimer.first) {
      window.clearTimeout(inactivityTimer.first)
    }
    if (inactivityTimer.second) {
      window.clearTimeout(inactivityTimer.second)
    }
    setInactivityTimer({ first: null, second: null })
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
    clearInactivityTimer()

    const first = window.setTimeout(() => {
      if (token === activityTokenRef.current && !closingShownRef.current) {
        sendBotMessage(FOLLOW_UP_MESSAGE)
      }
    }, 10000)

    const second = window.setTimeout(() => {
      if (token === activityTokenRef.current && !closingShownRef.current) {
        sendClosingMessage(token)
      }
    }, 20000)

    setInactivityTimer({ first, second })
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
    const nextToken = activityTokenRef.current
    closingShownRef.current = false
    setShowFeedback(false)
    clearInactivityTimer()

    if (!isInitMessage) {
      appendMessage({ sender: 'user', text: trimmedInput })
      setInput('')
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
        appendMessage({
          sender: 'bot',
          text: botText
        })
      })

      resetInactivityTimer(nextToken)
    } catch (error) {
      console.error('Chat API error:', error)
      if (requestToken !== requestTokenRef.current) {
        return
      }

      sendBotMessage(isInitMessage ? 'Failed to load greeting' : ERROR_MESSAGE)
      resetInactivityTimer(nextToken)
    } finally {
      if (requestToken === requestTokenRef.current) {
        setLoading(false)
      }
    }
  }

  const handleUserChange = async (nextUserId: string) => {
    setUserId(nextUserId)
    setInput('')
    setMessages([])
    setShowFeedback(false)
    closingShownRef.current = false
    clearInactivityTimer()

    if (!nextUserId) {
      return
    }

    await sendMessage('INIT', nextUserId)
  }

  useEffect(() => {
    return () => {
      if (inactivityTimer.first) {
        window.clearTimeout(inactivityTimer.first)
      }
      if (inactivityTimer.second) {
        window.clearTimeout(inactivityTimer.second)
      }
    }
  }, [inactivityTimer])

  const handleSend = async () => {
    await sendMessage(input)
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Somjeed Chatbot</h1>
        <UserSelector userId={userId} onChange={(value) => void handleUserChange(value)} />
        <ChatWindow messages={messages} loading={loading} />
        <form
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
          onSubmit={(event) => {
            event.preventDefault()
            void handleSend()
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type a message"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            disabled={!canSend || !canSelectUser}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Send
          </button>
        </form>
        <Feedback
          userId={userId}
          visible={showFeedback}
        />
      </section>
    </main>
  )
}

export default ChatPage
