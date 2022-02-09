const newMessageForm = document.querySelector('.new-message__form');
const conversationContentEl = document.querySelector('.conversation-content');

// socket.io
const socket = io();

socket.on('message', (message) => {
    console.log('Message from backend', message);
    outputMessage(message);

    conversationContentEl.scrollTop = conversationContentEl.scrollHeight;
});

newMessageForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const message = e.target.elements[0].value;

    // Emit message to server
    socket.emit('chatMessage', message);

    // Clear input
    e.target.elements[0].value = '';
});

const outputMessage = (message) => {
    conversationContentEl.insertAdjacentHTML(
        'beforeend',
        `
        <div class="message">
            <p class="message__meta">
                User<span>0:00 pm</span>
            <p class="message__text">${message}</p>
        </div>
    `
    );
};
