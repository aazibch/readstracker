import 'core-js/stable';
import 'regenerator-runtime/runtime';
import {
    ratingMouseOverHandler,
    ratingMouseLeaveHandler,
    ratingClickHandler
} from './ratingInput';

import { auth, recoverPassword, logout } from './auth';
import {
    createBook,
    updateBook,
    getHomeFeedBooks,
    getProfileFeedBooks,
    renderFeedBooks,
    attachBooksEventListeners,
    commentDeleteButtonClickHandler,
    createComment,
    renderComment
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

const forgotPasswordFormEl = document.querySelector('.forgot-password-form');

if (forgotPasswordFormEl) {
    forgotPasswordFormEl.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButtonEl = document.querySelector(
            '.forgot-password-form__submit-button'
        );
        submitButtonEl.setAttribute('disabled', '');

        const emailInput = document.querySelector(
            '.forgot-password-form__email-field'
        );
        const email = emailInput.value;

        const res = await recoverPassword('forgotPassword', { email });

        if (res) {
            emailInput.value = '';
        }

        submitButtonEl.removeAttribute('disabled');
    });
}

const resetPasswordFormEl = document.querySelector('.reset-password-form');

if (resetPasswordFormEl) {
    resetPasswordFormEl.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButtonEl = document.querySelector(
            '.reset-password-form__submit-button'
        );
        submitButtonEl.setAttribute('disabled', '');

        const passwordInput = document.querySelector(
            '.reset-password-form__password-field'
        );
        const confirmPasswordInput = document.querySelector(
            '.reset-password-form__confirm-password-field'
        );

        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        const searchParams = new URLSearchParams(window.location.search);

        const res = await recoverPassword('resetPassword', {
            password,
            confirmPassword,
            token: searchParams.get('token')
        });

        passwordInput.value = '';
        confirmPasswordInput.value = '';

        if (!res) {
            submitButtonEl.removeAttribute('disabled');
        }

        setTimeout(() => {
            location.assign('/');
        }, 2000);
    });
}

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

if (resSearchToggleEl) {
    resSearchToggleEl.addEventListener('click', (e) => {
        siteHeaderEl.classList.toggle('header--res-search-active');
    });
}

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
        '.book-card__dropdown--active'
    );

    if (
        !e.target.closest('.book-card__dropdown-menu') &&
        !e.target.closest('.book-card__dropdown-button') &&
        activeBookDropdownEl
    ) {
        activeBookDropdownEl.classList.remove('book-card__dropdown--active');
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

const searchUsersFieldEl = document.querySelector('.search-users__input-field');

if (searchUsersFieldEl) {
    searchUsersFieldEl.addEventListener('keydown', searchUsersKeydownHandler);
    searchUsersFieldEl.addEventListener('keyup', searchUsersKeyupHandler);
}

// Home
const feedLoadingSpinnerEl = document.querySelector('.feed__loading-spinner');
const homeFeedEl = document.querySelector('.home-feed');

if (homeFeedEl) {
    getHomeFeedBooks().then((response) => {
        feedLoadingSpinnerEl.classList.remove('loading-spinner--active');

        if (!response) {
            return homeFeedEl.insertAdjacentHTML(
                'afterbegin',
                `
                <p class='app-message app-message__large'>An error occurred. Reload the page to try again.</p>
            `
            );
        }

        if (response.data.data.length === 0) {
            return homeFeedEl.insertAdjacentHTML(
                'afterbegin',
                `
                <p class='app-message app-message__large'>No books to show. Follow people to improve your experience.</p>
            `
            );
        } else {
            renderFeedBooks('.home-feed', response.data.data);
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

const profileFeedEl = document.querySelector(
    '.profile-body__content .feed__books'
);

if (profileFeedEl) {
    getProfileFeedBooks(connectionsEl.dataset.userId).then((response) => {
        feedLoadingSpinnerEl.classList.remove('loading-spinner--active');

        if (!response) {
            return profileFeedEl.insertAdjacentHTML(
                'afterbegin',
                `
                <p class='app-message app-message__large'>An error occurred. Reload the page to try again.</p>
            `
            );
        }

        if (response.data.data.length === 0) {
            return profileFeedEl.insertAdjacentHTML(
                'afterbegin',
                `
                <p class='app-message app-message__large'>No books to show. Add books to display them on your profile.</p>
            `
            );
        } else {
            renderFeedBooks(
                '.profile-body__content .feed__books',
                response.data.data
            );
            attachBooksEventListeners();
        }
    });
}

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
        }, 2000);
    });
}

if (unfollowButtonEl) {
    unfollowButtonEl.addEventListener('click', async () => {
        const { userId, conversationId, followingId } = connectionsEl.dataset;

        unfollowButtonEl.setAttribute('disabled', '');
        const res = await unfollowUser(followingId);

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
        }, 2000);
    });
}

// Messages
const conversationContentEl = document.querySelector('.conversation__content');

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

    const messageSubmitButton = document.querySelector(
        '.new-message__form input[type="submit"]'
    );

    messageSubmitButton.setAttribute('disabled', 'true');

    const message = await storeMessage(
        messagesMainEl.dataset.conversationId,
        data
    );

    messageSubmitButton.removeAttribute('disabled');

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
        }, 2000);
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
            document.querySelector('.login-form__password-field').value = '';
            return authFormButtonEl.removeAttribute('disabled');
        }

        setTimeout(() => {
            location.assign('/');
        }, 2000);
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
const editBookFormEl = document.querySelector('.edit-book-form');
const ratingInput = document.querySelector('.form__stars');
const bookReviewInputEl = document.querySelector('.form__review-input');
const bookCardFullEl = document.querySelector('.book-card__full');

if (bookReviewInputEl) {
    const charCountEl = document.querySelector('.form__review-char-count');

    charCountEl.textContent = bookReviewInputEl.value.length;

    bookReviewInputEl.addEventListener('keyup', (e) => {
        charCountEl.textContent = e.target.value.length;
    });
}

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
        const review =
            document.querySelector('.book-form__review-input').value.length > 0
                ? document.querySelector('.book-form__review-input').value
                : null;

        submitButtonEl.setAttribute('disabled', '');

        const response = await createBook({
            title,
            author,
            rating,
            genre,
            review
        });

        if (!response) {
            return submitButtonEl.removeAttribute('disabled');
        }

        setTimeout(() => {
            location.assign('/profile');
        }, 2000);
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

        const review =
            document.querySelector('.edit-book-form__review-input').value
                .length > 0
                ? document.querySelector('.edit-book-form__review-input').value
                : null;

        const response = await updateBook(id, {
            title,
            author,
            rating,
            genre,
            review
        });

        if (!response) {
            return submitButtonEl.removeAttribute('disabled');
        }

        setTimeout(() => {
            location.assign(
                `/${response.data.data.user.username}/books/${response.data.data._id}`
            );
        }, 2000);
    });
}

if (ratingInput) {
    ratingInput.addEventListener('mouseover', ratingMouseOverHandler);
    ratingInput.addEventListener('mouseleave', ratingMouseLeaveHandler);
    ratingInput.addEventListener('click', ratingClickHandler);
}

if (bookCardFullEl) {
    const bookCommentForm = document.querySelector('.book-card__comment-form');
    const bookCommentDelButtonEls = document.querySelectorAll(
        '.book-card__comment-delete-button'
    );
    const commentInputEl = document.querySelector('.book-card__comment-input');

    for (let el of bookCommentDelButtonEls) {
        el.addEventListener('click', commentDeleteButtonClickHandler);
    }

    bookCommentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formSubmitButtonEl = document.querySelector(
            '.book-card__comment-form input[type="submit"]'
        );
        const bookId = bookCardFullEl.id.split(':')[1];
        const bookOwnerId = bookCardFullEl.dataset.owner;
        const input = commentInputEl.value;

        formSubmitButtonEl.setAttribute('disabled', '');

        const response = await createComment(bookId, { content: input });
        commentInputEl.value = '';

        if (response) {
            renderComment(response.data.data, bookOwnerId);

            const commentDeleteButton = document.querySelector(
                `#book-card__comment-delete-button\\:${response.data.data._id}`
            );

            const commentsCountEl = document.querySelector(
                '.book-card__comments-count'
            );

            const newCommentCount =
                +commentsCountEl.innerText.split(' ')[0] + 1;

            commentsCountEl.innerText = `${newCommentCount} Comment${
                newCommentCount === 1 ? '' : 's'
            }`;

            if (commentDeleteButton) {
                commentDeleteButton.addEventListener(
                    'click',
                    commentDeleteButtonClickHandler
                );
            }
        }

        formSubmitButtonEl.removeAttribute('disabled');
    });

    const bookCommentButtonEl = document.querySelector(
        '.book-card__comment-button'
    );

    bookCommentButtonEl.addEventListener('click', (e) => {
        commentInputEl.focus();
    });
}

// end of books

// settings
const settingsDetailsFormEl = document.querySelector('.settings-details-form');
const settingsPasswordFormEl = document.querySelector(
    '.settings-password-form'
);
const settingsDeleteButtonEl = document.querySelector(
    '.settings-delete-button'
);

if (settingsDetailsFormEl) {
    settingsDetailsFormEl.addEventListener('submit', async (e) => {
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
        }, 2000);
    });
}

if (settingsPasswordFormEl) {
    settingsPasswordFormEl.addEventListener('submit', async (e) => {
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
}
if (settingsDeleteButtonEl) {
    settingsDeleteButtonEl.addEventListener('click', (e) => {
        displayConfirmationModal(
            'Are you sure you want to delete your account?',
            async () => {
                settingsDeleteButtonEl.setAttribute('disabled', '');
                const response = await deleteUser();

                if (!response) {
                    return settingsDeleteButton.removeAttribute('disabled');
                }

                setTimeout(() => {
                    location.assign('/');
                }, 2000);
            }
        );
    });
}
