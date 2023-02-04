import { T_string_any } from "../types";

export interface IClientMetaTag {
    name?: string;
    content?: string;
    property?: string;
}
export interface IClientAppMeta {
    title?: string;
    tags?: IClientMetaTag[]
}

export interface IRouteMeta {
    [key: string]: any;
    clientMeta?: IClientAppMeta;
}

export interface IRoute {
    path?: string;
    name?: string;
    query?: T_string_any;
    param?: T_string_any;
    state?: T_string_any;
    meta?: IRouteMeta
}