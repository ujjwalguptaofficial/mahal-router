import { Plugin } from "mahal";
import MahalModule from "mahal";
import { Router } from "./router";
import RouterView from "./components/router_view";
import RouterLink from "./components/router_link";
import { Route } from "./route";

export class RouterPlugin extends Plugin {
    setup(mahal: typeof MahalModule, router: Router) {
        mahal.App.extend.component("router-view", RouterView);
        mahal.App.extend.component("router-link", RouterLink);

        return {
            router: router,
            route: new Route(),
        }
    }
}