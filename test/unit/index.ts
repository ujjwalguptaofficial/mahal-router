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

        });
        checkForEvent('navigate', 1);
        router.goto({
            name: 'home'
        }).then(result => {
            expect(result).equal(undefined);
            expect(router.history).length(1);
            done();
        })
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
        });
        router.gotoPath("/").then(result => {
            expect(result).equal(undefined);
            debugger;
            expect(router.history).length(2);
            done();
        })
    })

    it('check 404 using path', (done) => {
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
                router.off('navigate');
                router.off('notFound');
            });
        });

        router.gotoPath("/dd").then(_ => {
            expect(router.history).length(3);
            done();
        })
    })

    it('check 404 using route object', (done) => {
        router.on("notFound", (route) => {
            const expectedRoute = {
                name: "invalid_route"
            };
            // return done(route)
            expect(route).eql(expectedRoute);
            router.off('navigate');
            router.off('notFound');
        });

        router.goto({
            name: 'invalid_route'
        }).then(_ => {
            expect(router.history).length(3);
            done();
        })
    })
})

