import axios from 'axios';
let controller;
let signal;
let inputLength = 0;

export const searchUsersKeydownHandler = (e) => {
    inputLength = e.target.value.length;
};

export const searchUsersKeyupHandler = async (e) => {
    if (e.target.value.length !== inputLength) {
        if (e.target.value.length === 0) return hideSearchDropdown();

        search(e.target.value);
    }
};

const showLoadingSpinner = () =>
    (document.querySelector('.search-users__spinner').style.display = 'block');

const hideLoadingSpinner = () =>
    (document.querySelector('.search-users__spinner').style.display = 'none');

export const search = async (query) => {
    let results;

    if (controller) {
        controller.abort();
    }

    controller = new AbortController();
    signal = controller.signal;

    displaySearchDropdown();
    showLoadingSpinner();

    try {
        results = await axios({
            url: `/api/v1/users/search/${query}`,
            method: 'GET',
            signal
        });
    } catch (err) {
        if (err.message === 'canceled') return;

        return hideSearchDropdown();
    }

    if (results.data.data.length === 0) return hideSearchDropdown();

    renderResultElements(results.data.data);
};

const clearResults = () => {
    const quickResults = document.querySelector('.search-users__quick-results');
    quickResults.innerHTML = '';
};

const displaySearchDropdown = () => {
    const searchUsersEl = document.querySelector('.search-users');

    clearResults();
    searchUsersEl.classList.add('search-users--active');
};

const hideSearchDropdown = () => {
    const searchUsersEl = document.querySelector('.search-users');

    searchUsersEl.classList.remove('search-users--active');
};

const renderResultElements = (results) => {
    let html = '';

    for (let result of results) {
        html += `
            <a class='users-list__item' href='/${result.username}'>
                <img class='user-photo users-list__profile-photo' src='/images/users/${result.profilePhoto}'>
                <div>
                    <p class='users-list__username'>${result.username}</p>
                </div>
            </a>
        `;
    }

    hideLoadingSpinner();

    document.querySelector('.search-users__quick-results').innerHTML = html;
};
