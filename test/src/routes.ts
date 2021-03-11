import { RouteStore, createRoute } from "mahal-router";
import Start from "./components/start.mahal";
import User from "./components/user.mahal";
import Login from "./components/login.mahal";

export const routes: RouteStore = {
    ...createRoute({
        path: "/",
        component: Start,
        name: "home",
    }),
    ...createRoute({
        path: "/user",
        component: import("./components/user.mahal"),
        name: "User",
        children: {
            "/login": {
                component: Login,
                name: "user_login",
            }
        }
    }),
}
console.log("routes", routes)