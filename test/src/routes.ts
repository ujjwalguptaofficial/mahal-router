import { RouteStore, createRoute } from "mahal-router";
import Start from "./components/start.mahal";
import User from "./components/user.mahal";
import UserById from "./components/user_by_id.mahal";
import Login from "./components/login.mahal";
import Dashboard from "./components/dashboard.mahal";
import NotFound from "./components/not_found.mahal";

export const routes: RouteStore = {
    ...createRoute({
        path: "/*",
        component: NotFound,
        name: "not_found",
    }),
    ...createRoute({
        path: "/",
        component: Start,
        name: "home",
    }),
    ...createRoute({
        path: "/context.html",
        component: Start,
        name: "home-context",
    }),
    ...createRoute({
        path: "/user",
        component: import("./components/user.mahal"),
        name: "user",
        children: {
            "/login": {
                component: Login,
                name: "user-login",
            },
            "/dashboard": {
                component: Dashboard,
                name: "user-dashboard",
            },
            "/{userId}/{accountId}": {
                component: UserById
            }
        }
    }),
    ...createRoute({
        path: "/task",
        component: import("./components/task.mahal"),
        children: {
            "/{value}": {
                name: "particular_task",
                component: import("./components/particular_task.mahal")
            }
        }
    }),
}
console.log("routes", routes)