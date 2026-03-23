import type { Message } from '../types/chat'

type MessageBubbleProps = {
  message: Message
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user'
  return (
    <li
      className={`w-fit max-w-[90%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
        isUser
          ? 'ml-auto rounded-br-sm bg-blue-600 text-white'
          : 'rounded-bl-sm bg-slate-200 text-slate-900'
      }`}
    >
      <p className="mb-1 text-xs font-semibold opacity-80">
        {isUser ? 'You' : 'Somjeed'}
      </p>
      <p className="whitespace-pre-wrap">{message.text}</p>
    </li>
  )
}

export default MessageBubble
