import { Template, Reactive, merge, LIFECYCLE_EVENT, Component, Timer } from "mahal";
import { BaseComponent } from "./base";
import { ROUTER_LIFECYCLE_EVENT } from "../enums";
import { IRouteFindResult, IRoute } from "../interfaces";
import { IRenderContext } from "mahal/dist/ts/interface";

const pathVisited = [];

export class RouterView extends BaseComponent {

    @Reactive
    name: String;

    pathname: string;

    compInstance: Component;

    render(context: IRenderContext): Promise<HTMLElement> {
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
        window['routerView'] = this;
        this.waitFor(LIFECYCLE_EVENT.Mount).then(_ => {
            if (!this.pathname) {
                this.loadComponent();
            }
        });
        const onNavigate = this.onNavigate.bind(this);
        this.waitFor(LIFECYCLE_EVENT.Create).then(() => {
            this.router.on(ROUTER_LIFECYCLE_EVENT.Navigate, onNavigate);
        });
        this.on(LIFECYCLE_EVENT.Destroy, () => {
            this.compInstance = null;
            this.router.off(ROUTER_LIFECYCLE_EVENT.Navigate, onNavigate);
        });
    }

    onNavigate() {
        const splittedPath: string[] = this.splittedPath;
        let isSameRoute = false;

        // find if same route is being called
        if (this.pathname) {
            splittedPath.every(q => {
                if (q === this.pathname) {
                    isSameRoute = true;
                    return false;
                }
                return true;
            })
        }
        // ignore if same route
        if (!isSameRoute) {
            const index = pathVisited.findIndex(q => q === this.pathname);
            if (index >= 0) {
                pathVisited.splice(index);
            }
            this.pathname = null;
            return this.loadComponent();
        }
    }

    get reqRoute(): IRoute {
        return this.router['nextPath_'];
    }

    get activeRoute(): IRoute {
        return this.router['prevPath_'];
    }

    loadComponent() {
        const splittedPath: string[] = this.splittedPath;
        const isRuterViewEligible = pathVisited.length < splittedPath.length;
        let matchedRoute;
        return new Promise<void>((res) => {
            if (isRuterViewEligible) {
                const pathToLoad = splittedPath.slice(pathVisited.length)[0];
                matchedRoute = this.router['_matched_'][
                    pathToLoad
                ];
            }
            const afterRouteLeave = (shouldNavigate) => {
                if (shouldNavigate === false) return;
                if (!isRuterViewEligible) {
                    this.name = null;
                    return res();
                }
                Object.assign(this.route, this.reqRoute);
                this.onCompEvaluated(matchedRoute).then(res);
            }
            if (this.compInstance) {
                this.compInstance.emit(ROUTER_LIFECYCLE_EVENT.RouteLeaving, this.reqRoute, this.activeRoute).then(evtResult => {
                    const shouldNavigate = evtResult.length > 0 ? evtResult.pop() : true;
                    afterRouteLeave(shouldNavigate)
                })
            }
            else {
                afterRouteLeave(true);
            }
        });

    }

    onCompEvaluated(result: IRouteFindResult) {
        let comp;
        return new Promise<void>(res => {
            const changeComponent = (val) => {
                if (!val) return res();
                const componentName = comp.name || "anonymous";
                const setName = () => {
                    this.children = {
                        [componentName]: comp
                    };
                    this.name = componentName;
                    this.waitFor(LIFECYCLE_EVENT.Update).then(res);
                }
                if (this.name && this.name === componentName) {
                    this.name = null;
                    this.waitFor(LIFECYCLE_EVENT.Update).then(_ => {
                        setName();
                    });
                }
                else {
                    setName();
                }
            }
            const splittedPath: string[] = this.splittedPath;
            if (result.path === splittedPath[splittedPath.length - 1]) {
                this.router['_changeRoute_'](this.reqRoute);
                this.router['emitAfterEach_']();
            }
            comp = result.comp;
            pathVisited.push(result.path);
            this.pathname = result.path;
            this.route.param = merge({}, result.param);
            changeComponent(true);

        });
    }
}