import { displayAlert } from './alerts';

const catchAsync = (fn, optionalCallback) => {
    return function () {
        return fn(...arguments).catch((err) => {
            console.log('err', err);

            if (err.response?.data.message) {
                displayAlert('error', err.response.data.message);
            } else {
                displayAlert('error', 'Something went wrong.');
            }

            if (optionalCallback) optionalCallback();
        });
    };
};

export default catchAsync;
