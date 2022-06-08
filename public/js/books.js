import axios from 'axios';
import { displayAlert } from './alerts';
import { disableButton } from './utils';
import catchAsync from './catchAsync';

export const createBook = catchAsync(async (data) => {
    const response = await axios({
        url: '/api/v1/books/',
        method: 'POST',
        data
    });

    displayAlert(response.data.status, response.data.message);

    setTimeout(() => {
        location.assign('/profile');
    }, 1500);
});

export const updateBook = catchAsync(async (bookId, data) => {
    const response = await axios({
        url: `/api/v1/books/${bookId}`,
        method: 'PATCH',
        data
    });

    displayAlert(response.data.status, response.data.message);

    setTimeout(() => {
        location.assign(`/books/${response.data.data._id}`);
    }, 1500);
});

export const deleteBook = catchAsync(async (bookId) => {
    const response = await axios({
        url: `/api/v1/books/${bookId}`,
        method: 'DELETE'
    });

    // Response with status code 204 don't return a response, therefore I'm hardcoding it.
    displayAlert('success', 'Book was deleted successfully.');

    setTimeout(() => {
        location.assign('/user');
    }, 1500);
});

export const likeBook = catchAsync(
    async (bookId) => {
        disableButton('.like-button', true);

        const response = await axios({
            url: `/api/v1/books/${bookId}/likes`,
            method: 'POST'
        });

        displayAlert(response.data.status, response.data.message);

        setTimeout(() => {
            location.reload();
        });
    },
    () => {
        disableButton('.like-button', false);
    }
);

export const unlikeBook = catchAsync(
    async (bookId) => {
        disableButton('.like-button', true);

        const response = await axios({
            url: `/api/v1/books/${bookId}/likes`,
            method: 'DELETE'
        });

        // Response with status code 204 doesn't return a response, therefore I'm hardcoding it.
        displayAlert('success', 'Book was unliked successfully.');

        setTimeout(() => {
            location.reload();
        });
    },
    () => {
        disableButton('.like-button', false);
    }
);

const closeAllBookDropdowns = () => {
    const bookDropdownEls = document.querySelectorAll('.full-book__dropdown');

    bookDropdownEls.forEach((el) =>
        el.classList.remove('full-book__dropdown--active')
    );
};

export const bookDropdownButtonClickHandler = (e) => {
    const id = e.currentTarget.id.split(':')[1];
    const bookDropdown = document.querySelector(`#full-book__dropdown\\:${id}`);

    closeAllBookDropdowns();

    if (!bookDropdown.classList.contains('full-book__dropdown--active')) {
        return bookDropdown.classList.add('full-book__dropdown--active');
    }

    bookDropdown.classList.remove('full-book__dropdown--active');
};

export const getFeedBooks = catchAsync(async () => {
    const response = await axios({
        url: `/api/v1/books/following/?page=1&limit=10&sort=-dateCreated`,
        method: 'GET'
    });

    return response.data.data;
});

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
                        <li><a href="/books/${book._id}/edit">Edit</a></li>
                        <li><a class="full-book__book-delete-button" role="button">Delete</a></li>
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

        const likeButton = `<button data-book-id="${
            book._id
        }" class="button-light button-small like-button ${
            likedBook ? 'like-button--selected' : ''
        }"><i class="fa-solid fa-thumbs-up"></i> ${
            likedBook ? 'Liked' : 'Like'
        }</button>`;

        const likesQuantity = `<p data-book-id="${
            book._id
        }" class="book-card__likes-quantity">${book.likedBy.length} Like${
            book.likedBy.length > 1 || book.likedBy.length === 0 ? 's' : ''
        }</p>`;

        html +=
            `
            <div class="book-card full-book feed__book">
                <section class="full-book__header"><a class="full-book__user" href="/">
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

    console.log('[renderFeedBooks]', books);
};
