import { App } from "mahal";
import Root from "./components/root.mahal";
import { RouterPlugin, Router } from "mahal-router";
import { routes } from "./routes";
import { createRenderer } from "mahal-html-compiler";
import "flexboot";

const router = new Router(routes);

App.extend.plugin(RouterPlugin, router);
(App as any).createRenderer = createRenderer;


new App(Root, '#app').create();