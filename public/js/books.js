import axios from 'axios';
import { displayAlert } from './alerts';
import {
    displayConfirmationModal,
    displayListModal,
    hideListModal,
    renderListData,
    renderNoContentMessage
} from './modals';
import { clearActiveClassOnAllElements } from './utils';
import catchAsync from './catchAsync';

export const createBook = catchAsync(async (data) => {
    const response = await axios({
        url: '/api/v1/books/',
        method: 'POST',
        data
    });

    displayAlert(response.data.status, response.data.message);

    return response;
});

export const updateBook = catchAsync(async (bookId, data) => {
    const response = await axios({
        url: `/api/v1/books/${bookId}`,
        method: 'PATCH',
        data
    });

    displayAlert(response.data.status, response.data.message);

    return response;
});

export const deleteBook = catchAsync(async (bookId) => {
    const response = await axios({
        url: `/api/v1/books/${bookId}`,
        method: 'DELETE'
    });

    // Response with status code 204 don't return a response, therefore I'm hardcoding it.
    displayAlert('success', 'Book was deleted successfully.');

    return response;
});

export const likeBook = catchAsync(async (bookId) => {
    const response = await axios({
        url: `/api/v1/books/${bookId}/likes`,
        method: 'POST'
    });

    displayAlert(response.data.status, response.data.message);

    return response;
});

export const unlikeBook = catchAsync(async (bookId) => {
    const response = await axios({
        url: `/api/v1/books/${bookId}/likes`,
        method: 'DELETE'
    });

    // Response with status code 204 doesn't return a response, therefore I'm hardcoding it.
    displayAlert('success', 'Book was unliked successfully.');

    return response;
});

const getLikes = catchAsync(async (bookId) => {
    const response = await axios({
        url: `/api/v1/books/${bookId}/likes`,
        method: 'GET'
    });

    return response;
});

export const getHomeFeedBooks = catchAsync(async () => {
    const response = await axios({
        url: `/api/v1/books/following`,
        method: 'GET'
    });

    return response;
});

export const getProfileFeedBooks = catchAsync(async (userId) => {
    const response = await axios({
        url: `/api/v1/books/user/${userId}`,
        method: 'GET'
    });

    return response;
});

export const bookDropdownButtonClickHandler = (e) => {
    const id = e.currentTarget.id.split(':')[1];
    const bookDropdown = document.querySelector(`#book-card__dropdown\\:${id}`);

    clearActiveClassOnAllElements(
        'book-card__dropdown',
        `book-card__dropdown:${id}`
    );

    bookDropdown.classList.toggle('book-card__dropdown--active');
};

export const bookDeleteButtonClickHandler = (e) => {
    const id = e.currentTarget.id.split(':')[1];
    const bookEl = document.querySelector(`#book-card\\:${id}`);

    displayConfirmationModal(
        'Are you sure you want to delete the book?',
        async () => {
            const res = await deleteBook(id);

            if (res && bookEl.classList.contains('book-card__full')) {
                setTimeout(() => {
                    location.assign('/');
                }, 1500);
            }

            if (res && !bookEl.classList.contains('book-card__full')) {
                bookEl.remove();
                const bookElements = document.querySelectorAll('.book-card');

                if (bookElements.length === 0) {
                    const profileBodyContentEl = document.querySelector(
                        '.profile-body__content'
                    );

                    if (profileBodyContentEl)
                        profileBodyContentEl.insertAdjacentHTML(
                            'beforeend',
                            '<p class="app-message app-message__large">No books to show. Add books to display them on your profile.</p>'
                        );

                    const homeFeedEl = document.querySelector('.home-feed');

                    if (homeFeedEl) {
                        homeFeedEl.insertAdjacentHTML(
                            'afterbegin',
                            '<p class="app-message app-message__large">No books to show. Follow people to improve your experience.</p>'
                        );
                    }
                }
            }
        }
    );
};

export const likeButtonClickHandler = async (e) => {
    const id = e.currentTarget.id.split(':')[1];
    const buttonEl = document.querySelector(`#book-card__like-button\\:${id}`);

    buttonEl.setAttribute('disabled', '');

    const res = await likeBook(id);

    if (res) {
        changeLikeButtonState(`#book-card__like-button\\:${id}`, 'liked');
        updateLikesQuantityButton(
            `#book-card__likes-quantity\\:${id}`,
            'increment'
        );
    }

    buttonEl.removeAttribute('disabled');
};

export const unlikeButtonClickHandler = async (e) => {
    const id = e.currentTarget.id.split(':')[1];
    const buttonEl = document.querySelector(`#book-card__like-button\\:${id}`);

    buttonEl.setAttribute('disabled', '');

    const res = await unlikeBook(id);

    if (res) {
        changeLikeButtonState(`#book-card__like-button\\:${id}`, 'like');
        updateLikesQuantityButton(
            `#book-card__likes-quantity\\:${id}`,
            'decrement'
        );
    }

    buttonEl.removeAttribute('disabled');
};

export const likesQuantityButtonClickHandler = async (e) => {
    const id = e.currentTarget.id.split(':')[1];

    displayListModal('Likes');

    const response = await getLikes(id);

    if (!response) {
        return hideListModal();
    }

    if (response.data.data.length === 0) {
        renderNoContentMessage();
    } else {
        renderListData(response.data.data);
    }

    updateLikesQuantityButton(
        `#book-card__likes-quantity\\:${id}`,
        null,
        response.data.data.length
    );
};

const updateLikesQuantityButton = (buttonSelector, action, value) => {
    const buttonEl = document.querySelector(buttonSelector);
    let likesQuantity = +buttonEl.textContent.split(' ')[0];

    if (!value) {
        if (action === 'increment') {
            ++likesQuantity;
        }

        if (action === 'decrement') {
            --likesQuantity;
        }
    } else {
        likesQuantity === value;
    }

    buttonEl.textContent = `${likesQuantity} Like${
        likesQuantity > 1 || likesQuantity === 0 ? 's' : ''
    }`;
};

const changeLikeButtonState = (buttonSelector, newState) => {
    const buttonEl = document.querySelector(buttonSelector);

    if (newState === 'liked') {
        buttonEl.innerHTML = '<i class="fa-solid fa-thumbs-up"></i> Liked';
        buttonEl.classList.add('book-card__like-button--selected');
        buttonEl.dataset.action = 'unlike';
        buttonEl.removeEventListener('click', likeButtonClickHandler);
        buttonEl.addEventListener('click', unlikeButtonClickHandler);
    }

    if (newState === 'like') {
        buttonEl.innerHTML = '<i class="fa-solid fa-thumbs-up"></i> Like';
        buttonEl.classList.remove('book-card__like-button--selected');
        buttonEl.dataset.action = 'like';
        buttonEl.removeEventListener('click', unlikeButtonClickHandler);
        buttonEl.addEventListener('click', likeButtonClickHandler);
    }
};

export const attachBooksEventListeners = () => {
    document
        .querySelectorAll('.book-card__dropdown')
        .forEach((el) =>
            el.addEventListener('click', bookDropdownButtonClickHandler)
        );

    document
        .querySelectorAll('.book-card__book-delete-button')
        .forEach((el) => {
            el.addEventListener('click', bookDeleteButtonClickHandler);
        });

    document
        .querySelectorAll('.book-card__like-button[data-action="like"]')
        .forEach((el) => {
            el.addEventListener('click', likeButtonClickHandler);
        });

    document
        .querySelectorAll('.book-card__like-button[data-action="unlike"]')
        .forEach((el) => {
            el.addEventListener('click', unlikeButtonClickHandler);
        });

    document.querySelectorAll('.book-card__likes-quantity').forEach((el) => {
        el.addEventListener('click', likesQuantityButtonClickHandler);
    });
};

export const renderFeedBooks = (feedEl, books) => {
    let html = '';
    const loggedInUserId = localStorage.getItem('userId');

    books.forEach((book) => {
        let dropdownHtml = '';

        if (loggedInUserId === book.user._id.toString()) {
            dropdownHtml = `
                <div id="book-card__dropdown:${book._id}" class="book-card__dropdown">
                    <button id="book-card__dropdown-button:${book._id}" class="book-card__button book-card__dropdown-button"><i class="fas fa-ellipsis-h"></i></button>
                    <ul class="dropdown-menu book-card__dropdown-menu">
                        <li><a href="${book.user.username}/books/${book._id}/edit">Edit</a></li>
                        <li><a id="book-card__book-delete-button:${book._id}" class="book-card__book-delete-button" role="button">Delete</a></li>
                    </ul>
                </div>
            `;
        }

        const ratingStars = [];

        [1, 2, 3, 4, 5].forEach((num) => {
            ratingStars.push(
                `<i class="far fa-star ${
                    num <= book.rating ? 'star-highlighted' : ''
                }"></i>`
            );
        });

        const likedBook = book.likedBy.some((u) => {
            return u.toString() === loggedInUserId;
        });

        const likeButton = `<button id="book-card__like-button:${
            book._id
        }" class="button-light button-small book-card__like-button ${
            likedBook ? 'book-card__like-button--selected' : ''
        }" data-action="${
            likedBook ? 'unlike' : 'like'
        }"><i class="fa-solid fa-thumbs-up"></i> ${
            likedBook ? 'Liked' : 'Like'
        }</button>`;

        const commentButton = `<a class="button-light button-small book-card__comment-button book-card__footer-button" href="/${book.user.username}/books/${book._id}?comment=true">
            <i class="fa-solid fa-comments"></i>
            Comment
        <a/>`;

        const likesQuantity = `<p id="book-card__likes-quantity:${
            book._id
        }" class="book-card__footer-indicator">${book.likedBy.length} Like${
            book.likedBy.length > 1 || book.likedBy.length === 0 ? 's' : ''
        }</p>`;

        const commentsQuantity = `<a href='/aazibch/books/${
            book._id
        }' class="book-card__footer-indicator">${book.comments.length} Comment${
            book.comments.length > 1 || book.comments.length === 0 ? 's' : ''
        }</a>`;

        let review = '';

        if (book.review)
            review = `<div class="book-card__review">${book.review}</div>`;

        html +=
            `
            <div id="book-card:${book._id}" class="book-card">
                <section class="book-card__header">
                    <a class="book-card__user" href="/${book.user.username}">
                        <img class="user-photo book-card__user-photo" src="/images/users/${book.user.profilePhoto}"/>
                        ${book.user.username}
                    </a>` +
            dropdownHtml +
            `</section>
                <section class="book-card__info">
                    <p class="book-card__title">${book.title}</p>
                    <p class="book-card__author-line">by <span class="book__author">${book.author}</span></p>
                    <div class="book-card__rating">` +
            ratingStars.join(' ') +
            `</div>` +
            review +
            `<div class="book-card__secondary-data">
                        <div class="book-card__secondary-data-content-1">
                            <p class="book-card__genre">${book.genre}</p>
                            <a href="/${book.user.username}/books/${
                book._id
            }" class="book-card__date-added">${new Date(
                book.dateCreated
            ).toLocaleString('en-us', {
                day: '2-digit',
                weekday: 'short',
                month: 'long',
                year: 'numeric'
            })}</a>
                        </div>
                    </div>
                </section>
                <section class="book-card__footer">
                    <div class="book-card__footer-buttons">` +
            likeButton +
            commentButton +
            `</div>
                    <div class="book-card__footer-indicators">` +
            commentsQuantity +
            likesQuantity +
            ` </div>
                </section>
        </div>
                `;
    });

    const parentEl = document.querySelector(feedEl);

    if (parentEl) {
        parentEl.insertAdjacentHTML('beforeend', html);
    }
};
