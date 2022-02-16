describe('Task', function () {

    it("click on a task", async () => {
        const text = await $text('.todo:nth(0) :nth(1)');
        $click('.todo:nth(0) :nth(1)');
        await $after(100);
        expect(await $text('div[comp="task"] h1')).equal("Task");
        expect(text).equal(await $text('div[comp="task"] h3'));

        expectedRoute = {
            name: "particular_task",
            param: {
                "value": "Buy shoes"
            },
            path: "/task/Buy shoes",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "user-dashboard",
            param: {

            },
            path: "/user/dashboard",
            query: {

            }
        }, expectedRoute);

    })

    it("go to another task", async () => {
        const text = "Hello World";
        await $routeGoto("/task/" + text);
        await $after(100);
        expect(await $text('div[comp="task"] h1')).equal("Task");
        expect(text).equal(await $text('div[comp="task"] h3'));
        const route = await $var('activeRoute');
        expect(route.name).equal("particular_task");

        expectedRoute = {
            name: "particular_task",
            param: {
                "value": "Hello World"
            },
            path: "/task/Hello World",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "particular_task",
            param: {
                "value": "Buy shoes"
            },
            path: "/task/Buy shoes",
            query: {

            }
        }, expectedRoute);

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
            name: "particular_task",
            param: {
                "value": "Hello World"
            },
            path: "/task/Hello World",
            query: {

            }
        }, expectedRoute);
    })
})