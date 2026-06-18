'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const tripId = formData.get('tripId')
  const revieweeId = formData.get('revieweeId')
  const safetyRating = parseInt(formData.get('safetyRating'))
  const communicationRating = parseInt(formData.get('communicationRating'))
  const punctualityRating = parseInt(formData.get('punctualityRating'))
  const overallExperience = parseInt(formData.get('overallExperience'))
  const feedback = formData.get('feedback')

  // Validate that the trip is completed
  const { data: trip } = await supabase
    .from('trips')
    .select('status')
    .eq('id', tripId)
    .single()

  if (!trip || trip.status !== 'completed') {
    return { error: 'You can only review completed trips' }
  }

  // Insert review
  const { error } = await supabase
    .from('reviews')
    .insert([{
      trip_id: tripId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      safety_rating: safetyRating,
      communication_rating: communicationRating,
      punctuality_rating: punctualityRating,
      overall_experience: overallExperience,
      feedback: feedback
    }])

  if (error) return { error: error.message }

  // Trust score is updated automatically via the Postgres Trigger `on_review_created`

  revalidatePath('/reviews')
  revalidatePath(`/profile/${revieweeId}`)
  return { success: true }
}

export async function getReviews(userId) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviewer_id(id, full_name, avatar_url)
    `)
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  return { data }
}
