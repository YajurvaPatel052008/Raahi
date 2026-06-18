import { createClient } from '@/lib/supabase/server'

/**
 * Trust Score Engine
 * Most of the logic is handled by Postgres Triggers automatically.
 * 
 * Rules:
 * Verified Student +20
 * Completed Trip +10
 * Positive Review +5
 * Negative Review -5
 * 
 * Levels:
 * 0-25 Bronze
 * 26-50 Silver
 * 51-75 Gold
 * 76+ Explorer Elite
 * 
 * This service provides helper methods to interact with or override scores if needed
 * by admins.
 */

export async function getTrustScoreDetails(userId) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('trust_score, trust_level, is_verified')
    .eq('id', userId)
    .single()

  if (error) throw new Error(error.message)

  // Fetch breakdown
  const { data: reviews } = await supabase
    .from('reviews')
    .select('overall_experience')
    .eq('reviewee_id', userId)

  const { data: hostedTrips } = await supabase
    .from('trips')
    .select('id')
    .eq('host_id', userId)
    .eq('status', 'completed')

  const { data: joinedTrips } = await supabase
    .from('trip_members')
    .select('trips!inner(status)')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .eq('trips.status', 'completed')

  let positiveReviews = 0
  let negativeReviews = 0

  reviews?.forEach(r => {
    if (r.overall_experience >= 4) positiveReviews++
    else if (r.overall_experience <= 2) negativeReviews++
  })

  return {
    score: profile.trust_score,
    level: profile.trust_level,
    breakdown: {
      isVerified: profile.is_verified,
      completedTrips: (hostedTrips?.length || 0) + (joinedTrips?.length || 0),
      positiveReviews,
      negativeReviews
    }
  }
}

// Admin override
export async function adminUpdateTrustScore(userId, manualAdjustment) {
  const supabase = await createClient()
  
  // Verify admin role via server client
  const { data: adminUser } = await supabase.auth.getUser()
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', adminUser?.user?.id)
    .single()

  if (adminProfile?.role !== 'admin' && adminProfile?.role !== 'super_admin') {
    throw new Error('Unauthorized')
  }

  // Postgres RPC function to safely add/subtract score
  const { error } = await supabase.rpc('adjust_trust_score', {
    target_user_id: userId,
    amount: manualAdjustment
  })

  if (error) throw new Error(error.message)
  return { success: true }
}
