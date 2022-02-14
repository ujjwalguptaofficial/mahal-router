const puppeteer = require('puppeteer');
const { expect } = require('chai');
const { pathToFileURL } = require('url');
const { Fort } = require("fortjs");
// const jquery = require("jquery")
// const opn = require('opn');
// const cmd = require('node-cmd');

// const _ = require('lodash');

// const globalVariables = _.pick(global, ['browser', 'expect']);


const opts = {
    headless: false,
    slowMo: 100,
    timeout: 0,
    args: ['--start-maximized', '--window-size=1366,786'],
    devtools: true,
}

before(async () => {
    global.expect = expect;
    const browser = await puppeteer.launch(opts);
    global.browser = browser;
    const page = await browser.newPage();

    Fort.routes = []
    Fort.folders = [{
        alias: "/",
        path: "./bin"
    }]
    await Fort.create();
    await page.goto("http://localhost:4000/");

    global.$testForRoute = async (nextRoute, prevRoute, nextRouteFromBeforeEach) => {
        let route = await $var('activeRoute');
        expect(route).eql(nextRoute);

        let prevRouteFromVar = await $var('prevRoute');

        expect(prevRouteFromVar).eql(prevRoute);

        let nextRouteFromBeforeEachVar = await $var('nextRouteFromBeforeEach');

        expect(nextRouteFromBeforeEachVar).eql(nextRouteFromBeforeEach);
    }

    global.$routeGoto = (selector) => {
        return page.evaluate(q => {
            return router.goto(q);
        }, selector);
    }

    global.$routeBack = (selector) => {
        return page.evaluate(q => {
            return history.back();
        }, selector);
    }

    global.$routeForward = (selector) => {
        return page.evaluate(q => {
            return history.forward();
        }, selector);
    }

    global.$text = async (selector) => {
        return await page.evaluate(q => {
            return jQuery(q).text();
        }, selector);
    }
    global.$html = async (selector) => {
        return await page.evaluate(q => {
            return jQuery(q).html();
        }, selector);
    }
    global.$click = async (selector, attachDebugger) => {
        return await page.evaluate(q => {
            const el = jQuery(q.selector);
            if (q.attachDebugger) {
                debugger
            }
            return el.trigger('click');
        }, { selector, attachDebugger });
    }
    global.$after = (time) => {
        return new Promise(res => {
            setTimeout(res, time)
        })
    }
    global.$val = async (selector, val) => {
        return await page.evaluate(q => {
            return jQuery(q.selector).val(q.value);
        }, {
            selector, value: val
        });
    }
    global.$length = async (selector) => {
        return await page.evaluate(q => {
            return document.querySelectorAll(q).length;
        }, selector);
    }
    global.$location = async () => {
        return await page.evaluate(q => {
            return location;
        });
    }
    global.$var = async (value) => {
        return await page.evaluate(q => {
            return window[q];
        }, value);
    }
    global.$history = async () => {
        return await page.evaluate(q => {
            return {
                length: history.length
            }
        });
    }

    global.$reload = () => {
        return page.reload();
    }
    global.$debug = async () => {
        return await page.evaluate(q => {
            debugger;
        });
    }
});


after(() => {
    Fort.destroy();
    browser.close();
    // setTimeout(() => { cmd.run('node server.js'); }, 5000)
    // setTimeout(() => { opn('http://localhost:9988'); }, 2000);
    // open('./mochawesome-report/mochawesome.html');
    // global.browser = globalVariables.browser;
    // global.expect = globalVariables.expect;
});