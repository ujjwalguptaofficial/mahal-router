import { Component, Template, Reactive } from "mahal";
import { BaseComponent } from "./base";

@Template(`

`)
export default class extends BaseComponent {
    @Reactive
    name: String;


}