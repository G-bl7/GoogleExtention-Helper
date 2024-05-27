// Retrieve vunData from local storage
chrome.storage.local.get({ vunData: [] }, (result) => {
  // Get the current URL
  const url = window.location.href;
  
  // Check if the current URL is excluded
  isExcluded(url, (excluded) => {
    // If the URL is not excluded
    if (!excluded) {
      // Get the vunData array
      let vunData = result.vunData;
      
      // Iterate over the vunData array
      vunData.forEach(item => {
        // Create a regular expression to match the text
        let regex = new RegExp(`(${item.text})`, 'gi');
        
        // Replace the text in the document body with a span element
        document.body.innerHTML = document.body.innerHTML.replace(regex, `<span class="vun-underline" title="${item.note}">$1</span>`);
      });
    }
  });
});

// Function to check if the current tab URL is in the excluded list
function isExcluded(url, callback) {
  // Retrieve excludedWebsites from local storage
  chrome.storage.local.get({ excludedWebsites: [] }, (result) => {
    // Check if any element in the excluded list starts with the URL
    const isExcluded = result.excludedWebsites.some(excludedUrl => url.startsWith(excludedUrl));

    // Log the result for debugging purposes
    console.log(isExcluded);

    // Call the callback function with the result
    callback(isExcluded);
  });
}