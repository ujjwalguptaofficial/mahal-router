describe('Project', function () {

    it("go to project", async () => {
        await $routeGoto({
            name: "project"
        });
        await $after(100);
        const selector = 'div[comp="projects"]';
        const html = await $html(selector);
        expect(html.includes("Projects")).equal(true);

        expect(await $length('div[comp="projects"] h1')).equal(1);

        expectedRoute = {
            name: "project",
            param: {

            },
            path: "/project",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "particular_task",
            param: {
                "value": "Hello World"
            },
            path: "/task/Hello World",
            query: {

            }
        }, expectedRoute);

        const routerViewSetLength = await $routerViewSetLength()
        expect(routerViewSetLength).equal(1);
    })

    it("click on particular project", async () => {
        await $click('div[comp="projects"] button:nth-child(2)')
        await $after(100);
        const selector = '.project-by-id';
        const html = await $html(selector);
        expect(html).includes('Project by id 1');

        expectedRoute = {
            name: "project-by-id",
            param: {
                id: '1'
            },
            path: "/project/1",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "project",
            param: {

            },
            path: "/project",
            query: {

            }
        }, expectedRoute);

        const routerViewSetLength = await $routerViewSetLength()
        expect(routerViewSetLength).equal(2);
    })

    it("go to particular project", async () => {
        await $routeGoto({
            name: "project-by-id",
            param: {
                id: 2
            }
        });
        await $after(100);
        const selector = '.project-by-id';
        const html = await $html(selector);
        expect(html).includes('Project by id 2');

        expectedRoute = {
            name: "project-by-id",
            param: {
                id: '2'
            },
            path: "/project/2",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "project-by-id",
            param: {
                id: '1'
            },
            path: "/project/1",
            query: {

            }
        }, expectedRoute);

        const routerViewSetLength = await $routerViewSetLength()
        expect(routerViewSetLength).equal(2);
    })

    it('go back by browser', async () => {
        await $routeBack();
        await $after(100);
        let location = await $location();
        expect(location.pathname).equal("/project/1");

        const selector = '.project-by-id';
        const html = await $html(selector);
        expect(html).includes('Project by id 1');

        expectedRoute = {
            name: "project-by-id",
            param: {
                id: '1'
            },
            path: "/project/1",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "project-by-id",
            param: {
                id: '2'
            },
            path: "/project/2",
            query: {

            }
        }, expectedRoute);

        const routerViewSetLength = await $routerViewSetLength()
        expect(routerViewSetLength).equal(2);
    })

    it("go to particular project after going back", async () => {
        await $routeGoto({
            name: "project-by-id",
            param: {
                id: 4
            }
        });
        await $after(100);
        const selector = '.project-by-id';
        const html = await $html(selector);
        expect(html).includes('Project by id 4');

        expectedRoute = {
            name: "project-by-id",
            param: {
                id: '4'
            },
            path: "/project/4",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "project-by-id",
            param: {
                id: '1'
            },
            path: "/project/1",
            query: {

            }
        }, expectedRoute);

        const routerViewSetLength = await $routerViewSetLength()
        expect(routerViewSetLength).equal(2);
    })

    it("go to buy project from project id page", async () => {
        await $routeGoto({
            name: "buy-project"
        });
        await $after(100);
        const selector = '.buy-project';
        const html = await $html(selector);
        expect(html).equal('Buy Project 4');

        expectedRoute = {
            name: "buy-project",
            param: {
                id: '4'
            },
            path: "/project/4/buy",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "project-by-id",
            param: {
                id: '4'
            },
            path: "/project/4",
            query: {

            }
        }, expectedRoute);

        const routerViewSetLength = await $routerViewSetLength()
        expect(routerViewSetLength).equal(2);
    })

    it("go to project", async () => {
        await $routeGoto({
            name: "project"
        });
        await $after(100);
        const selector = 'div[comp="projects"]';
        const html = await $html(selector);
        expect(html.includes("Projects")).equal(true);

        expect(await $length('div[comp="projects"] h1')).equal(1);

        expectedRoute = {
            name: "project",
            param: {

            },
            path: "/project",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "buy-project",
            param: {
                id: '4'
            },
            path: "/project/4/buy",
            query: {

            }
        }, expectedRoute);

        const routerViewSetLength = await $routerViewSetLength()
        expect(routerViewSetLength).equal(1);
    })


    it("click on home", async () => {
        await $click('.route-home');
        await $after(100);
        const location = await $location();
        expect(location.pathname).equal("/context.html");
        expect(location.href.includes("?")).equal(false);

        expectedRoute = {
            name: "home-context",
            param: {

            },
            path: "/context.html",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "project",
            param: {

            },
            path: "/project",
            query: {

            }
        }, expectedRoute);

        const routerViewSetLength = await $routerViewSetLength()
        expect(routerViewSetLength).equal(2);
    })
})