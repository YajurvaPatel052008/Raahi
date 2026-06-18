/* ============================================
   RAAHI — Chat Logic (Supabase Realtime)
   ============================================ */

let currentUser = null;
let activePartnerId = null;
let activePartnerName = '';
let realtimeChannel = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await window.raahi.requireAuth();
  if (!currentUser) return;

  await loadConversations();

  // Mobile layout
  window.addEventListener('resize', handleResize);
  handleResize();

  // Send on Enter key
  const input = document.getElementById('messageInput');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
});

/* ── Load sidebar conversation list ── */
async function loadConversations() {
  const sidebar = document.getElementById('chatSidebar');
  const listContainer = document.querySelector('.chat-list') || sidebar;
  if (!listContainer) return;

  const supabase = window.raahi.supabase;

  // Get all unique people the current user has chatted with
  const [{ data: sent }, { data: received }] = await Promise.all([
    supabase.from('messages').select('receiver_id').eq('sender_id', currentUser.id).is('trip_id', null),
    supabase.from('messages').select('sender_id').eq('receiver_id', currentUser.id).is('trip_id', null)
  ]);

  const contactIds = new Set([
    ...(sent || []).map(m => m.receiver_id),
    ...(received || []).map(m => m.sender_id)
  ].filter(id => id !== currentUser.id));

  if (contactIds.size === 0) {
    // Show empty state in chat list area
    const emptyEl = document.createElement('div');
    emptyEl.style.cssText = 'padding:24px;text-align:center;color:var(--color-text-muted);font-size:14px;';
    emptyEl.innerHTML = '<div style="font-size:32px;margin-bottom:8px;">💬</div><p>No conversations yet.<br>Join a trip to connect!</p>';
    const chatList = document.querySelector('.chat-list');
    if (chatList) chatList.appendChild(emptyEl);
    return;
  }

  // Fetch profiles of contacts
  const { data: contacts } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, trust_level')
    .in('id', Array.from(contactIds));

  if (!contacts) return;

  // Render contacts in sidebar
  const chatList = document.querySelector('.chat-list');
  if (chatList) {
    chatList.innerHTML = '';
    contacts.forEach(contact => {
      const item = document.createElement('div');
      item.className = 'chat-list-item';
      item.id = `contact-${contact.id}`;
      item.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 20px;cursor:pointer;border-bottom:1px solid var(--color-border-light);transition:background 0.2s;';
      item.innerHTML = `
        <div style="width:40px;height:40px;border-radius:50%;background:#DBEAFE;color:#2563EB;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;flex-shrink:0;">
          ${contact.avatar_url ? `<img src="${contact.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : contact.full_name?.[0] || '?'}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${contact.full_name}</div>
          <div style="font-size:12px;color:var(--color-text-muted);">${contact.trust_level || 'Bronze'}</div>
        </div>`;
      item.addEventListener('click', () => openChat(contact));
      item.addEventListener('mouseenter', () => item.style.background = 'var(--color-bg-secondary)');
      item.addEventListener('mouseleave', () => item.style.background = activePartnerId === contact.id ? 'var(--color-bg-secondary)' : '');
      chatList.appendChild(item);
    });

    // Open first conversation automatically
    if (contacts.length > 0) openChat(contacts[0]);
  }
}

/* ── Open a specific chat ── */
async function openChat(contact) {
  activePartnerId = contact.id;
  activePartnerName = contact.full_name;

  // Highlight active contact
  document.querySelectorAll('.chat-list-item').forEach(el => el.style.background = '');
  const activeItem = document.getElementById(`contact-${contact.id}`);
  if (activeItem) activeItem.style.background = 'var(--color-bg-secondary)';

  // Update header
  const headerName = document.getElementById('currentChatName');
  if (headerName) headerName.textContent = contact.full_name;

  // Load messages
  await loadMessages();

  // Subscribe to realtime
  subscribeToRealtime();

  // Mobile: show chat area
  if (window.innerWidth < 768) {
    const chatSidebar = document.getElementById('chatSidebar');
    const chatMain = document.getElementById('chatMain');
    if (chatSidebar) chatSidebar.style.display = 'none';
    if (chatMain) chatMain.style.display = 'flex';
  }
}

/* ── Load messages for current conversation ── */
async function loadMessages() {
  const messagesArea = document.getElementById('chatMessages');
  if (!messagesArea || !activePartnerId) return;

  messagesArea.innerHTML = `<div style="display:flex;justify-content:center;padding:32px;color:var(--color-text-muted);">
    <div class="spinner"></div>
  </div>`;

  const { data: msgs } = await window.raahi.getMessages(currentUser.id, activePartnerId);

  messagesArea.innerHTML = '';

  if (!msgs || msgs.length === 0) {
    messagesArea.innerHTML = `<div style="text-align:center;padding:32px;color:var(--color-text-muted);font-size:14px;">
      <div style="font-size:32px;margin-bottom:8px;">👋</div>
      <p>Say hello to ${activePartnerName}!</p>
    </div>`;
    return;
  }

  msgs.forEach(msg => appendMessage(msg, false));
  scrollToBottom();
}

/* ── Append a single message to the chat ── */
function appendMessage(msg, animate = true) {
  const messagesArea = document.getElementById('chatMessages');
  if (!messagesArea) return;

  const isOwn = msg.sender_id === currentUser.id;
  const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Remove empty-state placeholder if present
  const placeholder = messagesArea.querySelector('[data-placeholder]');
  if (placeholder) placeholder.remove();

  const msgEl = document.createElement('div');
  msgEl.className = `message ${isOwn ? 'message-out' : 'message-in'}`;
  if (animate) {
    msgEl.style.cssText = 'opacity:0;transform:translateY(10px);transition:all 0.3s ease;';
  }
  msgEl.innerHTML = `
    ${!isOwn ? `<div class="avatar avatar-sm" style="background:#CCFBF1;color:#0D9488;">${activePartnerName?.[0] || '?'}</div>` : ''}
    <div class="message-content">
      <div class="message-bubble">${msg.message}</div>
      <div class="message-time">${time}${isOwn ? ' <span style="color:var(--color-primary);font-size:10px;margin-left:4px;">✓✓</span>' : ''}</div>
    </div>`;

  messagesArea.appendChild(msgEl);
  if (animate) setTimeout(() => { msgEl.style.opacity = '1'; msgEl.style.transform = 'translateY(0)'; }, 10);
  scrollToBottom();
}

/* ── Subscribe to realtime messages ── */
function subscribeToRealtime() {
  if (realtimeChannel) window.raahi.supabase.removeChannel(realtimeChannel);

  realtimeChannel = window.raahi.subscribeToMessages(currentUser.id, activePartnerId, (msg) => {
    appendMessage(msg, true);
  });
}

/* ── Send a message ── */
window.sendMessage = async function() {
  const input = document.getElementById('messageInput');
  const text = input?.value?.trim();
  if (!text || !activePartnerId) return;

  input.value = '';

  // Optimistically render own message immediately
  const optimisticMsg = {
    sender_id: currentUser.id,
    receiver_id: activePartnerId,
    message: text,
    created_at: new Date().toISOString()
  };
  appendMessage(optimisticMsg, true);

  const { error } = await window.raahi.sendMessage(currentUser.id, activePartnerId, text);
  if (error && window.showToast) {
    window.showToast('Error', 'Failed to send message', 'error');
  }
};

/* ── Mobile helpers ── */
window.closeChat = function() {
  if (window.innerWidth < 768) {
    document.getElementById('chatSidebar').style.display = 'flex';
    document.getElementById('chatMain').style.display = 'none';
  }
};

window.switchChat = function(element, name) {
  document.querySelectorAll('.chat-list-item').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
  const headerName = document.getElementById('currentChatName');
  if (headerName) headerName.textContent = name;
  if (window.innerWidth < 768) {
    document.getElementById('chatSidebar').style.display = 'none';
    document.getElementById('chatMain').style.display = 'flex';
  }
};

function handleResize() {
  const chatSidebar = document.getElementById('chatSidebar');
  const chatMain = document.getElementById('chatMain');
  if (!chatSidebar || !chatMain) return;
  if (window.innerWidth >= 768) {
    chatSidebar.style.display = 'flex';
    chatMain.style.display = 'flex';
  } else {
    chatMain.style.display = 'none';
  }
}

function scrollToBottom() {
  const messages = document.getElementById('chatMessages');
  if (messages) messages.scrollTop = messages.scrollHeight;
}

/* ── File attachment (kept for UI, Supabase storage upload can be added later) ── */
let currentImage = null;
window.handleFileSelect = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    currentImage = e.target.result;
    const preview = document.getElementById('attachmentPreview');
    if (preview) {
      preview.innerHTML = `<div style="position:relative;display:inline-block;">
        <img src="${currentImage}" style="height:60px;border-radius:8px;border:2px solid var(--color-primary);">
        <button onclick="clearAttachment()" style="position:absolute;top:-8px;right:-8px;background:var(--color-error);color:white;border:none;border-radius:50%;width:20px;height:20px;font-size:10px;cursor:pointer;">✕</button>
      </div>`;
      preview.classList.remove('hidden');
    }
  };
  reader.readAsDataURL(file);
};
window.clearAttachment = function() {
  currentImage = null;
  const preview = document.getElementById('attachmentPreview');
  if (preview) { preview.innerHTML = ''; preview.classList.add('hidden'); }
  const fi = document.getElementById('fileInput');
  if (fi) fi.value = '';
};
