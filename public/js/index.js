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
import { displayConfirmationModal } from './confirmationModals';
import { displayListModal, hideListModal } from './listModals';
import { search, hideSearchDropdown } from './search';
import {
    createConversation,
    sendMessage,
    renderMessage,
    displayOnlineIndicators,
    deleteConversation
} from './messages';
import {
    getAccountsFollowing,
    getFollowers,
    followButtonHandler,
    unfollowButtonHandler
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
const newMessageForm = document.querySelector('.new-message__form');
const conversationContentEl = document.querySelector('.conversation-content');
const bookDropdown = document.querySelector('.full-book__dropdown');
const bookDropdownButton = document.querySelector(
    '.full-book__dropdown-button'
);
const connectionsEl = document.querySelector('.connections');
const listModalEl = document.querySelector('.list-modal');
const followButton = document.querySelector('.connect-buttons__follow-button');
const unfollowButton = document.querySelector(
    '.connect-buttons__unfollow-button'
);
// const messageButton = document.querySelector(
//     '.connect-buttons__message-button'
// );
const deleteConvoButton = document.querySelector(
    '.conversation__delete-button'
);

if (connectionsEl) {
    const followersButton = document.querySelector(
        '.users-list-triggers__followers'
    );
    const followingButton = document.querySelector(
        '.users-list-triggers__following'
    );

    if (followersButton) {
        followersButton.addEventListener('click', (e) => {
            displayListModal('Followers', getFollowers);
        });
    }

    if (followingButton) {
        followingButton.addEventListener('click', () => {
            displayListModal('Following', getAccountsFollowing);
        });
    }

    if (followButton) {
        followButton.addEventListener('click', followButtonHandler);
    }

    if (unfollowButton) {
        unfollowButton.addEventListener('click', unfollowButtonHandler);
    }
}

if (listModalEl) {
    document
        .querySelector('.list-modal__close-button')
        .addEventListener('click', () => {
            hideListModal();
        });
}

const userId = localStorage.getItem('userId');

// messages

const createConvoButton = (data) => {
    const convosEl = document.querySelector('.conversations');

    convosEl.insertAdjacentHTML(
        'afterbegin',
        `<a href='/messages/${data.convoId}' class='conversation conversation--new' data-user-id='${data.sender._id}' data-convo-id='${data.convoId}'>
            <img src='/images/users/${data.sender.profilePhoto}' data-image=${data.sender.profilePhoto}) class='user-photo'>
            <div>
                <p class='conversation__username'>${data.sender.username}</p>
                <div class='conversation__online-indicator'></div>
                <p class='conversation__extract'></p>
            </div>
            <div class='conversation__notification-indicator-container'>
                <div class='conversation__notification-indicator conversation__notification-indicator--active'></div>
            </div>
        </a>`
    );
};

if (userId) {
    const socket = io();

    socket.on('connect', () => {
        let onlineUsers;

        const convoId = newMessageForm
            ? newMessageForm.getAttribute('data-convo-id')
            : null;

        socket.emit('saveUser', userId);

        if (conversationContentEl) {
            conversationContentEl.scrollTop =
                conversationContentEl.scrollHeight;
        }

        socket.on('onlineUsers', (users) => {
            onlineUsers = [...users];

            console.log('onlineUsers', onlineUsers);

            displayOnlineIndicators(onlineUsers);
        });

        // Render message or notification badge.
        socket.on('chatMessage', (data) => {
            const messageForm = document.querySelector(
                `.new-message__form[data-convo-id='${data.convoId}']`
            );

            const convoButton = document.querySelector(
                `.conversation[data-convo-id='${data.convoId}']`
            );

            console.log('[chatMessage]', { convoButton, messageForm });

            if (messageForm) {
                renderMessage(data, false);
            } else if (convoButton) {
                const clone = convoButton.cloneNode(true);
                const convosEl = document.querySelector('.conversations');

                convoButton.remove();

                convosEl.insertAdjacentElement('afterbegin', clone);

                document
                    .querySelector(
                        `.conversation[data-convo-id='${data.convoId}']`
                    )
                    .classList.add('conversation--new');
            } else {
                createConvoButton(data);
                console.log(
                    '[if conditional else createConvoButton] data',
                    data
                );
            }
        });

        if (newMessageForm) {
            newMessageForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                if (newMessageForm.getAttribute('data-new-convo') === 'true') {
                    const searchParams = new URLSearchParams(
                        window.location.search
                    );

                    const data = {
                        participant: searchParams.get('newId'),
                        message: {
                            content: e.target.children[0].value
                        }
                    };

                    const newConvo = await createConversation(data, socket);

                    location.assign(`/messages/${newConvo._id}`);
                } else {
                    const convoId = newMessageForm.dataset.convoId;

                    const data = {
                        content: e.target.children[0].value
                    };

                    sendMessage(convoId, data, socket);
                }

                e.target.children[0].value = '';
            });
        }

        if (deleteConvoButton) {
            deleteConvoButton.addEventListener('click', () => {
                displayConfirmationModal(
                    'Are you sure you want to delete this conversation?',
                    () => {
                        const convoId = newMessageForm.dataset.convoId;

                        deleteConversation(convoId);
                    }
                );
            });
        }
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
