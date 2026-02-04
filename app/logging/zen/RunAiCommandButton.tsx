'use client'
import { useAiTags } from '../hooks/useAiTags'

type RunAiCommandButtonProps = {
  datetime: string
  onComplete?: () => void
}

const RunAiCommandButton = ({ datetime, onComplete }:RunAiCommandButtonProps) => {
  const { isPredicting, predictTags, error } = useAiTags()

  const handleClick = async () => {
    await predictTags({ datetime })
    onComplete?.()
  }

  return (
    <div>
      <button onClick={handleClick} disabled={isPredicting} className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50">
        {isPredicting ? 'Running...' : 'Run AI'}
      </button>
      {error && <div className="mt-2 text-xs text-red-500">Error: {error}</div>}
    </div>
  )
}

export default RunAiCommandButton
