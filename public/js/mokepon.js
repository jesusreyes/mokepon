const btnMascotaJugador = document.getElementById('boton-mascota');
const btnReiniciar = document.getElementById('boton-reiniciar');

const spanMascotaJugador = document.getElementById('mascota-jugador');
const spanMascotaEnemigo = document.getElementById('mascota-enemigo');
const spanVidasJugador = document.getElementById('vidas-jugador');
const spanVidasEnemigo = document.getElementById('vidas-enemigo');

const ataquesDelJugador = document.getElementById('ataques-del-jugador');
const ataquesDelEnemigo = document.getElementById('ataques-del-enemigo');

const sectionSeleccionarMascota = document.getElementById('seleccionar-mascota');
const sectionSeleccionarAtaque = document.getElementById('seleccionar-ataque');
const seccionMensaje = document.getElementById('resultado');
const sectionReiniciar = document.getElementById('reiniciar');
const sectionVerMapa = document.getElementById('ver-mapa');

const contenedorTarjetas = document.getElementById('contenedorTarjetas');
const contenedorAtaques = document.getElementById('contenedor-ataques');

const HIPODOGE_ATAQUES =    [
    {nombre: '💧', id:'btn-agua'},
    {nombre: '💧', id:'btn-agua'},
    {nombre: '💧', id:'btn-agua'},
    {nombre: '🔥', id:'btn-fuego'},
    {nombre: '🌱', id:'btn-tierra'}
];
const CAPIPEPO_ATAQUES =    [
    {nombre: '🌱', id:'btn-tierra'},
    {nombre: '🌱', id:'btn-tierra'},
    {nombre: '🌱', id:'btn-tierra'},
    {nombre: '💧', id:'btn-agua'},
    {nombre: '🔥', id:'btn-fuego'}
];
const RATIGUEYA_ATAQUES =    [
    {nombre: '🔥', id:'btn-fuego'},
    {nombre: '🔥', id:'btn-fuego'},
    {nombre: '🔥', id:'btn-fuego'},
    {nombre: '💧', id:'btn-agua'},
    {nombre: '🌱', id:'btn-tierra'}
];


const mapa = document.getElementById('mapa');

let jugadorId = null;
let enemigoId = null;
let mokepones = [];
let mokeponesEnemigos = [];
let opcionDeMokepones;
let inputHipodoge;
let inputCapipepo;
let inputRatigueya;
let btnAgua;
let btnTierra;
let btnFuego;
let botones = [];
let ataquesMokepon;
let ataqueJugador = [];
let ataqueEnemigo = [];
let ataquesMokeponEnemigo = [];
let victoriasJugador = 0;
let victoriasEnemigo = 0;
let mascotaJugador;
let mascotaJugadorObjeto;
let indexAtaqueJugador;
let indexAtaqueEnemigo;
let mapaBackground = new Image();
mapaBackground.src = './assets/mokemap.png'
let lienzo = mapa.getContext("2d");
let alturaBuscada;
let anchoDelMapa = window.innerWidth - 20;
let anchoMaximoMapa = 375;
let intervalo;

if (anchoDelMapa > anchoMaximoMapa) {
    anchoDelMapa = anchoMaximoMapa - 20;
}

alturaBuscada = anchoDelMapa * 600 / 800;
mapa.width = anchoDelMapa;
mapa.height = alturaBuscada;

class Mokepon {
    constructor(nombre, foto, vida, fotoMapa, id = null ) {
        this.id = id;
        this.nombre = nombre;
        this.foto = foto;
        this.vida = vida;
        this.ataques = [];
        this.ancho = 50;
        this.alto = 50;
        this.x = aleatorio(0, mapa.width - this.ancho);
        this.y = aleatorio(0, mapa.height - this.alto);
        this.mapaFoto = new Image();
        this.mapaFoto.src = fotoMapa;
        this.velocidadX = 0;
        this.velocidadY = 0;
    }
    pintarMokepon(){
        lienzo.drawImage(
            this.mapaFoto,
            this.x,
            this.y,
            this.ancho,
            this.alto,
        );
    }
}

let hipodoge = new Mokepon('Hipodoge', './assets/mokepons_mokepon_hipodoge_attack.png', 5, './assets/hipodoge.png');
let capipepo = new Mokepon('Capipepo', './assets/mokepons_mokepon_capipepo_attack.png', 5, './assets/capipepo.png');
let ratigueya = new Mokepon('Ratigueya', './assets/mokepons_mokepon_ratigueya_attack.png', 5, './assets/ratigueya.png');


hipodoge.ataques.push(...HIPODOGE_ATAQUES);
capipepo.ataques.push(...CAPIPEPO_ATAQUES);
ratigueya.ataques.push(...RATIGUEYA_ATAQUES);

mokepones.push(hipodoge, capipepo, ratigueya);

function iniciarJuego(){
    showAtaqueSection(false);
    showReiniciarSection(false);
    showMapaSection(false);
    
    btnMascotaJugador.addEventListener('click', seleccionarMascotaJugador);
    btnReiniciar.addEventListener('click', reiniciarJuego);

    unirseAlJuego();
}

function unirseAlJuego(){
    fetch('http://jesus-reyes.local:8080/unirse')
        .then(function (res){
            if(res.ok){
                res.text()
                    .then(function (respuesta){
                        jugadorId = respuesta;
                    });
            }
        });
}

function seleccionarMascotaJugador(){
    if(inputHipodoge.checked) {
        spanMascotaJugador.innerHTML = inputHipodoge.id;
        mascotaJugador = inputHipodoge.id;
    }
    else if(inputCapipepo.checked) {
        spanMascotaJugador.innerHTML = inputCapipepo.id;
        mascotaJugador = inputCapipepo.id;
    }
    else if(inputRatigueya.checked) {
        spanMascotaJugador.innerHTML = inputRatigueya.id;
        mascotaJugador = inputRatigueya.id;
    }
    else {
        alert('Selecciona una mascota.');
        return
    }

    seleccionarMokepon(mascotaJugador);
    extraerAtaques(mascotaJugador);

    if(spanMascotaJugador.innerHTML != '') {
        showMascotaSection(false);
        showAtaqueSection(false);
        showMapaSection(true);
        iniciarMapa();
    }
}

function seleccionarMokepon(mascotaJugador) {
    fetch(`http://jesus-reyes.local:8080/mokepon/${jugadorId}`, {
        method: 'post',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            mokepon: mascotaJugador
        })
    });
}

function extraerAtaques(mascotaJugador) {
    let ataques = [];
    for (let i = 0; i < mokepones.length; i++) {
        if(mascotaJugador === mokepones[i].nombre){
            ataques = mokepones[i].ataques;
        }
    }
    mostrarAtaques(ataques);
}

function mostrarAtaques(ataques){
    ataques.forEach((ataque)=>{
        ataquesMokepon = `<button id="${ataque.id}" class="boton-ataque BAtaque">${ataque.nombre}</button>`;
        contenedorAtaques.innerHTML += ataquesMokepon;
    });

    btnAgua = document.getElementById('btn-agua');
    btnTierra = document.getElementById('btn-tierra');
    btnFuego = document.getElementById('btn-fuego');
    botones = document.querySelectorAll('.BAtaque')
}

function seleccionarMascotaEnemigo(enemigo){
    showMascotaSection(false);
    
    let mascotaAleatoria = aleatorio(0, mokepones.length - 1);
    spanMascotaEnemigo.innerHTML = enemigo.nombre;
    ataquesMokeponEnemigo = enemigo.ataques;

    secuenciaAtaque();
}

function secuenciaAtaque(){
    botones.forEach((boton)=>{
        boton.addEventListener('click',(e) => {
            
            if(e.target.textContent === '🔥'){
                ataqueJugador.push('FUEGO');
                boton.style.background = '#2C74B3'
                boton.disabled = true;
            } else if(e.target.textContent === '💧'){
                ataqueJugador.push('AGUA');
                boton.style.background = '#2C74B3'
                boton.disabled = true;
            } else {
                ataqueJugador.push('TIERRA');
                boton.style.background = '#2C74B3'
                boton.disabled = true;
            }
            if(ataqueJugador.length === 5) {
                enviarAtaques()
            }
        });
    });
}

function enviarAtaques(){
    fetch(`http://jesus-reyes.local:8080/mokepon/${jugadorId}/ataques`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ataques: ataqueJugador
        })
    });
    intervalo = setInterval(obtenerAtaques, 50);
}

function obtenerAtaques(){
    fetch(`http://jesus-reyes.local:8080/mokepon/${enemigoId}/ataques`)
        .then(function (res){
            if(res.ok){
                res.json()
                    .then(function ({ataques}){
                        if(ataques.length === 5) {
                            ataqueEnemigo = ataques
                            combate();
                        }
                    })
            }
        });
}

function aleatorio(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function ataqueAleatorioEnemigo(){
    let ataqueAleatorio = aleatorio(0, ataquesMokeponEnemigo.length - 1);

    switch (ataqueAleatorio) {
        case 1:
        case 0:
            ataqueEnemigo.push('FUEGO');
            break;
        case 3:
        case 4:        
            ataqueEnemigo.push('AGUA');
            break;
        default:
            ataqueEnemigo.push('TIERRA');
            break;
    }
    iniciarPelea();
}

function iniciarPelea() {
    if(ataqueJugador.length === 5) {
        combate();
    }
}

function indexAmbosOponentes(index) {
    indexAtaqueJugador = ataqueJugador[index];
    indexAtaqueEnemigo = ataqueEnemigo[index];
}

function combate(){
    clearInterval(intervalo);

    for (let index = 0; index < ataqueJugador.length; index++) {
        indexAmbosOponentes(index);
        
        if(ataqueJugador[index] === ataqueEnemigo[index]) {
            crearMensaje('EMPATE');
            spanVidasEnemigo.innerHTML = victoriasEnemigo;
            spanVidasJugador.innerHTML = victoriasJugador;
        }else if(indexAtaqueJugador === 'FUEGO' && indexAtaqueEnemigo === 'TIERRA'){
            crearMensaje('GANASTE');
            victoriasJugador++;
            spanVidasJugador.innerHTML = victoriasJugador;
        } else if (indexAtaqueJugador === 'AGUA' && indexAtaqueEnemigo === 'FUEGO'){
            crearMensaje('GANASTE');
            victoriasJugador++;
            spanVidasJugador.innerHTML = victoriasJugador;
        } else if (indexAtaqueJugador === 'TIERRA' && indexAtaqueEnemigo === 'AGUA'){
            crearMensaje('GANASTE');
            victoriasJugador++;
            spanVidasJugador.innerHTML = victoriasJugador;
        } else {
            crearMensaje('PERDISTE');
            victoriasEnemigo++;
            spanVidasEnemigo.innerHTML = victoriasEnemigo;
        }
    }

    revisarVictorias();
}

function revisarVictorias() {
    if(victoriasJugador === victoriasEnemigo) {
        crearMensajeFinal('Esto es un empate!!! 🙌');
    } else if(victoriasJugador > victoriasEnemigo){
        crearMensajeFinal('Felicidades!!! 🥳🎉 GANASTE!!!');
    } else {
        crearMensajeFinal('Lo sentimos, PERDISTE!!! 😟😭');
    }
}

function crearMensaje(resultado){
    let nuevoAtaqueDelJugador = document.createElement('p');
    let nuevoAtaqueDelEnemigo = document.createElement('p');

    seccionMensaje.innerHTML = resultado;
    nuevoAtaqueDelJugador.innerHTML = indexAtaqueJugador;
    nuevoAtaqueDelEnemigo.innerHTML = indexAtaqueEnemigo;
    ataquesDelJugador.appendChild(nuevoAtaqueDelJugador);
    ataquesDelEnemigo.appendChild(nuevoAtaqueDelEnemigo);
}

function crearMensajeFinal(resultadoFinal){
    seccionMensaje.innerHTML = resultadoFinal;
    showReiniciarSection(true);
}   

function showMascotaSection(show) {
    sectionSeleccionarMascota.style.display = show ? 'block' : 'none';
}

function showAtaqueSection(show) {
    sectionSeleccionarAtaque.style.display = show ? 'flex' : 'none';
    
    mokepones.forEach((mokepon)=> {
        opcionDeMokepones = `
        <input type="radio" name="mascota" id="${mokepon.nombre}">
            <label for="${mokepon.nombre}" class="tarjeta-de-mokepon">
                <p>${mokepon.nombre}</p>
                <img src="${mokepon.foto}" alt="${mokepon.nombre}">
            </label>`;

        contenedorTarjetas.innerHTML += opcionDeMokepones;

        inputHipodoge = document.getElementById('Hipodoge');
        inputCapipepo = document.getElementById('Capipepo');
        inputRatigueya = document.getElementById('Ratigueya');
    });
}

function showReiniciarSection(show) {
    sectionReiniciar.style.display = show ? 'block' : 'none';
}

function showMapaSection(show) {
    sectionVerMapa.style.display = show ? 'flex' : 'none';
}

function reiniciarJuego() {
    location.reload();
}

function pintarCanvas() {
    mascotaJugadorObjeto.x = mascotaJugadorObjeto.x + mascotaJugadorObjeto.velocidadX;
    mascotaJugadorObjeto.y = mascotaJugadorObjeto.y + mascotaJugadorObjeto.velocidadY;
    lienzo.clearRect(0, 0, mapa.clientWidth, mapa.height);
    lienzo.drawImage(
        mapaBackground,
        0,
        0,
        mapa.width,
        mapa.height
    )
    mascotaJugadorObjeto.pintarMokepon();

    enviarPosicion(mascotaJugadorObjeto.x, mascotaJugadorObjeto.y)

    mokeponesEnemigos.forEach(function (mokepon){
        if(mokepon !== null){
            mokepon.pintarMokepon();
            revisarColision(mokepon);
        }
    });
}

function enviarPosicion(x, y) {
    fetch(`http://jesus-reyes.local:8080/mokepon/${jugadorId}/posicion`,{
        method: 'post',
        headers: {
             'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            x,
            y
        })
    })
    .then(function (res){
        if(res.ok){
            res.json()
            .then(function ({enemigos}){
                mokeponesEnemigos = enemigos.map(function (enemigo){
                    let mokeponEnemigo = null;
                    if(typeof(enemigo.mokepon) !== 'undefined'){
                        const mokeponNombre = enemigo.mokepon.nombre || '';
                        if(mokeponNombre === 'Hipodoge'){
                            mokeponEnemigo = new Mokepon('Hipodoge', './assets/mokepons_mokepon_hipodoge_attack.png', 5, './assets/hipodoge.png',enemigo.id);
                        } else if (mokeponNombre === 'Capipepo') {
                            mokeponEnemigo = new Mokepon('Hipodoge', './assets/mokepons_mokepon_capipepo_attack.png', 5, './assets/capipepo.png',enemigo.id);
                        } else if(mokeponNombre === 'Ratigueya') {
                            mokeponEnemigo = new Mokepon('Hipodoge', './assets/mokepons_mokepon_ratigueya_attack.png', 5, './assets/ratigueya.png',enemigo.id);
                        }
                        if(mokeponNombre !== ''){
                            mokeponEnemigo.x = enemigo.x;
                            mokeponEnemigo.y = enemigo.y;
                        }
                    }
                    return mokeponEnemigo;
                });
            });
        }
    });
}

function moverDerecha(){
    mascotaJugadorObjeto.velocidadX = 5;
}

function moverIzquierda(){
    mascotaJugadorObjeto.velocidadX = -5;
}

function moverArriba(){
    mascotaJugadorObjeto.velocidadY = -5;
}

function moverAbajo(){
    mascotaJugadorObjeto.velocidadY = 5;
}

function detenerMovimiento() {
    mascotaJugadorObjeto.velocidadX = 0;
    mascotaJugadorObjeto.velocidadY = 0;
}

function sePresionoTecla(event){
    switch (event.key) {
        case 'ArrowUp':
            moverArriba();
            break;
        case 'ArrowDown':
            moverAbajo();
            break;
        case 'ArrowLeft':
            moverIzquierda();
            break;
        case 'ArrowRight':
            moverDerecha();
            break;
        default:
            break;
    }
}

function iniciarMapa() {
    mascotaJugadorObjeto = obtenerObjetoMascota(mascotaJugador);
    intervalo = setInterval(pintarCanvas, 40);
    window.addEventListener('keydown', sePresionoTecla);
    window.addEventListener('keyup', detenerMovimiento);
}

function obtenerObjetoMascota() {
    for (let i = 0; i < mokepones.length; i++) {
        if(mascotaJugador === mokepones[i].nombre){
           return mokepones[i];
        }
    }
}

function revisarColision(enemigo) {
    const arribaEnemigo = enemigo.y;
    const abajoEnemigo = enemigo.y + enemigo.alto;
    const derechaEnemigo = enemigo.x + enemigo.ancho;
    const izquierdaEnemigo = enemigo.x;
    const arribaMascota = mascotaJugadorObjeto.y;
    const abajoMascota = mascotaJugadorObjeto.y + mascotaJugadorObjeto.alto;
    const derechaMascota = mascotaJugadorObjeto.x + mascotaJugadorObjeto.ancho;
    const izquierdaMascota = mascotaJugadorObjeto.x;

    if (abajoMascota < arribaEnemigo || arribaMascota > abajoEnemigo || 
        derechaMascota < izquierdaEnemigo || izquierdaMascota > derechaEnemigo) {
            return;
    }
    detenerMovimiento();
    clearInterval(intervalo);
    enemigoId = enemigo.id;
    seleccionarMascotaEnemigo(enemigo);
    showAtaqueSection(true);
    showMapaSection(false);
}

window.addEventListener('load', iniciarJuego );