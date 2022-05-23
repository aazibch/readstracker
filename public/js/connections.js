import axios from 'axios';
import catchAsync from './catchAsync';
import { hideListModal } from './modals';

export const getFollowers = catchAsync(async (userId) => {
    let response = await axios({
        url: `/api/v1/users/${userId}/connections/followers`,
        method: 'GET'
    });

    response = response.data.data.map((item) => {
        return item[Object.keys(item)[1]];
    });

    return response;
}, hideListModal);

export const getAccountsFollowing = catchAsync(async (userId) => {
    let response = await axios({
        url: `/api/v1/users/${userId}/connections/following`,
        method: 'GET'
    });

    response = response.data.data.map((item) => {
        return item[Object.keys(item)[1]];
    });

    return response;
}, hideListModal);

const disableConnectToggle = (state) => {
    const buttonEl = document.querySelector('.connect-buttons__toggle');

    if (state) buttonEl.setAttribute('disabled', '');

    if (!state) buttonEl.removeAttribute('disabled');
};

export const followUser = catchAsync(
    async (userId) => {
        disableConnectToggle(true);

        const response = await axios({
            url: '/api/v1/connections',
            method: 'POST',
            data: {
                following: userId
            }
        });

        location.reload();
    },
    () => {
        disableConnectToggle(false);
    }
);

export const unfollowUser = catchAsync(
    async (connId) => {
        disableConnectToggle(true);

        return await axios({
            url: `/api/v1/connections/${connId}`,
            method: 'DELETE'
        });
    },
    () => {
        disableConnectToggle(false);
    }
);
