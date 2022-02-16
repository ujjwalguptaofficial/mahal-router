/**
 * ROUTER_LIFECYCLE_EVENT
 * 
 * 1. Before each is called first - if beforeeach receiver returns boolean or router then it acts based on the result.
 * 2. Navigate is called after before each is resolved
 * 3. After each is called after the route is changed
 * 4. Not Found is called when no route is found
 * @export
 * @enum {number}
 */
export enum ROUTER_LIFECYCLE_EVENT {
    Navigate = "navigate",
    BeforeEach = "beforeEach",
    AfterEach = "afterEach",
    // RouteLeaving = "route.leaving",
    RouteNotFound = "notFound",
}

