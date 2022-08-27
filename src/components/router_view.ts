import { Reactive, merge, Component } from "mahal";
import { BaseComponent } from "./base";
import { ERROR_TYPE, ROUTER_LIFECYCLE_EVENT } from "../enums";
import { IRouteFindResult, IRoute } from "../interfaces";
import { IRenderContext } from "mahal/dist/ts/interface";
import { ErrorHelper } from "../helpers";

const pathVisited = [];

export class RouterView extends BaseComponent {

    @Reactive
    name: String;

    pathname: string;

    compInstance: Component;

    isDestroyed = false;

    render(context: IRenderContext): HTMLElement {
        const ce = context.createElement;
        const ctx = this;
        return ce.call(this, 'div', [
            ce.call(this, 'in-place', [], {
                attr: {
                    of: {
                        v: ctx.name,
                        k: 'name'
                    }
                },
                dir: {
                    model: {
                        get value() {
                            return [ctx.compInstance]
                        },
                        set value(values) {
                            ctx.compInstance = values[0];
                        },
                        props: ['ref'],
                        params: [ctx.compInstance]
                    }
                },
            })
        ], {});
    }

    onInit() {
        this.waitFor("mount").then(_ => {
            if (!this.pathname) {
                this.loadComponent();
            }
        });
        const onNavigate = this.onNavigate.bind(this);
        this.waitFor("create").then(() => {
            this.router.on(ROUTER_LIFECYCLE_EVENT.Navigate, onNavigate);
        });
        this.on("destroy", () => {
            this.compInstance = null;
            this.router.off(ROUTER_LIFECYCLE_EVENT.Navigate, onNavigate);
            this.isDestroyed = true;
        });
    }

    onNavigate() {

        if (this.isDestroyed) {
            return;
        }

        const splittedPath: string[] = this.splittedPath;
        let isSameRoute = false;

        // find if same route is being called
        // if (!this.isFirstLoad) {
        // splittedPath.every(q => {
        //     if (q === this.pathname) {
        //         isSameRoute = true;
        //         return false;
        //     }
        //     return true;
        // })
        // }

        const samePathIndex = splittedPath.findIndex(q => q === this.pathname);

        if (samePathIndex >= 0) {
            isSameRoute = true;
            if (samePathIndex === splittedPath.length - 1) {
                return new ErrorHelper(ERROR_TYPE.SameRoute).get();
            }
            return;
        }

        // ignore if same route
        // if (!isSameRoute) {
        const index = pathVisited.findIndex(q => q === this.pathname);
        if (index >= 0) {
            pathVisited.splice(index);
        }
        this.pathname = null;
        return this.loadComponent();
        // }
    }

    get reqRoute(): IRoute {
        return this.router['nextPath_'];
    }

    get activeRoute(): IRoute {
        return this.router['prevPath_'];
    }

    loadComponent() {
        const splittedPath: string[] = this.splittedPath;
        // if the router view is eligible for changing the component
        const isRuterViewEligible = pathVisited.length < splittedPath.length;
        let matchedRoute;
        return new Promise<void>((res) => {
            if (isRuterViewEligible) {
                const pathToLoad = splittedPath.slice(pathVisited.length)[0];
                matchedRoute = this.router['_matched_'][
                    pathToLoad
                ];
            }
            // const afterRouteLeave = (shouldNavigate) => {
            // if (shouldNavigate === false) return;
            if (!isRuterViewEligible) {
                this.name = null;
                return res();
            }
            Object.assign(this.route, this.reqRoute);
            this.onCompEvaluated(matchedRoute).then(res);
            // }
            // if (this.compInstance) {
            //     this.compInstance.emit(ROUTER_LIFECYCLE_EVENT.RouteLeaving, this.reqRoute, this.activeRoute).then(evtResult => {
            //         const shouldNavigate = evtResult.length > 0 ? evtResult.pop() : true;
            //         afterRouteLeave(shouldNavigate)
            //     })
            // }
            // else {
            // afterRouteLeave(true);
            // }
        });

    }

    onCompEvaluated(result: IRouteFindResult) {
        let comp;
        return new Promise<void>((res, rej) => {
            const changeComponent = (val) => {
                if (!val) return res();
                const componentName = comp.name || "anonymous";
                const setName = () => {
                    this.children = {
                        [componentName]: comp
                    };
                    this.name = componentName;
                    this.waitFor("update").then(res);
                    this.waitFor("error").then(rej);
                }
                if (this.name && this.name === componentName) {
                    this.name = null;
                    this.waitFor("update").then(_ => {
                        setName();
                    });
                }
                else {
                    setName();
                }
            }
            // const splittedPath: string[] = this.splittedPath;
            // if (result.path === splittedPath[splittedPath.length - 1]) {
            // this.router['_changeRoute_'](this.reqRoute);
            // this.router['emitAfterEach_']();
            // }
            comp = result.comp;
            pathVisited.push(result.path);
            this.pathname = result.path;
            this.route.param = merge({}, result.param);
            changeComponent(true);

        });
    }
}