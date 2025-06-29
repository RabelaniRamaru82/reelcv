import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateLinkRequest {
  expiresInDays?: number;
  settings?: {
    trackAnalytics: boolean;
    allowPublicIndexing: boolean;
    includeReelSkills: boolean;
    includeReelProjects: boolean;
    showVerificationBadges: boolean;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { expiresInDays, settings }: GenerateLinkRequest = await req.json()

    // Generate unique slug
    const slug = generateSlug()
    
    // Calculate expiration date
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : new Date('2099-12-31') // Far future for "never expire"

    // Revoke any existing active links
    await supabaseClient
      .from('public_cv_links')
      .update({ revoked: true })
      .eq('candidate_id', user.id)
      .eq('revoked', false)

    // Create new public link
    const { data: linkData, error: linkError } = await supabaseClient
      .from('public_cv_links')
      .insert({
        candidate_id: user.id,
        slug: slug,
        expires_at: expiresAt.toISOString(),
        view_count: 0,
        revoked: false,
        settings: settings || {}
      })
      .select()
      .single()

    if (linkError) {
      throw linkError
    }

    // Save portfolio settings if provided
    if (settings) {
      await supabaseClient
        .from('portfolio_settings')
        .upsert({
          candidate_id: user.id,
          track_analytics: settings.trackAnalytics,
          allow_public_indexing: settings.allowPublicIndexing,
          include_reel_skills: settings.includeReelSkills,
          include_reel_projects: settings.includeReelProjects,
          show_verification_badges: settings.showVerificationBadges,
          updated_at: new Date().toISOString()
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        slug: linkData.slug,
        expires_at: linkData.expires_at,
        url: `${req.headers.get('origin') || 'https://reelcv.reelapp.co.za'}/public/${linkData.slug}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}