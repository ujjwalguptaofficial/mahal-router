import { Component } from "mahal";
import { Router, Route } from "@mahaljs/router";

export class BaseComponent extends Component {
    get router() {
        return this.global.router as Router;
    }

    get route() {
        return this.global.route as Route;
    }

}