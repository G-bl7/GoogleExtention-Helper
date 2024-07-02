let textFiltredRst = []; // Variable to store the main data
let selectedRow = 0;

document.addEventListener("DOMContentLoaded", () => {
  loadFilterRst();
  selectAllEvent();
  document
    .getElementById("filterByText")
    .addEventListener("input", filterResultsByText);

  document
    .getElementById("loadUnprofiliedRstText")
    .addEventListener("click", loadUnprofiliedRstText);
  document.getElementById("exportFilteredRst").addEventListener("click", test);

  document
    .getElementById("multideletebutton")
    .addEventListener("click", multideletebuttonBehavoir);

  document
    .getElementById("exportFilteredRst")
    .addEventListener("click", exportToFile);
});

function loadFilterRst() {
  const useDefaultProfile =
    document.getElementById("UseDefaultProfile").checked;
  document.getElementById("selectedTextCount").textContent = 0;

  const fetchAndDisplayFilters = (profileID, profileName) => {
    chrome.runtime.sendMessage(
      { action: "getAllRstFilter", profileID: profileID },
      (response) => {
        textFiltredRst = response.data;
        displayFilterRst(textFiltredRst);
        document.getElementById("totalTexts").textContent =
          textFiltredRst.length;
      }
    );
    document.getElementById("profileName").textContent = profileName;
  };

  if (useDefaultProfile) {
    chrome.runtime.sendMessage({ action: "getDefaultProfile" }, (response) => {
      const { profile_name, id } = response.data;
      fetchAndDisplayFilters(id, `${profile_name} / ${id}`);
    });
  } else {
    fetchAndDisplayFilters(null, "SYSTEM / ");
  }
}

function displayFilterRst(filteredData) {
  document.getElementById("selectAllText").checked = false;
  const tableBody = document.getElementById("filteredTextResults");
  tableBody.innerHTML = "";

  filteredData.forEach((item, index) => {
    const row = document.createElement("tr");

    const createCell = (content) => {
      const cell = document.createElement("td");
      cell.appendChild(content);
      return cell;
    };

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("select-row");
    checkbox.dataset.id = item.id;
    checkbox.addEventListener("change", function () {
      selectedRow += this.checked ? 1 : -1;
      document.getElementById("selectedTextCount").textContent = selectedRow;
    });

    const textCell = document.createElement("td");
    textCell.contentEditable = "true";
    textCell.textContent = item.filterRst || "";
    textCell.addEventListener("blur", function () {
      updatedFilterRst({ filterRst: this.textContent, id: item.id }, index);
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      deleteRstFilter(item.id);
      loadFilterRst();
    });

    row.appendChild(createCell(checkbox));
    row.appendChild(textCell);
    row.appendChild(
      createCell(document.createTextNode(formatTimestamp(item.timestamp)))
    );
    row.appendChild(createCell(deleteButton));

    tableBody.appendChild(row);
  });

  document.getElementById("filteredResultsCount").textContent =
    filteredData.length;
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp || "2024-01-01 00:00:00");
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} (${pad(
    date.getUTCDate()
  )}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()})`;
}

function selectAllEvent() {
  const selectAllCheckbox = document.getElementById("selectAllText");

  selectAllCheckbox.addEventListener("change", function () {
    const checkboxes = document.querySelectorAll(".select-row");

    checkboxes.forEach((checkbox) => {
      checkbox.checked = selectAllCheckbox.checked;
      checkbox.dispatchEvent(new Event("change"));
    });
  });
}

function filterResultsByText() {
  const searchText = document
    .getElementById("filterByText")
    .value.toLowerCase();
  const filteredData = textFiltredRst.filter((item) =>
    item.filterRst.toLowerCase().includes(searchText)
  );
  displayFilterRst(filteredData);
}

function test() {
  console.log("test");
  chrome.runtime.sendMessage(
    {
      action: "addRstFilter",
      filterRst: {
        filterRst: "Sample test",
        profileId: 1,
        timestamp: new Date().getTime(),
      },
    },
    function (response) {
      console.log(response);
    }
  );
}

function updatedFilterRst(filterRst, index) {
  if (index !== -1) {
    textFiltredRst[index].filterRst = filterRst.filterRst;
  }
  chrome.runtime.sendMessage(
    {
      action: "updateRstFilter",
      filterRst: filterRst,
    },
    function (response) {
      console.log(response);
    }
  );
}

function deleteRstFilter(filterRstId) {
  chrome.runtime.sendMessage(
    {
      action: "deleteRstFilter",
      filterRstId: filterRstId,
    },
    function (response) {
      console.log(response);
    }
  );
}

function multideletebuttonBehavoir() {
  const checkboxes = document.querySelectorAll(".select-row:checked");
  const deletePromises = Array.from(checkboxes).map(
    (checkbox) =>
      new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            action: "deleteRstFilter",
            filterRstId: Number(checkbox.dataset.id),
          },
          (response) => resolve()
        );
      })
  );

  Promise.all(deletePromises).then(loadFilterRst);
}

function exportToFile() {
  const selectedCheckboxes = document.querySelectorAll(".select-row:checked");
  let dataToExport = [];

  if (selectedCheckboxes.length > 0) {
    selectedCheckboxes.forEach((checkbox) => {
      const row = checkbox.closest("tr");
      const textCell = row.querySelector("td:nth-child(2)").textContent;
      dataToExport.push(textCell);
    });
  } else {
    textFiltredRst.forEach((item) => {
      dataToExport.push(item.filterRst);
    });
  }

  const blob = new Blob([dataToExport.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "exported_texts.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
