import { IRouteMeta } from "../interfaces";
import { RouteStore } from "../types";
interface RouteDefinition {
    name?: string;
    path: string;
    component: any;
    children?: any
    meta?: IRouteMeta
}
export const createRoute = (param: RouteDefinition): RouteStore => {
    return {
        [param.path]: {
            component: param.component,
            children: param.children,
            name: param.name,
            meta: param.meta
        }
    }
}