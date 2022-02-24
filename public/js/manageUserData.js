import axios from 'axios';
import { displayAlert } from './alerts';
import { catchAsync } from './catchAsync';

const clearPasswordInputFields = () => {
    document.querySelector(
        '.settings-password-form__current-password-field'
    ).value = '';
    document.querySelector('.settings-password-form__password-field').value =
        '';
    document.querySelector(
        '.settings-password-form__confirm-password-field'
    ).value = '';
};

export const manageUserData = catchAsync(async (routeType, reqType, data) => {
    let axiosOptions = {
        url: '/api/v1/users/deleteMe',
        method: 'DELETE'
    };

    if (routeType !== 'deleteMe') {
        axiosOptions = {
            url: `/api/v1/users/${routeType}`,
            method: reqType,
            data
        };
    }

    let spinnerEl = `#settings-${
        routeType === 'updateMyPassword' ? 'password' : 'details'
    }-form__loading-spinner`;

    if (routeType === 'deleteMe') {
        spinnerEl = '.settings-delete__loading-spinner';
    }

    document.querySelector(spinnerEl).style.display = 'inline-block';

    const response = await axios(axiosOptions);

    if (response.status === 200) {
        if (routeType === 'updateMyPassword') {
            document.querySelector(
                '.settings-password-form__loading-spinner'
            ).style.display = 'none';
            displayAlert('success', 'Password successfully updated!');
            clearPasswordInputFields();
        } else {
            document.querySelector(
                '.settings-details-form__loading-spinner'
            ).style.display = 'none';
            displayAlert('success', 'Data successfully updated!');
        }
    }

    if (response.status === 204) {
        displayAlert('success', 'Account deleted successfully!');

        setTimeout(() => {
            location.assign('/');
        }, 1500);
    }
});
