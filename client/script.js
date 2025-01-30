const socket = io.connect('http://localhost:3000');

const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const joinChatButton = document.getElementById('join-chat');
const usernameInput = document.getElementById('username');

const message = document.getElementById('message');
const send = document.getElementById('send');
const output = document.getElementById('output');
const feedback = document.getElementById('feedback');
const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload');
const recordButton = document.getElementById('record');
let username = '';
let mediaRecorder;
let audioChunks = [];

// Event listener for the "Join Chat" button
joinChatButton.addEventListener('click', () => {
    if (usernameInput.value.trim() === '') {
        return alert("Please enter a nickname");
    }
    username = usernameInput.value;
    loginContainer.style.display = 'none';
    chatContainer.style.display = 'block';
    socket.emit('join', { username });
});

send.addEventListener('click', sendMessage);
uploadButton.addEventListener('click', uploadFile);
recordButton.addEventListener('click', recordVoiceNote);

function sendMessage() {
    if (message.value.trim() === '') {
        return;
    }
    socket.emit('chat', {
        message: message.value,
        username: username
    });
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

function recordVoiceNote() {
    if (recordButton.innerText === 'Record Voice Note') {
        recordButton.innerText = 'Stop Recording';
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                mediaRecorder.ondataavailable = function (e) {
                    audioChunks.push(e.data);
                };
                mediaRecorder.onstop = function () {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    audioChunks = [];
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        socket.emit('fileUpload', {
                            file: e.target.result,
                            fileName: 'voice-note.wav',
                            fileType: 'audio/wav',
                            username: username
                        });
                    };
                    reader.readAsDataURL(audioBlob);
                };
            })
            .catch(error => {
                console.error('Error accessing media devices.', error);
            });
    } else {
        recordButton.innerText = 'Record Voice Note';
        mediaRecorder.stop();
    }
}
