# Seller and administrative happy-path checklist

Last updated: 2026-10-28.

Manual QA checklist with 46 proposed cases. All cases start pending; this document does not certify executed tests. Business scenarios retain the Spanish copy used in the HTML checklist.

## Test run

- Tester / team: ____________________
- Date: ____________________
- Environment / application version: ____________________
- Test sale references: ____________________

## Instructions and prerequisites

- Use separate seller and administrative sessions, with permissions and scope over the same test sales. Administrative refers to the operational role, not superadministrator.
- Use fictitious data and files. Do not record passwords, real card details or personal data in evidence.
- Mark a case with `[x]` only after checking the expected result. Keep incomplete or failed cases unchecked and record observations or issue references below them.
- Save this Markdown file after updating checkboxes or notes. Unlike the HTML version, Markdown does not automatically save or calculate progress.
- Repeat the common cases for both roles. Spread capture variants across different sales; every branch should be exercised without requiring every possible combination.
- Monthly goals are currently paused and excluded. Full coverage additionally requires permission, invalid-input, network, version-conflict and file-error tests.

## Case groups

- Seller: 12 cases.
- Capture variants: 9 cases.
- Administrative: 13 cases.
- Complete cross-role workflows: 3 cases.
- Common checks for both roles: 9 cases.

## Seller

- [ ] **V01 — Ingreso e Inicio**
  - **Pasos:** Iniciar sesión como vendedor y abrir los accesos de Inicio.
  - **Resultado esperado:** Ve su Inicio, Mis ventas y Nueva venta. Los accesos abren la pantalla correspondiente.
  - **Notas / evidencia:** ____________________

- [ ] **V02 — Crear un borrador**
  - **Pasos:** Mis ventas → Nueva venta. Elegir prepaga, tipo y plan.
  - **Resultado esperado:** Se crea una única venta con número propio y abre el formulario en Borrador. Los planes corresponden a la prepaga.
  - **Notas / evidencia:** ____________________

- [ ] **V03 — Autoguardado y continuidad**
  - **Pasos:** Completar una sección, esperar Guardado, cambiar de sección, salir y reabrir.
  - **Resultado esperado:** Los datos guardados se conservan y se puede continuar la carga.
  - **Notas / evidencia:** ____________________

- [ ] **V04 — Titular y grupo familiar**
  - **Pasos:** Completar titular; agregar cónyuge e hijos y sus datos personales y médicos aplicables.
  - **Resultado esperado:** Cada integrante conserva sus datos; la edad se calcula y aparecen los campos condicionales correspondientes.
  - **Notas / evidencia:** ____________________

- [ ] **V05 — Contacto y domicilio**
  - **Pasos:** Completar teléfono, email y domicilio; guardar y reabrir.
  - **Resultado esperado:** Los valores se conservan y aparecen identificados correctamente en el detalle.
  - **Notas / evidencia:** ____________________

- [ ] **V06 — Cobranza**
  - **Pasos:** Completar quién paga y el medio de pago; guardar y reabrir. Recorrer también las variantes de carga.
  - **Resultado esperado:** Se conservan los datos aplicables al titular o tercero y al medio elegido.
  - **Notas / evidencia:** ____________________

- [ ] **V07 — Documentación**
  - **Pasos:** Subir documentos requeridos; descargar uno; eliminar y reemplazar un archivo en borrador; agregar Otra documentación.
  - **Resultado esperado:** Los archivos quedan asociados a la venta e integrante correspondiente, abren correctamente y el progreso refleja los requisitos cumplidos.
  - **Notas / evidencia:** ____________________

- [ ] **V08 — Presentar una venta**
  - **Pasos:** Completar pendientes, esperar Guardado, pulsar Presentar y confirmar.
  - **Resultado esperado:** Pasa a Presentada, abre el detalle y deja de ofrecer edición. Los datos y documentos quedan disponibles.
  - **Notas / evidencia:** ____________________

- [ ] **V09 — Buscar y filtrar**
  - **Pasos:** Buscar por número y titular; probar prepaga, plan, tipo, estado y fechas. Limpiar filtros y cambiar de página.
  - **Resultado esperado:** Los resultados corresponden a los filtros y las acciones abren la venta correcta.
  - **Notas / evidencia:** ____________________

- [ ] **V10 — Consultar y exportar**
  - **Pasos:** Abrir una presentada; revisar integrantes, cobranza, documentos e historial; exportar Excel y Descargar todo.
  - **Resultado esperado:** El detalle coincide con la carga, el Excel contiene la operación y el ZIP incluye los archivos disponibles.
  - **Notas / evidencia:** ____________________

- [ ] **V11 — Corregir y volver a presentar**
  - **Pasos:** Abrir una devuelta, leer el motivo, editar, guardar y presentar nuevamente.
  - **Resultado esperado:** Conserva la misma venta y número, guarda las correcciones y vuelve a Presentada.
  - **Notas / evidencia:** ____________________

- [ ] **V12 — Recibir la resolución**
  - **Pasos:** Abrir la notificación de una venta aprobada o rechazada.
  - **Resultado esperado:** Navega a la venta correcta y muestra estado final, fecha y motivo o nota cuando corresponda.
  - **Notas / evidencia:** ____________________

## Capture variants

- [ ] **D01 — Venta voluntaria**
  - **Pasos:** Completar y presentar una venta de tipo Voluntaria.
  - **Resultado esperado:** No requiere datos laborales o impositivos de otros tipos.
  - **Notas / evidencia:** ____________________

- [ ] **D02 — Venta desregulada**
  - **Pasos:** Completar y presentar una venta Desregulada con datos laborales y CUIT de empleadores.
  - **Resultado esperado:** Solicita y conserva los datos laborales correspondientes, incluidos múltiples empleadores cuando aplique.
  - **Notas / evidencia:** ____________________

- [ ] **D03 — Venta monotributista**
  - **Pasos:** Completar y presentar una venta Monotributista.
  - **Resultado esperado:** Solicita y conserva categoría y cobertura actual según corresponda.
  - **Notas / evidencia:** ____________________

- [ ] **D04 — Titular solo y grupo familiar**
  - **Pasos:** Recorrer una venta con titular solo y otra con cónyuge e hijos.
  - **Resultado esperado:** Los requisitos y documentos se ajustan a los integrantes cargados.
  - **Notas / evidencia:** ____________________

- [ ] **D05 — FUM condicional**
  - **Pasos:** Cargar un integrante femenino mayor de 12 años y completar FUM.
  - **Resultado esperado:** El campo aparece y su valor se conserva al reabrir la venta.
  - **Notas / evidencia:** ____________________

- [ ] **D06 — Preexistencias**
  - **Pasos:** Indicar una preexistencia y completar su descripción.
  - **Resultado esperado:** Aparece el detalle de la condición y se conserva al guardar.
  - **Notas / evidencia:** ____________________

- [ ] **D07 — Titular o tercero como pagador**
  - **Pasos:** Probar titular como pagador y, en otra venta, un tercero con identidad y contacto.
  - **Resultado esperado:** Se conservan los datos correspondientes a cada pagador y se pueden presentar ambas ventas.
  - **Notas / evidencia:** ____________________

- [ ] **D08 — Pago con tarjeta**
  - **Pasos:** Usar datos ficticios: número, código, vencimiento e imágenes separadas de frente y dorso. Guardar, reabrir y mostrar/ocultar datos.
  - **Resultado esperado:** Conserva los datos e imágenes; los controles autorizados permiten mostrar y ocultar la información.
  - **Notas / evidencia:** ____________________

- [ ] **D09 — Pago con CBU, CVU o alias**
  - **Pasos:** Cargar una referencia ficticia por cada alternativa disponible; guardar, reabrir y completar los requisitos.
  - **Resultado esperado:** La referencia se conserva y permite presentar la venta con los requisitos de ese medio.
  - **Notas / evidencia:** ____________________

## Administrative

- [ ] **A01 — Ingreso e Inicio**
  - **Pasos:** Iniciar sesión como administrativo operativo y recorrer prioridades, alertas y accesos.
  - **Resultado esperado:** Ve Inicio, Gestión de ventas y Seguimientos. Los enlaces llevan a la venta o sección correcta.
  - **Notas / evidencia:** ____________________

- [ ] **A02 — Cola de ventas**
  - **Pasos:** En Gestión de ventas, buscar, filtrar y paginar.
  - **Resultado esperado:** Ve las ventas de su alcance con vendedor, titular y estado correctos.
  - **Notas / evidencia:** ____________________

- [ ] **A03 — Revisar la carga completa**
  - **Pasos:** Abrir una presentada y recorrer datos, integrantes, contacto, laboral/impositivo, cobranza y documentos.
  - **Resultado esperado:** Consulta toda la información aplicable y descarga archivos individuales o el ZIP.
  - **Notas / evidencia:** ____________________

- [ ] **A04 — Iniciar revisión**
  - **Pasos:** En una venta Presentada, pulsar Iniciar revisión.
  - **Resultado esperado:** Pasa a En revisión; si no tenía responsable se asigna al actor. El historial registra el movimiento.
  - **Notas / evidencia:** ____________________

- [ ] **A05 — Tomar responsabilidad**
  - **Pasos:** Abrir una venta En revisión sin administrativo asignado y tomar responsabilidad.
  - **Resultado esperado:** Se muestra el administrativo actual como responsable y conserva el estado En revisión.
  - **Notas / evidencia:** ____________________

- [ ] **A06 — Nota interna**
  - **Pasos:** En una venta En revisión, guardar una nota y recargar; consultar luego como vendedor.
  - **Resultado esperado:** Conserva texto, autor y fecha para el administrativo. La nota no se muestra al vendedor.
  - **Notas / evidencia:** ____________________

- [ ] **A07 — Registrar seguimiento**
  - **Pasos:** Guardar una gestión con tipo, descripción, fecha y próxima acción; repetir sin próxima acción.
  - **Resultado esperado:** Ambas persisten en el historial de gestiones con sus fechas correctas.
  - **Notas / evidencia:** ____________________

- [ ] **A08 — Acceder desde Seguimientos**
  - **Pasos:** Buscar una venta en Seguimientos y pulsar Gestiones.
  - **Resultado esperado:** Abre esa venta directamente en la sección de seguimientos.
  - **Notas / evidencia:** ____________________

- [ ] **A09 — Solicitar corrección**
  - **Pasos:** Devolver una venta presentada o en revisión con un motivo concreto.
  - **Resultado esperado:** Pasa a Devuelta; el vendedor consulta la solicitud y puede corregirla.
  - **Notas / evidencia:** ____________________

- [ ] **A10 — Revisar una venta corregida**
  - **Pasos:** Luego de la nueva presentación, abrir la venta, iniciar revisión y resolver la solicitud de corrección.
  - **Resultado esperado:** Ve los datos corregidos; la solicitud queda resuelta y se conserva el historial.
  - **Notas / evidencia:** ____________________

- [ ] **A11 — Registrar aprobación**
  - **Pasos:** En una Presentada o En revisión, elegir Aprobar y confirmar.
  - **Resultado esperado:** Queda Aprobada, registra responsable y fecha, y genera la notificación al vendedor.
  - **Notas / evidencia:** ____________________

- [ ] **A12 — Registrar rechazo**
  - **Pasos:** En otra venta, elegir Rechazar, ingresar un motivo válido y confirmar.
  - **Resultado esperado:** Queda Rechazada; el vendedor recibe la notificación y puede consultar el motivo.
  - **Notas / evidencia:** ____________________

- [ ] **A13 — Consultar una venta finalizada**
  - **Pasos:** Reabrir una aprobada y una rechazada; revisar historial, documentos y exportación.
  - **Resultado esperado:** Permanecen de solo lectura con su resolución y descargas disponibles; los seguimientos pendientes quedan cerrados.
  - **Notas / evidencia:** ____________________

## Complete cross-role workflows

- [ ] **E01 — Aprobación directa**
  - **Pasos:** Vendedor crea → guarda → presenta. Administrativo inicia revisión → registra nota y seguimiento → aprueba. Vendedor abre la notificación.
  - **Resultado esperado:** Mismo número de venta durante todo el circuito; datos persistentes e historial completo; resolución final visible.
  - **Notas / evidencia:** ____________________

- [ ] **E02 — Corrección y aprobación**
  - **Pasos:** Vendedor presenta. Administrativo devuelve con motivo. Vendedor corrige y presenta. Administrativo revisa, resuelve la corrección y aprueba.
  - **Resultado esperado:** Misma venta y número; correcciones persistentes e historial de devolución, nueva presentación y aprobación.
  - **Notas / evidencia:** ____________________

- [ ] **E03 — Rechazo**
  - **Pasos:** Vendedor presenta. Administrativo revisa y registra rechazo con motivo. Vendedor abre la notificación, detalle y Excel.
  - **Resultado esperado:** Estado y motivo coinciden entre roles y exportación; el historial registra la resolución.
  - **Notas / evidencia:** ____________________

## Common checks for both roles

- [ ] **C01 — Cerrar sesión y volver a ingresar**
  - **Pasos:** Repetir con vendedor y administrativo.
  - **Resultado esperado:** Cierra correctamente y permite volver a ingresar al Inicio correspondiente.
  - **Notas / evidencia:** ____________________

- [ ] **C02 — Cambiar contraseña**
  - **Pasos:** Con cada rol, cambiar su contraseña desde Mi cuenta y luego volver a ingresar con la nueva.
  - **Resultado esperado:** El cambio se completa, la sesión actual sigue operativa con su renovación y permite el nuevo ingreso.
  - **Notas / evidencia:** ____________________

- [ ] **C03 — Gestionar sesiones**
  - **Pasos:** Con cada rol, abrir otra sesión, verla en Mis sesiones y cerrarla desde la primera.
  - **Resultado esperado:** La sesión remota se revoca y la sesión desde la que se opera continúa disponible.
  - **Notas / evidencia:** ____________________

- [ ] **C04 — Notificaciones**
  - **Pasos:** Con cada rol y notificaciones disponibles, abrir una, marcar como leída y usar marcar todas.
  - **Resultado esperado:** Los enlaces son correctos y el indicador de no leídas refleja las acciones.
  - **Notas / evidencia:** ____________________

- [ ] **C05 — Escritorio · tema claro**
  - **Pasos:** Recorrer creación/presentación como vendedor y revisión/resolución como administrativo.
  - **Resultado esperado:** Campos, diálogos y acciones son legibles y utilizables.
  - **Notas / evidencia:** ____________________

- [ ] **C06 — Escritorio · tema oscuro**
  - **Pasos:** Repetir los flujos principales con ambos roles en tema oscuro.
  - **Resultado esperado:** Textos, estados, campos y acciones conservan buena legibilidad.
  - **Notas / evidencia:** ____________________

- [ ] **C07 — Celular · tema claro**
  - **Pasos:** Recorrer los flujos principales con ambos roles en una pantalla angosta.
  - **Resultado esperado:** Se puede acceder a secciones, completar campos y confirmar acciones sin controles cortados.
  - **Notas / evidencia:** ____________________

- [ ] **C08 — Celular · tema oscuro**
  - **Pasos:** Repetir los flujos principales en pantalla angosta y tema oscuro.
  - **Resultado esperado:** La navegación y todas las acciones siguen disponibles y legibles.
  - **Notas / evidencia:** ____________________

- [ ] **C09 — Primera navegación después del login**
  - **Pasos:** En ambos roles, abrir por primera vez cada pantalla correspondiente después de ingresar.
  - **Resultado esperado:** Las pantallas cargan correctamente, sin página en blanco ni necesidad de recargar.
  - **Notas / evidencia:** ____________________

## Related documentation

- [Sales](../features/sales/overview.md)
- [Administrative operations](../features/administrative/overview.md)
- [Role-specific home](../features/home/overview.md)
- [Own account](../features/account/overview.md)
- [Testing standards](../standards/testing.md)
