export const hideAlert = () => {
    document.querySelector('.alert').innerHTML = '';
};

export const displayAlert = (type, message) => {
    document.querySelector(
        '.alert'
    ).innerHTML = `<p class="alert__content alert__content--${type}">${message}</p>`;
    setTimeout(hideAlert, 2000);
};
