chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveText",
    title: "Save Text to Vun",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveText") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: saveSelectedText,
      args: [info.selectionText]
    });
  }
});

function saveSelectedText(selectedText) {
  let note = prompt("Add a note to the selected text:");
  if (selectedText && note !== null) {
    let tag = prompt("Add a tag (Urgent, Important, High Priority, Deadline, Follow-up):", "Follow-up");
    const timestamp = new Date().toLocaleString();
    chrome.storage.local.get({ vunData: [] }, (result) => {
      let vunData = result.vunData;
      vunData.push({ text: selectedText, note: note, timestamp: timestamp, tag: tag });
      chrome.storage.local.set({ vunData: vunData }, () => {
        console.log('Data saved:', vunData);
      });
    });
  }
}