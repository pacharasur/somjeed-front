import type { Message } from '../types/chat'

type MessageItemProps = {
  message: Message
}

function MessageItem({ message }: MessageItemProps) {
  const isUser = message.sender === 'user'

  return (
    <li
      className={`w-fit max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
        isUser
          ? 'ml-auto rounded-br-sm bg-blue-600 text-white'
          : 'rounded-bl-sm bg-slate-200 text-slate-900'
      }`}
    >
      <p className="mb-1 text-xs font-semibold opacity-80">
        {isUser ? 'You' : 'Somjeed'}
      </p>
      <p>{message.text}</p>
    </li>
  )
}

export default MessageItem
