const EVENT = {
    date: new Date("2026-08-16T14:00:00-05:00"),
    place: "Salón de eventos Iglesia Morrogacho"
};

const intro = document.getElementById("intro");
const invitation = document.getElementById("invitation");
const openInvitation = document.getElementById("openInvitation");
const printPdf = document.getElementById("printPdf");
const toast = document.getElementById("toast");
const hero = document.querySelector(".hero");
const introSparkles = document.querySelector(".intro__sparkles");
const skyPieces = document.querySelector(".sky-pieces");
const scrollProgress = document.getElementById("scrollProgress");
const sectionLinks = Array.from(document.querySelectorAll(".section-dots a"));
const snapSections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const countdown = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
};

function showInvitation() {
    intro.classList.add("is-hidden");
    invitation.classList.remove("is-hidden");
    invitation.setAttribute("aria-hidden", "false");
    burstSparkles();
    window.setTimeout(() => {
        invitation.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
}

function updateCountdown() {
    const remaining = EVENT.date.getTime() - Date.now();
    const total = Math.max(remaining, 0);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / (1000 * 60)) % 60);
    const seconds = Math.floor((total / 1000) % 60);

    countdown.days.textContent = String(days);
    countdown.hours.textContent = String(hours).padStart(2, "0");
    countdown.minutes.textContent = String(minutes).padStart(2, "0");
    countdown.seconds.textContent = String(seconds).padStart(2, "0");
}

function whatsappUrl() {
    const message = [
        "Hola, confirmo mi asistencia al Baby Shower de Neithan.",
        "",
        "Qué alegría poder acompañarlos en este momento tan especial.",
        "Fecha: Domingo 16 de agosto de 2026",
        "Hora: 2:00 PM",
        `Lugar: ${EVENT.place}`,
        "",
        "Gracias por invitarme a celebrar su llegada."
    ].join("\n");

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

function confirmAttendance(event) {
    event.preventDefault();
    showToast("Abriendo WhatsApp para confirmar...");
    window.setTimeout(() => {
        window.open(whatsappUrl(), "_blank", "noopener");
    }, 450);
}

function prepareForPrint() {
    invitation.classList.remove("is-hidden");
    invitation.setAttribute("aria-hidden", "false");
    document.querySelectorAll("[data-reveal]").forEach((item) => {
        item.classList.add("is-visible");
    });
}

let toastTimer;
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function updateScrollProgress() {
    if (!scrollProgress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max <= 0 ? 0 : (window.scrollY / max) * 100;
    scrollProgress.style.setProperty("--progress", `${Math.min(progress, 100)}%`);
}

function makeSparkleLayer(host, amount) {
    if (!host || reduceMotion) return;

    for (let i = 0; i < amount; i += 1) {
        const spark = document.createElement("span");
        spark.className = "spark";
        spark.style.setProperty("--x", `${Math.random() * 100}%`);
        spark.style.setProperty("--y", `${Math.random() * 100}%`);
        spark.style.setProperty("--s", `${6 + Math.random() * 14}px`);
        spark.style.setProperty("--delay", `${Math.random() * 3}s`);
        spark.style.setProperty("--dur", `${2.4 + Math.random() * 3.8}s`);
        spark.style.setProperty("--c", Math.random() > 0.35 ? "#f8d94a" : "#b7b8bd");
        host.appendChild(spark);
    }
}

function makeFloatingPieces() {
    if (!skyPieces || reduceMotion) return;

    const colors = ["#f8d94a", "#fff2a8", "#ffffff", "#b7b8bd", "#ffb899"];
    for (let i = 0; i < 28; i += 1) {
        const piece = document.createElement("span");
        piece.className = "sky-piece";
        piece.style.setProperty("--x", `${Math.random() * 100}vw`);
        piece.style.setProperty("--s", `${8 + Math.random() * 14}px`);
        piece.style.setProperty("--dx", `${-60 + Math.random() * 120}px`);
        piece.style.setProperty("--dur", `${8 + Math.random() * 9}s`);
        piece.style.setProperty("--delay", `${Math.random() * -14}s`);
        piece.style.setProperty("--o", `${0.3 + Math.random() * 0.55}`);
        piece.style.setProperty("--r", Math.random() > 0.45 ? "50%" : "2px");
        piece.style.setProperty("--c", colors[Math.floor(Math.random() * colors.length)]);
        skyPieces.appendChild(piece);
    }
}

function burstSparkles() {
    if (reduceMotion) return;

    for (let i = 0; i < 18; i += 1) {
        const spark = document.createElement("span");
        spark.className = "spark";
        spark.style.setProperty("--x", `${38 + Math.random() * 24}%`);
        spark.style.setProperty("--y", `${34 + Math.random() * 24}%`);
        spark.style.setProperty("--s", `${10 + Math.random() * 18}px`);
        spark.style.setProperty("--delay", `${Math.random() * 0.22}s`);
        spark.style.setProperty("--dur", `${0.9 + Math.random() * 0.6}s`);
        intro.appendChild(spark);
        window.setTimeout(() => spark.remove(), 1600);
    }
}

let lastTrail = 0;
function setupCursorTrail() {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;

    window.addEventListener("pointermove", (event) => {
        const now = performance.now();
        if (now - lastTrail < 52) return;
        lastTrail = now;

        const trail = document.createElement("span");
        trail.className = "cursor-trail";
        trail.style.setProperty("--x", `${event.clientX}px`);
        trail.style.setProperty("--y", `${event.clientY}px`);
        document.body.appendChild(trail);
        window.setTimeout(() => trail.remove(), 850);
    }, { passive: true });
}

function setupReveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (reduceMotion || !("IntersectionObserver" in window)) {
        items.forEach((item) => item.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.18 });

    items.forEach((item) => observer.observe(item));
}

function setupSectionDots() {
    if (!sectionLinks.length || !snapSections.length) return;

    const setActive = (id) => {
        sectionLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
        });
    };

    setActive(snapSections[0].id);

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
            setActive(visible.target.id);
        }
    }, {
        threshold: [0.35, 0.55, 0.75],
        rootMargin: "-12% 0px -12% 0px"
    });

    snapSections.forEach((section) => observer.observe(section));
}

function setupHeroMotion() {
    if (!hero || reduceMotion) return;

    hero.addEventListener("pointermove", (event) => {
        const rect = hero.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 16;
        hero.style.setProperty("--mx", `${x}px`);
        hero.style.setProperty("--my", `${y}px`);
    });

    hero.addEventListener("pointerleave", () => {
        hero.style.setProperty("--mx", "0px");
        hero.style.setProperty("--my", "0px");
    });
}

openInvitation.addEventListener("click", showInvitation);
printPdf?.addEventListener("click", () => {
    prepareForPrint();
    window.print();
});
document.getElementById("confirmTop").addEventListener("click", confirmAttendance);
document.getElementById("confirmBottom").addEventListener("click", confirmAttendance);
window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("beforeprint", prepareForPrint);

makeSparkleLayer(introSparkles, 24);
makeFloatingPieces();
setupReveal();
setupHeroMotion();
setupCursorTrail();
setupSectionDots();
updateCountdown();
updateScrollProgress();
window.setInterval(updateCountdown, 1000);
