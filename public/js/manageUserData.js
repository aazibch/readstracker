import axios from 'axios';
import { displayAlert } from './alerts';
import { catchAsync } from './catchAsync';

const clearPasswordInputFields = () => {
    document.querySelector('#settings-password-form__current-password-field').value = '';
    document.querySelector('#settings-password-form__password-field').value = '';
    document.querySelector('#settings-password-form__confirm-password-field').value = '';
};

export const manageUserData = catchAsync(async (routeType, reqType, data) => {
    let axiosOptions = {
        url: '/api/v1/users/userDelete',
        method: 'DELETE'
    };

    if (routeType !== 'Delete') {
        axiosOptions = {
            url: `/api/v1/users/userUpdate${routeType}`,
            method: reqType,
            data
        }
    }

    let spinnerEl = `#settings-${routeType === 'Password' ? 'password' : 'details'}-form__loading-spinner`;

    if (routeType === 'Delete') {
        spinnerEl = '#settings-delete__loading-spinner';
    }

    document.querySelector(spinnerEl).style.display = 'inline-block';
    
    const response = await axios(axiosOptions);

    if (response.status === 200) {
        if (routeType === 'Password') {
            document.querySelector('#settings-password-form__loading-spinner').style.display = 'none';
            displayAlert('success', 'Password successfully updated!');
            clearPasswordInputFields();
        } else {
            document.querySelector('#settings-details-form__loading-spinner').style.display = 'none';
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