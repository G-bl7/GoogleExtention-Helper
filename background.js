// background.js

import { addNewProfile, getAllProfiles, setDefaultProfileByName, getDefaultProfile, deleteProfileByName, updateProfileName } from './profileManager/js/profileManager.js';

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Welcome to G-bl7 Assistant 1.1');
  }
});

//***********-DB Managment-*************/

let db;

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
      addNewProfile({ profile_name: 'Default', default: 1 }, db);
    };
  }
};

//***********-CONTEXT MENU MANAGEMENT-*************/

// Create the Main context menu
function createContextMenu() {
  try {
    console.log('Create Main context menu.');
    chrome.contextMenus.create({
      id: 'profileManager',
      title: 'Profiles',
      contexts: ['all'],
    });
  } catch (error) {
    console.log('Error creating context menu:', error);
  }
}

// Create new profile map
let profilesMap = new Map();

// set sub menu with profiles
function loadSubMenuProfilesPoc() {
  // Remove any existing submenu items
  chrome.contextMenus.removeAll(() => {
    // Create the main context menu again
    createContextMenu();
    // Get all profiles and create submenu items
    getAllProfiles(db, (profiles) => {
      console.log(profiles);
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
          let title;
          if (profile.default) {
            title = `> ${profile.profile_name}`;
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
          profilesMap.set(`profile-${profile.id}`, profile);
        });
      }
    });
  });
}

// Edit Sub context menu
function loadProfiles2SubMenu() {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'profileManager') {
      loadSubMenuProfilesPoc();
    } else if (profilesMap.has(info.menuItemId)) {
      //Set new Default profile.
      console.log('Set new Default profile.');
      let newProfile = profilesMap.get(info.menuItemId);
      getDefaultProfile(db, (defaultProfile) => {
        setDefaultProfileByName(db, defaultProfile.profile_name, newProfile.profile_name);
      });
      loadSubMenuProfilesPoc();
    }
  });
}

//***********-EVENT Handler-*************/

// Handle messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getAllProfiles') {
    getAllProfiles(db, (profiles) => {
      sendResponse({ profiles: profiles });
    });
    return true;
  } else if (request.action === 'addNewProfile') {
    addNewProfile(request.profileData, db);
    sendResponse({});
    return true;
  } else if (request.action === 'updateProfileName') {
    updateProfileName(db, request.oldProfileName, request.newProfileName);
    sendResponse({});
    return true;
  } else if (request.action === 'setDefaultProfile') {
    console.log('On background', request)
    getDefaultProfile(db, (defaultProfile) => {
      setDefaultProfileByName(db, defaultProfile.profile_name, request.profileName);
    });
    sendResponse({});
    return true;
  } else if (request.action === 'deleteProfile') {
    getDefaultProfile(db, (profile) => {
      if (profile.profile_name == request.profileName) {
        console.log("can't delete default profile.")
        sendResponse({ onsucces: false });
        return true;
      } else {
        deleteProfileByName(db, request.profileName);
        sendResponse({ onsucces: true });
        return true;
      }
    });
  } else if (request.action === 'getDefaultProfile') {
    getDefaultProfile(db, (profile) => {
      sendResponse({ profile: profile });
    });
    return true;
  } else if (request.action === 'loadSubMenuProfilesPoc') {
    loadSubMenuProfilesPoc();
    sendResponse({});
    return true;
  }
  return false;
});


//***********-INIT-*************/

// Initialize context menu and submenu
createContextMenu();
loadProfiles2SubMenu();