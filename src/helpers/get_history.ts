import { ROUTER_MODE } from "../enums";
import { MemoryHistory } from "./memory_history";
export const getHistory = (mode: ROUTER_MODE) => {
    if (mode === ROUTER_MODE.History) {
        return window.history;
    }
    return new MemoryHistory();
}