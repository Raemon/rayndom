'use client'
import { Node, mergeAttributes, type Editor } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { getTagColor } from '../tags/tagUtils'
import type { TagInstance } from '../types'

export type TagInstanceCallbacks = {
  datetime?: string,
  onCreateTagInstance?: (args: { tagId: number, datetime: string }) => Promise<TagInstance>,
  onDeleteTagInstance?: (args: { id: number }) => Promise<void> | void,
}

type EditorTagInstanceState = {
  callbacks: TagInstanceCallbacks,
  trackedIds: Set<number>,
}

// WeakMap to store per-editor state without modifying the editor object
const editorStateMap = new WeakMap<Editor, EditorTagInstanceState>()

export const getEditorTagInstanceState = (editor: Editor): EditorTagInstanceState => {
  let state = editorStateMap.get(editor)
  if (!state) {
    state = { callbacks: {}, trackedIds: new Set() }
    editorStateMap.set(editor, state)
  }
  return state
}

export const setEditorCallbacks = (editor: Editor, callbacks: TagInstanceCallbacks) => {
  const state = getEditorTagInstanceState(editor)
  state.callbacks = callbacks
}

const TagInstanceNodeView = ({ node, deleteNode }: NodeViewProps) => {
  const label = node.attrs.label as string || ''
  const bgColor = getTagColor(label)
  return (
    <NodeViewWrapper as="span" className="tag-instance-wrapper" style={{ display: 'inline' }}>
      <span
        className="inline-flex items-center px-1 text-xs text-white"
        style={{ backgroundColor: bgColor }}
        contentEditable={false}
      >
        {label}
        <button
          className="ml-1 opacity-50 cursor-pointer hover:opacity-100 text-white/60 hover:text-white bg-transparent"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteNode() }}
          contentEditable={false}
        >×</button>
      </span>
    </NodeViewWrapper>
  )
}

export const TagInstanceExtension = Node.create({
  name: 'tagInstance',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes() {
    return {
      id: { default: null },
      label: { default: null },
      tagInstanceId: { default: null },
    }
  },
  parseHTML() {
    return [{ tag: 'span[data-tag-instance]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ 'data-tag-instance': '' }, HTMLAttributes), `@${HTMLAttributes.label || ''}`]
  },
  addNodeView() {
    return ReactNodeViewRenderer(TagInstanceNodeView)
  },
})
