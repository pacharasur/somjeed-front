import { useEffect, useState } from 'react'
import { submitFeedback } from '../services/api'

type FeedbackProps = {
  userId: string
  visible: boolean
}

function Feedback({ userId, visible }: FeedbackProps) {
  const [submitting, setSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (visible) {
      setStatusMessage('')
      setSelectedRating(null)
      setSubmitted(false)
    }
  }, [visible])

  const handleRate = async (rating: number) => {
    if (!userId || submitted || submitting) {
      return
    }

    setSelectedRating(rating)
    setSubmitting(true)
    setStatusMessage('')

    try {
      await submitFeedback(userId, rating)
      setSubmitted(true)
      setStatusMessage('Thank you for your feedback!')
    } catch (error) {
      console.error('Feedback API error:', error)
      setStatusMessage('Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      {visible && (
        <>
          <p className="mb-2 text-sm font-medium text-slate-700">Rate this chat:</p>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => void handleRate(rating)}
                disabled={submitting || submitted || !userId}
                className={`rounded-md border px-3 py-1 text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  selectedRating === rating
                    ? 'border-blue-600 bg-blue-100 text-blue-700'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </>
      )}
      {statusMessage && (
        <p className="text-sm text-slate-700">{statusMessage}</p>
      )}
    </section>
  )
}

export default Feedback
