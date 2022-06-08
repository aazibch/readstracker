import 'core-js/stable';
import 'regenerator-runtime/runtime';
import Masonry from 'masonry-layout';
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
    getFeedBooks,
    renderFeedBooks,
    bookDropdownButtonClickHandler
} from './books';
import { updateUser, deleteUser, updatePassword } from './users';
import { displayConfirmationModal } from './modals';
import {
    displayListModal,
    hideListModal,
    hideConfirmationModal
} from './modals';
import { search, hideSearchDropdown } from './search';
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

const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');
const bookForm = document.querySelector('.book-form');
const logoutListItem = document.querySelector('.logout-list-item');
const ratingInput = document.querySelector('.form__stars');
const fullBook = document.querySelector('.full-book');
const editBookForm = document.querySelector('.edit-book-form');
const settingsDetailsForm = document.querySelector('.settings-details-form');
const settingsPasswordForm = document.querySelector('.settings-password-form');
const settingsDeleteButton = document.querySelector('.settings-delete-button');
const searchUsersField = document.querySelector('.search-users__input-field');
const bookDropdown = document.querySelector('.full-book__dropdown');
const bookDropdownButton = document.querySelector(
    '.full-book__dropdown-button'
);
const listModalCloseButtons = document.querySelectorAll(
    '.list-modal__close-button'
);
const followButton = document.querySelector('.connect-buttons__follow-button');
const unfollowButton = document.querySelector(
    '.connect-buttons__unfollow-button'
);
const socket = io();

// General
const attachHandlersToConfirmationModalCloseButtons = () => {
    const elements = [
        document.querySelector('.confirmation-modal__no-button'),
        document.querySelector('.confirmation-modal__close-button')
    ];

    for (let i in elements) {
        elements[i].addEventListener('click', hideConfirmationModal);
    }
};

attachHandlersToConfirmationModalCloseButtons();

const listModalCloseButtonHandler = () => {
    console.log('listModalCloseButton clicked');

    const listModals = document.querySelectorAll('.list-modal');

    listModals.forEach((elem) => {
        if (elem.classList.contains('list-modal--active'))
            elem.classList.remove('list-modal--active');
    });

    // hideListModal();
};

listModalCloseButtons.forEach((elem) =>
    elem.addEventListener('click', listModalCloseButtonHandler)
);

// Home

const feedBooksEl = document.querySelector('.feed__books');

if (feedBooksEl) {
    const feedLoadingSpinnerEl = document.querySelector(
        '.feed__loading-spinner'
    );

    feedLoadingSpinnerEl.classList.add('loading-spinner--active');

    getFeedBooks().then((books) => {
        renderFeedBooks(books);

        document
            .querySelectorAll('.full-book__dropdown')
            .forEach((el) =>
                el.addEventListener('click', bookDropdownButtonClickHandler)
            );

        feedLoadingSpinnerEl.classList.remove('loading-spinner--active');
    });
}

// Profile
const connectionsEl = document.querySelector('.connections');

const followersButton = document.querySelector(
    '.users-list-triggers__followers'
);
const followingButton = document.querySelector(
    '.users-list-triggers__following'
);

const followingListModalEl = document.querySelector('.following-list-modal');
const followersListModalEl = document.querySelector('.followers-list-modal');

if (followersButton) {
    followersButton.addEventListener('click', (e) => {
        followersListModalEl.classList.add('list-modal--active');

        // displayListModal('Followers', async () => {
        //     return await getFollowers(connectionsEl.dataset.userId);
        // });
    });
}

if (followingButton) {
    followingButton.addEventListener('click', () => {
        followingListModalEl.classList.add('list-modal--active');

        // displayListModal('Following', async () => {
        //     return await getAccountsFollowing(connectionsEl.dataset.userId);
        // });
    });
}

if (followButton) {
    followButton.addEventListener('click', () => {
        const userId = connectionsEl.dataset.userId;

        followUser(userId);
    });
}

if (unfollowButton) {
    unfollowButton.addEventListener('click', async () => {
        const followingId = connectionsEl.dataset.followingId;
        const { userId, conversationId } = connectionsEl.dataset;

        const res = await unfollowUser(followingId);

        if (res.status !== 204) return;

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

        location.reload();
    });
}

const userId = localStorage.getItem('userId');

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

// working
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
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

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

        auth('signup', { username, email, password, confirmPassword });
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.querySelector('.login-form__email-field').value;
        const password = document.querySelector(
            '.login-form__password-field'
        ).value;

        auth('login', { email, password });
    });
}

if (logoutListItem) {
    logoutListItem.addEventListener('click', function () {
        logout();
    });
}

// end of auth

// books

if (bookForm) {
    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.querySelector('.book-form__title-field').value;
        const author = document.querySelector('.book-form__author-field').value;

        const selectedStarElement = document.querySelector(
            '.form__star--selected'
        );

        let rating;
        if (selectedStarElement)
            rating = +selectedStarElement.getAttribute('data-index') + 1;

        const genre = document.querySelector('.book-form__genre-field').value;

        createBook({ title, author, rating, genre });
    });
}

if (editBookForm) {
    editBookForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = editBookForm.getAttribute('data-id');
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

        updateBook(id, { title, author, rating, genre });
    });
}

if (ratingInput) {
    ratingInput.addEventListener('mouseover', ratingMouseOverHandler);
    ratingInput.addEventListener('mouseleave', ratingMouseLeaveHandler);
    ratingInput.addEventListener('click', ratingClickHandler);
}

if (fullBook) {
    bookDropdownButton.addEventListener(
        'click',
        bookDropdownButtonClickHandler
    );

    document
        .querySelector('.full-book__book-delete-button')
        .addEventListener('click', (e) => {
            displayConfirmationModal(
                'Are you sure you want to delete the book?',
                () => {
                    const bookId = fullBook.getAttribute('data-id');
                    deleteBook(bookId);
                }
            );
        });
}

const likesQuantityEl = document.querySelector('.book-card__likes-quantity');
const likesListModal = document.querySelector('.likes-list-modal');

if (likesQuantityEl) {
    likesQuantityEl.addEventListener('click', (e) => {
        likesListModal.classList.add('list-modal--active');
    });
}

const likeButtonEl = document.querySelector('.like-button');

if (likeButtonEl) {
    likeButtonEl.addEventListener('click', (e) => {
        if (e.target.dataset.action === 'like') {
            likeBook(fullBook.dataset.id);
        }

        if (e.target.dataset.action === 'unlike') {
            unlikeBook(fullBook.dataset.id);
        }
    });
}

// end of books

// settings

if (settingsDetailsForm) {
    settingsDetailsForm.addEventListener('submit', (e) => {
        e.preventDefault();

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

        updateUser(formData);
    });

    settingsPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const currentPassword = document.querySelector(
            '.settings-password-form__current-password-field'
        ).value;
        const password = document.querySelector(
            '.settings-password-form__password-field'
        ).value;
        const confirmPassword = document.querySelector(
            '.settings-password-form__confirm-password-field'
        ).value;

        updatePassword({
            currentPassword,
            password,
            confirmPassword
        });
    });

    settingsDeleteButton.addEventListener('click', (e) => {
        displayConfirmationModal(
            'Are you sure you want to delete your account?',
            () => {
                deleteUser();
            }
        );
    });
}

// end of settings

// general

const userButtonEl = document.querySelector('.main-nav__user-button');
const userMenuEl = document.querySelector('.user-menu');

if (userButtonEl) {
    userButtonEl.addEventListener('click', (e) => {
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

    console.log({ activeUserMenu });

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
});

if (searchUsersField) {
    let inputLength = 0;

    searchUsersField.addEventListener('keydown', (e) => {
        inputLength = e.target.value.length;
    });

    searchUsersField.addEventListener('keyup', (e) => {
        if (e.target.value.length !== inputLength) {
            if (e.target.value.length === 0) return hideSearchDropdown();

            search(e.target.value);
        }
    });
}

// end of general

// Masonry.js
const initializeMasonry = () => {
    const booksGrid = document.querySelector('.books-grid');

    if (booksGrid) {
        new Masonry(booksGrid, {
            itemSelector: '.books-grid-item',
            columnWidth: '.books-grid-sizer',
            percentPosition: true
        });
    }
};

initializeMasonry();

// Reinitializing because the delay in loading font awesome messes up the layout.
setTimeout(initializeMasonry, 2000);

// End of Masonry.js config
