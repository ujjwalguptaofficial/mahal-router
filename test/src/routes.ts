import { RouteStore } from "mahal-router";
import Start from "./components/start.mahal";
import User from "./components/user.mahal";
import Login from "./components/login.mahal";

export const routes: RouteStore = {
    "/": {
        component: Start
    },
    "/user": {
        component: User,
        children: {
            "/login": {
                component: Login
            }
        }
    }
}