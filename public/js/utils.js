export const removeActiveClasses = (classes) => {
    classes.forEach((className) => {
        const elem = document.querySelector(className);
        const activeClass = className.substr(1, className.length) + '--active';

        elem.classList.remove(activeClass);
    });
};

export const clearActiveClassOnAllElements = (className, exceptionId) => {
    const elems = document.querySelectorAll('.' + className);

    elems.forEach((el) => {
        if (el.id !== exceptionId) {
            el.classList.remove(`${className}--active`);
        }
    });
};
