const chatMessages = document.getElementById('chat-messages');

function sendMessage(message) {
    displayMessage('You', message);
    socket.emit('sendMessage', { userId: 'You', nickname: 'You', text: message });

    // Make an API request to Vanea AI
    fetch(`https://ai-yg2z.onrender.com/ai?query=${encodeURIComponent(message)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        const aiResponse = data.response || 'No response from AI';
        displayMessage('Vanea', aiResponse);
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

// Example usage for sending a message
document.getElementById('send-btn').addEventListener('click', () => {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    if (message) {
        sendMessage(message);
        messageInput.value = '';
    }
});
