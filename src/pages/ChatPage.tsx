import { useState } from 'react'
import ChatWindow from '../components/ChatWindow'
import Feedback from '../components/Feedback'
import UserSelector from '../components/UserSelector'
import { useChat } from '../hooks/useChat'

function ChatPage() {
  const { messages, loading, showFeedback, userId, sendMessage, handleUserChange } =
    useChat()
  const [input, setInput] = useState('')

  const canSend = input.trim().length > 0 && !loading
  const canSelectUser = userId.length > 0

  const handleSend = async () => {
    await sendMessage(input)
    setInput('')
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
