import { RouteStore } from "../interfaces";
import { trimSlash } from "../utils";
import { Component } from "mahal";

let routeStore: RouteStore = {};

const findComponent = (routes: RouteStore, splittedPath: string[]) => {
    const path = splittedPath.shift();
    if (path.length === 0) return routes["/"].component;
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
        const trimSlashFromRoutes = (data: RouteStore) => {
            for (const key in data) {
                const newKey = trimSlash(key);
                if (newKey != key) {
                    data[newKey] = data[key];
                    delete data[key];
                }
                if (data[newKey].children) {
                    trimSlashFromRoutes(data[newKey].children);
                }
            }
        }
        trimSlashFromRoutes(val);
        routeStore = val;
    }

    static findComponent(path: string): typeof Component | null {
        path = trimSlash(path);
        return findComponent(routeStore, path.split("/"));
    }

}