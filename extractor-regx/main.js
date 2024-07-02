console.log("Popup main.js has been loaded and executed successfully. extractor-regx.");


// Add event listeners to the buttons
document.getElementById('filterBtmID').addEventListener('click', filterBihavoir);
document.getElementById('manageRstID').addEventListener('click', filterRstBehavoir);
document.getElementById('filterMngID').addEventListener('click', filterMngBihavoir);
document.getElementById('filterRstExprt').addEventListener('click', filterRstExprtBihavoir);
document.getElementById('filterRstClr').addEventListener('click', filterRstClrtBihavoir);


// Function definitions
function filterBihavoir() {

    chrome.runtime.sendMessage({ action: "filterIsActivate" }, (reponse) => {
        const button = document.getElementById('filterBtmID');
        const icon = button.querySelector('i');
        const text = button.querySelector('span');

        if (button.classList.contains('filter-applied')) {
            // Change to initial state
            icon.className = 'fas fa-filter';
            text.textContent = 'Apply Filter';
            button.classList.remove('filter-applied');
        } else {
            // Change to stop filter state
            icon.className = 'fas fa-stop';
            text.textContent = 'Stop Filter';
            button.classList.add('filter-applied');
        }
    });
}


function filterRstBehavoir() {
    chrome.tabs.create({ url: chrome.runtime.getURL('extractor-regx/main-dashboard/filterRst/index.html') })
}

function filterMngBihavoir() {
    chrome.tabs.create({ url: chrome.runtime.getURL('extractor-regx/main-dashboard/filterMng/index.html') })
}

function filterRstExprtBihavoir() {
}

function filterRstClrtBihavoir() {

}