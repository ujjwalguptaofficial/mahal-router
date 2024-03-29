import { Component } from "mahal";
import { Router } from "../router";
import { Route } from "../route";

export class BaseComponent extends Component {
    get router() {
        return this.global.router as Router;
    }

    get route() {
        return this.global.route as Route;
    }

    get splittedPath() {
        return this.router['_splittedPath_'];
    }
}