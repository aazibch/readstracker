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
