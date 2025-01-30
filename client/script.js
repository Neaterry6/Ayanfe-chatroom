const socket = io("http://localhost:5000");

const joinScreen = document.getElementById('join-screen');
const chatScreen = document.getElementById('chat-screen');
const nicknameInput = document.getElementById('nickname-input');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');
const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload');
const recordButton = document.getElementById('record');
const AI_TAG = '@bot'; // The tag to mention the AI
let nickname = '';
let mediaRecorder;
let audioChunks = [];

// Event listener for the "Join Chat" button
document.getElementById('join-btn').addEventListener('click', () => {
    nickname = nicknameInput.value.trim();
    if (nickname) {
        joinScreen.style.display = 'none';
        chatScreen.style.display = 'flex';
        socket.emit('join', { userId: nickname, nickname: nickname });
    }
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && messageInput.value.trim()) {
        sendMessage(messageInput.value.trim());
        messageInput.value = '';
    }
});

sendButton.addEventListener('click', () => {
    if (messageInput.value.trim() === '') {
        return;
    }
    sendMessage(messageInput.value.trim());
    messageInput.value = '';
});

function sendMessage(message) {
    displayMessage(nickname, message, 'user-message');
    socket.emit('sendMessage', { userId: nickname, nickname: nickname, text: message });
    checkAIResponse(message); // Check if AI is mentioned
}

socket.on('receiveMessage', (data) => {
    const messageClass = data.nickname === nickname ? 'user-message' : 'ai-message';
    displayMessage(data.nickname, data.text, messageClass);
});

function displayMessage(sender, message, className) {
    const messageElement = document.createElement('div');
    messageElement.className = className;
    messageElement.textContent = `${sender}: ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function checkAIResponse(msg) {
    if (msg.includes(AI_TAG)) {
        fetchAIResponse(msg);
    }
}

function fetchAIResponse(query) {
    fetch(`https://ai-yg2z.onrender.com/ai?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            socket.emit('sendMessage', { userId: 'AI', nickname: 'AI', text: data.response }); // Assuming the API returns a field named 'response'
        })
        .catch(error => {
            console.error('Error fetching AI response:', error);
        });
}

uploadButton.addEventListener('click', uploadFile);

function uploadFile() {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        socket.emit('fileUpload', {
            file: e.target.result,
            fileName: file.name,
            fileType: file.type,
            username: nickname
        });
    };
    reader.readAsDataURL(file);
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
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });const reader = new FileReader();
                reader.onload = function (e) {
                    socket.emit('fileUpload', {
                        file: e.target.result,
                        fileName: 'voiceNote.wav',
                        fileType: 'audio/wav',
                        username: nickname
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
