# Retratos de jugadores

## Añadir un retrato definitivo

1. Copiar el archivo original a `public/assets/players/portraits/`.
2. Si es PNG, usar `<player.id>.png`. No hace falta editar código.
3. Para otro nombre o extensión, añadir la excepción a
   `PLAYER_PORTRAIT_FILES` en `src/data/playerPortraits.ts`. Ejemplo:

   ```ts
   export const PLAYER_PORTRAIT_FILES: Readonly<Partial<Record<Player['id'], string>>> = {
     1: 'Arnau Casals.png',
     2: 'pau-marti.webp',
   }
   ```

4. Recargar la página o volver a abrir la ficha si se había mostrado el
   placeholder. En producción, incluir los assets en la compilación/despliegue.

No cambiar la extensión para convertir el formato: conservar el archivo
proporcionado y usar el mapping. Renombrar el archivo es opcional y no modifica
su contenido. Los nombres son solo una guía humana; la asociación usa siempre ID.

## Reglas de imagen

- Utilizar exactamente el original: sin IA, regeneración, retoques, filtros,
  recoloreado, cambio de cara, equipación o eliminación de elementos.
- Conservar proporciones y transparencia. No crear thumbnails ni versiones
  recortadas. Todos los tamaños usan el mismo archivo con `object-fit: contain`.
- No incrustar base64 ni buscar imágenes externas. Los retratos que faltan usan
  la silueta neutra `placeholder.svg`; nunca la cara de otro jugador.
- La resolución del path está centralizada en `getPlayerPortraitSource` y
  respeta el `BASE_URL` de Vite. Un archivo ausente o no decodificable activa el
  placeholder sin cambiar dimensiones ni estado de partida. El componente
  vuelve a intentar cargar el original al montarse de nuevo; no hay caché global
  de archivos ausentes.

## Identificadores de la plantilla actual

| ID | Jugador | Archivo por defecto |
| --- | --- | --- |
| 1 | Arnau Casals | 1.png |
| 2 | Pau Martí | 2.png |
| 3 | Nil Ferrer | 3.png |
| 4 | Marc Soler | 4.png |
| 5 | Oriol Roca | 5.png |
| 6 | Gerard Pons | 6.png |
| 7 | Víctor Sanz | 7.png |
| 8 | Iker Navarro | 8.png |
| 9 | Dani Serra | 9.png |
| 10 | Pol Vidal | 10.png |
| 11 | Sergi Molina | 11.png |
| 12 | Jordi Alemany | 12.png |
| 13 | Àlex Costa | 13.png |
| 14 | Miquel Font | 14.png |
| 15 | Biel Torres | 15.png |
| 16 | Raúl Benítez | 16.png |
| 17 | Joel Prat | 17.png |
| 18 | Hugo Vives | 18.png |
| 19 | Adam Puig | 19.png |
| 20 | Enric Grau | 20.png |

## Comprobación al incorporar originales

Abrir Equipo, Estado del vestuario, Tácticas y la ficha del mismo jugador. Comprobar que
las imágenes solicitan la misma URL y que en la ficha se ve el original
completo. Retirar temporalmente un archivo debe mostrar la silueta neutra sin
desplazar los nombres ni las columnas. Las referencias visuales del rediseño
no se han utilizado como retratos ni se han extraído caras de ellas.
