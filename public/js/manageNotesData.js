import axios from 'axios';
import { displayAlert } from './alerts';
import {
    prepareConfirmationModal,
    displayConfirmationModal
} from './deleteConfirmationModal';
import { catchAsync } from './catchAsync';

export const noteDeleteClickHandler = (e) => {
    const bookId = document.querySelector('#full-book').getAttribute('data-id');
    const noteId = e.target.getAttribute('data-id');

    prepareConfirmationModal('note', noteId);
    displayConfirmationModal('Are you sure you want to delete this note?');
};

export const removeNoteEl = (noteId) => {
    const noteEl = document.querySelector(`#note-${noteId}`);
    noteEl.remove();
};

export const addNoteEl = (note) => {
    const noteDate = new Date(note.dateCreated).toLocaleString('en-us', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    document.querySelector('#full-book__notes').insertAdjacentHTML(
        'beforeend',
        `<div id='note-${note._id}' class='full-book__note'>
            <div class='full-book__note-content-1'>
                <p class='full-book__note-body'>${note.note}</p>
                <button class='book-card__button full-book__note-delete-button' data-id=${note._id}> &#10005; </button>
            </div>
            <div class='full-book__note-content-2'>
                <p class='full-book__note-date'>${noteDate}</p>
            </div>
        </div>`
    );

    document
        .querySelector(`#note-${note._id}`)
        .addEventListener('click', noteDeleteClickHandler);
};

export const manageNotesData = catchAsync(async (reqType, data) => {
    let axiosOptions = {
        url: `/api/v1/books/${data.bookId}/notes/${data.noteId}`
    };

    if (reqType === 'POST') {
        axiosOptions = {
            url: `/api/v1/books/${data.bookId}/notes`
        };

        delete data.bookId;
        axiosOptions.data = data;
    }

    axiosOptions.method = reqType;
    const response = await axios(axiosOptions);

    if (reqType === 'DELETE') {
        if (response.status === 204) {
            displayAlert('success', 'Note successfully deleted!');
            removeNoteEl(data.noteId);
        }
    } else if (reqType === 'POST') {
        if (response.status === 201) {
            document.querySelector('#full-book__new-note-body').value = '';
            displayAlert('success', 'Note successfully posted!');
            addNoteEl(response.data.data);
        }
    }
});
