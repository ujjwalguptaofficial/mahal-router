import { Godam } from "godam";
import { Component } from "mahal";
import { Route, Router } from "mahal-router";

export class BaseComponent extends Component {
    store: Godam;

    get router() {
        return this.global.router as Router;
    }

    get route() {
        return this.global.route as Route;
    }

}