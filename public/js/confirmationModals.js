import { getFollowers, getAccountsFollowing } from './connections';

const removeEventListenersFromModal = () => {
    const oldEl = document.querySelector('.confirmation-modal__content');
    var newEl = oldEl.cloneNode(true);
    oldEl.parentNode.replaceChild(newEl, oldEl);
}

export function hideConfirmationModal () {
    const modalEl = document.querySelector('.confirmation-modal');
    modalEl.style.display = 'none';
    removeEventListenersFromModal();
};

const attachClickHandlersToCloseButtons = () => {
    const elements = [document.querySelector('.confirmation-modal__no-button'), document.querySelector('.confirmation-modal__close-button')];
    
    for (let i in elements) {
        elements[i].addEventListener('click', hideConfirmationModal);
    }
}

export const displayConfirmationModal = (query, callback) => {
    document.querySelector('.confirmation-modal__query').innerHTML = `<p>${query}</p>`;
    document.querySelector('.confirmation-modal').style.display = 'block';

    attachClickHandlersToCloseButtons();

    document.querySelector('.confirmation-modal__yes-button').addEventListener('click', function () {
        callback();
        hideConfirmationModal();
    });
};