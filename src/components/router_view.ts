import { Template, Reactive } from "mahal";
import { BaseComponent } from "./base";
import { RouteHandler } from "../helpers/route_handler";
import NotFound from "./404";

const pathVisited = [];
@Template(`
<div>
    <in-place #if(shouldLoaded) :of="name"/>
</div>
`)
export default class extends BaseComponent {

    @Reactive
    name: String;

    @Reactive
    shouldLoaded = true;

    constructor() {
        super();
        this.on("created", this.onCreated)
    }

    onCreated() {
        this.shouldLoaded = pathVisited.length < (this.$route as any).splittedPath_.length;
        if (!this.shouldLoaded) return;
        let result = RouteHandler.findComponent(this.$route.pathname,
            pathVisited);
        let comp;
        if (result) {
            comp = result.comp;
            pathVisited.push(result.key);
        }
        else {
            comp = NotFound;
        }
        const componentName = comp.name;
        this.children = {
            [componentName]: comp
        }
        this.name = componentName;
    }
}