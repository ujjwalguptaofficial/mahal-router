import { Component } from "mahal";
import { Router, Route } from "mahal-router";

export class BaseComponent extends Component {
    $router: Router;
    $route: Route;
}