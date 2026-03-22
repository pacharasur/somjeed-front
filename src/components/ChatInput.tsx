import type { FormEvent } from 'react'

type ChatInputProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => Promise<void>
  disabled: boolean
}

function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (disabled) {
      return
    }

    await onSend()
  }

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type a message"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Send
      </button>
    </form>
  )
}

export default ChatInput
