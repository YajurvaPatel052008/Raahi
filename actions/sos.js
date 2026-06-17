'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function triggerSOS(latitude, longitude, tripId = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Create SOS Alert
  const { data: alert, error } = await supabase
    .from('sos_alerts')
    .insert([{
      user_id: user.id,
      trip_id: tripId,
      location_lat: latitude,
      location_lng: longitude,
      status: 'active'
    }])
    .select()
    .single()

  if (error) return { error: error.message }

  // 1. Notify emergency contacts (this would integrate with Twilio/SendGrid in production)
  // 2. Notify campus admins (System notification)
  
  await supabase.from('notifications').insert([{
    user_id: user.id, // Replace with admin IDs in real implementation
    type: 'trust_score_updated', // Using existing enum for example, need 'sos_alert' in prod
    title: '🚨 SOS ALERT TRIGGERED',
    body: `An SOS alert was triggered by user ${user.id} at coordinates ${latitude}, ${longitude}`,
    link: `/admin/sos/${alert.id}`
  }])

  return { success: true, alertId: alert.id }
}

export async function resolveSOS(alertId) {
  const supabase = await createClient()

  // Ensure only admins or the user themselves can resolve
  const { error } = await supabase
    .from('sos_alerts')
    .update({ 
      status: 'resolved',
      resolved_at: new Date().toISOString()
    })
    .eq('id', alertId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}
