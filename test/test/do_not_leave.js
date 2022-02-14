describe('Do not leave', function () {

    it("click on do not leave", async () => {
        await $click('.route-do-not-leave');
        await $after(100);

        expectedRoute = {
            name: "do-not-leave",
            param: {

            },
            path: "/do-not-leave",
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
    })

    it("go to user page", async () => {
        await $click('.route-home');
        await $after(100);

        const location = await $location();
        expect(location.pathname).equal(expectedRoute.path);

        expectedRoute = {
            name: "do-not-leave",
            param: {

            },
            path: "/do-not-leave",
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
        }, {
            name: "home-context",
            param: {

            },
            path: "/context.html",
            query: {

            }
        });
    })
})