document.addEventListener('DOMContentLoaded', () => {
  // Import button event listener
  document.getElementById('importButton').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });

  // Import file event listener
  document.getElementById('importFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      importData(file);
    }
  });

  // Other event listeners
  document.getElementById('editButton').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('edit.html') });
  });

  document.getElementById('addExclude').addEventListener('click', () => {
    const domain = prompt('Enter the domain to exclude (e.g., example.com):');
    if (domain) {
      chrome.storage.local.get({ excludedWebsites: [] }, (result) => {
        const excludedWebsites = result.excludedWebsites;
        if (!excludedWebsites.includes(domain)) {
          excludedWebsites.push(domain);
          chrome.storage.local.set({ excludedWebsites: excludedWebsites }, () => {
            alert('Domain added to excluded list.');
          });
        } else {
          alert('Domain is already in the excluded list.');
        }
      });
    }
  });

  document.getElementById('manageExclude').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('manage_excluded.html') });
  });

  document.getElementById('exportButton').addEventListener('click', () => {
    chrome.storage.local.get({ excludedWebsites: [], notes: {} }, (result) => {
      const data = {
        excludedWebsites: result.excludedWebsites,
        notes: result.notes
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'excluded_data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  });
});

function importData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data && typeof data === 'object') {
        chrome.storage.local.set(data, () => {
          alert('Data imported successfully.');
        });
      } else {
        alert('Invalid JSON format');
      }
    } catch (error) {
      alert('Error reading file: ' + error.message);
    }
  };
  reader.readAsText(file);
}
