import { useEffect, useRef } from 'react'
import type { Message } from '../types/chat'
import MessageBubble from './MessageBubble'

type ChatWindowProps = {
  messages: Message[]
  loading: boolean
}

function ChatWindow({ messages, loading }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="h-[420px] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
      <ul className="flex flex-col gap-3">
        {messages.map((message, index) => (
          <MessageBubble
            key={`${message.sender}-${index}-${message.text}`}
            message={message}
          />
        ))}
        {loading && (
          <li className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm bg-slate-200 px-3 py-2 text-sm text-slate-700">
            Somjeed is typing...
          </li>
        )}
      </ul>
      <div ref={messagesEndRef} />
    </div>
  )
}

export default ChatWindow
