import { App, Timer } from "mahal";
import Root from "./components/root.mahal";
import { RouterPlugin, Router } from "mahal-router";
import { routes } from "./routes";
import { createRenderer } from "mahal-html-compiler";
import "flexboot";
import * as $ from "jquery";

window['jQuery'] = $;
window['after'] = new Timer().timeout;

const router = new Router(routes);

router.on("beforeEach", (ctx) => {
    console.log("beforeEach", ctx);
})
router.on("afterEach", (ctx) => {
    console.log("afterEach", ctx);
})

App.extend.plugin(RouterPlugin, router);
App.extend.renderer = createRenderer;

new App(Root, '#app').create();

window.onerror = function (message, source, lineno, colno, error) {
    window['error'] = message;
};

window['onunhandledrejection'] = function (message) {
    console.log('onunhandledrejection handler logging error', message);
}