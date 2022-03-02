import 'core-js/stable';
import 'regenerator-runtime/runtime';
import Masonry from 'masonry-layout';
import {
    ratingMouseOverHandler,
    ratingMouseLeaveHandler,
    ratingClickHandler
} from './ratingInput';
import { manageUserData } from './users';
import { managePasswordRecovery } from './managePasswordRecovery';
import { manageQuickSearch, showSearchDropdown } from './manageQuickSearch';
import { manageMessages, renderMessage } from './manageMessages';

import { auth, logout } from './auth';
import { createBook, updateBook, deleteBook } from './books';
import { updateUser, deleteUser, updatePassword } from './users';
import { displayConfirmationModal } from './confirmationModal';
import { modifyClassOnElement } from './utils';

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
const forgotPasswordForm = document.querySelector('#forgot-password-form');
const passwordRecoveryForm = document.querySelector('#password-recovery-form');
const searchUsersField = document.querySelector('.search-users__input-field');
const newMessageForm = document.querySelector('.new-message__form');
const conversationContentEl = document.querySelector('.conversation-content');

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.querySelector('.signup-form__name-field').value;
        const email = document.querySelector('.signup-form__email-field').value;
        const password = document.querySelector('.signup-form__password-field').value;
        const confirmPassword = document.querySelector('.signup-form__confirm-password-field').value;

        auth('signup', { username, email, password, confirmPassword });
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.querySelector('.login-form__email-field').value;
        const password = document.querySelector('.login-form__password-field').value;

        auth('login', { email, password });
    });
}

if (userDropdownButton) {
    userDropdownButton.addEventListener('click', (e) => {
        const el = document.querySelector('.main-nav__dropdown');
        const activeClass = 'main-nav__dropdown--active';

        if (el.classList.contains(activeClass)) {
            modifyClassOnElement(el, activeClass, 'remove');
        } else {
            modifyClassOnElement(el, activeClass, 'add');
        }
    });
}

if (logoutListItem) {
    logoutListItem.addEventListener('click', function () {
        logout();
    });
}

// Books functionality

if (bookForm) {
    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.querySelector('.book-form__title-field').value;
        const author = document.querySelector('.book-form__author-field').value;

        const selectedStarElement = document.querySelector(
            '.form__star--selected'
        );

        let rating;
        if (selectedStarElement) rating = +selectedStarElement.getAttribute('data-index') + 1;
        
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
        if (selectedStarElement) rating = +selectedStarElement.getAttribute('data-index') + 1;
        const genre = document.querySelector('.edit-book-form__genre-field').value;

        updateBook(id, { title, author, rating, genre });
    });
}

// Book page

if (fullBook) {
    const bookDropdownButton = document.querySelector(
        '.full-book__dropdown-button'
    );

    bookDropdownButton.addEventListener('click', (e) => {
        if (
            document.querySelector('.full-book__dropdown-menu').style
                .display === '' ||
            document.querySelector('.full-book__dropdown-menu').style
                .display === 'none'
        ) {
            return document.querySelector(
                '.full-book__dropdown-menu'
            ).style.display = 'block';
        }

        document.querySelector(
            '.full-book__dropdown-menu'
        ).style.display = 'none';
    });

    document
        .querySelector('.full-book__book-delete-button')
        .addEventListener('click', (e) => {
            displayConfirmationModal('Are you sure you want to delete the book?', () => {
                const bookId = fullBook.getAttribute('data-id');
                deleteBook(bookId);
            });
        });
}

// Settings page

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

// Unfactored

if (newMessageForm) {
    const socket = io();

    const convoId = newMessageForm.getAttribute('data-convo-id');

    socket.emit('saveUser', convoId);

    socket.on('onlineUsers', (users) => {
        console.log('onlineUsers', users);
    });

    socket.on('chatMessage', (message) => {
        renderMessage(message, false);
    });

    conversationContentEl.scrollTop = conversationContentEl.scrollHeight;

    newMessageForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = {
            content: e.target.children[0].value
        };

        e.target.children[0].value = '';

        manageMessages(
            'POST',
            e.target.getAttribute('data-convo-id'),
            data,
            socket
        );
    });
}

if (ratingInput) {
    ratingInput.addEventListener('mouseover', ratingMouseOverHandler);
    ratingInput.addEventListener('mouseleave', ratingMouseLeaveHandler);
    ratingInput.addEventListener('click', ratingClickHandler);
}

window.addEventListener('click', function (e) {
    if (
        document.querySelector('.main-nav__dropdown-menu-container') &&
        !document
            .querySelector('.main-nav__dropdown-menu-container')
            .contains(e.target) &&
        !userDropdownButton.contains(e.target)
    ) {
        modifyClassOnElement(
            document.querySelector('.main-nav__dropdown'),
            'main-nav__dropdown--active',
            'remove'
        );
    }

    const bookDropdownMenu = document.querySelector(
        '.full-book__dropdown-menu'
    );

    if (bookDropdownMenu) {
        if (
            !bookDropdownMenu.contains(e.target) &&
            !document
                .querySelector('.full-book__dropdown-button')
                .contains(e.target)
        ) {
            bookDropdownMenu.style.display = 'none';
        }
    }
});

// Masonry.js config
const initializeMasonry = () => {
    const booksGrid = document.querySelector('.books-grid');

    if (booksGrid) {
        const masonry = new Masonry(booksGrid, {
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

if (searchUsersField) {
    let inputLength = 0;

    searchUsersField.addEventListener('keydown', (e) => {
        inputLength = e.target.value.length;
    });

    searchUsersField.addEventListener('keyup', (e) => {
        if (e.target.value.length !== inputLength) {
            if (e.target.value.length === 0) return showSearchDropdown(false);

            console.log(e.target.value);
            manageQuickSearch(e.target.value);
        }
    });
}
