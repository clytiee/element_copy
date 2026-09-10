// 初始化右键菜单
async function initContextMenu() {
  await chrome.contextMenus.removeAll();
  const { copyMode = "rich", continuousCopy = false } = await chrome.storage.local.get(["copyMode","continuousCopy"]);

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

  chrome.contextMenus.create({
    id:"sep1",
    type:"separator",
    contexts:["action"]
  });

  chrome.contextMenus.create({
    id: "toggle-continuous",
    title: "🔁 连续复制：" + (continuousCopy ? "开启" : "关闭"),
    contexts: ["action"]
  });
}

// =========【重要】监听器全部放在顶层，不要包进async函数！=========
chrome.contextMenus.onClicked.addListener(async (info) => {
  const cfg = await chrome.storage.local.get(["copyMode","continuousCopy"]);
  if(info.menuItemId === "mode-rich"){
    cfg.copyMode = "rich";
    await chrome.storage.local.set({copyMode:"rich"});
  }else if(info.menuItemId === "mode-plain"){
    cfg.copyMode = "plain";
    await chrome.storage.local.set({copyMode:"plain"});
  }else if(info.menuItemId === "toggle-continuous"){
    cfg.continuousCopy = !cfg.continuousCopy;
    await chrome.storage.local.set({continuousCopy: cfg.continuousCopy});
  }
  await initContextMenu();
});

// 图标左键点击（顶层注册！！！）
chrome.action.onClicked.addListener(async (tab) => {
  if(!tab.id) return;
  const url = tab.url??"";
  if(url.startsWith("chrome://") || url.startsWith("edge://")) return;
  try{
    await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_PICK" });
  }catch(e){
    // 页面没有content脚本，静默忽略
  }
});

// 安装/更新重建菜单
chrome.runtime.onInstalled.addListener(()=>{
  initContextMenu();
});
