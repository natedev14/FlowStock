# FlowStock

App web estática para **conteo visual de estoque** de productos de Gissary Modas a partir de CSVs exportados desde Bling ERP.

La app permite cargar un CSV de productos, ver los modelos de forma visual, contar stock por **color y talla**, editar cantidades desde una matriz intuitiva y exportar un CSV listo para reimportar en Bling.

No usa backend, base de datos ni servidor propio. Todo corre en el navegador.

## Objetivo

Reducir la fricción de contar inventario físico de ropa.

En vez de editar un CSV manualmente, la app transforma el archivo de Bling en una interfaz visual:

```txt
CSV de Bling
  ↓
Productos con imagen
  ↓
Matriz Color × Talla
  ↓
Conteo físico editable
  ↓
CSV corregido para Bling
```

## Funcionalidades principales

- Carga de CSV de productos exportado desde Bling.
- Validación de columnas mínimas necesarias.
- Agrupación automática de producto padre y variaciones.
- Selector visual de productos con imagen, descripción y cantidad de variaciones.
- Editor en matriz **Color × Talla**.
- Inputs grandes para conteo físico.
- Imagen por color con opción de ampliar en pantalla completa.
- Búsqueda por color, talla, SKU o descripción.
- Marcado visual de cantidades modificadas.
- Autosave local por producto padre.
- Exportación de CSV compatible con Bling.
- Procesamiento 100% local en el navegador.

## Stack

- **Build**: Vite
- **Framework**: Preact + TypeScript
- **Estado**: Zustand
- **CSV**: PapaParse
- **Validación**: Zod
- **Estilos**: Tailwind CSS
- **PWA**: vite-plugin-pwa
- **Deploy**: GitHub Pages + GitHub Actions

## Setup local

```bash
npm install
npm run dev      # desarrollo local en http://localhost:5173
npm run build    # genera dist/
npm run preview  # sirve dist/ localmente
```

## Deploy

El deploy se ejecuta automáticamente con GitHub Actions al hacer push a `main`.

Workflow:

```txt
.github/workflows/deploy.yml
```

El workflow hace:

```txt
checkout
setup-node
npm install
npm run build
upload-pages-artifact
 deploy-pages
```

La app publicada usa la base configurada en Vite:

```ts
base: '/gissary-stock-editor/'
```

URL pública:

```txt
https://natedev14.github.io/gissary-stock-editor/
```

## Flujo de uso

1. Abrir la app.
2. Seleccionar el CSV exportado desde Bling.
3. Ver la lista de productos/modelos cargados.
4. Abrir un producto.
5. Contar stock en la matriz **Color × Talla**.
6. Tocar una imagen para verla ampliada si hace falta confirmar el color/prenda.
7. Editar cantidades directamente en los inputs.
8. Exportar el CSV corregido.
9. Reimportar el CSV en Bling.

## Formato esperado del CSV

La app espera un CSV de productos de Bling con delimitador `;` y columnas mínimas:

```txt
Código
Código Pai
Descrição
Estoque
URL Imagens Externas
```

La app no hardcodea todas las columnas del CSV. Al cargar el archivo, captura dinámicamente `meta.fields` desde PapaParse y usa ese orden como fuente de verdad para exportar.

## Matriz Color × Talla

Las variaciones se organizan usando el campo `Descrição`.

Formato esperado en variaciones:

```txt
COR:Azul Escuro;TAMANHO:G
COR:Branco;TAMANHO:GG
COR:Preto;TAMANHO:M
```

La app extrae:

```txt
COR      → color de la fila
TAMANHO  → columna de talla
```

Ejemplo visual:

```txt
Color / Talla       M      G      GG
Amarelo Manteiga   [0]    [0]    [0]
Azul Escuro        [9]    [8]    [0]
Branco             [5]   [33]   [31]
Preto              [0]   [30]   [60]
```

Cada celda actualiza el campo `Estoque` de la variación correspondiente.

## Imágenes

La app usa `URL Imagens Externas` para mostrar imágenes de productos y variaciones.

En el editor:

- Cada color muestra una imagen pequeña.
- Al tocar/clicar la imagen, se abre un visor en pantalla completa.
- Las imágenes se muestran con `object-contain` para evitar recortar la prenda.

## Exportación CSV

La exportación está pensada para volver a Bling con el mínimo cambio posible.

Reglas actuales:

- Se preserva el orden original de columnas usando `meta.fields`.
- Se preserva el orden original de filas.
- Se exporta con delimitador `;`.
- Se usa `quotes: true` para proteger celdas con comas, HTML o caracteres especiales.
- Se usa `\r\n` como salto de línea.
- Se agrega BOM UTF-8 al inicio.
- Solo se modifica la columna `Estoque`.
- `Estoque` se exporta en formato compatible con Bling: `10,00`, `0,00`, `35,00`.

Ejemplo:

```txt
UI:       8
Export:   8,00
```

## Persistencia local

La app guarda cambios en `localStorage` por producto padre.

Características:

- No guarda el CSV completo.
- Guarda overrides de `Estoque` por variación.
- Guarda qué variaciones fueron modificadas.
- Al cargar un nuevo CSV, se limpian las sesiones anteriores para evitar mezclar datos viejos.
- No se envía información a ningún servidor.

## Privacidad

Todo ocurre localmente en el navegador:

```txt
El CSV no se sube a un backend.
No hay base de datos.
No hay APIs externas.
No hay servidor propio.
```

Esto reduce costo, complejidad y riesgo operativo.

## Estructura del proyecto

```txt
src/
├── main.tsx
├── app.tsx                     # Router entre Upload/Selector/Editor
├── index.css                   # Tailwind + ajustes mobile
├── types.ts                    # CsvRow, CsvMeta, ParentGroup, StoredSession
├── schema.ts                   # Validación de columnas obligatorias
├── lib/
│   ├── csv.ts                  # parseCsv + exportCsv
│   ├── grouping.ts             # buildGroups + firstImageUrl
│   ├── parseDescricao.ts       # COR/TAMANHO → objeto estructurado
│   └── storage.ts              # localStorage por parentCode
├── store/
│   └── useStockStore.ts        # Estado global + acciones de stock
└── components/
    ├── UploadScreen.tsx        # Carga inicial del CSV
    ├── ParentSelector.tsx      # Selector visual de productos
    ├── EditorScreen.tsx        # Pantalla de conteo
    ├── StockMatrix.tsx         # Matriz Color × Talla
    ├── VariationCard.tsx       # Tarjeta de variación legacy/respaldo
    └── ExportButton.tsx        # Exportación del CSV
```

## Decisiones de producto

### Sin backend

La app no necesita servidor para resolver el problema actual. El flujo completo puede ejecutarse en el navegador: parsear CSV, editar, persistir localmente y exportar.

### Sin modos de edición

Se eliminó la división entre “Ajuste Rápido” y “Auditoría”. El flujo actual es único:

```txt
Ver stock actual → escribir conteo físico → exportar
```

Menos decisiones para el usuario, menos riesgo operativo.

### Matriz en vez de lista

Para ropa, el stock se entiende mejor como combinación de color y talla. Por eso el editor principal usa una matriz **Color × Talla** en lugar de una lista larga de SKUs.

### Imágenes ampliables

El conteo es visual. La imagen ayuda a reconocer color/modelo y reduce errores al contar.

## Validación

El archivo se rechaza si faltan columnas críticas:

```txt
Código
Código Pai
Descrição
Estoque
URL Imagens Externas
```

Mensaje esperado:

```txt
Archivo de ERP no compatible. Faltan columnas: ...
```

## Limitaciones conocidas

- La matriz depende de que las variaciones usen descripciones con `COR:` y `TAMANHO:`.
- Si un CSV viene con otro patrón de descripción, esas variaciones pueden agruparse como `Sin color` o `ÚNICO`.
- La app no se conecta directamente a Bling; trabaja con CSV manual.
- No hay control multiusuario porque todo es local.

## Recomendación de prueba antes de usar en producción

Para cada cambio importante en `lib/csv.ts` o en el store:

1. Cargar un CSV real de Bling.
2. Exportar sin modificar nada.
3. Comparar columnas, filas y valores.
4. Editar 2 o 3 stocks.
5. Exportar de nuevo.
6. Confirmar que solo cambió `Estoque`.

## Estado actual

MVP funcional para conteo visual de stock desde CSV de Bling, optimizado para uso rápido en navegador, sin backend y con exportación compatible con Bling.
