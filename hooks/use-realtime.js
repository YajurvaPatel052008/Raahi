'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeMessages(tripId = null, userId = null) {
  const [messages, setMessages] = useState([])
  const supabase = createClient()

  useEffect(() => {
    if (!tripId && !userId) return

    // Fetch initial messages
    const fetchMessages = async () => {
      let query = supabase.from('messages').select(`
        *,
        sender:profiles!sender_id(id, full_name, avatar_url)
      `).order('created_at', { ascending: true })

      if (tripId) {
        query = query.eq('trip_id', tripId)
      } else if (userId) {
        query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`).is('trip_id', null)
      }

      const { data } = await query
      if (data) setMessages(data)
    }

    fetchMessages()

    // Subscribe to realtime updates
    const filter = tripId ? `trip_id=eq.${tripId}` : undefined

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: filter,
        },
        async (payload) => {
          // Fetch sender details for the new message
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single()

          const newMessage = { ...payload.new, sender }
          setMessages((prev) => [...prev, newMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tripId, userId])

  return messages
}

export function useRealtimeNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
      }
    }

    fetchNotifications()

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev])
          setUnreadCount((prev) => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const markAsRead = async (notificationId) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  return { notifications, unreadCount, markAsRead }
}
