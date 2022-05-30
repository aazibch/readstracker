export const removeActiveClasses = (classes) => {
    classes.forEach((className) => {
        const elem = document.querySelector(className);
        const activeClass = className.substr(1, className.length) + '--active';

        elem.classList.remove(activeClass);
    });
};
