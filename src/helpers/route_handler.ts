import { RouteStore } from "../interfaces";
import { trimSlash } from "../utils";

let routeStore: RouteStore = {};

const findComponent = (routes: RouteStore, splittedPath: string[]) => {
    if (splittedPath.length === 0) return routes["/"];
    const path = splittedPath.shift();
    for (const key in routes) {
        if (key === path) {
            if (splittedPath.length === 0) {
                return routes[key].component;
            }
            return findComponent(routes[key].children, splittedPath);
        }
    }
};
export class RouteHandler {
    static set routes(val: RouteStore) {
        routeStore = val;
    }

    static findComponent(path: string) {
        path = trimSlash(path);
        return findComponent(routeStore, path.split("/"));
    }

}