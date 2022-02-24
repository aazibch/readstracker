import { manageBookData } from './manageBookData';
import { manageNotesData } from './manageNotesData';
import { manageUserData } from './manageUserData';

export const hideConfirmationModal = () => {
    document
        .querySelector('.confirmation-modal__options')
        .removeEventListener('click', optionsClickHandler);

    const modalEl = document.querySelector('.confirmation-modal');

    modalEl.removeAttribute('data-note');
    modalEl.style.display = 'none';
};

const optionsClickHandler = (e) => {
    const selectedEl = e.target;

    if (selectedEl.tagName === 'BUTTON') {
        if (selectedEl.getAttribute('data-value') === 'true') {
            const modalEl = document.querySelector('.confirmation-modal');

            const book = document.querySelector('.full-book');
            let bookId;

            if (book) {
                bookId = book.getAttribute('data-id');
            }

            const target = modalEl.getAttribute('data-target');
            if (target === 'book') {
                manageBookData('DELETE', { id: bookId });
            } else if (target === 'account') {
                manageUserData('Delete');
            } else {
                const noteId = modalEl.getAttribute('data-note');
                manageNotesData('DELETE', { bookId, noteId });
            }
        }

        hideConfirmationModal();
    }
};

export const displayConfirmationModal = (query) => {
    const bookDropdownMenu = document.querySelector(
        '.full-book__dropdown-menu'
    );

    if (bookDropdownMenu) {
        bookDropdownMenu.style.display = 'none';
    }

    document.querySelector(
        '.confirmation-modal__query'
    ).innerHTML = `<p>${query}</p>`;
    document.querySelector('.confirmation-modal').style.display = 'block';
    document
        .querySelector('.confirmation-modal__options')
        .addEventListener('click', optionsClickHandler);
    document
        .querySelector('.confirmation-modal__close-button')
        .addEventListener('click', () => {
            hideConfirmationModal();
        });
};

export const prepareConfirmationModal = (target, noteId) => {
    const modalEl = document.querySelector('.confirmation-modal');

    modalEl.setAttribute('data-target', target);

    if (target === 'note') {
        modalEl.setAttribute('data-note', noteId);
    }
};
