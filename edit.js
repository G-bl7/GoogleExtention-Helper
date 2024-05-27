document.addEventListener('DOMContentLoaded', () => {
  loadVunData();
  document.getElementById('exportButton').addEventListener('click', exportVunData);
  document.getElementById('importButton').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', importVunData);
  document.getElementById('searchButton').addEventListener('click', searchVunData);
  document.getElementById('filterButton').addEventListener('click', filterVunData);
});

function loadVunData() {
  chrome.storage.local.get({ vunData: [] }, (result) => {
    displayVunData(result.vunData);
  });
}

function displayVunData(vunData) {
  const tableBody = document.getElementById('vunTableBody');
  tableBody.innerHTML = '';

  vunData.forEach((item, index) => {
    const row = document.createElement('tr');

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
    chrome.storage.local.set({ vunData: vunData }, loadVunData);
  });
}

function deleteVunData(index) {
  chrome.storage.local.get({ vunData: [] }, (result) => {
    let vunData = result.vunData;
    vunData.splice(index, 1);
    chrome.storage.local.set({ vunData: vunData }, loadVunData);
  });
}

function exportVunData() {
  chrome.storage.local.get({ vunData: [] }, (result) => {
    const vunData = result.vunData;
    const blob = new Blob([JSON.stringify(vunData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vunData.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

function importVunData(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        if (Array.isArray(jsonData)) {
          chrome.storage.local.set({ vunData: jsonData }, loadVunData);
        } else {
          alert('Invalid JSON format. Please upload a valid JSON file.');
        }
      } catch (error) {
        alert('Error reading JSON file. Please upload a valid JSON file.');
      }
    };
    reader.readAsText(file);
  }
}

function searchVunData() {
  const searchText = document.getElementById('searchText').value.toLowerCase();
  console.log('Searching for:', searchText);
  chrome.storage.local.get({ vunData: [] }, (result) => {
    const filteredData = result.vunData.filter(item => 
      (item.text && item.text.toLowerCase().includes(searchText)) || 
      (item.note && item.note.toLowerCase().includes(searchText)) || 
      (item.timestamp && item.timestamp.toLowerCase().includes(searchText))
    );
    console.log('Filtered Data:', filteredData);
    displayVunData(filteredData);
  });
}

function filterVunData() {
  const selectedTag = document.getElementById('filterTag').value;
  console.log('Filtering by tag:', selectedTag);
  chrome.storage.local.get({ vunData: [] }, (result) => {
    const filteredData = selectedTag 
      ? result.vunData.filter(item => item.tag === selectedTag) 
      : result.vunData;
    console.log('Filtered Data:', filteredData);
    displayVunData(filteredData);
  });
}
