import 'core-js/stable';
import 'regenerator-runtime/runtime';
import Masonry from 'masonry-layout';
import { signupOrLogin, logout } from './signupOrLogin';
import {
    ratingMouseOverHandler,
    ratingMouseLeaveHandler,
    ratingClickHandler
} from './ratingInput';
import {
    prepareConfirmationModal,
    displayConfirmationModal
} from './deleteConfirmationModal';
import { manageBookData } from './manageBookData';
import { manageNotesData, noteDeleteClickHandler } from './manageNotesData';
import { manageUserData } from './manageUserData';
import { managePasswordRecovery } from './managePasswordRecovery';
import { manageQuickSearch, showSearchDropdown } from './manageQuickSearch';

const loginForm = document.querySelector('#login-form');
const signupForm = document.querySelector('#signup-form');
const bookForm = document.querySelector('#book-form');
const logoutListItem = document.querySelector('#logout-list-item');
const ratingInput = document.querySelector('#form__stars');
const fullBook = document.querySelector('#full-book');
const editBookForm = document.querySelector('#edit-book-form');
const userDropdownButton = document.querySelector('#main-nav__user-button');
const settingsDetailsForm = document.querySelector('#settings-details-form');
const settingsPasswordForm = document.querySelector('#settings-password-form');
const settingsDeleteButton = document.querySelector('#settings-delete-button');
const forgotPasswordForm = document.querySelector('#forgot-password-form');
const passwordRecoveryForm = document.querySelector('#password-recovery-form');
const searchUsersField = document.querySelector('#search-users__input-field');

const modifyClassOnElement = (el, className, action) => {
    if (action === 'remove') {
        el.classList.remove(className);
    } else if (action === 'add') {
        el.classList.add(className);
    }
};

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.querySelector(
            '#signup-form__name-field'
        ).value;
        const email = document.querySelector('#signup-form__email-field').value;
        const password = document.querySelector(
            '#signup-form__password-field'
        ).value;
        const confirmPassword = document.querySelector(
            '#signup-form__confirm-password-field'
        ).value;

        signupOrLogin('signup', { username, email, password, confirmPassword });
    });
}

if (passwordRecoveryForm) {
    passwordRecoveryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let token = window.location.href.split('/');
        token = token[token.length - 1];
        const password = document.querySelector(
            '#password-recovery-form__password-field'
        ).value;
        const confirmPassword = document.querySelector(
            '#password-recovery-form__confirm-password-field'
        ).value;

        managePasswordRecovery('reset', 'PATCH', {
            token,
            password,
            confirmPassword
        });
    });
}

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.querySelector(
            '#forgot-password-form__email-field'
        ).value;

        managePasswordRecovery('forgot', 'POST', { email });
    });
}

if (settingsDetailsForm) {
    settingsDetailsForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append(
            'name',
            document.querySelector('#settings-details-form__name-field').value
        );
        formData.append(
            'email',
            document.querySelector('#settings-details-form__email-field').value
        );
        formData.append(
            'profilePhoto',
            document.querySelector('#settings-details-form__photo-upload')
                .files[0]
        );

        manageUserData('updateMe', 'PATCH', formData);
    });
}

if (settingsPasswordForm) {
    settingsPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const currentPassword = document.querySelector(
            '#settings-password-form__current-password-field'
        ).value;
        const password = document.querySelector(
            '#settings-password-form__password-field'
        ).value;
        const confirmPassword = document.querySelector(
            '#settings-password-form__confirm-password-field'
        ).value;

        manageUserData('updateMyPassword', 'PATCH', {
            currentPassword,
            password,
            confirmPassword
        });
    });
}

if (settingsDeleteButton) {
    settingsDeleteButton.addEventListener('click', (e) => {
        prepareConfirmationModal('account');
        displayConfirmationModal(
            'Are you sure you want to delete your account?'
        );
    });
}

if (userDropdownButton) {
    userDropdownButton.addEventListener('click', (e) => {
        const el = document.querySelector('#main-nav__dropdown');
        const activeClass = 'main-nav__dropdown--active';

        if (el.classList.contains(activeClass)) {
            modifyClassOnElement(el, activeClass, 'remove');
        } else {
            modifyClassOnElement(el, activeClass, 'add');
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.querySelector('#email-field').value;
        const password = document.querySelector('#password-field').value;

        signupOrLogin('login', { email, password });
    });
}

if (logoutListItem) {
    logoutListItem.addEventListener('click', function () {
        logout();
    });
}

if (ratingInput) {
    ratingInput.addEventListener('mouseover', ratingMouseOverHandler);
    ratingInput.addEventListener('mouseleave', ratingMouseLeaveHandler);
    ratingInput.addEventListener('click', ratingClickHandler);
}

if (bookForm) {
    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.querySelector('#book-form__title-field').value;
        const author = document.querySelector('#book-form__author-field').value;

        const selectedStarElement = document.querySelector(
            '.form__star--selected'
        );
        let rating;
        if (selectedStarElement)
            rating = +selectedStarElement.getAttribute('data-index') + 1;
        const genre = document.querySelector('#book-form__genre-field').value;

        manageBookData('POST', { title, author, rating, genre });
    });
}

if (editBookForm) {
    editBookForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = window.location.href.split('/')[4];
        const title = document.querySelector(
            '#edit-book-form__title-field'
        ).value;
        const author = document.querySelector(
            '#edit-book-form__author-field'
        ).value;

        const selectedStarElement = document.querySelector(
            '.form__star--selected'
        );
        let rating;
        if (selectedStarElement)
            rating = +selectedStarElement.getAttribute('data-index') + 1;
        const genre = document.querySelector(
            '#edit-book-form__genre-field'
        ).value;

        manageBookData('PATCH', { id, title, author, rating, genre });
    });
}

window.addEventListener('click', function (e) {
    if (
        document.querySelector('#main-nav__dropdown-menu-container') &&
        !document
            .querySelector('#main-nav__dropdown-menu-container')
            .contains(e.target) &&
        !userDropdownButton.contains(e.target)
    ) {
        modifyClassOnElement(
            document.querySelector('#main-nav__dropdown'),
            'main-nav__dropdown--active',
            'remove'
        );
    }

    const bookDropdownMenu = document.querySelector(
        '#full-book__dropdown-menu'
    );

    if (bookDropdownMenu) {
        if (
            !bookDropdownMenu.contains(e.target) &&
            !document
                .querySelector('#full-book__dropdown-button')
                .contains(e.target)
        ) {
            bookDropdownMenu.style.display = 'none';
        }
    }
});

// book page

const attachListenerToNoteDeleteButtons = (handler) => {
    const noteDeleteButtons = document.querySelectorAll(
        '.full-book__note-delete-button'
    );

    noteDeleteButtons.forEach((el) => {
        el.addEventListener('click', handler);
    });
};

if (fullBook) {
    const bookDropdownButton = document.querySelector(
        '#full-book__dropdown-button'
    );

    const bookNoteForm = document.querySelector('#full-book__note-form');

    if (bookDropdownButton) {
        bookDropdownButton.addEventListener('click', (e) => {
            if (
                document.querySelector('#full-book__dropdown-menu').style
                    .display === '' ||
                document.querySelector('#full-book__dropdown-menu').style
                    .display === 'none'
            ) {
                document.querySelector(
                    '#full-book__dropdown-menu'
                ).style.display = 'block';
            } else {
                document.querySelector(
                    '#full-book__dropdown-menu'
                ).style.display = 'none';
            }
        });

        document
            .querySelector('#full-book__book-delete-button')
            .addEventListener('click', (e) => {
                prepareConfirmationModal('book');
                displayConfirmationModal(
                    'Are you sure you want to delete the book?'
                );
            });
    }

    if (bookNoteForm) {
        bookNoteForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const note = document.querySelector(
                '#full-book__new-note-body'
            ).value;
            const bookId = document
                .querySelector('#full-book')
                .getAttribute('data-id');

            manageNotesData('POST', { note, bookId });
        });

        attachListenerToNoteDeleteButtons(noteDeleteClickHandler);
    }
}

// End of book page

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
