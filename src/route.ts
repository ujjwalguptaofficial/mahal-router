import { trimSlash } from "./utils";

export class Route {
    /**
     * pathaname constains only relative url not querystring
     *
     * @type {string}
     * @memberof Route
     */
    pathname: string = location.pathname;

    private splittedPath_ = trimSlash(this.pathname).split("/");


    constructor() {
        window.addEventListener('popstate', (e) => {
            console.log("event", e);
        });
    }
}