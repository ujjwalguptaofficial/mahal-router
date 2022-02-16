import { IRouteMap } from "../interfaces";

export type RouterLifeCycleEvent = "navigate" | "beforeEach" | "afterEach" | "notFound" | string;

export type T_string_string = { [key: string]: string }
export type T_string_any = { [key: string]: any }
export type RouteStore = { [path: string]: IRouteMap };
