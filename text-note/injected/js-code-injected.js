// Retrieve vunData from local storage
chrome.storage.local.get({ vunData: [] }, (result) => {
  // Get the current URL
  const url = window.location.href;
  console.log('running on',url)
});

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