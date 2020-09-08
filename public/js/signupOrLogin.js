import axios from 'axios';
import { displayAlert } from './alerts';
import { catchAsync } from './catchAsync';

export const signupOrLogin = catchAsync(async (routeType, data) => {
    document.querySelector(`${routeType === 'login' ? '#login-form' : '#signup-form'}__loading-spinner`).style.display = 'inline-block';

    const response = await axios({
        method: 'POST',
        url: `/api/v1/users/${routeType}`,
        data
    });

    if (routeType === 'signup') {
        if (response.data.status === 'success') {
            displayAlert('success', 'Account created successfully!');

            setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } else {        
        if (response.data.status === 'success') {
            displayAlert('success', 'Logged in successfully!');

            setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    }
});

export const logout = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: '/api/v1/users/logout'
        });
    
        if (response.data.status === 'success') location.assign('/');
    } catch (err) {
        displayAlert('error', 'Something went wrong. Try again.')
    }
}