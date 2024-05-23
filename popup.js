document.getElementById('editButton').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('edit.html') });
});
