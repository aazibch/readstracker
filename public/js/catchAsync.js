import { displayAlert } from './alerts';

export const catchAsync = (method) => {
    return function() {
        method(...arguments).catch(err => {
            const spinnerElements = document.querySelectorAll('.loading-spinner');

            for (let x of spinnerElements) {
                x.style.display = 'none';
            }

            if (err.response.data.message) {
                displayAlert('error', err.response.data.message);
            } else {
                displayAlert('error', 'Something went wrong.');
            }
        });
    }
}