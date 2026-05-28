/* =====================================================
   Revelación de Género · script
   ===================================================== */

/* ---------- CONFIG ---------- */
const EVENTO = {
    // 14 de junio de 2026, 3:00 PM hora Colombia (UTC-5)
    inicio:   new Date("2026-06-14T15:00:00-05:00"),
    whatsapp: "573213971526"
};

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
    setTimeout(()=> document.getElementById("fNombre")?.focus(), 100);
    document.body.style.overflow = "hidden";
}

function cerrarModal(){
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

/* Cerrar modal con ESC */
document.addEventListener("keydown", (e)=>{
    if(e.key === "Escape" && modal.classList.contains("open")){
        cerrarModal();
    }
});

/* ---------- ENVIAR CONFIRMACIÓN ---------- */
function enviarConfirmacion(e){
    e.preventDefault();
    const form = e.target;

    const nombre   = form.nombre.value.trim();
    const personas = parseInt(form.personas.value, 10) || 1;
    const voto     = form.voto.value;

    if(!nombre || !voto){
        mostrarToast("Por favor completa todos los campos");
        return;
    }

    const emojiVoto = voto === "Niño" ? "🩵" : "🩷";
    const sufijoPersonas = personas === 1 ? "persona" : "personas";

    const mensaje =
`Hola 👋✨

Confirmo mi asistencia a la revelación de género 🩷💙

👤 ${nombre}
👥 ${personas} ${sufijoPersonas}
🔮 Mi predicción: ${voto} ${emojiVoto}

📅 14 de junio de 2026
⏰ 3:00 PM

¡Será un gusto acompañarlos! 🤍`;

    // Confeti + cierre + WhatsApp
    lanzarConfeti();
    cerrarModal();
    mostrarToast("¡Confirmado! Abriendo WhatsApp…");

    const url = "https://api.whatsapp.com/send?phone=" + EVENTO.whatsapp +
                "&text=" + encodeURIComponent(mensaje);

    setTimeout(()=>{ window.open(url, "_blank", "noopener"); }, 1200);
}

/* ---------- TOAST ---------- */
let toastTimer;
function mostrarToast(texto, duracion = 2500){
    const t = document.getElementById("toast");
    if(!t) return;
    t.textContent = texto;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> t.classList.remove("show"), duracion);
}

/* ---------- CONFETI ---------- */
function lanzarConfeti(){
    if(REDUCED_MOTION) return;
    const cont = document.getElementById("confetti");
    if(!cont) return;

    const colores = ["#fed0d6", "#d5eef1", "#B59E7D", "#F1EADA", "#CEC1A8", "#b46476", "#5a8a93"];
    const total = 70;

    for(let i = 0; i < total; i++){
        const p = document.createElement("div");
        p.className = "confetti-piece";
        p.style.left = Math.random() * 100 + "vw";
        p.style.background = colores[Math.floor(Math.random() * colores.length)];
        p.style.width  = (6 + Math.random() * 6) + "px";
        p.style.height = (10 + Math.random() * 10) + "px";
        p.style.animationDuration = (2 + Math.random() * 1.5) + "s";
        p.style.animationDelay    = (Math.random() * 0.3) + "s";
        p.style.transform = `rotate(${Math.random()*360}deg)`;
        cont.appendChild(p);
        setTimeout(()=> p.remove(), 4000);
    }
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
setInterval(actualizarCountdown, 1000); // cada segundo

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
