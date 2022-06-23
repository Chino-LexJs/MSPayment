/**
 * Modulo para instanciar la clase Movistar, la que contiene la conexion a Movistar y el comportamiento para tratar los msj
 * @module Connections
 */

import { Movistar } from "../lib/movistar";
/**
 * movistar contiene la conexion a Movistar y el comportamiento para tratar los msj
 * @type {Movistar}
 */
let movistar: Movistar;
try {
  movistar = new Movistar();
} catch (error) {
  console.log("Error al instanciar objeto Movistar");
}

export { movistar };
