import { Template, Reactive, merge, LIFECYCLE_EVENT, Component } from "mahal";
import { BaseComponent } from "./base";
import { RouteHandler } from "../helpers/route_handler";
import NotFound from "./404";
import { ROUTER_LIFECYCLE_EVENT } from "../enums";

const pathVisited = [];
@Template(`
<div>
    <in-place #ref(compInstance) #if(shouldLoad && name) :of="name"/>
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
        const splittedPath: string[] = (this.$route as any).splittedPath_;
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

    loadComponent() {
        new Promise((res) => {
            if (this.compInstance) {
                this.compInstance.emit("routeLeaving").then(evtResult => {
                    const shouldNavigate = evtResult[0];
                    res(shouldNavigate)
                })
            }
            else {
                res(true);
            }
        }).then(shouldNavigate => {
            if (shouldNavigate === false) return;
            const splittedPath: string[] = (this.$route as any).splittedPath_;
            this.shouldLoad = pathVisited.length < splittedPath.length;
            if (!this.shouldLoad) return;
            let result = RouteHandler.findComponent(
                splittedPath,
                pathVisited
            );
            let comp;
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
            this.name = null;
            this.children = {
                [componentName]: comp
            }
            this.name = componentName;
            (this.$router as any).emitAfterEach_();
        })

    }
}