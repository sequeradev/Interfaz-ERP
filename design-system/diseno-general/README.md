# Diseño general ERP

## Estructura de carpeta
- `layout/`: reglas de estructura, grillas y espaciado.
- `componentes/`: definición de componentes UI base.
- `patrones/`: patrones de interacción y flujo.
- `accesibilidad/`: lineamientos de accesibilidad aplicados.

## Principios
1. Claridad operativa: cada pantalla debe mostrar estado, acción y resultado.
2. Consistencia: mismos patrones para tablas, formularios y navegación.
3. Rapidez: minimizar clics para tareas repetitivas.

## Layout base
- Sidebar izquierda fija para módulos.
- Header superior con buscador global, notificaciones y perfil.
- Área central por vistas (dashboard, listas, detalle, edición).

## Componentes clave
- Tablas con filtros, orden y paginación.
- Formularios por secciones con validación inline.
- Tarjetas KPI para paneles de control.
- Modales cortos para confirmaciones críticas.

## Accesibilidad
- Contraste mínimo WCAG AA.
- Foco visible en componentes interactivos.
- No depender solo de color para estados.
