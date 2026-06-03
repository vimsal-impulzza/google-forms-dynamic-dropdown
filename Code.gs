/**
 * Google Forms — Desplegable Dinámico
 *
 * Actualiza el menú desplegable del Google Form quitando los números
 * que ya han sido seleccionados por usuarios anteriores.
 *
 * Estructura esperada en Google Sheets:
 *   - Hoja "Configuracion" (sin tilde): números disponibles en columna A
 *   - Hoja de respuestas (primera pestaña):
 *       Col A → Timestamp
 *       Col B → Nombre completo
 *       Col C → Número seleccionado
 */

var FORM_ID = "ID_GOOGLE_FORMS";

function actualizarDesplegable() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Buscar hoja "Configuracion" con trim() para ignorar espacios ocultos
  var hojaConfig = null;
  var hojas = libro.getSheets();
  for (var i = 0; i < hojas.length; i++) {
    if (hojas[i].getName().trim() === "Configuracion") {
      hojaConfig = hojas[i];
      break;
    }
  }

  if (!hojaConfig) {
    Logger.log("ERROR: No se encontró la hoja 'Configuracion'.");
    return;
  }

  // 2. Leer números disponibles
  var ultFila = hojaConfig.getLastRow();
  if (ultFila < 1) {
    Logger.log("ERROR: La hoja 'Configuracion' está vacía.");
    return;
  }

  var numerosDisponibles = hojaConfig
    .getRange(1, 1, ultFila, 1)
    .getValues()
    .flat()
    .filter(function(n) { return n !== ""; });

  // 3. Leer números ya usados (columna C de respuestas)
  var hojaRespuestas = libro.getSheets()[0];
  var ultFilaRespuestas = hojaRespuestas.getLastRow();
  var numerosUsados = [];

  if (ultFilaRespuestas > 1) {
    numerosUsados = hojaRespuestas
      .getRange(2, 3, ultFilaRespuestas - 1, 1)
      .getValues()
      .flat()
      .filter(function(n) { return n !== ""; });
  }

  // 4. Filtrar: solo los que NO han sido usados
  var listaFiltrada = numerosDisponibles.filter(function(numero) {
    return numerosUsados.indexOf(numero) === -1;
  });

  // 5. Actualizar el desplegable en el Form
  var form = FormApp.openById(FORM_ID);
  var items = form.getItems(FormApp.ItemType.LIST);

  if (items.length === 0) {
    Logger.log("ERROR: No se encontró ninguna pregunta de tipo desplegable en el Form.");
    return;
  }

  var preguntaDesplegable = items[0].asListItem();

  if (listaFiltrada.length > 0) {
    preguntaDesplegable.setChoiceValues(listaFiltrada.map(String));
    Logger.log("OK: Desplegable actualizado. Disponibles: " + listaFiltrada.join(", "));
  } else {
    preguntaDesplegable.setChoiceValues(["Ya no quedan números disponibles"]);
    Logger.log("AVISO: No quedan números disponibles.");
  }
}