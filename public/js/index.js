import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { signupOrLogin, logout } from './signupOrLogin';
import { ratingMouseOverHandler, ratingMouseLeaveHandler, ratingClickHandler } from './ratingInput';
import { prepareConfirmationModal, displayConfirmationModal } from './deleteConfirmationModal';
import { manageBookData } from './manageBookData';
import { manageCommentsData, commentDeleteClickHandler } from './manageCommentsData';
import { manageUserData } from './manageUserData';
import { managePasswordRecovery } from './managePasswordRecovery';
const loginForm = document.querySelector('#login-form');
const signupForm = document.querySelector('#signup-form');
const bookForm = document.querySelector('#book-form');
const logoutButton = document.querySelector('#logout-button');
const ratingInput = document.querySelector('#form__stars');
const fullBook = document.querySelector('#full-book');
const editBookForm = document.querySelector('#edit-book-form');
const userDropdownButton = document.querySelector('#main-nav__user-button');
const settingsDetailsForm = document.querySelector('#settings-details-form');
const settingsPasswordForm = document.querySelector('#settings-password-form');
const settingsDeleteButton = document.querySelector('#settings-delete-button');
const forgotPasswordForm = document.querySelector('#forgot-password-form');
const passwordRecoveryForm = document.querySelector('#password-recovery-form');

if (signupForm) {
    signupForm.addEventListener('submit', e => {
        e.preventDefault();

        const name = document.querySelector('#signup-form__name-field').value;
        const email = document.querySelector('#signup-form__email-field').value;
        const password = document.querySelector('#signup-form__password-field').value;
        const confirmPassword = document.querySelector('#signup-form__confirm-password-field').value;

        signupOrLogin('signup', {name, email, password, confirmPassword});
    })
}

if (passwordRecoveryForm) {
    passwordRecoveryForm.addEventListener('submit', e => {
        e.preventDefault();

        let token = window.location.href.split('/');
        token = token[token.length - 1];
        const password = document.querySelector('#password-recovery-form__password-field').value;
        const confirmPassword = document.querySelector('#password-recovery-form__confirm-password-field').value;

        managePasswordRecovery('reset', 'PATCH', { token, password, confirmPassword });
    });
}

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', e => {
        e.preventDefault();

        const email = document.querySelector('#forgot-password-form__email-field').value;

        managePasswordRecovery('forgot', 'POST', { email });
    });
}

if (settingsDetailsForm) {
    settingsDetailsForm.addEventListener('submit', e => {
        e.preventDefault();

        const formData = new FormData();

        formData.append('name', document.querySelector('#settings-details-form__name-field').value);
        formData.append('email', document.querySelector('#settings-details-form__email-field').value);
        formData.append('profilePhoto', document.querySelector('#settings-details-form__photo-upload').files[0]);   

        manageUserData('Data', 'PATCH', formData);
    });
}

if (settingsPasswordForm) {
    settingsPasswordForm.addEventListener('submit', e => {
        e.preventDefault();

        const currentPassword = document.querySelector('#settings-password-form__current-password-field').value;
        const password = document.querySelector('#settings-password-form__password-field').value
        const confirmPassword = document.querySelector('#settings-password-form__confirm-password-field').value;
        
        manageUserData('Password', 'PATCH', { currentPassword, password, confirmPassword });
    });
}

if (settingsDeleteButton) {
    settingsDeleteButton.addEventListener('click', e => {
        prepareConfirmationModal('account');
        displayConfirmationModal('Are you sure you want to delete your account?');
    });
}

if (userDropdownButton) {
    userDropdownButton.addEventListener('click', e => {
        const dropdownEl = document.querySelector('#main-nav__dropdown');
        const activeClass = 'main-nav__dropdown--active';

        if (dropdownEl.classList.contains(activeClass)) {
            dropdownEl.classList.remove(activeClass);
        } else {
            dropdownEl.classList.add(activeClass);
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();

        const email = document.querySelector('#email-field').value;
        const password = document.querySelector('#password-field').value;

        signupOrLogin('login', {email, password});
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        logout();
    });
}

if (ratingInput) {
    ratingInput.addEventListener('mouseover', ratingMouseOverHandler);
    ratingInput.addEventListener('mouseleave', ratingMouseLeaveHandler);
    ratingInput.addEventListener('click', ratingClickHandler);
}

if (bookForm) {
    bookForm.addEventListener('submit', e => {
        e.preventDefault();

        const title = document.querySelector('#book-form__title-field').value;
        const author = document.querySelector('#book-form__author-field').value;
        
        const selectedStarElement = document.querySelector('.form__star--selected');
        let rating;
        if (selectedStarElement) rating = +selectedStarElement.getAttribute('data-index') + 1;
        const genre = document.querySelector('#book-form__genre-field').value;

        manageBookData('POST', {title, author, rating, genre});
    });
}

if (editBookForm) {
    editBookForm.addEventListener('submit', e => {
        e.preventDefault();

        const id = window.location.href.split('/')[4];
        const title = document.querySelector('#edit-book-form__title-field').value;
        const author = document.querySelector('#edit-book-form__author-field').value;
        
        const selectedStarElement = document.querySelector('.form__star--selected');
        let rating;
        if (selectedStarElement) rating = +selectedStarElement.getAttribute('data-index') + 1;
        const genre = document.querySelector('#edit-book-form__genre-field').value;
        
        manageBookData('PATCH', { id, title, author, rating, genre});
    });
}

// book page

const attachListenerToCommentDeleteButtons = (handler) => {
    const commentDeleteButtons = document.querySelectorAll('.full-book__comment-delete-button');

    commentDeleteButtons.forEach(el => {
        el.addEventListener('click', handler)
    });
}

if (fullBook) {
    document.querySelector('#full-book__dropdown-button').addEventListener('click', e => {
        if (
            document.querySelector('#full-book__dropdown-menu').style.display === '' ||
            document.querySelector('#full-book__dropdown-menu').style.display === 'none'
        ) {
            document.querySelector('#full-book__dropdown-menu').style.display = 'block';
        } else {
            document.querySelector('#full-book__dropdown-menu').style.display = 'none';
        }
    });

    document.querySelector('#full-book__book-delete-button').addEventListener('click', e => {
        prepareConfirmationModal('book');
        displayConfirmationModal('Are you sure you want to delete the book?');
    });
    
    attachListenerToCommentDeleteButtons(commentDeleteClickHandler);

    document.querySelector('#full-book__comment-form').addEventListener('submit', e => {
        e.preventDefault();

        const comment = document.querySelector('#full-book__new-comment-body').value;
        const bookId = document.querySelector('#full-book').getAttribute('data-id');
        
        manageCommentsData('POST', { comment, bookId });
    })
}

// End of book page