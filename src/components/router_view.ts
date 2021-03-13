import { Template, Reactive, merge, LIFECYCLE_EVENT } from "mahal";
import { BaseComponent } from "./base";
import { RouteHandler } from "../helpers/route_handler";
import NotFound from "./404";
import { ROUTER_LIFECYCLE_EVENT } from "../enums";

const pathVisited = [];
@Template(`
<div>
    <in-place on:created="onCompCreated" #if(shouldLoad) :of="name"/>
</div>
`)
export default class extends BaseComponent {

    @Reactive
    name: String;

    @Reactive
    shouldLoad = true;

    count = 0;

    pathname: string;

    constructor() {
        super();
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
        const splittedPath = (this.$route as any).splittedPath_;
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
    }

    onCompCreated() {
        console.log("component created");
    }
}