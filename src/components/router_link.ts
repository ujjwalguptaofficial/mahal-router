import { Component, Template, Reactive, Prop } from "mahal";
import { BaseComponent } from "./base";
import { Route } from "../route";

export default class extends BaseComponent {
    @Prop()
    to: Route;

    render({ createElement, children }) {
        return new Promise<HTMLElement>((res) => {
            Promise.all(children as Array<Promise<HTMLElement>>).then(childrens => {
                let slotElement: HTMLElement = childrens[0];
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
                res(slotElement);
            })

        });
    }
}