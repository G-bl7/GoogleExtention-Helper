# Vun Text Saver Chrome Extension

Vun Text Saver is a Chrome extension that allows you to save selected text from any webpage along with an optional note and tag. The saved text will be underlined on the webpage where it was saved. You can also edit, delete, export, and import your saved data, and manage excluded websites.

## Features

- Save selected text with an optional note and tag.
- Underline saved text on any webpage.
- Tags for saved text: Urgent, Important, High Priority, Deadline, Follow-up.
- Edit and delete saved text, notes, and tags.
- Export saved data to a JSON file.
- Import data from a JSON file.
- Exclude specific websites from the extension's functionality.
- Manage excluded websites through a dedicated interface.

## Installation

1. Clone or download this repository to your local machine.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" by clicking the toggle switch in the top right corner.
4. Click the "Load unpacked" button and select the directory containing the extension files.

## Usage

1. **Save Text**: Select text on any webpage, right-click, and choose "Save Text to Vun". A dialog will prompt you to add a note and select a tag.
2. **View/Edit Data**: Click the extension icon and then the "Edit" button to open a new tab with a table of your saved data. Here, you can edit, delete, export, and import data.
3. **Export Data**: Click the "Export" button to download your saved data as a JSON file.
4. **Import Data**: Click the "Import" button and select a JSON file to upload and replace the current data.
5. **Manage Excluded Websites**: Right-click on any webpage and select "Manage Excluded Websites" to open a new tab where you can search, update, and delete excluded websites. Use "Add Excluded Website" to add the current domain to the excluded list.

## Files

- `manifest.json`: Extension manifest file that defines the extension's properties and permissions.
- `background.js`: Background script to handle saving selected text with notes and tags, and manage excluded websites.
- `content.js`: Content script to underline saved text on the webpage and prompt for notes and tags.
- `styles.css`: Stylesheet for custom underlined text.
- `popup.html`: HTML file for the extension's popup interface.
- `popup.js`: JavaScript file for handling the popup interface actions.
- `edit.html`: HTML file for the edit data interface.
- `edit.js`: JavaScript file for handling the edit data interface actions.
- `manage_excluded.html`: HTML file for managing excluded websites.
- `manage_excluded.js`: JavaScript file for handling the manage excluded websites interface actions.

## Development

To modify and enhance the extension, follow these steps:

1. Make your changes to the source files.
2. Reload the extension on the `chrome://extensions/` page to see your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
