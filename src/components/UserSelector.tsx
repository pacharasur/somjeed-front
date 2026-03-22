type UserSelectorProps = {
  userId: string
  onChange: (value: string) => void
}

const USER_OPTIONS = [
  { value: 'user_001', label: 'user_001 (Overdue)' },
  { value: 'user_002', label: 'user_002 (Payment Today)' },
  { value: 'user_003', label: 'user_003 (Duplicate Transaction)' },
]

function UserSelector({ userId, onChange }: UserSelectorProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="user-selector" className="text-sm font-medium text-slate-700">
        Select user
      </label>
      <select
        id="user-selector"
        value={userId}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">Choose a user</option>
        {USER_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default UserSelector
