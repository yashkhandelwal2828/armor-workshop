export function showStartupError() {
  document.body.classList.add("startup-failed");
  const loading = document.getElementById("loading");
  loading.classList.remove("hidden");
  loading.replaceChildren();
  const message = document.createElement("p");
  message.textContent =
    "Workshop could not open. Check your connection and use a browser with WebGL 2 enabled.";
  const retry = document.createElement("button");
  retry.textContent = "Try again";
  retry.onclick = () => location.reload();
  loading.append(message, retry);
  document.getElementById("status").textContent = "Unable to load";
}
