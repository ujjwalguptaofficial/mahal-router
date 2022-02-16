// import { expect } from "chai";
// import * as $ from "jquery";

describe('Start', function () {

    it("wait for mounting", (done) => {
        setTimeout(done, 100);
    })

    it("check for mahal router", async () => {
        const text = await $text('.start');
        expect(text.trim()).equal("Mahal Router");
        const location = await $location();
        expect(location.pathname).equal("/");
        expect(location.href.includes("?")).equal(false);
        const expectedRoute = {
            name: "home",
            param: {},
            path: "/",
            query: {}
        }

        await $testForRoute(expectedRoute, {}, undefined)
    })

    it("reload && check history length", async () => {
        let history = await $history();
        const prevHistoryLength = history.length;
        await $reload();
        history = await $history();
        expect(prevHistoryLength).equal(history.length);

        const expectedRoute = {
            name: "home",
            param: {},
            path: "/",
            query: {}
        }

        await $testForRoute(expectedRoute, {}, undefined)
    });

    it("login", async () => {
        let history = await $history();
        const prevHistoryLength = history.length;
        console.log('prevHistoryLength', prevHistoryLength)
        await $click('.route-login');
        await $after(100);
        history = await $history();
        expect(history.length).equal(prevHistoryLength + 1);
        await $val('input[type="text"]', 'ujjwal')
        await $val('input[type="password"]', 'admin')
        let location = await $location();
        expect(location.pathname).equal("/user/login");
        let route = await $var('activeRoute');
        let expectedRoute = {
            name: "user-login",
            param: {},
            path: "/user/login",
            query: {}
        }
        await $testForRoute(expectedRoute, {
            name: "home",
            param: {},
            path: "/",
            query: {}
        }, expectedRoute)

        await $click('.btn-login');
        await $after(100);
        const selector = 'div[comp="user"]';
        const html = await $html(selector);
        expect(html.includes("User")).equal(true);
        expect(html.includes("Dashboard")).equal(true);
        expect(await $length(selector + ' .user-name')).equal(1);
        expect(await $text(selector + ' .user-name')).equal("ujjwal");

        location = await $location();
        expect(location.pathname).equal("/user/dashboard");
        expect(location.search).equal("?name=ujjwal");
        route = await $var('activeRoute');
        expect(route.name).equal("user-dashboard");

        expectedRoute = {
            name: "user-dashboard",
            param: {},
            path: "/user/dashboard",
            query: {
                name: 'ujjwal'
            }
        }
        await $testForRoute(expectedRoute, {
            name: "user-login",
            param: {},
            path: "/user/login",
            query: {}
        }, expectedRoute)
    })

    it("go to invalid path", async () => {
        await $click('.route-invalid');
        await $after(100);
        let location = await $location();
        expect(location.pathname).equal("/user/invalid");
        const text = await $text('.not-found');
        expect(text.trim()).equal(`Route "invalid" does not exist`);

        expectedRoute = {
            name: "not_found",
            param: {},
            path: "invalid",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "user-dashboard",
            param: {},
            path: "/user/dashboard",
            query: {
                name: 'ujjwal'
            }
        }, expectedRoute)
    })

    it("go to user_by_id route path", async () => {
        await $routeGoto({
            path: '/user/12/15'
        });
        await $after(100);
        let location = await $location();
        expect(location.pathname).equal("/user/12/15");
        let text = await $text('.user-id');
        expect(text.trim()).equal(`12`);

        text = await $text('.account-id');
        expect(text.trim()).equal(`15`);

        expectedRoute = {
            name: "user-account",
            param: {
                userId: "12",
                accountId: "15"
            },
            path: "/user/12/15",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "not_found",
            param: {},
            path: "invalid",
            query: {

            }
        }, expectedRoute);
    })

    it("go to user_by_id by route link", async () => {
        await $click('.account-page');
        await $after(100);
        let location = await $location();
        expect(location.pathname).equal("/user/1/2");

        expectedRoute = {
            name: "user-account",
            param: {
                userId: "1",
                accountId: "2"
            },
            path: "/user/1/2",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "user-account",
            param: {
                userId: "12",
                accountId: "15"
            },
            path: "/user/12/15",
            query: {

            }
        }, expectedRoute);

        let text = await $text('.user-id');
        expect(text.trim()).equal(`1`);

        text = await $text('.account-id');
        expect(text.trim()).equal(`2`);
    })

    it('go back by browser', async () => {
        await $routeBack();
        await $after(100);
        let location = await $location();
        expect(location.pathname).equal("/user/12/15");
        let text = await $text('.user-id');
        expect(text.trim()).equal(`12`);

        text = await $text('.account-id');
        expect(text.trim()).equal(`15`);

        expectedRoute = {
            name: "user-account",
            param: {
                userId: "12",
                accountId: "15"
            },
            path: "/user/12/15",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "user-account",
            param: {
                userId: "1",
                accountId: "2"
            },
            path: "/user/1/2",
            query: {

            }
        }, expectedRoute);
    })

    it('go forward by browser', async () => {
        await $routeForward();
        await $after(100);
        let location = await $location();
        expect(location.pathname).equal("/user/1/2");

        expectedRoute = {
            name: "user-account",
            param: {
                userId: "1",
                accountId: "2"
            },
            path: "/user/1/2",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "user-account",
            param: {
                userId: "12",
                accountId: "15"
            },
            path: "/user/12/15",
            query: {

            }
        }, expectedRoute);

        let text = await $text('.user-id');
        expect(text.trim()).equal(`1`);

        text = await $text('.account-id');
        expect(text.trim()).equal(`2`);
    })

    it("go to dashboard", async () => {
        await $routeGoto({
            name: "user-dashboard"
        });
        await $after(100);
        const selector = 'div[comp="user"]';
        const html = await $html(selector);
        expect(html.includes("User")).equal(true);
        expect(html.includes("Dashboard")).equal(true);

        expectedRoute = {
            name: "user-dashboard",
            param: {

            },
            path: "/user/dashboard",
            query: {

            }
        }
        await $testForRoute(expectedRoute, {
            name: "user-account",
            param: {
                userId: "1",
                accountId: "2"
            },
            path: "/user/1/2",
            query: {

            }
        }, expectedRoute);
    })



})