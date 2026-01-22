"use client"
import { useRouter } from 'next/navigation'
import styles from './CatEolResearchPage.module.css'

const CloseButton = () => {
  const router = useRouter()
  return (
    <button className={styles.closeButton} onClick={() => router.push('/cat-eol-research')}>×</button>
  )
}

export default CloseButton
