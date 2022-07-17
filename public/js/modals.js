const listModalEl = document.querySelector('.list-modal');
const loadingSpinnerEl = document.querySelector('.list-modal__loading-spinner');

export const hideListModal = () => {
    const listModalMessageEl = document.querySelector('.list-modal .message');

    if (listModalMessageEl) listModalMessageEl.remove();
    listModalEl.classList.remove('list-modal--active');
    document.querySelector('.list-modal__list').innerHTML = '';
};

export const displayListModal = async (heading) => {
    const modalHeading = document.querySelector('.list-modal__heading');
    modalHeading.textContent = heading;

    loadingSpinnerEl.classList.add('loading-spinner--active');
    listModalEl.classList.add('list-modal--active');
};

export const renderListData = (data) => {
    let html = '';

    for (let item of data) {
        html += `
        <a href='/${item.username}' class='users-list__item'>
            <img class='user-photo users-list__profile-photo' src='/images/users/${item.profilePhoto}'>
            <div>
                <p class='users-list__username'>${item.username}</p>
            </div>
        </a>
        `;
    }

    loadingSpinnerEl.classList.remove('loading-spinner--active');
    document.querySelector('.list-modal__list').innerHTML = html;
};

export const renderNoContentMessage = () => {
    const listModalContentEl = document.querySelector('.list-modal__content');
    const listModalLoadingSpinnerEl = document.querySelector(
        '.list-modal__loading-spinner'
    );

    listModalContentEl.insertAdjacentHTML(
        'beforeend',
        '<p class="app-message"> Nothing to show.</p>'
    );

    listModalLoadingSpinnerEl.classList.remove('loading-spinner--active');
};

let confirmationModalHandlerFunction;

export function hideConfirmationModal() {
    const modalEl = document.querySelector('.confirmation-modal');
    modalEl.classList.remove('confirmation-modal--active');

    if (confirmationModalHandlerFunction) {
        document
            .querySelector('.confirmation-modal__yes-button')
            .removeEventListener('click', confirmationModalHandlerFunction);
        confirmationModalHandlerFunction = null;
    }
}

export const displayConfirmationModal = (query, callback) => {
    document.querySelector(
        '.confirmation-modal__query'
    ).innerHTML = `<p>${query}</p>`;
    document
        .querySelector('.confirmation-modal')
        .classList.add('confirmation-modal--active');

    confirmationModalHandlerFunction = function () {
        callback();
        hideConfirmationModal();
    };

    document
        .querySelector('.confirmation-modal__yes-button')
        .addEventListener('click', confirmationModalHandlerFunction);
};
