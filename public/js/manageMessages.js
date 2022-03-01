import axios from 'axios';
import { format } from 'timeago.js';
import catchAsync from './catchAsync';

export const manageMessages = catchAsync(
    async (reqType, convoId, data, socket) => {
        let axiosOptions = {
            url: `/api/v1/conversations/${convoId}/messages`,
            method: reqType,
            data
        };

        const response = await axios(axiosOptions);

        renderMessage(response.data.data, true);

        socket.emit('sendMessage', {
            convoId: convoId,
            content: response.data.data.content
        });
    }
);

const getCorrespondantProfilePhoto = () => {
    const selectedConvoElement = document.querySelector(
        '.conversation--selected'
    );

    return selectedConvoElement.children[0].getAttribute('data-image');
};

export const renderMessage = (data, isOwn) => {
    const conversationContentEl = document.querySelector(
        '.conversation-content'
    );

    conversationContentEl.insertAdjacentHTML(
        'beforeend',
        `
        <div class='message ${isOwn && 'message--logged-in-users'}'>
            <div class='message__main'>
                ${
                    isOwn
                        ? ''
                        : `<img class='message__user-photo user-photo' src=/images/users/${getCorrespondantProfilePhoto()}>`
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
