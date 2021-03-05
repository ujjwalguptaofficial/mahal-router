import { Template, Reactive } from "mahal";
import { BaseComponent } from "./base";
import { RouteHandler } from "../helpers/route_handler";
import NotFound from "./404";

const pathVisited = [];
@Template(`
<in-place :of="name"/>
`)
export default class extends BaseComponent {

    @Reactive
    name: String;

    constructor() {
        super();
        this.on("created", this.onCreated)
    }

    onCreated() {
        let { key, comp } = RouteHandler.findComponent(this.$route.pathname,
            pathVisited);
        if (key) {
            pathVisited.push(key);
        }
        if (!comp) {
            comp = NotFound;
        }
        const componentName = comp.name;
        this.children = {
            [componentName]: comp
        }
        this.name = componentName;
    }
}