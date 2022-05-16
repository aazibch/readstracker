import 'core-js/stable';
import 'regenerator-runtime/runtime';
import Masonry from 'masonry-layout';
import {
    ratingMouseOverHandler,
    ratingMouseLeaveHandler,
    ratingClickHandler
} from './ratingInput';

import { auth, logout } from './auth';
import { createBook, updateBook, deleteBook } from './books';
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

const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');
const bookForm = document.querySelector('.book-form');
const logoutListItem = document.querySelector('.logout-list-item');
const ratingInput = document.querySelector('.form__stars');
const fullBook = document.querySelector('.full-book');
const editBookForm = document.querySelector('.edit-book-form');
const userDropdownButton = document.querySelector('.main-nav__user-button');
const settingsDetailsForm = document.querySelector('.settings-details-form');
const settingsPasswordForm = document.querySelector('.settings-password-form');
const settingsDeleteButton = document.querySelector('.settings-delete-button');
const searchUsersField = document.querySelector('.search-users__input-field');
const bookDropdown = document.querySelector('.full-book__dropdown');
const bookDropdownButton = document.querySelector(
    '.full-book__dropdown-button'
);
const listModalCloseButton = document.querySelector(
    '.list-modal__close-button'
);
const followButton = document.querySelector('.connect-buttons__follow-button');
const unfollowButton = document.querySelector(
    '.connect-buttons__unfollow-button'
);

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

listModalCloseButton.addEventListener('click', () => {
    hideListModal();
});

// Profile
const connectionsEl = document.querySelector('.connections');

const followersButton = document.querySelector(
    '.users-list-triggers__followers'
);
const followingButton = document.querySelector(
    '.users-list-triggers__following'
);

if (followersButton) {
    followersButton.addEventListener('click', (e) => {
        displayListModal('Followers', async () => {
            return await getFollowers(connectionsEl.dataset.userId);
        });
    });
}

if (followingButton) {
    followingButton.addEventListener('click', () => {
        displayListModal('Following', async () => {
            return await getAccountsFollowing(connectionsEl.dataset.userId);
        });
    });
}

if (followButton) {
    followButton.addEventListener('click', () => {
        const userId = connectionsEl.dataset.userId;

        followUser(userId);
    });
}

if (unfollowButton) {
    unfollowButton.addEventListener('click', () => {
        const followingId = connectionsEl.dataset.followingId;

        unfollowUser(followingId);
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

if (userId) {
    const socket = io();

    socket.on('connect', () => {
        let onlineUsers;

        socket.emit('saveUser', userId);

        socket.on('onlineUsers', (users) => {
            onlineUsers = [...users];

            console.log('onlineUsers', onlineUsers);
            displayOnlineIndicators(onlineUsers);
        });

        // Submit listener for new message form
        const newMessageForm = document.querySelector('.new-message__form');

        if (newMessageForm) {
            newMessageForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const newMessageInput = document.querySelector(
                    '.new-message__input'
                );

                if (messagesMainEl.dataset.newConversation === 'true') {
                    const searchParams = new URLSearchParams(
                        window.location.search
                    );

                    const data = {
                        participants: [searchParams.get('newId')],
                        message: {
                            content: newMessageInput.value
                        }
                    };

                    newMessageInput.value = '';

                    const newConversationMessage = await createConversation(
                        data
                    );

                    console.log(
                        '[index.js] returned data from createConversation() function',
                        newConversationMessage
                    );

                    sendMessageInRealtime(newConversationMessage, socket);

                    return location.assign(
                        `/messages/${newConversationMessage.conversationId}`
                    );
                }

                const content = newMessageInput.value;
                newMessageInput.value = '';

                const message = await storeMessage(
                    messagesMainEl.dataset.conversationId,
                    { content }
                );

                console.log(
                    '[index.js] returned data from storeMessage() function',
                    message
                );

                renderMessage(message, true);

                updateButton(
                    document.querySelector(
                        `.conversation[data-conversation-id='${message.conversationId}']`
                    ),
                    message.conversationId,
                    message.content
                );

                sendMessageInRealtime(message, socket);
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

            console.log('[index.js] chatMessage listener incoming data', data);

            // Means the user has the conversation open, render message
            if (messagesMainEl) {
                renderMessage(data, false);
            }

            // Move the conversation button (link) to the top
            if (conversationButtonEl) {
                updateButton(
                    conversationButtonEl,
                    data.conversationId,
                    data.content
                );
            } else {
                // New conversation, create conversation button. (still testing)
                createConversationButton(data);
            }
        });
    });
}

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
    bookDropdownButton.addEventListener('click', (e) => {
        if (!bookDropdown.classList.contains('full-book__dropdown--active')) {
            return bookDropdown.classList.add('full-book__dropdown--active');
        }

        bookDropdown.classList.remove('full-book__dropdown--active');
    });

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

if (userDropdownButton) {
    userDropdownButton.addEventListener('click', (e) => {
        const el = document.querySelector('.main-nav__dropdown');
        const activeClass = 'main-nav__dropdown--active';

        if (el.classList.contains(activeClass)) {
            el.classList.remove(activeClass);
        } else {
            el.classList.add(activeClass);
        }
    });
}

window.addEventListener('click', function (e) {
    const dropdownMenuContainer = document.querySelector(
        '.main-nav__dropdown-menu-container'
    );

    if (
        dropdownMenuContainer &&
        !dropdownMenuContainer.contains(e.target) &&
        !userDropdownButton.contains(e.target)
    ) {
        document
            .querySelector('.main-nav__dropdown')
            .classList.remove('main-nav__dropdown--active');
    }

    if (
        bookDropdown &&
        !bookDropdown.contains(e.target) &&
        !bookDropdownButton.contains(e.target)
    ) {
        bookDropdown.classList.remove('full-book__dropdown--active');
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
