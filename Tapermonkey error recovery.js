// ==UserScript==
// @name         Bolchile Error Recovery
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Recovery
// @author       Oscar
// @match        https://www.bolchile.com/error*
// @match        https://bolchile.com/error*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @inject-into  content
// ==/UserScript==

(function () {
    'use strict';

    var min = 5000;
    var max = 10000;
    var delay = Math.floor(Math.random() * (max - min + 1)) + min;

    setTimeout(function () {
        window.location.href = 'https://www.bolchile.com/premium/dollar';
    }, delay);
})();
