document.addEventListener("DOMContentLoaded", () => {
  loadTextNote();
  selectAllEvent();
  document
    .getElementById("deleteSelectedButton")
    .addEventListener("click", multiDeleteTextNote);
  document
    .getElementById("exportButton")
    .addEventListener("click", exportSelectedTextNotes); // Add this line
  document
    .getElementById("importButton")
    .addEventListener("click", () =>
      document.getElementById("importFile").click()
    );
  document
    .getElementById("importFile")
    .addEventListener("change", importTextNotes);
  document
    .getElementById("loadUnprofiledText")
    .addEventListener("click", loadUnprofiledText);
});

let textNotes = []; // Variable to store the main data
let SelectedRow = 0;

function loadTextNote() {
  const useDefaultProfile =
    document.getElementById("UseDefaultProfile").checked;
  document.getElementById("SelectedRow").textContent = 0;

  if (useDefaultProfile) {
    chrome.runtime.sendMessage({ action: "getDefaultProfile" }, (response) => {
      const defaultProfile = response.data;
      document.getElementById("profleName").textContent =
        defaultProfile.profile_name;
      document.getElementById("profleId").textContent = defaultProfile.id;
      chrome.runtime.sendMessage(
        { action: "getAllTextNote", profileID: defaultProfile.id },
        (response) => {
          textNotes = response.data; // Store fetched data in textNotes
          displayTextNote(textNotes);
          document.getElementById("totalRows").textContent = textNotes.length;
        }
      );
    });
  } else {
    document.getElementById("profleName").textContent = "SYSTEM";
    document.getElementById("profleId").textContent = "-*-";

    chrome.runtime.sendMessage(
      { action: "getAllTextNote", profileID: null },
      (response) => {
        textNotes = response.data; // Store fetched data in textNotes
        displayTextNote(textNotes);
        document.getElementById("totalRows").textContent = textNotes.length;
      }
    );
  }
}

function displayTextNote(textNotes) {
  const tableBody = document.getElementById("TextNoteTbody");
  tableBody.innerHTML = "";

  textNotes.forEach((item, index) => {
    const row = document.createElement("tr");

    const selectCell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.itemID = item.id;
    checkbox.type = "checkbox";
    checkbox.classList.add("select-row");
    checkbox.dataset.index = index;
    selectCell.appendChild(checkbox);

    // Event listener for checkbox
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        SelectedRow += 1;
        console.log("SelectedRow:", SelectedRow); // Output for testing
      } else {
        SelectedRow -= 1;
        console.log("UnSelectedRow:", SelectedRow); // Output for testing
      }
      document.getElementById("SelectedRow").textContent = SelectedRow;
    });

    const textCell = document.createElement("td");
    textCell.contentEditable = "true";
    textCell.textContent = item.text || "";
    textCell.addEventListener("blur", () =>
      updateTextNote(item.id, "text", textCell.textContent)
    );

    const noteCell = document.createElement("td");
    noteCell.contentEditable = "true";
    noteCell.textContent = item.note || "";
    noteCell.addEventListener("blur", () =>
      updateTextNote(item.id, "note", noteCell.textContent)
    );

    const timestampCell = document.createElement("td");
    timestampCell.textContent = formatTimestamp(item.timestamp);

    const actionsCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      deleteTextNoteItem(item.id);
      location.reload();
    }); // Pass textNoteID to delete
    actionsCell.appendChild(deleteButton);

    row.appendChild(selectCell);
    row.appendChild(textCell);
    row.appendChild(noteCell);
    row.appendChild(timestampCell);
    row.appendChild(actionsCell);

    tableBody.appendChild(row);
  });

  // Add event listeners for search input fields
  const searchText = document.getElementById("searchText");
  const searchNote = document.getElementById("searchNote");

  searchText.addEventListener("input", filterTextNotes);
  searchNote.addEventListener("input", filterTextNotes);
}

function updateTextNote(textNoteID, field, newValue) {
  chrome.runtime.sendMessage(
    {
      action: "updateTextNote",
      textNoteID: textNoteID,
      field: field,
      newValue: newValue,
    },
    (response) => {
      if (response.success) {
        console.log(
          `Successfully updated ${field} for text note ID ${textNoteID}`
        );
        // Optionally, handle success UI update if needed
      } else {
        console.error(
          `Failed to update ${field} for text note ID ${textNoteID}`
        );
        // Optionally, handle failure UI update if needed
      }
    }
  );
}

function deleteTextNoteItem(textNoteID) {
  chrome.runtime.sendMessage(
    {
      action: "deleteTextNote",
      textNoteID: textNoteID,
    },
    (response) => {
      if (response.success) {
        console.log(`Successfully deleted text note ID ${textNoteID}`);
      } else {
        console.error(`Failed to delete text note ID ${textNoteID}`);
        // Optionally, handle failure UI update if needed
      }
    }
  );
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp || "2024-01-01 00:00:00");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const year = date.getUTCFullYear();
  return `${hours}:${minutes} (${day}/${month}/${year})`;
}

function filterTextNotes() {
  const searchTextValue = document
    .getElementById("searchText")
    .value.toLowerCase();
  const searchNoteValue = document
    .getElementById("searchNote")
    .value.toLowerCase();

  // Filter the main data (textNotes) based on search inputs
  const filteredData = textNotes.filter((item) => {
    const textMatch = item.text.toLowerCase().includes(searchTextValue);
    const noteMatch = item.note.toLowerCase().includes(searchNoteValue);
    return textMatch && noteMatch;
  });

  // Update filtered results count
  document.getElementById("filteredResults").textContent = filteredData.length;

  displayTextNote(filteredData); // Update the table with filtered data
}

function selectAllEvent() {
  // Event listener for 'Select All' checkbox
  const selectAllCheckbox = document.getElementById("selectAll");
  selectAllCheckbox.addEventListener("change", function () {
    const checkboxes = document.querySelectorAll(".select-row");
    checkboxes.forEach((checkbox) => {
      checkbox.checked = selectAllCheckbox.checked;
      // Manually trigger change event
      checkbox.dispatchEvent(new Event("change"));
    });
  });
}

function multiDeleteTextNote() {
  const checkboxes = document.querySelectorAll(".select-row:checked");
  checkboxes.forEach((checkbox) => {
    chrome.runtime.sendMessage(
      {
        action: "deleteTextNote",
        textNoteID: checkbox.itemID,
      },
      (response) => {
        if (response.success) {
          console.log(`Successfully deleted text note ID ${checkbox.itemID}`);
        } else {
          console.error(`Failed to delete text note ID ${checkbox.itemID}`);
          // Optionally, handle failure UI update if needed
        }
      }
    );
  });
  location.reload();
}

function exportSelectedTextNotes() {
  const selectedNotes = [];
  const checkboxes = document.querySelectorAll(".select-row:checked");
  checkboxes.forEach((checkbox) => {
    const index = checkbox.dataset.index;
    const { profileID, id, ...noteWithoutID } = textNotes[index]; // Exclude profileID and id
    selectedNotes.push(noteWithoutID);
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
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const importedNotes = JSON.parse(e.target.result);
      importedNotes.forEach((item) => {
        chrome.runtime.sendMessage(
          { action: "getDefaultProfile" },
          (reponse) => {
            defaultProfile = reponse.data;
            item.profileID = defaultProfile.id;
            chrome.runtime.sendMessage(
              { action: "addNewTextNote", textNote: item },
              (response) => {}
            );
          }
        );
      });
      textNotes = textNotes.concat(importedNotes); // Add the imported notes to the existing array
      displayTextNote(textNotes);
      document.getElementById("totalRows").textContent = textNotes.length;
    };
    reader.readAsText(file);
  }
}

function loadUnprofiledText() {
  const box = document.getElementById("UseDefaultProfile");
  box.checked = !box.checked;
  document.getElementById("loadUnprofiledText").textContent = box.checked
    ? "Unprofiled"
    : "profiled";
  loadTextNote();
}
