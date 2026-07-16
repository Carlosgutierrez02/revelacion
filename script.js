const EVENT = {
    date: new Date("2026-08-16T14:00:00-05:00"),
    place: "Salon de eventos Iglesia Morrogacho"
};

const intro = document.getElementById("intro");
const invitation = document.getElementById("invitation");
const openInvitation = document.getElementById("openInvitation");
const toast = document.getElementById("toast");

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
        "Hola, confirmo mi asistencia al Baby Shower.",
        "",
        "Fecha: Domingo 16 de agosto de 2026",
        "Hora: 2:00 PM",
        `Lugar: ${EVENT.place}`,
        "",
        "Gracias por invitarme."
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

let toastTimer;
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

openInvitation.addEventListener("click", showInvitation);
document.getElementById("confirmTop").addEventListener("click", confirmAttendance);
document.getElementById("confirmBottom").addEventListener("click", confirmAttendance);

updateCountdown();
window.setInterval(updateCountdown, 1000);
