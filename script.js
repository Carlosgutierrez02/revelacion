/* =====================================================
   Revelación de Género · script
   ===================================================== */

/* ---------- CONFIG ---------- */
const EVENTO = {
    // 14 de junio de 2026, 3:00 PM hora Colombia (UTC-5)
    inicio:   new Date("2026-06-14T15:00:00-05:00"),
    whatsapp: "573213971526"
};

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

/* ---------- MODAL CONFIRMAR ---------- */
const modal = document.getElementById("modal");

function abrirModal(){
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

function actualizarContador(){
    const rows = peopleList.querySelectorAll(".person-row:not(.removing)");
    const n = rows.length;
    peopleCount.textContent = n === 1 ? "1 persona" : `${n} personas`;

    // Renumerar bullets
    rows.forEach((r, i)=>{
        const b = r.querySelector(".person-bullet");
        if(b) b.textContent = i + 1;
        const inp = r.querySelector(".person-input");
        if(inp){
            inp.placeholder = i === 0 ? "Tu nombre" : `Acompañante ${i}`;
        }
    });

    // Habilitar/deshabilitar botón agregar
    if(n >= MAX_PERSONAS){
        addBtn.classList.add("disabled");
    } else {
        addBtn.classList.remove("disabled");
    }
}

function agregarPersona(){
    const rows = peopleList.querySelectorAll(".person-row:not(.removing)");
    if(rows.length >= MAX_PERSONAS) return;

    const idx = rows.length + 1;
    const row = document.createElement("div");
    row.className = "person-row";
    row.innerHTML = `
        <span class="person-bullet">${idx}</span>
        <input type="text" class="person-input" placeholder="Acompañante ${idx - 1}" required autocomplete="off">
        <button type="button" class="person-remove" aria-label="Quitar">×</button>
    `;
    peopleList.appendChild(row);
    row.querySelector(".person-input").focus();
    actualizarContador();
}

/* Delegación: quitar persona (cualquier × dentro de la lista) */
peopleList.addEventListener("click", (e)=>{
    const btn = e.target.closest(".person-remove");
    if(!btn) return;

    const row = btn.closest(".person-row");
    const visibles = peopleList.querySelectorAll(".person-row:not(.removing)").length;
    if(visibles <= 1) return; // siempre dejar al menos 1

    row.classList.add("removing");
    setTimeout(()=>{
        row.remove();
        actualizarContador();
    }, 250);
});

/* ---------- ENVIAR CONFIRMACIÓN ---------- */
function enviarConfirmacion(e){
    e.preventDefault();

    // Recoger nombres
    const inputs = peopleList.querySelectorAll(".person-input");
    const nombres = Array.from(inputs)
        .map(i => i.value.trim())
        .filter(Boolean);

    if(nombres.length === 0){
        mostrarToast("Escribe al menos un nombre", 2800, true);
        inputs[0]?.focus();
        return;
    }

    const voto = e.target.voto.value;
    if(!voto){
        mostrarToast("Falta tu predicción: ¿Niño o Niña?", 2800, true);
        return;
    }

    const emojiVoto = voto === "Niño" ? "🩵" : "🩷";
    const n = nombres.length;
    const sufijo = n === 1 ? "persona" : "personas";

    // Lista bonita de nombres
    const listaNombres = n === 1
        ? `👤 ${nombres[0]}`
        : `👥 Van ${n} ${sufijo}:\n` + nombres.map(x => `  • ${x}`).join("\n");

    const mensaje =
`Hola 👋✨

Confirmamos nuestra asistencia a la revelación de género 🩷💙

${listaNombres}

🔮 Predicción: ${voto} ${emojiVoto}

📅 14 de junio de 2026
⏰ 3:00 PM
📍 Bosque Popular El Prado

¡Será un gusto acompañarlos! 🤍`;

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

/* ---------- CONFETI (dramático) ---------- */
function lanzarConfeti(){
    if(REDUCED_MOTION) return;
    const cont = document.getElementById("confetti");
    if(!cont) return;

    const colores = [
        "#FFB8C5", "#A8DAE0",          // pasteles
        "#E03E63", "#1E7A89",          // inks vivos
        "#C26B3A", "#8B4A28",          // cobres
        "#F4ECD8", "#E5D4B0",          // creams
        "#FFD93D", "#FF6B9D"           // pop extra (amarillo + rosa fucsia)
    ];
    const formas = ["", "circle", "ribbon"];
    const total  = 180;

    // Ráfaga inicial (todas desde arriba, ancho completo)
    for(let i = 0; i < total; i++){
        spawn(cont, colores, formas, {
            x: Math.random() * 100,            // vw
            dx: (Math.random() - 0.5) * 200,   // px de deriva horizontal
            delay: Math.random() * 0.35,
            dur: 2.5 + Math.random() * 2,
            size: 8 + Math.random() * 14
        });
    }

    // Segunda oleada: bursts laterales para sensación de "explosión"
    setTimeout(()=>{
        for(let i = 0; i < 60; i++){
            spawn(cont, colores, formas, {
                x: (i % 2 === 0 ? -5 : 105),
                dx: (i % 2 === 0 ? 1 : -1) * (200 + Math.random() * 200),
                delay: Math.random() * 0.2,
                dur: 2 + Math.random() * 1.5,
                size: 10 + Math.random() * 12
            });
        }
    }, 200);
}

function spawn(cont, colores, formas, opts){
    const p = document.createElement("div");
    p.className = "confetti-piece " + formas[Math.floor(Math.random() * formas.length)];

    const isRibbon = p.classList.contains("ribbon");
    const w = opts.size;
    const h = isRibbon ? w * 2.2 : (p.classList.contains("circle") ? w : w * 1.4);

    p.style.left   = opts.x + "vw";
    p.style.width  = w + "px";
    p.style.height = h + "px";
    p.style.background = colores[Math.floor(Math.random() * colores.length)];
    p.style.setProperty("--dx", opts.dx + "px");
    p.style.animationDuration = opts.dur + "s";
    p.style.animationDelay    = opts.delay + "s";
    p.style.transform = `rotate(${Math.random() * 360}deg)`;

    cont.appendChild(p);
    setTimeout(()=> p.remove(), (opts.dur + opts.delay + 0.3) * 1000);
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
        cdEls.days.textContent  = "0";
        cdEls.hours.textContent = "0";
        cdEls.mins.textContent  = "0";
        cdEls.secs.textContent  = "0";
        return;
    }

    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor((diff / (1000*60*60)) % 24);
    const m = Math.floor((diff / (1000*60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    cdEls.days.textContent  = d;
    cdEls.hours.textContent = h;
    cdEls.mins.textContent  = m;
    cdEls.secs.textContent  = s;
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

/* Inicializar contador en load */
actualizarContador();
