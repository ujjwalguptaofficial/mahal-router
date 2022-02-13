// const { expect } = require('chai');
// const { pathToFileURL } = require('url');
 

 

// before(async () => {
//     global.expect = expect;
//     const browser = await puppeteer.launch(opts);
//     global.browser = browser;
//     const page = await browser.newPage();

//     Fort.routes = []
//     Fort.folders = [{
//         alias: "/",
//         path: "./bin"
//     }]
//     await Fort.create();
//     await page.goto("http://localhost:4000/");

//     global.$routeGoto = (selector) => {
//         return page.evaluate(q => {
//             return router.goto(q);
//         }, selector);
//     }

//     global.$text = async (selector) => {
//         return await page.evaluate(q => {
//             return jQuery(q).text();
//         }, selector);
//     }
//     global.$html = async (selector) => {
//         return await page.evaluate(q => {
//             return jQuery(q).html();
//         }, selector);
//     }
//     global.$click = async (selector) => {
//         return await page.evaluate(q => {
//             return jQuery(q).click();
//         }, selector);
//     }
//     global.$after = (time) => {
//         return new Promise(res => {
//             setTimeout(res, time)
//         })
//     }
//     global.$val = async (selector, val) => {
//         return await page.evaluate(q => {
//             return jQuery(q.selector).val(q.value);
//         }, {
//             selector, value: val
//         });
//     }
//     global.$length = async (selector) => {
//         return await page.evaluate(q => {
//             return document.querySelectorAll(q).length;
//         }, selector);
//     }
//     global.$location = async () => {
//         return await page.evaluate(q => {
//             return location;
//         });
//     }
//     global.$var = async (value) => {
//         return await page.evaluate(q => {
//             return window[q];
//         }, value);
//     }
//     global.$history = async () => {
//         return await page.evaluate(q => {
//             return {
//                 length: history.length
//             }
//         });
//     }

//     global.$reload = () => {
//         return page.reload();
//     }
// });


