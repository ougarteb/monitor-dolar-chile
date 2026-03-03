// ==UserScript==
// @name         Bolchile Auto Click Login
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Detecta pantalla de login, rellena credenciales y hace click en Iniciar sesión
// @author       Oscar
// @match        https://www.bolchile.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ⚠️ Reemplaza con tus credenciales reales
    const USUARIO = 'ougarteb@gmail.com';
    const PASSWORD = 'NAi2EJok8;S+';

    let yaIntente = false;

    // Truco para forzar actualización del estado en React/Vue/Angular
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype, 'value'
    ).set;

    function setInputValue(input, value) {
        nativeInputValueSetter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function intentarLogin() {
        if (!window.location.pathname.includes('/login')) {
            yaIntente = false;
            return;
        }

        if (yaIntente) return;

        const usernameField = document.querySelector('input#email');
        const passwordField = document.querySelector('input.p-password-input');
        const loginButton = document.querySelector('button.btn_blue_dark');

        if (!usernameField || !passwordField || !loginButton) return;

        console.log("🔐 Página de login detectada. Rellenando credenciales...");
        yaIntente = true;

        // Escribir credenciales directamente (bypass de Chrome autofill)
        setInputValue(usernameField, USUARIO);
        setInputValue(passwordField, PASSWORD);
        console.log("✏️ Credenciales escritas en los campos");

        // Delay aleatorio 4-6s: simula humano y da tiempo a reCAPTCHA para inicializarse
        const delay = Math.random() * 2000 + 4000;
        setTimeout(() => {
            loginButton.click();
            console.log("🚀 Click enviado en login");

            // Polling cada 1s: ¿ya salimos de /login?
            const pollingId = setInterval(() => {
                if (!window.location.pathname.includes('/login')) {
                    clearInterval(pollingId);
                    console.log("✅ Login exitoso. Navegando a /premium/dollar...");
                    window.location.href = 'https://www.bolchile.com/premium/dollar';
                }
            }, 1000);
        }, delay);
    }

    setInterval(intentarLogin, 3000);
    setTimeout(intentarLogin, 3000);
})();
