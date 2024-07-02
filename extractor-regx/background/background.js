console.log(
  "background has been loaded and executed successfully. extractor-regx."
);

export let activeFilter = false;

export function initDbFilterManager(db) {
  if (!db) {
    return console.log("DB not available");
  }

  if (!db.objectStoreNames.contains("filterRst")) {
    const filterStore = db.createObjectStore("filterRst", {
      keyPath: "id",
      autoIncrement: true,
    });
    filterStore.createIndex("profileID", "profileID", { unique: false });
    filterStore.createIndex("timestamp", "timestamp", { unique: false });
    console.log("FilterRst schema initialized.");
  }
}

export function filterRstOnMessageHandler(db, request, sendResponse) {
  console.log("Ander Dev requesting filterRstOnMessageHandler");

  if (!db) {
    console.log("DB not available");
    sendResponse({ data: 0 });
    return false;
  }

  switch (request.action) {
    case "filterIsActivate":
      sendResponse({ data: activeFilter });
      return true;

    case "getAllRstFilter":
      getAllRstFilter(db, request.profileID, (error, filters) => {
        if (error) {
          console.error("Failed to retrieve filters:", error);
        } else {
          console.log("Filters retrieved");
        }
        console.log(filters);
        sendResponse({ data: filters });
      });
      return true;
    case "addRstFilter":
      console.log(request);
      addRstFilter(db, request.filterRst, (error, filter) => {
        if (error) {
          console.error("Failed Result to add filter:", error);
        } else {
          console.log("Filter Result added");
        }
        sendResponse({ data: filter });
      });
      return true;
    case "updateRstFilter":
      updateFilterRst(db, request.filterRst, (error, filter) => {
        if (error) {
          console.error("Failed to update filter:", error);
        } else {
          console.log("Filter updated");
        }
        sendResponse({ data: 1 });
        return true;
      });
      return true;
    case "deleteRstFilter":
      console.log("i work");
      deleteFilterRst(db, request.filterRstId, () => {
        sendResponse({ data: 1 });
      });
      return true;
  }
}

//------------*Function To handel Message Sent*--------------------------

function getAllRstFilter(db, profileID, callback) {
  const transaction = db.transaction(["filterRst"], "readonly");
  const filterStore = transaction.objectStore("filterRst");

  const request =
    profileID === null
      ? filterStore.getAll()
      : filterStore.index("profileID").getAll(profileID);

  request.onsuccess = (event) => {
    console.log("Filters retrieved successfully");
    callback(null, event.target.result); // Pass the retrieved filters to the callback
  };

  request.onerror = (event) => {
    console.error("Error retrieving filters:", event.target.error);
    callback(event.target.error, []); // Pass an empty array to the callback in case of error
  };
}

function addRstFilter(db, filterRst, callback) {
  console.log(filterRst);
  const transaction = db.transaction(["filterRst"], "readwrite");
  const filterStore = transaction.objectStore("filterRst");
  const request = filterStore.add(filterRst);

  request.onsuccess = () => {
    console.log("Filter added successfully:", filterRst);
    callback(null, filterRst); // Pass the added filter to the callback
  };

  request.onerror = (event) => {
    console.error("Error adding filter:", event.target.error);
    callback(event.target.error, null); // Pass the error to the callback
  };
}

function updateFilterRst(db, updatedFilterRst, callback) {
  const transaction = db.transaction(["filterRst"], "readwrite");
  const filterStore = transaction.objectStore("filterRst");

  // Retrieve the object with the given id
  const getRequest = filterStore.get(updatedFilterRst.id);

  getRequest.onsuccess = (event) => {
    const filterRst = event.target.result;

    if (!filterRst) {
      const error = new Error(
        `No object found with id: ${updatedFilterRst.id}`
      );
      console.error("Error retrieving filter result:", error);
      callback(error);
      return;
    }

    // Apply the modifications to the retrieved object
    Object.assign(filterRst, updatedFilterRst);

    // Update the object in the store
    const updateRequest = filterStore.put(filterRst);

    updateRequest.onsuccess = () => {
      console.log("Filter result updated successfully:", filterRst);
      callback(null); // Signal success to the callback
    };

    updateRequest.onerror = (event) => {
      console.error("Error updating filter result:", event.target.error);
      callback(event.target.error); // Pass the error to the callback
    };
  };

  getRequest.onerror = (event) => {
    console.error("Error retrieving filter result:", event.target.error);
    callback(event.target.error); // Pass the error to the callback
  };

  transaction.oncomplete = () => {
    console.log("Transaction completed successfully.");
  };

  transaction.onerror = (event) => {
    console.error("Transaction error:", event.target.error);
  };
}

function deleteFilterRst(db, filterRstId, callback) {
  console.log(filterRstId);

  const transaction = db.transaction(["filterRst"], "readwrite");
  const filterStore = transaction.objectStore("filterRst");

  filterStore.delete(filterRstId).onsuccess = () => callback(null);
  transaction.oncomplete = () =>
    console.log("Transaction completed successfully.");
  transaction.onerror = (event) => {
    console.error("Transaction error:", event.target.error);
    callback(null);
  };
}
