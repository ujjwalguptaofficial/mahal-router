import { IRoute, IRouterOption } from "./interfaces";
import { RouteHandler } from "./helpers/route_handler";
import { merge } from "mahal";
import { RouteStore } from "./types";
import { ROUTER_LIFECYCLE_EVENT } from "./enums";
import { EventBus } from "mahal";
import { routeInstance } from "./constant";
import { parseQuery, trimSlash } from "./utils";
import { Route } from "./route";

const ROUTER_EVENT_BUS = new EventBus();
export class Router {
    private nextPath: IRoute;
    private prevPath: IRoute;
    splittedPath_: string[];
    isBack: boolean = false;

    _routerBus = ROUTER_EVENT_BUS;

    constructor(routes: RouteStore, option?: IRouterOption) {
        RouteHandler.routes = routes;
        window.addEventListener('popstate', (event) => {
            console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
            // const url = new URL(location.href);
            this.isBack = true;
            this.emitNavigate_(
                this.routeFromUrl_(new URL(location.href))
            );
        });
        this.emitNavigate_(
            this.routeFromUrl_(new URL(location.href))
        );
    }

    goto(to: IRoute) {
        const name = to.name;
        if (name) {
            to.path = RouteHandler.pathByName(to);
            if (!to.path) {
                if (process.env.NODE_ENV != "production") {
                    console.warn(`No route found with name ${name}`);
                }
                return this.emitNotFound_(to);
            }
        }
        this.emitNavigate_(to);
    }

    private initRoute_(val: IRoute) {
        routeInstance.path = val.path;
        routeInstance.param = val.param || {};
        routeInstance.query = val.query || {};
        routeInstance.name = val.name;
    }

    private routeFromUrl_(url: URL): IRoute {
        return {
            path: url.pathname,
            query: parseQuery(url.search),
            param: {}
        }
    }


    onRouteFound_(to: IRoute): Promise<boolean> {
        return new Promise((res) => {
            this.emit(ROUTER_LIFECYCLE_EVENT.BeforeEach, this.nextPath, this.prevPath).then(results => {
                const last = results.pop();
                if (last != null && typeof last == "object") {
                    this.goto(last);
                    res(false);
                }
                else {
                    this.initRoute_(to);
                    if (!this.isBack) {
                        window.history.pushState(
                            merge({ key: performance.now() }),
                            '',
                            RouteHandler.resolve(to as any)
                        );
                    }
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

    private emitNavigate_(route: IRoute) {
        route.query = route.query || {};
        this.nextPath = route;
        this.prevPath = routeInstance;
        this.splittedPath_ = trimSlash(route.path).split("/");
        return ROUTER_EVENT_BUS.emitLinear(
            ROUTER_LIFECYCLE_EVENT.Navigate,
            route
        );
    }

    private emitAfterEach_() {
        this.emit(ROUTER_LIFECYCLE_EVENT.AfterEach, this.nextPath, this.prevPath);
    }

    private emitNotFound_(to) {
        this.emit(ROUTER_LIFECYCLE_EVENT.RouteNotFound, to);
    }

}
