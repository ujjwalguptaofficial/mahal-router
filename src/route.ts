import { trimSlash } from "./utils";
import { ROUTE_EVENT_BUS, ROUTER_EVENT_BUS } from "./constant";
import { T_string_string } from "./types";

export class Route {
    /**
     * pathaname constains only relative url not querystring
     *
     * @type {string}
     * @memberof Route
     */
    pathname: string;

    param: T_string_string;
    query: URLSearchParams;
    name: string;

    private splittedPath_;


    constructor() {
        this.setProp(new URL(location.href));
        ROUTER_EVENT_BUS.on("to", ({ url }) => {
            this.setProp(url);
        })
    }

    setProp(url: URL) {
        this.pathname = url.pathname;
        this.splittedPath_ = trimSlash(this.pathname).split("/");
        this.param = {};
        this.query = url.searchParams;
    }

}