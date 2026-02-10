'use client'

const NotesTaskCheckbox = ({ checked, text, onToggle, strikeWhenChecked=true, className='', onClick }:{ checked: boolean, text: string, onToggle: () => void, strikeWhenChecked?: boolean, className?: string, onClick?: () => void }) => {
  return (
    <label className={`truncate flex items-center gap-1 cursor-pointer ${className}`} onClick={(e) => { e.stopPropagation(); onClick?.() }}>
      <input type="checkbox" checked={checked} className="cursor-pointer" onChange={onToggle} />
      <span className={checked && strikeWhenChecked ? 'line-through text-gray-300' : ''}>{text}</span>
    </label>
  )
}

export default NotesTaskCheckbox
