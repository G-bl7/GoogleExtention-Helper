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
        console.log("ok----")
        // Replace the text in the document body with a span element
        underlineText(document.body, regex, item.note);
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

// Function to underline text
function underlineText(node, regex, note) {
  if (node.nodeType === Node.TEXT_NODE) {
    const matches = node.textContent.match(regex);
    if (matches) {
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;

      matches.forEach(match => {
        const matchIndex = node.textContent.indexOf(match, lastIndex);
        fragment.appendChild(document.createTextNode(node.textContent.slice(lastIndex, matchIndex)));

        const span = document.createElement('span');
        span.className = 'vun-underline';
        span.title = note;
        span.textContent = match;
        fragment.appendChild(span);

        lastIndex = matchIndex + match.length;
      });

      fragment.appendChild(document.createTextNode(node.textContent.slice(lastIndex)));
      node.parentNode.replaceChild(fragment, node);
    }
  } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
    node.childNodes.forEach(child => underlineText(child, regex, note));
  }
}
