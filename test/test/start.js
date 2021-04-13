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
    })

    it("reload && check history length", async () => {
        let history = await $history();
        const prevHistoryLength = history.length;
        await $reload();
        history = await $history();
        expect(prevHistoryLength).equal(history.length);
    });

    it("login", async () => {
        let history = await $history();
        const prevHistoryLength = history.length;
        await $click('.route-login');
        await $after(100);
        history = await $history();
        expect(history.length).equal(prevHistoryLength + 1);
        await $val('input[type="text"]', 'ujjwal')
        await $val('input[type="password"]', 'admin')
        let location = await $location();
        expect(location.pathname).equal("/user/login");
        let route = await $var('activeRoute');
        expect(route.name).equal("user-login");

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
    })

    it("go to invalid path", async () => {
        await $click('.route-invalid');
        await $after(100);
        let location = await $location();
        expect(location.pathname).equal("/user/invalid");
        const text = await $text('.not-found');
        expect(text.trim()).equal(`Route "invalid" does not exist`);
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
    })

})