import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'npm:zod@3.23.8'

const BodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(2000),
  // honeypot: must be empty
  website: z.string().max(0).optional(),
})

const LINK_RE = /(https?:\/\/|www\.)/gi

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const parsed = BodySchema.safeParse(raw)
  if (!parsed.success) {
    return json({ error: parsed.error.flatten().fieldErrors }, 400)
  }

  const { name, email, subject, message, website } = parsed.data

  // Honeypot tripped -> pretend success, drop the submission.
  if (website) return json({ ok: true })

  // Lightweight spam heuristics
  const linkCount = (message.match(LINK_RE) ?? []).length + (subject.match(LINK_RE) ?? []).length
  if (linkCount > 3) {
    return json({ error: { message: ['Message contains too many links.'] } }, 400)
  }
  if (/[\u0000-\u0008\u000ب-\u001f]/.test(name + subject)) {
    return json({ error: { name: ['Invalid characters.'] } }, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { error } = await supabase.from('contact_messages').insert([{ name, email, subject, message }])
  if (error) {
    console.error('contact insert failed', error.message)
    return json({ error: 'Could not save message' }, 500)
  }

  return json({ ok: true })
})