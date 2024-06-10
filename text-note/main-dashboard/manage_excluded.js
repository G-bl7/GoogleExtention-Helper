document.addEventListener('DOMContentLoaded', () => {
  loadExcludedWebsites();

  document.getElementById('searchButton').addEventListener('click', () => {
    const searchText = document.getElementById('search').value.toLowerCase();
    loadExcludedWebsites(searchText);
  });

  document.getElementById('exportButton').addEventListener('click', exportExcludedWebsites);
  document.getElementById('importButton').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', importExcludedWebsites);
});

function loadExcludedWebsites(searchText = '') {
  chrome.storage.local.get({ excludedWebsites: [] }, (result) => {
    const excludedWebsites = result.excludedWebsites;
    const filteredWebsites = excludedWebsites.filter(domain => domain.toLowerCase().includes(searchText));
    displayExcludedWebsites(filteredWebsites);
  });
}

function displayExcludedWebsites(websites) {
  const tableBody = document.getElementById('excludedTableBody');
  tableBody.innerHTML = '';

  websites.forEach((domain) => {
    const row = document.createElement('tr');

    const domainCell = document.createElement('td');
    domainCell.textContent = domain;

    const actionsCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteExcludedWebsite(domain));

    actionsCell.appendChild(deleteButton);
    row.appendChild(domainCell);
    row.appendChild(actionsCell);

    tableBody.appendChild(row);
  });
}

function deleteExcludedWebsite(domain) {
  chrome.storage.local.get({ excludedWebsites: [] }, (result) => {
    const excludedWebsites = result.excludedWebsites;
    const updatedWebsites = excludedWebsites.filter(item => item !== domain);
    chrome.storage.local.set({ excludedWebsites: updatedWebsites }, () => {
      loadExcludedWebsites();
    });
  });
}

function exportExcludedWebsites() {
  chrome.storage.local.get({ excludedWebsites: [] }, (result) => {
    const excludedWebsites = result.excludedWebsites;
    const blob = new Blob([JSON.stringify(excludedWebsites, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'excluded_websites.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

function importExcludedWebsites(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const websites = JSON.parse(e.target.result);
        if (Array.isArray(websites)) {
          chrome.storage.local.set({ excludedWebsites: websites }, () => {
            loadExcludedWebsites();
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
}
