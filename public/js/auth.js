import axios from 'axios';
import catchAsync from './catchAsync';
import { displayAlert } from './alerts';
import { hideAllSpinners } from './loadingSpinners';

export const auth = catchAsync(async (action, data) => {
    const response = await axios({
        method: 'POST',
        url: `/api/v1/users/${action}`,
        data
    });

    hideAllSpinners();
    displayAlert(response.data.status, response.data.message);

    localStorage.setItem('userId', response.data.data.userId);

    setTimeout(() => {
        location.assign('/');
    }, 1500);
});

export const logout = catchAsync(async () => {
    const response = await axios({
        method: 'GET',
        url: '/api/v1/users/logout'
    });

    localStorage.removeItem('userId');

    location.assign('/');
});
