const socket = io("http://localhost:5000");

const joinScreen = document.getElementById('join-screen');
const chatScreen = document.getElementById('chat-screen');
const nicknameInput = document.getElementById('nickname-input');
const joinBtn = document.getElementById('join-btn');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');

let userId = '';
let nickname = '';

joinBtn.addEventListener('click', () => {
    nickname = nicknameInput.value.trim();
    if (nickname) {
        userId = `user_${Math.floor(Math.random() * 10000)}`; // Generate a unique user ID
        socket.emit('join', { userId, nickname });
        joinScreen.style.display = 'none';
        chatScreen.style.display = 'block';
    }
});

sendBtn.addEventListener('click', () => {
    const messageText = messageInput.value.trim();
    if (messageText) {
        if (messageText.includes('@Vanea')) {
            handleVaneaMessage(messageText);
        } else {
            const message = { userId, nickname, text: messageText };
            displayMessage(nickname, messageText);
            socket.emit('sendMessage', message);
        }
        messageInput.value = '';
    }
});

socket.on('receiveMessage', (message) => {
    displayMessage(message.nickname, message.text);
});

function handleVaneaMessage(messageText) {
    displayMessage(nickname, messageText);

    fetch(`https://ai-yg2z.onrender.com/Ai?query=${encodeURIComponent(messageText)}`)
        .then(response => response.json())
        .then(data => {
            const aiResponse = `Vanea: ${data.answer}`;displayMessage('Vanea', aiResponse);
            socket.emit('sendMessage', { userId: 'Vanea', nickname: 'Vanea', text: aiResponse });
        })
        .catch(err => {
            console.error('Error:', err);
            displayMessage('Vanea', 'Sorry, there was an error processing your request.');
        });
}

function displayMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${sender}: ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
