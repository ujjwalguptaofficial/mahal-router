import { createRoute, Router } from "mahal-router";
import { expect } from "chai";

describe('event test', () => {
    const router = new Router({
        ...createRoute({
            path: "/",
            component: 'Start',
            name: "home",
        }),
    }, {
        mode: 'memory'
    });

    function checkForEvent(event, length) {
        expect(router['eventBus_']['_events'][event]).length(length);

    }

    it('go to by name', (done) => {
        router.on("navigate", (route) => {
            expect(route).eql({
                name: 'home',
                query: {},
                param: {},
                path: '/'
            })
            router.off('navigate');
            checkForEvent('navigate', 0);
            done();
        });
        checkForEvent('navigate', 1);
        router.goto({
            name: 'home'
        });
    })

    it('go to by path', (done) => {
        router.on("navigate", (route) => {
            expect(route).eql({
                name: 'home',
                query: {},
                param: {},
                path: '/'
            })
            router.off('navigate');
            done();
        });
        router.gotoPath("/");
    })

    it('check 404', (done) => {
        router.on("notFound", (route) => {
            const expectedRoute = {
                name: "NotFound",
                query: {},
                param: {},
                path: '/dd'
            };
            expect(route).eql(expectedRoute);
            router.on("navigate", (route) => {
                expect(route).eql(expectedRoute);
                done();
            });
        });

        router.gotoPath("/dd");
    })
})

