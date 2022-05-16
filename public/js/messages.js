import axios from 'axios';
import { format } from 'timeago.js';
import { displayAlert } from './alerts';
import catchAsync from './catchAsync';

const conversationsEl = document.querySelector('.conversations');
const conversationContentEl = document.querySelector('.conversation__content');

export const createConversation = catchAsync(async (data) => {
    const response = await axios({
        url: '/api/v1/conversations/',
        method: 'POST',
        data
    });

    return response.data.data;
});

export const deleteConversation = catchAsync(async (conversationId) => {
    const res = await axios({
        url: `/api/v1/conversations/${conversationId}`,
        method: 'DELETE'
    });

    // Response with status code 204 don't return a response, therefore I'm hardcoding it.
    displayAlert('success', 'The conversation was deleted successfully.');

    setTimeout(() => {
        location.assign('/messages');
    }, 1500);
});

export const storeMessage = catchAsync(async (conversationId, data) => {
    const response = await axios({
        url: `/api/v1/conversations/${conversationId}/messages`,
        method: 'POST',
        data
    });

    return response.data.data;
});

export const renderMessage = (data, isOwn) => {
    const userPhotoEl = document.querySelector(
        '.conversation--selected .user-photo'
    );

    conversationContentEl.insertAdjacentHTML(
        'beforeend',
        `
        <div class='message ${isOwn && 'message--logged-in-users'}'>
            <div class='message__main'>
                ${
                    isOwn
                        ? ''
                        : `<img class='message__user-photo user-photo' src=/images/users/${userPhotoEl.dataset.image}>`
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
};

const hideAllOnlineIndicators = () => {
    const onlineIndicators = document.querySelectorAll(
        '.conversation__online-indicator'
    );

    onlineIndicators.forEach((item) =>
        item.classList.remove('conversation__online-indicator--active')
    );
};

export const displayOnlineIndicators = (onlineUsers) => {
    hideAllOnlineIndicators();

    onlineUsers.forEach((user) => {
        const onlineIndicator = document.querySelector(
            `[data-user-id='${user.userId}'] .conversation__online-indicator`
        );

        if (onlineIndicator)
            onlineIndicator.classList.add(
                'conversation__online-indicator--active'
            );
    });
};

export const createConversationButton = (data) => {
    const buttonHtml = `
    <a class="conversation conversation--new" href="/messages/${data.conversationId}" data-user-id="${data.sender._id}" data-conversation-id="${data.conversationId}">
        <img class="user-photo" src="/images/users/${data.sender.profilePhoto}" data-image="${data.sender.profilePhoto}" />
        <div>
            <p class="conversation__username">${data.sender.username}</p>
            <div class="conversation__online-indicator"></div>
            <p class="conversation__extract">${data.content}</p>
        </div>
        <div class="conversation__notification-indicator-container"><div class="conversation__notification-indicator"></div></div>
    </a>
    `;

    conversationsEl.insertAdjacentHTML('afterbegin', buttonHtml);
};

export const updateButton = (buttonEl, conversationId, extract) => {
    const clone = buttonEl.cloneNode(true);
    buttonEl.remove();

    conversationsEl.insertAdjacentElement('afterbegin', clone);

    // Conversation is not open, hence add notification indicator.
    if (
        !document.querySelector(
            `.messages__main[data-conversation-id="${conversationId}"]`
        )
    ) {
        const conversationButton = document.querySelector(
            `.conversation[data-conversation-id='${conversationId}']`
        );

        conversationButton.classList.add('conversation--new');
    }

    // Update extract
    document.querySelector(
        `.conversation[data-conversation-id='${conversationId}'] .conversation__extract`
    ).textContent = extract;
};

export const sendMessageInRealtime = (message, socket) => {
    const { recipient, sender, conversationId, content } = message;

    socket.emit('sendMessage', {
        recipient,
        sender,
        conversationId,
        content
    });
};
