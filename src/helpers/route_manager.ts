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
        if (splittedPathLength >= routeslashSplit.length) {
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
                const foundRoute = routes[route];
                const routeResult = {
                    path: paths.join("/"),
                    key: route,
                    comp: foundRoute.component,
                    param: param,
                    name: foundRoute.name,
                    meta: foundRoute.meta
                } as IRouteFindResult;
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
    }
    return routesFound.pop();
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

    findComponent(splittedPath: string[], loaded: string[]) {
        let routes = this.routeStore_;
        loaded.forEach(item => {
            routes = routes[item].children;
        });

        const result = findComponent(routes, splittedPath.slice(loaded.length));
        if (result) {
            // join route with multiple shash into one
            splittedPath.splice(loaded.length, result.path.split("/").length, result.path);
        }
        return result;
    }

    pathByName(route: IRoute) {
        let path = nameMap[route.name];
        const result = {
            path: path,
            error: null
        };
        if (path) {
            const splittedPath = path.split("/");
            let modifiedPaths = [];
            splittedPath.every(item => {
                const regexMatch = item.match(regex1);
                if (regexMatch) {
                    if (!route.param) {
                        result.error = `Expecting param - no param is provided in route ${JSON.stringify(route)}`
                        return false;
                    }

                    if (process.env.NODE_ENV !== "production") {
                        const paramVariable = regexMatch[1];
                        if (!route.param[paramVariable]) {
                            result.error = `Expecting param '${paramVariable}' but is not provided`;
                            return false;
                        }
                    }

                    modifiedPaths.push(
                        route.param[regexMatch[1]]
                    );
                }
                else {
                    modifiedPaths.push(item);
                }
                return true;
            });
            result.path = modifiedPaths.join("/");
        }
        return result;
    }

    resolve(route: Route) {
        let path = "";
        if (route.path) {
            path = route.path;
        }
        else if (route.name) {
            path = this.pathByName(route).path;
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