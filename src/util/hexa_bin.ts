/**
 * Distintas funciones utils del sistema
 * @module Utils
 */

/**
 * Funcion que sirve para retornar bitmap primario y secundario, en formato hexadecimal y binario
 * @param DEs Arreglo que contiene los DEs usados ejemplo [1,3,4,7,11, ... , 126]
 */
export function hexa_bin_Bitmap(DEs: number[]): { [key: string]: string } {
  var json_bitmaps = {
    binaryPB: "",
    hexaPB: "",
    binarySB: "",
    hexaSB: "",
  };

  for (let i = 1; i < 65; i++) {
    if (DEs.includes(i)) {
      json_bitmaps.binaryPB = json_bitmaps.binaryPB.concat("1");
    } else {
      json_bitmaps.binaryPB = json_bitmaps.binaryPB.concat("0");
    }
  }
  for (let i = 65; i < 129; i++) {
    if (DEs.includes(i)) {
      json_bitmaps.binarySB = json_bitmaps.binarySB.concat("1");
    } else {
      json_bitmaps.binarySB = json_bitmaps.binarySB.concat("0");
    }
  }

  for (let i = 0; i < 63; i++) {
    i = i + 3;
    json_bitmaps.hexaPB = json_bitmaps.hexaPB.concat(
      hexa(json_bitmaps.binaryPB.substr(i - 3, 4))
    );
  }
  for (let i = 0; i < 63; i++) {
    i = i + 3;
    json_bitmaps.hexaSB = json_bitmaps.hexaSB.concat(
      hexa(json_bitmaps.binarySB.substr(i - 3, 4))
    );
  }

  function hexa(str: string) {
    switch (str) {
      case "0000":
        return "0";
      case "0001":
        return "1";
      case "0010":
        return "2";
      case "0011":
        return "3";
      case "0100":
        return "4";
      case "0101":
        return "5";
      case "0110":
        return "6";
      case "0111":
        return "7";
      case "1000":
        return "8";
      case "1001":
        return "9";
      case "1010":
        return "A";
      case "1011":
        return "B";
      case "1100":
        return "C";
      case "1101":
        return "D";
      case "1110":
        return "E";
      case "1111":
        return "F";

      default:
        return "";
        break;
    }
  }

  return json_bitmaps;
}

/**
 *
 * @param DEs Fields de la sub clase correspondiente
 * retorna arreglo de numeros con los subcampos usados en el archivo Fields ejemplo [1,3,4,7,11, ... , 126]
 */
export function numberOfDataElements(DEs: {
  [keys: string]: (string | number | boolean)[];
}): number[] {
  const SE_USA = 3, // ubicacion de elemento booleano del archivo fields
    NUMERO_SUBCAMPO = 0; // numero del subcampor data element
  let arrayOfNumbers: number[] = [];
  for (let key in DEs) {
    if (DEs[key][SE_USA]) {
      arrayOfNumbers.push(Number(DEs[key][NUMERO_SUBCAMPO]));
    }
  }
  return arrayOfNumbers;
}

/**
 * @param hex Cadena de caracteres en formato hexadecimal
 * @returns Cadena de caracteres en formato binario de hex
 */
export function hex2bin(hex: string): string {
  hex = hex.replace("0x", "").toLowerCase();
  var out = "";
  for (var c of hex) {
    switch (c) {
      case "0":
        out += "0000";
        break;
      case "1":
        out += "0001";
        break;
      case "2":
        out += "0010";
        break;
      case "3":
        out += "0011";
        break;
      case "4":
        out += "0100";
        break;
      case "5":
        out += "0101";
        break;
      case "6":
        out += "0110";
        break;
      case "7":
        out += "0111";
        break;
      case "8":
        out += "1000";
        break;
      case "9":
        out += "1001";
        break;
      case "a":
        out += "1010";
        break;
      case "b":
        out += "1011";
        break;
      case "c":
        out += "1100";
        break;
      case "d":
        out += "1101";
        break;
      case "e":
        out += "1110";
        break;
      case "f":
        out += "1111";
        break;
      default:
        return "";
    }
  }

  return out;
}
