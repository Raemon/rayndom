import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

const getRequiredEnv = (key: string) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing ${key}`)
  }
  return value
}

const getGmailClient = () => {
  const clientId = getRequiredEnv('GMAIL_CLIENT_ID')
  const clientSecret = getRequiredEnv('GMAIL_CLIENT_SECRET')
  const redirectUri = getRequiredEnv('GMAIL_REDIRECT_URI')
  const refreshToken = getRequiredEnv('GMAIL_REFRESH_TOKEN')
  const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  auth.setCredentials({ refresh_token: refreshToken })
  return google.gmail({ version: 'v1', auth })
}

const getHeader = (headers: { name?: string | null, value?: string | null }[], name: string) => {
  const header = headers.find((item) => item.name?.toLowerCase() === name.toLowerCase())
  return header?.value || ''
}

export async function GET(request: NextRequest) {
  try {
    const gmail = getGmailClient()
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q') || 'in:inbox'
    const maxResultsParam = searchParams.get('maxResults')
    const maxResults = maxResultsParam ? Number(maxResultsParam) : 20
    const listResponse = await gmail.users.messages.list({ userId: 'me', q, maxResults })
    const messageIds = (listResponse.data.messages || [])
      .map((message) => message.id)
      .filter((messageId): messageId is string => Boolean(messageId))
    const messageResponses = await Promise.all(messageIds.map((messageId) => gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'metadata',
      metadataHeaders: ['From', 'Subject', 'Date']
    })))
    const messages = messageResponses.map((response) => {
      const headers = response.data.payload?.headers || []
      return {
        id: response.data.id,
        threadId: response.data.threadId,
        snippet: response.data.snippet || '',
        internalDate: response.data.internalDate,
        from: getHeader(headers, 'From'),
        subject: getHeader(headers, 'Subject'),
        date: getHeader(headers, 'Date')
      }
    })
    return NextResponse.json({ messages })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const gmail = getGmailClient()
    const body = await request.json()
    const messageIds = Array.isArray(body.messageIds) ? body.messageIds : []
    if (!messageIds.length) {
      return NextResponse.json({ error: 'messageIds is required' }, { status: 400 })
    }
    const results = await Promise.all(messageIds.map((messageId: string) => gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: { removeLabelIds: ['INBOX'] }
    })))
    return NextResponse.json({ archived: results.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
