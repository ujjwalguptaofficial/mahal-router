interface IRouteMap {
    name: string;
    component: string;
    children: RouteStore;
}

export type RouteStore = { [path: string]: IRouteMap };
