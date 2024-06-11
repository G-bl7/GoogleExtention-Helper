//***********-DATABASE Management-*************/
let db;
let defaultProfile = null;

console.log("Background start on run");

// Open the IndexedDB
const request = indexedDB.open('Suise_knife_GE', 1);

request.onerror = (event) => {
  console.log('IndexedDB error:', event.target.errorCode);
};

request.onsuccess = (event) => {
  console.log('IndexedDB on success.');
  db = event.target.result;
};

request.onupgradeneeded = (event) => {
  console.log('IndexedDB on upgrade needed.');
  db = event.target.result;

  if (!db.objectStoreNames.contains('profiles')) {
    const profileStore = db.createObjectStore('profiles', { keyPath: 'id', autoIncrement: true });
    profileStore.createIndex('profile_name', 'profile_name', { unique: true });
    profileStore.createIndex('default', 'default', { unique: false });
    console.log('Profiles schema initialized.');

    profileStore.transaction.oncomplete = () => {
      addNewProfile({ profile_name: 'Default', default: true });
      addNewProfile({ profile_name: 'Vuln', default: false });
    };
  }
};

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Welcome to G-bl7 Assistant 1.1');
  }
});

//***********-PROFILE MANAGEMENT-*************/

// Add new profile
function addNewProfile(profileData) {
  if (!db) {
    console.log('DB not available');
    return;
  }

  try {
    const transaction = db.transaction(['profiles'], 'readwrite');
    const profileStore = transaction.objectStore('profiles');
    const addRequest = profileStore.add(profileData);

    addRequest.onsuccess = () => {
      console.log('New profile added successfully');
    };

    addRequest.onerror = (event) => {
      console.log('Error adding new profile:', event.target.error);
    };
  } catch (error) {
    console.log('Transaction error:', error);
  }
}

// Get all profiles
function getAllProfiles(callback) {
  if (!db) {
    console.log('DB not available');
    return;
  }

  try {
    console.log('Getting all profiles');
    const transaction = db.transaction(['profiles'], 'readonly');
    const profileStore = transaction.objectStore('profiles');
    const getAllRequest = profileStore.getAll();

    getAllRequest.onsuccess = (event) => {
      const profiles = event.target.result;
      callback(profiles);
    };

    getAllRequest.onerror = (event) => {
      console.log('Error getting all profiles:', event.target.error);
      callback([]); // Return an empty array in case of error
    };
  } catch (error) {
    console.log('Transaction error:', error);
    callback([]); // Return an empty array in case of error
  }
}

// Set the default profile by name
function setDefaultProfileByName(oldProfileName, newProfileName) {
  if (!db || oldProfileName == newProfileName) {
    console.log('Set new profile abord.')
    return;
  }

  try {
    const transaction = db.transaction(['profiles'], 'readwrite');
    const profileStore = transaction.objectStore('profiles');
    const index = profileStore.index('profile_name');

    // Change the old profile and set to False default flag
    const getRequestOld = index.get(oldProfileName);
    getRequestOld.onsuccess = (event) => {
      const oldProfile = event.target.result;
      if (oldProfile) {
        oldProfile.default = false; // Update the 'default' property to false
        const updateRequestOld = profileStore.put(oldProfile);
        updateRequestOld.onsuccess = () => {
          console.log('Old profile updated successfully:', oldProfile);
        };
        updateRequestOld.onerror = (event) => {
          console.log('Error updating old profile:', event.target.error);
        };
      } else {
        console.log('Old profile not found:', oldProfileName);
      }
    };

    // set the new profile default flag to True
    const getRequestNew = index.get(newProfileName);
    getRequestNew.onsuccess = (event) => {
      const newProfile = event.target.result;
      if (newProfile) {
        newProfile.default = true; // Update the 'default' property to true
        const updateRequestNew = profileStore.put(newProfile);
        updateRequestNew.onsuccess = () => {
          console.log('New default profile updated successfully:', newProfile);
        };
        updateRequestNew.onerror = (event) => {
          console.log('Error updating new default profile:', event.target.error);
        };
      } else {
        console.log('New default profile not found:', newProfileName);
      }
    };

  } catch (error) {
    console.log('Transaction error:', error);
  }
}


//***********-CONTEXT MENU MANAGEMENT-*************/

// Create the Main context menu
function createContextMenu() {
  try {
    console.log('Create context menu.');
    chrome.contextMenus.create({
      id: 'profileManager',
      title: 'Profiles',
      contexts: ['all'],
    });
  } catch (error) {
    console.log('Error creating context menu:', error);
  }
}

// set sub menu with profiles
function loadSubMenuProfilesPoc() {
  // Remove any existing submenu items
  chrome.contextMenus.removeAll(() => {
    // Create the main context menu again
    createContextMenu();
    // Create new map
    users = new Map()
    // Get all profiles and create submenu items
    getAllProfiles(async (profiles) => {
      if (profiles.length === 0) {
        console.log("No profiles found");
        chrome.contextMenus.create({
          id: 'noProfiles',
          parentId: 'profileManager',
          title: 'No profiles available',
          contexts: ['all'],
        });
      } else {
        profiles.forEach((profile) => {
          if (profile.default) {
            title = `> ${profile.profile_name}`;
            defaultProfile = profile;
          } else {
            title = ` ${profile.profile_name}`;
          }
          chrome.contextMenus.create({
            id: `profile-${profile.id}`,
            parentId: 'profileManager',
            title: title,
            contexts: ['all'],
          });
          // add profile user to map
          users.set(`profile-${profile.id}`, profile);
        });
        chrome.contextMenus.create({
          id: `AddNewProfile`,
          parentId: 'profileManager',
          title: 'Add Profile',
          contexts: ['all'],
        });
      }
    });
  });
}

// Edit Sub context menu
function loadProfiles2SubMenu() {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'profileManager') {
      loadSubMenuProfilesPoc()
    } else if (users.has(info.menuItemId)) {
      console.log('Set new Default profile.')
      newProfile = users.get(info.menuItemId);
      setDefaultProfileByName(defaultProfile.profile_name, newProfile.profile_name);
      loadSubMenuProfilesPoc();
      defaultProfile = newProfile;
    }
  });
}

// Initialize context menu and submenu
createContextMenu();
loadProfiles2SubMenu();