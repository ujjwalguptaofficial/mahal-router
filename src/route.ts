import { trimSlash } from "./utils";
import { T_string_string } from "./types";
import { IRoute } from "./interfaces";

export class Route implements IRoute {
    /**
     * pathaname constains only relative url not querystring
     *
     * @type {string}
     * @memberof Route
     */
    path: string;

    param: T_string_string;
    query: T_string_string;
    name: string;

    private splittedPath_;

    private setProp_(url: URL) {
        this.path = url.pathname;
        this.splittedPath_ = trimSlash(this.path).split("/");
        this.param = {};
        this.query = this.parseQuery(url.search);
    }

    private parseQuery(queryString: string) {
        var query = {};
        var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
        for (let i = 0, len = pairs.length; i < len; i++) {
            var pair = pairs[i].split('=');
            query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
        return query;
    }

}