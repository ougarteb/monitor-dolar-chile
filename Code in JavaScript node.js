// Nodo "Code in JavaScript" de n8n
// Recibe el payload estructurado del scraper Tampermonkey v2.0
// Ya no necesita regex — el scraper envía los 3 valores directamente

// 1. Desempaquetar el body del webhook
const rawBody = typeof $input.item.json.body === 'string'
    ? JSON.parse($input.item.json.body)
    : $input.item.json.body;

// 2. Extraer los valores directamente del payload
const valor_actual = rawBody.valor_actual || "No encontrado";
const monto_usd = rawBody.monto_usd || "No encontrado";
const negocios = rawBody.negocios || "No encontrado";

// 3. Log de depuración (visible en la ejecución de n8n)
console.log("Datos recibidos:", { valor_actual, monto_usd, negocios });

// 4. Retornar los campos listos para Supabase
return {
    valor_actual,
    monto_usd,
    negocios
};
