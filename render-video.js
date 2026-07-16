const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profileDir = path.join(root, ".chrome-video-profile");
const output = path.join(root, "BabyShower-Neithan.webm");
const url = `file:///${root.replace(/\\/g, "/")}/video.html?render=1`;
const port = 9333;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForEndpoint(endpoint, attempts = 80) {
    for (let i = 0; i < attempts; i += 1) {
        try {
            const response = await fetch(endpoint);
            if (response.ok) return response.json();
        } catch {}
        await sleep(250);
    }
    throw new Error(`No se pudo conectar a ${endpoint}`);
}

async function waitForPageTarget(port, attempts = 80) {
    for (let i = 0; i < attempts; i += 1) {
        const targets = await waitForEndpoint(`http://127.0.0.1:${port}/json/list`, 1);
        const page = targets.find((target) => target.type === "page" && target.url.includes("video.html"));
        if (page) return page;
        await sleep(250);
    }
    throw new Error("No se pudo encontrar la página del video.");
}

function connect(wsUrl) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);
        const pending = new Map();
        let id = 0;

        ws.onopen = () => {
            resolve({
                send(method, params = {}) {
                    id += 1;
                    ws.send(JSON.stringify({ id, method, params }));
                    return new Promise((res, rej) => {
                        pending.set(id, { res, rej });
                    });
                },
                close() {
                    ws.close();
                }
            });
        };

        ws.onerror = reject;
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (!msg.id || !pending.has(msg.id)) return;
            const next = pending.get(msg.id);
            pending.delete(msg.id);
            if (msg.error) next.rej(new Error(msg.error.message));
            else next.res(msg.result);
        };
    });
}

async function waitForVideoBase64(client, timeoutMs = 70000) {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
        const response = await client.send("Runtime.evaluate", {
            expression: "window.__VIDEO_BASE64__ ? window.__VIDEO_BASE64__.length : 0",
            returnByValue: true
        });
        const length = response.result && response.result.value;
        if (typeof length === "number" && length > 1000) {
            const chunkSize = 250000;
            const parts = [];
            for (let offset = 0; offset < length; offset += chunkSize) {
                const chunk = await client.send("Runtime.evaluate", {
                    expression: `window.__VIDEO_BASE64__.slice(${offset}, ${offset + chunkSize})`,
                    returnByValue: true
                });
                parts.push(chunk.result.value);
            }
            return parts.join("");
        }
        await sleep(500);
    }

    const status = await client.send("Runtime.evaluate", {
        expression: "JSON.stringify({ text: document.body.innerText, status: window.__VIDEO_STATUS__ || null, done: window.__VIDEO_DONE__ || false })",
        returnByValue: true
    });
    throw new Error(`El video no terminó de renderizarse a tiempo. Estado: ${status.result.value || "sin estado"}`);
}

async function main() {
    fs.rmSync(output, { force: true });
    fs.rmSync(profileDir, { recursive: true, force: true });

    const chrome = spawn(chromePath, [
        "--disable-gpu",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--autoplay-policy=no-user-gesture-required",
        "--no-first-run",
        "--window-size=540,960",
        "--window-position=-32000,-32000",
        `--remote-debugging-port=${port}`,
        `--user-data-dir=${profileDir}`,
        url
    ], { stdio: "ignore" });

    try {
        await waitForEndpoint(`http://127.0.0.1:${port}/json/version`);
        const page = await waitForPageTarget(port);
        const client = await connect(page.webSocketDebuggerUrl);
        const base64 = await waitForVideoBase64(client);
        client.close();

        fs.writeFileSync(output, Buffer.from(base64, "base64"));
        const size = fs.statSync(output).size;
        console.log(`Video generado: ${output} (${size} bytes)`);
    } finally {
        chrome.kill();
        await sleep(800);
        fs.rmSync(profileDir, { recursive: true, force: true });
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
