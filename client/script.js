const socket = io("http://localhost:5000");

const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const output = document.getElementById('output');
const feedback = document.getElementById('feedback');
const message = document.getElementById('message');
const username = document.getElementById('username');
const joinChat = document.getElementById('join-chat');
const sendBtn = document.getElementById('send');
const uploadTrigger = document.getElementById('upload-trigger');
const fileInput = document.getElementById('file-input');
const tagAi = document.getElementById('tag-ai');
const recordButton = document.getElementById('record');
const AI_TAG = '@bot'; // The tag to mention the AI

let currentUser = '';
let mediaRecorder;
let audioChunks = [];

// Event listener for the "Join Chat" button
joinChat.addEventListener('click', () => {
    if (username.value.trim()) {
        currentUser = username.value;
        loginContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        socket.emit('join', { username: currentUser });
        addMessage(`${currentUser} joined the chat`, 'user-joined');
    }
});

// Function to send message
function sendMessage() {
    if (message.value.trim()) {
        const timestamp = new Date().toLocaleTimeString();
        const msg = {
            user: currentUser,
            text: message.value,
            timestamp: timestamp
        };
        displayMessage(msg, 'sent');
        socket.emit('chatMessage', msg);
        checkAIResponse(message.value);
        message.value = '';
    }
}

// Function to add message to chat
function addMessage(text, className) {
    const messageDiv = document.createElement('div');
    messageDiv.className = className;
    messageDiv.textContent = text;
    output.appendChild(messageDiv);
    output.scrollTop = output.scrollHeight;
}

// Function to display message
function displayMessage({ user, text, timestamp }, className) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${className}`;
    messageDiv.innerHTML = `
        <strong>${user}</strong>: ${text}
        <div class="timestamp">${timestamp}</div>
    `;
    output.appendChild(messageDiv);
    output.scrollTop = output.scrollHeight;
}

// Send message on button click
sendBtn.addEventListener('click', sendMessage);

// Send message on Enter key press
message.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Handle file upload trigger click
uploadTrigger.addEventListener('click', () => {
    fileInput.click();
});

// Handle file upload selection
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        addMessage(`File selected: ${fileName}`, 'user-joined');
        const reader = new FileReader();
        reader.onload = function (e) {
            socket.emit('fileUpload', {
                file: e.target.result,
                fileName: fileName,
                fileType: fileInput.files[0].type,
                username: currentUser
            });
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
});

// Handle typing indicator
message.addEventListener('input', () => {
    if (message.value.trim()) {
        feedback.textContent = `${currentUser} is typing...`;
        socket.emit('typing', { username: currentUser });
    } else {
        feedback.textContent = '';
        socket.emit('stopTyping', { username: currentUser });
    }
});

// Handle AI tag button click
tagAi.addEventListener('click', () => {
    message.value += ` ${AI_TAG}`;
    message.focus();
});

// Handle socket events
socket.on('chatMessage', (msg) => {displayMessage(msg, 'received');
});

socket.on('typing', (data) => {
    feedback.textContent = `${data.username} is typing...`;
});

socket.on('stopTyping', () => {
    feedback.textContent = '';
});

// Function to check AI response
function checkAIResponse(msg) {
    if (msg.includes(AI_TAG)) {
        fetchAIResponse(msg);
    }
}

// Function to fetch AI response
function fetchAIResponse(query) {
    fetch(`https://ai-yg2z.onrender.com/ai?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            const aiMsg = {
                user: 'AI',
                text: data.response,
                timestamp: new Date().toLocaleTimeString()
            };
            displayMessage(aiMsg, 'received');
            socket.emit('chatMessage', aiMsg);
        })
        .catch(error => {
            console.error('Error fetching AI response:', error);
        });
}

// Voice note recording
recordButton.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        recordButton.textContent = 'Record Voice Note';
    } else {
        startRecording();
        recordButton.textContent = 'Stop Recording';
    }
});

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const reader = new FileReader();
                reader.onload = function (e) {
                    socket.emit('fileUpload', {
                        file: e.target.result,
                        fileName: 'voiceNote.wav',
                        fileType: 'audio/wav',
                        username: currentUser
                    });
                };
                reader.readAsDataURL(audioBlob);
                audioChunks = [];
            };
            mediaRecorder.start();
        })
        .catch(error => {
            console.error('Error accessing microphone:', error);
        });
}
