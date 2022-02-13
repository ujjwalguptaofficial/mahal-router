import { Mahal, Plugin } from "mahal";
import { Router } from "./router";
import { RouterView, RouterLink } from "./components";

export class RouterPlugin extends Plugin {
    setup(app: Mahal, router: Router) {
        app.extend.component("router-view", RouterView);
        app.extend.component("route-to", RouterLink);
        app.global.router = router;
        Object.defineProperty(app.global, 'route', {
            get() {
                return router['currentRoute_']
            }
        })
    }
}