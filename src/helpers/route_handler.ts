import { trimSlash } from "../utils";
import { RouteStore, T_string_string } from "../types";
import { IRouteFindResult } from "../interfaces";
import { Route } from "../route";

let routeStore: RouteStore = {};

const nameMap: { [name: string]: string } = {};
const regex1 = /{(.*)}(?!.)/;



const findComponent = (routes: RouteStore, splittedPath: string[]): IRouteFindResult => {
    let route = "";
    let param = {};
    const splittedPathLength = splittedPath.length;
    let path;
    let pathIndex;;
    const resetPath = () => {
        pathIndex = 0;
        path = splittedPath[pathIndex];
    }
    resetPath();
    for (route in routes) {
        const routeslashSplit = route.split("/");
        if (splittedPathLength < routeslashSplit.length) return;
        let isRouteFound = false;

        routeslashSplit.every(key => {
            if (key === path) {
                isRouteFound = true;
            }
            else {
                const regMatch1 = key.match(regex1);
                if (regMatch1 != null) {
                    param[regMatch1[1]] = path;
                    isRouteFound = true;
                }
                else {
                    isRouteFound = false;
                }
            }
            if (isRouteFound) {
                path = splittedPath[++pathIndex];
            }
            return isRouteFound;
        })
        if (isRouteFound) {
            return {
                key: route,
                comp: routes[route].component,
                param: param,
                name: routes[route].name
            }
        }
        else {
            resetPath();
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

    static findComponent(splittePath: string[], loaded: string[]) {
        // immutable array
        splittePath = Array.from(splittePath);

        let routes = routeStore;
        loaded.forEach(item => {
            splittePath.shift();
            routes = routes[item].children;
        });

        return findComponent(routes, splittePath);
    }

    static pathByName(name: string) {
        return nameMap[name];
    }

    static resolve(route: Route) {
        let path = "";
        if (route.path) {
            path = route.path;
        }
        else if (route.name) {
            path = RouteHandler.pathByName(route.name);
            if (!path) {
                throw `Invalid route - no route found with name ${route.name}`;
            }
        }

        if (route.param) {
            // const query = route.query;
            // path += Object.keys(query).reduce((prev, next) => {
            //     return prev + `${next}=${query[next]}&`
            // }, "?");
            // const pathLength = path.length;
            // if (path[pathLength - 1] === "&") {
            //     path = path.substr(0, pathLength - 1);
            // }
        }
        if (route.query) {
            const query = route.query;
            path += Object.keys(query).reduce((prev, next) => {
                return prev + `${next}=${query[next]}&`
            }, "?");
            const pathLength = path.length;
            if (path[pathLength - 1] === "&") {
                path = path.substr(0, pathLength - 1);
            }
        }
        return path;
    }

}