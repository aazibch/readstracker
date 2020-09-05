import axios from 'axios';
import { displayAlert } from './alerts';
import { catchAsync } from './catchAsync';

export const managePasswordRecovery = catchAsync(async (routeType, reqType, data) => {
    const axiosOptions = {
        url: `http://localhost:3000/api/v1/users/${routeType}Password/`
    }

    if (routeType === 'reset') {
        axiosOptions.url = axiosOptions.url + data.token;
        delete data.token;
    }

    const spinnerEl = `#${routeType === 'forgot' ? 'forgot-password' : 'password-recovery'}-form__loading-spinner`;
    document.querySelector(spinnerEl).style.display = 'inline-block';

    axiosOptions.data = data;
    axiosOptions.method = reqType;

    const response = await axios(axiosOptions);
    
    if (routeType === 'forgot') {
        if (response.status === 200) {
            displayAlert('success', response.data.message);
            document.querySelector(spinnerEl).style.display = 'none';
        }
    } else {
        if (response.status === 200) {
            displayAlert('success', 'Your password has been successfully reset!');

            setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    }
});