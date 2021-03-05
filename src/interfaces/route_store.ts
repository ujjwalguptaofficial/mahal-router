interface IRouteMap {
    name?: string;
    component: any;
    children?: RouteStore;
}

export type RouteStore = { [path: string]: IRouteMap };
