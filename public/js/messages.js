import axios from 'axios';
import { format } from 'timeago.js';
import catchAsync from './catchAsync';

export const sendMessage = async (convoId, data, socket) => {
    const response = await storeMessageInDatabase(convoId, data);

    renderMessage(response.data.data, true);

    const { recipient, sender } = response.data.data;

    socket.emit('sendMessage', {
        recipient,
        sender,
        content: response.data.data.content
    });
};

const storeMessageInDatabase = catchAsync(async (convoId, data) => {
    return await axios({
        url: `/api/v1/conversations/${convoId}/messages`,
        method: 'POST',
        data
    });
});

const getCorrespondentProfilePhoto = () => {
    const selectedConvoElement = document.querySelector(
        '.conversation--selected'
    );

    return selectedConvoElement.children[0].getAttribute('data-image');
};

export const renderMessage = (data, isOwn) => {
    const conversationContentEl = document.querySelector(
        '.conversation-content'
    );

    if (conversationContentEl) {
        conversationContentEl.insertAdjacentHTML(
            'beforeend',
            `
            <div class='message ${isOwn && 'message--logged-in-users'}'>
                <div class='message__main'>
                    ${
                        isOwn
                            ? ''
                            : `<img class='message__user-photo user-photo' src=/images/users/${getCorrespondentProfilePhoto()}>`
                    }
                    <p class='message__content'>${data.content}</p>
                </div>
                <div class='message__meta'>
                    <p class='message__time'>${format(data.dateSent)}</p>
                </div>
            </div>
        `
        );

        conversationContentEl.scrollTop = conversationContentEl.scrollHeight;
    }

    let convoExtract = document.querySelector(`.conversation--selected .conversation__extract`);
    if (!convoExtract) convoExtract = document.querySelector(`.conversation[data-user-id='${data.sender}'] .conversation__extract`);

    convoExtract.textContent = data.content;
};

const hideAllOnlineIndicators = () => {
    const onlineIndicators = document.querySelectorAll('.conversation__online-indicator');
 
    onlineIndicators.forEach(item => item.classList.remove('conversation__online-indicator--active'));
}

export const displayOnlineIndicators = (onlineUsers) => {
    hideAllOnlineIndicators();

    onlineUsers.forEach(user => {
        const onlineIndicator = document.querySelector(`[data-user-id='${user.userId}'] .conversation__online-indicator`);

        if (onlineIndicator) onlineIndicator.classList.add('conversation__online-indicator--active');
    });
}