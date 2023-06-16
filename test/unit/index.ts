import { createRoute, Router } from "@mahaljs/router";
import { expect } from "chai";

describe('event test', () => {
    const router = new Router({
        ...createRoute({
            path: "/",
            component: 'Start',
            name: "home",
        }),
        ...createRoute({
            path: "/project",
            component: 'Project',
            name: "project",
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
                path: '/',
                meta: undefined
            })
            router.off('navigate', cb);
            checkForEvent('navigate', 0);
        };
        router.on("navigate", cb);
        checkForEvent('navigate', 1);
        let routeResult;
        router.goto({
            name: 'home'
        }).then(result => {
            expect(result).equal(undefined);
            expect(router.history).length(2);
            done();
        })
    })

    it('go to by path', (done) => {
        const cb = (route) => {
            expect(route).eql({
                name: 'home',
                query: {},
                param: {},
                path: '/',
                meta: undefined
            })
            router.off('navigate', cb);
        };
        router.on("navigate", cb);
        router.gotoPath("/").then(result => {
            expect(result).equal(undefined);
            expect(router.history).length(3);
            done();
        })
    })

    it('go to with empty object', (done) => {
        router.goto({}).catch(err => {
            expect(err).equal(
                "No route found for specified argument {}"
            )
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
            expect(router.history).length(4);
            done();
        })
    })
})

