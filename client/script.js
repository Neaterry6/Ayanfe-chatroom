const socket = io("http://localhost:5000");

const joinScreen = document.getElementById('join-screen');
const chatScreen = document.getElementById('chat-screen');
const nicknameInput = document.getElementById('nickname-input');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');
const sendBtn = document.getElementById('send-btn');
const joinBtn = document.getElementById('join-btn');

let nickname = '';

joinBtn.addEventListener('click', () => {
    nickname = nicknameInput.value.trim();
    if (nickname) {
        joinScreen.style.display = 'none';
        chatScreen.style.display = 'flex';
        socket.emit('join', { userId: nickname, nickname: nickname });
    }
});

sendBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        sendMessage(message);
        messageInput.value = '';
    }
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && messageInput.value.trim()) {
        sendMessage(messageInput.value.trim());
        messageInput.value = '';
    }
});

socket.on('receiveMessage', (data) => {
    const className = data.nickname === nickname ? 'user-message' : 'vanea-message';
    displayMessage(data.nickname, data.text, className);
});

function sendMessage(message) {
    displayMessage('You', message, 'user-message');
    socket.emit('sendMessage', { userId: 'You', nickname: 'You', text: message });

    fetch(`https://ai-yg2z.onrender.com/ai?query=${encodeURIComponent(message)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        const aiResponse = data.response || 'No response from AI';
        displayMessage('Vanea', aiResponse, 'vanea-message');
        socket.emit('sendMessage', { userId: 'Vanea', nickname: 'Vanea', text: aiResponse });
    })
    .catch(err => {
        console.error('Error:', err);
        displayMessage('Vanea', 'Sorry, there was an error processing your request.', 'vanea-message');
    });
}

function displayMessage(sender, message, className) {
    const messageElement = document.createElement('div');
    messageElement.className = className;
    messageElement.textContent = `${sender}: ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    }
