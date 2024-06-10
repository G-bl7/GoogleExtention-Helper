document.addEventListener('DOMContentLoaded', () => {
  loadVunData();
  document.getElementById('exportButton').addEventListener('click', () => exportVunData(filteredData));
  document.getElementById('importButton').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', importVunData);
  document.getElementById('searchButton').addEventListener('click', searchVunData);
  document.getElementById('filterButton').addEventListener('click', filterVunData);
  document.getElementById('deleteSelectedButton').addEventListener('click', deleteSelectedVunData);
  document.getElementById('selectAll').addEventListener('change', toggleSelectAll);

  // More Options button handlers
  document.getElementById('importTextData').addEventListener('click', () => document.getElementById('importFileText').click());
  document.getElementById('importFileText').addEventListener('change', importTextData);
});

let filteredData = [];

function loadVunData() {
  chrome.storage.local.get({ vunData: [] }, (result) => {
    displayVunData(result.vunData);
    updateTotalRowsCount(result.vunData.length);
    updateFilteredResultsCount(result.vunData.length); // Initial load, filtered results same as total rows
    filteredData = result.vunData; // Initialize filteredData
  });
}

function displayVunData(vunData) {
  const tableBody = document.getElementById('vunTableBody');
  tableBody.innerHTML = '';

  vunData.forEach((item, index) => {
    const row = document.createElement('tr');

    const selectCell = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('select-row');
    checkbox.dataset.index = index;
    selectCell.appendChild(checkbox);

    const textCell = document.createElement('td');
    textCell.contentEditable = 'true';
    textCell.textContent = item.text || '';

    const noteCell = document.createElement('td');
    noteCell.contentEditable = 'true';
    noteCell.textContent = item.note || '';

    const timestampCell = document.createElement('td');
    timestampCell.textContent = item.timestamp || '';

    const tagCell = document.createElement('td');
    const tagSelect = document.createElement('select');
    ["Urgent", "Important", "High Priority", "Deadline", "Follow-up"].forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      option.text = tag;
      option.selected = tag === item.tag;
      tagSelect.appendChild(option);
    });
    tagSelect.addEventListener('change', () => saveVunData(index, textCell.textContent, noteCell.textContent, item.timestamp, tagSelect.value));
    tagCell.appendChild(tagSelect);

    const actionsCell = document.createElement('td');
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', () => saveVunData(index, textCell.textContent, noteCell.textContent, item.timestamp, tagSelect.value));

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteVunData(index));

    actionsCell.appendChild(saveButton);
    actionsCell.appendChild(deleteButton);

    row.appendChild(selectCell);
    row.appendChild(textCell);
    row.appendChild(noteCell);
    row.appendChild(timestampCell);
    row.appendChild(tagCell);
    row.appendChild(actionsCell);

    tableBody.appendChild(row);
  });
}

function saveVunData(index, newText, newNote, timestamp, newTag) {
  chrome.storage.local.get({ vunData: [] }, (result) => {
    const vunData = result.vunData;
    vunData[index] = { text: newText, note: newNote, timestamp: timestamp, tag: newTag };
    chrome.storage.local.set({ vunData: vunData }, () => {
      loadVunData();
      updateTotalRowsCount(vunData.length); // Update count after save
      updateFilteredResultsCount(vunData.length); // Reset filtered count
    });
  });
}

function deleteVunData(index) {
  chrome.storage.local.get({ vunData: [] }, (result) => {
    let vunData = result.vunData;
    vunData.splice(index, 1);
    chrome.storage.local.set({ vunData: vunData }, () => {
      loadVunData();
      updateTotalRowsCount(vunData.length); // Update count after deletion
      updateFilteredResultsCount(vunData.length); // Reset filtered count
    });
  });
}

function deleteSelectedVunData() {
  const checkboxes = document.querySelectorAll('.select-row:checked');
  if (checkboxes.length === 0) return;
  
  const indicesToDelete = Array.from(checkboxes).map(checkbox => parseInt(checkbox.dataset.index));
  
  chrome.storage.local.get({ vunData: [] }, (result) => {
    let vunData = result.vunData.filter((item, index) => !indicesToDelete.includes(index));
    chrome.storage.local.set({ vunData: vunData }, () => {
      loadVunData();
      updateTotalRowsCount(vunData.length); // Update count after deletion
      updateFilteredResultsCount(vunData.length); // Reset filtered count
    });
  });
}

function exportVunData(dataToExport) {
  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vunData.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importVunData(event) {
  const file = event.target.files[0];
  
  if (file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        if (Array.isArray(jsonData)) {
          chrome.storage.local.get({ vunData: [] }, function(result) {
            const currentVunData = result.vunData;

            if (Array.isArray(currentVunData)) {
              const newVunData = [...new Set([...currentVunData, ...jsonData])]; // Merge and remove duplicates

              chrome.storage.local.set({ vunData: newVunData }, function() {
                if (chrome.runtime.lastError) {
                  console.error('Error setting vunData in storage:', chrome.runtime.lastError);
                } else {
                  console.log('vunData imported and appended:', newVunData);
                  loadVunData(); // Reload the data
                  updateTotalRowsCount(newVunData.length); // Update count after import
                  updateFilteredResultsCount(newVunData.length); // Reset filtered count
                }
              });
            } else {
              console.error('Existing vunData is not in the correct format.');
            }
          });
        } else {
          console.error('Invalid JSON format. Please upload a valid JSON file.');
        }
      } catch (error) {
        console.error('Error reading JSON file. Please upload a valid JSON file.');
      }
    };
    
    reader.readAsText(file);
  }
}

function searchVunData() {
  const searchText = document.getElementById('searchText').value.toLowerCase();
  console.log('Searching for:', searchText);
  chrome.storage.local.get({ vunData: [] }, (result) => {
    filteredData = result.vunData.filter(item =>
      (item.text && item.text.toLowerCase().includes(searchText)) ||
      (item.note && item.note.toLowerCase().includes(searchText)) ||
      (item.timestamp && item.timestamp.toLowerCase().includes(searchText))
    );
    console.log('Filtered Data:', filteredData);
    displayVunData(filteredData);
    updateFilteredResultsCount(filteredData.length); // Update count after search
  });
}

function filterVunData() {
  const selectedTag = document.getElementById('filterTag').value;
  console.log('Filtering by tag:', selectedTag);
  chrome.storage.local.get({ vunData: [] }, (result) => {
    filteredData = selectedTag
      ? result.vunData.filter(item => item.tag === selectedTag)
      : result.vunData;
    console.log('Filtered Data:', filteredData);
    displayVunData(filteredData);
    updateFilteredResultsCount(filteredData.length); // Update count after filter
  });
}

function updateTotalRowsCount(count) {
  document.getElementById('totalRows').textContent = count;
}

function updateFilteredResultsCount(count) {
  document.getElementById('filteredResults').textContent = count;
}

function toggleSelectAll() {
  const selectAllCheckbox = document.getElementById('selectAll');
  const checkboxes = document.querySelectorAll('.select-row');
  checkboxes.forEach(checkbox => checkbox.checked = selectAllCheckbox.checked);
}

// Function to import text data
function importTextData(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split('\n');
      const timestamp = new Date().toISOString();
      const newData = lines.map(line => ({
        text: line,
        note: '',
        timestamp: timestamp,
        tag: 'Follow-up'
      }));
      chrome.storage.local.get({ vunData: [] }, (result) => {
        const currentVunData = result.vunData;
        const combinedData = [...currentVunData, ...newData];
        chrome.storage.local.set({ vunData: combinedData }, () => {
          loadVunData();
          updateTotalRowsCount(combinedData.length);
          updateFilteredResultsCount(combinedData.length);
        });
      });
    };
    reader.readAsText(file);
  }
}