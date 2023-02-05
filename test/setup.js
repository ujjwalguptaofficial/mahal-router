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
    // headless: false,
    slowMo: 100,
    timeout: 0,
    args: ['--start-maximized', '--window-size=1366,786'],
    devtools: true,
}

before(async () => {
    global.expect = expect;
    const browser = await puppeteer.launch();
    global.browser = browser;
    const page = await browser.newPage();

    Fort.routes = []
    Fort.folders = [{
        alias: "/",
        path: "./bin"
    }]
    Fort.port = 4001;
    await Fort.create();
    await page.goto("http://localhost:4001/");

    global.$testForRoute = async (nextRoute, prevRoute, nextRouteFromBeforeEach) => {
        let route = await $var('activeRoute');
        console.log(route);
        expect(route).eql(nextRoute);

        let prevRouteFromVar = await $var('prevRoute');

        expect(prevRouteFromVar).eql(prevRoute);

        let nextRouteFromBeforeEachVar = await $var('nextRouteFromBeforeEach');

        expect(nextRouteFromBeforeEachVar).eql(nextRouteFromBeforeEach);
    }
    global.$testForError = async (err) => {
        let actualError = await $var('routeErr');
        expect(err).eql(actualError);
    }

    global.$routeGoto = (selector) => {
        return page.evaluate(q => {
            if (typeof q === 'string') {
                return router.gotoPath(q);
            }
            return router.goto(q);
        }, selector);
    }

    global.$routerViewSetLength = () => {
        return page.evaluate(q => {
            return router._activeRouterViewSet_.size;
        });
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

    global.$attr = async (selector, attrName) => {
        return await page.evaluate(q => {
            return jQuery(q.selector).attr(q.attrName);
        }, { selector, attrName });
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
    global.$checkForRouterViewWarning = (path) => {
        return page.evaluate(q => {
            return window.checkForRouterViewWarning(q)
        }, path);
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
    global.$checkForTitle = async (expectedTitle) => {
        const html = await $html('title');
        expect(expectedTitle).equal(html);
    }
    global.$checkForMeta = async (tags) => {
        const tagsPromise = tags.map(tag => {
            let contentValue;
            if (tag.name) {
                return $attr(`meta[name='${tag.name}']`, 'content')
            }
            else if (tag.property) {
                return $attr(`meta[name='${tag.name}']`, 'content')
            }
        });
        const results = await Promise.all(tagsPromise)

        tags.forEach((tag, index) => {
            expect(tag.content).equal(results[index]);
        })
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