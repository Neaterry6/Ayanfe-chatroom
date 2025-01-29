const socket = io.connect('http://localhost:3000');

const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const joinChatButton = document.getElementById('join-chat');
const usernameInput = document.getElementById('username');

const message = document.getElementById('message');
const send = document.getElementById('send');
const output = document.getElementById('output');
const feedback = document.getElementById('feedback');
const AI_TAG = '@bot'; // The tag to mention the AI
let username = '';

joinChatButton.addEventListener('click', () => {
    if (usernameInput.value.trim() === '') {
        return alert("Please enter a nickname");
    }
    username = usernameInput.value;
    loginContainer.style.display = 'none';
    chatContainer.style.display = 'block';
});

send.addEventListener('click', () => {
    if (message.value.trim() === '') {
        return;
    }
    socket.emit('chat', {
        message: message.value,
        username: username
    });
    checkAIResponse(message.value); // Check if AI is mentioned
    message.value = '';
});

message.addEventListener('keypress', () => {
    socket.emit('typing', username);
});

socket.on('chat', (data) => {
    feedback.innerHTML = '';
    const messageClass = data.username === username ? 'user-message' : 'other-message';
    output.innerHTML += `<p class="${messageClass}"><strong>@${data.username}:</strong> ${data.message}</p>`;
    output.scrollTop = output.scrollHeight; // Scroll to the bottom
});

socket.on('typing', (data) => {
    feedback.innerHTML = `<p><em>@${data} is typing...</em></p>`;
});

function checkAIResponse(msg) {
    if (msg.includes(AI_TAG)) {
        fetchAIResponse(msg);
    }
}

function fetchAIResponse(query) {
    fetch(`https://ai-yg2z.onrender.com/ai?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            socket.emit('chat', {
                message: data.response, // Assuming the API returns a field named 'response'
                username: 'AI'
            });
        })
        .catch(error => {
            console.error('Error fetching AI response:', error);
        });
}
