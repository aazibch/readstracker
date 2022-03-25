import axios from 'axios';
import catchAsync from './catchAsync';
import { displayAlert } from './alerts';
import { hideListModal } from './listModals';

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

const changeFollowButtonState = (state) => {
    const followToggle = document.querySelector('.connect-buttons__follow-toggle');

    if ('unfollow') {
        followToggle.innerText = 'Unfollow';
        followToggle.classList.remove('.connect-buttons__follow-button');
        followToggle.classList.add('.connect-buttons__unfollow-button');
    }

    if ('follow') {
        followToggle.innerHTML = '<i class="fas fa-plus"></i> Follow';
        followToggle.classList.remove('.connect-buttons__unfollow-button');
        followToggle.classList.add('.connect-buttons__follow-button');
    }
};

export const followUser = catchAsync(async (userId) => {
    const response = await axios({
        url: '/api/v1/connections',
        method: 'POST',
        data: {
            following: userId
        }
    });

    changeFollowButtonState('unfollow');
});

export const unfollowUser = catchAsync(async (connId) => {
    const response = await axios({
        url: `/api/v1/connections/${connId}`,
        method: 'DELETE'
    });

    changeFollowButtonState('follow');
});