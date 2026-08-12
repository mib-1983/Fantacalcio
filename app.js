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


// ==============================
// Helpers per localStorage sicuro
// ==============================
function safeGetJSON(key) {
    try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : null;
    } catch (e) {
        console.warn("Errore parsing localStorage key:", key, e);
        // rimuovo la chiave corrotta per evitare crash ricorrenti
        localStorage.removeItem(key);
        return null;
    }
}

function safeSetJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error("Errore scrittura localStorage key:", key, e);
    }
}

// ==============================
// HTML escaping helper
// ==============================
function escapeHTML(str) {
    return String(str === undefined || str === null ? "" : str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


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
        safeGetJSON("legheSalvate") || [];


    legheSalvate.push(lega);


    safeSetJSON("legheSalvate", legheSalvate);


    //=========================================
    // RENDE QUESTA LA LEGA ATTIVA
    //=========================================

    safeSetJSON(
        STORAGE.LEGA,
        lega
    );


    alert(
        "Lega creata correttamente"
    );


    window.location.href =
        "lega.html";

}

//==================================================
// ASTA - CARICAMENTO ACQUIRENTI
//==================================================

function caricaAcquirenti() {

    let lega =
        safeGetJSON(STORAGE.LEGA);


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
        safeGetJSON(STORAGE.LEGA);


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

//==================================================
// LETTURA FILE EXCEL GIOCATORI
// (usata sia per il caricamento iniziale
// che per il mercato di riparazione)
//==================================================

function leggiExcelGiocatori(file, callback) {

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


        callback(giocatori);

    };


    lettore.readAsArrayBuffer(file);

}


function caricaGiocatoriExcel() {

    let file =
        document.getElementById("fileGiocatori").files[0];


    if (!file) {

        alert("Selezionare un file Excel");

        return;

    }


    leggiExcelGiocatori(file, function(giocatori) {

        safeSetJSON(
            STORAGE.GIOCATORI,
            giocatori
        );


        alert(
            "Caricati " +
            giocatori.length +
            " giocatori"
        );

    });

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
        safeGetJSON(STORAGE.ASTA);


    let giocatori =
        safeGetJSON(STORAGE.GIOCATORI);


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
        safeGetJSON(
            STORAGE.ASTA
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


    safeSetJSON(
        STORAGE.ASTA,
        asta
    );

}

//==================================================
// SEGNA IL RUOLO CORRENTE COME TERMINATO
// (usata sia con avviso che senza)
//==================================================

function segnaRuoloTerminato() {

    if (
        indiceCorrente !=
        listaGiocatoriAsta.length - 1
    ) {

        return null;

    }


    let asta =
        safeGetJSON(STORAGE.ASTA);


    if (!asta) {

        return null;

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


    safeSetJSON(
        STORAGE.ASTA,
        asta
    );


    return asta;

}


//==================================================
// CONTROLLO FINE ASTA DEL RUOLO
//==================================================

function controllaFineAstaRuolo() {

    let asta =
        segnaRuoloTerminato();


    if (asta) {

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

        controllaFineAstaRuolo();

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


function aggiornaLegaSalvata(lega) {


    let legheSalvate =
        safeGetJSON("legheSalvate") || [];


    let indice =
        legheSalvate.findIndex(
            l =>
                l.nomeLega ==
                lega.nomeLega
        );


    if (indice != -1) {

        legheSalvate[indice] =
            JSON.parse(
                JSON.stringify(lega)
            );

    }


    safeSetJSON(
        "legheSalvate",
        legheSalvate
    );

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
        safeGetJSON(STORAGE.LEGA);


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
        safeGetJSON(
            STORAGE.GIOCATORI
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
    // CORREZIONE: dichiaro vecchiaSquadra nello scope della funzione
    let vecchiaSquadra = null;

    if (giocatoreGiaAcquistato) {

        vecchiaSquadra =
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

            // Combined confirm message (replaces previous separate confirm + alert)
            let conferma =
                confirm(
                    "Hai terminato i posti per il ruolo " +
                    giocatore.ruolo +
                    ".\n\n" +
                    "Vuoi acquistare comunque il giocatore " +
                    giocatore.nome +
                    " e scegliere chi sostituire?\n\n" +
                    "Se confermi verrai reindirizzato alle rose per selezionare il giocatore da sostituire."
                );


            if (!conferma) {

                // Ripristina la vecchia assegnazione

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

                return;

            }


            //=========================================
            // SALVA ACQUISTO IN ATTESA
            //=========================================

            let asta =
                safeGetJSON(
                    STORAGE.ASTA
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


            safeSetJSON(
                STORAGE.ASTA,
                asta
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


            safeSetJSON(
                STORAGE.LEGA,
                lega
            );

            aggiornaLegaSalvata(lega);

            // NOTE: il vecchio alert è stato rimosso, la conferma precedente ora contiene tutte le informazioni.
            // Si reindirizza direttamente alle rose per selezionare il giocatore da sostituire.
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

    safeSetJSON(
        STORAGE.LEGA,
        lega
    );

    aggiornaLegaSalvata(lega);


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


    safeSetJSON(
        STORAGE.GIOCATORI,
        tuttiGiocatori
    );


    document.getElementById(
        "prezzoFinale"
    ).value = 0;


    //=========================================
    // FINE ASTA
    //=========================================

    segnaRuoloTerminato();


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
        safeGetJSON(
            STORAGE.LEGA
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
        safeGetJSON(
            STORAGE.GIOCATORI
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


    safeSetJSON(
        STORAGE.GIOCATORI,
        tuttiGiocatori
    );


    safeSetJSON(
        STORAGE.LEGA,
        lega
    );


    // Senza questo l'annullo si perde
    // rientrando dal login
    aggiornaLegaSalvata(lega);


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
// BANNER SOSTITUZIONE IN ATTESA
//==================================================

function mostraBannerSostituzione() {

    let banner =
        document.getElementById(
            "bannerSostituzione"
        );


    let asta =
        safeGetJSON(
            STORAGE.ASTA
        );


    let sostituzione =
        asta
            ? asta.sostituzioneInAttesa
            : null;


    //=========================================
    // NESSUNA SOSTITUZIONE IN ATTESA
    // RIMUOVE IL BANNER SE PRESENTE
    //=========================================

    if (!sostituzione) {

        if (banner) {

            banner.remove();

        }

        return;

    }


    //=========================================
    // CREA IL BANNER SE NON C'È ANCORA
    //=========================================

    if (!banner) {

        banner =
            document.createElement("div");

        banner.id =
            "bannerSostituzione";

        banner.className =
            "bannerSostituzione";


        let contenitore =
            document.getElementById(
                "contenitoreRose"
            );

        if (contenitore && contenitore.parentNode) {
            contenitore.parentNode.insertBefore(
                banner,
                contenitore
            );
        }

    }

    // Uso escapeHTML per evitare XSS
    banner.innerHTML = `

        ⚠️ Sostituzione in attesa per
        <b>${escapeHTML(sostituzione.nomeSquadra)}</b>:
        clicca nella sua rosa il giocatore
        da sostituire con
        <b>${escapeHTML(sostituzione.nomeNuovo)}</b>
        (${escapeHTML(sostituzione.prezzoNuovo) } crediti).

        <button
            type="button"
            id="btnAnnullaSostituzione"
        >
            ❌ Annulla sostituzione
        </button>

    `;

    const btnAnnulla = document.getElementById("btnAnnullaSostituzione");
    if (btnAnnulla) {
        btnAnnulla.addEventListener("click", annullaSostituzioneInAttesa);
    }

}


function annullaSostituzioneInAttesa() {

    let conferma =
        confirm(
            "Annullare la sostituzione in attesa?"
        );


    if (!conferma) {

        return;

    }


    let asta =
        safeGetJSON(
            STORAGE.ASTA
        );


    if (!asta) {

        return;

    }


    delete asta.sostituzioneInAttesa;


    safeSetJSON(
        STORAGE.ASTA,
        asta
    );


    caricaRose();

}

//==================================================
// CARICA ROSE
//==================================================

function caricaRose() {

    let lega =
        safeGetJSON(
            STORAGE.LEGA
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
    // SOSTITUZIONE IN ATTESA
    // (mostra un banner con pulsante annulla
    // finché resta in sospeso, così non blocca
    // per sempre i click sui giocatori)
    //=========================================

    mostraBannerSostituzione();


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
    // CREA TABELLA (uso innerHTML per layout ma ESCAPPO tutti i contenuti dinamici)
    //=========================================

    let html = `

    <div class="contenitoreTabellaRose">

    <table class="tabellaRose">

    <colgroup>

    <col class="colRuolo">

    `;


    partecipantiDaMostrare.forEach(() => {

        html += `

        <col class="colNome">
        <col class="colSquadra">
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

            <th colspan="3">
                ${escapeHTML(squadra.nomeSquadra)}
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

            <td colspan="3">
                ${escapeHTML(String(squadra.crediti))}
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

                        // uso data-attributes e escape dei valori
                        html += `

                        <td>

                            <div class="nomeGiocatore ${
                                giocatore.fuoriLista
                                    ? 'giocatoreFuoriLista'
                                    : ''
                            }"
                                data-nome="${escapeHTML(giocatore.nome)}"
                                data-squadra="${escapeHTML(squadra.nomeSquadra)}"
                                data-ruolo="${escapeHTML(giocatore.ruolo)}"
                            >

                                ${escapeHTML(giocatore.nome)}

                            </div>

                        </td>

                        <td>

                            ${escapeHTML(giocatore.squadra)}

                        </td>

                        <td>

                            <div class="costoGiocatore">

                                ${escapeHTML(String(giocatore.prezzo))}

                            </div>

                        </td>

                        `;

                    }
                    else {

                        html += `

                        <td></td>
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

    </div>
    
    `;


    contenitore.innerHTML =
        html;


    // dopo aver inserito la tabella, colleghiamo gli event listener ai .nomeGiocatore
    document
        .querySelectorAll(".nomeGiocatore")
        .forEach(el => {
            el.addEventListener("click", function() {
                const nome = this.dataset.nome;
                const squadra = this.dataset.squadra;
                const ruolo = this.dataset.ruolo;
                cliccaGiocatoreRosa(nome, squadra, ruolo);
            });
        });

}

//==================================================
// GIOCATORI LIBERI
//==================================================

function caricaGiocatoriLiberi() {

    let giocatori =
        safeGetJSON(
            STORAGE.GIOCATORI
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

        <span class="badgeRuolo ${escapeHTML(g.ruolo)}">
        ${escapeHTML(g.ruolo)}
        </span>

        </td>

        <td
            class="nomeGiocatore"
            data-nome="${escapeHTML(g.nome)}"
            data-squadra="${escapeHTML(g.squadra)}"
        >
            ${escapeHTML(g.nome)}
        </td>

        <td>
        ${escapeHTML(g.squadra)}
        </td>

        <td>
        ${escapeHTML(String(g.quotazione))}
        </td>

        </tr>

        `;

    });


    html += `

    </table>

    `;


    contenitore.innerHTML =
        html;


    // Aggiungo listener ai nomi per aprire popup
    document
        .querySelectorAll("#listaGiocatoriLiberi .nomeGiocatore")
        .forEach(el => {
            el.style.cursor = "pointer";
            el.addEventListener("click", function() {
                const nome = this.dataset.nome;
                const squadra = this.dataset.squadra;
                selezionaGiocatoreLibero(nome, squadra);
            });
        });


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
                <option value="${escapeHTML(s)}">
                ${escapeHTML(s)}
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
        safeGetJSON(
            STORAGE.LEGA
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


    safeSetJSON(
        STORAGE.LEGA,
        lega
    );


    // Senza questo lo scambio si perde
    // rientrando dal login
    aggiornaLegaSalvata(lega);


    //=========================================
    // AGGIORNA GIOCATORI
    //=========================================

    let tuttiGiocatori =
        safeGetJSON(
            STORAGE.GIOCATORI
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


    safeSetJSON(
        STORAGE.GIOCATORI,
        tuttiGiocatori
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
        safeGetJSON(
            STORAGE.ASTA
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


    safeSetJSON(
        STORAGE.ASTA,
        asta
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
        safeGetJSON(
            STORAGE.LEGA
        );


    if (!lega) {

        alert(
            "Nessuna lega trovata"
        );

        return;

    }


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


    leggiExcelGiocatori(file, function(giocatori) {

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


        safeSetJSON(
            STORAGE.LEGA,
            lega
        );


        // Senza questo i crediti aggiunti e i flag
        // fuoriLista si perdono rientrando dal login
        aggiornaLegaSalvata(lega);


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

        safeSetJSON(
            STORAGE.GIOCATORI,
            giocatoriDisponibili
        );


        //=========================================
        // AZZERA ASTA PRECEDENTE
        //=========================================

        let asta =
            safeGetJSON(
                STORAGE.ASTA
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


        safeSetJSON(
            STORAGE.ASTA,
            asta
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

    });

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
        safeGetJSON(
            STORAGE.ASTA
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


    safeSetJSON(
        STORAGE.ASTA,
        asta
    );


    window.location.href =
        "asta-live.html";

}

//==================================================
// AGGIORNA RUOLI ASTA
//==================================================

function aggiornaRuoliAsta() {

    let asta =
        safeGetJSON(
            STORAGE.ASTA
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
        safeGetJSON(
            STORAGE.ASTA
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
        safeGetJSON(
            STORAGE.LEGA
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
        safeGetJSON(
            STORAGE.GIOCATORI
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

    safeSetJSON(
        STORAGE.LEGA,
        lega
    );

    aggiornaLegaSalvata(lega);

    safeSetJSON(
        STORAGE.GIOCATORI,
        tuttiGiocatori
    );


    //=========================================
    // CANCELLA SOSTITUZIONE PENDENTE
    //=========================================

    delete asta.sostituzioneInAttesa;


    safeSetJSON(
        STORAGE.ASTA,
        asta
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
        escapeHTML(lega.nomeLega);


    document.getElementById("crediti").innerHTML =
        "Crediti iniziali: " + escapeHTML(String(lega.crediti));


    let lista =
        document.getElementById("listaUtenti");


    lista.innerHTML = "";


    lega.partecipanti.forEach(utente => {

        // costruisco elementi DOM invece di usare innerHTML per evitare XSS

        const card = document.createElement("div");
        card.className = "card rigaSquadra";

        const spanUser = document.createElement("span");
        spanUser.textContent = `👤 ${utente.nomeUtente}`;
        card.appendChild(spanUser);

        const spanStadium = document.createElement("span");
        spanStadium.style.cursor = "pointer";
        spanStadium.style.textDecoration = "underline";
        spanStadium.title = "Apri rosa";
        spanStadium.textContent = ` ${utente.nomeSquadra}`;
        spanStadium.addEventListener("click", () => apriRosa(utente.nomeSquadra));
        card.appendChild(spanStadium);

        const spanCredit = document.createElement("span");
        spanCredit.textContent = `💰 ${utente.crediti}`;
        card.appendChild(spanCredit);

        lista.appendChild(card);

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


//==================================================
// CARICA LE LEGHE NEL MENU
//==================================================


function caricaLeghe() {

    let leghe =
        safeGetJSON("legheSalvate") || [];


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
        safeGetJSON(
            "utenteAttivo"
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
        safeGetJSON("legheSalvate") || [];


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
        safeGetJSON("legheSalvate") || [];


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
        safeGetJSON("legheSalvate") || [];


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

    safeSetJSON(
        STORAGE.LEGA,
        lega
    );


    //=========================================
    // SALVA UTENTE ATTIVO
    //=========================================

    safeSetJSON(
        "utenteAttivo",
        {

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

        }
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
    // carica dati
    let lega = safeGetJSON(STORAGE.LEGA);
    if (!lega) {
        alert("Nessuna lega trovata");
        return;
    }

    let giocatori = safeGetJSON(STORAGE.GIOCATORI) || [];

    let giocatore = giocatori.find(g => g.nome == nome && g.squadra == squadraReale);
    if (!giocatore) {
        alert("Giocatore non trovato");
        return;
    }

    if (!Array.isArray(lega.partecipanti)) {
        alert("Nessuna squadra trovata nella lega");
        return;
    }

    // popup base
    let sfondo = document.createElement("div");
    sfondo.style.position = "fixed";
    sfondo.style.left = "0";
    sfondo.style.top = "0";
    sfondo.style.width = "100%";
    sfondo.style.height = "100%";
    sfondo.style.background = "rgba(0,0,0,0.5)";
    sfondo.style.display = "flex";
    sfondo.style.alignItems = "center";
    sfondo.style.justifyContent = "center";
    sfondo.style.zIndex = "9999";

    let popup = document.createElement("div");
    popup.style.background = "white";
    popup.style.padding = "15px";
    popup.style.borderRadius = "10px";
    popup.style.width = "80%";
    popup.style.maxWidth = "480px";
    popup.style.boxSizing = "border-box";

    const h2 = document.createElement("h2");
    h2.textContent = "Assegna giocatore";
    popup.appendChild(h2);

    const pNome = document.createElement("p");
    pNome.innerHTML = `<b>${escapeHTML(giocatore.nome)}</b>`;
    popup.appendChild(pNome);

    const infoAssign = document.createElement("p");
    popup.appendChild(infoAssign);

    // se è stata impostata una origine di svincolo, usiamola come selezione automatica
    const svincoloOrigine = localStorage.getItem('svincoloOrigine');
    let partecipantiToShow = lega.partecipanti;
    let autoSelectedPartecipante = null;

    if (svincoloOrigine) {
        const filtered = lega.partecipanti.filter(p => p.nomeSquadra === svincoloOrigine);
        if (filtered.length > 0) {
            partecipantiToShow = filtered;
            autoSelectedPartecipante = filtered[0];
            infoAssign.innerHTML = `Assegnerai il giocatore alla squadra: <b>${escapeHTML(autoSelectedPartecipante.nomeSquadra)}</b>`;
        } else {
            // se l'origine non esiste più, rimuovila e mostra tutte le squadre
            localStorage.removeItem('svincoloOrigine');
            infoAssign.textContent = "Seleziona la squadra:";
            partecipantiToShow = lega.partecipanti;
        }
    } else {
        infoAssign.textContent = "Seleziona la squadra:";
    }

    // container per radio (mostrato solo se non c'è selezione automatica)
    const radiosContainer = document.createElement("div");
    if (!autoSelectedPartecipante) {
        partecipantiToShow.forEach((partecipante, indice) => {
            let label = document.createElement("label");
            label.style.display = "block";
            label.style.textAlign = "left";
            label.style.padding = "3px 0";
            label.style.margin = "0";
            label.style.cursor = "pointer";

            const spanWrap = document.createElement("span");
            spanWrap.style.display = "inline-flex";
            spanWrap.style.alignItems = "center";
            spanWrap.style.gap = "6px";

            const inputRadio = document.createElement("input");
            inputRadio.type = "radio";
            inputRadio.name = "squadraLibera";
            inputRadio.value = String(indice);
            inputRadio.style.margin = "0";

            const spanText = document.createElement("span");
            spanText.textContent = `${partecipante.nomeUtente} - ${partecipante.nomeSquadra}`;
            spanText.style.whiteSpace = "nowrap";
            spanText.style.display = "inline-block";

            spanWrap.appendChild(inputRadio);
            spanWrap.appendChild(spanText);
            label.appendChild(spanWrap);

            radiosContainer.appendChild(label);
        });
        popup.appendChild(radiosContainer);
    }

    // prezzo
    let prezzoLabel = document.createElement("p");
    prezzoLabel.innerHTML = `
        <label>
            Prezzo:
            <input type="number" id="prezzoGiocatoreLibero" min="0" value="0" style="width:80px;">
        </label>
    `;
    popup.appendChild(prezzoLabel);

    // pulsanti
    let contenitorePulsanti = document.createElement("div");
    contenitorePulsanti.style.marginTop = "20px";
    contenitorePulsanti.style.display = "flex";
    contenitorePulsanti.style.gap = "10px";

    let annulla = document.createElement("button");
    annulla.innerHTML = "ANNULLA";
    annulla.style.backgroundColor = "#808080";
    annulla.style.color = "white";

    let assegna = document.createElement("button");
    assegna.innerHTML = "ASSEGNA";
    assegna.style.backgroundColor = "#256b2a";
    assegna.style.color = "white";

    contenitorePulsanti.appendChild(annulla);
    contenitorePulsanti.appendChild(assegna);
    popup.appendChild(contenitorePulsanti);

    sfondo.appendChild(popup);
    document.body.appendChild(sfondo);

    annulla.onclick = function() {
        // rimuoviamo la chiave di origine solo se impostata (l'utente ha annullato il flusso)
        if (svincoloOrigine) localStorage.removeItem('svincoloOrigine');
        sfondo.remove();
    };

    assegna.onclick = function() {
        // determinare la squadra scelta
        let partecipante = null;

        if (autoSelectedPartecipante) {
            partecipante = autoSelectedPartecipante;
        } else {
            let radioSelezionato = popup.querySelector('input[name="squadraLibera"]:checked');
            if (!radioSelezionato) {
                alert("Seleziona una squadra");
                return;
            }
            let indiceSelezionato = Number(radioSelezionato.value);
            partecipante = partecipantiToShow[indiceSelezionato];
        }

        if (!partecipante) {
            alert("Squadra non trovata");
            return;
        }

        let prezzo = Number(popup.querySelector("#prezzoGiocatoreLibero").value);
        if (isNaN(prezzo) || prezzo <= 0) {
            alert("Inserisci un prezzo valido");
            return;
        }

        if (!Array.isArray(partecipante.rosa)) partecipante.rosa = [];

        if (prezzo > partecipante.crediti) {
            alert("Crediti insufficienti");
            return;
        }

        let limite = lega.composizioneRosa[giocatore.ruolo];
        let presenti = partecipante.rosa.filter(g => g.ruolo == giocatore.ruolo);

        if (presenti.length >= limite) {
            let conferma = confirm(
                "Hai terminato i posti per il ruolo " +
                giocatore.ruolo +
                ".\n\n" +
                "Vuoi assegnare comunque il giocatore " +
                giocatore.nome +
                " e scegliere chi sostituire?\n\n" +
                "Se confermi, verrai reindirizzato alle Rose per selezionare il giocatore da sostituire."
            );

            if (!conferma) return;

            let asta = safeGetJSON(STORAGE.ASTA) || {};
            asta.sostituzioneInAttesa = {
                nomeNuovo: giocatore.nome,
                ruoloNuovo: giocatore.ruolo,
                squadraRealeNuovo: giocatore.squadra,
                quotazioneNuovo: giocatore.quotazione,
                prezzoNuovo: prezzo,
                nomeUtente: partecipante.nomeUtente,
                nomeSquadra: partecipante.nomeSquadra
            };
            safeSetJSON(STORAGE.ASTA, asta);

            // rimuoviamo svincoloOrigine: il flusso prosegue sulle Rose
            if (svincoloOrigine) localStorage.removeItem('svincoloOrigine');

            sfondo.remove();
            window.location.href = "rose.html";
            return;
        }

        // eseguire assegnazione diretta
        partecipante.crediti -= prezzo;
        partecipante.rosa.push({
            nome: giocatore.nome,
            ruolo: giocatore.ruolo,
            squadra: giocatore.squadra,
            quotazione: giocatore.quotazione,
            prezzo: prezzo
        });

        giocatore.acquistato = true;
        giocatore.acquistatoDa = partecipante.nomeSquadra;
        giocatore.acquistatoDaUtente = partecipante.nomeUtente;
        giocatore.prezzoAcquisto = prezzo;

        // salva dati
        safeSetJSON(STORAGE.LEGA, lega);

        // rimuoviamo svincoloOrigine
        if (svincoloOrigine) localStorage.removeItem('svincoloOrigine');

        let indiceGiocatore = giocatori.findIndex(g => g.nome == giocatore.nome && g.squadra == giocatore.squadra);
        if (indiceGiocatore != -1) giocatori[indiceGiocatore] = giocatore;
        safeSetJSON(STORAGE.GIOCATORI, giocatori);

        sfondo.remove();

        // Aggiorna lista svincolati se visibile (non tocca la visualizzazione delle Rose)
        if (document.getElementById('listaGiocatoriLiberi') && typeof caricaGiocatoriLiberi === 'function') {
            caricaGiocatoriLiberi();
        }
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
        safeGetJSON(
            STORAGE.LEGA
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
        safeGetJSON(
            STORAGE.GIOCATORI
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

    safeSetJSON(
        STORAGE.LEGA,
        lega
    );


    //=========================================
    // SALVA GIOCATORI
    //=========================================

    safeSetJSON(
        STORAGE.GIOCATORI,
        tuttiGiocatori
    );


    //=========================================
    // AGGIORNA LEGA SALVATA
    //=========================================

    aggiornaLegaSalvata(lega);

    // salva origine svincolo per il flusso di assegnazione sui svincolati
    localStorage.setItem('svincoloOrigine', squadraObj.nomeSquadra);

    //=========================================
    // FINE MODALITÀ SVINCOLO
    //=========================================

    modalitaSvincolo = false;

    let bottone =
        document.getElementById("btnSvincola");

    if (bottone) {
        bottone.style.backgroundColor =
            "#388E3C";
    }


    //=========================================
    // AGGIORNA LISTA SVINCOLATI SE PRESENTE
    //=========================================
    // Se la pagina corrente contiene l'elenco degli svincolati,
    // aggiorniamo subito il DOM chiamando caricaGiocatoriLiberi().
    // Altrimenti navighiamo alla pagina degli svincolati.
    try {
        if (document.getElementById('listaGiocatoriLiberi') && typeof caricaGiocatoriLiberi === 'function') {
            caricaGiocatoriLiberi();
            return;
        }
    } catch (e) {
        // se qualcosa va storto non blocchiamo il flusso
        console.debug("Aggiornamento lista svincolati fallito:", e);
    }

    // Comportamento originale: vai agli svincolati (silenzioso)
    window.location.href = "giocatori-liberi.html";

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


function apriMiaRosa() {

    let utenteAttivo =
        JSON.parse(
            localStorage.getItem(
                "utenteAttivo"
            )
        );

    if (!utenteAttivo) {

        alert("Nessun utente attivo");

        return;

    }

    if (!utenteAttivo.nomeSquadra) {

        alert("Squadra dell'utente non trovata");

        return;

    }

    localStorage.setItem(
        "rosaDaVisualizzare",
        utenteAttivo.nomeSquadra
    );

    window.location.href =
        "rose.html";
}



//==================================================
// LA MIA ROSA
//==================================================

function apriMiaRosa() {

    let utenteAttivo =
        JSON.parse(
            localStorage.getItem(
                "utenteAttivo"
            )
        );


    if (!utenteAttivo) {

        alert(
            "Utente attivo non trovato"
        );

        return;

    }


    if (!utenteAttivo.nomeSquadra) {

        alert(
            "Nome squadra non trovato"
        );

        return;

    }


    localStorage.setItem(
        "rosaDaVisualizzare",
        utenteAttivo.nomeSquadra
    );


    window.location.href =
        "rose.html";

}


//==================================================
// TUTTE LE ROSE
//==================================================



function apriTutteLeRose() {

    localStorage.removeItem(
        "rosaDaVisualizzare"
    );

    location.href =
        "rose.html";
}

