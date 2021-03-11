import { Template, Reactive } from "mahal";
import { BaseComponent } from "./base";
import { RouteHandler } from "../helpers/route_handler";
import NotFound from "./404";

const pathVisited = [];
@Template(`
<div>
    <in-place #if(shouldLoad) :of="name"/>
</div>
`)
export default class extends BaseComponent {

    @Reactive
    name: String;

    @Reactive
    shouldLoad = true;

    pathname: string;

    constructor() {
        super();
        this.on("created", this.onCreated)
    }

    onCreated() {
        this.$router.on("to", _ => {
            const splittedPath: string[] = (this.$route as any).splittedPath_;
            let isRouteFound = false;
            if (this.pathname) {
                const thisSplittedPathName = this.pathname.split("/");
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
        });
        this.loadComponent();
    }

    async loadComponent() {
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
        }
        else {
            comp = NotFound;
        }
        const componentName = comp.name || "anonymous";
        this.children = {
            [componentName]: comp
        }
        this.name = componentName;
    }
}