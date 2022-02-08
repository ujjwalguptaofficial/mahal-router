import { ROUTER_MODE } from "../enums";

export interface IRouterOption {
    mode: "history" | "memory" | ROUTER_MODE;
}