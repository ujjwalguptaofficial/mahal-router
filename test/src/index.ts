import { App } from "mahal";
import Root from "./components/root.mahal";
import { RouterPlugin, Router } from "mahal-router";
import { routes } from "./routes";
import { createRenderer } from "mahal-html-compiler";
import "flexboot";

const router = new Router(routes, {} as any);

App.extend.plugin(RouterPlugin, router);
App.extend.renderer = createRenderer;

new App(Root, '#app').create();