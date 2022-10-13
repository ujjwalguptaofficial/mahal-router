import { reactive, merge, Component } from "mahal";
import { BaseComponent } from "./base";
import { ERROR_TYPE, ROUTER_LIFECYCLE_EVENT } from "../enums";
import { IRouteFindResult, IRoute } from "../interfaces";
import { IRenderContext } from "mahal/dist/ts/interface";
import { ErrorHelper } from "../helpers";

const pathVisited = [];

export class RouterView extends BaseComponent {

    @reactive
    name: String;

    pathname: string;

    compInstance: Component;

    isDestroyed = false;

    render(context: IRenderContext): HTMLElement {
        const ce = context.createEl.bind(this);
        const ctx = this;
        return ce('div', [
            ce('in-place', [], {
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
        ]);
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

        const samePathIndex = splittedPath.findIndex(q => q === this.pathname);

        if (samePathIndex >= 0) {
            isSameRoute = true;
            if (samePathIndex === splittedPath.length - 1) {
                return new ErrorHelper(ERROR_TYPE.SameRoute).get();
            }
            return;
        }

        const index = pathVisited.findIndex(q => q === this.pathname);
        if (index >= 0) {
            pathVisited.splice(index);
        }
        this.pathname = null;
        return this.loadComponent();
    }

    get reqRoute(): IRoute {
        return this.router['_nextPath_'];
    }

    get activeRoute(): IRoute {
        return this.router['_prevPath_'];
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
            if (!isRuterViewEligible) {
                this.name = null;
                return res();
            }
            Object.assign(this.route, this.reqRoute);
            this.onCompEvaluated(matchedRoute).then(res);
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
            comp = result.comp;
            pathVisited.push(result.path);
            this.pathname = result.path;
            this.route.param = merge({}, result.param);
            changeComponent(true);

        });
    }
}