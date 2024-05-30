chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveText",
    title: "Add Text",
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

async function isFilterActive() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['filterActive'], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.filterActive || false);
      }
    });
  });
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {

  console.log(await isFilterActive());

  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    const filterActive = await isFilterActive();
    if (filterActive && tab.url) {
      console.log(`Tab activated: ${tab.url}`);
      runtime();
    }
  } catch (error) {
    console.log(`Error getting tab or filterActive: ${error}`);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  try {
    const filterActive = await isFilterActive();
    if (filterActive ) {
      runtime();
    }
  } catch (error) {
    console.log(`Error getting filterActive: ${error}`);
  }
});

function getCompleteHTMLContent() {
  return new XMLSerializer().serializeToString(document);
}

function extractIPAddresses(html) {
  var ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
  return html.match(ipPattern) || [];
}

function isChromeURL(url) {
  return url.startsWith("chrome://");
}

function runtime() {
  console.log('Run Time')
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length === 0 || !tabs[0].id) {
      console.log("No active tab found.");
      return;
    }

    console.log('Run Time')

    var currentTab = tabs[0];
    if (isChromeURL(currentTab.url)) {
      console.log("Cannot execute script on a chrome:// URL.");
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: currentTab.id },
        func: getCompleteHTMLContent
      },
      (results) => {
        if (chrome.runtime.lastError) {
          console.log(`Error executing script: ${chrome.runtime.lastError.message}`);
          return;
        }

        if (results && results[0] && results[0].result) {
          var htmlDomm = results[0].result;
          var ipAddresses = extractIPAddresses(htmlDomm);
          var uniqueIPAddresses = Array.from(new Set(ipAddresses));

          chrome.storage.local.get({ tmpExtractedText: [] }, function (data) {
            var existingIPs = data.tmpExtractedText;
            var updatedIPs = Array.from(new Set(existingIPs.concat(uniqueIPAddresses)));
            chrome.storage.local.set({ tmpExtractedText: updatedIPs }, function () {
              if (chrome.runtime.lastError) {
                console.log(`Error setting storage: ${chrome.runtime.lastError}`);
              } else {
                console.log("IP addresses updated successfully.");
              }
            });
          });
        } else {
          console.log("No result from executed script.");
        }
      }
    );
  });
}
