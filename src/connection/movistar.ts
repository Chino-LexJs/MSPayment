import { Movistar } from "../lib/movistar";

let movistar: Movistar = new Movistar();
let socketMovistar: any = movistar.getSocket();

export { socketMovistar, movistar };
