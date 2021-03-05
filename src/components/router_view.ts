import { Template, Reactive } from "mahal";
import { BaseComponent } from "./base";
import { RouteHandler } from "../helpers/route_handler";
import NotFound from "./404";

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
        let comp = RouteHandler.findComponent(location.pathname);
        if (!comp) {
            comp = NotFound;
        }
        const componentName = comp.name;
        debugger;
        this.children = {
            [componentName]: comp
        }
        this.name = componentName;
    }
}