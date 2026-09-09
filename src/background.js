async function sendToggleMessage() {
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
}

if (chrome.commands?.onCommand) {
  chrome.commands.onCommand.addListener(async (command) => {
    if (command === "start-pick") {
      await sendToggleMessage();
    }
  });
}

if (chrome.action?.onClicked) {
  chrome.action.onClicked.addListener(async () => {
    await sendToggleMessage();
  });
}
