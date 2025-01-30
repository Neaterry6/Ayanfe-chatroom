const socket = io.connect('http://localhost:3000');

const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const joinChatButton = document.getElementById('join-chat');
const usernameInput = document.getElementById('username');

const message = document.getElementById('message');
const send = document.getElementById('send');
const tagAI = document.getElementById('tag-ai');
const output = document.getElementById('output');
const feedback = document.getElementById('feedback');
const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload');
const AI_TAG = '@bot'; // The tag to mention the AI
let username = '';

// Event listener for the "Join Chat" button
joinChatButton.addEventListener('click', () => {
    if (usernameInput.value.trim() === '') {
        return alert("Please enter a nickname");
    }
    username = usernameInput.value;
    loginContainer.style.display = 'none';
    chatContainer.style.display = 'block';
    console.log('User joined:', username); // Log user join
    socket.emit('join', { username });
});

send.addEventListener('click', sendMessage);
tagAI.addEventListener('click', () => {
    message.value += ` ${AI_TAG}`;
    message.focus();
});
uploadButton.addEventListener('click', uploadFile);

function sendMessage() {
    if (message.value.trim() === '') {
        return;
    }
    console.log('Sending message:', message.value); // Log message send
    socket.emit('chat', {
        message: message.value,
        username: username
    });
    checkAIResponse(message.value); // Check if AI is mentioned
    message.value = '';
}

message.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
    socket.emit('typing', { username });
});

socket.on('chat', (data) => {
    feedback.innerHTML = '';
    const messageClass = data.username === username ? 'user-message' : 'other-message';
    if (data.message) {
        console.log('Message received:', data.message); // Log received message
        output.innerHTML += `<p class="${messageClass}"><strong>@${data.username}:</strong> ${data.message}</p>`;
    }
    if (data.file) {
        const fileType = data.fileType.startsWith('image') ? 'image' : 'audio';
        const fileElement = fileType === 'image' ? `<img src="${data.file}" alt="Image"/>` : `<audio controls><source src="${data.file}" type="${data.fileType}"></audio>`;
        output.innerHTML += `<p class="${messageClass}"><strong>@${data.username}:</strong><br>${fileElement}</p>`;
    }
    output.scrollTop = output.scrollHeight; // Scroll to the bottom
});

socket.on('typing', (data) => {
    feedback.innerHTML = `<p><em>@${data.username} is typing...</em></p>`;
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

function uploadFile() {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        socket.emit('fileUpload', {
            file: e.target.result,
            fileName: file.name,
            fileType: file.type,
            username: username
        });
    };
    reader.readAsDataURL(file);
        }
