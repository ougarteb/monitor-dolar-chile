// ==UserScript==
// @name         Bolchile Auto-Sync to Supabase
// @namespace    http://tampermonkey.net/
// @version      3.6
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
    var HISTORIAL_DOLAR_ENDPOINT = SUPABASE_URL + '/rest/v1/historial_dolar';

    var hashMonto = '';
    var hashPrecio = '';
    var tMonto = null;
    var tPrecio = null;
    var tPrimero = null; // debounce for captureFirstData

    // ── Extract live intraday data ──
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

    // ── Extract "Ayer" row from the Resumen Comparativo table (all columns) ──
    function extractResumenAyer() {
        var tables = document.querySelectorAll('table');
        for (var t = 0; t < tables.length; t++) {
            var rows = tables[t].querySelectorAll('tr');
            for (var r = 0; r < rows.length; r++) {
                var cells = rows[r].querySelectorAll('td');
                if (cells.length >= 8) {
                    var label = cells[0].textContent.trim().toLowerCase();
                    if (label === 'ayer') {
                        return {
                            monto_usd: cells[1].textContent.trim(),
                            transacciones: cells[2].textContent.trim(),
                            precio_max: cells[3].textContent.trim(),
                            precio_min: cells[4].textContent.trim(),
                            precio_promedio: cells[5].textContent.trim(),
                            precio_cierre: cells[6].textContent.trim(),
                            variacion_pct: cells[7].textContent.trim()
                        };
                    }
                }
            }
        }
        return null;
    }

    // ── Clean Chilean number format ("$918,45" → 918.45) ──
    function cleanNumber(str) {
        if (!str) return null;
        var s = str.replace(/\$/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
        var n = parseFloat(s);
        return isNaN(n) ? null : n;
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

    // ── Helper: get Chile date/time parts ──
    function chileTimeParts() {
        var now = new Date();
        var fmt = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Santiago',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });
        var parts = fmt.formatToParts(now);
        var p = {};
        parts.forEach(function (x) { p[x.type] = x.value; });
        p.todayStr = p.year + '-' + p.month + '-' + p.day;
        p.totalMin = parseInt(p.hour, 10) * 60 + parseInt(p.minute, 10);
        p.elapsedSec = parseInt(p.hour, 10) * 3600
            + parseInt(p.minute, 10) * 60
            + parseInt(p.second, 10);

        var chileDate = new Date(p.todayStr + 'T12:00:00');
        p.dayOfWeek = chileDate.getDay(); // 0=Sunday, 1=Monday... 6=Saturday
        return p;
    }

    // ── INSERT to bolchile_historial intraday (triggered by monto change) ──
    function sendHistorial(datos) {
        var p = chileTimeParts();
        if (p.dayOfWeek === 0 || p.dayOfWeek === 6) return; // Solo Lunes a Viernes

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

    // ── UPSERT bolchile_precio_live (any price change) ──
    function sendPrecioLive(datos) {
        var p = chileTimeParts();
        if (p.dayOfWeek === 0 || p.dayOfWeek === 6) return; // Solo Lunes a Viernes

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

    // ── Capture first morning data ──
    //
    //  SINGLE ROW per day with fecha_archivo = AYER:
    //    - Todo el resumen del día anterior (cierre, max, min, etc.)
    //    - precio_apertura = primer precio del día en curso
    //  La columna fecha_registro (timestampz) indica cuándo se capturó.
    //
    function captureFirstData() {
        var p = chileTimeParts();

        // Solo operamos de Lunes (1) a Viernes (5)
        if (p.dayOfWeek === 0 || p.dayOfWeek === 6) return;

        // Only act between 07:30 and 10:00 AM Chile
        if (p.totalMin < 7 * 60 + 30 || p.totalMin > 10 * 60) return;

        // Already done today?
        var doneKey = 'primer_dato_' + p.todayStr;
        if (localStorage.getItem(doneKey)) return;

        // Need canvas price (apertura de hoy)
        var c = document.querySelector('canvas[valor]');
        var apertura = c ? parseFloat(c.getAttribute('valor')) : null;
        if (!apertura || apertura <= 0) return;

        // Need table data (resumen de ayer) — wait until both are ready
        var ayer = extractResumenAyer();
        if (!ayer || !ayer.monto_usd) return;

        // fecha_archivo = AYER (jornada bursátil del resumen)
        // Si hoy es lunes (1), el "ayer" bursátil es el viernes (restar 3 días)
        var daysToSubtract = (p.dayOfWeek === 1) ? 3 : 1;

        var dateOnly = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Santiago',
            year: 'numeric', month: '2-digit', day: '2-digit'
        });
        var yesterday = new Date(p.todayStr + 'T12:00:00');
        yesterday.setDate(yesterday.getDate() - daysToSubtract);
        var fechaAyer = dateOnly.format(yesterday);

        // SINGLE UPSERT: fila de AYER con TODO — resumen + precio_apertura de hoy
        var pcierre = cleanNumber(ayer.precio_cierre);
        var pvariacion = cleanNumber(ayer.variacion_pct);
        var completo = pcierre !== null && pvariacion !== null;

        sbRequest('POST', HISTORIAL_DOLAR_ENDPOINT + '?on_conflict=fecha_archivo', {
            fecha_archivo: fechaAyer,
            precio_apertura: apertura,
            monto_us: ayer.monto_usd,
            negocios: parseInt(ayer.transacciones.replace(/\./g, ''), 10) || null,
            precio_maximo: cleanNumber(ayer.precio_max),
            precio_minimo: cleanNumber(ayer.precio_min),
            precio_promedio: cleanNumber(ayer.precio_promedio),
            precio_cierre: pcierre,
            variacion_porc: pvariacion
        }, { 'Prefer': 'resolution=merge-duplicates,return=minimal' }, function (res) {
            if (res.status >= 200 && res.status < 300) {
                if (completo) {
                    // Todos los campos críticos presentes: candado puesto, no reintentar
                    localStorage.setItem(doneKey, '1');
                    console.log('[Bolchile] \u2705 Reporte diario completo guardado. fecha_archivo:', fechaAyer, '| apertura:', apertura);
                } else {
                    // Cierre/variación aún null: guardado parcial, reintentar en próximo DOM change
                    console.log('[Bolchile] \u23f3 Reporte parcial guardado (cierre/variaci\u00f3n a\u00fan null). Se reintentar\u00e1.');
                }
            } else {
                console.warn('[Bolchile] \u26a0\ufe0f Insert fallido (status ' + res.status + '). Se reintentará en el próximo cambio de DOM.');
            }
        });
    }

    // ── Schedule page refresh at 07:30 AM Chile time ──
    function schedulePageRefresh() {
        var p = chileTimeParts();
        var targetSec = 7 * 3600 + 30 * 60; // 07:30:00
        var delaySec = targetSec - p.elapsedSec;
        var daysToAdd = 0;

        if (delaySec <= 0) {
            daysToAdd = 1;
            delaySec += 24 * 3600; // already past → next day
        }

        // Si el objetivo recae en fin de semana, añadir días hasta el lunes
        var targetDayOfWeek = (p.dayOfWeek + daysToAdd) % 7;
        if (targetDayOfWeek === 6) { // Sábado
            delaySec += 2 * 24 * 3600;
        } else if (targetDayOfWeek === 0) { // Domingo
            delaySec += 1 * 24 * 3600;
        }

        console.log('[Bolchile] \ud83d\udd04 Refresh programado en', Math.round(delaySec / 60), 'minutos (07:30 AM).');
        setTimeout(function () { location.reload(); }, delaySec * 1000);
    }

    // ── Observe DOM changes ──
    var node = document.getElementById('root') || document.body;
    new MutationObserver(function () {
        // Historial intraday: 400ms debounce
        if (tMonto) clearTimeout(tMonto);
        tMonto = setTimeout(function () { sendHistorial(d()); }, 400);

        // Precio live: 300ms debounce
        if (tPrecio) clearTimeout(tPrecio);
        tPrecio = setTimeout(function () { sendPrecioLive(d()); }, 300);

        // Primera captura mañanera: 3s debounce (espera que la página se estabilice)
        if (tPrimero) clearTimeout(tPrimero);
        tPrimero = setTimeout(function () { captureFirstData(); }, 3000);
    }).observe(node, { childList: true, subtree: true, characterData: true });

    // ── Initial scrape after 3s ──
    setTimeout(function () {
        var datos = d();
        sendHistorial(datos);
        sendPrecioLive(datos);
        captureFirstData(); // will no-op if outside 07:30–10:00 window
    }, 3000);

    // ── Schedule daily page refresh at 07:30 AM Chile time ──
    schedulePageRefresh();

})();