const socket = io.connect('http://localhost:3000');

const message = document.getElementById('message');
const username = document.getElementById('username');
const send = document.getElementById('send');
const output = document.getElementById('output');
const feedback = document.getElementById('feedback');
const AI_TAG = '@bot'; // The tag to mention the AI

send.addEventListener('click', () => {
    if (username.value.trim() === '') {
        return alert("Please enter a nickname");
    }
    socket.emit('chat', {
        message: message.value,
        username: username.value
    });
    checkAIResponse(message.value); // Check if AI is mentioned
    message.value = '';
});

message.addEventListener('keypress', () => {
    socket.emit('typing', username.value);
});

socket.on('chat', (data) => {
    feedback.innerHTML = '';
    const messageClass = data.username === username.value ? 'user-message' : 'other-message';
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
