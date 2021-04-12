import { Template, Reactive, merge, LIFECYCLE_EVENT, Component, Timer } from "mahal";
import { BaseComponent } from "./base";
import { RouteHandler } from "../helpers/route_handler";
import NotFound from "./404";
import { ROUTER_LIFECYCLE_EVENT } from "../enums";
import { IRouteFindResult, IRoute } from "../interfaces";
import { isArrayEqual } from "../helpers";

const pathVisited = [];
@Template(`
<div>
    <in-place #ref(compInstance) :of="name"/>
</div>
`)
export default class RouterView extends BaseComponent {

    @Reactive
    name: String;

    pathname: string;

    compInstance: Component;


    constructor() {
        super();
        window['routerView'] = this;
        this.waitFor(LIFECYCLE_EVENT.Mount).then(_ => {
            // setTimeout(() => {
            // if (!isArrayEqual(this.$router.splittedPath_, pathVisited)) {
            this.loadComponent();
            // }
            // }, 2000);
        });
        const onNavigateRef = this.onNavigate.bind(this);
        this.waitFor(LIFECYCLE_EVENT.Create).then(_ => {
            this.$router.on(ROUTER_LIFECYCLE_EVENT.Navigate, onNavigateRef);
        });
        this.on(LIFECYCLE_EVENT.Destroy, () => {
            this.compInstance = null;
            this.$router.off(ROUTER_LIFECYCLE_EVENT.Navigate, onNavigateRef);
        });
    }

    onNavigate() {
        const splittedPath: string[] = this.$router.splittedPath_;
        // if (splittedPath.length == this.pathname.split(".").length) {
        //     const index = pathVisited.indexOf(this.pathname);
        //     pathVisited.splice(index, 1);
        // }
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
        return (this.$router as any).nextPath;
    }

    get activeRoute(): IRoute {
        return (this.$router as any).prevPath;
    }

    loadComponent() {
        const splittedPath: string[] = this.$router.splittedPath_;
        const isRuterViewEligible = pathVisited.length < splittedPath.length;

        return new Promise<void>((res) => {
            let result;
            if (isRuterViewEligible) {
                const pathToLoad = splittedPath.slice(pathVisited.length)[0];
                const matchedRoute = this.$router._matched_[
                    pathToLoad
                ];
                result = matchedRoute;
                // result = RouteHandler.findComponent(
                //     splittedPath,
                //     pathVisited
                // );
                // if (!result) {
                //     this.onCompEvaluated(null);
                //     return res();
                // }
                // Object.assign(this.reqRoute, {
                //     name: result.name,
                //     param: result.param
                // } as IRoute);
            }
            const afterRouteLeave = (shouldNavigate) => {
                if (shouldNavigate === false) return;
                if (!isRuterViewEligible) {
                    this.name = null;
                    return res();
                }
                this.onCompEvaluated(result).then(res);
            }
            if (this.compInstance) {
                this.compInstance.emit(ROUTER_LIFECYCLE_EVENT.RouteLeaving, this.reqRoute, this.activeRoute).then(evtResult => {
                    const shouldNavigate = evtResult.length > 0 ? evtResult.pop() : true;
                    if (shouldNavigate) {
                        Object.assign(this.$route, this.reqRoute);
                    }
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

            if (result) {
                comp = result.comp;
                pathVisited.push(result.key);
                this.pathname = result.key;
                this.$route.param = merge({}, result.param);
            }
            else {
                comp = NotFound;
            }

            const componentName = comp.name || "anonymous";
            const setName = () => {
                this.children = {
                    [componentName]: comp
                };
                if (result) {
                    this.$router['emitAfterEach_']();
                }
                else {
                    this.$router['emitNotFound_'](this.reqRoute);
                }
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
        });
    }
}