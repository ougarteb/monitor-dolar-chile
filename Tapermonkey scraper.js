// ==UserScript==
// @name         Bolchile Auto-Sync to n8n
// @namespace    http://tampermonkey.net/
// @version      2.8
// @description  Sync
// @author       Oscar
// @match        https://www.bolchile.com/*
// @match        https://bolchile.com/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @connect      n8n.oscarugarte.cl
// ==/UserScript==

(function () {
    'use strict';

    var URL_WH = "https://n8n.oscarugarte.cl/webhook/bolchile-data";
    var hash = '';
    var t = null;

    function d() {
        var x = document.body.innerText;
        // Price is rendered via <canvas valor="868.95"> — read the attribute directly
        var c = document.querySelector('canvas[valor]');
        var precio = c ? c.getAttribute('valor') : null;

        var m = x.match(/Monto US\$[\s\n]*([\d.]+)/i);
        var n = x.match(/(?:Negocios|Transacciones)[\s\n]*([\d.]+)/i);
        return {
            valor_actual: precio,
            monto_usd: m ? m[1] : null,
            negocios: n ? n[1] : null
        };
    }

    function s(datos) {
        if (!datos.valor_actual || parseFloat(datos.valor_actual) <= 0) return;
        if (!datos.monto_usd || parseFloat(datos.monto_usd) <= 0) return;
        if (!datos.negocios || parseFloat(datos.negocios) <= 0) return;
        var h = datos.valor_actual + datos.monto_usd + datos.negocios;
        if (h === hash) return;
        GM_xmlhttpRequest({
            method: 'POST',
            url: URL_WH,
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({
                sitio: "Bolchile",
                valor_actual: datos.valor_actual,
                monto_usd: datos.monto_usd,
                negocios: datos.negocios
            }),
            onload: function () { hash = h; }
        });
    }

    var node = document.getElementById('root') || document.body;
    new MutationObserver(function () {
        if (t) clearTimeout(t);
        t = setTimeout(function () { s(d()); }, 300);
    }).observe(node, { childList: true, subtree: true, characterData: true });

    setTimeout(function () { s(d()); }, 3000);
})();