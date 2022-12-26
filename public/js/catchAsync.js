import { displayAlert } from './alerts';

const catchAsync = (fn, optionalCallback) => {
    return function () {
        return fn(...arguments).catch((err) => {
            if (err.response?.data.message) {
                displayAlert('error', err.response.data.message);
            } else {
                if (err.message !== 'Request aborted')
                    displayAlert('error', 'Something went wrong.');
            }

            if (optionalCallback) optionalCallback();
            if (err.message === 'Request aborted') {
                return {
                    message: err.message
                };
            }
        });
    };
};

export default catchAsync;
