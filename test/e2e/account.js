describe('Account', function () {

    it("go to edit profile", async () => {
        await $routeGoto({
            name: "edit-profile"
        });
        await $after(1000);
        const selector = 'div[comp="projects"]';
        const html = await $html(selector);
        expect(html.includes("Projects")).equal(true);

        expect(await $length('div[comp="projects"] h1')).equal(1);

        expectedRoute = {
            name: "edit-profile",
            param: {

            },
            path: "/account/profile/edit-profile",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "home-context",
            param: {

            },
            path: "/context.html",
            query: {

            }
        }, expectedRoute);

        const routerViewSetLength = await $routerViewSetLength()
        expect(routerViewSetLength).equal(3);
    })

    it("go to profile page", async () => {
        await $routeGoto({
            name: "profile-by-id",
            param: {
                id: 1
            }
        });
        await $after(100);
        const selector = 'div[comp="projects"]';
        const html = await $html(selector);
        expect(html.includes("Projects")).equal(true);

        expect(await $length('div[comp="projects"] h1')).equal(1);

        expectedRoute = {
            name: "profile-by-id",
            param: {
                id: "1"
            },
            path: "/account/profile/1",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "edit-profile",
            param: {

            },
            path: "/account/profile/edit-profile",
            query: {

            }
        }, expectedRoute);

        const routerViewSetLength = await $routerViewSetLength()
        expect(routerViewSetLength).equal(3);
    })

    it('go to parent page and go to different user id', async () => {

        await $routeGoto({
            name: "profile"
        });
        await $after(100);

        let selector = 'div[comp="projects"]';
        let html = await $html(selector);
        expect(html).equal(undefined);

        await $routeGoto({
            name: "profile-by-id",
            param: {
                id: 2
            }
        });
        await $after(100);
        selector = 'div[comp="projects"]';
        html = await $html(selector);
        expect(html.includes("Projects")).equal(true);

        expect(await $length('div[comp="projects"] h1')).equal(1);

        expectedRoute = {
            name: "profile-by-id",
            param: {
                id: "2"
            },
            path: "/account/profile/2",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "profile",
            param: {

            },
            path: "/account/profile",
            query: {

            }
        }, expectedRoute);

        const routerViewSetLength = await $routerViewSetLength()
        expect(routerViewSetLength).equal(3);
    });

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
            name: "profile-by-id",
            param: {
                id: "2"
            },
            path: "/account/profile/2",
            query: {

            }
        }, expectedRoute);

        const routerViewSetLength = await $routerViewSetLength()
        expect(routerViewSetLength).equal(2);
    })

});