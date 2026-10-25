# PokéDex Explorer

Aplicación móvil hecha con **React Native y Expo** que consume la [PokéAPI](https://pokeapi.co/). Lista Pokémon con scroll infinito, permite buscarlos por nombre o número mientras se escribe y muestra una ficha con imagen, tipos, medidas y estadísticas base.

Taller **Consumo de API con React Native y Expo**, curso Construcción de software V (2026-2).

- **Estudiante:** Santiago Cadavid Arboleda
- **Modalidad:** individual

## Tecnologías

| Paquete | Versión |
|---|---|
| expo | ~57.0.31 |
| react | 19.2.3 |
| react-native | 0.86.3 |
| react-native-safe-area-context | ~5.7.0 |

Las peticiones usan `fetch`, que viene incluido. No se instalaron librerías HTTP, de navegación ni de estilos.

## Cómo ejecutar

```bash
npm install
npx expo start
```

Escanear el código QR con **Expo Go (SDK 57)**.

## Funcionalidades

**Vista de lista**
- Encabezado "PokéDex Explorer" con diseño de Pokédex.
- Cuadrícula de 2 columnas con imagen, número (`#025`) y nombre.
- Carga inicial de 20 Pokémon y 20 más al llegar al final (scroll infinito), con indicador de carga.
- Búsqueda por nombre o número que ignora mayúsculas y espacios. *(Adicional: búsqueda en vivo con coincidencias parciales mientras se escribe; también acepta el número con `#`, por ejemplo `#25`.)*
- Botón flotante para volver al inicio de la lista. *(Adicional)*
- La lista conserva sus datos, la búsqueda y la posición al volver de una ficha. *(Adicional)*

**Vista de detalle**
- Imagen grande, número y nombre.
- Un distintivo de color por cada tipo.
- Altura en metros y peso en kilogramos.
- Las 6 estadísticas base con barras proporcionales (máximo 255).
- Navegación al Pokémon anterior o siguiente deslizando o con flechas. *(Adicional)*
- Botón "Volver a la lista".

## Endpoints usados

| Endpoint | Uso |
|---|---|
| `GET /pokemon?limit=20&offset={n}` | Lista paginada |
| `GET /pokemon?limit=2000` | Índice de nombres para la búsqueda en vivo (una sola petición) |
| `GET /pokemon/{id}` | Ficha de un Pokémon |
| `raw.githubusercontent.com/.../official-artwork/{id}.png` | Imagen de las tarjetas sin pedir la ficha completa |

## Arquitectura

```
pokedex-explorer/
├── App.js                         Navegación por estado entre lista y ficha; cuerpo de la Pokédex
├── docs/capturas/                 Evidencias de funcionamiento
└── src/
    ├── config/
    │   └── api.js                 Constantes: URL base, tamaño de página, URL de imágenes, límites
    ├── services/
    │   └── pokemonService.js      Peticiones a la PokéAPI, tiempo límite, validación y mapeo (sin JSX ni estilos)
    ├── screens/
    │   ├── ListScreen.js          Estado y useEffect de la lista, paginación, búsqueda y estados
    │   └── DetailScreen.js        Estado y useEffect de la ficha, gestos de deslizamiento y estados
    ├── components/
    │   ├── PokedexHeader.js       Encabezado con lente, luces y título
    │   ├── SearchBar.js           Campo de búsqueda y botón "Buscar"
    │   ├── PokemonCard.js         Tarjeta de la cuadrícula (con imagen de respaldo)
    │   ├── TypeBadge.js           Distintivo de color por tipo
    │   ├── StatBar.js             Barra proporcional de una estadística
    │   ├── LoadingState.js        Indicador de carga con texto
    │   ├── ErrorState.js          Mensaje de error con botón "Reintentar"
    │   └── EmptyState.js          Mensaje de "sin resultados"
    ├── theme/
    │   └── index.js               Colores, espaciados, radios y colores por tipo
    └── utils/
        ├── format.js              Formato de número, medidas, mayúscula inicial y traducciones (seguro ante datos faltantes)
        ├── search.js              Regla de coincidencia de la búsqueda (nombre o número por prefijo)
        └── errors.js              Traduce cada tipo de error a un mensaje claro en español
```

### Por qué se organizó así

- **La red vive solo en `services`.** Las pantallas llaman funciones como `fetchPokemonList(offset, signal)` y reciben datos limpios. Si la API cambia, solo se modifica ese archivo. Así se cumple la regla de no mezclar las llamadas a la API con el JSX y los estilos.
- **`config` separa las constantes de la lógica**, siguiendo el patrón visto en clase con `BASE_URL`.
- **Las pantallas (`screens`) manejan el estado y los efectos**, como en el ejemplo de la docente: cada una tiene su `useEffect` con `AbortController`.
- **Los componentes solo reciben props.** No conocen la API, así que se reutilizan; por ejemplo, `ErrorState` sirve para la lista, la búsqueda y la ficha.
- **`theme` centraliza el diseño.** Ningún componente escribe colores a mano, y cambiar la paleta es editar un solo archivo.
- **`utils` agrupa funciones puras** (formato, búsqueda y mensajes de error) que no dependen de la API ni de la interfaz.
- **Navegación por estado, sin librerías.** La guía pide una pantalla con dos vistas. `App.js` guarda `selectedPokemon`: si es `null` muestra la lista y, si tiene un id, la ficha. La lista se oculta en lugar de desmontarse, para conservar sus datos y su posición.

## Decisiones técnicas

| Problema | Solución |
|---|---|
| La PokéAPI no tiene búsqueda parcial | Se pide **una vez** el índice de nombres (~1300 registros, solo nombre y URL) y se filtra en el celular con `startsWith`. Escribir no genera peticiones, así no se satura la API. |
| `onEndReached` se dispara varias veces seguidas | Se bloquea mientras carga, tras un error, durante una búsqueda o cuando `next` es `null`. La página siguiente se pide con `pokemons.length`, así dos llamadas seguidas piden la misma página en lugar de saltarse una. |
| Un nombre inexistente responde 404 con texto, no JSON | Se revisa `response.ok` **antes** de `response.json()` y se guarda `error.status` para distinguir "no existe" de un error de conexión. |
| Peticiones que quedan pendientes al cambiar de vista | Cada `useEffect` crea un `AbortController` y lo cancela en la limpieza. Un `AbortError` no se muestra como error. |
| `fetch` no tiene tiempo límite propio | Todas las peticiones pasan por `requestJson`, que las cancela a los 10 segundos y muestra un mensaje en lugar de "Cargando..." para siempre. |
| La petición no debe repetirse sin parar | Cada `useEffect` declara sus dependencias: `[offset, reloadKey]` en la lista, `[indexKey]` en el índice y `[pokemonId, reloadKey]` en la ficha. "Reintentar" cambia la clave para repetir la petición. |

## Decisiones propias y su relación con los requisitos

Además de lo que pide la guía, se tomaron estas decisiones por cuenta propia. Ninguna elimina un requisito: cada una lo cumple igual y lo amplía o mejora la experiencia.

### Funcionalidad

| Decisión propia | Requisito relacionado | Cómo se relaciona |
|---|---|---|
| **Búsqueda en vivo por prefijo:** los resultados aparecen mientras se escribe (`pi` muestra Pikachu, Pichu, Pidgey...) | Barra de búsqueda con botón "Buscar"; acepta nombre o número e ignora mayúsculas y espacios | Se cumple y se amplía: también encuentra coincidencias parciales. El botón "Buscar" se conserva y cierra el teclado. Si no hay coincidencias se muestra el estado "sin resultados". |
| **Índice de nombres en una sola petición** (`/pokemon?limit=2000`) | Controlar cuándo se ejecuta una petición con el array de dependencias; recomendación de clase de no saturar la API | La PokéAPI no tiene búsqueda parcial. En lugar de una petición por letra, se pide el índice una vez y se filtra en el celular. Escribir no genera peticiones. |
| **El 404 se maneja en la ficha** | Revisar `response.ok` antes de `response.json()`; mensaje cuando el nombre no existe | Con la búsqueda en vivo, "sin resultados" sale del filtro local. El manejo del 404 se mantiene en `fetchPokemonDetail` y la ficha lo muestra como "Este Pokémon no existe". |
| **Navegación por estado sin librerías** (`selectedPokemon` en `App.js`) | Una pantalla principal con dos vistas: lista y ficha | Se respeta la estructura de una pantalla con dos vistas, sin instalar React Navigation. |
| **La lista se oculta, no se desmonta**, al abrir una ficha | Tocar una tarjeta abre la ficha; botón "Volver a la lista" | Al volver, la lista conserva las páginas cargadas, la búsqueda y la posición del scroll, sin pedir los datos otra vez. |
| **Estado y `useEffect` dentro de las pantallas**, sin hooks personalizados | Arquitectura propia que separe la red de la interfaz | Sigue el patrón del ejemplo de la docente. La separación se logra con `services` (red) y `components` (solo props). |
| **`AbortController` en todos los `useEffect`** | Manejar respuesta, error y carga; patrón visto en clase con `signal` | Si el usuario cambia de vista o desliza rápido entre Pokémon, la petición anterior se cancela. La cancelación no se muestra como error. |
| **Tiempo límite y mensajes según la causa del error** | Estado de error con mensaje claro en español | El usuario distingue entre falta de internet, una API lenta, un error del servidor o datos incompletos. |
| **"Reintentar" con una clave en las dependencias** (`reloadKey`, `indexKey`) | Estado de error con botón "Reintentar" | Cambiar la clave vuelve a ejecutar solo el `useEffect` que falló. |
| **Error en páginas posteriores sin perder la lista** | Estado de error en toda petición | Si falla la primera página, el error ocupa la pantalla. Si falla una página posterior, lo ya cargado se mantiene y el error aparece al final de la lista. |
| **Botón flotante ↑ para volver al inicio** | Scroll infinito | Complementa el scroll infinito: con cientos de Pokémon cargados, permite regresar arriba con un toque. |
| **Deslizar entre Pokémon en la ficha** (y flechas `‹ #024` / `#026 ›`) | Vista de detalle con botón "Volver a la lista" | El botón de volver se mantiene. Cambiar de Pokémon solo actualiza el id, y el `useEffect` de la ficha carga el nuevo gracias a su array de dependencias. |
| **Manejo natural del teclado** (se cierra al deslizar, al tocar fuera o al abrir una ficha) | `TextInput` con `autoCapitalize="none"` y `autoCorrect={false}` | Se cumplen las propiedades pedidas y se evita que el teclado tape los resultados. |

### Diseño y presentación

| Decisión propia | Requisito relacionado | Cómo se relaciona |
|---|---|---|
| **Estilo Pokédex:** cuerpo rojo con lente y luces, y pantalla aguamarina con tarjetas translúcidas (inspirada en la Pokédex de la serie y en el estilo de Pokémon GO, sin copiar sus elementos) | La paleta la elige el equipo | Todos los colores salen de `theme`; ningún componente los escribe a mano. No se usaron imágenes ni paquetes extra: todo son `View` y estilos. |
| **El título vive en un encabezado compartido** (`PokedexHeader`) | Encabezado con el título "PokéDex Explorer" | Se muestra en las dos vistas y forma parte del diseño del aparato. |
| **Nombre en mayúsculas en la ficha** | Tarjeta con el nombre con la primera letra en mayúscula | En la tarjeta de la lista se cumple tal cual (`Pikachu`). En la ficha se muestra en mayúsculas (`PIKACHU`) solo como estilo, sin cambiar el dato. |
| **Coma decimal en medidas** (`0,4 m`, `6,0 kg`) | Altura en metros y peso en kilogramos | Se divide entre 10 como pide la guía y se usa el formato decimal de Colombia. |
| **Tipos y estadísticas traducidos** (Fuego, Ataque, At. Especial...) | Textos de la interfaz en español | La API devuelve los nombres en inglés y se traducen en `utils/format.js`. |

### Proceso

| Decisión propia | Requisito relacionado | Cómo se relaciona |
|---|---|---|
| **Un commit por paso** en la rama `main` | Entrega del repositorio público | El historial muestra el avance del proyecto paso a paso. |
| **Comentarios `// CONCEPT:`** con formato fijo | Marcar con un comentario cada concepto visto | Facilita encontrar cada concepto en el código durante la sustentación. |
| **Versiones fijadas en SDK 57**, sin `npm audit fix --force` | Compatibilidad con Expo Go | Se evitó cambiar versiones de paquetes que podían romper la compatibilidad. |
| **Pruebas de robustez** quitando datos a propósito | Estados de la interfaz en toda petición | Se comprobó que la app muestra mensajes claros en lugar de cerrarse o mostrar datos falsos. |

### Alternativas evaluadas y descartadas

| Alternativa | Por qué se descartó |
|---|---|
| Una petición a la API por cada letra escrita | Saturaría la API y la PokéAPI no admite búsqueda parcial. |
| React Navigation | La guía pide una pantalla con dos vistas; con un estado es suficiente y no se agregan dependencias. |
| Barra lateral tipo índice (A-Z o por números) para moverse en la lista | Con scroll infinito, las posiciones lejanas aún no están cargadas; habría que cargar todo, en contra de la paginación. |
| Gesto de borde de iOS para volver | Lo da la navegación nativa de iOS, que no se usa aquí, y chocaría con deslizar a la derecha para ver el Pokémon anterior. |
| Navegación anterior/siguiente entre formas especiales (ids desde 10001) | No tienen número de Pokédex propio ni un orden con sentido. |
| Fuente pixelada estilo Game Boy | No combinaba con el estilo final y requería instalar dos paquetes. |
| Lista horizontal con páginas para la ficha (`pagingEnabled`) | Obligaba a pedir varias fichas a la vez y complicaba los estados de carga y error. |

## Robustez ante datos faltantes y errores

La app nunca debe cerrarse ni mostrar datos falsos si la API falla o responde incompleta. Se aplicó defensa en dos capas:

- **Servicio (`pokemonService.js`):** valida cada campo. Lo que falta se convierte en `null` o `[]`, nunca en `undefined`. Los elementos sin id se descartan. Si la respuesta es inservible, se lanza un error con su tipo (`http`, `timeout`, `data`).
- **Interfaz:** los componentes no confían en el estado. Antes de recorrer o formatear un dato revisan que exista, y si no, muestran un texto claro.

| Situación | Lo que ve el usuario |
|---|---|
| Sin internet | "No se pudo conectar... Revisa tu internet." con "Reintentar" |
| La API no responde en 10 s | "La API tardó demasiado en responder..." con "Reintentar" |
| Error del servidor (404, 500...) | "El servidor respondió con un error (código)..." |
| Respuesta que no es JSON o viene incompleta | "La API respondió con datos incompletos..." |
| Lista vacía | "No hay Pokémon para mostrar." |
| Sin nombre | "Desconocido" |
| Sin imagen o imagen rota | "?" en la tarjeta y "Sin imagen" en la ficha |
| Sin tipos o sin estadísticas | "Sin tipos registrados" / "Sin estadísticas disponibles" |
| Sin altura o peso | "Sin dato" |

## Estados de la interfaz

| Estado | Lista | Búsqueda | Ficha |
|---|---|---|---|
| Cargando | "Cargando Pokémon..." y "Cargando más Pokémon..." al final | "Preparando búsqueda..." | "Cargando ficha..." |
| Error | Mensaje según la causa y "Reintentar" | Mensaje según la causa y "Reintentar" | Mensaje según la causa y "Reintentar" |
| Sin resultados | "No hay Pokémon para mostrar." | "No se encontró ningún Pokémon que empiece por..." | "Este Pokémon no existe." (404) |
| Éxito | Cuadrícula | Cuadrícula de coincidencias | Ficha completa |

## Evidencias

| Lista | Scroll infinito | Búsqueda en vivo | Sin resultados |
|---|---|---|---|
| <img src="docs/capturas/01-lista.png" width="200"> | <img src="docs/capturas/02-scroll-infinito.png" width="200"> | <img src="docs/capturas/03-busqueda.png" width="200"> | <img src="docs/capturas/04-sin-resultados.png" width="200"> |

| Cargando | Error | Ficha | Deslizar entre Pokémon |
|---|---|---|---|
| <img src="docs/capturas/05-cargando.png" width="200"> | <img src="docs/capturas/06-error.png" width="200"> | <img src="docs/capturas/07-detalle.png" width="200"> | <img src="docs/capturas/08-deslizar.png" width="200"> |

## Limitaciones conocidas

- Las **formas especiales** (ids desde 10001, por ejemplo `pikachu-rock-star`) aparecen en la búsqueda y abren su ficha, pero no tienen navegación anterior/siguiente, porque no tienen un número de Pokédex propio.
- La navegación de la ficha llega hasta el número nacional `1025`, definido en `config/api.js`.
- Los nombres compuestos usan guion, como en la API (`mr-mime`).