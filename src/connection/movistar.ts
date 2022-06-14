import { Movistar } from "../lib/movistar";

let movistar: Movistar;
let socketMovistar: any;
try {
  movistar = new Movistar();
} catch (error) {
  console.log("ENTRAMOS ACA NO SE QUE ONDA");
}

export { movistar };
