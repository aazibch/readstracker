import axios from 'axios';
import catchAsync from './catchAsync';
import { displayAlert } from './alerts';

export const auth = catchAsync(async (action, data) => {
    const response = await axios({
        method: 'POST',
        url: `/api/v1/users/${action}`,
        data
    });

    displayAlert(response.data.status, response.data.message);
    localStorage.setItem('userId', response.data.data.userId);

    return response;
});

export const logout = catchAsync(async () => {
    const response = await axios({
        method: 'GET',
        url: '/api/v1/users/logout'
    });

    localStorage.removeItem('userId');
});

export const recoverPassword = catchAsync(async (route, data) => {
    let url = '/api/v1/users/forgotPassword';

    if (route === 'resetPassword')
        url = `/api/v1/users/resetPassword/${data.token}`;

    const response = await axios({
        method: 'POST',
        url,
        data
    });

    displayAlert(response.data.status, response.data.message);
    return response;
});
