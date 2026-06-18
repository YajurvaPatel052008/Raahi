'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTrip(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const tripData = {
    host_id: user.id,
    destination: formData.get('destination'),
    start_date: formData.get('startDate'),
    end_date: formData.get('endDate'),
    budget: parseFloat(formData.get('budget')),
    travel_type: formData.get('travelType'),
    description: formData.get('description'),
    max_members: parseInt(formData.get('maxMembers') || '2'),
  }

  const { data, error } = await supabase
    .from('trips')
    .insert([tripData])
    .select()

  if (error) return { error: error.message }

  // Add host as an approved member
  if (data && data[0]) {
    await supabase.from('trip_members').insert([{
      trip_id: data[0].id,
      user_id: user.id,
      status: 'approved'
    }])
  }

  revalidatePath('/trips')
  revalidatePath('/discover')
  return { success: true, trip: data[0] }
}

export async function updateTrip(tripId, formData) {
  const supabase = await createClient()

  const updates = {
    destination: formData.get('destination'),
    start_date: formData.get('startDate'),
    end_date: formData.get('endDate'),
    budget: parseFloat(formData.get('budget')),
    travel_type: formData.get('travelType'),
    description: formData.get('description'),
    max_members: parseInt(formData.get('maxMembers')),
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('trips')
    .update(updates)
    .eq('id', tripId)

  if (error) return { error: error.message }

  revalidatePath(`/trips/${tripId}`)
  revalidatePath('/trips')
  return { success: true }
}

export async function deleteTrip(tripId) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId)

  if (error) return { error: error.message }

  revalidatePath('/trips')
  revalidatePath('/discover')
  return { success: true }
}

export async function joinTrip(tripId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('trip_members')
    .insert([{
      trip_id: tripId,
      user_id: user.id,
      status: 'pending'
    }])

  if (error) return { error: error.message }

  revalidatePath(`/trips/${tripId}`)
  return { success: true }
}

export async function leaveTrip(tripId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('trip_members')
    .delete()
    .eq('trip_id', tripId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/trips/${tripId}`)
  revalidatePath('/trips')
  return { success: true }
}

export async function updateMemberStatus(tripId, userId, newStatus) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('trip_members')
    .update({ status: newStatus })
    .eq('trip_id', tripId)
    .eq('user_id', userId)

  if (error) return { error: error.message }

  revalidatePath(`/trips/${tripId}`)
  return { success: true }
}
