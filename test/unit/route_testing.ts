import { createRoute, Router } from "@mahaljs/router";
import { expect } from "chai";

describe('routes test', () => {

    it('when just before route has more path', async () => {
        const router = new Router({
            ...createRoute({
                path: "/project/{id}",
                component: 'ProjectById',
                name: "project-by-id",
            }),
            ...createRoute({
                path: "/project",
                component: 'Project',
                name: "project",
            }),
        }, {
            mode: 'memory'
        });

        await router.goto({ name: 'project' });
        expect(router.currentRoute.name).equal('project');
    })


})

