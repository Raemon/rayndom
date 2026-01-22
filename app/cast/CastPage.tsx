import fs from 'fs'
import path from 'path'
import { marked } from 'marked'
import styles from './CastPage.module.css'

const CastPage = () => {
  const mdPath = path.join(process.cwd(), 'app', 'cast', 'CAST.md')
  const markdown = fs.readFileSync(mdPath, 'utf8')
  const html = marked.parse(markdown)

  return (
    <div className={styles.cast}>
      <div className={styles.castContent} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

export default CastPage
