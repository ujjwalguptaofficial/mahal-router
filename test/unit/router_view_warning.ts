import { createRoute, IRoute, Router, RouterPlugin } from "@mahaljs/router";
import { expect } from "chai";
import { Component, Mahal } from "mahal";
import { createRenderer } from "@mahaljs/html-compiler";
import { spy } from "sinon";

class App extends Component {
    template: string = `<div> <router-view/> </div>`
}


const app = new Mahal(App as any, null);
app.extend.setRenderer(createRenderer)


describe('Router view warning test', () => {
    const router = new Router({
        ...createRoute({
            path: "/temp",
            component: import("../src/components/temp.mahal"),
            name: "temp",
            children: {
                ...createRoute({
                    path: "/child",
                    component: import("../src/components/buy-project.mahal"),
                    name: "temp-child",
                }),
            }
        }),
    }, {
        mode: 'memory'
    });

    app.extend.plugin(RouterPlugin, router);

    it('create app', async () => {
        await app.create();
    })


    it('render temp', (done) => {
        router.goto({ name: "temp" }).then(result => {
            expect(router.currentRoute).eql({
                name: 'temp',
                param: {},
                path: "/temp",
                query: {}
            } as IRoute);
            debugger;
            console.log('router view size', router['_activeRouterViewSet_'].size);
            expect(router['_activeRouterViewSet_'].size).equal(1);
            done();
        })
    })

    it('render temp child', async () => {
        const consoleSpy = spy(console, "warn");
        await router.goto({ name: "temp-child" });
        expect(router.currentRoute).eql({
            name: 'temp-child',
            param: {},
            path: "/temp/child",
            query: {}
        } as IRoute);

        // await new Promise((res, rej) => {
        //     setTimeout(res, 100);
        // });

        expect(consoleSpy.args).length(1);

        const args0 = consoleSpy.args[0];
        expect(args0).length(1);
        expect(args0[0]).equal(`No router view found for path - 'child'`);

        consoleSpy.restore();
    })
})

