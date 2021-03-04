import { Component, Template, Reactive } from "mahal";
import { BaseComponent } from "./base";

@Template(`
<in-place :of="name"/>
`)
export default class extends BaseComponent {
    @Reactive
    name: String;


}