import { Prop } from "mahal";
import { BaseComponent } from "./base";
import { Route } from "../route";
import { T_string_any } from "../types";

export class RouterLink extends BaseComponent {

    to: Route;

    @Prop(String)
    path: string;

    @Prop(String)
    name: string;

    @Prop(Object)
    query: T_string_any;

    @Prop(Object)
    param: T_string_any;

    render({ children }) {
        const to = {
            name: this.name,
            param: this.param,
            path: this.path,
            query: this.query
        };

        let slotElement: HTMLElement = children[0] || document.createElement('a');
        (slotElement as HTMLLinkElement).href = this.router['routeManager_'].resolve(to);
        slotElement.onclick = (e) => {
            e.preventDefault();
            let shouldPrevent;
            const context = {
                prevent() {
                    this.shouldPrevent = true;
                }
            }
            this.emit("click", context).then(_ => {
                if (shouldPrevent) return;
                const method = typeof to === 'string' ? 'gotoPath' : 'goto';
                this.router[method](to as any);
            })
        };
        return slotElement;
    }
}