document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get('tmpExtractedText', function (result) {
        var tmpContent = result.tmpExtractedText || [];
        var contentElement = document.getElementById('tmpContent');
        contentElement.innerHTML = ''; // Clear any existing content
        if (Array.isArray(tmpContent) && tmpContent.length > 0) {
            tmpContent.forEach(function (ip) {
                var p = document.createElement('p');
                p.textContent = ip;
                contentElement.appendChild(p);
            });
        } else {
            var p = document.createElement('p');
            p.textContent = 'No content available.';
            contentElement.appendChild(p);
        }
    });
});
