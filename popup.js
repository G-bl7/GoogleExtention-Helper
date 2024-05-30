document.addEventListener('DOMContentLoaded', function () {
  let filterActive = false;

  // Event listener for the import button
  document.getElementById('importButton').addEventListener('click', function () {
    document.getElementById('importFile').click();
  });

  // Event listener for the file input change
  document.getElementById('importFile').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      importData(file);
    }
  });

  // Event listener for the edit button
  document.getElementById('editButton').addEventListener('click', function () {
    chrome.tabs.create({ url: chrome.runtime.getURL('edit.html') });
  });

  // Event Listner for Filter manager
  document.getElementById('manageFilters').addEventListener('click',function(){
    chrome.tabs.create({ url: chrome.runtime.getURL('manage_filters.html') });
  });
  // Event listener for adding an excluded domain
  document.getElementById('addExclude').addEventListener('click', function () {
    const domain = prompt('Enter the domain to exclude (e.g., example.com):');
    if (domain) {
      chrome.storage.local.get({ excludedWebsites: [] }, function (result) {
        const excludedWebsites = result.excludedWebsites;
        if (!excludedWebsites.includes(domain)) {
          excludedWebsites.push(domain);
          chrome.storage.local.set({ excludedWebsites: excludedWebsites }, function () {
            alert('Domain added to excluded list.');
          });
        } else {
          alert('Domain is already in the excluded list.');
        }
      });
    }
  });

  // Event listener for managing excluded domains
  document.getElementById('manageExclude').addEventListener('click', function () {
    chrome.tabs.create({ url: chrome.runtime.getURL('manage_excluded.html') });
  });

  // Event listener for exporting data
  document.getElementById('exportButton').addEventListener('click', function () {
    chrome.storage.local.get({ excludedWebsites: [], vunData: {} }, function (result) {
      const data = {
        excludedWebsites: result.excludedWebsites,
        vunData: result.vunData
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

  // Event listener for applying or stopping the filter
  document.getElementById('applyFilter').addEventListener('click', function () {
    filterActive = !filterActive;
    chrome.storage.local.set({ filterActive: filterActive });
    if (filterActive) {
      // Triggering update for the active tab
      document.getElementById('applyFilter').querySelector('span').textContent = 'Stop Filter Collection';
      console.log(filterActive);
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs && tabs.length > 0) {
          const activeTabId = tabs[0].id;
          chrome.tabs.update(activeTabId, { url: tabs[0].url });
        } else {
          console.error('No active tab found.');
        }
      });
      console.groupEnd();
    }else{
      document.getElementById('applyFilter').querySelector('span').textContent = 'Apply Filter';
    }
  });


  // Event listener for managing temporary data
  document.getElementById('manageTmp').addEventListener('click', function () {
    chrome.tabs.create({ url: chrome.runtime.getURL('manage_tmp.html') });
  });

  // Event listener for exporting temporary data
  document.getElementById('exportTmp').addEventListener('click', function () {
    chrome.storage.local.get(['tmpExtractedText'], function (result) {
      let tmpExtractedText = result.tmpExtractedText || [];
      if (!Array.isArray(tmpExtractedText)) {
        tmpExtractedText = [tmpExtractedText];
      }
      if (tmpExtractedText.length === 0) {
        alert('No temporary data to export.');
        return;
      }
      
      const textData = tmpExtractedText.join('\n');
      const blob = new Blob([textData], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'tmpExtractedText.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      chrome.storage.local.remove('tmpExtractedText', function () {
        console.log('Temporary extracted text data has been exported and cleared.');
      });
    });
  });

  // Event listener for clearing temporary data
  document.getElementById('clearTmp').addEventListener('click', function () {
    chrome.storage.local.remove('tmpExtractedText', function () {
      alert('Temporary extracted text data has been cleared.');
    });
  });

  // Function to import data from a file
  function importData(file) {

    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const importedData = JSON.parse(event.target.result);

        chrome.storage.local.get(null, function (currentData) {
          const newData = { ...currentData };

          // Append the imported data to the existing data
          for (const key in importedData) {
            if (importedData.hasOwnProperty(key)) {
              if (Array.isArray(importedData[key]) && Array.isArray(currentData[key])) {
                newData[key] = [...new Set([...currentData[key], ...importedData[key]])]; // Merge and remove duplicates
              } else if (typeof importedData[key] === 'object' && importedData[key] !== null && typeof currentData[key] === 'object' && currentData[key] !== null) {
                newData[key] = { ...currentData[key], ...importedData[key] };
              } else {
                newData[key] = importedData[key]; // Overwrite if types do not match
              }
            }
          }
          console.log(newData);
          chrome.storage.local.set(newData, function () {
            if (chrome.runtime.lastError) {
              console.error('Error setting data in storage:', chrome.runtime.lastError);
            } else {
              console.log('Data imported and appended:', newData);
            }
          });
        });
      } catch (error) {
        console.error('Error parsing imported file:', error);
      }
    };

    reader.readAsText(file);
  }


  // Initialize filter button state based on stored filter status
  chrome.storage.local.get('filterActive', function (result) {
    if (result.filterActive) {
      document.getElementById('applyFilter').querySelector('span').textContent = 'Stop Filter Collection';
      filterActive = true;
    }
  });
});
