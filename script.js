/* =====================================================
   Revelación de Género · script
   ===================================================== */

/* ---------- CONFIG ---------- */
const EVENTO = {
    titulo:    "Revelación de Género · Marisol & Andrés Felipe",
    descripcion:"¿Niña o Niño? Acompáñanos en este momento tan especial.",
    lugar:     "Bosque Popular El Prado",
    // 14 de junio de 2026, 3:00 PM hora Colombia (UTC-5)
    inicio:    new Date("2026-06-14T15:00:00-05:00"),
    duracionHoras: 4,
    whatsapp:  "573213971526"
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

/* ---------- CONFIRMAR (WhatsApp) ---------- */
function confirmar(){
    const mensaje = `Hola 👋✨

Confirmo mi asistencia a la revelación de género 🩷💙

📅 14 de junio de 2026
⏰ 3:00 PM

Será un gusto acompañarlos 🤍`;

    mostrarToast("Abriendo WhatsApp…");

    const url = "https://api.whatsapp.com/send?phone=" + EVENTO.whatsapp +
                "&text=" + encodeURIComponent(mensaje);

    setTimeout(()=>{ window.open(url, "_blank", "noopener"); }, 400);
}

/* ---------- AGREGAR AL CALENDARIO (.ics) ---------- */
function agregarCalendario(){
    const fmt = (d)=> d.toISOString().replace(/[-:]|\.\d{3}/g, "");

    const fin = new Date(EVENTO.inicio.getTime() + EVENTO.duracionHoras*60*60*1000);

    const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Revelacion//ES",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        "UID:revelacion-" + Date.now() + "@local",
        "DTSTAMP:" + fmt(new Date()),
        "DTSTART:" + fmt(EVENTO.inicio),
        "DTEND:"   + fmt(fin),
        "SUMMARY:" + EVENTO.titulo,
        "DESCRIPTION:" + EVENTO.descripcion,
        "LOCATION:" + EVENTO.lugar,
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = "revelacion-genero.ics";
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1000);

    mostrarToast("Evento descargado · ábrelo en tu calendario");
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

/* ---------- COUNTDOWN ---------- */
const cdEls = {
    days:  document.getElementById("cdDays"),
    hours: document.getElementById("cdHours"),
    mins:  document.getElementById("cdMins"),
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
        return;
    }

    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor((diff / (1000*60*60)) % 24);
    const m = Math.floor((diff / (1000*60)) % 60);

    cdEls.days.textContent  = d;
    cdEls.hours.textContent = h;
    cdEls.mins.textContent  = m;
}
actualizarCountdown();
setInterval(actualizarCountdown, 30000); // cada 30s

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
    div.style.width = size + "px";
    div.style.left  = Math.random()*bg.offsetWidth + "px";
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

/* Pausa cuando la pestaña no está visible (batería + perf) */
document.addEventListener("visibilitychange", ()=>{
    if(document.hidden) pararAnimacion();
    else arrancarAnimacion();
});

arrancarAnimacion();
