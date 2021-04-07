import { Component, LIFECYCLE_EVENT } from "mahal";
import { Router } from "../router";
import { Route } from "../route";

export abstract class BaseComponent extends Component {
    $router: Router;
    $route: Route;
}