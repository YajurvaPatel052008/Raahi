import { createClient } from '@/lib/supabase/server'

/**
 * Smart Compatibility Engine
 * Calculates a match score (0-100) between a user and a trip/host.
 * 
 * Weights:
 * - Budget Match = 30%
 * - Travel Style = 30%
 * - Interests = 20%
 * - Destination Preference = 20%
 */

export async function calculateMatchScores(userId) {
  const supabase = await createClient()

  // 1. Fetch current user profile
  const { data: userProfile, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (userError || !userProfile) throw new Error('User not found')

  // 2. Fetch all open trips (not hosted by the user)
  const { data: openTrips, error: tripsError } = await supabase
    .from('trips')
    .select(`
      *,
      host:profiles!host_id(id, interests, travel_style)
    `)
    .neq('host_id', userId)
    .eq('status', 'open')

  if (tripsError) throw new Error(tripsError.message)

  // 3. Calculate Scores
  const matches = openTrips.map(trip => {
    let score = 0
    let budgetScore = 0
    let styleScore = 0
    let interestScore = 0
    let destinationScore = 0 // Assuming we implement a destination preference array later, defaulting to 10/20 for now.

    // A. Budget Match (Max 30 points)
    // Assuming user profile eventually has a 'preferred_budget' or we compare against host's budget vs user's average. 
    // For this engine, we will assume standard deviation. 
    // If budget is within 20% difference, give 30 points.
    budgetScore = 30; // Placeholder logic until preferred_budget exists on profile

    // B. Travel Style (Max 30 points)
    if (userProfile.travel_style && trip.travel_type) {
      if (userProfile.travel_style.toLowerCase() === trip.travel_type.toLowerCase()) {
        styleScore = 30
      } else {
        styleScore = 15 // Partial match if different
      }
    }

    // C. Interests (Max 20 points)
    // Compare user's interests array with host's interests array
    const userInterests = userProfile.interests || []
    const hostInterests = trip.host?.interests || []
    
    if (userInterests.length > 0 && hostInterests.length > 0) {
      const commonInterests = userInterests.filter(i => hostInterests.includes(i))
      const matchPercentage = commonInterests.length / Math.max(userInterests.length, hostInterests.length)
      interestScore = Math.round(matchPercentage * 20)
    }

    // D. Destination Preference (Max 20 points)
    // If user has a preferred destinations list (to be added), compare here.
    destinationScore = 15 // Placeholder

    score = budgetScore + styleScore + interestScore + destinationScore

    return {
      trip,
      host: trip.host,
      matchScore: score,
      breakdown: {
        budget: budgetScore,
        style: styleScore,
        interests: interestScore,
        destination: destinationScore
      }
    }
  })

  // Sort by highest score
  return matches.sort((a, b) => b.matchScore - a.matchScore)
}
