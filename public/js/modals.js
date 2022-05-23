const listModalEl = document.querySelector('.list-modal');
const loadingSpinnerEl = document.querySelector('.list-modal__loading-spinner');

export const hideListModal = () => {
    listModalEl.classList.remove('list-modal--active');
    document.querySelector('.list-modal__list').innerHTML = '';
};

export const displayListModal = async (heading, callback) => {
    const modalHeading = document.querySelector('.list-modal__heading');
    modalHeading.textContent = heading;

    loadingSpinnerEl.classList.add('loading-spinner--active');
    listModalEl.classList.add('list-modal--active');

    const data = await callback();

    renderListData(data);
};

const renderListData = (data) => {
    let html = '';

    for (let item of data) {
        html += `
        <a href='/${item.username}' class='users-list__item'>
            <img class='user-photo users-list__profile-photo' src='/images/users/${item.profilePhoto}'>
            <div>
                <p class='users-list__username'>${item.username}</p>
                <p class='users-list__books'>1 book</p>
            </div>
        </a>
        `;
    }

    loadingSpinnerEl.classList.remove('loading-spinner--active');
    document.querySelector('.list-modal__list').innerHTML = html;
};

export function hideConfirmationModal() {
    const modalEl = document.querySelector('.confirmation-modal');
    modalEl.classList.remove('confirmation-modal--active');
}

export const displayConfirmationModal = (query, callback) => {
    document.querySelector(
        '.confirmation-modal__query'
    ).innerHTML = `<p>${query}</p>`;
    document
        .querySelector('.confirmation-modal')
        .classList.add('confirmation-modal--active');

    document
        .querySelector('.confirmation-modal__yes-button')
        .addEventListener('click', function () {
            callback();
            hideConfirmationModal();
        });
};
