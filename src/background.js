// 初始化右键单选菜单
async function initContextMenu() {
  await chrome.contextMenus.removeAll();
  const { copyMode = "rich" } = await chrome.storage.local.get("copyMode");

  chrome.contextMenus.create({
    id: "mode-rich",
    title: "✅ 富文本模式（文字+图片）",
    type: "radio",
    checked: copyMode === "rich",
    contexts: ["action"]
  });
  chrome.contextMenus.create({
    id: "mode-plain",
    title: "📄 纯文本模式",
    type: "radio",
    checked: copyMode === "plain",
    contexts: ["action"]
  });
}

// 右键菜单切换
chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === "mode-rich") {
    await chrome.storage.local.set({ copyMode: "rich" });
  } else if (info.menuItemId === "mode-plain") {
    await chrome.storage.local.set({ copyMode: "plain" });
  }
});

// 插件图标左键点击，发送拾取切换消息
chrome.action.onClicked.addListener(async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  if (!activeTab?.id) return;

  const url = activeTab.url || "";
  if (url.startsWith("chrome://") || url.startsWith("edge://")) {
    return;
  }
  try {
    await chrome.tabs.sendMessage(activeTab.id, { type: "TOGGLE_PICK" });
  } catch (e) {
    // 页面未注入content脚本，静默忽略
  }
});

// Service Worker启动时创建菜单
chrome.runtime.onInstalled.addListener(() => {
  initContextMenu();
});
