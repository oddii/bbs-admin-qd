export const debounce = (func, wait) => {
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);

        timer = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
};

export const downloadFile = (filename, url) => {
    // window.open(new URL(document.URL).origin + url)
    window.open(url)
}