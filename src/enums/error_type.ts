import { IRoute } from "../interfaces";

export enum ERROR_TYPE {
    NavigationAborted = 'navigation_aborted',
    NavigationCancelled = 'navigation_cancelled',
    SameRoute = 'same_route',
}

export interface NavigationFailure extends Error {
    type: ERROR_TYPE,
    from: IRoute,
    to: IRoute
}