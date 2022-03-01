export const showLoadingSpinner = (el) => {
    document.querySelector(el).style.display = 'inline-block';
};

export const hideAllSpinners = () => {
    const spinnerElements = document.querySelectorAll('.loading-spinner');

    for (let x of spinnerElements) {
        x.style.display = 'none';
    }
};