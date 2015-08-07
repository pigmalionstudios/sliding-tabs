Esta demo cuenta con las siguientes caracteristicas principales:

- Swipe entre pantallas
- Tabs animados al mejor estilo Play Store de Google
- Scrolling pensado para Mobile (Usando Overthrow.js)
- Optimizado para iOS, Android y Blackberry 10
- Uso de Dojo (sin widgets)
- Arquitectura Master-Detail

¿Por que Dojo? ¿Por que no Dojo?

Dojo esta construido de una forma tal que favorece la modularización del codigo y la encapsulación. Provee un muy buen manejo del DOM y carga asincronica de modulos.
Es relativamente simple, luego de familiarizarse con el framework, obtener un prototipo navegable gracias al uso de widgets. Y con un look & feel adecuado para cada plataforma! (Dojo aplica los temas de forma dinamica).
Lamentablemente, la pobre fluidez del scrolleo y algunos bugs relacionados a la interacción entre ScrollViews y SwipeViews en algunos devices hacen que sea mejor optar por una implementación propia, en pos de lograr llegar a una mayor cantidad de dispositivos.

Arquitectura y funcionamiento

Tabs

La estructura html para los Tabs es muy sencilla:

    <div id="swipeableTabs" class="menu">

        <div id="1001" class="tab" style="opacity: 1">MAIN</div>
        <div class="tabSeparator"></div>
        <div id="1002" class="tab">NEWS</div>                   
        <div class="tabSeparator"></div>
        <div id="1003" class="tab">POPULAR</div>
        <div class="tabSeparator"></div>
        <div id="1004" class="tab">FAVORITES</div>
        <div class="tabSeparator"></div>
        <div id="1005" class="tab">CONFIGURATION</div>
        <div class="tabSeparator"></div>
        <div id="1006" class="tab">ABOUT...</div>

    </div>
<div id="currTabSelected" class="tab_underline"></div>

Si se quisieran agregar mas tabs, solo hay que tener cuidado de asignarles id`s adecuados (1007, 1008, 1009...)

y de modificar

	...
	MIN_TAB_ID: 1001,
    MAX_TAB_ID: 1006,
    TABS_NUMBER: 6,
    HEADER_STYLES: {"1001" : "color_main", "1002" : "color_news", "1003" : "color_popular", 
            "1004" : "color_favorites", "1005" : "color_configuration", "1006" : "color_about"}
    ...

en Config.js

Swipe

Toda la funcionalidad está en SwipeManager. Algunos settings que se pueden modificar rapidamente acorde a los gustos y/o necesidades:

var MIN_TOLERANCE_X_FOR_SWIPE = 40; // pasados los 40 px, al levantar el dedo el swipe continuara hasta alcanzar la siguiente pantalla
var TRANSITION_TIME = 300; // el tiempo que toma en hacer el swipe

Originalmente este módulo permitia tambien hacer pull to refresh; en un post a futuro mostrare las bondades de este feature.
       
Paginas y Detalle

En el mismo nivel tenemos a "mainView" y a "detail". Para ver el detalle de un item en particular se hace un toggle entre ambas (show "detail", hide "mainView").
Para mas info, ver DetailView.js

    <body>

        <div id="mainView" class="mainView">
            
            <!-- HEADER -->
            ...
            ...
            
            <div id="pages" class="pages">

                <div id="page_main" class="page overthrow">
                </div>

                <div id="page_news" class="page overthrow">
                </div>

                ...
                ...
                    
            </div>


        </div> 

    </body>	
    
    <!-- DETAIL -->
    <div id="detail" style="display: none;">

        <div id="header_detail" style="height: 40px;">
            <!-- DETAIL HEADER -->            
        </div>

        <div id="detail_body" class="detail">
            Here goes your detailed data
        </div>

    </div>

SwipeManager ejecuta la funcion viewTransitioned de ViewTransitionListener cuando se presiona un tab o se hace swipe a otra vista.
En este caso se cambia el color del header del detail para que sea consistente con el del tab correspondiente, pero puede modificarse a gusto para agregar mas comportamientos o reemplazar el actual.



           
        

