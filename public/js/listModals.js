const listModalEl = document.querySelector('.list-modal');
const loadingSpinnerEl = document.querySelector('.list-modal__loading-spinner');

export const hideListModal = () => {
    listModalEl.classList.remove('list-modal--active');
    document.querySelector('.list-modal__list').innerHTML = '';
};

export const displayListModal = async (heading, getData) => {
    const userId = document.querySelector('.connections').getAttribute('data-user-id');
    const loadingSpinnerEl = document.querySelector('.list-modal__loading-spinner');
    const modalHeading = document.querySelector('.list-modal__heading');
    modalHeading.textContent = heading;

    loadingSpinnerEl.classList.add('loading-spinner--active');    
    listModalEl.classList.add('list-modal--active');

    const data = await getData(userId);

    renderData(data);
}

const renderData = (data) => {
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
}