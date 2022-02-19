import { IRoute, IRouterOption, IRouteFindResult } from "./interfaces";
import { ErrorHelper, getHistory, RouteManager } from "./helpers";
import { merge } from "mahal";
import { RouteStore, RouterLifeCycleEvent } from "./types";
import { ERROR_TYPE, ROUTER_LIFECYCLE_EVENT, ROUTER_MODE } from "./enums";
import { EventBus } from "mahal";
import { parseQuery, trimSlash } from "./utils";
import { Route } from "./route";
import { RouteNotFound } from "./components";

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

    history: History;

    private isHistoryMode_ = false;

    currentRoute = new Route();

    constructor(routes: RouteStore, option?: IRouterOption) {
        this.option_ = option = option || {
            mode: ROUTER_MODE.History
        } as IRouterOption;

        this.routeManager_ = new RouteManager(routes);
        this.isHistoryMode_ = option.mode === ROUTER_MODE.History;

        this.history = getHistory(option.mode as any);

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
        return this.goto(route);
    }

    goto(to: IRoute) {
        const name = to.name;
        if (name) {
            const path = this.routeManager_.pathByName(to);
            if (!path) {
                if (process.env.NODE_ENV !== "production") {
                    console.warn(`No route found with name ${name}`);
                }
                
                return Promise.resolve(null);
            }
            to.path = path;
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

        const isNotFound = storedRoutes.length == 0 || splittedPath.length !== storedRoutes.length;

        if (isNotFound) {
            const result = this.routeManager_.findComponent(["*"], []) || {
                comp: RouteNotFound,
                key: '*',
                name: 'NotFound',
                path: to.path,
                param: to.param || {}
            };
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

        return this.emitBeforeEach(to).then(result => {
            if (result.success) {
                return this.emitNavigate_(to).then(errs => {
                    const err = errs.find(q => q != null);
                    if (!err) {
                        this._changeRoute_(to);
                    }
                    this.emitAfterEach_(err);
                    return err;
                }).catch(error => {
                    this.emitAfterEach_(error);
                })
            }
            else {
                const err = new ErrorHelper(
                    result.cancelled ? ERROR_TYPE.NavigationCancelled :
                        ERROR_TYPE.NavigationAborted,
                    {
                        from: this.currentRoute.path, to: to.path,
                        path: result.cancelled.path
                    }
                ).get();
                this.emitAfterEach_(err);
                return err;
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
                    return { success: false, cancelled: result };
                }
                else if (resultType == "boolean") {
                    return { success: result, cancelled: to };
                }
            }
            return { success: true };
        })
    }


    private _changeRoute_(route: IRoute) {
        this.initRoute_(route);
        if (!this.isHistoryMode_ || (!this.isNavigatedByBrowser_ && !this._isStart_)) {
            this.history.pushState(
                merge({ key: performance.now() }),
                '',
                this.routeManager_.resolve(route as any)
            );
        }
        else {
            this.isNavigatedByBrowser_ = this._isStart_ = false;
        }
    }

    back() {
        this.history.back();
    }

    go(delta: number = 1) {
        this.history.go(delta);
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

    private emitAfterEach_(error?) {
        this.emit(ROUTER_LIFECYCLE_EVENT.AfterEach, this.nextPath_, this.prevPath_, error);
    }

    private emitNotFound_(to) {
        this.emit(ROUTER_LIFECYCLE_EVENT.RouteNotFound, to);
    }

}
