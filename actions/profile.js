'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function updateProfile(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const updates = {
    full_name: formData.get('fullName'),
    bio: formData.get('bio'),
    department: formData.get('department'),
    year: formData.get('year'),
    city: formData.get('city'),
    gender: formData.get('gender'),
    travel_style: formData.get('travelStyle'),
    updated_at: new Date().toISOString(),
  }

  // Handle interests array
  const interestsStr = formData.get('interests')
  if (interestsStr) {
    updates.interests = interestsStr.split(',').map(i => i.trim())
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  return { success: true }
}

export async function uploadAvatar(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const file = formData.get('avatar')
  if (!file) return { error: 'No file provided' }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Math.random()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrlData.publicUrl })
    .eq('id', user.id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/profile')
  return { success: true, url: publicUrlData.publicUrl }
}

export async function deleteProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Since profiles references auth.users ON DELETE CASCADE, 
  // deleting the auth user will delete the profile.
  // Note: Only the service_role key can delete users in Supabase by default,
  // or a custom edge function. For this example we'll assume calling an edge function
  // or we just delete from profiles if RLS allows, but auth.users requires admin API.
  
  // Here we just delete the profile record as a placeholder, 
  // actual auth.user deletion needs Supabase Admin client
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id)

  if (error) return { error: error.message }

  await supabase.auth.signOut()
  return { success: true }
}
