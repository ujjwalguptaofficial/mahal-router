import { trimSlash } from "../utils";
import { RouteStore } from "../types";
import { IRouteFindResult, IRoute } from "../interfaces";
import { Route } from "../route";


const nameMap: { [name: string]: string } = {};
const regex1 = /{(.*)}(?!.)/;

const findComponent = (routes: RouteStore, splittedPath: string[]): IRouteFindResult => {
    let route = "";
    let param = {};
    const splittedPathLength = splittedPath.length;
    let targetPath;
    let pathIndex;;
    let paths = [];
    const resetPath = () => {
        pathIndex = 0;
        targetPath = splittedPath[pathIndex];
        paths = [];
    }
    resetPath();
    const routesFound: IRouteFindResult[] = [];
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
            const routeResult = {
                path: paths.join("/"),
                key: route,
                comp: routes[route].component,
                param: param,
                name: routes[route].name
            };
            // absolute route found
            if (splittedPathLength === routeslashSplit.length) {
                return routeResult;
            }
            else { // continue searching for absolute route
                routesFound.push(routeResult);
                resetPath();
            }
        }
        else {
            resetPath();
        }
    }
    return routesFound[0];
};
export class RouteManager {
    private routeStore_: RouteStore = {};

    constructor(val: RouteStore) {
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
        this.routeStore_ = val;
    }

    findComponent(splittePath: string[], loaded: string[]) {
        // immutable array
        splittePath = Array.from(splittePath);

        let routes = this.routeStore_;
        loaded.forEach(item => {
            splittePath.shift();
            routes = routes[item].children;
        });

        return findComponent(routes, splittePath);
    }

    pathByName(route: IRoute) {
        let path = nameMap[route.name];
        if (path && path.match(regex1)) {
            const splittedPath = path.split("/");
            let modifiedPaths = [];
            splittedPath.forEach(item => {
                const regexMatch = item.match(regex1);
                if (regexMatch) {
                    if (!route.param) {
                        return Promise.reject(
                            `Expecting param - no param is provided in route ${JSON.stringify(route)}`
                        );
                    }
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

    resolve(route: Route) {
        let path = "";
        if (route.path) {
            path = route.path;
        }
        else if (route.name) {
            path = this.pathByName(route);
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