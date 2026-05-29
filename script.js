/* =====================================================
   Revelación de Género · script
   ===================================================== */

/* ---------- CONFIG ---------- */
const EVENTO = {
    // 14 de junio de 2026, 3:00 PM hora Colombia (UTC-5)
    inicio:   new Date("2026-06-14T15:00:00-05:00"),
    whatsapp: "573213971526"
};

/* Webhook de Google Sheets (Apps Script). Vacío = no se guarda en hoja. */
const SHEETS_URL = "https://script.google.com/macros/s/AKfycbwx2nrbAPC543dOEHFbeI5sHc06wJtcrl-8crCHU9jLixeBqj2dVw9FU6nURPto87p77w/exec";

const MAX_PERSONAS = 15;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- INTRO → MAIN ---------- */
function entrar(){
    const intro = document.getElementById("intro");
    const main  = document.getElementById("main");

    intro.classList.add("hidden");
    setTimeout(()=>{
        main.classList.remove("hidden");
        main.setAttribute("aria-hidden", "false");
        intro.setAttribute("aria-hidden", "true");
    }, REDUCED_MOTION ? 0 : 500);
}

/* ---------- MODAL ---------- */
const modal = document.getElementById("modal");

function abrirModal(){
    if(peopleList.children.length === 0){
        agregarPersona(true); // primera fila
    }
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    setTimeout(()=> document.querySelector(".person-input")?.focus(), 100);
    document.body.style.overflow = "hidden";
}

function cerrarModal(){
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

document.addEventListener("keydown", (e)=>{
    if(e.key === "Escape" && modal.classList.contains("open")){
        cerrarModal();
    }
});

/* ---------- LISTA DINÁMICA DE PERSONAS ---------- */
const peopleList  = document.getElementById("peopleList");
const peopleCount = document.getElementById("peopleCount");
const addBtn      = document.getElementById("addPerson");
const scoreGirl   = document.getElementById("scoreGirl");
const scoreBoy    = document.getElementById("scoreBoy");
const progressBar = document.getElementById("progressBar");
const progressMsg = document.getElementById("progressMsg");
const progressBox = document.getElementById("progress");

const MENSAJES_PROGRESO = {
    vacio:    "Escribe el primer nombre para empezar ✨",
    parcial:  "Falta que cada persona elija su predicción 🩷🩵",
    completo: "¡Listos! Envíanos tu confirmación 🎉"
};

function plantillaPersona(idx, primera){
    const placeholder = idx === 1 ? "Tu nombre" : `Acompañante ${idx - 1}`;
    return `
        <div class="person-row-top">
            <span class="person-bullet">${idx}</span>
            <input type="text" class="person-input" placeholder="${placeholder}" required autocomplete="off">
            <button type="button" class="person-remove" aria-label="Quitar" ${primera ? 'tabindex="-1"' : ''}>×</button>
        </div>
        <div class="person-vote disabled">
            <button type="button" class="vote-pill vote-pill--boy"  data-vote="Niño">🩵 Team Niño</button>
            <button type="button" class="vote-pill vote-pill--girl" data-vote="Niña">🩷 Team Niña</button>
        </div>
    `;
}

function agregarPersona(esPrimera = false){
    const rows = peopleList.querySelectorAll(".person-row:not(.removing)");
    if(rows.length >= MAX_PERSONAS) return;

    const idx = rows.length + 1;
    const row = document.createElement("div");
    row.className = "person-row";
    row.innerHTML = plantillaPersona(idx, esPrimera);
    peopleList.appendChild(row);

    if(!esPrimera){
        row.querySelector(".person-input").focus();
    }
    actualizar();
}

/* Renumera, recalcula contador, scoreboard y progreso */
function actualizar(){
    const rows = peopleList.querySelectorAll(".person-row:not(.removing)");
    const n = rows.length;

    peopleCount.textContent = n === 1 ? "1 persona" : `${n} personas`;

    let nGirl = 0, nBoy = 0, completos = 0;

    rows.forEach((r, i)=>{
        // Renumerar bullet + placeholder
        const b = r.querySelector(".person-bullet");
        if(b) b.textContent = i + 1;
        const inp = r.querySelector(".person-input");
        if(inp){
            inp.placeholder = i === 0 ? "Tu nombre" : `Acompañante ${i}`;
        }

        // Habilitar voto si hay nombre
        const tieneNombre = inp && inp.value.trim().length > 0;
        const voteBox = r.querySelector(".person-vote");
        voteBox.classList.toggle("disabled", !tieneNombre);

        // Contar votos
        const voto = r.dataset.vote;
        if(voto === "Niña") nGirl++;
        else if(voto === "Niño") nBoy++;

        if(tieneNombre && voto) completos++;
    });

    // Habilitar/deshabilitar botón agregar
    addBtn.classList.toggle("disabled", n >= MAX_PERSONAS);

    // Actualizar marcador con animación de "bump"
    actualizarScore(scoreGirl, nGirl);
    actualizarScore(scoreBoy,  nBoy);

    // Barra de progreso
    const pct = n === 0 ? 0 : Math.round((completos / n) * 100);
    progressBar.style.setProperty("--p", pct + "%");
    progressBox.classList.toggle("full", pct === 100 && n > 0);

    if(n === 0 || (n === 1 && !rows[0].querySelector(".person-input").value.trim())){
        progressMsg.textContent = MENSAJES_PROGRESO.vacio;
    } else if(pct === 100){
        progressMsg.textContent = MENSAJES_PROGRESO.completo;
    } else {
        progressMsg.textContent = MENSAJES_PROGRESO.parcial;
    }
}

let scorePrev = { girl: 0, boy: 0 };
function actualizarScore(el, n){
    const prev = parseInt(el.textContent, 10) || 0;
    el.textContent = n;
    if(n !== prev){
        el.classList.remove("bump");
        // reflow para reiniciar animación
        void el.offsetWidth;
        el.classList.add("bump");
        setTimeout(()=> el.classList.remove("bump"), 400);
    }
}

/* ---------- DELEGACIÓN: input, voto, quitar ---------- */
peopleList.addEventListener("input", (e)=>{
    if(e.target.matches(".person-input")) actualizar();
});

peopleList.addEventListener("click", (e)=>{
    const row = e.target.closest(".person-row");
    if(!row) return;

    // Quitar persona
    if(e.target.closest(".person-remove")){
        const visibles = peopleList.querySelectorAll(".person-row:not(.removing)").length;
        if(visibles <= 1) return;
        row.classList.add("removing");
        setTimeout(()=>{ row.remove(); actualizar(); }, 250);
        return;
    }

    // Voto
    const pill = e.target.closest(".vote-pill");
    if(pill){
        const voteBox = pill.closest(".person-vote");
        if(voteBox.classList.contains("disabled")) return;

        const voto = pill.dataset.vote;
        row.dataset.vote = voto;

        // Marcar pill seleccionada
        voteBox.querySelectorAll(".vote-pill").forEach(p => p.classList.remove("selected"));
        pill.classList.add("selected");

        // Chispitas
        chispitas(pill, voto === "Niña" ? "#E03E63" : "#1E7A89");

        actualizar();
    }
});

/* ---------- CHISPITAS al votar ---------- */
function chispitas(target, color){
    if(REDUCED_MOTION) return;
    const rect = target.getBoundingClientRect();
    const host = target;
    host.style.position = "relative"; // por si acaso

    for(let i = 0; i < 8; i++){
        const s = document.createElement("span");
        s.className = "sparkle";
        s.style.setProperty("--sc", color);
        const ang = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.4;
        const dist = 28 + Math.random() * 22;
        s.style.setProperty("--dx", (Math.cos(ang) * dist) + "px");
        s.style.setProperty("--dy", (Math.sin(ang) * dist - 8) + "px");
        s.style.setProperty("--rot", (Math.random() * 360) + "deg");
        host.appendChild(s);
        setTimeout(()=> s.remove(), 1000);
    }
}

/* ---------- ENVIAR CONFIRMACIÓN ---------- */
function enviarConfirmacion(e){
    e.preventDefault();

    const rows = Array.from(peopleList.querySelectorAll(".person-row:not(.removing)"));
    const datos = rows.map(r => ({
        nombre: r.querySelector(".person-input").value.trim(),
        voto:   r.dataset.vote || null
    }));

    // Validaciones
    const sinNombre = datos.findIndex(d => !d.nombre);
    if(sinNombre >= 0){
        mostrarToast("Falta un nombre 🙊", 2800, true);
        rows[sinNombre].querySelector(".person-input").focus();
        return;
    }
    const sinVoto = datos.findIndex(d => !d.voto);
    if(sinVoto >= 0){
        const nombre = datos[sinVoto].nombre;
        mostrarToast(`${nombre} aún no escoge su predicción 🤔`, 2800, true);
        rows[sinVoto].querySelector(".vote-pill")?.focus();
        return;
    }

    const n = datos.length;
    const nGirl = datos.filter(d => d.voto === "Niña").length;
    const nBoy  = datos.filter(d => d.voto === "Niño").length;

    // Lista bonita: "• Carlos — Team Niña 🩷"
    const lineas = datos.map(d => {
        const emo = d.voto === "Niña" ? "🩷" : "🩵";
        return `• ${d.nombre} — Team ${d.voto} ${emo}`;
    }).join("\n");

    const encabezado = n === 1
        ? "Confirmo mi asistencia"
        : `Confirmamos nuestra asistencia (${n} personas)`;

    const marcador = (nGirl > 0 && nBoy > 0)
        ? `\n📊 Nuestro marcador:\n🩷 Niña: ${nGirl}  ·  🩵 Niño: ${nBoy}\n`
        : "";

    const mensaje =
`Hola 👋✨

${encabezado} a la revelación de género 🩷💙

${lineas}
${marcador}
📅 14 de junio de 2026
⏰ 3:00 PM
📍 Bosque Popular El Prado

¡Será un gusto acompañarlos! 🤍`;

    // Guardar en Google Sheets (fire-and-forget, no bloquea WhatsApp)
    guardarEnSheets({
        total:    n,
        teamGirl: nGirl,
        teamBoy:  nBoy,
        detalle:  datos.map(d => `${d.nombre}: ${d.voto}`).join(" | "),
        nombres:  datos.map(d => d.nombre).join(", ")
    });

    // FX
    lanzarConfeti();
    document.querySelector(".card")?.classList.add("pop");
    setTimeout(()=> document.querySelector(".card")?.classList.remove("pop"), 600);

    cerrarModal();
    mostrarToast("¡Confirmado! Abriendo WhatsApp…");

    const url = "https://api.whatsapp.com/send?phone=" + EVENTO.whatsapp +
                "&text=" + encodeURIComponent(mensaje);

    setTimeout(()=>{ window.open(url, "_blank", "noopener"); }, 1400);
}

/* ---------- BACKEND: GOOGLE SHEETS ---------- */
function guardarEnSheets(payload){
    if(!SHEETS_URL) return;
    try {
        // text/plain evita preflight CORS; no-cors deja pasar el POST sin leer la respuesta.
        fetch(SHEETS_URL, {
            method:  "POST",
            mode:    "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body:    JSON.stringify(payload),
            keepalive: true  // por si la pestaña se cierra antes de terminar
        });
    } catch (err) {
        // Silencioso. WhatsApp es el respaldo principal.
        console.warn("[Sheets] no se pudo registrar:", err);
    }
}

/* ---------- TOAST ---------- */
let toastTimer;
function mostrarToast(texto, duracion = 2500, esError = false){
    const t = document.getElementById("toast");
    if(!t) return;
    t.textContent = texto;
    t.classList.toggle("error", esError);
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> t.classList.remove("show"), duracion);
}

/* ---------- CONFETI (corazones + puntos + estrellas, vaivén suave) ---------- */
function lanzarConfeti(){
    if(REDUCED_MOTION) return;
    const cont = document.getElementById("confetti");
    if(!cont) return;

    const paletaPasteles = [
        "#FFB8C5", "#FFD3DC", "#FF9FB3",
        "#A8DAE0", "#C2E8ED", "#8FCFD8",
        "#F4ECD8"
    ];
    const paletaAcentos = ["#FFD93D", "#FFC857", "#C26B3A"];
    const formas = [
        "heart","heart","heart","heart","heart","heart",
        "dot","dot","dot",
        "star"
    ];

    const total = 110;
    for(let i = 0; i < total; i++){
        const esAcento = Math.random() < 0.18;
        const color = esAcento
            ? paletaAcentos[Math.floor(Math.random() * paletaAcentos.length)]
            : paletaPasteles[Math.floor(Math.random() * paletaPasteles.length)];

        spawnConfetti(cont, color, formas, {
            x:     Math.random() * 100,
            sway:  20 + Math.random() * 40,
            delay: Math.random() * 1.2,
            dur:   4 + Math.random() * 2.5,
            size:  10 + Math.random() * 14
        });
    }
}

function spawnConfetti(cont, color, formas, opts){
    const forma = formas[Math.floor(Math.random() * formas.length)];
    const p = document.createElement("div");
    p.className = "confetti-piece " + forma;

    const size = forma === "star" ? opts.size * 0.85 : opts.size;

    p.style.left   = opts.x + "vw";
    p.style.width  = size + "px";
    p.style.height = size + "px";
    p.style.setProperty("--c",    color);
    p.style.setProperty("--sway", opts.sway + "px");
    p.style.animationDuration = opts.dur + "s";
    p.style.animationDelay    = opts.delay + "s";

    cont.appendChild(p);
    setTimeout(()=> p.remove(), (opts.dur + opts.delay + 0.4) * 1000);
}

/* ---------- COUNTDOWN ---------- */
const cdEls = {
    days:  document.getElementById("cdDays"),
    hours: document.getElementById("cdHours"),
    mins:  document.getElementById("cdMins"),
    secs:  document.getElementById("cdSecs"),
    cont:  document.getElementById("countdown")
};

function actualizarCountdown(){
    if(!cdEls.cont) return;
    const diff = EVENTO.inicio.getTime() - Date.now();

    if(diff <= 0){
        cdEls.cont.classList.add("finished");
        cdEls.days.textContent = cdEls.hours.textContent = cdEls.mins.textContent = cdEls.secs.textContent = "0";
        return;
    }

    cdEls.days.textContent  = Math.floor(diff / (1000*60*60*24));
    cdEls.hours.textContent = Math.floor((diff / (1000*60*60)) % 24);
    cdEls.mins.textContent  = Math.floor((diff / (1000*60)) % 60);
    cdEls.secs.textContent  = Math.floor((diff / 1000) % 60);
}
actualizarCountdown();
setInterval(actualizarCountdown, 1000);

/* ---------- ANIMACIÓN BIBERONES (fondo) ---------- */
const bg = document.getElementById("cardBg");
const MAX_ICONS = 30;
let intervalo = null;
let activos = 0;

function crearTetero(){
    if(!bg || activos >= MAX_ICONS) return;

    const div = document.createElement("div");
    div.classList.add("icon");

    const img = document.createElement("img");
    img.src = "img/biberon.png";
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    div.appendChild(img);

    const size = 20 + Math.random()*30;
    div.style.width   = size + "px";
    div.style.left    = Math.random()*bg.offsetWidth + "px";
    div.style.opacity = 0.2 + Math.random()*0.4;

    let y   = -60;
    let rot = Math.random()*360;
    const speed    = 1 + Math.random()*2;
    const rotSpeed = (Math.random()-0.5)*2;

    bg.appendChild(div);
    activos++;

    function animar(){
        y   += speed;
        rot += rotSpeed;
        div.style.transform = `translateY(${y}px) rotate(${rot}deg)`;
        if(y < bg.offsetHeight + 80){
            requestAnimationFrame(animar);
        }else{
            div.remove();
            activos--;
        }
    }
    requestAnimationFrame(animar);
}

function arrancarAnimacion(){
    if(REDUCED_MOTION) return;
    if(intervalo) return;
    intervalo = setInterval(crearTetero, 700);
}
function pararAnimacion(){
    if(!intervalo) return;
    clearInterval(intervalo);
    intervalo = null;
}

document.addEventListener("visibilitychange", ()=>{
    if(document.hidden) pararAnimacion();
    else arrancarAnimacion();
});

arrancarAnimacion();

/* Render inicial */
agregarPersona(true);
