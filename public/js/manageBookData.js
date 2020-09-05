import axios from 'axios';
import { displayAlert } from './alerts';
import { catchAsync } from './catchAsync';

export const manageBookData = catchAsync(async (reqType, data) => {
    let axiosOptions = {
        url: reqType === 'POST' ? 'http://localhost:3000/api/v1/books/' :  `http://localhost:3000/api/v1/books/${data.id}`
    }
    
    if (reqType === 'PATCH' || reqType === 'POST') {
        axiosOptions.data = data;
    }

    if (reqType === 'PATCH') {
        delete data.id;
    }

    document.querySelector(`#${reqType === 'POST' ? 'book-form' : 'edit-book-form'}__loading-spinner`).style.display = 'inline-block';
    
    axiosOptions.method = reqType;
    const response = await axios(axiosOptions);

    if (reqType === 'DELETE') {
        if (response.status === 204) {
            displayAlert('success', 'Book successfully deleted!');

            setTimeout(() => {
                location.assign('/user');
            }, 1500);
        }
    } else if (reqType === 'PATCH') {
        if (response.status === 200) {
            displayAlert('success', 'Book successfully updated!');
            
            setTimeout(() => {
                location.assign(`/books/${response.data.data._id}`);
            }, 1500);
        }
    } else if (reqType === 'POST') {
        if (response.status === 201) {
            displayAlert('success', 'Book successfully posted!');
            
            setTimeout(() => {
                location.assign('/user');
            }, 1500);
        }
    }
});