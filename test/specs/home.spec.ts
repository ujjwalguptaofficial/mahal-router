import { expect } from "chai";
import $ from "jquery";

describe('Home', function () {

    it("wait for mounting", (done) => {
        setTimeout(done, 100);
    })

    it("check for mahal router", async () => {
        const text = await $('.start').text();
        expect(text.trim()).equal("Mahal Router");
        const location = window.location
        expect(location.pathname).equal("/");
        expect(location.href.includes("?")).equal(false);

        let route = window['activeRoute'];
        expect(route.query).eql({});
    })
});