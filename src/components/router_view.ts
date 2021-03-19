import { Template, Reactive, merge, LIFECYCLE_EVENT, Component } from "mahal";
import { BaseComponent } from "./base";
import { RouteHandler } from "../helpers/route_handler";
import NotFound from "./404";
import { ROUTER_LIFECYCLE_EVENT } from "../enums";
import { IRouteFindResult, IRoute } from "../interfaces";

const pathVisited = [];
@Template(`
<div>
    <in-place #ref(compInstance) #if(shouldLoad) :of="name"/>
</div>
`)
export default class extends BaseComponent {

    @Reactive
    name: String;

    @Reactive
    shouldLoad: boolean;

    count = 0;

    pathname: string;

    compInstance: Component;

    constructor() {
        super();
        window['routerView'] = this;
        this.loadComponent();
        this.on(LIFECYCLE_EVENT.Created, () => {
            this.$router.on(ROUTER_LIFECYCLE_EVENT.Navigate, this.onNavigate.bind(this))
        })
    }

    onNavigate() {
        const splittedPath: string[] = this.$router.splittedPath_;
        let isRouteFound = false;
        if (this.pathname) {
            splittedPath.every(q => {
                if (q === this.pathname) {
                    isRouteFound = true;
                    return false;
                }
                return true;
            })
        }
        if (!isRouteFound) {
            const index = pathVisited.findIndex(q => q === this.pathname);
            if (index >= 0) {
                pathVisited.splice(index);
            }
            this.pathname = null;
            this.loadComponent();
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
        let result = RouteHandler.findComponent(
            splittedPath,
            pathVisited
        );

        if (!result) {
            this.onCompEvaluated(null);
        }
        Object.assign(this.reqRoute, {
            name: result.name,
            param: result.param
        } as IRoute);
        new Promise((res) => {
            if (this.compInstance) {
                this.compInstance.emit(ROUTER_LIFECYCLE_EVENT.RouteLeaving, this.reqRoute, this.activeRoute).then(evtResult => {
                    const shouldNavigate = evtResult.length > 0 ? evtResult.pop() : true;
                    if (shouldNavigate) {
                        Object.assign(this.$route, this.reqRoute);
                    }
                    res(shouldNavigate)
                })
            }
            else {
                res(true);
            }
        }).then(shouldNavigate => {
            if (shouldNavigate === false) return;
            this.shouldLoad = pathVisited.length < splittedPath.length;
            if (!this.shouldLoad) return;
            this.onCompEvaluated(result);
        })

    }

    onCompEvaluated(result: IRouteFindResult) {
        let comp;
        new Promise(res => {
            if (result) {
                this.$router.onRouteFound_(this.reqRoute).
                    then(shouldNavigate => {
                        if (shouldNavigate) {
                            comp = result.comp;
                            pathVisited.push(result.key);
                            this.pathname = result.key;
                            this.$route.param = merge({}, result.param);
                        }
                        res(shouldNavigate);
                    })
            }
            else {
                comp = NotFound;
                res(true);
            }
        }).then(val => {
            if (!val) return;
            const componentName = comp.name || "anonymous";
            this.name = null;
            this.children = {
                [componentName]: comp
            };
            // this.set(this, 'name', componentName);
            this.name = componentName;

            // if result is null,don't call emitAfterEach
            if (result) {
                (this.$router as any).emitAfterEach_();
            }
            else {
                (this.$router as any).emitNotFound_(this.reqRoute);
            }
        });
    }
}