import type { Message } from '../types/chat'

type MessageBubbleProps = {
  message: Message
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user'
  const confidenceText =
    typeof message.meta?.confidence === 'number'
      ? `${Math.round(message.meta.confidence * 100)}%`
      : null

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

      {!isUser && message.meta?.predictionType && (
        <div className="mt-2 rounded-md border border-slate-300 bg-white/70 p-2 text-xs text-slate-700">
          <p className="font-semibold">
            [Prediction: {message.meta.predictionType}]
          </p>
          {message.meta.reason && <p>Reason: {message.meta.reason}</p>}
          {confidenceText && <p>Confidence: {confidenceText}</p>}
        </div>
      )}
    </li>
  )
}

export default MessageBubble
