import { createRoute, Router } from "@mahaljs/router";
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
        expect(router['_eventBus_']['_events_'][event]).length(length);

    }

    it('go to by name', (done) => {
        const cb = (route) => {
            expect(route).eql({
                name: 'home',
                query: {},
                param: {},
                path: '/'
            })
            router.off('navigate', cb);
            checkForEvent('navigate', 0);

        };
        router.on("navigate", cb);
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
        const cb = (route) => {
            expect(route).eql({
                name: 'home',
                query: {},
                param: {},
                path: '/'
            })
            router.off('navigate', cb);
        };
        router.on("navigate", cb);
        router.gotoPath("/").then(result => {
            expect(result).equal(undefined);
            expect(router.history).length(2);
            done();
        })
    })

    it('check 404 using path', (done) => {
        const onNotFound = (route) => {
            const expectedRoute = {
                name: "NotFound",
                query: {},
                param: {},
                path: '/dd'
            };
            expect(route).eql(expectedRoute);
            const onNavigate = (route) => {
                expect(route).eql(expectedRoute);
                router.off('navigate', onNavigate);
                router.off('notFound', onNotFound);
            };
            router.on("navigate", onNavigate);
        };
        router.on("notFound", onNotFound);

        router.gotoPath("/dd").then(_ => {
            expect(router.history).length(3);
            done();
        })
    })

    it('check 404 using route object', (done) => {
        const onNotFound = (route) => {
            const expectedRoute = {
                name: "invalid_route"
            };
            // return done(route)
            expect(route).eql(expectedRoute);
            // router.off('navigate');
            router.off('notFound', onNotFound);
        };
        router.on("notFound", onNotFound);

        router.goto({
            name: 'invalid_route'
        }).then(_ => {
            expect(router.history).length(3);
            done();
        })
    })
})

