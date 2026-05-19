import { Extension, mergeAttributes } from '@tiptap/core'
import Heading from '@tiptap/extension-heading'

const LEVEL_CLASSES: Record<number, string> = { 1: 'heading', 2: 'smallHeading' }

export const ClassedHeading = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const level = node.attrs.level as number
    const cls = LEVEL_CLASSES[level]
    const attrs = cls
      ? mergeAttributes(HTMLAttributes, { class: [HTMLAttributes.class, cls].filter(Boolean).join(' ') })
      : HTMLAttributes
    return [`h${level}`, attrs, 0]
  },
})

export const HeadingShortcuts = Extension.create({
  name: 'headingShortcuts',
  addKeyboardShortcuts() {
    return {
      'Mod-0': () => this.editor.commands.setParagraph(),
      'Mod-1': () => this.editor.commands.toggleHeading({ level: 1 }),
      'Mod-2': () => this.editor.commands.toggleHeading({ level: 2 }),
    }
  },
})
