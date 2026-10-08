const search=document.querySelector('#search'),category=document.querySelector('#category'),entries=[...document.querySelectorAll('.entry')],results=document.querySelector('#results'),empty=document.querySelector('#empty');
function filter(){const q=search.value.trim().toLocaleLowerCase('en'),c=category.value;let count=0;entries.forEach(e=>{e.hidden=!( (!c||e.dataset.category===c)&&(!q||e.textContent.toLocaleLowerCase('en').includes(q)) );if(!e.hidden)count++});results.textContent=count+' of '+entries.length+' field notes';empty.hidden=count>0}
search.addEventListener('input',filter);category.addEventListener('change',filter);document.querySelector('#reset').addEventListener('click',()=>{search.value='';category.value='';filter();search.focus()});
function revealHash(){const el=document.getElementById(location.hash.slice(1));if(el&&el.classList.contains('entry')){search.value='';category.value='';filter();el.querySelector('details').open=true;el.scrollIntoView({block:'start',behavior:'auto'})}}window.addEventListener('hashchange',revealHash);revealHash();

/* Set only after deploying the provided Apps Script with anonymous access. */
const SIGNAL_ENDPOINT = "https://script.google.com/macros/s/AKfycbx1cpEe2UcEe9c1DzMHKP1NoloHKDE3aiiPWYDA_UUifG5uSS1-sX-FlCiSieqUFWG-/exec";
const configured = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(SIGNAL_ENDPOINT);
const form = document.querySelector("#message-form"), field = document.querySelector("#message");
const send = document.querySelector("#send-signal"), label = document.querySelector("#send-label");
const status = document.querySelector("#message-status"), state = document.querySelector("#channel-state");
let pending = null, requestId = "", requestFingerprint = "", wallLoading = false;
function randomId() { return crypto.randomUUID(); }
function countCharacters() { document.querySelector("#message-count").textContent = field.value.length.toLocaleString("en") + " / 2,000"; }
field.addEventListener("input", countCharacters);
function unlock() { send.disabled = !configured; label.textContent = configured ? "Send signal" : "Channel opening soon"; }
function loadSignals() {
  if (!configured || wallLoading) return;
  wallLoading = true;
  const wallStatus = document.querySelector("#wall-status");
  wallStatus.textContent = "Receiving signals…";
  const callback = "earthSignals_" + randomId().replaceAll("-", "");
  const script = document.createElement("script");
  let timer;
  function cleanup() { clearTimeout(timer); script.remove(); delete window[callback]; wallLoading = false; }
  window[callback] = (data) => {
    cleanup();
    if (!data || data.ok !== true || !Array.isArray(data.messages)) { wallStatus.textContent = "Signals are temporarily unavailable."; return; }
    const list = document.querySelector("#signal-list"); list.replaceChildren();
    data.messages.slice(0, 100).forEach((item) => {
      if (typeof item.message !== "string" || typeof item.name !== "string") return;
      const card = document.createElement("article"); card.className = "signal-card";
      const meta = document.createElement("div"); meta.className = "signal-card-meta";
      const name = document.createElement("strong"); name.textContent = item.name.slice(0, 80) || "Anonymous visitor";
      const time = document.createElement("time"); const date = new Date(item.date);
      if (!Number.isNaN(date.getTime())) { time.dateTime = date.toISOString(); time.textContent = date.toLocaleDateString("en", {day:"numeric",month:"short",year:"numeric"}); }
      meta.append(name, time);
      const text = document.createElement("p"); text.textContent = item.message.slice(0,2000);
      card.append(text,meta); list.append(card);
    });
    const count = list.children.length;
    document.querySelector("#wall-count").textContent = count + (count === 1 ? " published signal" : " published signals");
    document.querySelector("#wall-empty").hidden = count > 0;
    document.querySelector("#wall-empty p").textContent = "Leave the first message.";
    wallStatus.textContent = "";
  };
  function failed() { cleanup(); wallStatus.textContent = "Could not load signals. Existing messages remain visible; try refresh."; }
  const url = new URL(SIGNAL_ENDPOINT); url.searchParams.set("callback", callback); url.searchParams.set("t", Date.now());
  script.src = url.toString(); script.onerror = failed;
  timer = setTimeout(failed, 20000); document.head.append(script);
}
if (configured) {
  form.action = SIGNAL_ENDPOINT; unlock(); state.textContent = "READY";
  status.textContent = "";
  document.querySelector("#refresh-signals").hidden = false; loadSignals();
}
document.querySelector("#refresh-signals").addEventListener("click", loadSignals);
form.addEventListener("submit", (event) => {
  if (!configured || pending) { event.preventDefault(); return; }
  if (!form.reportValidity() || !field.value.trim() || !document.querySelector("#callsign").value.trim()) { event.preventDefault(); status.textContent = "Enter your nick and message."; return; }
  if (document.querySelector("#website").value) { event.preventDefault(); return; }
  const fingerprint = JSON.stringify([field.value.trim(),document.querySelector("#callsign").value.trim(),"Hello"]);
  if (requestFingerprint !== fingerprint) { requestId = randomId(); requestFingerprint = fingerprint; }
  const nonce = randomId(); document.querySelector("#signal-nonce").value = nonce; document.querySelector("#signal-request-id").value = requestId;
  send.disabled = true; label.textContent = "Transmitting…"; state.textContent = "SENDING"; status.textContent = "Waiting for receipt…";
  pending = {nonce, timer:setTimeout(() => {
    pending = null; unlock(); state.textContent = "RETRY";
    status.textContent = "No receipt received. Please retry.";
  },25000)};
});
window.addEventListener("message", (event) => {
  if (!pending || typeof event.data !== "object" || event.data === null) return;
  let origin; try { origin = new URL(event.origin); } catch { return; }
  const trusted = origin.protocol === "https:" && (origin.hostname === "script.google.com" || origin.hostname === "script.googleusercontent.com" || origin.hostname.endsWith(".script.googleusercontent.com") || origin.hostname.endsWith("-script.googleusercontent.com"));
  if (!trusted || event.data.type !== "earth-signal-receipt" || event.data.nonce !== pending.nonce) return;
  clearTimeout(pending.timer); pending = null; unlock();
  if (event.data.ok === true) {
    status.textContent = "Message sent."; state.textContent = "RECEIVED";
    form.reset(); countCharacters(); requestId = ""; requestFingerprint = "";
  } else {
    status.textContent = event.data.code === "busy" ? "The channel is busy. Your message is saved here; try again shortly." : "The server could not save your signal. Your message is still here.";
    state.textContent = "RETRY";
  }
});
