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
async function startPick() {
  isPicking = true;
  const { copyMode = "rich", continuousCopy = false } = await chrome.storage.local.get(["copyMode","continuousCopy"]);
  const modeText = copyMode === "rich" ? "富文本(文字+图片)" : "纯文本";
  const contText = continuousCopy ? "【连续】" : "";
  showTip(`拾取模式已开启${contText}【${modeText}】，点击元素复制，Esc退出`, "info");

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
  const { copyMode = "rich", continuousCopy = false } = await chrome.storage.local.get(["copyMode","continuousCopy"]);
  const target = e.target;
  const html = target.outerHTML;
  const plainText = target.innerText.trim();
  try {
    if (copyMode === "rich") {
      const blobHtml = new Blob([html], { type: "text/html" });
      const blobText = new Blob([plainText], { type: "text/plain" });
      const itemHtml = new ClipboardItem({
        "text/html": blobHtml,
        "text/plain": blobText
      });
      await navigator.clipboard.write([itemHtml]);
      showTip("✅ 富文本复制成功，可粘贴到 Word/Notion", "success");
    } else {
      await navigator.clipboard.writeText(plainText);
      showTip(`✅ 纯文本复制成功`, "success");
    }
  } catch (err) {
    console.error(err);
    await navigator.clipboard.writeText(plainText);
    showTip(`⚠️ 复制异常，降级复制纯文本`, "error");
  }

  // 核心新增：只有非连续复制才退出拾取
  if(!continuousCopy){
    stopPick(false);
  }
}

function onEsc(e) {
  if (e.key === "Escape" && isPicking) {
    e.preventDefault();
    stopPick(true);
  }
}

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === "TOGGLE_PICK") {
    if (isPicking) {
      stopPick(true);
    } else {
      await startPick();
    }
  }
});

window.addEventListener("pagehide", () => {
  if (highlightEl) highlightEl.remove();
  if (tooltipEl) tooltipEl.remove();
});
