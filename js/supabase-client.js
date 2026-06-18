/* ============================================
   RAAHI — Supabase Client (CDN)
   Loaded before all other scripts
   ============================================ */

const SUPABASE_URL = 'https://mtonlvwabbnupsjqzpwo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rekpDEYKm1QHmA5WCMvmAA_mrDGH51E';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.raahi = {
  supabase: _supabase,

  /* ── Allowed College Domains ── */
  ALLOWED_DOMAINS: ['aitr.ac.in', 'acropolis.in'],

  isAllowedDomain(email) {
    return this.ALLOWED_DOMAINS.some(domain => email.endsWith('@' + domain));
  },

  /* ── Get current session user ── */
  async getUser() {
    const { data: { user } } = await _supabase.auth.getUser();
    return user;
  },

  /* ── Get profile from profiles table ── */
  async getProfile(userId) {
    const { data, error } = await _supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  /* ── SIGN UP ── */
  async signUp({ email, password, fullName, college, year }) {
    if (!this.isAllowedDomain(email)) {
      return { error: { message: 'Only @aitr.ac.in and @acropolis.in emails are allowed.' } };
    }
    const { data, error } = await _supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, college, year }
      }
    });
    return { data, error };
  },

  /* ── SIGN IN ── */
  async signIn({ email, password }) {
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  /* ── SIGN OUT ── */
  async signOut() {
    await _supabase.auth.signOut();
    window.location.href = 'login.html';
  },

  /* ── FORGOT PASSWORD ── */
  async resetPassword(email) {
    const { data, error } = await _supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password.html'
    });
    return { data, error };
  },

  /* ── Show Error in Form ── */
  showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = message;
      el.style.display = 'block';
    }
  },

  /* ── Show Success Toast ── */
  showSuccess(message) {
    if (window.showToast) {
      window.showToast('Success', message, 'success');
    } else {
      alert(message);
    }
  },

  /* ── Guard: Redirect if NOT logged in ── */
  async requireAuth() {
    const user = await this.getUser();
    if (!user) {
      window.location.href = 'login.html';
      return null;
    }
    return user;
  },

  /* ── Guard: Redirect if ALREADY logged in ── */
  async requireGuest() {
    const user = await this.getUser();
    if (user) {
      window.location.href = 'dashboard.html';
    }
  },

  /* ═══════════════════════════════════════
     TRIPS
  ═══════════════════════════════════════ */

  async getOpenTrips(filters = {}) {
    let query = _supabase
      .from('trips')
      .select('*, profiles!creator_id(full_name, college, trust_level, avatar_url)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (filters.destination) {
      query = query.ilike('destination', `%${filters.destination}%`);
    }
    if (filters.travel_type) {
      query = query.eq('travel_type', filters.travel_type);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async getMyTrips(userId) {
    const { data, error } = await _supabase
      .from('trips')
      .select('*, trip_members(count)')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createTrip(tripData) {
    const { data, error } = await _supabase
      .from('trips')
      .insert([tripData])
      .select()
      .single();

    if (data && !error) {
      // Auto-add creator as approved member
      await _supabase.from('trip_members').insert([{
        trip_id: data.id,
        user_id: tripData.creator_id,
        join_status: 'approved'
      }]);
    }

    return { data, error };
  },

  async joinTrip(tripId, userId) {
    const { data, error } = await _supabase
      .from('trip_members')
      .insert([{ trip_id: tripId, user_id: userId, join_status: 'pending' }]);
    return { data, error };
  },

  /* ═══════════════════════════════════════
     MESSAGES (Realtime Chat)
  ═══════════════════════════════════════ */

  async getMessages(userId, partnerId) {
    const { data, error } = await _supabase
      .from('messages')
      .select('*, profiles!sender_id(full_name, avatar_url)')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  async sendMessage(senderId, receiverId, message) {
    const { data, error } = await _supabase
      .from('messages')
      .insert([{ sender_id: senderId, receiver_id: receiverId, message, message_type: 'text' }]);
    return { data, error };
  },

  subscribeToMessages(userId, partnerId, callback) {
    return _supabase
      .channel(`chat-${userId}-${partnerId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const msg = payload.new;
        if (
          (msg.sender_id === userId && msg.receiver_id === partnerId) ||
          (msg.sender_id === partnerId && msg.receiver_id === userId)
        ) {
          callback(msg);
        }
      })
      .subscribe();
  },

  /* ═══════════════════════════════════════
     REVIEWS
  ═══════════════════════════════════════ */

  async getReviews(userId) {
    const { data, error } = await _supabase
      .from('reviews')
      .select('*, profiles!reviewer_id(full_name, avatar_url)')
      .eq('reviewed_user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  }
};
