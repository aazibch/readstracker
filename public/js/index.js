import 'core-js/stable';
import 'regenerator-runtime/runtime';
import {
    ratingMouseOverHandler,
    ratingMouseLeaveHandler,
    ratingClickHandler
} from './ratingInput';

import { auth, logout } from './auth';
import {
    createBook,
    updateBook,
    deleteBook,
    likeBook,
    unlikeBook,
    getHomeFeedBooks,
    renderHomeFeedBooks,
    bookDropdownButtonClickHandler,
    bookDeleteButtonClickHandler,
    likeButtonClickHandler,
    unlikeButtonClickHandler,
    likesQuantityButtonClickHandler,
    attachBooksEventListeners
} from './books';
import {
    updateUser,
    deleteUser,
    updatePassword,
    clearPasswordInputFields
} from './users';
import {
    displayConfirmationModal,
    renderListData,
    renderNoContentMessage
} from './modals';
import {
    displayListModal,
    hideListModal,
    hideConfirmationModal
} from './modals';
import { searchUsersKeydownHandler, searchUsersKeyupHandler } from './search';
import {
    createConversation,
    renderMessage,
    displayOnlineIndicators,
    deleteConversation,
    storeMessage,
    createConversationButton,
    updateButton,
    sendMessageInRealtime
} from './messages';
import {
    getAccountsFollowing,
    getFollowers,
    followUser,
    unfollowUser
} from './connections';
import { displayAlert } from './alerts';

import { removeActiveClasses } from './utils';

const settingsDetailsForm = document.querySelector('.settings-details-form');
const settingsPasswordForm = document.querySelector('.settings-password-form');
const settingsDeleteButton = document.querySelector('.settings-delete-button');
const searchUsersFieldEl = document.querySelector('.search-users__input-field');
const confirmationModalNoButtonEl = document.querySelector(
    '.confirmation-modal__no-button'
);
const confirmationModalCloseButtonEl = document.querySelector(
    '.confirmation-modal__close-button'
);
const listModalCloseButtonEl = document.querySelector(
    '.list-modal__close-button'
);

const userId = localStorage.getItem('userId');

const socket = io();

// General
const resSearchToggleEl = document.querySelector('.main-buttons__search');
const siteHeaderEl = document.querySelector('.header');

resSearchToggleEl.addEventListener('click', (e) => {
    siteHeaderEl.classList.toggle('header--res-search-active');
});

const attachHandlersToConfirmationModalCloseButtons = () => {
    const elements = [
        confirmationModalCloseButtonEl,
        confirmationModalNoButtonEl
    ];

    elements.forEach((elem) =>
        elem.addEventListener('click', hideConfirmationModal)
    );
};

attachHandlersToConfirmationModalCloseButtons();

listModalCloseButtonEl.addEventListener('click', hideListModal);

const userButtonEl = document.querySelector('.main-nav__user-button');

if (userButtonEl) {
    userButtonEl.addEventListener('click', (e) => {
        const userMenuEl = document.querySelector('.user-menu');

        removeActiveClasses([
            '.notifications',
            '.main-buttons__button-container-notifications'
        ]);

        userMenuEl.classList.toggle('user-menu--active');
        userButtonEl.classList.toggle('main-nav__user-button--active');
    });
}

const notificationsButtonEl = document.querySelector(
    '.main-buttons__button-container-notifications'
);

if (notificationsButtonEl) {
    notificationsButtonEl.addEventListener('click', (e) => {
        const notificationsDropdownEl =
            document.querySelector('.notifications');

        removeActiveClasses(['.user-menu', '.main-nav__user-button']);

        notificationsButtonEl.classList.toggle(
            'main-buttons__button-container-notifications--active'
        );
        notificationsDropdownEl.classList.toggle('notifications--active');
    });
}

window.addEventListener('click', function (e) {
    const activeUserMenu = document.querySelector('.user-menu--active');

    if (
        !e.target.closest('.user-menu--active') &&
        !e.target.closest('.main-nav__user-button') &&
        activeUserMenu
    ) {
        removeActiveClasses(['.user-menu', '.main-nav__user-button']);
    }

    const activeNotificationsMenu = document.querySelector(
        '.notifications--active'
    );

    if (
        !e.target.closest('.main-buttons__button-container-notifications') &&
        !e.target.closest('.notifications') &&
        activeNotificationsMenu
    ) {
        removeActiveClasses([
            '.notifications',
            '.main-buttons__button-container-notifications'
        ]);
    }

    const activeBookDropdownEl = document.querySelector(
        '.full-book__dropdown--active'
    );

    if (
        !e.target.closest('.full-book__dropdown-menu') &&
        !e.target.closest('.full-book__dropdown-button') &&
        activeBookDropdownEl
    ) {
        activeBookDropdownEl.classList.remove('full-book__dropdown--active');
    }

    const activeSearchUsersEl = document.querySelector('.search-users--active');

    if (
        !e.target.closest('.search-users__quick-results') &&
        !e.target.closest('.search-users') &&
        activeSearchUsersEl
    ) {
        activeSearchUsersEl.classList.remove('search-users--active');
    }
});

if (searchUsersFieldEl) {
    searchUsersFieldEl.addEventListener('keydown', searchUsersKeydownHandler);
    searchUsersFieldEl.addEventListener('keyup', searchUsersKeyupHandler);
}

// Home

const homeFeedEl = document.querySelector('.home-feed');

if (homeFeedEl) {
    const feedLoadingSpinnerEl = document.querySelector(
        '.feed__loading-spinner'
    );

    feedLoadingSpinnerEl.classList.add('loading-spinner--active');

    getHomeFeedBooks().then((response) => {
        feedLoadingSpinnerEl.classList.remove('loading-spinner--active');

        if (!response) {
            return homeFeedEl.insertAdjacentHTML(
                'afterbegin',
                `
                <p class='message-large'>An error occurred. Reload the page to try again.</p>
            `
            );
        }

        console.log('response', response);

        if (response.data.data.length === 0) {
            return homeFeedEl.insertAdjacentHTML(
                'afterbegin',
                `
                <p class='message-large'>No books to show. Follow people to improve your experience.</p>
            `
            );
        } else {
            renderHomeFeedBooks(response.data.data);
            attachBooksEventListeners();
        }
    });
}

// Profile
const connectionsEl = document.querySelector('.connections');
const followersButtonEl = document.querySelector(
    '.users-list-triggers__followers'
);
const followingButtonEl = document.querySelector(
    '.users-list-triggers__following'
);

const followButtonEl = document.querySelector(
    '.connect-buttons__follow-button'
);
const unfollowButtonEl = document.querySelector(
    '.connect-buttons__unfollow-button'
);

attachBooksEventListeners();

if (followersButtonEl) {
    followersButtonEl.addEventListener('click', async (e) => {
        displayListModal('Followers');

        const response = await getFollowers(connectionsEl.dataset.userId);

        if (!response) {
            return hideListModal();
        }

        if (response.data.data.length === 0) {
            renderNoContentMessage();
        }

        document.querySelector('.followers-count').textContent =
            response.data.data.length;
        renderListData(response.data.data);
    });
}

if (followingButtonEl) {
    followingButtonEl.addEventListener('click', async () => {
        displayListModal('Following');

        const response = await getAccountsFollowing(
            connectionsEl.dataset.userId
        );

        if (!response) {
            return hideListModal();
        }

        if (response.data.data.length === 0) {
            renderNoContentMessage();
        }

        document.querySelector('.following-count').textContent =
            response.data.data.length;
        renderListData(response.data.data);
    });
}

if (followButtonEl) {
    followButtonEl.addEventListener('click', async () => {
        const userId = connectionsEl.dataset.userId;
        followButtonEl.setAttribute('disabled', '');

        const res = await followUser(userId);

        if (!res) {
            return followButtonEl.removeAttribute('disabled');
        }

        setTimeout(() => {
            location.reload();
        }, 1500);
    });
}

if (unfollowButtonEl) {
    unfollowButtonEl.addEventListener('click', async () => {
        const { userId, conversationId, followingId } = connectionsEl.dataset;

        unfollowButtonEl.setAttribute('disabled', '');
        const res = await unfollowUser(followingId);

        console.log('res[click handler]', res);
        if (res.status !== 204) {
            return unfollowButtonEl.removeAttribute('disabled');
        }

        const unfollowedUser = onlineUsers.find(
            (user) =>
                user.userId === userId &&
                user.activeConversation === conversationId
        );

        if (unfollowedUser && conversationId) {
            socket.emit('redirectAwayFromConversation', {
                userId: unfollowedUser.userId
            });
        }

        setTimeout(() => {
            location.reload();
        }, 1500);
    });
}

// Messages
const conversationContentEl = document.querySelector('.conversation-content');

const deleteConversationButton = document.querySelector(
    '.conversation__delete-button'
);
const messagesMainEl = document.querySelector('.messages__main');
let conversationId;

if (messagesMainEl) {
    conversationId = messagesMainEl.dataset.conversationId;
}

if (conversationContentEl) {
    conversationContentEl.scrollTop = conversationContentEl.scrollHeight;
}

if (deleteConversationButton) {
    deleteConversationButton.addEventListener('click', () => {
        displayConfirmationModal(
            'Are you sure you want to delete this conversation?',
            () => {
                deleteConversation(conversationId);
            }
        );
    });
}

// Web sockets
let onlineUsers;

if (userId) {
    socket.on('connect', () => {
        socket.emit('saveUser', userId);

        socket.on('onlineUsers', (users) => {
            onlineUsers = [...users];

            console.log('onlineUsers', onlineUsers);
            displayOnlineIndicators(onlineUsers);
        });

        if (messagesMainEl && messagesMainEl.dataset.conversationId) {
            socket.emit('updateUserActiveState', {
                socketId: socket.id,
                activeConversation: messagesMainEl.dataset.conversationId
            });
        }

        // Submit listener for new message form
        const newMessageForm = document.querySelector('.new-message__form');

        if (newMessageForm) {
            newMessageForm.addEventListener('submit', (event) => {
                messageSubmitHandler(event, socket);
            });
        }

        // Render message or notification badge.
        socket.on('chatMessage', (data) => {
            const messagesMainEl = document.querySelector(
                `.messages__main[data-conversation-id="${data.conversationId}"]`
            );

            const conversationButtonEl = document.querySelector(
                `.conversation[data-conversation-id='${data.conversationId}']`
            );

            // Means the user has the conversation open, render message
            if (messagesMainEl) {
                renderMessage(data, false);
            }

            const messagesPageEl = document.querySelector('.messages-page');

            // Move the conversation button (link) to the top
            if (messagesPageEl && conversationButtonEl) {
                updateButton(
                    conversationButtonEl,
                    data.conversationId,
                    data.content
                );
            }

            // New conversation, create conversation button.
            if (messagesPageEl && !conversationButtonEl) {
                createConversationButton(data);
            }

            // Conversation not open, update notification count in nav bar for messages
            if (data.notification && !messagesMainEl) {
                updateMessagesNotification();
            }
        });

        socket.on('redirectAwayFromConversation', () => {
            displayAlert(
                'error',
                'You and the correspondent are no longer following each other. This conversation will be deleted.'
            );

            setTimeout(() => {
                location.assign('/messages');
            }, 2500);
        });
    });
}

const updateMessagesNotification = () => {
    const conversationsCountEl = document.querySelector(
        '.main-buttons__conversations-count'
    );

    conversationsCountEl.classList.add('main-buttons__count--active');

    conversationsCountEl.textContent = ++conversationsCountEl.textContent;
};

const messageSubmitHandler = async (event, socket) => {
    event.preventDefault();

    const newMessageInput = document.querySelector('.new-message__input');

    if (messagesMainEl.dataset.newConversation === 'true') {
        const searchParams = new URLSearchParams(window.location.search);

        const data = {
            participants: [searchParams.get('newId')],
            message: {
                content: newMessageInput.value
            }
        };

        newMessageInput.value = '';

        const newConversationMessage = await createConversation(data);

        if (
            onlineUsers.some(
                (user) => user.userId === newConversationMessage.recipient
            )
        )
            sendMessageInRealtime(newConversationMessage, socket);

        return location.assign(
            `/messages/${newConversationMessage.conversationId}`
        );
    }

    const selectedConversationButton = document.querySelector(
        '.conversation--selected'
    );

    const content = newMessageInput.value;
    newMessageInput.value = '';

    const onlineUser = onlineUsers.find(
        (user) => user.userId === selectedConversationButton.dataset.userId
    );

    const data = {
        content,
        unread:
            !onlineUser ||
            onlineUser?.activeConversation !==
                selectedConversationButton.dataset.conversationId
    };

    const message = await storeMessage(
        messagesMainEl.dataset.conversationId,
        data
    );

    renderMessage(message, true);

    updateButton(
        document.querySelector(
            `.conversation[data-conversation-id='${message.conversationId}']`
        ),
        message.conversationId,
        message.content
    );

    if (onlineUsers.some((user) => user.userId === message.recipient))
        sendMessageInRealtime(message, socket);
};

// auth
const loginFormEl = document.querySelector('.login-form');
const signupFormEl = document.querySelector('.signup-form');
const logoutListItemEl = document.querySelector('.logout-list-item');

if (signupFormEl) {
    signupFormEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const authFormButtonEl = document.querySelector(
            '.auth-form__proceed-button'
        );

        authFormButtonEl.setAttribute('disabled', '');

        const username = document.querySelector(
            '.signup-form__name-field'
        ).value;
        const email = document.querySelector('.signup-form__email-field').value;
        const password = document.querySelector(
            '.signup-form__password-field'
        ).value;
        const confirmPassword = document.querySelector(
            '.signup-form__confirm-password-field'
        ).value;

        const res = await auth('signup', {
            username,
            email,
            password,
            confirmPassword
        });

        if (!res) {
            return authFormButtonEl.removeAttribute('disabled');
        }

        setTimeout(() => {
            location.assign('/');
        }, 1500);
    });
}

if (loginFormEl) {
    loginFormEl.addEventListener('submit', async (e) => {
        e.preventDefault();

        const authFormButtonEl = document.querySelector(
            '.auth-form__proceed-button'
        );
        authFormButtonEl.setAttribute('disabled', '');

        const email = document.querySelector('.login-form__email-field').value;
        const password = document.querySelector(
            '.login-form__password-field'
        ).value;

        const res = await auth('login', { email, password });

        if (!res) {
            return authFormButtonEl.removeAttribute('disabled');
        }

        setTimeout(() => {
            location.assign('/');
        }, 1500);
    });
}

if (logoutListItemEl) {
    logoutListItemEl.addEventListener('click', async () => {
        await logout();
        location.assign('/');
    });
}

// end of auth

// books
const bookFormEl = document.querySelector('.book-form');
const fullBookEl = document.querySelector('.full-book');
const editBookFormEl = document.querySelector('.edit-book-form');
const likesQuantityEl = document.querySelector('.book-card__likes-quantity');
const likeButtonEl = document.querySelector('.like-button');
const ratingInput = document.querySelector('.form__stars');
// const bookDropdownButtons = document.querySelectorAll(
//     '.full-book__dropdown-button'
// );

// const bookDeleteButtons = document.querySelectorAll(
//     '.full-book__book-delete-button'
// );

// bookDeleteButtons.forEach((elem) =>
//     elem.addEventListener('click', bookDeleteButtonClickHandler)
// );

// bookDropdownButtons.forEach((elem) =>
//     elem.addEventListener('click', bookDropdownButtonClickHandler)
// );

if (bookFormEl) {
    bookFormEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButtonEl = document.querySelector(
            '.book-form .button-primary'
        );

        const title = document.querySelector('.book-form__title-field').value;
        const author = document.querySelector('.book-form__author-field').value;

        const selectedStarElement = document.querySelector(
            '.form__star--selected'
        );

        let rating;
        if (selectedStarElement)
            rating = +selectedStarElement.getAttribute('data-index') + 1;

        const genre = document.querySelector('.book-form__genre-field').value;
        submitButtonEl.setAttribute('disabled', '');

        const response = await createBook({ title, author, rating, genre });

        if (!response) {
            return submitButtonEl.removeAttribute('disabled');
        }

        setTimeout(() => {
            location.assign('/profile');
        }, 1500);
    });
}

if (editBookFormEl) {
    editBookFormEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButtonEl = document.querySelector(
            '.edit-book-form .button-primary'
        );
        const id = editBookFormEl.dataset.id;
        const title = document.querySelector(
            '.edit-book-form__title-field'
        ).value;
        const author = document.querySelector(
            '.edit-book-form__author-field'
        ).value;

        const selectedStarElement = document.querySelector(
            '.form__star--selected'
        );

        let rating;
        if (selectedStarElement)
            rating = +selectedStarElement.getAttribute('data-index') + 1;
        const genre = document.querySelector(
            '.edit-book-form__genre-field'
        ).value;
        submitButtonEl.setAttribute('disabled', '');

        const response = await updateBook(id, { title, author, rating, genre });

        if (!response) {
            return submitButtonEl.removeAttribute('disabled');
        }

        setTimeout(() => {
            location.assign(
                `/${response.data.data.user.username}/books/${response.data.data._id}`
            );
        }, 1500);
    });
}

if (ratingInput) {
    ratingInput.addEventListener('mouseover', ratingMouseOverHandler);
    ratingInput.addEventListener('mouseleave', ratingMouseLeaveHandler);
    ratingInput.addEventListener('click', ratingClickHandler);
}

// end of books

// settings

if (settingsDetailsForm) {
    settingsDetailsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButtonEl = document.querySelector(
            '.settings-details-form .button-primary'
        );
        submitButtonEl.setAttribute('disabled', '');

        const formData = new FormData();

        formData.append(
            'username',
            document.querySelector('.settings-details-form__name-field').value
        );
        formData.append(
            'email',
            document.querySelector('.settings-details-form__email-field').value
        );
        formData.append(
            'profilePhoto',
            document.querySelector('.settings-details-form__photo-upload')
                .files[0]
        );

        const response = await updateUser(formData);

        if (!response) {
            return submitButtonEl.removeAttribute('disabled');
        }

        setTimeout(() => {
            location.reload();
        }, 1500);
    });

    settingsPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButtonEl = document.querySelector(
            '.settings-password-form .button-primary'
        );

        const currentPassword = document.querySelector(
            '.settings-password-form__current-password-field'
        ).value;
        const password = document.querySelector(
            '.settings-password-form__password-field'
        ).value;
        const confirmPassword = document.querySelector(
            '.settings-password-form__confirm-password-field'
        ).value;

        submitButtonEl.setAttribute('disabled', '');

        await updatePassword({
            currentPassword,
            password,
            confirmPassword
        });

        clearPasswordInputFields();
        submitButtonEl.removeAttribute('disabled');
    });

    settingsDeleteButton.addEventListener('click', (e) => {
        displayConfirmationModal(
            'Are you sure you want to delete your account?',
            async () => {
                settingsDeleteButton.setAttribute('disabled', '');
                const response = await deleteUser();

                if (!response) {
                    return settingsDeleteButton.removeAttribute('disabled');
                }

                setTimeout(() => {
                    location.assign('/');
                }, 1500);
            }
        );
    });
}
