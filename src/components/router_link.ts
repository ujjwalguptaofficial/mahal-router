import { Component, Template, Reactive, Prop } from "mahal";
import { BaseComponent } from "./base";
import { Route } from "../route";
import { IRenderContext } from "mahal/dist/ts/interface";

export default class extends BaseComponent {
    @Prop()
    to: Route;

    render({ createElement, children }: IRenderContext) {
        let slotElement: HTMLElement = children[0];
        slotElement.onclick = () => {
            let shouldPrevent;
            const context = {
                prevent() {
                    this.shouldPrevent = true;
                }
            }
            this.emit("click", context).then(_ => {
                if (shouldPrevent) return;
                if (this.to) {
                    this.$router.goto(this.to);
                }
            })
        };
        return slotElement;
    }
}