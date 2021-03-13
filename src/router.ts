import { IRoute, IRouterOption } from "./interfaces";
import { RouteHandler } from "./helpers/route_handler";
import { merge } from "mahal";
import { RouteStore } from "./types";
import { ROUTER_LIFECYCLE_EVENT } from "./enums";
import { EventBus } from "mahal";
import { route } from "./constant";

const ROUTER_EVENT_BUS = new EventBus();
export class Router {

    private routeEnds: { to: IRoute, from: IRoute };

    constructor(routes: RouteStore, option?: IRouterOption) {
        RouteHandler.routes = routes;
        window.addEventListener('popstate', (event) => {
            console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
            const url = new URL(location.href);
            this.navigate_(url, true);
        });
        (route as any).setProp_(new URL(location.href));
        this.routeEnds = {
            to: {
                path: route.path
            },
            from: null
        }
    }

    goto(to: IRoute) {
        const name = to.name;
        if (name) {
            to.path = RouteHandler.pathByName(name);
            if (!to.path) {
                return console.warn(`No route found with name ${name}`);
            }
        }
        const url = new URL(location.origin + to.path);
        if (to.query) {
            for (const key in to.query) {
                url.searchParams.set(key, to.query[key]);
            }
        }
        this.routeEnds = {
            to: to,
            from: {
                name: route.name,
                path: route.path
            }
        };
        this.emit(ROUTER_LIFECYCLE_EVENT.BeforeEach, this.routeEnds).then(results => {
            const last = results.pop();
            //strict equal false means stop the navigation
            if (last === false) return;
            else if (typeof last == "object") {
                return this.goto(last);
            }
            window.history.pushState(
                merge({ key: performance.now() }, to.state || {}),
                '',
                url as any
            );
            this.navigate_(url);
        })

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
        return ROUTER_EVENT_BUS.emit(event, data);
    }

    private navigate_(url: URL, isBack?) {
        (route as any).setProp_(url);
        return this.emit(ROUTER_LIFECYCLE_EVENT.Navigate, { url, isBack: isBack });
    }

    private emitAfterEach_() {
        this.emit(ROUTER_LIFECYCLE_EVENT.AfterEach, this.routeEnds);
    }
}
