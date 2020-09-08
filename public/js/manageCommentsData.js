import axios from 'axios';
import { displayAlert } from './alerts';
import { prepareConfirmationModal, displayConfirmationModal } from './deleteConfirmationModal';
import { catchAsync } from './catchAsync';

export const commentDeleteClickHandler = e => {
    const bookId = document.querySelector('#full-book').getAttribute('data-id');
    const commentId = e.target.getAttribute('data-id');

    prepareConfirmationModal('comment', commentId);
    displayConfirmationModal('Are you sure you want to delete this comment?');
};

export const removeCommentEl = (commentId) => {
    const commentEl = document.querySelector(`#comment-${commentId}`);
    commentEl.remove();
}

export const addCommentEl = (comment) => {
    const commentDate = new Date(comment.dateCreated).toLocaleString('en-us', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });

    document.querySelector('#full-book__comments').insertAdjacentHTML(
        'beforeend',
        `<div id='comment-${comment._id}' class='full-book__comment'>
            <div class='full-book__comment-content-1'>
                <p class='full-book__comment-body'>${comment.comment}</p>
                <button class='book-card__button full-book__comment-delete-button' data-id=${comment._id}> &#10005; </button>
            </div>
            <div class='full-book__comment-content-2'>
                <p class='full-book__comment-date'>${commentDate}</p>
            </div>
        </div>`
    );

    document.querySelector(`#comment-${comment._id}`).addEventListener('click', commentDeleteClickHandler);
}

export const manageCommentsData = catchAsync(async (reqType, data) => {
    let axiosOptions = {
        url: `/api/v1/books/${data.bookId}/comments/${data.commentId}`
    }

    if (reqType === 'POST') {
        axiosOptions = {
            url: `/api/v1/books/${data.bookId}/comments`
        }
        
        delete data.bookId;
        axiosOptions.data = data;
    }

    axiosOptions.method = reqType;
    const response = await axios(axiosOptions);
    
    if (reqType === 'DELETE') {
        if (response.status === 204) {
            displayAlert('success', 'Comment successfully deleted!');
            removeCommentEl(data.commentId);
        }
    } else if (reqType === 'POST') {
        if (response.status === 201) {
            document.querySelector('#full-book__new-comment-body').value = '';
            displayAlert('success', 'Comment successfully posted!');
            addCommentEl(response.data.data);
        }
    }
});