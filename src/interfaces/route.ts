import { T_string_any } from "../types";

export interface IRoute {
    path?: string;
    name?: string;
    query?: T_string_any;
    param?: T_string_any;
    state?: T_string_any
}