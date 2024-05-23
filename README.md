# Vun Text Saver Chrome Extension

Vun Text Saver is a Chrome extension that allows you to save selected text from any webpage along with an optional note. The saved text will be underlined on the webpage where it was saved. You can also edit, delete, export, and import your saved data.

## Features

- Save selected text with an optional note.
- Underline saved text on any webpage.
- Edit and delete saved text and notes.
- Export saved data to a JSON file.
- Import data from a JSON file.

## Installation

1. Clone or download this repository to your local machine.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" by clicking the toggle switch in the top right corner.
4. Click the "Load unpacked" button and select the directory containing the extension files.

## Usage

1. **Save Text**: Select text on any webpage, right-click, and choose "Save Text to Vun". You will be prompted to add a note.
2. **View/Edit Data**: Click the extension icon and then the "Edit" button to open a new tab with a table of your saved data. Here, you can edit, delete, export, and import data.
3. **Export Data**: Click the "Export" button to download your saved data as a JSON file.
4. **Import Data**: Click the "Import" button and select a JSON file to upload and replace the current data.

## Files

- `manifest.json`: Extension manifest file that defines the extension's properties and permissions.
- `background.js`: Background script to handle saving selected text with notes.
- `content.js`: Content script to underline saved text on the webpage.
- `styles.css`: Stylesheet for custom underlined text.
- `popup.html`: HTML file for the extension's popup interface.
- `popup.js`: JavaScript file for handling the popup interface actions.
- `edit.html`: HTML file for the edit data interface.
- `edit.js`: JavaScript file for handling the edit data interface actions.

## Development

To modify and enhance the extension, follow these steps:

1. Make your changes to the source files.
2. Reload the extension on the `chrome://extensions/` page to see your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
