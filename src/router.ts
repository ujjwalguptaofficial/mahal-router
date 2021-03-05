import { RouteStore } from "./interfaces";
import { RouteHandler } from "./helpers/route_handler";
export interface IRoute {
    path: string;
    name: string;
    query: { [key: string]: any };
    param: { [key: string]: any };
}

export class Router {

    private handler_ = RouteHandler;
    
    constructor(routes: RouteStore) {
        RouteHandler.routes = routes;
    }

    goto(route: IRoute) {
        const url = new URL(route.path);
        if (route.query) {
            for (const key in route.query) {
                url.searchParams.set(key, route.query[key]);
            }
        }
        window.history.pushState({}, '', url as any);
    }

    back() {
        history.back();
    }

    go(delta: number = 1) {
        history.go(delta);
    }

    routeEntering() {

    }

    routeEntered() {

    }
}
