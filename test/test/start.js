// import { expect } from "chai";
// import * as $ from "jquery";

describe('TAB RENDER', function () {

    it("wait for mounting", (done) => {
        setTimeout(done, 1000);
    })
    
    it("check for mahal router", () => {
        expect($('.start').text().trim()).equal("Mahal Router");
    })
})