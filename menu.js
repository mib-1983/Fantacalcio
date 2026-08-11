document.addEventListener("DOMContentLoaded", function(){

    const container =
        document.querySelector(".container");


    if(!container){
        return;
    }


    const menu =
        document.createElement("div");


    menu.className =
        "menu-navigazione";


    menu.innerHTML = `

        <div style="
            display:flex;
            align-items:center;
            width:100%;
            gap:10px;
        ">

            <button
                id="bottoneIndietro"
                onclick="history.back()"
                style="
                    width:15%;
                    background:transparent;
                    border:none;
                    padding:0;
                    margin:0;
                    color:#000;
                    font-size:35px;
                    cursor:pointer;
                    box-shadow:none;
                    text-align:left;
                    transform:scaleX(1.5);
                "
            >
                ⬅️
            </button>

            <button
                id="bottoneMenu"
                style="
                    width:90%;
                "
            >
                ☰ Menu
            </button>

        </div>


        <div id="menuPagine" class="menu-pagine">

            <a href="lega.html">
                🏠 Home
            </a>


            <a href="asta.html">
                ⚙️ Impostazioni Asta
            </a>


            <a href="asta-live.html">
                🔨 Asta Live
            </a>


            <a href="giocatori-liberi.html">
                ⚽ Svincolati
            </a>


            <a
                href="rose.html"
                onclick="localStorage.removeItem('rosaDaVisualizzare');"
            >
                📋 Rose
            </a>


            <a href="index.html">
                🚪 Esci
            </a>

        </div>

    `;

     

    container.insertBefore(
        menu,
        container.firstChild
    );


    const bottone =
        document.getElementById(
            "bottoneMenu"
        );


    const menuPagine =
        document.getElementById(
            "menuPagine"
        );


    // APRE / CHIUDE CON IL PULSANTE
    bottone.addEventListener(
        "click",
        function(e){

            e.stopPropagation();

            menuPagine.classList.toggle(
                "mostra"
            );

        }
    );


    // CLIC FUORI DAL MENU = CHIUDI
    document.addEventListener(
        "click",
        function(e){

            if (
                !menu.contains(e.target)
            ) {

                menuPagine.classList.remove(
                    "mostra"
                );

            }

        }
    );

});