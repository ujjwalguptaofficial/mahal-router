// import { expect } from "chai";
// import * as $ from "jquery";

describe('Start', function () {

    it("wait for mounting", (done) => {
        setTimeout(done, 1000);
    })

    it("check for mahal router", () => {
        expect($('.start').text().trim()).equal("Mahal Router");
    })

    it("login", async () => {
        $('.route-login').click();
        await window['after'](100);
        $('input[type="text"]').val('ujjwal')
        $('input[type="password"]').val('admin')
        $('.btn-login').click();
        await window['after'](100);
        const el = $('div[comp="user"]');
        const html = el.html();
        expect(html.includes("User")).equal(true);
        expect(html.includes("Dashboard")).equal(true);
        expect(el.find('.user-name')).length(1);
        expect(el.find('.user-name').text()).equal("ujjwal");
    })
    
})