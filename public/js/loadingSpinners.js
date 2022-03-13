export const hideAllSpinners = () => {
    const spinnerElements = document.querySelectorAll('.loading-spinner');

    for (let x of spinnerElements) {
        x.style.display = 'none';
    }
};