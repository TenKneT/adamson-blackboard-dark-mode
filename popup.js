"use strict";
const toggle = document.getElementById("enabled");
const status = document.getElementById("status");
const key = "adamsonDarkEnabled";
let saved = true;
function render() {
  toggle.checked = saved;
  document.body.dataset.theme = saved ? "dark" : "light";
  status.textContent = saved ? "Dark mode is on." : "Original Blackboard theme is on.";
}
browser.storage.local.get(key).then(settings => {
  saved = settings[key] !== false;
  render();
  toggle.disabled = false;
}).catch(() => { status.textContent = "Could not load your setting. Close and reopen this panel to retry."; });
toggle.addEventListener("change", async () => {
  toggle.disabled = true;
  const next = toggle.checked;
  try {
    await browser.storage.local.set({ [key]: next });
    saved = next;
    render();
  } catch {
    render();
    status.textContent = "Could not save your setting. Try the switch again.";
  } finally { toggle.disabled = false; }
});
