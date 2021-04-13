import { T_string_string } from "../types";

export interface IRouteFindResult {
    key: string;
    comp: any;
    param?: T_string_string;
    name: string;
    path: string;
}