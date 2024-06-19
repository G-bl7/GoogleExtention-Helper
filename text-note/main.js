console.log(
  "Popup main.js has been loaded and executed successfully. textNote"
);

document
  .getElementById("textNoteManagerButton")
  .addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "getDefaultProfile" }, (response) => {
      if (response.data) {
        console.log(response);

        chrome.tabs.create({
          url: chrome.runtime.getURL(
            "text-note/main-dashboard/text-not-manager.html?id=" +
              response.data.id +
              "&&name=" +
              response.data.profile_name
          ),
        });
      }
    });
  });
