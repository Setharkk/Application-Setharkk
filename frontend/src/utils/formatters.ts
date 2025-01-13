import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

export function formatDate(date: Date): string {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (isSameDay(date, now)) {
    return format(date, 'HH:mm', { locale: fr })
  } else if (isSameDay(date, yesterday)) {
    return 'Hier'
  } else if (isSameYear(date, now)) {
    return format(date, 'd MMM', { locale: fr })
  } else {
    return format(date, 'd MMM yyyy', { locale: fr })
  }
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm', { locale: fr })
}

export async function formatMessage(content: string): Promise<string> {
  // Utiliser marked.parse de manière asynchrone
  const markdown = await marked.parse(content, { async: true })
  return DOMPurify.sanitize(markdown)
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

function isSameYear(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear()
} 