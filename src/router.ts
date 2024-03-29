import { IRoute, IRouterOption, IRouteFindResult, IClientMetaTag, IRouteMeta, IClientAppMeta } from "./interfaces";
import { ErrorHelper, getHistory, RouteManager } from "./helpers";
import { Component, merge } from "mahal";
import { RouteStore, RouterLifeCycleEvent } from "./types";
import { ERROR_TYPE, ROUTER_LIFECYCLE_EVENT, ROUTER_MODE } from "./enums";
import { EventBus } from "mahal";
import { parseQuery, trimSlash } from "./utils";
import { Route } from "./route";
import { RouteNotFound } from "./components";

export class Router {
    private _nextPath_: IRoute;
    private _prevPath_: IRoute;
    private _splittedPath_: string[];
    private _isNavigatedByBrowser_: boolean = false;
    private _eventBus_ = new EventBus();
    private _isStart_ = true;
    private _matched_: { [key: string]: IRouteFindResult };
    private _routeManager_: RouteManager;
    private _option_: IRouterOption;

    history: History;

    private _isHistoryMode_ = false;

    currentRoute = new Route();

    constructor(routes: RouteStore, option?: IRouterOption) {
        this._option_ = option = option || {
            mode: ROUTER_MODE.History
        } as IRouterOption;

        this._routeManager_ = new RouteManager(routes);
        this._isHistoryMode_ = option.mode === ROUTER_MODE.History;

        this.history = getHistory(option.mode as any);

        if (option.mode === ROUTER_MODE.History) {
            window.addEventListener('popstate', (event) => {
                this._isNavigatedByBrowser_ = true;
                this.goto(this._routeFromUrl_(location))
            });
            // Promise.resolve().then(_ => {
            this.goto(this._routeFromUrl_(location));
            // })
        }
        else {
            this.goto({
                path: "/"
            })
        }
    }

    private _activeRouterViewSet_ = new Set<Component>();

    private _pathVisited_ = [];


    createMetaTag(clientMeta: IClientAppMeta = {}) {
        try {
            const clientMetaFromRoute = this.currentRoute.meta?.clientMeta;
            clientMeta.tags = clientMeta.tags || [];
            if (clientMetaFromRoute) {
                if (!clientMeta.title) {
                    clientMeta.title = clientMetaFromRoute.title;
                }

                const tagsToMerge = (clientMetaFromRoute.tags || []).filter(tag => {
                    const foundMeta = clientMeta.tags.find(q => (q.name === tag.name || q.property === tag.property));
                    if (!foundMeta) {
                        return tag;
                    }
                });

                clientMeta.tags.push(...tagsToMerge);
            }
            if (!clientMeta) return;
            const setTag = (key: string, value: string, content: string) => {
                if (!content || !key) {
                    return;
                }

                content = decodeURIComponent(content);

                let el =
                    key === "title"
                        ? document.querySelector("title")
                        : document.querySelector(`meta[${key}="${value}"]`);
                if (!el) {
                    el = document.createElement(
                        key === "title" ? "title" : "meta"
                    );
                    el.setAttribute(key, value);
                    document.head.appendChild(el);
                }
                if (key === "title") {
                    el.innerHTML = content;
                } else {
                    el.setAttribute("content", content);
                }
                return true;
            };
            setTag("title", null, clientMeta.title);
            clientMeta.tags.forEach((tag) => {
                if (tag.name) {
                    setTag("name", tag.name, tag.content);
                } else if (tag.property) {
                    setTag("property", tag.property, tag.content);
                }
            });
        } catch (error) {
            console.error(error);
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
            const routeClone: IRoute = Object.assign(
                {}, to
            );
            const currentRouteParam = this.currentRoute.param
            if (currentRouteParam) {
                routeClone.param = Object.assign(
                    {},
                    currentRouteParam,
                    to.param || {},
                )
            }
            const { path, error } = this._routeManager_.pathByName(routeClone);
            if (error) return Promise.reject(error);
            to.path = path;
        }

        const path = to.path;

        if (path == null) {
            return Promise.reject(
                `No route found for specified argument ${JSON.stringify(to)}`
            );
        }

        const splittedPath = trimSlash(to.path).split("/");
        const storedRoutes = [];
        const matched: { [key: string]: IRouteFindResult } = {};
        let paths = [];
        splittedPath.every((_, index) => {
            const result = this._routeManager_.findComponent(splittedPath, storedRoutes);
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
            const result = this._routeManager_.findComponent(["*"], []) || {
                comp: RouteNotFound,
                key: '*',
                name: 'NotFound',
                path: to.path,
                param: to.param || {},
                meta: to.meta
            };
            to.name = result.name;
            to.query = to.query || {};
            to.param = result.param;
            this._emitNotFound_(to);
            this._splittedPath_ = ["*"];
            matched["*"] = result;
        }
        else {
            to.query = to.query || {};
            paths.forEach((path, index) => {
                const childRoute = matched[paths[index + 1]];
                if (childRoute) {
                    const parentRoute = matched[path];
                    childRoute.param = merge(childRoute.param, parentRoute.param);
                } isNotFound
            });
            const routePath = paths.pop();
            to.param = matched[routePath].param;
            to.name = matched[routePath].name;
            to.meta = matched[routePath].meta;
            this._splittedPath_ = splittedPath;
        }

        this._matched_ = matched;

        return this._emitBeforeEach_(to).then(result => {
            if (result.success) {
                // error occured in emit navigate is treated as error and emiited in afterEach
                // error is propagated to afterEach but in case emitbeforeEach after each is not called
                // there are cases where everything needs to logged in afterEach and in this case navigate is helpful
                return this._emitNavigate_(to).then(errs => {
                    const err = errs.find(q => q != null);
                    if (!err) {
                        this._changeRoute_(to);

                        // check for router view and if not then log warning to console
                        if (process.env.NODE_ENV !== "production") {
                            if (this._activeRouterViewSet_.size < this._splittedPath_.length) {
                                console.warn(`No router view found for path - '${this._splittedPath_[this._splittedPath_.length - 1]}'`);
                            }
                        }
                    }
                    this._emitAfterEach_(err);
                    return err;
                }).catch(error => {
                    this._emitAfterEach_(error);
                })
            }
            else {
                let err: ErrorHelper;
                if (result.cancelled) {
                    err = new ErrorHelper(ERROR_TYPE.NavigationCancelled,
                        {
                            from: this.currentRoute.path,
                            to: to.path,
                            path: result.cancelled.path
                        }
                    )
                }
                else {
                    err = new ErrorHelper(ERROR_TYPE.NavigationAborted, {
                        from: this.currentRoute.path,
                        to: to.path,
                    })
                }
                const errMessage = err.get();
                this._emitAfterEach_(errMessage);
                return errMessage;
            }
        })
    }

    private _initRoute_(val: IRoute) {
        const routeInstance = this.currentRoute;
        routeInstance.path = val.path;
        routeInstance.param = val.param || {};
        routeInstance.query = val.query || {};
        routeInstance.name = val.name;
        routeInstance.meta = val.meta;
    }

    private _routeFromUrl_(url: URL | Location): IRoute {
        return {
            path: url.pathname,
            query: url.search && parseQuery(url.search)
        }
    }

    private _emitBeforeEach_(to) {
        return this.emit(ROUTER_LIFECYCLE_EVENT.BeforeEach, to).then(results => {
            const result = results.pop();
            if (result != null) {
                const resultType = typeof result;
                if (resultType == "object") {
                    this.goto(result);
                    return { success: false, cancelled: result };
                }
                else if (resultType == "boolean") {
                    return {
                        success: result,
                    };
                }
            }
            return { success: true };
        })
    }


    private _changeRoute_(route: IRoute) {
        this._initRoute_(route);
        if (!this._isHistoryMode_ || (!this._isNavigatedByBrowser_ && !this._isStart_)) {
            this.history.pushState(
                merge({ key: performance.now() }),
                '',
                this._routeManager_.resolve(route as any)
            );
        }
        else {
            this._isNavigatedByBrowser_ = this._isStart_ = false;
        }
    }

    back() {
        this.history.back();
    }

    go(delta: number = 1) {
        this.history.go(delta);
    }

    on(event: RouterLifeCycleEvent, cb: Function) {
        this._eventBus_.on(event, cb);
        return this;
    }

    off(event: string, cb: Function) {
        this._eventBus_.off(event, cb);
    }

    emit(event: string, ...data) {
        return this._eventBus_.emit(event, ...data);
    }

    private _emitNavigate_(route: IRoute) {
        route.query = route.query;
        this._nextPath_ = route;
        this._prevPath_ = merge({}, this.currentRoute);

        return this._eventBus_.emitLinear(
            ROUTER_LIFECYCLE_EVENT.Navigate,
            route
        );
    }

    private _emitAfterEach_(error?) {
        this.emit(ROUTER_LIFECYCLE_EVENT.AfterEach, this._nextPath_, this._prevPath_, error);
    }

    private _emitNotFound_(to) {
        this.emit(ROUTER_LIFECYCLE_EVENT.RouteNotFound, to);
    }


}
