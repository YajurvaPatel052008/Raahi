/* ============================================
   RAAHI — Chat Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  scrollToBottom();
});

function scrollToBottom() {
  const messages = document.getElementById('chatMessages');
  if (messages) {
    messages.scrollTop = messages.scrollHeight;
  }
}

/* ── Mobile Chat Switching ── */
window.switchChat = function(element, name) {
  // Update active state in list
  document.querySelectorAll('.chat-list-item').forEach(el => el.classList.remove('active'));
  element.classList.add('active');

  // Update header
  const headerName = document.getElementById('currentChatName');
  if (headerName) headerName.textContent = name;

  // On mobile, show main chat area
  if (window.innerWidth < 768) {
    document.getElementById('chatSidebar').style.display = 'none';
    document.getElementById('chatMain').style.display = 'flex';
  }
};

window.closeChat = function() {
  if (window.innerWidth < 768) {
    document.getElementById('chatSidebar').style.display = 'flex';
    document.getElementById('chatMain').style.display = 'none';
  }
};

// Handle window resize
window.addEventListener('resize', () => {
  if (window.innerWidth >= 768) {
    document.getElementById('chatSidebar').style.display = 'flex';
    document.getElementById('chatMain').style.display = 'flex';
  } else {
    document.getElementById('chatMain').style.display = 'none';
  }
});

/* ── Send Message ── */
let currentImage = null;

window.handleFileSelect = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    currentImage = e.target.result;
    
    const preview = document.getElementById('attachmentPreview');
    preview.innerHTML = `
      <div style="position: relative; display: inline-block;">
        <img src="${currentImage}" style="height: 60px; border-radius: 8px; border: 2px solid var(--color-primary);">
        <button onclick="clearAttachment()" style="position: absolute; top: -8px; right: -8px; background: var(--color-error); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer;">✕</button>
      </div>
    `;
    preview.classList.remove('hidden');
    document.getElementById('messageInput').focus();
  };
  reader.readAsDataURL(file);
};

window.clearAttachment = function() {
  currentImage = null;
  const preview = document.getElementById('attachmentPreview');
  preview.innerHTML = '';
  preview.classList.add('hidden');
  document.getElementById('fileInput').value = '';
};

window.sendMessage = function() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  const messagesArea = document.getElementById('chatMessages');

  if (!text && !currentImage) return;

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let contentHtml = '';

  if (currentImage) {
    contentHtml += `<img src="${currentImage}" style="max-width: 100%; border-radius: 8px; margin-bottom: 8px;">`;
  }
  if (text) {
    contentHtml += `<div>${text}</div>`;
  }

  const msgHtml = `
    <div class="message message-out" style="opacity: 0; transform: translateY(10px); transition: all 0.3s ease;">
      <div class="message-content">
        <div class="message-bubble">${contentHtml}</div>
        <div class="message-time">${time} <span style="color: var(--color-primary); font-size: 10px; margin-left: 4px;">✓✓</span></div>
      </div>
    </div>
  `;

  messagesArea.insertAdjacentHTML('beforeend', msgHtml);
  
  // Animate in
  const newMsg = messagesArea.lastElementChild;
  setTimeout(() => {
    newMsg.style.opacity = '1';
    newMsg.style.transform = 'translateY(0)';
  }, 10);

  input.value = '';
  clearAttachment();
  scrollToBottom();

  // Simulate reply
  if (text.toLowerCase().includes('hi') || text.toLowerCase().includes('hello')) {
    setTimeout(() => {
      receiveMessage('Hey! How are you doing?');
    }, 1500);
  }
};

function receiveMessage(text) {
  const messagesArea = document.getElementById('chatMessages');
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const msgHtml = `
    <div class="message message-in" style="opacity: 0; transform: translateY(10px); transition: all 0.3s ease;">
      <div class="avatar avatar-sm" style="background: #CCFBF1; color: #0D9488;">P</div>
      <div class="message-content">
        <div class="message-bubble">${text}</div>
        <div class="message-time">${time}</div>
      </div>
    </div>
  `;

  messagesArea.insertAdjacentHTML('beforeend', msgHtml);
  
  const newMsg = messagesArea.lastElementChild;
  setTimeout(() => {
    newMsg.style.opacity = '1';
    newMsg.style.transform = 'translateY(0)';
    scrollToBottom();
  }, 10);
}

/* ── Voice Recording Simulation ── */
let isRecording = false;
let recordTimer;

window.startRecording = function() {
  const micBtn = document.getElementById('micBtn');
  const input = document.getElementById('messageInput');
  
  isRecording = true;
  micBtn.style.color = 'var(--color-error)';
  micBtn.style.animation = 'pulse 1s infinite';
  input.placeholder = 'Recording... Release to send';
  input.disabled = true;
};

window.stopRecording = function() {
  if (!isRecording) return;
  
  const micBtn = document.getElementById('micBtn');
  const input = document.getElementById('messageInput');
  
  isRecording = false;
  micBtn.style.color = '';
  micBtn.style.animation = 'none';
  input.placeholder = 'Type a message...';
  input.disabled = false;

  // Simulate sending voice note
  const messagesArea = document.getElementById('chatMessages');
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const msgHtml = `
    <div class="message message-out" style="opacity: 0; transform: translateY(10px); transition: all 0.3s ease;">
      <div class="message-content">
        <div class="message-bubble">
          <div class="voice-note" style="background: rgba(255,255,255,0.2);">
            <button class="voice-play" style="color: white;">▶</button>
            <div class="voice-waveform" style="background: repeating-linear-gradient(90deg, white, white 2px, transparent 2px, transparent 4px);"></div>
            <div class="voice-time" style="color: white;">0:03</div>
          </div>
        </div>
        <div class="message-time">${time} <span style="color: var(--color-primary); font-size: 10px; margin-left: 4px;">✓</span></div>
      </div>
    </div>
  `;

  messagesArea.insertAdjacentHTML('beforeend', msgHtml);
  
  const newMsg = messagesArea.lastElementChild;
  setTimeout(() => {
    newMsg.style.opacity = '1';
    newMsg.style.transform = 'translateY(0)';
    scrollToBottom();
  }, 10);
};
