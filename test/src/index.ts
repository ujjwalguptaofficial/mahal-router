import { Timer, Mahal } from "mahal";
import Root from "./components/root.mahal";
import { RouterPlugin, Router } from "mahal-router";
import { routes } from "./routes";
import "flexboot";
import * as $ from "jquery";

window['jQuery'] = $;
window['after'] = new Timer().timeout;

const router = new Router(routes, {
    mode: "history"
});

window['router'] = router;

router.on("router.beforeEach", (next) => {
    window['nextRouteFromBeforeEach'] = next;
    console.log("beforeEach", "next", next);
})

router.on("router.afterEach", (next, prev) => {
    window['activeRoute'] = next;
    window['prevRoute'] = prev;
    console.log("afterEach", next);
})
const app = new Mahal(Root, '#app');

app.extend.plugin(RouterPlugin, router);
// app.extend.renderer = createRenderer;

app.create();

window.onerror = function (message, source, lineno, colno, error) {
    window['error'] = message;
};

window['onunhandledrejection'] = function (message) {
    console.log('onunhandledrejection handler logging error', message);
}