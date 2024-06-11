//***********-DATABASE Management-*************/
let db;
let defaultProfile = null

console.log("Background start on run");

// Open the IndexedDB
const request = indexedDB.open('Suise_knife_GE', 1);

request.onerror = (event) => {
  console.error('IndexedDB error:', event.target.errorCode);
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
      console.error('Error adding new profile:', event.target.error);
    };
  } catch (error) {
    console.error('Transaction error:', error);
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
    console.error('Transaction error:', error);
    callback([]); // Return an empty array in case of error
  }
}

// Set the default profile by name
function setDefaultProfileByName(profileName, callback) {
  if (!db) {
    callback(null);
    return;
  }

  try {
    const transaction = db.transaction(['profiles'], 'readwrite');
    const profileStore = transaction.objectStore('profiles');
    const index = profileStore.index('profile_name');
    const getRequest = index.get(profileName);

    getRequest.onsuccess = (event) => {
      const profile = event.target.result;
      if (profile) {
        profile.default = true; // Update the 'default' property to true
        const updateRequest = profileStore.put(profile);

        updateRequest.onsuccess = () => {
          console.log('Default profile updated successfully:', profile);
          callback(profile); // Callback with the updated profile
        };

        updateRequest.onerror = (event) => {
          console.error('Error updating default profile:', event.target.error);
          callback(null); // Error occurred
        };
      } else {
        console.error('Profile not found:', profileName);
        callback(null); // Profile not found
      }
    };

    getRequest.onerror = (event) => {
      console.error('Error getting profile by name:', event.target.error);
      callback(null); // Error occurred
    };
  } catch (error) {
    console.error('Transaction error:', error);
    callback(null); // Error occurred
  }
}

//***********-CONTEXT MENU MANAGEMENT-*************/

// Create the context menu
function createContextMenu() {
  try {
    console.log('Create context menu.');
    chrome.contextMenus.create({
      id: 'profileManager',
      title: 'Profiles',
      contexts: ['all'],
    });
  } catch (error) {
    console.error('Error creating context menu:', error);
  }
}

// Edit context menu
function loadSubMenuProfiles() {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'profileManager') {
      // Remove any existing submenu items
      chrome.contextMenus.removeAll(() => {
        // Create the main context menu again
        createContextMenu();
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
              if (profile.default){
                title = `> ${profile.profile_name}`;
                defaultProfile = profile;
              }else{
                title = ` ${profile.profile_name}`;
              }
              chrome.contextMenus.create({
                id: `profile-${profile.id}`,
                parentId: 'profileManager',
                title: title,
                contexts: ['all'],
              });
            });
          }
        });
      });
    } else {
      console.log('Profile clicked:', info.menuItemId);
    }
  });
}

// Initialize context menu and submenu
createContextMenu();
loadSubMenuProfiles();
