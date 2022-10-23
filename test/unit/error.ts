import { createRoute, Router } from "@mahaljs/router";
import { expect } from "chai";

describe('event test', () => {
    const router = new Router({
        ...createRoute({
            path: "/project",
            component: 'Project',
            name: "project",
        }),
        ...createRoute({
            path: "/project/{id}",
            component: 'ProjectById',
            name: "project-by-id",
        }),
    }, {
        mode: 'memory'
    });

    function checkForEvent(event, length) {
        expect(router['_eventBus_']['_events_'][event]).length(length);

    }

    it('go to without param', (done) => {
        router.goto({}).catch(err => {
            expect(err).equal(
                "No route found for specified argument {}"
            )
            done();
        })
    })

    it('got to route by name which is invalid', (done) => {
        router.goto({
            name: 'invalid_route'
        }).then(_ => {
            done('should be error');
        }).catch(err => {
            expect(err).equal(`No route found for specified argument {"name":"invalid_route"}`)
            done();
        })
    })

    it('go to project by id without param', (done) => {
        const route = {
            name: 'project-by-id',
        };
        router.goto(route).then(result => {
            done('there should be error thrown')
        }).catch(err => {
            // console.error('error', err);
            expect(err).equal(
                `Expecting param - no param is provided in route ${JSON.stringify(route)}`
            )
            done();
        })
    })

    it('go to project by id with wrong param', (done) => {
        const route = {
            name: 'project-by-id',
            param: {
                projectId: 5
            }
        };
        router.goto(route).then(result => {
            done('there should be error thrown')
        }).catch(err => {
            // console.error('error', err);
            expect(err).equal(
                `Expecting param 'id' but is not provided`
            )
            done();
        })
    })
})

