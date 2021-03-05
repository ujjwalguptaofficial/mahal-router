import { Component } from "mahal";
import { Router } from "../router";
import { Route } from "../route";

export class BaseComponent extends Component {
    $router: Router;
    $route: Route;
}