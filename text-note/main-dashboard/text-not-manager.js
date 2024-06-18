document.addEventListener("DOMContentLoaded", () => {
  loadTextNote();
  selectAllEvent();
  const events = {
    deleteSelectedButton: multiDeleteTextNote,
    exportButton: exportSelectedTextNotes,
    importButton: () => document.getElementById("importFile").click(),
    importFile: importTextNotes,
    loadUnprofiledText: loadUnprofiledText,
  };
  Object.keys(events).forEach((id) =>
    document.getElementById(id).addEventListener("click", events[id])
  );
});

let textNotes = [],
  selectedRow = 0;

function loadTextNote() {
  const useDefaultProfile =
    document.getElementById("UseDefaultProfile").checked;
  document.getElementById("SelectedRow").textContent = 0;
  const setProfile = (name, id) => {
    document.getElementById("profleName").textContent = name;
    document.getElementById("profleId").textContent = ` / ${id || ""}`;
  };

  const fetchNotes = (profileID) =>
    chrome.runtime.sendMessage(
      { action: "getAllTextNote", profileID },
      (response) => {
        textNotes = response.data;
        displayTextNote();
        document.getElementById("totalRows").textContent = textNotes.length;
      }
    );

  if (useDefaultProfile) {
    chrome.runtime.sendMessage({ action: "getDefaultProfile" }, (response) => {
      const { profile_name, id } = response.data;
      setProfile(profile_name, id);
      fetchNotes(id);
    });
  } else {
    setProfile("SYSTEM");
    fetchNotes(null);
  }
}

function displayTextNote() {
  const tableBody = document.getElementById("TextNoteTbody");
  tableBody.innerHTML = "";
  textNotes.forEach((item, index) => {
    const row = tableBody.insertRow();
    row.innerHTML = `
      <td><input type="checkbox" class="select-row" data-id="${
        item.id
      }" data-index="${index}"></td>
      <td contenteditable="true">${item.text || ""}</td>
      <td contenteditable="true">${item.note || ""}</td>
      <td>${formatTimestamp(item.timestamp)}</td>
      <td><button>Delete</button></td>`;

    const checkbox = row.querySelector("input[type='checkbox']");
    checkbox.addEventListener("change", () => {
      selectedRow += checkbox.checked ? 1 : -1;
      document.getElementById("SelectedRow").textContent = selectedRow;
    });

    const [textCell, noteCell, , deleteButton] =
      row.querySelectorAll("td, button");
    textCell.addEventListener("blur", () =>
      updateTextNote(item.id, "text", textCell.textContent)
    );
    noteCell.addEventListener("blur", () =>
      updateTextNote(item.id, "note", noteCell.textContent)
    );
    deleteButton.addEventListener("click", () => deleteTextNoteItem(item.id));
  });

  ["searchText", "searchNote"].forEach((id) =>
    document.getElementById(id).addEventListener("input", filterTextNotes)
  );
}

function updateTextNote(id, field, newValue) {
  chrome.runtime.sendMessage(
    { action: "updateTextNote", textNoteID: id, field, newValue },
    (response) => {
      if (!response.success)
        console.error(`Failed to update ${field} for text note ID ${id}`);
    }
  );
}

function deleteTextNoteItem(id) {
  chrome.runtime.sendMessage(
    { action: "deleteTextNote", textNoteID: id },
    (response) => {
      if (response.success) {
        textNotes = textNotes.filter((note) => note.id !== id);
        displayTextNote();
        document.getElementById("totalRows").textContent = textNotes.length;
      } else {
        console.error(`Failed to delete text note ID ${id}`);
      }
    }
  );
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp || "2024-01-01 00:00:00");
  const [hours, minutes, day, month, year] = [
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCDate(),
    date.getUTCMonth() + 1,
    date.getUTCFullYear(),
  ].map((num) => String(num).padStart(2, "0"));
  return `${hours}:${minutes} (${day}/${month}/${year})`;
}

function filterTextNotes() {
  const searchTextValue = document
    .getElementById("searchText")
    .value.toLowerCase();
  const searchNoteValue = document
    .getElementById("searchNote")
    .value.toLowerCase();
  const filteredData = textNotes.filter(
    (item) =>
      item.text.toLowerCase().includes(searchTextValue) &&
      item.note.toLowerCase().includes(searchNoteValue)
  );
  document.getElementById("filteredResults").textContent = filteredData.length;
  displayTextNote(filteredData);
}

function selectAllEvent() {
  document.getElementById("selectAll").addEventListener("change", function () {
    document.querySelectorAll(".select-row").forEach((checkbox) => {
      checkbox.checked = this.checked;
      checkbox.dispatchEvent(new Event("change"));
    });
  });
}

function multiDeleteTextNote() {
  const idsToDelete = Array.from(
    document.querySelectorAll(".select-row:checked")
  ).map((cb) => cb.dataset.id);
  idsToDelete.forEach((id) => deleteTextNoteItem(id));
}

function exportSelectedTextNotes() {
  const selectedNotes = Array.from(
    document.querySelectorAll(".select-row:checked")
  ).map((cb) => {
    const { profileID, id, ...noteWithoutID } = textNotes[cb.dataset.index];
    return noteWithoutID;
  });
  const json = JSON.stringify(selectedNotes, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "selected_text_notes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importTextNotes(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    let importedNotes;
    try {
      importedNotes = JSON.parse(e.target.result);
    } catch (error) {
      importedNotes = e.target.result
        .split("\n")
        .filter((line) => line.trim())
        .map((text) => ({
          text,
          note: "Default Note",
          timestamp: Date.now(),
        }));
    }
    chrome.runtime.sendMessage({ action: "getDefaultProfile" }, (response) => {
      const { id: profileID } = response.data;
      importedNotes.forEach((item) => {
        item.profileID = profileID;
        chrome.runtime.sendMessage({
          action: "addNewTextNote",
          textNote: item,
        });
      });
      textNotes = textNotes.concat(importedNotes);
      displayTextNote();
      document.getElementById("totalRows").textContent = textNotes.length;
    });
  };
  reader.readAsText(file);
}