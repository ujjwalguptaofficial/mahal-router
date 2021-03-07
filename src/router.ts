import { RouteStore, IRoute, IRouterOption } from "./interfaces";
import { RouteHandler } from "./helpers/route_handler";
import { ROUTE_EVENT_BUS, ROUTER_EVENT_BUS } from "./constant";
import { merge } from "mahal";



export class Router {

    constructor(routes: RouteStore, option: IRouterOption) {
        RouteHandler.routes = routes;
        window.addEventListener('popstate', (event) => {
            console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
            const url = new URL(location.href);
            this.emit("to", { url });
        });
    }

    goto(route: IRoute) {
        const name = route.name;
        if (name) {
            route.path = RouteHandler.pathByName(name);
            if (!route.path) {
                return console.warn(`No route found with name ${name}`);
            }
        }
        const url = new URL(location.origin + route.path);
        if (route.query) {
            for (const key in route.query) {
                url.searchParams.set(key, route.query[key]);
            }
        }
        window.history.pushState(
            merge({ key: performance.now() }, route.state || {}),
            '',
            url as any
        );
        this.emit("to", { url });
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
