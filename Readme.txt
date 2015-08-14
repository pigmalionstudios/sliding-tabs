Esta demo cuenta con las siguientes caracteristicas principales:

- Swipe entre pantallas
- Tabs animados al mejor estilo Play Store de Google
- Scrolling pensado para Mobile (Usando Overthrow.js)
- Optimizado para iOS, Android y Blackberry 10
- Uso de Dojo (sin widgets)
- Arquitectura Master-Detail
- Cordova version: 4.1.2

HOW TO INSTALL
Luego de instalar Cordova, abrir una terminal en el directorio del proyecto y ejecutar:

(PASOS OPCIONALES, EN CASO DE ENCONTRAR ERRORES AL TRATAR DE HACER BUILD)
cordova platform remove NOMBRE_PLATAFORMA (android, ios, blackberry10)
cordova platform add NOMBRE_PLATAFORMA

cordova build android (en lugar de android también puede ser ios, blackberry10)
cordova run android (si tienen un dispositivo conectado via usb, se instalará y correrá allí)

Para más información acerca de estos comandos, dirigirse a http://docs.phonegap.com/en/edge/guide_cli_index.md.html#The%20Command-Line%20Interface
Mas detalles en http://pigmalionstudios.github.io/jekyll/update/2015/08/06/phonega-sliding-tabs.html