import { Component, Template, Reactive } from "mahal";
import { BaseComponent } from "./base";
import { RouteHandler } from "../helpers/route_handler";

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
        const comp = RouteHandler.findComponent(location.pathname);

        debugger;
        if (comp != null) {
            const componentName = comp.name || "anonymous";
            this.children = {
                [componentName]: comp
            }
            this.name = componentName;
        }
        return // 404 page;
    }
}