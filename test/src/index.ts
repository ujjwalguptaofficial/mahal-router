import { Mahal } from "mahal";
import App from "@/app.mahal";
import { registerGlobalFormatter } from "@/formatters";
import config from "~/config";
import { Router, RouterPlugin } from "mahal-router";
import { routes } from "./routes";

const router = new Router(routes, {
    mode: "history"
});

window['router'] = router;

router.on("beforeEach", (ctx) => {
    console.log("beforeEach", ctx);
})

router.on("afterEach", (next, prev) => {
    window['activeRoute'] = next;
    window['prevRoute'] = prev;
    console.log("afterEach", next);
})

const app = new Mahal(App, '#app');
// register global formatter
registerGlobalFormatter(app);
// set config to be available globally
app.global.config = config;
app.extend.plugin(RouterPlugin, router)
app.create();