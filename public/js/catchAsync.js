import { displayAlert } from './alerts';

const catchAsync = (fn) => {
    return function () {
        return fn(...arguments).catch((err) => {
            if (err.response?.data.message) return displayAlert('error', err.response.data.message);
            
            console.log('[catchAsync (frontend)] err', err);

            displayAlert('error', 'Something went wrong.');
        });
    };
};

export default catchAsync;