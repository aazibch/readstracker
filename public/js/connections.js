import axios from 'axios';
import catchAsync from './catchAsync';
import { displayAlert } from './alerts';

export const getFollowers = catchAsync(async (userId) => {
    let response = await axios({
        url: `/api/v1/users/${userId}/connections/followers`,
        method: 'GET'
    });

    response = response.data.data.map((item) => {
        return item[Object.keys(item)[1]];
    });

    return response;
});

export const getAccountsFollowing = catchAsync(async (userId) => {
    let response = await axios({
        url: `/api/v1/users/${userId}/connections/following`,
        method: 'GET'
    });

    response = response.data.data.map((item) => {
        return item[Object.keys(item)[1]];
    });

    return response;
});

export const followUser = catchAsync(async (userId) => {
    const response = await axios({
        url: '/api/v1/connections',
        method: 'POST',
        data: {
            following: userId
        }
    });

    displayAlert(response.data.status, response.data.message);

    return response;
});

export const unfollowUser = catchAsync(async (connId) => {
    const response = await axios({
        url: `/api/v1/connections/${connId}`,
        method: 'DELETE'
    });

    displayAlert('success', 'User was unfollowed successfully.');

    return response;
});
