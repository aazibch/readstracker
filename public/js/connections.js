import axios from 'axios';
import catchAsync from './catchAsync';
import { displayAlert } from './alerts';
import { hideListModal } from './listModals';

const connectionsEl = document.querySelector('.connections');

const modalCatchAsync = (fn) => {
    return function () {
        return fn(...arguments).catch((err) => {
            if (err.response?.data.message) {
                displayAlert('error', err.response.data.message)
            } else {
                displayAlert('error', 'Something went wrong.');
            }
        
            hideListModal();
        });
    };
};

export const getFollowers = modalCatchAsync(async (userId) => {
    const response = await axios({
        url: `/api/v1/users/${userId}/connections/followers`,
        method: 'GET'
    });

    let editedRes = response.data.data.map((item) => {
        return item[Object.keys(item)[1]];
    });

    return editedRes;
});

export const getAccountsFollowing = modalCatchAsync(async (userId) => {
    const response = await axios({
        url: `/api/v1/users/${userId}/connections/following`,
        method: 'GET'
    });

    let editedRes = response.data.data.map((item) => {
        return item[Object.keys(item)[1]];
    });

    return editedRes;
});

export const followUser = catchAsync(async (userId) => {
    const response = await axios({
        url: '/api/v1/connections',
        method: 'POST',
        data: {
            following: userId
        }
    });

    location.reload();
});

export const unfollowUser = catchAsync(async (connId) => {
    const response = await axios({
        url: `/api/v1/connections/${connId}`,
        method: 'DELETE'
    });

    location.reload();
});

// Handlers

export const followButtonHandler = () => {
    const userId = connectionsEl.getAttribute('data-user-id');
    followUser(userId);
};

export const unfollowButtonHandler = () => {
    const connId = connectionsEl.getAttribute('data-conn-id');
    unfollowUser(connId);
};