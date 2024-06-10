//***********-DATABASE Management-*************/
let db;
let available = false;

console.log("Background start On run");

const request = indexedDB.open('Suise_knife_GE', 1);

request.onerror = function (event) {
  console.error('IndexedDB error:', event.target.errorCode);
};

request.onsuccess = function (event) {
  console.log('IndexedDB on success.');
  db = event.target.result;
  available = true;
  create_context_menu();  // Moved here to ensure DB is ready
};

// Handle extension installation
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    console.log('Welcome to G-bl7 Assistant 1.1');
  }
});

// On upgrade && installation 
request.onupgradeneeded = function (event) {
  console.log('IndexedDB on upgrade needed.');
  db = event.target.result;

  if (!db.objectStoreNames.contains('profiles')) {
    const profileStore = db.createObjectStore('profiles', { keyPath: 'id', autoIncrement: true });
    profileStore.createIndex('profile_name', 'profile_name', { unique: true });
    profileStore.createIndex('default', 'default', { unique: false });
    console.log('profiles schema INIT.');
    
    // Add the new profile after the object store and indexes are created
    profileStore.transaction.oncomplete = function (event) {
      const new_profile = {
        profile_name: 'Default',
        default: true
      };
      addNewProfile(new_profile);
      const new_profile2 = {
        profile_name: 'Vuln',
        default: false
      };
      addNewProfile(new_profile2);
    };
  }
};

//***********-PROFILE MANAGEMENT-*************/

// Add new profile
function addNewProfile(profileData) {
  if (!available) return; // Check if DB is available

  const transaction = db.transaction(['profiles'], 'readwrite');
  const profileStore = transaction.objectStore('profiles');

  const addRequest = profileStore.add(profileData);

  addRequest.onsuccess = function (event) {
    console.log('New profile added successfully');
  };

  addRequest.onerror = function (event) {
    console.error('Error adding new profile:', event.target.error);
  };
}

// Get Default profile
function selectDefaultProfile() {

  return new Promise((resolve, reject) => {

    if (!available) {
      reject('DB is not available');
      return;
    }

    const transaction = db.transaction(['profiles'], 'readonly');
    const profileStore = transaction.objectStore('profiles');
    const index = profileStore.index('default');

    console.log('Opening cursor to select default profile...');
    const request = index.openCursor(IDBKeyRange.only(true));

    request.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        const defaultProfile = cursor.value;
        console.log('Default profile found:', defaultProfile);
        resolve(defaultProfile);
      } else {
        console.log('No default profile found.');
        resolve(null);
      }
    };

    request.onerror = function (event) {
      console.error('Error selecting default profile:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Get all profiles
function getAllProfiles(callback) {
  if (!available) {
    callback([]);
    return;
  }

  console.log('Getting All Profiles');
  const transaction = db.transaction(['profiles'], 'readonly');
  const profileStore = transaction.objectStore('profiles');

  const request = profileStore.getAll();

  request.onsuccess = function (event) {
    const profiles = event.target.result;
    callback(profiles);
  };

  request.onerror = function (event) {
    console.error('Error getting all profiles:', event.target.error);
    callback([]); // Return an empty array in case of error
  };
}

// Set the Default Profile
function setDefaultProfileByName(profileName, callback) {
  if (!available) {
    callback(null);
    return;
  }

  const transaction = db.transaction(['profiles'], 'readwrite');
  const profileStore = transaction.objectStore('profiles');
  const index = profileStore.index('profile_name');

  const request = index.get(profileName);

  request.onsuccess = function (event) {
    const profile = event.target.result;
    if (profile) {
      profile.default = true; // Update the 'default' property to true
      const updateRequest = profileStore.put(profile); // Put the updated profile back into the object store

      updateRequest.onsuccess = function (event) {
        console.log('Default profile updated successfully:', profile);
        callback(profile); // Callback with the updated profile
      };

      updateRequest.onerror = function (event) {
        console.error('Error updating default profile:', event.target.error);
        callback(null); // Error occurred
      };
    } else {
      console.error('Profile not found:', profileName);
      callback(null); // Profile not found
    }
  };

  request.onerror = function (event) {
    console.error('Error getting profile by name:', event.target.error);
    callback(null); // Error occurred
  };
}
