# Bolchile Scraper

Workspace del monitor de dolar.

## Fuente oficial

La UI oficial validada vive en `dashboard/`.

- Desarrollo: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

Los scripts del directorio raiz estan configurados como proxy y ejecutan esos comandos dentro de `dashboard/`.

## Netlify

La configuracion oficial de despliegue esta en `netlify.toml` (raiz):

- `base = "dashboard"`
- `command = "npm run build"`
- `publish = "dist"`

Con esto, Netlify siempre construye la app oficial de `dashboard/`.
