import { RouteStore } from "mahal-router";
import Start from "./components/start.mahal";
import User from "./components/user.mahal";
import Login from "./components/login.mahal";

export const routes: RouteStore = {
    "/": {
        component: Start,
        name: "home"
    },
    "/user": {
        component: User,
        name: "user",
        children: {
            "/login": {
                component: Login,
                name: "user_login",
            }
        }
    }
}