import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { createOpenAI } from 'npm:@ai-sdk/openai'
import { streamText } from 'npm:ai'
import { z } from 'npm:zod@3.23.8'
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  getLovableAiGatewayResponseHeaders,
} from '../_shared/run-id.ts'

const BodySchema = z.object({
  description: z.string().trim().min(10).max(4000),
  browser: z.string().trim().max(200).optional(),
})

const SYSTEM = `You are a support assistant for a church website built with React and a hosted auth backend (session stored in browser localStorage; sign-out happens on a /logout page that calls signOut, clears storage, then redirects home).
An administrator describes a sign-out problem. Respond in plain, friendly language for a non-technical person, in Markdown, under 350 words, with these sections:
## Likely causes (ranked, 2-4 items, each with a one-line why)
## Try these steps (numbered, simple actions like refreshing, private window, clearing site data, trying another browser, waiting for redirect)
## When to ask for help (what details to report to the site developer)`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const json = (body: unknown, status = 200, extra?: HeadersInit) =>
    new Response(JSON.stringify(body), {
      status,
      headers: getLovableAiGatewayResponseHeaders(extra, { ...corsHeaders, 'Content-Type': 'application/json' }),
    })

  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return json({ error: 'Please sign in.' }, 401)

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: userData, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !userData.user) return json({ error: 'Please sign in again.' }, 401)
  const { data: role } = await admin
    .from('user_roles').select('role').eq('user_id', userData.user.id).eq('role', 'admin').maybeSingle()
  if (!role) return json({ error: 'Administrators only.' }, 403)

  let raw: unknown
  try { raw = await req.json() } catch { return json({ error: 'Invalid request.' }, 400) }
  const parsed = BodySchema.safeParse(raw)
  if (!parsed.success) return json({ error: 'Please describe the issue in at least 10 characters.' }, 400)

  const apiKey = Deno.env.get('LOVABLE_API_KEY')
  if (!apiKey) return json({ error: 'AI is not configured.' }, 500)

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(req))
  const provider = createOpenAI({
    baseURL: 'https://ai.gateway.lovable.dev/v1',
    apiKey,
    headers: { 'Lovable-API-Key': apiKey, 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' },
    fetch: runIdFetch.fetch,
  })

  let streamError: unknown
  try {
    const result = streamText({
      model: provider.responses('openai/gpt-6-astra'),
      system: SYSTEM,
      prompt: `Issue description:\n${parsed.data.description}\n\nBrowser/device: ${parsed.data.browser || 'not given'}`,
      abortSignal: req.signal,
      maxRetries: 0,
      onError: ({ error }) => { streamError = error },
      providerOptions: {
        openai: {
          store: false,
          forceReasoning: true,
          reasoningEffort: 'low',
          reasoningSummary: 'auto',
          include: ['reasoning.encrypted_content'],
        },
      },
    })
    const text = await result.text
    const runHeaders: Record<string, string> = {}
    const runId = runIdFetch.getRunId()
    if (runId) runHeaders['X-Lovable-AIG-Run-ID'] = runId
    if (streamError) throw streamError
    if (!text.trim()) return json({ error: 'The AI returned no answer. Please try again later.' }, 502, runHeaders)
    return json({ analysis: text }, 200, runHeaders)
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return json({ error: 'Cancelled' }, 499)
    const status = (e as { statusCode?: number })?.statusCode ?? 500
    console.error('diagnose-signout error', status, e)
    const msg =
      status === 402 ? 'AI credits are used up. Add credits in Settings → Plans & credits.'
      : status === 429 ? 'Too many requests right now. Please wait a minute and try again.'
      : status === 403 ? 'AI access is currently blocked for this workspace.'
      : 'Could not analyze the issue right now. Please try again later.'
    return json({ error: msg }, status >= 400 && status < 600 ? status : 500)
  }
})
