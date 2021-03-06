import { trimSlash } from "./utils";
import { ROUTE_EVENT_BUS, ROUTER_EVENT_BUS } from "./constant";

export class Route {
    /**
     * pathaname constains only relative url not querystring
     *
     * @type {string}
     * @memberof Route
     */
    pathname: string;

    private splittedPath_;


    constructor() {
        this.setProp(location as any);
        ROUTER_EVENT_BUS.on("to", ({ url }) => {
            this.setProp(url);
        })
    }

    setProp(url: URL) {
        this.pathname = url.pathname;
        this.splittedPath_ = trimSlash(this.pathname).split("/");
    }

}