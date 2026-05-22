import type { ReactNode } from 'react'
import TagListItem from '../tags/TagListItem'
import type { TagCount } from './useCollapsedTagCounts'

// A collapsed section's summary row: the collapse toggle + notes (`header`) shown alongside the
// section's per-category tag columns. In zen (the narrow panel) it stacks vertically with the tag
// columns in their own row beneath the header; otherwise the header takes a fixed 40% and the
// columns sit beside it.
const CollapsedSummary = ({ zen, header, tagTypes, tagCountsByType }: {
  zen?: boolean,
  header: ReactNode,
  tagTypes: string[],
  tagCountsByType: Record<string, TagCount[]>,
}) => {
  const columns = tagTypes.map(type => (
    <div key={type} className="flex-1 flex flex-wrap gap-x-2 gap-y-1 overflow-hidden">
      {tagCountsByType[type]?.map(({ tag, count, usefulCount, antiUsefulCount }) => (
        <TagListItem key={tag.id} tag={tag} instanceCount={count} usefulCount={usefulCount} antiUsefulCount={antiUsefulCount} readonly hideRelations />
      ))}
    </div>
  ))
  return (
    <div className={zen ? 'flex flex-col gap-4 py-4' : 'flex gap-4 items-start py-4'}>
      <div className="shrink-0" style={zen ? undefined : { width: '40%' }}>
        {header}
      </div>
      {zen ? <div className="flex gap-4 items-start">{columns}</div> : columns}
    </div>
  )
}

export default CollapsedSummary
