export const modifyClassOnElement = (el, className, action) => {
    if (action === 'remove') el.classList.remove(className);
    if (action === 'add') el.classList.add(className);
};