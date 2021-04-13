import { IRoute, IRouterOption, IRouteFindResult } from "./interfaces";
import { RouteHandler } from "./helpers/route_handler";
import { merge } from "mahal";
import { RouteStore } from "./types";
import { ROUTER_LIFECYCLE_EVENT } from "./enums";
import { EventBus } from "mahal";
import { routeInstance } from "./constant";
import { parseQuery, trimSlash } from "./utils";

const ROUTER_EVENT_BUS = new EventBus();
export class Router {
    private nextPath: IRoute;
    private prevPath: IRoute;
    splittedPath_: string[];
    isBack: boolean = false;

    _routerBus = ROUTER_EVENT_BUS;
    _isStart_ = true;
    _matched_;

    constructor(routes: RouteStore, option?: IRouterOption) {
        RouteHandler.routes = routes;
        window.addEventListener('popstate', (event) => {
            this.isBack = true;
            this.goto(this.routeFromUrl_(location))
        });
        this.goto(this.routeFromUrl_(location))
    }

    goto(to: IRoute) {
        if (typeof to === "string") {
            to = {
                path: to as any
            }
        }
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
        const splittedPath = trimSlash(to.path).split("/");
        const loaded = [];
        const matched: { [key: string]: IRouteFindResult } = {};
        splittedPath.every(item => {
            const result = RouteHandler.findComponent(splittedPath, loaded);
            if (result) {
                matched[item] = result
                loaded.push(item);
                return true;
            }
            return false;
        });
        if (loaded.length == 0 || splittedPath.length !== loaded.length) {
            return this.emitNotFound_(to);
        }
        to.param = loaded.reduce((prev, item) => {
            return merge(prev, item.param)
        }, {});
        const routePath = loaded.pop();
        to.name = matched[routePath].name;
        this.splittedPath_ = splittedPath;
        this._matched_ = matched;
        console.log("matched", matched);
        this.emitBeforeEach(to).then(_ => {
            this.emitNavigate_(to);
        })
        // this.onRouteFound_(to).then(shouldNavigate => {
        //     if (!shouldNavigate) return;

        // })
    }

    private initRoute_(val: IRoute) {
        routeInstance.path = val.path;
        routeInstance.param = val.param || {};
        routeInstance.query = val.query || {};
        routeInstance.name = val.name;
    }

    routeFromUrl_(url: URL | Location): IRoute {
        return {
            path: url.pathname,
            query: parseQuery(url.search)
        }
    }

    emitBeforeEach(to) {
        return new Promise((res) => {
            this.emit(ROUTER_LIFECYCLE_EVENT.BeforeEach, to, routeInstance).then(results => {
                const last = results.pop();
                if (last != null && typeof last == "object") {
                    this.goto(last);
                    res(false);
                }
                else {
                    res(true);
                }
            })
        })
    }

    _changeRoute_(to: IRoute) {
        this.initRoute_(to);
        if (!this.isBack && !this._isStart_) {
            window.history.pushState(
                merge({ key: performance.now() }),
                '',
                RouteHandler.resolve(to as any)
            );
        }
        else {
            this.isBack = this._isStart_ = false;
        }
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

    emitNavigate_(route: IRoute) {
        route.query = route.query;
        this.nextPath = route;
        this.prevPath = routeInstance;
        // this.splittedPath_ = trimSlash(route.path).split("/");
        return ROUTER_EVENT_BUS.emitLinear(
            ROUTER_LIFECYCLE_EVENT.Navigate,
            route
        );
    }

    emitAfterEach_() {
        this.emit(ROUTER_LIFECYCLE_EVENT.AfterEach, this.nextPath, this.prevPath);
    }

    emitNotFound_(to) {
        this.emit(ROUTER_LIFECYCLE_EVENT.RouteNotFound, to);
    }

}
