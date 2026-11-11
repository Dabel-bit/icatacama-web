# IC Atacama: sitio web

Sitio de IC Atacama (importación y venta de maquinaria metalmecánica, Cerrillos, Santiago, con despacho
a todo Chile continental). Está hecho con **Vite + React (.jsx)** y genera **HTML estático por página**
a partir de dos archivos JSON: cada página se renderiza en el build con `renderToStaticMarkup`, así Google
la lee sin ejecutar JavaScript, y solo las partes interactivas (buscador y galería) se hidratan en el
navegador como "islas" de React.

- Producción: **https://icatacama.com** (S3 privado + CloudFront + Route 53, definido en `deploy/cloudformation.yaml`).
- Revisión y pruebas: **GitHub Pages** desde la rama `develop` (copia con `noindex`, nunca indexada).

```
src/data/sitio.json            URL del sitio, contacto, dirección, horario, ventajas y preguntas frecuentes
src/data/productos.json        Categorías y equipos
src/entry-server.jsx           Convierte una ruta en el HTML completo (se ejecuta en Node durante el build)
src/main.jsx                   Entrada del navegador: estilos, fuente autoalojada e hidratación de las islas
src/pages/*.jsx                Páginas: Home, Category, Product, NotFound
src/components/*.jsx           Document (head/SEO/CSP), Header, Footer, Sections, ProductCard, Island…
src/components/Catalog.jsx     Isla: buscador del catálogo
src/components/Gallery.jsx     Isla: galería de fotos de la ficha
src/lib/site.js                Utilidades (precios, rutas, modelo de tarjeta, mailto/WhatsApp, JSON seguro)
src/lib/seo.js                 Datos estructurados schema.org (JSON-LD)
src/lib/security-headers.js    CSP y cabeceras de seguridad (única fuente de verdad)
src/css/styles.css             Estilos (colores del logo en :root)
generator/static-pages.js      Plugin de Vite: valida los JSON, genera páginas, sitemap, robots, manifest y security.txt
scripts/verify-dist.js         Comprueba la seguridad del HTML generado (npm run verify)
public/                        Logo, íconos, imagen para redes sociales y fotos (public/img/equipos/)
deploy/                        Infraestructura AWS (CloudFormation), función de CloudFront y script de publicación
.github/workflows/             CI, publicación en GitHub Pages (develop) y en producción (main)
```

## Uso

```bash
npm install
npm run dev       # http://localhost:5173 (se recarga al editar los JSON o los .jsx)
npm run build     # genera dist/ (HTML estático + assets con hash)
npm run verify    # comprueba CSP, scripts, enlaces y coherencia con la infraestructura
npm run preview   # sirve dist/ en http://localhost:4173 con las mismas cabeceras que CloudFront
```

Variables del build (ver `.env.example`):

| Variable    | Valores                     | Uso                                                                 |
|-------------|-----------------------------|---------------------------------------------------------------------|
| `BASE_PATH` | `/` (por defecto), `/repo/` | Ruta pública. GitHub Pages de proyecto se sirve en `/<repositorio>/` |
| `SITE_ENV`  | `production`, `preview`     | `preview` = copia de revisión: `noindex`, `robots.txt` cerrado y sin sitemap |

El dominio configurado es `https://icatacama.com` (campo `url` de `sitio.json`), usado en canónicas,
sitemap y datos estructurados; la copia de revisión también apunta sus canónicas al dominio real.

## Páginas generadas

| URL                              | Contenido                                            |
|----------------------------------|------------------------------------------------------|
| `/`                              | Catálogo completo, ventajas y preguntas frecuentes   |
| `/categoria/<slug>/`             | Catálogo de una categoría (solo si tiene equipos)    |
| `/equipos/<slug>/`               | Ficha de cada equipo                                 |
| `/404.html`                      | Página de error                                      |
| `/sitemap.xml`, `/robots.txt`    | Generados en cada build con la URL de `sitio.json`   |
| `/site.webmanifest`              | Manifest con el ícono de 512 px                      |
| `/.well-known/security.txt`      | Contacto para reportes de seguridad (RFC 9116), caduca al año y se renueva en cada build |

## Agregar o editar equipos

Edita `src/data/productos.json`. Cada equipo:

| Campo        | Ejemplo                              | Notas                                                    |
|--------------|--------------------------------------|----------------------------------------------------------|
| `id`         | `10`                                 | Único, entero; define el código EQ-010                   |
| `slug`       | `"torno-paralelo-460-x-1500-mm"`     | URL de la ficha. Solo a-z, 0-9 y guiones. **No lo cambies una vez publicado** (se pierde el posicionamiento) |
| `nombre`     | `"Torno paralelo 460 × 1.500 mm"`    | Título de la ficha y de Google                           |
| `categoria`  | `"tornos"`                           | `slug` de una categoría existente                        |
| `marca`, `modelo`, `origen` |                       | Lo que esté entre `[corchetes]` no se envía a Google     |
| `estado`     | `"Nuevo"`                            |                                                          |
| `precio`     | `13990000`                           | En CLP, sin IVA, sin puntos. Se muestra como "$13.990.000 + IVA". Si se omite, aparece "A cotizar" |
| `descripcion`|                                      | Texto libre; se usa también como descripción en Google   |
| `specs`      | `[["Potencia", "5,5 kW"]]`           | Filas de la tabla; la primera se muestra en la tarjeta   |
| `fotos`      | `["/img/equipos/10-1.webp"]`         | Archivos en `public/img/equipos/`. La primera es la portada. Usa formato 4:3, ~1600 × 1200, WebP o JPG |

El build **valida los JSON** y se detiene con un mensaje claro si hay un slug repetido o inválido, una
categoría inexistente, un precio que no es entero, una foto fuera de `/img/` o un enlace (`mapa`, `redes`)
que no sea `https://`. Para quitar un equipo vendido, borra su objeto: su URL pasará a mostrar la página 404.

## Seguridad

Todo lo que ve el navegador proviene de este repositorio; el sitio no tiene backend, formularios ni servicios de terceros.

- **Sin orígenes externos**: la fuente Archivo se autoaloja (`@fontsource-variable/archivo`), así no hay conexión a Google Fonts
  y la CSP puede ser estricta.
- **Content-Security-Policy** estricta (`default-src 'self'`, sin scripts ni estilos en línea, `object-src 'none'`,
  `base-uri 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`), definida una sola vez en
  `src/lib/security-headers.js`. Se envía como cabecera desde CloudFront y, como respaldo (GitHub Pages no permite
  cabeceras), va incrustada en `<meta>` en cada HTML.
- **Cabeceras adicionales** en CloudFront y en `npm run preview`: HSTS (2 años, `includeSubDomains; preload`),
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`,
  `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`; se eliminan `Server` y cabeceras internas de S3.
- **HTML seguro por construcción**: React escapa todo el contenido de los JSON; los bloques JSON-LD y las props de las islas
  se incrustan con `safeJson` (escapa `<`, U+2028/2029) para que nunca puedan cerrar la etiqueta `<script>`;
  los enlaces externos llevan `rel="noopener noreferrer"`; los JSON se validan antes de llegar a un `href`/`src`.
- **`npm run verify`** (también en CI) revisa cada HTML generado: CSP presente e idéntica, ningún script en línea
  ejecutable ni manejador `on*=`, ningún recurso de otro origen, ningún esquema `javascript:`/`data:`, sin mapas de
  código fuente, y que `deploy/cloudformation.yaml` envíe exactamente las mismas cabeceras.
- **Infraestructura** (`deploy/cloudformation.yaml`): bucket S3 privado (bloqueo de acceso público, cifrado, versionado
  con 30 días de retención, solo lectura para CloudFront vía OAC, denegación de tráfico sin TLS), CloudFront con
  TLS 1.2+ (`TLSv1.2_2021`), redirección a HTTPS, HTTP/2 y HTTP/3, función en *viewer request* que redirige
  `www` → dominio principal y bloquea rutas ocultas o con `..`, registros de acceso (90 días) y **WAF opcional**
  (reglas administradas de AWS + límite de 2.000 peticiones/5 min por IP).
- **Despliegue sin claves**: GitHub Actions asume un rol de IAM por OIDC restringido al entorno `production` del
  repositorio, con permisos solo sobre el bucket y la invalidación de la distribución.
- **Dependencias**: `npm run audit` falla el CI ante vulnerabilidades altas en dependencias de producción (solo `react`
  y `react-dom`); Dependabot propone actualizaciones semanales de npm y de las acciones.
- **Copia de revisión** en GitHub Pages con `noindex, nofollow`, `robots.txt` con `Disallow: /` y sin sitemap: no compite
  con el dominio real en Google.

Si en el futuro se agrega un servicio externo (analítica, mapa embebido, chat), hay que autorizar su origen en
`src/lib/security-headers.js` y en `deploy/cloudformation.yaml`; `npm run verify` avisará si no coinciden.

## SEO incluido

- Una página HTML real por equipo y por categoría (Google la lee sin ejecutar JavaScript).
- `<title>`, meta descripción y URL canónica únicos por página; `lang="es-CL"`.
- Open Graph y Twitter Card (vista previa en WhatsApp, LinkedIn, Facebook). La imagen es la
  primera foto del equipo o `public/img/og-ic-atacama.jpg`.
- Datos estructurados schema.org (JSON-LD): `Store` con dirección en Cerrillos y área de servicio
  Chile, `WebSite`, `BreadcrumbList`, `ItemList`, `CollectionPage` y `FAQPage`.
  El nodo `Product` (con precio, IVA no incluido, disponibilidad y condición "nuevo") **solo se genera
  cuando el equipo tiene `precio`**: Google lo exige y sin él marcaría errores en Search Console.
- `sitemap.xml` y `robots.txt`; metadatos geográficos (`CL-RM`, Cerrillos).
- HTML semántico, textos alternativos, enlace "Saltar al contenido", imágenes con tamaño fijo
  (sin saltos de diseño) y CSS/JS/fuentes con hash para caché larga.

Después de publicar:
1. Registra el dominio en [Google Search Console](https://search.google.com/search-console) y envía `/sitemap.xml`.
2. Crea o reclama el perfil de **Google Business Profile** con la misma dirección y teléfono del sitio
   (clave para aparecer en búsquedas locales como "tornos en Santiago").
3. Valida una ficha con la [prueba de resultados enriquecidos](https://search.google.com/test/rich-results).
4. Opcional: inscribe el dominio en [hstspreload.org](https://hstspreload.org) (la cabecera HSTS ya cumple los requisitos).

## Publicar en producción (S3 + CloudFront + Route 53)

Requisitos: AWS CLI con credenciales de administrador y una **zona alojada de Route 53** para `icatacama.com`
cuyos servidores NS estén configurados en el registrador del dominio.

1. Crea la infraestructura (en **us-east-1**, obligatorio para el certificado y el WAF de CloudFront):

   ```bash
   aws cloudformation deploy --region us-east-1 \
     --stack-name icatacama-web \
     --template-file deploy/cloudformation.yaml \
     --capabilities CAPABILITY_NAMED_IAM \
     --parameter-overrides HostedZoneId=Z0123456789ABC GitHubRepo=propietario/repositorio
   ```

   Parámetros opcionales: `EnableWaf=true` (WAF, ~USD 10/mes), `EnableLogging=false`, `PriceClass=PriceClass_100`
   (más barato, pero sirve Chile desde EE. UU.), `GitHubOidcProviderArn=...` si la cuenta ya tiene el proveedor OIDC
   de GitHub. La validación DNS del certificado se hace sola en la zona; la primera creación tarda 10 a 20 minutos.
   Las salidas de la pila (`aws cloudformation describe-stacks --stack-name icatacama-web --query 'Stacks[0].Outputs'`)
   entregan `BucketName`, `DistributionId` y `DeployRoleArn`.

2. Publica desde tu equipo:

   ```bash
   S3_BUCKET=<BucketName> CLOUDFRONT_DISTRIBUTION_ID=<DistributionId> npm run deploy
   ```

   `deploy/deploy.sh` sube los CSS/JS/fuentes con caché de un año, imágenes con una semana y HTML/sitemap/robots
   sin caché, borra del bucket lo que ya no exista en `dist/` e invalida CloudFront.

3. O publica desde GitHub Actions (`.github/workflows/deploy-prod.yml`, al hacer push a `main`):
   crea el entorno **production** (Settings → Environments, idealmente con revisores obligatorios), el secreto
   `AWS_DEPLOY_ROLE_ARN` y las variables `S3_BUCKET` y `CLOUDFRONT_DISTRIBUTION_ID`.

Si prefieres configurar CloudFront a mano, `deploy/cloudfront-viewer-request.js` es la función que debe asociarse al
evento *viewer request*, y las cabeceras a reproducir están en `src/lib/security-headers.js`.

## Copia de revisión en GitHub Pages

`.github/workflows/pages.yml` construye la rama `develop` con `SITE_ENV=preview` y `BASE_PATH=/<repositorio>/`
y sube `dist/` a la rama `gh-pages`. Configura Pages una sola vez en Settings → Pages → Source:
**Deploy from a branch**, rama `gh-pages`, carpeta `/ (root)`; el sitio queda en `https://<usuario>.github.io/<repositorio>/`.
Si Pages usa un dominio propio, cambia `BASE_PATH` a `/` en el workflow. La rama `gh-pages` es generada: no la edites a mano.

Los workflows detectan si el proyecto está en la raíz del repositorio o en `web/`; en el segundo caso, mueve la carpeta
`.github/` a la raíz del repositorio y cambia `directory` a `/web` en `.github/dependabot.yml`.

## Pendientes antes de publicar

- `src/data/sitio.json`: teléfono, calle y número, `whatsapp` (solo dígitos, ej. `56912345678`: activa el botón en cada
  ficha), enlace de Google Maps en `mapa`, coordenadas en `geo` y redes sociales en `redes`.
- Respuesta de garantía en las preguntas frecuentes.
- Reemplazar los equipos de ejemplo, los textos entre `[corchetes]` y agregar fotos reales.
- Textos de formas de pago y puesta en marcha en `src/pages/Product.jsx` (buscar `[Indicar`).
