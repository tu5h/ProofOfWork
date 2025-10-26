// app/api/me/route.ts
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServerClient'

export async function GET() {
  const supabase = await createSupabaseServerClient()

  // 1) Get the logged-in user (uid from cookie-backed session)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // 2) Fetch profile (id is FK to auth.users(id))
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('id, role, display_name, concordium_account, concordium_did')
    .eq('id', user.id)
    .single()

  if (pErr) {
    // Return minimal shape so UI can show "No Business Profile"
    return NextResponse.json({
      id: user.id,
      role: null,
      display_name: null,
      email: user.email,
      concordium_account: null,
      concordium_did: null,
      business: null,
    })
  }

  // 3) Fetch business row (businesses.id == profiles.id in your schema)
  const { data: business } = await supabase
    .from('businesses')
    .select('id, company_name')
    .eq('id', user.id)
    .maybeSingle()

  // 4) Return exactly what your page expects
  return NextResponse.json({
    id: profile.id,
    role: profile.role,
    display_name: profile.display_name,
    email: user.email,
    concordium_account: profile.concordium_account,
    concordium_did: profile.concordium_did,
    business: business ? { id: business.id, company_name: business.company_name } : null,
  })
}
