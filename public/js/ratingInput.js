let starsContainerElement = document.querySelector('.form__stars');
let starElements;
if (starsContainerElement) {
    starElements = starsContainerElement.children;
}
const selectedStarEl = document.querySelector('.form__star--selected');

let ratingSelected = false;

if (selectedStarEl) {
    ratingSelected = true;
}

export const getIndexOfSelectedElement = () => +document.querySelector('.form__star--selected').getAttribute('data-index');

export const highlightElements = (startIndex, endIndex) => {
    const start = !startIndex ? 0 : startIndex;
    const end = !endIndex ? starElements.length : endIndex;

    for (let i = start; i < end; i++) {
        starElements[i].classList.add('star-highlighted');
    }
};

export const clearHighlightFromElements = (startIndex, endIndex) => {
    const start = !startIndex ? 0 : startIndex;
    const end = !endIndex ? starElements.length : endIndex;

    for (let i = start; i < end; i++) {
        starElements[i].classList.remove('star-highlighted');
    }
};
export const ratingMouseOverHandler = (e) => {
    if (e.target.classList.contains('fa-star')) {
        let starIndex = +e.target.getAttribute('data-index');

        highlightElements(0, starIndex + 1);
        clearHighlightFromElements(starIndex + 1);
    }
}

export const ratingMouseLeaveHandler = function(e) {
    clearHighlightFromElements();

    if (ratingSelected) {
        const selectedIndex = getIndexOfSelectedElement();
        highlightElements(0, selectedIndex + 1);
    }
};

export const ratingClickHandler  = function(e) {
    if (ratingSelected) {
        clearHighlightFromElements();
        document.querySelector('.form__star--selected').classList.remove('form__star--selected');
    }

    if (e.target.classList.contains('fa-star')) {
        e.target.classList.add('form__star--selected');
        const selectedIndex = getIndexOfSelectedElement();
        highlightElements(0, selectedIndex + 1);
        ratingSelected = true;
    }
}