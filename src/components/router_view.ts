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
            }
            const afterRouteLeave = (shouldNavigate) => {
                if (shouldNavigate === false) return;
                if (!isRuterViewEligible) {
                    this.name = null;
                    return res();
                }
                Object.assign(this.$route, this.reqRoute);
                this.onCompEvaluated(result).then(res);
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
            if (result) {
                const splittedPath: string[] = this.$router.splittedPath_;
                if (result.path === splittedPath[splittedPath.length - 1]) {
                    this.$router._changeRoute_(this.reqRoute);
                    this.$router['emitAfterEach_']();
                }
                comp = result.comp;
                pathVisited.push(result.key);
                this.pathname = result.key;
                this.$route.param = merge({}, result.param);
                changeComponent(true);
            }
            else {
                comp = NotFound;
                this.$router['emitNotFound_'](this.reqRoute);
                changeComponent(true);
            }
        });
    }
}