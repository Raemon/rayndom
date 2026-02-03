'use client'
import { useAiTags } from '../hooks/useAiTags'

type RunAiCommandButtonProps = {
  datetime: string
  onComplete?: () => void
}

const RunAiCommandButton = ({ datetime, onComplete }:RunAiCommandButtonProps) => {
  const { isPredicting, predictTags } = useAiTags()

  const handleClick = async () => {
    await predictTags({ datetime })
    onComplete?.()
  }

  return (
    <button onClick={handleClick} disabled={isPredicting} className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50">
      {isPredicting ? 'Running...' : 'Run AI'}
    </button>
  )
}

export default RunAiCommandButton
