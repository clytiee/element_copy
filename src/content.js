let isPicking = false;
let highlightEl = null;
let tooltipEl = null;

function createTooltip() {
  const el = document.createElement("div");
  el.id = "ect-tooltip";
  document.body.appendChild(el);
  return el;
}

function showTip(msg, type = "info") {
  if (!tooltipEl) tooltipEl = createTooltip();
  tooltipEl.textContent = msg;
  tooltipEl.className = type;
  tooltipEl.style.display = "block";
  clearTimeout(showTip.timer);
  showTip.timer = setTimeout(() => {
    tooltipEl.style.display = "none";
  }, 1800);
}

function createHighlight() {
  const el = document.createElement("div");
  el.id = "ect-highlight";
  document.body.appendChild(el);
  return el;
}

function updateHighlight(target) {
  if (!highlightEl) highlightEl = createHighlight();
  const rect = target.getBoundingClientRect();
  Object.assign(highlightEl.style, {
    top: `${rect.top + window.scrollY}px`,
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    display: "block"
  });
}

function stopPick(showExitTip = false) {
  isPicking = false;
  if (highlightEl) highlightEl.style.display = "none";
  if (showExitTip) {
    showTip("已退出拾取模式", "info");
  }
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("click", onClickPick, true);
  document.removeEventListener("keydown", onEsc);
}

function startPick() {
  isPicking = true;
  showTip("拾取模式已开启，点击元素复制富文本(文字+图片)，Esc退出", "info");
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("click", onClickPick, true);
  document.addEventListener("keydown", onEsc);
}

function onMouseMove(e) {
  if (!isPicking) return;
  updateHighlight(e.target);
}

async function onClickPick(e) {
  e.preventDefault();
  e.stopPropagation();
  if (!isPicking) return;
  const target = e.target;
  const html = target.outerHTML;
  const plainText = target.innerText;

  try {
    // 写入富文本HTML剪贴板
    const blobHtml = new Blob([html], { type: "text/html" });
    const blobText = new Blob([plainText], { type: "text/plain" });
    const itemHtml = new ClipboardItem({
      "text/html": blobHtml,
      "text/plain": blobText
    });
    await navigator.clipboard.write([itemHtml]);
    showTip(`✅ 富文本复制成功，可粘贴到Word/Notion`, "success");
  } catch (err) {
    console.error(err);
    // 降级：只复制纯文本
    await navigator.clipboard.writeText(plainText);
    showTip(`⚠️ 富文本复制失败，已降级复制纯文本`, "error");
  }
  stopPick(false);
}

function onEsc(e) {
  if (e.key === "Escape" && isPicking) {
    e.preventDefault();
    stopPick(true);
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "TOGGLE_PICK") {
    if (isPicking) stopPick(true);
    else startPick();
  }
});

window.addEventListener("pagehide", () => {
  if (highlightEl) highlightEl.remove();
  if (tooltipEl) tooltipEl.remove();
});
