# Servidor intermediario entre servidores RCS y MOVISTAR

_Aplicación Servidor para manejo y procesamiento de mensajes en formatio ISO8583_

_La presente aplicación actua como intermediaria entre los servidores de RCS y MOVISTAR para solicitudes de recarga telefonica_

_El servidor recive cadenas de caracteres de RCS, procesa dicha data y la envia en formato ISO-8583 hacia MOVISTAR_

### Requisitos para correr el proyecto 📋

_El presente proyecto corre con la version v14.17.1 de node_

### Instalación 🔧

```shell

npm install
```

_Primero correr servidor MOVISTAR_

```shell

node .\src\movistar-test.js
```

_Luego correr servidor (comando para desarrollo)_

```shell

npm run dev
```

_Simular mensajes hacia Servidor desde un cliente (RCS)_

```shell

node .\src\rcs-test.js
```

## Construido con 🛠️

_Herramientas usadas en el proyecto:_

- NodeJs
- JavaScript
- TypeScript
- Sockets

## Wiki 📖

Puedes encontrar mucho más de cómo se usa el protocolo ISO-8583 este proyecto en [Wiki](https://es.wikipedia.org/wiki/ISO_8583)
