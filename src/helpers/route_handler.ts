import { trimSlash } from "../utils";
import { RouteStore, T_string_string } from "../types";
import { IRouteFindResult, IRoute } from "../interfaces";
import { Route } from "../route";

let routeStore: RouteStore = {};

const nameMap: { [name: string]: string } = {};
const regex1 = /{(.*)}(?!.)/;

window['regex1'] = regex1;

const findComponent = (routes: RouteStore, splittedPath: string[]): IRouteFindResult => {
    let route = "";
    let param = {};
    const splittedPathLength = splittedPath.length;
    let targetPath;
    let pathIndex;;
    const resetPath = () => {
        pathIndex = 0;
        targetPath = splittedPath[pathIndex];
    }
    resetPath();
    let paths = [];
    for (route in routes) {
        const routeslashSplit = route.split("/");
        if (splittedPathLength < routeslashSplit.length) return;
        let isRouteFound = false;

        routeslashSplit.every(key => {
            if (key === targetPath) {
                isRouteFound = true;
                paths.push(key);
            }
            else {
                const regMatch1 = key.match(regex1);
                if (regMatch1 != null) {
                    param[regMatch1[1]] = targetPath;
                    isRouteFound = true;
                    paths.push(key.replace(regex1, targetPath));
                }
                else {
                    isRouteFound = false;
                }
            }
            if (isRouteFound) {
                targetPath = splittedPath[++pathIndex];
            }
            return isRouteFound;
        });
        if (isRouteFound) {
            return {
                path: paths.join("/"),
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
                //.replace(regex1, 'someValue');
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

    static pathByName(route: IRoute) {
        let path = nameMap[route.name];
        if (path && path.match(regex1)) {
            const splittedPath = path.split("/");
            let modifiedPaths = [];
            splittedPath.forEach(item => {
                const regexMatch = item.match(regex1);
                if (regexMatch) {
                    modifiedPaths.push(
                        route.param[regexMatch[1]]
                    );
                }
                else {
                    modifiedPaths.push(item);
                }
            });
            return modifiedPaths.join("/");
        }
        return path;
    }

    static resolve(route: Route) {
        let path = "";
        if (route.path) {
            path = route.path;
        }
        else if (route.name) {
            path = RouteHandler.pathByName(route);
            if (!path) {
                throw `Invalid route - no route found with name ${route.name}`;
            }
        }

        const query = route.query;
        if (query) {
            let queryString = Object.keys(query).reduce((prev, next) => {
                return prev + `${next}=${query[next]}&`
            }, "?");
            const queryStringLength = queryString.length;
            if (queryString[queryStringLength - 1] === "&") {
                queryString = queryString.substr(0, queryStringLength - 1);
                path += queryString;
            }
        }
        return path;
    }

}