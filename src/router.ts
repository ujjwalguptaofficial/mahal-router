import { RouteStore } from "./interfaces";
import { RouteHandler } from "./helpers/route_handler";
import { ROUTE_EVENT_BUS, ROUTER_EVENT_BUS } from "./constant";
export interface IRoute {
    path?: string;
    name?: string;
    query?: { [key: string]: any };
    param?: { [key: string]: any };
}

export class Router {

    private handler_ = RouteHandler;

    constructor(routes: RouteStore) {
        RouteHandler.routes = routes;
    }

    goto(route: IRoute) {
        const url = new URL(location.origin + route.path);
        if (route.query) {
            for (const key in route.query) {
                url.searchParams.set(key, route.query[key]);
            }
        }
        this.emit("to", { url, route });
        window.history.pushState({}, '', url as any);
    }

    back() {
        history.back();
    }

    go(delta: number = 1) {
        history.go(delta);
    }

    on(event: string, cb: Function) {
        ROUTER_EVENT_BUS.on(event, cb);
        return this;
    }

    off(event: string, cb: Function) {
        ROUTER_EVENT_BUS.off(event, cb);
    }

    emit(event: string, data?: any) {
        ROUTER_EVENT_BUS.emit(event, data);
    }

    routeEntering() {

    }

    routeEntered() {

    }
}
