import { App } from "mahal";
import Root from "./components/root.mahal";
import { RouterPlugin, Router } from "mahal-router";
import { routes } from "./routes";

import "flexboot";

const router = new Router(routes);

App.extend.plugin(RouterPlugin, router);

new App(Root, '#app').create();