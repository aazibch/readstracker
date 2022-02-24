import axios from 'axios';
let controller;
let signal;

export const manageQuickSearch = async (query) => {
    let results;

    if (controller) {
        controller.abort();
    }

    controller = new AbortController();
    signal = controller.signal;

    showSearchDropdown(true);

    try {
        results = await axios({
            url: `/api/v1/users/search/${query}`,
            method: 'GET',
            signal
        });
    } catch (err) {
        if (err.message && err.message === 'canceled') return;

        return showSearchDropdown(false);
    }

    if (results.data.data.length === 0) return showSearchDropdown(false);

    addResultElements(results.data.data);
};

const clearResults = () => {
    const quickResults = document.querySelector('.search-users__quick-results');
    quickResults.innerHTML = '';
};

export const showSearchDropdown = (bool) => {
    const searchUsersEl = document.querySelector('.search-users');

    if (bool) {
        clearResults();
        showLoadingSpinner(true);
        return searchUsersEl.classList.add('search-users--active');
    }

    searchUsersEl.classList.remove('search-users--active');
};

const showLoadingSpinner = (bool) => {
    const loadingSpinner = document.querySelector('.search-users__spinner');

    if (bool) {
        return (loadingSpinner.style.display = 'block');
    }

    loadingSpinner.style.display = 'none';
};

const addResultElements = (results) => {
    let html = '';

    for (let result of results) {
        html += `
            <a class='search-users__result' href='/users/${result.username}'>
                <img class='user-photo search-users__profile-photo' src='/images/users/${
                    result.profilePhoto
                }'>
                <div>
                    <p class='search-users__username'>${result.username}</p>
                    <p class='search-users__books'>${result.books.length} Book${
            result.books.length === 1 ? '' : 's'
        }</p>
                </div>
            </a>
        `;
    }

    showLoadingSpinner(false);
    document.querySelector('.search-users__quick-results').innerHTML = html;
};
