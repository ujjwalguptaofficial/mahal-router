// import { expect } from "chai";
// import * as $ from "jquery";

describe('Start', function () {

    it("wait for mounting", (done) => {
        setTimeout(done, 1000);
    })

    it("check for mahal router", async () => {
        const text = await $text('.start');
        expect(text.trim()).equal("Mahal Router");
    })

    it("login", async () => {
        await $click('.route-login');
        await $after(100);
        await $val('input[type="text"]', 'ujjwal')
        await $val('input[type="password"]', 'admin')
        await $click('.btn-login');
        await $after(100);
        const selector = 'div[comp="user"]';
        const html = await $html(selector);
        expect(html.includes("User")).equal(true);
        expect(html.includes("Dashboard")).equal(true);
        expect(await $length(selector + ' .user-name')).equal(1);
        expect(await $text(selector + ' .user-name')).equal("ujjwal");
    })

})