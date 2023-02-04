import { RouteStore } from "../types";
import { IRouteMeta } from "./route";

export interface IRouteMap {
    name?: string;
    component: any;
    children?: RouteStore;
    meta?: IRouteMeta;
}

