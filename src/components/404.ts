import { IRenderContext } from "mahal/dist/ts/interface";
import { BaseComponent } from "./base";

export class RouteNotFound extends BaseComponent {
    render(context: IRenderContext) {
        const ce = context.createEl;
        const ct = context.createTextNode;
        return ce.call(this, 'div', [
            ct('Route does not exist | 404')
        ]);
    }
}