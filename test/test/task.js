describe('Task', function () {

    it("click on a task", () => {
        const el = $('.todo')[0];
        el.click();
        await window['after'](100);
        expect($('div[comp="task"] h1').text()).equal("Task");
        expect($(el).text()).equal($('div[comp="task"] h1').text());

    })
})