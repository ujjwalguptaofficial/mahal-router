import { RouteStore } from "../types";

export interface IRouteMap {
    name?: string;
    component: any;
    children?: RouteStore;
    meta?: any
}

