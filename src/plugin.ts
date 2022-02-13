import { Plugin } from "mahal";
import { Router } from "./router";
import RouterView from "./components/router_view";
import RouterLink from "./components/router_link";
import { routeInstance } from "./constant";
import { Mahal } from "mahal/dist/ts/mahal";

export class RouterPlugin extends Plugin {
    setup(app: Mahal, router: Router) {
        if (!router) {
            throw "no router provided";
        }

        app.extend.component("router-view", RouterView);
        app.extend.component("route-to", RouterLink);
        app.global.router = router;
        app.global.route = routeInstance;
    }
}