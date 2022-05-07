import { displayAlert } from './alerts';

const catchAsync = (fn, optionalCallback) => {
    return function () {
        return fn(...arguments).catch((err) => {
            if (err.response?.data.message) {
                displayAlert('error', err.response.data.message);
            } else {
                displayAlert('error', 'Something went wrong.');
            }

            console.log('[catchAsync (frontend)] err', err);

            if (optionalCallback) optionalCallback();
        });
    };
};

export default catchAsync;
