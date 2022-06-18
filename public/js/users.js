import axios from 'axios';
import { displayAlert } from './alerts';
import catchAsync from './catchAsync';

export const clearPasswordInputFields = () => {
    document.querySelector(
        '.settings-password-form__current-password-field'
    ).value = '';
    document.querySelector('.settings-password-form__password-field').value =
        '';
    document.querySelector(
        '.settings-password-form__confirm-password-field'
    ).value = '';
};

export const updateUser = catchAsync(async (data) => {
    const response = await axios({
        url: '/api/v1/users/me/',
        method: 'PATCH',
        data
    });

    displayAlert(response.data.status, response.data.message);

    return response;
});

export const deleteUser = catchAsync(async () => {
    const response = await axios({
        url: 'api/v1/users/me',
        method: 'Delete'
    });

    // Response with status code 204 don't return a response, therefore I'm hardcoding it.
    displayAlert('success', 'User was deleted successfully.');

    return response;
});

export const updatePassword = catchAsync(async (data) => {
    const response = await axios({
        url: 'api/v1/users/updateMyPassword',
        method: 'PATCH',
        data
    });

    displayAlert(response.data.status, response.data.message);

    return response;
});
