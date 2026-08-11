//==================================================
// FANTACALCIO APP
// VERSIONE 1.0
//==================================================


//==================================================
// LOCAL STORAGE
//==================================================

const STORAGE = {

    LEGA: "lega",
    GIOCATORI: "giocatori",
    ASTA: "asta"

};


let ruoloFiltroLiberi = [];
let squadraFiltroLiberi = [];
let nomeFiltroLiberi = "";
let ordineQtLiberi = 0;
let modalitaScambio = false;
let primoScambio = null;
let modalitaSvincolo = false;

//==================================================
// CREAZIONE LEGA
//==================================================

function creaPartecipanti() {

    let numero =
        document.getElementById("numeroPartecipanti").value;

    let contenitore =
        document.getElementById("listaPartecipanti");

    contenitore.innerHTML = "";

    for (let i = 1; i <= numero; i++) {

        contenitore.innerHTML += `

        <div class="rigaPartecipante">

            <span>${i}</span>

            <input
                type="text"
                placeholder="Nome utente">

            <input
                type="text"
                placeholder="Nome squadra">

        </div>

        `;

    }

}


function salvaLega() {

    let lega = {

        nomeLega:
            document.getElementById("nomeLega").value,

        crediti:
            Number(
                document.getElementById("crediti").value
            ),

        composizioneRosa: {

            P:
                Number(
                    document.getElementById("numeroPortieri").value
                ),

            D:
                Number(
                    document.getElementById("numeroDifensori").value
                ),

            C:
                Number(
                    document.getElementById("numeroCentrocampisti").value
                ),

            A:
                Number(
                    document.getElementById("numeroAttaccanti").value
                )

        },

        partecipanti: []

    };


    let righe =
        document.querySelectorAll(".rigaPartecipante");


    righe.forEach(riga => {

        let campi =
            riga.querySelectorAll("input");


        if (
            campi[0].value.trim() !== "" &&
            campi[1].value.trim() !== ""
        ) {

            lega.partecipanti.push({

                nomeUtente:
                    campi[0].value,

                nomeSquadra:
                    campi[1].value,

                crediti:
                    lega.crediti,

                rosa: []

            });

        }

    });


    //=========================================
    // SALVA LA LEGA NELL'ELENCO DELLE LEGHE
    //=========================================

    let legheSalvate =
        JSON.parse(
            localStorage.getItem("legheSalvate")
        ) || [];


    legheSalvate.push(lega);


    localStorage.setItem(
        "legheSalvate",
        JSON.stringify(legheSalvate)
    );


    //=========================================
    // RENDE QUESTA LA LEGA ATTIVA
    //=========================================

    localStorage.setItem(
        STORAGE.LEGA,
        JSON.stringify(lega)
    );


    alert(
        "Lega creata correttamente"
    );


    window.location.href =
        "lega.html";

}


//==================================================
// PAGINA LEGA
//==================================================

function caricaLega() {

    let datiLega =
        localStorage.getItem(STORAGE.LEGA);


    if (!datiLega) {

        return;

    }


    let lega =
        JSON.parse(datiLega);


    document.getElementById("nomeLega").innerHTML =
        lega.nomeLega;


    document.getElementById("crediti").innerHTML =
        "Crediti iniziali: " + lega.crediti;


    let lista =
        document.getElementById("listaUtenti");


    lista.innerHTML = "";


    lega.partecipanti.forEach(utente => {

        lista.innerHTML += `

        <div class="card rigaSquadra">

            <span>
            👤 ${utente.nomeUtente}
            </span>

            <span>
            🏟 ${utente.nomeSquadra}
            </span>

            <span>
            💰 ${utente.crediti}
            </span>

        </div>

        `;

    });

}


//==================================================
// ASTA - CARICAMENTO ACQUIRENTI
//==================================================

function caricaAcquirenti() {

    let lega =
        JSON.parse(
            localStorage.getItem(STORAGE.LEGA)
        );


    if (!lega) {

        return;

    }


    let select =
        document.getElementById("acquirente");


    if (!select) {

        return;

    }


    select.innerHTML =
        '<option value="">Non assegnato</option>';


    lega.partecipanti.forEach(utente => {

        let opzione =
            document.createElement("option");


        opzione.value =
            utente.nomeUtente;


        opzione.textContent =
            utente.nomeUtente;


        select.appendChild(opzione);

    });


    mostraSquadra();

}


function mostraSquadra() {

    let select =
        document.getElementById("acquirente");


    if (!select) {

        return;

    }


    let nomeUtente =
        select.value;


    let lega =
        JSON.parse(
            localStorage.getItem(STORAGE.LEGA)
        );


    if (!lega) {

        return;

    }


    let utente =
        lega.partecipanti.find(
            u => u.nomeUtente == nomeUtente
        );


    if (utente) {

        document.getElementById(
            "squadraAcquirente"
        ).value =
            utente.nomeSquadra;

    }

}


function cambioAcquirente() {

    let valore =
        document.getElementById("acquirente").value;


    if (valore == "") {

        annullaAssegnazione();

    }
    else {

        mostraSquadra();

    }

}


//==================================================
// IMPORTAZIONE GIOCATORI EXCEL
//==================================================

function caricaGiocatoriExcel() {

    let file =
        document.getElementById("fileGiocatori").files[0];


    if (!file) {

        alert("Selezionare un file Excel");

        return;

    }


    let lettore =
        new FileReader();


    lettore.onload = function(e) {

        let dati =
            new Uint8Array(
                e.target.result
            );


        let workbook =
            XLSX.read(
                dati,
                {
                    type: "array"
                }
            );


        let foglio =
            workbook.Sheets[
                workbook.SheetNames[0]
            ];


        let righe =
            XLSX.utils.sheet_to_json(
                foglio,
                {
                    header: 1,
                    range: 2,
                    defval: ""
                }
            );


        let giocatori = [];


        righe.forEach(riga => {

            if (riga[3] !== "") {

                giocatori.push({

                    ruolo:
                        riga[1],

                    nome:
                        riga[3],

                    squadra:
                        riga[4],

                    quotazione:
                        Number(riga[5])

                });

            }

        });


        localStorage.setItem(
            STORAGE.GIOCATORI,
            JSON.stringify(giocatori)
        );


        alert(
            "Caricati " +
            giocatori.length +
            " giocatori"
        );

    };


    lettore.readAsArrayBuffer(file);

}


//==================================================
// ASTA LIVE
//==================================================

let listaGiocatoriAsta = [];

let indiceCorrente = 0;


function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            array[i],
            array[j]
        ] =
        [
            array[j],
            array[i]
        ];

    }


    return array;

}


function caricaPrimoGiocatore() {

    let datiAsta =
        JSON.parse(
            localStorage.getItem(STORAGE.ASTA)
        );


    let giocatori =
        JSON.parse(
            localStorage.getItem(STORAGE.GIOCATORI)
        );


    if (!datiAsta || !giocatori) {

        alert("Dati asta mancanti");

        return;

    }


    let ruoli = {

        "Portieri": "P",
        "Difensori": "D",
        "Centrocampisti": "C",
        "Attaccanti": "A"

    };


    //=========================================
    // CREA LISTA DEI GIOCATORI DEL RUOLO
    //=========================================

    listaGiocatoriAsta =
        giocatori.filter(
            g =>
                g.ruolo ==
                ruoli[datiAsta.ruolo]
        );


    //=========================================
    // ORDINE
    //=========================================

    if (datiAsta.modalita == "alfabetico") {

        listaGiocatoriAsta.sort(
            (a, b) =>
                a.nome.localeCompare(b.nome)
        );

    }


    if (datiAsta.modalita == "casuale") {

        shuffle(listaGiocatoriAsta);

    }


    if (datiAsta.modalita == "lettera") {

        listaGiocatoriAsta =
            listaGiocatoriAsta.filter(
                g =>
                    g.nome
                        .toUpperCase()
                        .startsWith(
                            datiAsta.lettera
                        )
            );

    }


    //=========================================
    // CERCA IL GIOCATORE ATTUALMENTE IN ASTA
    //=========================================

    if (datiAsta.giocatoreCorrente) {

        let indice =
            listaGiocatoriAsta.findIndex(
                g =>
                    g.nome ==
                    datiAsta.giocatoreCorrente.nome &&

                    g.squadra ==
                    datiAsta.giocatoreCorrente.squadra
            );


        if (indice != -1) {

            indiceCorrente = indice;

            mostraGiocatore();

            return;

        }

    }


    //=========================================
    // SE NON C'È UN GIOCATORE SALVATO
    // PARTE DAL PRIMO
    //=========================================

    indiceCorrente = 0;

    salvaGiocatoreCorrente();

    mostraGiocatore();

}

function salvaGiocatoreCorrente() {

    let giocatore =
        listaGiocatoriAsta[indiceCorrente];


    if (!giocatore) {

        return;

    }


    let asta =
        JSON.parse(
            localStorage.getItem(
                STORAGE.ASTA
            )
        );


    if (!asta) {

        return;

    }


    asta.giocatoreCorrente = {

        nome:
            giocatore.nome,

        squadra:
            giocatore.squadra

    };


    localStorage.setItem(
        STORAGE.ASTA,
        JSON.stringify(asta)
    );

}

//==================================================
// CONTROLLO FINE ASTA DEL RUOLO
//==================================================

function controllaFineAstaRuolo() {

    if (
        indiceCorrente ==
        listaGiocatoriAsta.length - 1
    ) {

        let asta =
            JSON.parse(
                localStorage.getItem(STORAGE.ASTA)
            );


        if (!asta) {

            return;

        }


        if (!asta.ruoliTerminati) {

            asta.ruoliTerminati = [];

        }


        if (
            !asta.ruoliTerminati.includes(
                asta.ruolo
            )
        ) {

            asta.ruoliTerminati.push(
                asta.ruolo
            );

        }


        localStorage.setItem(
            STORAGE.ASTA,
            JSON.stringify(asta)
        );


        alert(
            "Asta terminata per il ruolo: "
            + asta.ruolo
        );

    }

}


//==================================================
// MOSTRA GIOCATORE
//==================================================

function mostraGiocatore() {

    let giocatore =
        listaGiocatoriAsta[indiceCorrente];


    if (!giocatore) {

        return;

    }


    let nomiRuolo = {

        P: "Portieri",
        D: "Difensori",
        C: "Centrocampisti",
        A: "Attaccanti"

    };


    let ruolo =
        document.getElementById("ruoloGiocatore");

    let nome =
        document.getElementById("nomeGiocatore");

    let squadra =
        document.getElementById("squadraGiocatore");

    let quotazione =
        document.getElementById("quotazioneGiocatore");


    if (ruolo) {

        ruolo.innerHTML =
            nomiRuolo[giocatore.ruolo];

    }


    if (nome) {

        nome.innerHTML =
            giocatore.nome;

    }


    if (squadra) {

        squadra.innerHTML =
            giocatore.squadra;

    }


    if (quotazione) {

        quotazione.innerHTML =
            giocatore.quotazione;

    }


    if (giocatore.acquistato) {

        document.getElementById(
            "acquirente"
        ).value =
            giocatore.acquistatoDaUtente;


        document.getElementById(
            "prezzoFinale"
        ).value =
            giocatore.prezzoAcquisto;


        document.getElementById(
            "squadraAcquirente"
        ).value =
            giocatore.acquistatoDa;

    }
    else {

        document.getElementById(
            "acquirente"
        ).value = "";


        document.getElementById(
            "prezzoFinale"
        ).value = 0;


        document.getElementById(
            "squadraAcquirente"
        ).value = "";

    }

}


//==================================================
// NAVIGAZIONE ASTA
//==================================================

function successivoGiocatore() {

    if (
        indiceCorrente <
        listaGiocatoriAsta.length - 1
    ) {

        indiceCorrente++;

        salvaGiocatoreCorrente();

        mostraGiocatore();

    }
    else {

        let asta =
            JSON.parse(
                localStorage.getItem(STORAGE.ASTA)
            );


        if (!asta) {

            return;

        }


        if (!asta.ruoliTerminati) {

            asta.ruoliTerminati = [];

        }


        if (
            !asta.ruoliTerminati.includes(
                asta.ruolo
            )
        ) {

            asta.ruoliTerminati.push(
                asta.ruolo
            );

        }


        localStorage.setItem(
            STORAGE.ASTA,
            JSON.stringify(asta)
        );


        alert(
            "Asta terminata per il ruolo: " +
            asta.ruolo
        );


        window.location.href =
            "asta.html";

    }

}


function precedenteGiocatore() {

    if (indiceCorrente > 0) {
        
        indiceCorrente--;

        salvaGiocatoreCorrente();

        mostraGiocatore();

    }

}


//==================================================
// ASSEGNAZIONE GIOCATORE
//==================================================

function assegnaGiocatore() {

    let acquirente =
        document.getElementById("acquirente").value;

    let prezzo =
        Number(
            document.getElementById("prezzoFinale").value
        );


    if (acquirente == "") {

        alert("Selezionare la squadra");

        return;

    }


    if (prezzo <= 0) {

        alert("Inserire un prezzo valido");

        return;

    }


    let lega =
        JSON.parse(
            localStorage.getItem(STORAGE.LEGA)
        );


    if (!lega) {

        alert("Nessuna lega trovata");

        return;

    }


    let squadra =
        lega.partecipanti.find(
            p =>
                p.nomeUtente ==
                acquirente
        );


    if (!squadra) {

        alert("Squadra non trovata");

        return;

    }


    let giocatore =
        listaGiocatoriAsta[
            indiceCorrente
        ];


    if (!giocatore) {

        alert(
            "Nessun giocatore selezionato"
        );

        return;

    }


    //=========================================
    // RECUPERA LISTA GENERALE
    //=========================================

    let tuttiGiocatori =
        JSON.parse(
            localStorage.getItem(
                STORAGE.GIOCATORI
            )
        ) || [];


    //=========================================
    // CONTROLLA SE IL GIOCATORE
    // È GIÀ STATO ACQUISTATO
    //=========================================

    let giocatoreGiaAcquistato =
        giocatore.acquistato == true;


    //=========================================
    // SE GIÀ ACQUISTATO
    // TROVA LA VECCHIA SQUADRA
    //=========================================

    if (giocatoreGiaAcquistato) {

        let vecchiaSquadra =
            lega.partecipanti.find(
                p =>
                    p.nomeUtente ==
                    giocatore.acquistatoDaUtente
            );


        if (vecchiaSquadra) {

            //=========================================
            // RESTITUISCE I CREDITI
            //=========================================

            vecchiaSquadra.crediti +=
                Number(
                    giocatore.prezzoAcquisto
                ) || 0;


            //=========================================
            // RIMUOVE IL GIOCATORE
            // DALLA VECCHIA ROSA
            //=========================================

            vecchiaSquadra.rosa =
                vecchiaSquadra.rosa.filter(
                    g =>
                        !(
                            g.nome ==
                            giocatore.nome &&
                            g.squadra ==
                            giocatore.squadra
                        )
                );

        }

    }


    //=========================================
    // CONTROLLO CREDITI
    //=========================================

    if (
        prezzo >
        squadra.crediti
    ) {

        // Se avevamo appena liberato
        // il giocatore dalla vecchia squadra,
        // non dobbiamo lasciare la modifica
        // parzialmente eseguita.

        if (giocatoreGiaAcquistato) {

            if (vecchiaSquadra) {

                vecchiaSquadra.rosa.push({

                    nome:
                        giocatore.nome,

                    ruolo:
                        giocatore.ruolo,

                    squadra:
                        giocatore.squadra,

                    quotazione:
                        giocatore.quotazione,

                    prezzo:
                        giocatore.prezzoAcquisto

                });


                vecchiaSquadra.crediti -=
                    Number(
                        giocatore.prezzoAcquisto
                    ) || 0;

            }

        }


        alert(
            "Crediti insufficienti"
        );

        return;

    }


    //=========================================
    // CONTROLLO POSTI ROSA
    //=========================================

    let limite =
        lega.composizioneRosa[
            giocatore.ruolo
        ];


    let presenti =
        squadra.rosa.filter(
            g =>
                g.ruolo ==
                giocatore.ruolo
        );


    //=========================================
    // POSTI PIENI
    //=========================================

    if (
        presenti.length >= limite
    ) {

        // Se era già nella stessa squadra,
        // non dobbiamo considerare il giocatore
        // come un nuovo posto occupato.

        let eraNellaStessaSquadra =
            giocatoreGiaAcquistato &&
            giocatore.acquistatoDaUtente ==
            squadra.nomeUtente;


        if (!eraNellaStessaSquadra) {

            let conferma =
                confirm(
                    "Hai terminato i posti per il ruolo " +
                    giocatore.ruolo +
                    ".\n\n" +
                    "Vuoi acquistare comunque il giocatore " +
                    giocatore.nome +
                    " e scegliere chi sostituire?"
                );


            if (!conferma) {

                // Ripristina la vecchia assegnazione

                if (
                    giocatoreGiaAcquistato &&
                    vecchiaSquadra
                ) {

                    vecchiaSquadra.crediti +=
                        0;

                    vecchiaSquadra.rosa.push({

                        nome:
                            giocatore.nome,

                        ruolo:
                            giocatore.ruolo,

                        squadra:
                            giocatore.squadra,

                        quotazione:
                            giocatore.quotazione,

                        prezzo:
                            giocatore.prezzoAcquisto

                    });

                    vecchiaSquadra.crediti -=
                        Number(
                            giocatore.prezzoAcquisto
                        ) || 0;

                }

                return;

            }


            //=========================================
            // SALVA ACQUISTO IN ATTESA
            //=========================================

            let asta =
                JSON.parse(
                    localStorage.getItem(
                        STORAGE.ASTA
                    )
                ) || {};


            asta.sostituzioneInAttesa = {

                nomeNuovo:
                    giocatore.nome,

                ruoloNuovo:
                    giocatore.ruolo,

                squadraRealeNuovo:
                    giocatore.squadra,

                quotazioneNuovo:
                    giocatore.quotazione,

                prezzoNuovo:
                    prezzo,

                nomeUtente:
                    squadra.nomeUtente,

                nomeSquadra:
                    squadra.nomeSquadra

            };


            localStorage.setItem(
                STORAGE.ASTA,
                JSON.stringify(asta)
            );


            //=========================================
            // RIPRISTINA TEMPORANEAMENTE
            // LA VECCHIA ASSEGNAZIONE
            //=========================================

            if (
                giocatoreGiaAcquistato &&
                vecchiaSquadra
            ) {

                vecchiaSquadra.rosa.push({

                    nome:
                        giocatore.nome,

                    ruolo:
                        giocatore.ruolo,

                    squadra:
                        giocatore.squadra,

                    quotazione:
                        giocatore.quotazione,

                    prezzo:
                        giocatore.prezzoAcquisto

                });

                vecchiaSquadra.crediti -=
                    Number(
                        giocatore.prezzoAcquisto
                    ) || 0;

            }


            localStorage.setItem(
                STORAGE.LEGA,
                JSON.stringify(
                    lega
                )
            );


            alert(
                "Giocatore acquistato.\n\n" +
                "Ora clicca nella rosa sul giocatore " +
                "che vuoi sostituire."
            );


            window.location.href =
                "rose.html";


            return;

        }

    }


    //=========================================
    // SCALA I CREDITI DEL NUOVO ACQUISTO
    //=========================================

    squadra.crediti -=
        prezzo;


    //=========================================
    // AGGIUNGE IL GIOCATORE
    // ALLA NUOVA ROSA
    //=========================================

    squadra.rosa.push({

        nome:
            giocatore.nome,

        ruolo:
            giocatore.ruolo,

        squadra:
            giocatore.squadra,

        quotazione:
            giocatore.quotazione,

        prezzo:
            prezzo

    });


    //=========================================
    // AGGIORNA GIOCATORE
    //=========================================

    giocatore.acquistato =
        true;

    giocatore.acquistatoDa =
        squadra.nomeSquadra;

    giocatore.acquistatoDaUtente =
        squadra.nomeUtente;

    giocatore.prezzoAcquisto =
        prezzo;


    //=========================================
    // SALVA LEGA
    //=========================================

    localStorage.setItem(
        STORAGE.LEGA,
        JSON.stringify(
            lega
        )
    );


    //=========================================
    // AGGIORNA GIOCATORI
    //=========================================

    let indice =
        tuttiGiocatori.findIndex(
            g =>
                g.nome ==
                giocatore.nome &&
                g.squadra ==
                giocatore.squadra
        );


    if (indice != -1) {

        tuttiGiocatori[indice] =
            giocatore;

    }


    localStorage.setItem(
        STORAGE.GIOCATORI,
        JSON.stringify(
            tuttiGiocatori
        )
    );


    document.getElementById(
        "prezzoFinale"
    ).value = 0;


    //=========================================
    // FINE ASTA
    //=========================================

    if (
        indiceCorrente ==
        listaGiocatoriAsta.length - 1
    ) {

        let asta =
            JSON.parse(
                localStorage.getItem(
                    STORAGE.ASTA
                )
            );


        if (asta) {

            if (
                !asta.ruoliTerminati
            ) {

                asta.ruoliTerminati =
                    [];

            }


            if (
                !asta.ruoliTerminati.includes(
                    asta.ruolo
                )
            ) {

                asta.ruoliTerminati.push(
                    asta.ruolo
                );

            }


            localStorage.setItem(
                STORAGE.ASTA,
                JSON.stringify(
                    asta
                )
            );

        }

    }


    mostraGiocatore();


    alert(

        giocatore.nome +
        " acquistato da " +
        squadra.nomeSquadra +
        " per " +
        prezzo +
        " crediti"

    );

}




//==================================================
// ANNULLA ASSEGNAZIONE
//==================================================

function annullaAssegnazione() {

    let giocatore =
        listaGiocatoriAsta[
            indiceCorrente
        ];


    if (
        !giocatore ||
        !giocatore.acquistato
    ) {

        document.getElementById(
            "squadraAcquirente"
        ).value = "";

        document.getElementById(
            "prezzoFinale"
        ).value = 0;

        return;

    }


    let lega =
        JSON.parse(
            localStorage.getItem(
                STORAGE.LEGA
            )
        );


    if (!lega) {

        return;

    }


    let vecchiaSquadra =
        lega.partecipanti.find(
            p =>
                p.nomeUtente ==
                giocatore.acquistatoDaUtente
        );


    if (vecchiaSquadra) {

        vecchiaSquadra.crediti +=
            giocatore.prezzoAcquisto;


        vecchiaSquadra.rosa =
            vecchiaSquadra.rosa.filter(
                g =>
                    g.nome !=
                    giocatore.nome
            );

    }


    giocatore.acquistato = false;

    giocatore.acquistatoDa = "";

    giocatore.acquistatoDaUtente = "";

    giocatore.prezzoAcquisto = 0;


    let tuttiGiocatori =
        JSON.parse(
            localStorage.getItem(
                STORAGE.GIOCATORI
            )
        ) || [];


    let indice =
        tuttiGiocatori.findIndex(
            g =>
                g.nome ==
                giocatore.nome &&
                g.squadra ==
                giocatore.squadra
        );


    if (indice != -1) {

        tuttiGiocatori[indice] =
            giocatore;

    }


    localStorage.setItem(
        STORAGE.GIOCATORI,
        JSON.stringify(
            tuttiGiocatori
        )
    );


    localStorage.setItem(
        STORAGE.LEGA,
        JSON.stringify(lega)
    );


    document.getElementById(
        "squadraAcquirente"
    ).value = "";


    document.getElementById(
        "prezzoFinale"
    ).value = 0;


    alert(
        giocatore.nome +
        " è tornato libero"
    );

}


//==================================================
// CARICA ROSE
//==================================================

//==================================================
// CARICA ROSE
//==================================================

function caricaRose() {

    let lega =
        JSON.parse(
            localStorage.getItem(
                STORAGE.LEGA
            )
        );


    if (!lega) {

        alert(
            "Nessuna lega trovata"
        );

        return;

    }


    let contenitore =
        document.getElementById(
            "contenitoreRose"
        );


    if (!contenitore) {

        return;

    }


    //=========================================
    // CONTROLLA SE È STATA SELEZIONATA
    // UNA SOLA ROSA
    //=========================================

    let rosaDaVisualizzare =
        localStorage.getItem(
            "rosaDaVisualizzare"
        );

    let btnScambia =
        document.getElementById("btnScambia");

    let btnSvincola =
        document.getElementById("btnSvincola");


    if (rosaDaVisualizzare) {

        // ROSA SINGOLA
        if (btnScambia) {
            btnScambia.style.display = "none";
        }

        if (btnSvincola) {
            btnSvincola.style.display = "block";
        }

    }
    else {

        // TUTTE LE ROSE
        if (btnScambia) {
            btnScambia.style.display = "block";
        }

        if (btnSvincola) {
            btnSvincola.style.display = "none";
        }

    }

if (
    !document.referrer.includes("lega.html")
) {

    localStorage.removeItem(
        "rosaDaVisualizzare"
    );

    rosaDaVisualizzare = null;

}

    let partecipantiDaMostrare;


    if (rosaDaVisualizzare) {
        
        modalitaSvincolo = false;

        partecipantiDaMostrare =
            lega.partecipanti.filter(
                squadra =>
                    squadra.nomeSquadra ==
                    rosaDaVisualizzare
            );

    }
    else {

        partecipantiDaMostrare =
            lega.partecipanti;

    }


    //=========================================
    // CREA TABELLA
    //=========================================

    let html = `

    <table class="tabellaRose">

    <colgroup>

    <col class="colRuolo">

    `;


    partecipantiDaMostrare.forEach(() => {

        html += `

        <col class="colNome">
        <col class="colCosto">

        `;

    });


    html += `

    </colgroup>


    <tr>

    <th>R</th>

    `;


    partecipantiDaMostrare.forEach(
        squadra => {

            html += `

            <th colspan="2">
                ${squadra.nomeSquadra}
            </th>

            `;

        }
    );


    html += `

    </tr>


    <tr>

    <td><b>€</b></td>

    `;


    partecipantiDaMostrare.forEach(
        squadra => {

            html += `

            <td colspan="2">
                ${squadra.crediti}
            </td>

            `;

        }
    );


    html += `

    </tr>

    `;


    //=========================================
    // RUOLI
    //=========================================

    let ruoli = [

        ["P", "P"],
        ["D", "D"],
        ["C", "C"],
        ["A", "A"]

    ];


    ruoli.forEach(ruolo => {

        let numeroPosti =
            lega.composizioneRosa[
                ruolo[0]
            ];


        for (
            let posto = 0;
            posto < numeroPosti;
            posto++
        ) {

            html += `

            <tr>

            <td>

            <span class="badgeRuolo ${ruolo[0]}">
                ${ruolo[1]}
            </span>

            </td>

            `;


            partecipantiDaMostrare.forEach(
                squadra => {

                    let giocatori =
                        squadra.rosa.filter(
                            g =>
                                g.ruolo ==
                                ruolo[0]
                        );


                    let giocatore =
                        giocatori[posto];


                    if (giocatore) {

                        let nomeEscapato =
                            String(
                                giocatore.nome
                            )
                            .replace(
                                /\\/g,
                                "\\\\"
                            )
                            .replace(
                                /'/g,
                                "\\'"
                            );


                        let squadraEscapata =
                            String(
                                squadra.nomeSquadra
                            )
                            .replace(
                                /\\/g,
                                "\\\\"
                            )
                            .replace(
                                /'/g,
                                "\\'"
                            );


                        html += `

                        <td>

                        <div
                            class="nomeGiocatore ${
                                giocatore.fuoriLista
                                    ? 'giocatoreFuoriLista'
                                    : ''
                            }"
                            onclick="cliccaGiocatoreRosa(
                                '${nomeEscapato}',
                                '${squadraEscapata}',
                                '${giocatore.ruolo}'
                            )">

                            ${giocatore.nome}

                        </div>

                        </td>


                        <td>

                        <div class="costoGiocatore">

                            ${giocatore.prezzo}

                        </div>

                        </td>

                        `;

                    }
                    else {

                        html += `

                        <td></td>
                        <td></td>

                        `;

                    }

                }
            );


            html += `

            </tr>

            `;

        }

    });


    html += `

    </table>

    `;


    contenitore.innerHTML =
        html;

}


//==================================================
// GIOCATORI LIBERI
//==================================================

function caricaGiocatoriLiberi() {

    let giocatori =
        JSON.parse(
            localStorage.getItem(
                STORAGE.GIOCATORI
            )
        );


    if (!giocatori) {

        alert(
            "Nessun giocatore trovato"
        );

        return;

    }


    let contenitore =
        document.getElementById(
            "listaGiocatoriLiberi"
        );


    if (!contenitore) {

        return;

    }


    let liberi =
        giocatori.filter(
            g =>
                g.acquistato != true
        );


    if (ruoloFiltroLiberi.length > 0) {

        liberi =
            liberi.filter(
                g =>
                    ruoloFiltroLiberi.includes(
                        g.ruolo
                    )
            );

    }


    if (squadraFiltroLiberi.length > 0) {

        liberi =
            liberi.filter(
                g =>
                    squadraFiltroLiberi.includes(
                        g.squadra
                    )
            );

    }


    if (nomeFiltroLiberi != "") {

        liberi =
            liberi.filter(
                g =>
                    g.nome
                        .toLowerCase()
                        .includes(
                            nomeFiltroLiberi
                        )
            );

    }


    if (ordineQtLiberi == 1) {

        liberi.sort(
            (a, b) =>
                b.quotazione -
                a.quotazione
        );

    }


    if (ordineQtLiberi == 2) {

        liberi.sort(
            (a, b) =>
                a.quotazione -
                b.quotazione
        );

    }


    if (ordineQtLiberi == 0) {

        let ordineRuoli = {

            P: 1,
            D: 2,
            C: 3,
            A: 4

        };


        liberi.sort(
            (a, b) => {

                if (
                    ordineRuoli[a.ruolo] !=
                    ordineRuoli[b.ruolo]
                ) {

                    return (
                        ordineRuoli[a.ruolo] -
                        ordineRuoli[b.ruolo]
                    );

                }


                return a.nome.localeCompare(
                    b.nome
                );

            }
        );

    }


    let html = `

    <table class="tabellaGiocatoriLiberi">

    <colgroup>

        <col style="width:15%">
        <col style="width:40%">
        <col style="width:30%">
        <col style="width:15%">

    </colgroup>

    <tr>

    <th>

    <select
    id="selectRuoloLiberi"
    onchange="filtraRuoloSelect(this.value)"
    >

    <option value="">
    Ruolo ▼
    </option>

    <option value="P">P</option>
    <option value="D">D</option>
    <option value="C">C</option>
    <option value="A">A</option>

    </select>

    </th>


    <th onclick="mostraFiltroNomeLiberi()">
    Nome 🔎
    </th>


    <th>

    <select
    id="selectSquadraLiberi"
    onchange="filtraSquadraSelect(this.value)"
    >

    <option value="">
    Squadra ▼
    </option>

    </select>

    </th>


    <th onclick="ordinaQtLiberi()">
    € ⇅
    </th>

    </tr>

    `;


    liberi.forEach(g => {

        html += `

        <tr>

        <td>

        <span class="badgeRuolo ${g.ruolo}">
        ${g.ruolo}
        </span>

        </td>

        <td
            class="nomeGiocatore"
            onclick="selezionaGiocatoreLibero(
                '${String(g.nome).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}',
                '${String(g.squadra).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'
            )"
        >
            ${g.nome}
        </td>

        <td>
        ${g.squadra}
        </td>

        <td>
        ${g.quotazione}
        </td>

        </tr>

        `;

    });


    html += `

    </table>

    `;


    contenitore.innerHTML =
        html;


    let selectSquadra =
        document.getElementById(
            "selectSquadraLiberi"
        );


    if (selectSquadra) {

        let squadre = [];


        giocatori.forEach(g => {

            if (
                g.acquistato != true &&
                !squadre.includes(
                    g.squadra
                )
            ) {

                squadre.push(
                    g.squadra
                );

            }

        });


        squadre.sort();


        selectSquadra.innerHTML = `
            <option value="">
            Squadra ▼
            </option>
        `;


        squadre.forEach(s => {

            selectSquadra.innerHTML += `
                <option value="${s}">
                ${s}
                </option>
            `;

        });

    }


    let selectRuolo =
        document.getElementById(
            "selectRuoloLiberi"
        );


    if (selectRuolo) {

        if (
            ruoloFiltroLiberi.length > 0
        ) {

            selectRuolo.value =
                ruoloFiltroLiberi[0];

        }
        else {

            selectRuolo.value =
                "";

        }

    }


    if (
        squadraFiltroLiberi.length > 0
    ) {

        selectSquadra.value =
            squadraFiltroLiberi[0];

    }
    else {

        selectSquadra.value =
            "";

    }

}


//==================================================
// FILTRI GIOCATORI LIBERI
//==================================================

function mostraFiltroRuoloLiberi() {

    let contenitore =
        document.getElementById(
            "filtriLiberi"
        );


    if (contenitore.innerHTML != "") {

        contenitore.innerHTML = "";

        return;

    }


    contenitore.innerHTML = `

    <div class="filtroRuoli">

    <label>
    <input
    type="checkbox"
    value="P"
    onchange="applicaFiltroRuoliLiberi()">
    <span>P</span>
    </label>


    <label>
    <input
    type="checkbox"
    value="D"
    onchange="applicaFiltroRuoliLiberi()">
    <span>D</span>
    </label>


    <label>
    <input
    type="checkbox"
    value="C"
    onchange="applicaFiltroRuoliLiberi()">
    <span>C</span>
    </label>


    <label>
    <input
    type="checkbox"
    value="A"
    onchange="applicaFiltroRuoliLiberi()">
    <span>A</span>
    </label>

    </div>

    `;

}


function applicaFiltroRuoliLiberi() {

    let selezionati = [];


    document
        .querySelectorAll(
            "#filtriLiberi input:checked"
        )
        .forEach(cb => {

            selezionati.push(
                cb.value
            );

        });


    ruoloFiltroLiberi =
        selezionati;


    caricaGiocatoriLiberi();

}


function mostraFiltroNomeLiberi() {

    let contenitore =
        document.getElementById(
            "filtriLiberi"
        );


    let vecchio =
        document.getElementById(
            "boxNomeLiberi"
        );


    if (vecchio) {

        vecchio.remove();

        nomeFiltroLiberi = "";

        caricaGiocatoriLiberi();

        return;

    }


    let div =
        document.createElement("div");


    div.id =
        "boxNomeLiberi";


    div.innerHTML = `

    <input
    type="text"
    placeholder="Cerca nome..."
    onkeyup="filtraNomeInput(this.value)">

    `;


    contenitore.appendChild(div);

}


function filtraNomeInput(testo) {

    nomeFiltroLiberi =
        testo.toLowerCase();


    caricaGiocatoriLiberi();

}


function filtraSquadraSelect(squadra) {

    if (squadra == "") {

        squadraFiltroLiberi = [];

    }
    else {

        squadraFiltroLiberi = [
            squadra
        ];

    }


    caricaGiocatoriLiberi();

}


function applicaFiltroSquadreLiberi() {

    let selezionate = [];


    document
        .querySelectorAll(
            "#filtriLiberi input:checked"
        )
        .forEach(cb => {

            selezionate.push(
                cb.value
            );

        });


    squadraFiltroLiberi =
        selezionate;


    caricaGiocatoriLiberi();

}


function applicaFiltroNomeLiberi() {

    nomeFiltroLiberi =
        document
            .querySelector(
                "#boxNomeLiberi input"
            )
            .value
            .toLowerCase();


    caricaGiocatoriLiberi();

}


function ordinaQtLiberi() {

    ordineQtLiberi++;


    if (ordineQtLiberi > 2) {

        ordineQtLiberi = 0;

    }


    caricaGiocatoriLiberi();

}


function filtraRuoloSelect(ruolo) {

    ruoloFiltroLiberi = [];


    if (ruolo != "") {

        ruoloFiltroLiberi = [
            ruolo
        ];

    }


    caricaGiocatoriLiberi();

}


//==================================================
// SCAMBIO GIOCATORI
//==================================================

function attivaScambio() {

    //=========================================
    // SE LO SCAMBIO È GIÀ ATTIVO
    // LO DISATTIVA
    //=========================================

    if (modalitaScambio) {

        modalitaScambio =
            false;

        primoScambio =
            null;


        let bottone =
            document.getElementById(
                "btnScambia"
            );


        if (bottone) {

            bottone.style.background =
                "";

            bottone.innerHTML =
                "🔄 SCAMBIA";

        }


        return;

    }


    //=========================================
    // ATTIVA SCAMBIO
    //=========================================

    modalitaScambio =
        true;

    primoScambio =
        null;


    let bottone =
        document.getElementById(
            "btnScambia"
        );


    if (bottone) {

        bottone.style.background =
            "#ff9800";

        bottone.innerHTML =
            "✅ SCAMBIO ATTIVO";

    }

}


function selezionaGiocatoreScambio(
    nome,
    squadra,
    ruolo
) {

    if (!modalitaScambio) {

        return;

    }


    let giocatore = {

        nome: nome,
        squadra: squadra,
        ruolo: ruolo

    };


    if (primoScambio == null) {

        primoScambio =
            giocatore;

        // Evidenzia il primo giocatore selezionato
        let elementi =
            document.querySelectorAll(
                ".nomeGiocatore"
            );

        elementi.forEach(
            elemento => {

                if (
                    elemento.textContent.trim() ==
                    nome
                ) {

                    elemento.classList.add(
                        "giocatoreSelezionatoScambio"
                    );

                }

            }
        );

        return;

    }


    let secondoScambio =
        giocatore;


    if (
        primoScambio.nome ==
        secondoScambio.nome &&
        primoScambio.squadra ==
        secondoScambio.squadra
    ) {

        primoScambio = null;

        return;

    }


    if (
        primoScambio.ruolo !=
        secondoScambio.ruolo
    ) {

        alert(
            "Puoi scambiare solo giocatori dello stesso ruolo"
        );


        primoScambio = null;

        return;

    }


    let lega =
        JSON.parse(
            localStorage.getItem(
                STORAGE.LEGA
            )
        );


    if (!lega) {

        primoScambio = null;

        return;

    }


    let squadra1 =
        lega.partecipanti.find(
            p =>
                p.nomeSquadra ==
                primoScambio.squadra
        );


    let squadra2 =
        lega.partecipanti.find(
            p =>
                p.nomeSquadra ==
                secondoScambio.squadra
        );


    if (!squadra1 || !squadra2) {

        primoScambio = null;

        return;

    }


    let indice1 =
        squadra1.rosa.findIndex(
            g =>
                g.nome ==
                primoScambio.nome
        );


    let indice2 =
        squadra2.rosa.findIndex(
            g =>
                g.nome ==
                secondoScambio.nome
        );


    if (
        indice1 == -1 ||
        indice2 == -1
    ) {

        primoScambio = null;

        return;

    }


    let nome1 =
        primoScambio.nome;

    let nome2 =
        secondoScambio.nome;


    let giocatore1 =
        squadra1.rosa[indice1];

    let giocatore2 =
        squadra2.rosa[indice2];


    //=========================================
    // I COSTI RESTANO NELLE RISPETTIVE ROSE
    //=========================================

    let prezzo1 =
        giocatore1.prezzo;

    let prezzo2 =
        giocatore2.prezzo;


    squadra1.rosa[indice1] = {

        nome:
            giocatore2.nome,

        ruolo:
            giocatore2.ruolo,

        squadra:
            giocatore2.squadra,

        quotazione:
            giocatore2.quotazione,

        prezzo:
            prezzo1

    };


    squadra2.rosa[indice2] = {

        nome:
            giocatore1.nome,

        ruolo:
            giocatore1.ruolo,

        squadra:
            giocatore1.squadra,

        quotazione:
            giocatore1.quotazione,

        prezzo:
            prezzo2

    };


    localStorage.setItem(
        STORAGE.LEGA,
        JSON.stringify(lega)
    );


    //=========================================
    // AGGIORNA GIOCATORI
    //=========================================

    let tuttiGiocatori =
        JSON.parse(
            localStorage.getItem(
                STORAGE.GIOCATORI
            )
        ) || [];


    let indiceGiocatore1 =
        tuttiGiocatori.findIndex(
            g =>
                g.nome ==
                giocatore1.nome &&
                g.squadra ==
                giocatore1.squadra
        );


    let indiceGiocatore2 =
        tuttiGiocatori.findIndex(
            g =>
                g.nome ==
                giocatore2.nome &&
                g.squadra ==
                giocatore2.squadra
        );


    if (
        indiceGiocatore1 != -1
    ) {

        tuttiGiocatori[
            indiceGiocatore1
        ].acquistatoDa =
            squadra2.nomeSquadra;


        tuttiGiocatori[
            indiceGiocatore1
        ].acquistatoDaUtente =
            squadra2.nomeUtente;

    }


    if (
        indiceGiocatore2 != -1
    ) {

        tuttiGiocatori[
            indiceGiocatore2
        ].acquistatoDa =
            squadra1.nomeSquadra;


        tuttiGiocatori[
            indiceGiocatore2
        ].acquistatoDaUtente =
            squadra1.nomeUtente;

    }


    localStorage.setItem(
        STORAGE.GIOCATORI,
        JSON.stringify(
            tuttiGiocatori
        )
    );


document
    .querySelectorAll(
        ".giocatoreSelezionatoScambio"
    )
    .forEach(
        elemento => {

            elemento.classList.remove(
                "giocatoreSelezionatoScambio"
            );

        }
    );

    modalitaScambio = false;

    primoScambio = null;


    let bottone =
        document.getElementById(
            "btnScambia"
        );


    if (bottone) {

        bottone.innerHTML =
            "🔄 SCAMBIA";

        bottone.style.background =
            "";

    }


    caricaRose();


    alert(
        "Scambio effettuato: "
        + nome1
        + " ↔ "
        + nome2
    );

}


//==================================================
// MERCATO DI RIPARAZIONE
//==================================================

function iniziaMercatoRiparazione() {

    let asta =
        JSON.parse(
            localStorage.getItem(
                STORAGE.ASTA
            )
        );


    if (!asta) {

        alert(
            "Nessuna asta trovata"
        );

        return;

    }


    asta.tipoAsta =
        "riparazione";

    asta.modalitaBloccata =
        false;

    asta.ruoliTerminati = [];


    localStorage.setItem(
        STORAGE.ASTA,
        JSON.stringify(asta)
    );


    alert(
        "Asta di mercato di riparazione avviata"
    );


    location.reload();

}


//==================================================
// CARICAMENTO GIOCATORI RIPARAZIONE
//==================================================

function caricaGiocatoriRiparazione() {

    let file =
        document.getElementById(
            "fileRiparazione"
        ).files[0];


    if (!file) {

        alert(
            "Selezionare un file Excel"
        );

        return;

    }


    let lega =
        JSON.parse(
            localStorage.getItem(
                STORAGE.LEGA
            )
        );

    //=========================================
    // AGGIUNGE I CREDITI DEL MERCATO DI RIPARAZIONE
    //=========================================

    let creditiAggiunti =
        Number(
            document.getElementById(
                "creditiRiparazione"
            ).value
        ) || 0;


    if (creditiAggiunti > 0) {

        lega.partecipanti.forEach(
            squadra => {

                squadra.crediti +=
                    creditiAggiunti;

            }
        );

    }


    if (!lega) {

        alert(
            "Nessuna lega trovata"
        );

        return;

    }


    let lettore =
        new FileReader();


    lettore.onload =
        function(e) {

        let dati =
            new Uint8Array(
                e.target.result
            );


        let workbook =
            XLSX.read(
                dati,
                {
                    type: "array"
                }
            );


        let foglio =
            workbook.Sheets[
                workbook.SheetNames[0]
            ];


        let righe =
            XLSX.utils.sheet_to_json(
                foglio,
                {
                    header: 1,
                    range: 2,
                    defval: ""
                }
            );


        let giocatori = [];


        //=========================================
        // LEGGE LA NUOVA LISTA
        //=========================================

        righe.forEach(
            riga => {

                if (riga[3] !== "") {

                    giocatori.push({

                        ruolo:
                            riga[1],

                        nome:
                            riga[3],

                        squadra:
                            riga[4],

                        quotazione:
                            Number(riga[5])

                    });

                }

            }
        );


        //=========================================
        // CONTROLLA I GIOCATORI GIÀ IN ROSA
        //=========================================

        lega.partecipanti.forEach(
            squadra => {

                squadra.rosa.forEach(
                    giocatoreRosa => {

                        let presente =
                            giocatori.some(
                                giocatoreNuovo =>

                                    giocatoreNuovo.nome ==
                                    giocatoreRosa.nome &&

                                    giocatoreNuovo.squadra ==
                                    giocatoreRosa.squadra

                            );


                        if (presente) {

                            giocatoreRosa.fuoriLista =
                                false;

                        }
                        else {

                            giocatoreRosa.fuoriLista =
                                true;

                        }

                    }
                );

            }
        );


        localStorage.setItem(
            STORAGE.LEGA,
            JSON.stringify(lega)
        );


        //=========================================
        // ESCLUDE I GIOCATORI GIÀ IN ROSA
        //=========================================

        let giocatoriDisponibili =
            giocatori.filter(
                giocatore => {

                    let giaAcquistato =
                        lega.partecipanti.some(
                            squadra => {

                                return squadra.rosa.some(
                                    giocatoreRosa =>

                                        giocatoreRosa.nome ==
                                        giocatore.nome &&

                                        giocatoreRosa.squadra ==
                                        giocatore.squadra

                                );

                            }
                        );


                    return !giaAcquistato;

                }
            );


        //=========================================
        // SALVA NUOVA LISTA
        //=========================================

        localStorage.setItem(
            STORAGE.GIOCATORI,
            JSON.stringify(
                giocatoriDisponibili
            )
        );


        //=========================================
        // AZZERA ASTA PRECEDENTE
        //=========================================

        let asta =
            JSON.parse(
                localStorage.getItem(
                    STORAGE.ASTA
                )
            );


        if (!asta) {

            asta = {};

        }


        asta.tipoAsta =
            "riparazione";

        asta.modalitaBloccata =
            false;

        asta.ruoliTerminati =
            [];

        asta.ruolo =
            "Portieri";


        localStorage.setItem(
            STORAGE.ASTA,
            JSON.stringify(asta)
        );


        //=========================================
        // AGGIORNA PAGINA
        //=========================================

        let selectRuolo =
            document.getElementById(
                "ruolo"
            );


        if (selectRuolo) {

            selectRuolo.value =
                "Portieri";


            Array.from(
                selectRuolo.options
            ).forEach(
                opzione => {

                    opzione.disabled =
                        false;

                    opzione.textContent =
                        opzione.value;

                }
            );

        }


        alert(

            "Lista caricata.\n\n" +

            "Giocatori presenti nel file: " +
            giocatori.length +

            "\nGiocatori disponibili: " +
            giocatoriDisponibili.length

        );

    };


    lettore.readAsArrayBuffer(file);

}


//==================================================
// INIZIO ASTA
//==================================================

function iniziaAsta() {

    let ruolo =
        document.getElementById(
            "ruolo"
        ).value;


    let modalita =
        document.querySelector(
            'input[name="modalita"]:checked'
        ).value;


    let lettera = "";


    if (modalita == "lettera") {

        lettera =
            document.getElementById(
                "lettera"
            ).value
            .toUpperCase();

    }


    if (
        modalita == "lettera" &&
        lettera == ""
    ) {

        alert(
            "Inserire la lettera iniziale"
        );

        return;

    }


    let asta =
        JSON.parse(
            localStorage.getItem(
                STORAGE.ASTA
            )
        );


    if (!asta) {

        asta = {};

    }


    if (!asta.tipoAsta) {

        asta.tipoAsta =
            "iniziale";

    }


    asta.ruolo =
        ruolo;

    asta.modalita =
        modalita;

    asta.lettera =
        lettera;

    asta.modalitaBloccata =
        true;


    if (!asta.ruoliTerminati) {

        asta.ruoliTerminati = [];

    }


    localStorage.setItem(
        STORAGE.ASTA,
        JSON.stringify(asta)
    );


    window.location.href =
        "asta-live.html";

}


//==================================================
// AGGIORNA RUOLI ASTA
//==================================================

function aggiornaRuoliAsta() {

    let asta =
        JSON.parse(
            localStorage.getItem(
                STORAGE.ASTA
            )
        );


    if (!asta) {

        return;

    }


    let select =
        document.getElementById(
            "ruolo"
        );


    if (!select) {

        return;

    }


    let ruoliTerminati =
        asta.ruoliTerminati || [];


    Array.from(
        select.options
    ).forEach(
        opzione => {

            opzione.disabled =
                false;

        }
    );


    Array.from(
        select.options
    ).forEach(
        opzione => {

            if (
                ruoliTerminati.includes(
                    opzione.value
                )
            ) {

                opzione.disabled =
                    true;

                opzione.textContent =
                    opzione.value +
                    " - TERMINATO";

            }

        }
    );


    if (
        select.selectedOptions[0] &&
        select.selectedOptions[0].disabled
    ) {

        let disponibile =
            Array.from(
                select.options
            ).find(
                opzione =>
                    !opzione.disabled
            );


        if (disponibile) {

            select.value =
                disponibile.value;

        }

    }

}


//==================================================
// POPUP SOSTITUZIONE GIOCATORE
//==================================================

let indiceSostituzione = null;


//==================================================
// APRE POPUP
//==================================================

function apriPopupSostituzione(
    squadra,
    ruolo,
    giocatoreNuovo,
    prezzo
) {

    let popup =
        document.getElementById(
            "popupSostituzione"
        );


    let testo =
        document.getElementById(
            "testoSostituzione"
        );


    let lista =
        document.getElementById(
            "listaSostituzione"
        );


    if (
        !popup ||
        !testo ||
        !lista
    ) {

        alert(
            "Popup sostituzione non trovato"
        );

        return;

    }


    //=========================================
    // TESTO
    //=========================================

    testo.innerHTML =

        "Hai terminato i posti per i "
        + ruolo
        + ".<br><br>"
        + "Seleziona il giocatore da sostituire:"
        + "<br><br>"
        + "<strong>"
        + giocatoreNuovo.nome
        + "</strong>"
        + " per "
        + prezzo
        + " crediti";


    lista.innerHTML = "";


    indiceSostituzione = null;


    //=========================================
    // CREA ELENCO GIOCATORI SOSTITUIBILI
    //=========================================

    squadra.rosa.forEach(

        (g, indice) => {

            if (
                g.ruolo != ruolo
            ) {

                return;

            }


            let bottone =
                document.createElement(
                    "button"
                );


            bottone.type =
                "button";


            bottone.textContent =
                g.nome
                + " - "
                + g.prezzo
                + " crediti";


            bottone.onclick =
                function() {

                    indiceSostituzione =
                        indice;


                    chiudiPopupSostituzione();


                    completaSostituzione(

                        squadra,

                        indice,

                        giocatoreNuovo,

                        prezzo

                    );

                };


            lista.appendChild(
                bottone
            );

        }

    );


    popup.style.display =
        "flex";

}


//==================================================
// CHIUDE POPUP
//==================================================

function chiudiPopupSostituzione() {

    let popup =
        document.getElementById(
            "popupSostituzione"
        );


    if (popup) {

        popup.style.display =
            "none";

    }

}


//==================================================
// COMPLETA SOSTITUZIONE
//==================================================

function completaSostituzione(
    squadra,
    indice,
    giocatoreNuovo,
    prezzo
) {

    //=========================================
    // RECUPERA LEGA DAL LOCAL STORAGE
    //=========================================

    let lega =
        JSON.parse(
            localStorage.getItem(
                STORAGE.LEGA
            )
        );


    if (!lega) {

        alert(
            "Nessuna lega trovata"
        );

        return;

    }


    //=========================================
    // TROVA LA SQUADRA REALE
    //=========================================

    let squadraReale =
        lega.partecipanti.find(
            p =>
                p.nomeSquadra ==
                squadra.nomeSquadra
        );


    if (!squadraReale) {

        alert(
            "Squadra non trovata"
        );

        return;

    }


    //=========================================
    // RECUPERA VECCHIO GIOCATORE
    //=========================================

    let vecchioGiocatore =
        squadraReale.rosa[indice];


    if (!vecchioGiocatore) {

        alert(
            "Giocatore da sostituire non trovato"
        );

        return;

    }


    //=========================================
    // CONTROLLO CREDITI
    //=========================================

    if (
        prezzo >
        squadraReale.crediti
    ) {

        alert(
            "Crediti insufficienti"
        );

        return;

    }


    //=========================================
    // RECUPERA LISTA GENERALE
    //=========================================

    let tuttiGiocatori =
        JSON.parse(
            localStorage.getItem(
                STORAGE.GIOCATORI
            )
        ) || [];


    //=========================================
    // LIBERA VECCHIO GIOCATORE
    //=========================================

    let indiceVecchio =
        tuttiGiocatori.findIndex(

            g =>
                g.nome ==
                vecchioGiocatore.nome &&

                g.squadra ==
                vecchioGiocatore.squadra

        );


    if (
        indiceVecchio != -1
    ) {

        tuttiGiocatori[
            indiceVecchio
        ].acquistato =
            false;


        tuttiGiocatori[
            indiceVecchio
        ].acquistatoDa =
            "";


        tuttiGiocatori[
            indiceVecchio
        ].acquistatoDaUtente =
            "";


        tuttiGiocatori[
            indiceVecchio
        ].prezzoAcquisto =
            0;

    }


    //=========================================
    // SCALA I CREDITI DEL NUOVO ACQUISTO
    //=========================================

    squadraReale.crediti -=
        prezzo;


    //=========================================
    // CREA NUOVO GIOCATORE
    //=========================================

    let nuovoGiocatore = {

        nome:
            giocatoreNuovo.nome,

        ruolo:
            giocatoreNuovo.ruolo,

        squadra:
            giocatoreNuovo.squadra,

        quotazione:
            giocatoreNuovo.quotazione,

        prezzo:
            prezzo

    };


    //=========================================
    // SOSTITUISCE NELLA ROSA
    //=========================================

    squadraReale.rosa[indice] =
        nuovoGiocatore;


    //=========================================
    // AGGIORNA NUOVO GIOCATORE
    // NELLA LISTA GENERALE
    //=========================================

    let indiceNuovo =
        tuttiGiocatori.findIndex(

            g =>
                g.nome ==
                giocatoreNuovo.nome &&

                g.squadra ==
                giocatoreNuovo.squadra

        );


    if (
        indiceNuovo != -1
    ) {

        tuttiGiocatori[
            indiceNuovo
        ].acquistato =
            true;


        tuttiGiocatori[
            indiceNuovo
        ].acquistatoDa =
            squadraReale.nomeSquadra;


        tuttiGiocatori[
            indiceNuovo
        ].acquistatoDaUtente =
            squadraReale.nomeUtente;


        tuttiGiocatori[
            indiceNuovo
        ].prezzoAcquisto =
            prezzo;

    }


    //=========================================
    // AGGIORNA ANCHE L'OGGETTO ASTA
    //=========================================

    giocatoreNuovo.acquistato =
        true;


    giocatoreNuovo.acquistatoDa =
        squadraReale.nomeSquadra;


    giocatoreNuovo.acquistatoDaUtente =
        squadraReale.nomeUtente;


    giocatoreNuovo.prezzoAcquisto =
        prezzo;


    //=========================================
    // SALVA GIOCATORI
    //=========================================

    localStorage.setItem(
        STORAGE.GIOCATORI,
        JSON.stringify(
            tuttiGiocatori
        )
    );


    //=========================================
    // SALVA LEGA
    //=========================================

    localStorage.setItem(
        STORAGE.LEGA,
        JSON.stringify(
            lega
        )
    );


    //=========================================
    // RESET INDICE
    //=========================================

    indiceSostituzione =
        null;


    //=========================================
    // AGGIORNA VISUALIZZAZIONE
    //=========================================

    caricaRose();


    mostraGiocatore();


    //=========================================
    // MESSAGGIO
    //=========================================

    alert(

        giocatoreNuovo.nome
        + " ha sostituito "
        + vecchioGiocatore.nome
        + " nella squadra "
        + squadraReale.nomeSquadra

    );

}


//==================================================
// CLIC SUL GIOCATORE NELLE ROSE
// GESTIONE SOSTITUZIONE DA ASTA
//==================================================

function cliccaGiocatoreRosa(
    nome,
    squadra,
    ruolo
) {


    //=========================================
    // MODALITÀ SVINCOLO
    //=========================================

    if (modalitaSvincolo) {

        svincolaGiocatore(
            nome,
            squadra,
            ruolo
        );

        return;

    }

    //=========================================
    // CONTROLLA SE C'È UNA SOSTITUZIONE PENDENTE
    //=========================================

    let asta =
        JSON.parse(
            localStorage.getItem(
                STORAGE.ASTA
            )
        );


    if (
        !asta ||
        !asta.sostituzioneInAttesa
    ) {

        // Nessuna sostituzione pendente:
        // usa il normale sistema di scambio

        selezionaGiocatoreScambio(
            nome,
            squadra,
            ruolo
        );

        return;

    }


    let sostituzione =
        asta.sostituzioneInAttesa;


    //=========================================
    // CONTROLLA LA SQUADRA
    //=========================================

    if (
        squadra !=
        sostituzione.nomeSquadra
    ) {

        alert(
            "Devi scegliere un giocatore della squadra " +
            sostituzione.nomeSquadra
        );

        return;

    }


    //=========================================
    // CONTROLLA IL RUOLO
    //=========================================

    if (
        ruolo !=
        sostituzione.ruoloNuovo
    ) {

        alert(
            "Devi scegliere un giocatore dello stesso ruolo."
        );

        return;

    }


    //=========================================
    // CONFERMA
    //=========================================

    let conferma =
        confirm(
            "Vuoi sostituire " +
            nome +
            " con " +
            sostituzione.nomeNuovo +
            " per " +
            sostituzione.prezzoNuovo +
            " crediti?"
        );


    if (!conferma) {
        return;
    }


    //=========================================
    // RECUPERA LEGA
    //=========================================

    let lega =
        JSON.parse(
            localStorage.getItem(
                STORAGE.LEGA
            )
        );


    if (!lega) {

        alert(
            "Nessuna lega trovata"
        );

        return;

    }


    let squadraObj =
        lega.partecipanti.find(
            p =>
                p.nomeSquadra ==
                squadra
        );


    if (!squadraObj) {

        alert(
            "Squadra non trovata"
        );

        return;

    }


    //=========================================
    // TROVA IL GIOCATORE DA SOSTITUIRE
    //=========================================

    let indiceVecchio =
        squadraObj.rosa.findIndex(
            g =>
                g.nome ==
                nome &&
                g.ruolo ==
                ruolo
        );


    if (indiceVecchio == -1) {

        alert(
            "Giocatore da sostituire non trovato"
        );

        return;

    }


    let vecchioGiocatore =
        squadraObj.rosa[indiceVecchio];


    //=========================================
    // CONTROLLA CREDITI
    //=========================================

    if (
        sostituzione.prezzoNuovo >
        squadraObj.crediti
    ) {

        alert(
            "Crediti insufficienti"
        );

        return;

    }


    //=========================================
    // RECUPERA LISTA GIOCATORI
    //=========================================

    let tuttiGiocatori =
        JSON.parse(
            localStorage.getItem(
                STORAGE.GIOCATORI
            )
        ) || [];


    //=========================================
    // LIBERA IL VECCHIO GIOCATORE
    //=========================================

    let indiceVecchioLista =
        tuttiGiocatori.findIndex(
            g =>
                g.nome ==
                vecchioGiocatore.nome &&
                g.squadra ==
                vecchioGiocatore.squadra
        );


    if (
        indiceVecchioLista != -1
    ) {

        tuttiGiocatori[
            indiceVecchioLista
        ].acquistato =
            false;

        tuttiGiocatori[
            indiceVecchioLista
        ].acquistatoDa =
            "";

        tuttiGiocatori[
            indiceVecchioLista
        ].acquistatoDaUtente =
            "";

        tuttiGiocatori[
            indiceVecchioLista
        ].prezzoAcquisto =
            0;

    }


    //=========================================
    // SCALA I CREDITI
    //=========================================

    squadraObj.crediti -=
        sostituzione.prezzoNuovo;


    //=========================================
    // CREA NUOVO GIOCATORE
    //=========================================

    let nuovoGiocatore = {

        nome:
            sostituzione.nomeNuovo,

        ruolo:
            sostituzione.ruoloNuovo,

        squadra:
            sostituzione.squadraRealeNuovo,

        quotazione:
            sostituzione.quotazioneNuovo,

        prezzo:
            sostituzione.prezzoNuovo

    };


    //=========================================
    // SOSTITUISCE NELLA ROSA
    //=========================================

    squadraObj.rosa[
        indiceVecchio
    ] =
        nuovoGiocatore;


    //=========================================
    // SEGNA NUOVO GIOCATORE COME ACQUISTATO
    //=========================================

    let indiceNuovoLista =
        tuttiGiocatori.findIndex(
            g =>
                g.nome ==
                sostituzione.nomeNuovo &&
                g.squadra ==
                sostituzione.squadraRealeNuovo
        );


    if (
        indiceNuovoLista != -1
    ) {

        tuttiGiocatori[
            indiceNuovoLista
        ].acquistato =
            true;

        tuttiGiocatori[
            indiceNuovoLista
        ].acquistatoDa =
            squadraObj.nomeSquadra;

        tuttiGiocatori[
            indiceNuovoLista
        ].acquistatoDaUtente =
            squadraObj.nomeUtente;

        tuttiGiocatori[
            indiceNuovoLista
        ].prezzoAcquisto =
            sostituzione.prezzoNuovo;

    }


    //=========================================
    // SALVA TUTTO
    //=========================================

    localStorage.setItem(
        STORAGE.LEGA,
        JSON.stringify(lega)
    );


    localStorage.setItem(
        STORAGE.GIOCATORI,
        JSON.stringify(
            tuttiGiocatori
        )
    );


    //=========================================
    // CANCELLA SOSTITUZIONE PENDENTE
    //=========================================

    delete asta.sostituzioneInAttesa;


    localStorage.setItem(
        STORAGE.ASTA,
        JSON.stringify(asta)
    );


    //=========================================
    // AGGIORNA ROSE
    //=========================================

    caricaRose();


    alert(
        sostituzione.nomeNuovo +
        " ha sostituito " +
        vecchioGiocatore.nome +
        " nella squadra " +
        squadraObj.nomeSquadra
    );

}


//==================================================
// PAGINA LEGA
//==================================================

function caricaLega() {

    let datiLega =
        localStorage.getItem(
            STORAGE.LEGA
        );


    if (!datiLega) {

        return;

    }


    let lega =
        JSON.parse(datiLega);


    document.getElementById("nomeLega").innerHTML =
        lega.nomeLega;


    document.getElementById("crediti").innerHTML =
        "Crediti iniziali: " + lega.crediti;


    let lista =
        document.getElementById("listaUtenti");


    lista.innerHTML = "";


    lega.partecipanti.forEach(utente => {

        //=========================================
        // PROTEZIONE APOSTROFI E CARATTERI SPECIALI
        //=========================================

        let nomeSquadraEscapato =
            String(utente.nomeSquadra)
                .replace(/\\/g, "\\\\")
                .replace(/'/g, "\\'");


        lista.innerHTML += `

        <div class="card rigaSquadra">

            <span>
                👤 ${utente.nomeUtente}
            </span>


            <span
                onclick="apriRosa('${nomeSquadraEscapato}')"
                style="
                    cursor:pointer;
                    text-decoration:underline;
                "
                title="Apri rosa">

                🏟 ${utente.nomeSquadra}

            </span>


            <span>
                💰 ${utente.crediti}
            </span>

        </div>

        `;

    });

}


//==================================================
// APRE LA ROSA DELLA SQUADRA SELEZIONATA
//==================================================

function apriRosa(nomeSquadra) {

    localStorage.setItem(
        "rosaDaVisualizzare",
        nomeSquadra
    );


    window.location.href =
        "rose.html";

}



function aggiornaBottoneRose() {

    let bottone =
        document.getElementById("btnTornaRose");

    if (!bottone) {
        return;
    }


    let rosaDaVisualizzare =
        localStorage.getItem(
            "rosaDaVisualizzare"
        );


    if (rosaDaVisualizzare) {

        bottone.innerHTML =
            "🏠 TORNA ALLA HOME";

        bottone.onclick =
            function() {

                localStorage.removeItem(
                    "rosaDaVisualizzare"
                );

                window.location.href =
                    "lega.html";

            };

    }
    else {

        bottone.innerHTML =
            "🔨 TORNA ALL'ASTA";

        bottone.onclick =
            function() {

                window.location.href =
                    "asta.html";

            };

    }

}



//==================================================
// CARICA LE LEGHE NEL MENU
//==================================================


function caricaLeghe() {

    let leghe =
        JSON.parse(
            localStorage.getItem("legheSalvate")
        ) || [];


    let selectLega =
        document.getElementById("lega");


    if (!selectLega) {

        return;

    }


    selectLega.innerHTML = `
        <option value="">
            Seleziona lega
        </option>
    `;


    leghe.forEach(
        (lega, indice) => {

            let option =
                document.createElement(
                    "option"
                );


            option.value =
                indice;


            option.textContent =
                lega.nomeLega;


            selectLega.appendChild(
                option
            );

        }
    );


    //=========================================
    // QUANDO CAMBIO LEGA
    //=========================================

    selectLega.onchange =
        function() {

            caricaUtentiLega();

        };


    //=========================================
    // RECUPERA UTENTE ATTIVO
    //=========================================

    let utenteAttivo =
        JSON.parse(
            localStorage.getItem(
                "utenteAttivo"
            )
        );


    if (
        !utenteAttivo ||
        !utenteAttivo.ricorda
    ) {

        return;

    }


    //=========================================
    // CONTROLLA CHE LA LEGA ESISTA
    //=========================================

    if (
        utenteAttivo.indiceLega < 0 ||
        utenteAttivo.indiceLega >= leghe.length
    ) {

        return;

    }


    //=========================================
    // SELEZIONA LA LEGA
    //=========================================

    selectLega.value =
        utenteAttivo.indiceLega;


    caricaUtentiLega();


    //=========================================
    // SELEZIONA L'UTENTE
    //=========================================

    let selectUtente =
        document.getElementById(
            "utente"
        );


    let ricorda =
        document.getElementById(
            "ricorda"
        );


    if (
        selectUtente &&
        utenteAttivo.indiceUtente >= 0
    ) {

        selectUtente.value =
            utenteAttivo.indiceUtente;


        mostraSquadraUtente();

    }


    //=========================================
    // RIPRISTINA LA SPUNTA
    //=========================================

    if (ricorda) {

        ricorda.checked =
            true;

    }

}

//==================================================
// CARICA GLI UTENTI DELLA LEGA SELEZIONATA
//==================================================

function caricaUtentiLega() {

    let selectLega =
        document.getElementById("lega");


    let selectUtente =
        document.getElementById("utente");


    let inputSquadra =
        document.getElementById("squadra");


    if (
        !selectLega ||
        !selectUtente
    ) {

        return;

    }


    selectUtente.innerHTML = `
        <option value="">
            Seleziona utente
        </option>
    `;


    if (inputSquadra) {

        inputSquadra.value = "";

    }


    if (selectLega.value == "") {

        return;

    }


    let leghe =
        JSON.parse(
            localStorage.getItem("legheSalvate")
        ) || [];


    let indice =
        Number(selectLega.value);


    let lega =
        leghe[indice];


    if (!lega) {

        return;

    }


    lega.partecipanti.forEach(
        (utente, indiceUtente) => {

            let option =
                document.createElement(
                    "option"
                );


            option.value =
                indiceUtente;


            option.textContent =
                utente.nomeUtente;


            selectUtente.appendChild(
                option
            );

        }
    );


    selectUtente.onchange =
        function() {

            mostraSquadraUtente();

        };

}


//==================================================
// MOSTRA LA SQUADRA DELL'UTENTE
//==================================================

function mostraSquadraUtente() {

    let selectLega =
        document.getElementById("lega");


    let selectUtente =
        document.getElementById("utente");


    let inputSquadra =
        document.getElementById("squadra");


    if (
        !selectLega ||
        !selectUtente ||
        !inputSquadra
    ) {

        return;

    }


    inputSquadra.value = "";


    if (
        selectLega.value == "" ||
        selectUtente.value == ""
    ) {

        return;

    }


    let leghe =
        JSON.parse(
            localStorage.getItem("legheSalvate")
        ) || [];


    let lega =
        leghe[
            Number(selectLega.value)
        ];


    if (!lega) {

        return;

    }


    let utente =
        lega.partecipanti[
            Number(selectUtente.value)
        ];


    if (!utente) {

        return;

    }


    inputSquadra.value =
        utente.nomeSquadra;

}


//==================================================
// ENTRA NELLA LEGA
//==================================================

//==================================================
// ENTRA NELLA LEGA
//==================================================

function entra() {

    let indiceLega =
        document.getElementById("lega").value;

    let indiceUtente =
        document.getElementById("utente").value;


    if (indiceLega === "") {

        alert("Selezionare una lega");

        return;

    }


    if (indiceUtente === "") {

        alert("Selezionare un utente");

        return;

    }


    let leghe =
        JSON.parse(
            localStorage.getItem("legheSalvate")
        ) || [];


    let lega =
        leghe[Number(indiceLega)];


    if (!lega) {

        alert("Lega non trovata");

        return;

    }


    let utente =
        lega.partecipanti[
            Number(indiceUtente)
        ];


    if (!utente) {

        alert("Utente non trovato");

        return;

    }


    //=========================================
    // CONTROLLA LA SPUNTA
    //=========================================

    let ricorda =
        document.getElementById("ricorda");


    let ricordare =
        ricorda
            ? ricorda.checked
            : false;


    //=========================================
    // SALVA LA LEGA ATTIVA
    //=========================================

    localStorage.setItem(
        STORAGE.LEGA,
        JSON.stringify(lega)
    );


    //=========================================
    // SALVA UTENTE ATTIVO
    //=========================================

    localStorage.setItem(
        "utenteAttivo",
        JSON.stringify({

            nomeUtente:
                utente.nomeUtente,

            nomeSquadra:
                utente.nomeSquadra,

            indiceLega:
                Number(indiceLega),

            indiceUtente:
                Number(indiceUtente),

            ricorda:
                ricordare

        })
    );


    //=========================================
    // SE NON DEVE RICORDARE
    // CANCELLA EVENTUALE VECCHIO ACCESSO
    //=========================================

    if (!ricordare) {

        localStorage.removeItem(
            "accessoRicordato"
        );

    }


    //=========================================
    // ENTRA NELLA LEGA
    //=========================================

    window.location.href =
        "lega.html";

}


//==================================================
// SELEZIONA GIOCATORE LIBERO
//==================================================


function selezionaGiocatoreLibero(nome, squadraReale) {

    //=========================================
    // CARICA LEGA
    //=========================================

    let lega =
        JSON.parse(
            localStorage.getItem(
                STORAGE.LEGA
            )
        );


    if (!lega) {

        alert(
            "Nessuna lega trovata"
        );

        return;

    }


    //=========================================
    // CARICA GIOCATORI
    //=========================================

    let giocatori =
        JSON.parse(
            localStorage.getItem(
                STORAGE.GIOCATORI
            )
        ) || [];


    //=========================================
    // CERCA IL GIOCATORE
    //=========================================

    let giocatore =
        giocatori.find(
            g =>
                g.nome == nome &&
                g.squadra == squadraReale
        );


    if (!giocatore) {

        alert(
            "Giocatore non trovato"
        );

        return;

    }


    //=========================================
    // CONTROLLA PARTECIPANTI
    //=========================================

    if (
        !Array.isArray(
            lega.partecipanti
        )
    ) {

        alert(
            "Nessuna squadra trovata nella lega"
        );

        return;

    }


    //=========================================
    // CREA POPUP
    //=========================================

    let sfondo =
        document.createElement(
            "div"
        );


    sfondo.style.position =
        "fixed";

    sfondo.style.left =
        "0";

    sfondo.style.top =
        "0";

    sfondo.style.width =
        "100%";

    sfondo.style.height =
        "100%";

    sfondo.style.background =
        "rgba(0,0,0,0.5)";

    sfondo.style.display =
        "flex";

    sfondo.style.alignItems =
        "center";

    sfondo.style.justifyContent =
        "center";

    sfondo.style.zIndex =
        "9999";


    let popup =
        document.createElement(
            "div"
        );


    popup.style.background =
        "white";

    popup.style.padding =
        "15px";

    popup.style.borderRadius =
        "10px";

    popup.style.width =
        "80%";

    popup.style.maxWidth =
        "320px";

    popup.style.boxSizing =
        "border-box";


    popup.innerHTML = `

        <h2>
            Assegna giocatore
        </h2>

        <p>
            <b>${giocatore.nome}</b>
        </p>

        <p>
            Seleziona la squadra:
        </p>

    `;


    //=========================================
    // RADIO SQUADRE
    //=========================================

    lega.partecipanti.forEach(
        (
            partecipante,
            indice
        ) => {

            let riga =
                document.createElement(
                    "label"
                );


            riga.style.display =
                "block";

            riga.style.textAlign =
                "left";

            riga.style.padding =
                "3px 0";

            riga.style.margin =
                "0";

            riga.style.cursor =
                "pointer";


            riga.innerHTML = `

                <span
                    style="
                        display:inline-flex;
                        align-items:center;
                        gap:6px;
                        margin:0;
                        padding:0;
                    "
                >

                    <input
                        type="radio"
                        name="squadraLibera"
                        value="${indice}"
                        style="
                            margin:0;
                            padding:0;
                            width:auto;
                        "
                    >

                    <span>
                        ${partecipante.nomeUtente}
                        &nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                        ${partecipante.nomeSquadra}
                    </span>

                </span>

            `;


            popup.appendChild(
                riga
            );

        }
    );


    //=========================================
    // PREZZO
    //=========================================

    let prezzoLabel =
        document.createElement(
            "p"
        );


    prezzoLabel.innerHTML = `

        <label>

            Prezzo:

            <input
                type="number"
                id="prezzoGiocatoreLibero"
                min="0"
                value="0"
                style="width:80px;"
            >

        </label>

    `;


    popup.appendChild(
        prezzoLabel
    );


    //=========================================
    // PULSANTI
    //=========================================

    let contenitorePulsanti =
        document.createElement(
            "div"
        );


    contenitorePulsanti.style.marginTop =
        "20px";

    contenitorePulsanti.style.display =
        "flex";

    contenitorePulsanti.style.gap =
        "10px";


    let annulla =
        document.createElement(
            "button"
        );


    annulla.innerHTML =
        "ANNULLA";


    annulla.style.backgroundColor =
        "#808080";

    annulla.style.color =
        "white";


    let assegna =
        document.createElement(
            "button"
        );


    assegna.innerHTML =
        "ASSEGNA";


    assegna.style.backgroundColor =
        "#256b2a";

    assegna.style.color =
        "white";


    contenitorePulsanti.appendChild(
        annulla
    );

    contenitorePulsanti.appendChild(
        assegna
    );


    popup.appendChild(
        contenitorePulsanti
    );


    sfondo.appendChild(
        popup
    );


    document.body.appendChild(
        sfondo
    );


    //=========================================
    // ANNULLA
    //=========================================

    annulla.onclick =
        function() {

            sfondo.remove();

        };


    //=========================================
    // ASSEGNA
    //=========================================

    assegna.onclick =
        function() {

            //=========================================
            // SQUADRA SELEZIONATA
            //=========================================

            let radioSelezionato =
                popup.querySelector(
                    'input[name="squadraLibera"]:checked'
                );


            if (!radioSelezionato) {

                alert(
                    "Seleziona una squadra"
                );

                return;

            }


            //=========================================
            // PREZZO
            //=========================================

            let prezzo =
                Number(
                    popup.querySelector(
                        "#prezzoGiocatoreLibero"
                    ).value
                );


            if (
                prezzo <= 0
            ) {

                alert(
                    "Inserisci un prezzo valido"
                );

                return;

            }


            //=========================================
            // PARTECIPANTE
            //=========================================

            let indiceSquadra =
                Number(
                    radioSelezionato.value
                );


            let partecipante =
                lega.partecipanti[
                    indiceSquadra
                ];


            if (!partecipante) {

                alert(
                    "Squadra non trovata"
                );

                return;

            }


            //=========================================
            // CREA ROSA
            //=========================================

            if (
                !Array.isArray(
                    partecipante.rosa
                )
            ) {

                partecipante.rosa =
                    [];

            }


            //=========================================
            // CONTROLLO CREDITI
            //=========================================

            if (
                prezzo >
                partecipante.crediti
            ) {

                alert(
                    "Crediti insufficienti"
                );

                return;

            }


            //=========================================
            // CONTROLLA POSTI DEL RUOLO
            //=========================================

            let limite =
                lega.composizioneRosa[
                    giocatore.ruolo
                ];


            let presenti =
                partecipante.rosa.filter(
                    g =>
                        g.ruolo ==
                        giocatore.ruolo
                );



            //=========================================
            // POSTI PIENI
            //=========================================

            if (
                presenti.length >=
                limite
            ) {

                let conferma =
                    confirm(
                        "Hai terminato i posti per il ruolo " +
                        giocatore.ruolo +
                        ".\n\n" +
                        "Vuoi sostituire un giocatore con " +
                        giocatore.nome +
                        "?\n\n" +
                        "Seleziona il giocatore da sostituire"
                    );


                if (!conferma) {

                    return;

                }


                //=========================================
                // SALVA SOSTITUZIONE IN ATTESA
                //=========================================

                let asta =
                    JSON.parse(
                        localStorage.getItem(
                            STORAGE.ASTA
                        )
                    ) || {};


                asta.sostituzioneInAttesa = {

                    nomeNuovo:
                        giocatore.nome,

                    ruoloNuovo:
                        giocatore.ruolo,

                    squadraRealeNuovo:
                        giocatore.squadra,

                    quotazioneNuovo:
                        giocatore.quotazione,

                    prezzoNuovo:
                        prezzo,

                    nomeUtente:
                        partecipante.nomeUtente,

                    nomeSquadra:
                        partecipante.nomeSquadra

                };


                localStorage.setItem(
                    STORAGE.ASTA,
                    JSON.stringify(
                        asta
                    )
                );


                //=========================================
                // CHIUDE POPUP SVINCOLATI
                //=========================================

                sfondo.remove();


                //=========================================
                // VAI ALLE ROSE
                //=========================================


                window.location.href =
                    "rose.html";


                return;

            }



            //=========================================
            // SCALA CREDITI
            //=========================================

            partecipante.crediti -=
                prezzo;


            //=========================================
            // AGGIUNGE ALLA ROSA
            //=========================================

            partecipante.rosa.push({

                nome:
                    giocatore.nome,

                ruolo:
                    giocatore.ruolo,

                squadra:
                    giocatore.squadra,

                quotazione:
                    giocatore.quotazione,

                prezzo:
                    prezzo

            });


            //=========================================
            // SEGNA COME ACQUISTATO
            //=========================================

            giocatore.acquistado =
                true;

            giocatore.acquistato =
                true;

            giocatore.acquistadoDa =
                partecipante.nomeSquadra;

            giocatore.acquistatoDa =
                partecipante.nomeSquadra;

            giocatore.acquistadoDaUtente =
                partecipante.nomeUtente;

            giocatore.acquistatoDaUtente =
                partecipante.nomeUtente;

            giocatore.prezzoAcquisto =
                prezzo;


            //=========================================
            // SALVA LEGA
            //=========================================

            localStorage.setItem(
                STORAGE.LEGA,
                JSON.stringify(
                    lega
                )
            );


            //=========================================
            // AGGIORNA LISTA GENERALE
            //=========================================

            let indiceGiocatore =
                giocatori.findIndex(
                    g =>
                        g.nome ==
                        giocatore.nome &&
                        g.squadra ==
                        giocatore.squadra
                );


            if (
                indiceGiocatore != -1
            ) {

                giocatori[
                    indiceGiocatore
                ] =
                    giocatore;

            }


            localStorage.setItem(
                STORAGE.GIOCATORI,
                JSON.stringify(
                    giocatori
                )
            );


            //=========================================
            // CHIUDE POPUP
            //=========================================

            sfondo.remove();


            //=========================================
            // CONFERMA
            //=========================================

            alert(

                giocatore.nome +
                " assegnato a " +
                partecipante.nomeSquadra +
                "\n\nPrezzo: " +
                prezzo +
                " crediti"

            );


            //=========================================
            // RICARICA
            //=========================================

            caricaGiocatoriLiberi();

        };

}



function mostraRiparazione() {

    let riparazione =
        document.getElementById("riparazione");

    if (!riparazione) {
        return;
    }

    if (riparazione.style.display === "none") {

        riparazione.style.display = "block";

    } else {

        riparazione.style.display = "none";

    }

}

function attivaModalitaSvincolo() {

    if (modalitaSvincolo) {

        modalitaSvincolo = false;

        let bottone =
            document.getElementById("btnSvincola");

        if (bottone) {
            bottone.style.backgroundColor = "#388E3C";
        }

        return;
    }


    modalitaSvincolo = true;

    let bottone =
        document.getElementById("btnSvincola");

    if (bottone) {
        bottone.style.backgroundColor = "#F39C12";
    }

}


function svincolaGiocatore(
    nome,
    squadra,
    ruolo
) {

    //=========================================
    // CARICA LEGA
    //=========================================

    let lega =
        JSON.parse(
            localStorage.getItem(
                STORAGE.LEGA
            )
        );


    if (!lega) {

        alert(
            "Nessuna lega trovata"
        );

        return;

    }


    //=========================================
    // TROVA LA SQUADRA
    //=========================================

    let squadraObj =
        lega.partecipanti.find(
            p =>
                p.nomeSquadra ==
                squadra
        );


    if (!squadraObj) {

        alert(
            "Squadra non trovata"
        );

        return;

    }


    //=========================================
    // TROVA IL GIOCATORE NELLA ROSA
    //=========================================

    let indice =
        squadraObj.rosa.findIndex(
            g =>
                g.nome ==
                nome &&
                g.ruolo ==
                ruolo
        );


    if (indice == -1) {

        alert(
            "Giocatore non trovato nella rosa"
        );

        return;

    }


    let giocatore =
        squadraObj.rosa[indice];


    //=========================================
    // CONFERMA
    //=========================================

    let conferma =
        confirm(
            "Vuoi svincolare " +
            giocatore.nome +
            "?"
        );


    if (!conferma) {

        return;

    }


    //=========================================
    // RIMUOVE DALLA ROSA
    //=========================================

    squadraObj.rosa.splice(
        indice,
        1
    );


    //=========================================
    // CARICA TUTTI I GIOCATORI
    //=========================================

    let tuttiGiocatori =
        JSON.parse(
            localStorage.getItem(
                STORAGE.GIOCATORI
            )
        ) || [];


    //=========================================
    // RIMETTE IL GIOCATORE TRA GLI SVINCOLATI
    //=========================================

    let indiceGiocatore =
        tuttiGiocatori.findIndex(
            g =>
                g.nome ==
                giocatore.nome &&
                g.squadra ==
                giocatore.squadra
        );


    if (indiceGiocatore != -1) {

        tuttiGiocatori[
            indiceGiocatore
        ].acquistato =
            false;

        tuttiGiocatori[
            indiceGiocatore
        ].acquistatoDa =
            "";

        tuttiGiocatori[
            indiceGiocatore
        ].acquistatoDaUtente =
            "";

        tuttiGiocatori[
            indiceGiocatore
        ].prezzoAcquisto =
            0;

    }


    //=========================================
    // SALVA LEGA
    //=========================================

    localStorage.setItem(
        STORAGE.LEGA,
        JSON.stringify(
            lega
        )
    );


    //=========================================
    // SALVA GIOCATORI
    //=========================================

    localStorage.setItem(
        STORAGE.GIOCATORI,
        JSON.stringify(
            tuttiGiocatori
        )
    );


    //=========================================
    // FINE MODALITÀ SVINCOLO
    //=========================================

    modalitaSvincolo =
        false;

        let bottone =
            document.getElementById("btnSvincola");

        if (bottone) {
            bottone.style.backgroundColor = "#388E3C";
        }


    //=========================================
    // AGGIORNA ROSE
    //=========================================

    caricaRose();

}


function attivaModalitaScambio() {

    modalitaScambio = !modalitaScambio;

    primoScambio = null;

    let bottone =
        document.getElementById("btnScambia");

    if (modalitaScambio) {

        bottone.style.backgroundColor =
            "#F39C12";

    } else {

        bottone.style.backgroundColor =
            "#388E3C";

        document
            .querySelectorAll(
                ".giocatoreSelezionatoScambio"
            )
            .forEach(
                elemento => {

                    elemento.classList.remove(
                        "giocatoreSelezionatoScambio"
                    );

                }
            );
    }
}