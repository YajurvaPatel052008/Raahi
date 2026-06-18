'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ChatPage() {
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { window.location.href = '/login'; return }
      setUser(u)

      // Fetch all conversations (unique users the current user has messaged)
      const { data: sent } = await supabase
        .from('messages')
        .select('receiver_id, receiver:profiles!receiver_id(id, full_name, avatar_url)')
        .eq('sender_id', u.id)
        .is('trip_id', null)

      const { data: received } = await supabase
        .from('messages')
        .select('sender_id, sender:profiles!sender_id(id, full_name, avatar_url)')
        .eq('receiver_id', u.id)
        .is('trip_id', null)

      // Deduplicate into unique contacts
      const contactMap = new Map()
      sent?.forEach(m => { if (m.receiver) contactMap.set(m.receiver_id, m.receiver) })
      received?.forEach(m => { if (m.sender) contactMap.set(m.sender_id, m.sender) })

      const convos = Array.from(contactMap.values())
      setConversations(convos)
      if (convos.length > 0) setActiveChat(convos[0])
      setLoading(false)
    }
    init()
  }, [])

  // Fetch messages when active chat changes
  useEffect(() => {
    if (!user || !activeChat) return

    async function fetchMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(id, full_name, avatar_url)')
        .is('trip_id', null)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeChat.id}),and(sender_id.eq.${activeChat.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      setMessages(data || [])
    }
    fetchMessages()

    // Realtime subscription
    const channel = supabase
      .channel(`chat-${activeChat.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, async (payload) => {
        const msg = payload.new
        if (
          (msg.sender_id === user.id && msg.receiver_id === activeChat.id) ||
          (msg.sender_id === activeChat.id && msg.receiver_id === user.id)
        ) {
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', msg.sender_id)
            .single()
          setMessages(prev => [...prev, { ...msg, sender }])
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeChat, user])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim() || !user || !activeChat) return

    await supabase.from('messages').insert([{
      sender_id: user.id,
      receiver_id: activeChat.id,
      content: newMessage.trim(),
    }])

    setNewMessage('')
  }

  if (loading) {
    return (
      <div className="app-layout">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <div className="spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-brand">RAAHI <span className="brand-dot" /></Link>
        </div>
        <nav className="sidebar-nav">
          <Link href="/dashboard" className="sidebar-link">📊 Dashboard</Link>
          <Link href="/discover" className="sidebar-link">🔍 Discover</Link>
          <Link href="/matches" className="sidebar-link">🤝 Matches</Link>
          <div className="sidebar-section-title">My Travel</div>
          <Link href="/trips" className="sidebar-link">✈️ My Trips</Link>
          <Link href="/chat" className="sidebar-link active">💬 Messages</Link>
          <Link href="/reviews" className="sidebar-link">⭐ Reviews</Link>
        </nav>
      </aside>

      <main className="main-content" style={{ padding: 0, height: 'calc(100vh - 0px)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', height: '100%' }}>
          {/* Chat List */}
          <div style={{ width: '300px', borderRight: '1px solid var(--color-border-light)', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-primary)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border-light)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Messages</h2>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {conversations.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                  No conversations yet. Find a match to start chatting!
                </div>
              ) : (
                conversations.map(contact => (
                  <div
                    key={contact.id}
                    onClick={() => setActiveChat(contact)}
                    style={{
                      padding: '14px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                      background: activeChat?.id === contact.id ? 'var(--color-bg-secondary)' : 'transparent',
                      borderLeft: activeChat?.id === contact.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                    }}
                  >
                    <div className="avatar avatar-sm" style={{ background: '#DBEAFE', color: '#2563EB' }}>
                      {contact.full_name?.[0] || '?'}
                    </div>
                    <div style={{ fontWeight: 500, fontSize: '14px' }}>{contact.full_name}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="avatar avatar-sm" style={{ background: '#DBEAFE', color: '#2563EB' }}>
                    {activeChat.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{activeChat.full_name}</div>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: msg.sender_id === user.id ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div style={{
                        maxWidth: '70%', padding: '10px 16px', borderRadius: '16px',
                        background: msg.sender_id === user.id ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                        color: msg.sender_id === user.id ? 'white' : 'var(--color-text-primary)',
                        fontSize: '14px', lineHeight: '1.5'
                      }}>
                        {msg.content}
                        {msg.image_url && (
                          <img src={msg.image_url} alt="attachment" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '8px' }} />
                        )}
                        <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border-light)', display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    style={{ flex: 1 }}
                    autoComplete="off"
                  />
                  <button type="submit" className="btn btn-primary">Send</button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
