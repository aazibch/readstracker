import axios from 'axios';
import { displayAlert } from './alerts';
import {
    displayConfirmationModal,
    displayListModal,
    hideListModal,
    renderListData
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

export const deleteBook = catchAsync(async (bookId, bookEl) => {
    const response = await axios({
        url: `/api/v1/books/${bookId}`,
        method: 'DELETE'
    });

    if (bookEl) bookEl.remove();

    // Response with status code 204 don't return a response, therefore I'm hardcoding it.
    displayAlert('success', 'Book was deleted successfully.');

    if (!bookEl) {
        setTimeout(() => {
            location.assign('/');
        }, 1500);
    }
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

    return response.data.data;
});

export const getFeedBooks = catchAsync(async () => {
    const response = await axios({
        url: `/api/v1/books/following/?page=1&limit=10&sort=-dateCreated`,
        method: 'GET'
    });

    return response.data.data;
});

export const bookDropdownButtonClickHandler = (e) => {
    const id = e.currentTarget.id.split(':')[1];
    console.log('e.currentTarget.id', e.currentTarget);
    const bookDropdown = document.querySelector(`#full-book__dropdown\\:${id}`);

    clearActiveClassOnAllElements(
        'full-book__dropdown',
        `full-book__dropdown:${id}`
    );

    bookDropdown.classList.toggle('full-book__dropdown--active');
};

export const bookDeleteButtonClickHandler = (e) => {
    const id = e.currentTarget.id.split(':')[1];
    const bookEl = document.querySelector(`#full-book\\:${id}`);

    displayConfirmationModal(
        'Are you sure you want to delete the book?',
        () => {
            deleteBook(id, bookEl);
        }
    );
};

export const likeButtonClickHandler = async (e) => {
    const id = e.currentTarget.id.split(':')[1];
    const buttonEl = document.querySelector(`#like-button\\:${id}`);

    buttonEl.setAttribute('disabled', '');

    const res = await likeBook(id);

    if (res) {
        changeLikeButtonState(`#like-button\\:${id}`, 'liked');
        updateLikesQuantityButton(
            `#book-card__likes-quantity\\:${id}`,
            'increment'
        );
    }

    buttonEl.removeAttribute('disabled');
};

export const unlikeButtonClickHandler = async (e) => {
    const id = e.currentTarget.id.split(':')[1];
    const buttonEl = document.querySelector(`#like-button\\:${id}`);

    buttonEl.setAttribute('disabled', '');

    const res = await unlikeBook(id);

    if (res) {
        changeLikeButtonState(`#like-button\\:${id}`, 'like');
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

    const likes = await getLikes(id);

    if (!likes) {
        return hideListModal();
    }

    updateLikesQuantityButton(
        `#book-card__likes-quantity\\:${id}`,
        null,
        likes.length
    );
    renderListData(likes);
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
        buttonEl.classList.add('like-button--selected');
        buttonEl.dataset.action = 'unlike';
        buttonEl.removeEventListener('click', likeButtonClickHandler);
        buttonEl.addEventListener('click', unlikeButtonClickHandler);
    }

    if (newState === 'like') {
        buttonEl.innerHTML = '<i class="fa-solid fa-thumbs-up"></i> Like';
        buttonEl.classList.remove('like-button--selected');
        buttonEl.dataset.action = 'like';
        buttonEl.removeEventListener('click', unlikeButtonClickHandler);
        buttonEl.addEventListener('click', likeButtonClickHandler);
    }
};

export const renderFeedBooks = (books) => {
    let html = '';
    const loggedInUserId = localStorage.getItem('userId');

    books.forEach((book) => {
        let dropdownHtml = '';

        if (loggedInUserId === book.user._id.toString()) {
            dropdownHtml = `
                <div id="full-book__dropdown:${book._id}" class="full-book__dropdown">
                    <button id="full-book__dropdown-button:${book._id}" class="book-card__button full-book__dropdown-button"><i class="fas fa-ellipsis-h"></i></button>
                    <ul class="dropdown-menu full-book__dropdown-menu">
                        <li><a href="${book.user.username}/books/${book._id}/edit">Edit</a></li>
                        <li><a id="full-book__book-delete-button:${book._id}" class="full-book__book-delete-button" role="button">Delete</a></li>
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

        const likeButton = `<button id="like-button:${
            book._id
        }" class="button-light button-small like-button ${
            likedBook ? 'like-button--selected' : ''
        }" data-action="${
            likedBook ? 'unlike' : 'like'
        }"><i class="fa-solid fa-thumbs-up"></i> ${
            likedBook ? 'Liked' : 'Like'
        }</button>`;

        const likesQuantity = `<p id="book-card__likes-quantity:${
            book._id
        }" class="book-card__likes-quantity">${book.likedBy.length} Like${
            book.likedBy.length > 1 || book.likedBy.length === 0 ? 's' : ''
        }</p>`;

        html +=
            `
            <div id="full-book:${book._id}" class="book-card full-book feed__book">
                <section class="full-book__header">
                    <a class="full-book__user" href="/${book.user.username}">
                        <img class="user-photo full-book__user-photo" src="/images/users/${book.user.profilePhoto}"/>
                        ${book.user.username}
                    </a>` +
            dropdownHtml +
            `</section>
                <section class="book-card__info">
                    <p class="book-card__title">${book.title}</p>
                    <p class="book-card__author-line">by <span class="book__author">${book.author}</span></p>
                    <div class="book-card__rating">` +
            ratingStars.join(' ') +
            `</div>
                    <div class="book-card__secondary-data">
                        <div class="book-card__secondary-data-content-1">
                            <p class="book-card__genre">${book.genre}</p>
                            <p class="book-card__date-added">${new Date(
                                book.dateCreated
                            ).toLocaleString('en-us', {
                                day: '2-digit',
                                weekday: 'short',
                                month: 'long',
                                year: 'numeric'
                            })}</p>
                        </div>
                    </div>
                </section>
                <section class="book-card__likes">` +
            likeButton +
            likesQuantity +
            `
                </section>
            </div>
        `;
    });

    const feedBooksEl = document.querySelector('.feed__books');

    if (feedBooksEl) {
        feedBooksEl.insertAdjacentHTML('beforeend', html);
    }
};
