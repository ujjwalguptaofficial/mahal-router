import { IRoute, IRouterOption, IRouteFindResult } from "./interfaces";
import { getHistory, RouteManager } from "./helpers";
import { merge } from "mahal";
import { RouteStore } from "./types";
import { ROUTER_LIFECYCLE_EVENT, ROUTER_MODE } from "./enums";
import { EventBus } from "mahal";
import { routeInstance } from "./constant";
import { parseQuery, trimSlash } from "./utils";

const ROUTER_EVENT_BUS = new EventBus();
export class Router {
    private nextPath: IRoute;
    private prevPath: IRoute;
    splittedPath_: string[];
    isNavigatedByBrowser: boolean = false;

    _routerBus = ROUTER_EVENT_BUS;
    _isStart_ = true;
    _matched_: { [key: string]: IRouteFindResult };
    routeManager: RouteManager;

    option: IRouterOption;

    history: History;

    isHistoryMode = false;

    constructor(routes: RouteStore, option?: IRouterOption) {
        this.option = option = option || {
            mode: ROUTER_MODE.History
        } as IRouterOption;
        this.routeManager = new RouteManager(routes);
        this.isHistoryMode = option.mode === ROUTER_MODE.History;

        this.history = getHistory(option.mode as any);

        if (option.mode === ROUTER_MODE.History) {
            window.addEventListener('popstate', (event) => {
                this.isNavigatedByBrowser = this.isHistoryMode;
                this.goto(this.routeFromUrl_(location))
            });
        }
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
            to.path = this.routeManager.pathByName(to);
            if (!to.path) {
                if (process.env.NODE_ENV != "production") {
                    console.warn(`No route found with name ${name}`);
                }
                return this.emitNotFound_(to);
            }
        }
        const splittedPath = trimSlash(to.path).split("/");
        const storedRoutes = [];
        const matched: { [key: string]: IRouteFindResult } = {};
        let paths = [];
        splittedPath.every(_ => {
            const result = this.routeManager.findComponent(splittedPath, storedRoutes);
            if (result) {
                matched[result.path] = result
                storedRoutes.push(result.key);
                paths.push(result.path);
                return true;
            }
            return false;
        });

        splittedPath.forEach((_, index) => {
            if (paths[index] == null) {
                const pathRemoved = splittedPath.splice(index, 1)[0];
                splittedPath[index - 1] = splittedPath[index - 1] + "/" + pathRemoved;
            }
        });

        if (storedRoutes.length == 0 || splittedPath.length !== storedRoutes.length) {
            this.emitNotFound_(to);
            this.splittedPath_ = ["*"];
            matched["*"] = this.routeManager.findComponent(["*"], []);
        }
        else {
            to.query = to.query || {};
            let param = {};
            for (const key in matched) {
                param = merge(param, matched[key].param);
            }
            to.param = param;
            const routePath = paths.pop();
            to.name = matched[routePath].name;
            this.splittedPath_ = splittedPath;
        }

        this._matched_ = matched;

        this.emitBeforeEach(to).then(shouldNavigate => {
            if (shouldNavigate) {
                this.emitNavigate_(to);
            }
        })
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
            query: url.search && parseQuery(url.search)
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
        if (!this.isNavigatedByBrowser && !this._isStart_) {
            if (this.isHistoryMode) {
                this.history.pushState(
                    merge({ key: performance.now() }),
                    '',
                    this.routeManager.resolve(to as any)
                );
            }
        }
        else {
            this.isNavigatedByBrowser = this._isStart_ = false;
        }
    }

    back() {
        this.history.back();
    }

    go(delta: number = 1) {
        this.history.go(delta);
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
