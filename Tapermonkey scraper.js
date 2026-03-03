// ==UserScript==
// @name         Bolchile Auto-Sync to Supabase
// @namespace    http://tampermonkey.net/
// @version      3.3
// @description  Scrapes Bolchile data and inserts directly into Supabase (no n8n)
// @author       Oscar
// @match        https://www.bolchile.com/*
// @match        https://bolchile.com/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @connect      hpmwopdofvcjpkzjokxt.supabase.co
// ==/UserScript==

(function () {
    'use strict';

    // ── Supabase Config ──
    var SUPABASE_URL = 'https://hpmwopdofvcjpkzjokxt.supabase.co';
    var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwbXdvcGRvZnZjanBrempva3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTM2NzksImV4cCI6MjA4NjU2OTY3OX0.9La76N-QnnDCQJL39UGH_LEv05ZkGzFgCn0q_iVlXxw';
    var HISTORIAL_ENDPOINT = SUPABASE_URL + '/rest/v1/bolchile_historial';
    var PRECIO_LIVE_ENDPOINT = SUPABASE_URL + '/rest/v1/bolchile_precio_live';

    var hashMonto = '';
    var hashPrecio = '';
    var tMonto = null;
    var tPrecio = null;

    // ── Extract data from the page ──
    function d() {
        var x = document.body.innerText;
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

    // ── Supabase request helper ──
    function sbRequest(method, url, data, headers, onload) {
        var h = {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        };
        for (var k in headers) h[k] = headers[k];
        GM_xmlhttpRequest({
            method: method,
            url: url,
            headers: h,
            data: JSON.stringify(data),
            onload: onload || function () { },
            onerror: function () { }
        });
    }

    // ── INSERT to historial (triggered by monto change) ──
    function sendHistorial(datos) {
        if (!datos.valor_actual || parseFloat(datos.valor_actual) <= 0) return;
        if (!datos.monto_usd || parseFloat(datos.monto_usd) <= 0) return;
        if (!datos.negocios || parseFloat(datos.negocios) <= 0) return;

        var h = datos.monto_usd;
        if (h === hashMonto) return;

        sbRequest('POST', HISTORIAL_ENDPOINT, {
            valor_actual: datos.valor_actual,
            monto_usd: datos.monto_usd,
            negocios: datos.negocios
        }, { 'Prefer': 'return=minimal' }, function (res) {
            if (res.status >= 200 && res.status < 300) hashMonto = h;
        });
    }

    // ── UPSERT live price (triggered by ANY price change) ──
    function sendPrecioLive(datos) {
        if (!datos.valor_actual || parseFloat(datos.valor_actual) <= 0) return;

        var h = datos.valor_actual;
        if (h === hashPrecio) return;

        sbRequest('POST', PRECIO_LIVE_ENDPOINT + '?on_conflict=id', {
            id: 1,
            valor_actual: datos.valor_actual
        }, { 'Prefer': 'resolution=merge-duplicates,return=minimal' }, function (res) {
            if (res.status >= 200 && res.status < 300) hashPrecio = h;
        });
    }

    // ── Observe DOM changes ──
    var node = document.getElementById('root') || document.body;
    new MutationObserver(function () {
        // Historial: 400ms debounce (monto trigger)
        if (tMonto) clearTimeout(tMonto);
        tMonto = setTimeout(function () { sendHistorial(d()); }, 400);

        // Precio live: 300ms debounce (faster, any price change)
        if (tPrecio) clearTimeout(tPrecio);
        tPrecio = setTimeout(function () { sendPrecioLive(d()); }, 300);
    }).observe(node, { childList: true, subtree: true, characterData: true });

    // ── Initial scrape after 3s ──
    setTimeout(function () {
        var datos = d();
        sendHistorial(datos);
        sendPrecioLive(datos);
    }, 3000);
})();