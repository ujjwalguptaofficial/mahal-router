export const trimSlash = (url: string) => {
    // remove / from string at 0th index
    if (url[0] === "/") {
        url = url.substr(1);
    }
    const urlLength = url.length;
    // removing / from url;
    if (url[urlLength - 1] === "/") {
        url = url.substr(0, urlLength - 1);
    }
    return url;
};