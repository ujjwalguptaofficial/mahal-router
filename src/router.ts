import { IRoute, IRouterOption } from "./interfaces";
import { RouteHandler } from "./helpers/route_handler";
import { merge } from "mahal";
import { RouteStore } from "./types";
import { ROUTER_LIFECYCLE_EVENT } from "./enums";
import { EventBus } from "mahal";
import { route } from "./constant";
import { parseQuery, trimSlash } from "./utils";

const ROUTER_EVENT_BUS = new EventBus();
export class Router {
    private nextPath: IRoute;
    private prevPath: IRoute;
    splittedPath_: string[];

    constructor(routes: RouteStore, option?: IRouterOption) {
        RouteHandler.routes = routes;
        window.addEventListener('popstate', (event) => {
            console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
            const url = new URL(location.href);
            this.emitNavigate_(url, true);
        });
        this.initRouteFromUrl_(new URL(location.href));
        this.nextPath = {
            path: route.path
        };
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

        this.nextPath = to;
        this.prevPath = {
            name: route.name,
            path: route.path,
            param: route.param,
            query: route.query
        };
        this.emitNavigate_(url);
    }

    private initRoute_(val: IRoute) {
        route.path = val.path;
        route.param = val.param;
        route.query = val.query || {};
        route.name = val.name;
    }

    private initRouteFromUrl_(url: URL) {
        route.path = url.pathname;
        this.splittedPath_ = trimSlash(route.path).split("/");
        route.param = {};
        route.query = parseQuery(url.search);
    }


    onRouteFound_(value: IRoute): Promise<boolean> {
        return new Promise((res) => {
            this.emit(ROUTER_LIFECYCLE_EVENT.BeforeEach, this.nextPath, this.prevPath).then(results => {
                const last = results.pop();
                if (last != null && typeof last == "object") {
                    this.goto(last);
                    res(false);
                }
                else {
                    this.initRoute_(value);
                    window.history.pushState(
                        merge({ key: performance.now() }, this.nextPath.state || {}),
                        '',
                        value.path
                    );
                    res(true);
                }
            })
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

    emit(event: string, ...data) {
        return ROUTER_EVENT_BUS.emit(event, ...data);
    }

    private emitNavigate_(url: URL, isBack?) {
        this.splittedPath_ = trimSlash(url.pathname).split("/");
        return this.emit(ROUTER_LIFECYCLE_EVENT.Navigate, { url, isBack: isBack });
    }

    private emitAfterEach_() {
        this.emit(ROUTER_LIFECYCLE_EVENT.AfterEach, this.nextPath, this.prevPath);
    }
}
