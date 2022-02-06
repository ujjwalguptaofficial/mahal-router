import { Component, LIFECYCLE_EVENT } from "mahal";
import { Router } from "../router";
import { Route } from "../route";

export abstract class BaseComponent extends Component {
    get router() {
        return this.global.router as Router;
    }

    get route() {
        return this.global.route as Route;
    }
}