import { IRoute, IRouterOption, IRouteFindResult } from "./interfaces";
import { getHistory, RouteManager } from "./helpers";
import { merge } from "mahal";
import { RouteStore, RouterLifeCycleEvent } from "./types";
import { ROUTER_LIFECYCLE_EVENT, ROUTER_MODE } from "./enums";
import { EventBus } from "mahal";
import { parseQuery, trimSlash } from "./utils";
import { Route } from "./route";

export class Router {
    private nextPath_: IRoute;
    private prevPath_: IRoute;
    private splittedPath_: string[];
    private isNavigatedByBrowser_: boolean = false;
    private eventBus_ = new EventBus();
    private _isStart_ = true;
    private _matched_: { [key: string]: IRouteFindResult };
    private routeManager_: RouteManager;
    private option_: IRouterOption;

    private history_: History;

    private isHistoryMode_ = false;

    currentRoute = new Route();

    constructor(routes: RouteStore, option?: IRouterOption) {
        this.option_ = option = option || {
            mode: ROUTER_MODE.History
        } as IRouterOption;
        this.routeManager_ = new RouteManager(routes);
        this.isHistoryMode_ = option.mode === ROUTER_MODE.History;

        this.history_ = getHistory(option.mode as any);

        if (option.mode === ROUTER_MODE.History) {
            window.addEventListener('popstate', (event) => {
                this.isNavigatedByBrowser_ = true;
                this.goto(this.routeFromUrl_(location))
            });
            this.goto(this.routeFromUrl_(location));
        }
    }

    gotoPath(path: string) {
        const route = {
            path: path
        };
        this.goto(route);
    }

    goto(to: IRoute) {
        const name = to.name;
        if (name) {
            to.path = this.routeManager_.pathByName(to);
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
            const result = this.routeManager_.findComponent(splittedPath, storedRoutes);
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
            const result = this.routeManager_.findComponent(["*"], []);
            to.name = result.name;
            to.query = to.query || {};
            to.param = result.param;
            this.emitNotFound_(to);
            this.splittedPath_ = ["*"];
            matched["*"] = result;
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
        const routeInstance = this.currentRoute;
        routeInstance.path = val.path;
        routeInstance.param = val.param || {};
        routeInstance.query = val.query || {};
        routeInstance.name = val.name;
    }

    private routeFromUrl_(url: URL | Location): IRoute {
        return {
            path: url.pathname,
            query: url.search && parseQuery(url.search)
        }
    }

    private emitBeforeEach(to) {
        return this.emit(ROUTER_LIFECYCLE_EVENT.BeforeEach, to).then(results => {
            const result = results.pop();
            if (result != null) {
                const resultType = typeof result;
                if (resultType == "object") {
                    this.goto(result);
                    return false;
                }
                else if (resultType == "boolean") {
                    return result;
                }
            }
            return true;
        })
    }

    private _changeRoute_(to: IRoute) {
        this.initRoute_(to);
        if (!this.isNavigatedByBrowser_ && !this._isStart_) {
            if (this.isHistoryMode_) {
                this.history_.pushState(
                    merge({ key: performance.now() }),
                    '',
                    this.routeManager_.resolve(to as any)
                );
            }
        }
        else {
            this.isNavigatedByBrowser_ = this._isStart_ = false;
        }
    }

    back() {
        this.history_.back();
    }

    go(delta: number = 1) {
        this.history_.go(delta);
    }

    on(event: RouterLifeCycleEvent, cb: Function) {
        this.eventBus_.on(event, cb);
        return this;
    }

    off(event: string, cb?: Function) {
        this.eventBus_.off(event, cb);
    }

    emit(event: string, ...data) {
        return this.eventBus_.emit(event, ...data);
    }

    private emitNavigate_(route: IRoute) {
        route.query = route.query;
        this.nextPath_ = route;
        this.prevPath_ = merge({}, this.currentRoute);
        // this.splittedPath_ = trimSlash(route.path).split("/");
        return this.eventBus_.emitLinear(
            ROUTER_LIFECYCLE_EVENT.Navigate,
            route
        );
    }

    private emitAfterEach_() {
        this.emit(ROUTER_LIFECYCLE_EVENT.AfterEach, this.nextPath_, this.prevPath_);
    }

    private emitNotFound_(to) {
        this.emit(ROUTER_LIFECYCLE_EVENT.RouteNotFound, to);
    }

}
