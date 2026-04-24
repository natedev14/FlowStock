# Gissary Stock Editor (PWA)

App web estática para edición de inventario físico de Gissary Modas a partir de CSVs de Bling ERP.

## Stack

- **Build**: Vite
- **Framework**: Preact + TypeScript
- **Estado**: Zustand (con persistencia localStorage por SKU padre)
- **CSV**: PapaParse
- **Validación**: Zod
- **Estilos**: Tailwind CSS (mobile-first, botones táctiles ≥44px)
- **PWA**: vite-plugin-pwa

## Setup

```bash
npm install
npm run dev      # desarrollo local en http://localhost:5173
npm run build    # genera dist/ listo para GitHub Pages
npm run preview  # sirve dist/ localmente para probar antes de publicar
```

## Despliegue en GitHub Pages

1. Creá el repo `gissary-stock-editor` en GitHub.
2. En `vite.config.ts` cambiá `base: './'` por `base: '/gissary-stock-editor/'` si el repo no es user.github.io.
3. Primer deploy:
   ```bash
   npm run build
   npm run deploy:gh    # usa gh-pages, empuja dist/ a la rama gh-pages
   ```
4. En Settings → Pages del repo: Source = branch `gh-pages` / root.

## Flujo de uso

1. Abrir la app en el móvil → **Cargar Modelo** → seleccionar CSV de Bling.
2. Lista de modelos padre con imagen, descripción y contador de variaciones.
3. Tap en un padre → editor de variaciones.
4. **Modo Ajuste Rápido**: +/- modifica el stock actual directamente.
5. **Modo Auditoría**: contador visual parte de 0; el operario cuenta físicamente, luego toca "Guardar conteo" y sobrescribe.
6. Búsqueda rápida dentro del padre (ej. "Rosa", "GG").
7. **Exportar CSV** → archivo listo para re-importar a Bling.

## Decisiones técnicas importantes

### Fidelidad del export (R2 del PRD)

- `meta.fields` se captura dinámicamente de PapaParse al cargar el CSV. El código **no hardcodea las 59 columnas** — si Bling agrega una nueva columna en el futuro, la app la pasará sin tocar nada.
- `quotes: true` global en el export. Protege precios con comas (`"16,99"`), HTML en `Descrição Complementar` y cualquier celda problemática. El archivo queda ~10% más grande a cambio de cero bugs de desplazamiento de columnas.
- Line endings `\r\n` + BOM UTF-8 al inicio. Replica el formato exacto que genera Bling, para máxima compatibilidad en el re-import.
- Los valores de celda nunca son mutados salvo en la columna `Estoque`. Incluso tabs o espacios "raros" del archivo original se preservan.

### Persistencia (R3 del PRD)

- Cada padre tiene su sesión propia en `localStorage` bajo `gissary_session_${parentCode}`.
- Se guarda solo el delta (`estoqueOverrides`), no el CSV completo — evita cuota llena.
- **Al cargar un nuevo CSV se borran TODAS las sesiones previas** (decisión explícita para evitar datos viejos mezclados con stock nuevo).
- Autosave debounced a 300ms por cambio.

### UX fat-finger (§5 del PRD)

- Botones +/- de 60×60px, todos los tappables ≥44px.
- Input nativo `type="file"` oculto; se dispara desde un botón grande "Cargar Modelo".
- Borde ámbar en tarjetas con cambios sin guardar + badge en lista de padres.
- Sin decoración visual innecesaria; paleta gris + blanco, altos contrastes.

### Formatos numéricos (§6 del PRD)

- `Estoque` se trata como integer ≥0 en la UI.
- Valores como `"10.0"` o `"10,0"` se normalizan al leer, pero no tocamos el resto del CSV.
- Contador no baja de 0.

## Estructura

```
src/
├── main.tsx
├── app.tsx                     # Router entre Upload/Selector/Editor
├── index.css                   # Tailwind + reset mobile
├── types.ts                    # CsvRow, ParentGroup, StoredSession
├── schema.ts                   # Zod para columnas obligatorias
├── lib/
│   ├── csv.ts                  # parseCsv + exportCsv con BOM y CRLF
│   ├── grouping.ts             # buildGroups + firstImageUrl
│   ├── parseDescricao.ts       # "COR:X;TAMANHO:Y" → estructurado
│   └── storage.ts              # localStorage por parentCode
├── store/
│   └── useStockStore.ts        # Estado central + autosave debounced
└── components/
    ├── UploadScreen.tsx        # Pantalla inicial
    ├── ParentSelector.tsx      # Lista de modelos
    ├── EditorScreen.tsx        # Editor de un padre
    ├── ModeToggle.tsx          # Ajuste Rápido / Auditoría
    ├── VariationCard.tsx       # Tarjeta fat-finger
    └── ExportButton.tsx        # Descarga CSV
```

## Validación

El archivo se rechaza con mensaje "Archivo de ERP no compatible" si falta alguna de estas columnas: `Código`, `Código Pai`, `Descrição`, `Estoque`, `URL Imagens Externas`.

## Nota para el desarrollador

La fidelidad del archivo de salida es la prioridad #1. Cualquier PR que modifique `lib/csv.ts` debe ejecutarse con round-trip test — cargar un CSV real de Bling, exportarlo sin cambios y diff-earlo contra el original. Las únicas diferencias aceptables son las celdas con valores modificados por el usuario.
