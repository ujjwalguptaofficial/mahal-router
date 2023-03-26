import { RouteStore, createRoute } from "@mahaljs/router";
import Start from "./components/start.mahal";
import DoNotLeave from "./components/do_not_leave.mahal"
import UserById from "./components/user_by_id.mahal";
import Login from "./components/login.mahal";
import Dashboard from "./components/dashboard.mahal";
import NotFound from "./components/not_found.mahal";

export const routes: RouteStore = {
    ...createRoute({
        path: "/*",
        component: NotFound,
        name: "not_found",
        meta: {
            clientMeta: {
                title: "Invalid Page"
            }
        }
    }),
    ...createRoute({
        path: "/",
        component: Start,
        name: "home",
        meta: {
            clientMeta: {
                title: 'Home Page',
                tags: [
                    {
                        name: "description",
                        content: "Home page description"
                    }
                ]
            }
        }
    }),
    ...createRoute({
        path: "/context.html",
        component: Start,
        name: "home-context",
    }),
    ...createRoute({
        path: "/do-not-leave",
        component: DoNotLeave,
        name: "do-not-leave",
    }),
    ...createRoute({
        path: "/account",
        component: import("./components/user.mahal"),
        name: "account",
        children: {
            ...createRoute({
                "path": "profile",
                component: import("./components/profile.mahal"),
                name: "profile",
                children: {
                    ...createRoute({
                        "path": "edit-profile",
                        component: import("./components/projects.mahal"),
                        name: "edit-profile",
                    }),
                    ...createRoute({
                        "path": "/{id}",
                        component: import("./components/projects.mahal"),
                        name: "profile-by-id",
                    }),
                }
            }),
        }
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
            ...createRoute({
                "path": "dashboard",
                component: Dashboard,
                name: "user-dashboard",
                meta: {
                    requireLogin: true,
                    clientMeta: {
                        title: 'Dashboard Page',
                        tags: [
                            {
                                name: "description",
                                content: "Dashboard page description"
                            },
                            {
                                name: "keywords",
                                content: "dashboard, user"
                            }
                        ]
                    }
                },

            }),
            "/{userId}/{accountId}": {
                component: UserById,
                name: "user-account",
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
    ...createRoute({
        path: "/project",
        component: import("./components/projects.mahal"),
        name: "project",
    }),
    ...createRoute({
        path: "/project/{id}",
        component: import("./components/project_by_id.mahal"),
        name: "project-by-id",
        children: {
            ...createRoute({
                path: "/buy/{sellId}",
                component: import("./components/buy-project.mahal"),
                name: "buy-project",
            }),
        }
    }),
    ...createRoute({
        path: "/temp",
        component: import("./components/temp.mahal"),
        name: "temp",
        children: {
            ...createRoute({
                path: "/child",
                component: import("./components/buy-project.mahal"),
                name: "temp-child",
            }),
        }
    }),
}
console.log("routes", routes)