import { trimSlash } from "./utils";
import { ROUTER_EVENT_BUS } from "./constant";
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
    query: T_string_string;
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
        this.query = this.parseQuery(url.search);

    }

    private parseQuery(queryString: string) {
        var query = {};
        var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('=');
            query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
        return query;
    }

}