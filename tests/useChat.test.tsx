import { act, renderHook } from '@testing-library/react'
import { sendChatMessage } from '../src/services/api'
import { useChat } from '../src/hooks/useChat'
import { vi } from 'vitest'

vi.mock('../src/services/api', () => ({
  sendChatMessage: vi.fn(),
}))

type ChatResponse = {
  message?: string
  messages?: string[]
  predictionType?: string
  reason?: string
  confidence?: number
}

const mockedSendChatMessage = vi.mocked(sendChatMessage)

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('should send message and append user + bot messages', async () => {
    mockedSendChatMessage.mockResolvedValueOnce({ message: 'Hello from bot' })

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('Hello', 'user_001')
    })

    expect(mockedSendChatMessage).toHaveBeenCalledWith({
      userId: 'user_001',
      message: 'Hello',
    })

    expect(result.current.messages).toEqual([
      { sender: 'user', text: 'Hello' },
      { sender: 'bot', text: 'Hello from bot' },
    ])
  })

  it('should handle loading state correctly', async () => {
    let resolvePromise: (value: ChatResponse) => void = () => undefined

    mockedSendChatMessage.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve
        }),
    )

    const { result } = renderHook(() => useChat())

    act(() => {
      void result.current.sendMessage('Hi', 'user_001')
    })

    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolvePromise({ message: 'Bot reply' })
    })

    expect(result.current.loading).toBe(false)
  })

  it('should handle API error and show fallback message', async () => {
    mockedSendChatMessage.mockRejectedValueOnce(new Error('Network Error'))

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('Need help', 'user_001')
    })

    expect(result.current.messages).toEqual([
      { sender: 'user', text: 'Need help' },
      { sender: 'bot', text: 'Sorry, something went wrong. Please try again.' },
    ])
  })

  it('should not send message if input is empty', async () => {
    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('   ', 'user_001')
    })

    expect(mockedSendChatMessage).not.toHaveBeenCalled()
    expect(result.current.messages).toEqual([])
  })

  it('should reset inactivity timers when user sends message', async () => {
    vi.useFakeTimers()
    mockedSendChatMessage.mockResolvedValue({ message: 'Bot reply' })

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('First message', 'user_001')
    })

    act(() => {
      vi.advanceTimersByTime(9000)
    })

    await act(async () => {
      await result.current.sendMessage('Second message', 'user_001')
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    const earlyFollowUps = result.current.messages.filter(
      (msg) => msg.text === 'Do you need any further assistance?',
    )
    expect(earlyFollowUps).toHaveLength(0)

    act(() => {
      vi.advanceTimersByTime(9000)
    })

    const followUps = result.current.messages.filter(
      (msg) => msg.text === 'Do you need any further assistance?',
    )
    expect(followUps).toHaveLength(1)
  })

  it('should trigger inactivity message after timeout', async () => {
    vi.useFakeTimers()
    mockedSendChatMessage.mockResolvedValueOnce({ message: 'Bot reply' })

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('Hello', 'user_001')
    })

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(result.current.messages).toContainEqual({
      sender: 'bot',
      text: 'Do you need any further assistance?',
    })
  })

  it('should handle multiple messages from API', async () => {
    mockedSendChatMessage.mockResolvedValueOnce({
      messages: ['A', 'B'],
    })

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('Hello', 'user_001')
    })

    expect(result.current.messages).toEqual([
      { sender: 'user', text: 'Hello' },
      { sender: 'bot', text: 'A' },
      { sender: 'bot', text: 'B' },
    ])
  })

  it('should handle empty API response gracefully', async () => {
    mockedSendChatMessage.mockResolvedValueOnce({})

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('Hello', 'user_001')
    })

    expect(result.current.messages).toContainEqual({
      sender: 'bot',
      text: expect.any(String),
    })
  })

  it('should not send message if userId is missing', async () => {
    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('Hello', '')
    })

    expect(mockedSendChatMessage).not.toHaveBeenCalled()
  })

  it('should not add duplicate inactivity message', async () => {
    vi.useFakeTimers()
    mockedSendChatMessage.mockResolvedValue({ message: 'Bot reply' })

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('Hello', 'user_001')
    })

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    const followUps = result.current.messages.filter(
      (m) => m.text === 'Do you need any further assistance?',
    )

    expect(followUps).toHaveLength(1)
  })

  it('should reset state and send INIT when user changes', async () => {
    mockedSendChatMessage.mockResolvedValueOnce({ message: 'Hello' })

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.handleUserChange('user_001')
    })

    expect(result.current.messages).toEqual([
      { sender: 'bot', text: 'Hello' },
    ])
  })

  it('should reset state but not send INIT if userId is empty', async () => {
    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.handleUserChange('')
    })

    expect(mockedSendChatMessage).not.toHaveBeenCalled()
    expect(result.current.messages).toEqual([])
  })
  
})
