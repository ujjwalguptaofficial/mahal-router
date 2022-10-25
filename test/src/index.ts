import { Mahal } from "mahal";
import Root from "./components/root.mahal";
import { RouterPlugin, Router } from "@mahaljs/router";
import { routes } from "./routes";
import "flexboot";
import * as $ from "jquery";
import { spy } from "sinon";

window['jQuery'] = $;

function checkForRouterViewWarning(path: string) {
    const consoleSpy = spy(console, "warn");

    return new Promise((res, rej) => {
        // check for consoles

        setTimeout(() => {
            consoleSpy.restore();
            // debugger;
            if (consoleSpy.args.length !== 1) {
                res(false);
            }

            const args0 = consoleSpy.args[0];
            if (args0.length !== 1) {
                res(false);
            }

            if (args0[0] !== `No router view found for path - '${path}'`) {
                res(false);
            }

            res(true);
        }, 1100);
    })

}

window['checkForRouterViewWarning'] = checkForRouterViewWarning;

window['after'] = function (timeoutValue) {
    return new Promise((res) => {
        setTimeout(res, timeoutValue);
    })
};

const router = new Router(routes, {
    mode: "history"
});

window['router'] = router;

router.on("beforeEach", (next) => {
    window['nextRouteFromBeforeEach'] = next;
    console.log("beforeEach", "next", next);
})

router.on("afterEach", (next, prev, err) => {
    window['activeRoute'] = next;
    window['prevRoute'] = prev;
    window['routeErr'] = err;
    console.log("afterEach", next);
})

export function createApp(routerInstance: Router) {
    const app = new Mahal(Root as any, '#app');
    app.extend.plugin(RouterPlugin, routerInstance);
    return app.create().catch(err => {
        console.log("err", err)
    })

}


// app.extend.renderer = createRenderer;

// if (process.env.BUILD_ENV !== "test") {
createApp(router);
// }

window.onerror = function (message, source, lineno, colno, error) {
    window['error'] = message;
};

window['onunhandledrejection'] = function (message) {
    console.log('onunhandledrejection handler logging error', message);
}