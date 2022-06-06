import axios from 'axios';
import { displayAlert } from './alerts';
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

export const likeBook = catchAsync(async (bookId) => {
    const response = await axios({
        url: `/api/v1/books/${bookId}/likes`,
        method: 'POST'
    });

    displayAlert(response.data.status, response.data.message);

    setTimeout(() => {
        location.reload();
    });
});

export const unlikeBook = catchAsync(async (bookId) => {
    const response = await axios({
        url: `/api/v1/books/${bookId}/likes`,
        method: 'DELETE'
    });

    // Response with status code 204 don't return a response, therefore I'm hardcoding it.
    displayAlert('success', 'Book was unliked successfully.');

    setTimeout(() => {
        location.reload();
    });
});
