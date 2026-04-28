function entrar(){
    document.getElementById("intro").classList.add("hidden");
    setTimeout(()=>{
        document.getElementById("main").classList.remove("hidden");
    },500);
}

/* WHATSAPP */
function confirmar(){
    const mensaje = `Hola 👋✨

Confirmo mi asistencia a la revelación de género 💖💙

📅 14 de junio de 2026
⏰ 3:00 PM

Será un gusto acompañarlos 🤍`;

    const url = "https://api.whatsapp.com/send?phone=573213971526&text=" + encodeURIComponent(mensaje);
    window.open(url, "_blank");
}

/* ANIMACIÓN CON ROTACIÓN */
const bg = document.getElementById("cardBg");

function crearTetero(){

    const div = document.createElement("div");
    div.classList.add("icon");

    const img = document.createElement("img");
    img.src = "img/biberon.png";
    div.appendChild(img);

    const size = 25 + Math.random()*25;
    div.style.width = size + "px";

    div.style.left = Math.random()*bg.offsetWidth + "px";

    let y = -80;
    let rotation = Math.random() * 360;

    const speed = 1.5 + Math.random()*2;
    const rotationSpeed = (Math.random() - 0.5) * 2; // giro leve

    div.style.opacity = 0.2 + Math.random()*0.4;

    bg.appendChild(div);

    function animar(){
        y += speed;
        rotation += rotationSpeed;

        div.style.transform = `translateY(${y}px) rotate(${rotation}deg)`;

        if(y < bg.offsetHeight + 100){
            requestAnimationFrame(animar);
        }else{
            div.remove();
        }
    }

    requestAnimationFrame(animar);
}

setInterval(crearTetero,500);