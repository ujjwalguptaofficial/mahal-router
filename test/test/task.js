describe('Task', function () {

    it("click on a task", async () => {
        const text = await $text('.todo:nth(0) :nth(1)');
        $click('.todo:nth(0) :nth(1)');
        await $after(100);
        expect(await $text('div[comp="task"] h1')).equal("Task");
        expect(text).equal(await $text('div[comp="task"] h3'));
        const route = await $var('activeRoute');
        expect(route.name).equal("particular_task");
    })

    it("go to another task", async () => {
        const text = "Hello World";
        await $routeGoto("/task/" + text);
        await $after(100);
        expect(await $text('div[comp="task"] h1')).equal("Task");
        expect(text).equal(await $text('div[comp="task"] h3'));
        const route = await $var('activeRoute');
        expect(route.name).equal("particular_task");
    })

    it("click on home", async () => {
        await $click('.route-home');
        await $after(100);
        const location = await $location();
        expect(location.pathname).equal("/context.html");
        expect(location.href.includes("?")).equal(false);
    })
})