

console.log("Popup main.js has been loaded and executed successfully. textNote");

document.getElementById('textNoteManagerButton').addEventListener('click', function () {
    chrome.tabs.create({ url: chrome.runtime.getURL('text-note/main-dashboard/text-not-manager.html') });
});
