document.addEventListener('DOMContentLoaded', function () {
  // Import button event listener
  document.getElementById('importButton').addEventListener('click', function () {
    // Trigger click on hidden file input element
    document.getElementById('fileInput').click();
  });

  // Listen for changes in the file input
  document.getElementById('fileInput').addEventListener('change', function (event) {
    var file = event.target.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var importedData;
        try {
          // Parse the JSON data
          importedData = JSON.parse(e.target.result);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          return;
        }

        // Save imported data to chrome.storage.local
        chrome.storage.local.set(importedData, function () {
          console.log('Data imported:', importedData);
          // Update the displayed filters and default filter value
          displayData();
        });
      };
      reader.readAsText(file);
    }
  });

  document.getElementById('exportButton').addEventListener('click', function () {
    // Retrieve the filters and default filter from chrome.storage.local
    chrome.storage.local.get(['filters', 'defaultFilter'], function (result) {
      var data = {
        filters: result.filters || [],
        defaultFilter: result.defaultFilter || null
      };

      // Create a Blob object containing the data
      var blob = new Blob([JSON.stringify(data)], { type: 'application/json' });

      // Create a temporary link element to download the file
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'data.json';

      // Append the link to the body and click it programmatically to trigger download
      document.body.appendChild(link);
      link.click();

      // Remove the temporary link element
      document.body.removeChild(link);
    });
  });

  document.getElementById('addButton').addEventListener('click', function () {
    // Prompt the user to enter a new filter
    var newFilter = prompt("Enter the new filter:");

    // Check if the user entered something
    if (newFilter !== null && newFilter !== "") {
      // Retrieve the existing filters from chrome.storage.local
      chrome.storage.local.get(['filters'], function (result) {
        var filters = result.filters || [];
        filters.push(newFilter);

        // Save the updated filters in chrome.storage.local
        chrome.storage.local.set({ filters: filters }, function () {
          console.log('Filter added:', newFilter);
          // Update the displayed filters
          displayData();
        });
      });
    }
  });

  // New event listener for setting default filter
  document.getElementById('setDefaultButton').addEventListener('click', function () {
    var defaultFilter = prompt("Enter the default filter:");

    // Check if the user entered something
    if (defaultFilter !== null && defaultFilter !== "") {
      // Save the default filter value in local storage
      chrome.storage.local.set({ defaultFilter: defaultFilter }, function () {
        console.log('Default filter set:', defaultFilter);
        // Update the displayed default filter value
        document.getElementById('defaultFilterValue').textContent = defaultFilter;
      });
    }
  });

  // Function to display filters and default filter value
  function displayData() {
    // Display filters
    chrome.storage.local.get(['filters'], function (result) {
      var filters = result.filters || [];
      displayFilters(filters);
    });

    // Display default filter value
    chrome.storage.local.get(['defaultFilter'], function (result) {
      var defaultFilter = result.defaultFilter || "---"; // Default value if not set
      document.getElementById('defaultFilterValue').textContent = defaultFilter;
    });
  }

  // Function to display filters
  function displayFilters(filters) {
    var filterList = document.getElementById('filterList');
    filterList.innerHTML = ''; // Clear previous content

    // Loop through each filter and create HTML elements
    filters.forEach(function (filter, index) {
      var filterItem = document.createElement('div');
      filterItem.innerHTML = filter + ' <button class="editButton" data-index="' + index + '">Edit</button> <button class="deleteButton" data-index="' + index + '">Delete</button>';
      filterList.appendChild(filterItem);
    });

    // Add event listeners for edit and delete buttons
    var editButtons = document.querySelectorAll('.editButton');
    var deleteButtons = document.querySelectorAll('.deleteButton');

    editButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var index = parseInt(button.dataset.index);
        var editedFilter = prompt("Enter the edited filter:", filters[index]);
        if (editedFilter !== null && editedFilter !== "") {
          filters[index] = editedFilter;




          ChatGPT
          chrome.storage.local.set({ filters: filters }, function () {
            console.log('Filter edited:', editedFilter);
            displayFilters(filters);
          });
        }
      });
    });

    deleteButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var index = parseInt(button.dataset.index);
        if (confirm("Are you sure you want to delete this filter?")) {
          filters.splice(index, 1);
          chrome.storage.local.set({ filters: filters }, function () {
            console.log('Filter deleted.');
            displayFilters(filters);
          });
        }
      });
    });
  }

  // Initial call to display filters and default filter value when the page loads
  displayData();
});