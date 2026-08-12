document.addEventListener("DOMContentLoaded", function () {

    const container =
        document.querySelector(".container");


    if (!container) {
        return;
    }


    const menu =
        document.createElement("div");


    menu.className =
        "menu-navigazione";


    menu.innerHTML = `

        <!-- ================================
             MENU SUPERIORE
        ================================= -->

        <div class="menu-superiore">

            <button
                onclick="history.back()"
                title="Indietro"
            >
                ⬅️
                <span>Indietro</span>
                </button>


            <button
                onclick="location.href='lega.html'"
            >
                🏠
                <span>Home</span>
            </button>


            <button
                onclick="location.href='index.html'"
            >
                🚪
                <span>Esci</span>
            </button>

        </div>

    `;


    /* ================================
       INSERISCE IL MENU IN ALTO
    ================================= */

    container.insertBefore(
        menu,
        container.firstChild
    );


    /* ================================
       CREA LA BARRA INFERIORE
    ================================= */

    const barra =
        document.createElement("div");


    barra.className =
        "barra-fondo";


    barra.innerHTML = `

        <button
            onclick="apriMiaRosa()"
        >
            <span class="icona">👥</span>
            <span>La mia rosa</span>
        </button>



        <button
            onclick="apriTutteLeRose()"
        >
            <span class="icona">📋</span>
            <span>Rose</span>
        </button>

        
        <button
            onclick="location.href='giocatori-liberi.html'"
        >
            <span class="icona">⚽</span>
            <span>Svincolati</span>
        </button>


        <button
               onclick="location.href='asta.html'"
           >
            ⚙️
            <span>Imposta Asta</span>
        </button>


        <button
            onclick="location.href='asta-live.html'"
        >
            <span class="icona">🔨</span>
            <span>Asta</span>
        </button>

    `;


    /* ================================
       INSERISCE LA BARRA
       DIRETTAMENTE NEL CONTAINER
    ================================= */

    container.appendChild(
        barra
    );

});