import { trimSlash } from "../utils";
import { Component } from "mahal";
import { RouteStore } from "../types";

let routeStore: RouteStore = {};

const nameMap: { [name: string]: string } = {};

const findComponent = (routes: RouteStore, splittedPath: string[]) => {
    const path = splittedPath.shift();
    if (path.length === 0) return routes["/"].component;
    for (const key in routes) {
        if (key === path) {
            return {
                key: key,
                comp: routes[key].component
            }
            // if (splittedPath.length === 0) {
            //     return routes[key].component;
            // }
            // return findComponent(routes[key].children, splittedPath);
        }
    }
};
export class RouteHandler {
    static set routes(val: RouteStore) {
        const trimSlashFromRoutes = (data: RouteStore, parentPath: string = "") => {
            for (const key in data) {
                const newKey = trimSlash(key);
                if (newKey != key) {
                    data[newKey] = data[key];
                    delete data[key];
                }
                let path = parentPath + "/" + newKey;
                if (data[newKey].name) {
                    nameMap[data[newKey].name] = path;
                }
                if (data[newKey].children) {
                    trimSlashFromRoutes(data[newKey].children, path);
                }
            }
        }
        trimSlashFromRoutes(val);
        routeStore = val;
        console.log("namedmap", nameMap);
    }

    static findComponent(splittePath: string[], loaded) {
        // immutable array
        splittePath = Array.from(splittePath);

        let routes = routeStore;
        loaded.forEach(item => {
            splittePath.shift();
            routes = routeStore[item].children;
        });

        return findComponent(routes, splittePath);
    }

    static pathByName(name: string) {
        return nameMap[name];
    }

}