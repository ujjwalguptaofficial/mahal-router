import { T_string_string } from "./types";
import { IRoute, IRouteMeta } from "./interfaces";

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
    meta: IRouteMeta;
}