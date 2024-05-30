# Vun Text Saver Chrome Extension

Vun Text Saver is a powerful Chrome extension designed to enhance your browsing experience by allowing you to save selected text from any webpage, 
complete with optional notes and tags. The saved text is underlined on the webpage for easy identification. Additionally,
 you can edit, delete, export, and import your saved data, and manage excluded websites to customize your experience.
  The extension also features a Regex filtering capability, including a default IP filter, which is automatically applied to webpages you visit. Filtered results are temporarily stored in a data structure that can be exported when needed.

## Features

- Save selected text with an optional note and tag.
- Underline saved text on any webpage.
- Tags for saved text: Urgent, Important, High Priority, Deadline, Follow-up.
- Edit and delete saved text, notes, and tags.
- Export saved data to a JSON file.
- Import data from a JSON file.
- Exclude specific websites from the extension's functionality.
- Apply Regex Filter: Vun Text Saver facilitates the application of Regex filters, enabling users to refine their browsing experience based on specific criteria.
- Add/Delete Filters (Regex): Users have the flexibility to easily add or remove Regex filters according to their preferences, allowing for a personalized browsing environment.
- Export Found Text: The extension offers the functionality to export text that has been identified, providing users with a convenient way to manage and utilize their collected information.


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
6. **Apply Filter**: Click on the "Apply Filter" button to filter text with the default Regex on the webpage source.
7. **Manage Found Text**: Click on the "Manage Tmp" button to see found text on a new HTML page.
8. **Manage Filters**: You can manage filters by adding, deleting, and setting defaults by clicking on "Manage Filter".
9. **Export Found Text**: With "Export Tmp", you can export found text to a specific file.
10. **Clear the Buffer**: "Clean Tmp" gives you the possibility to clean found text that is saved in the temporary buffer.


## Development

To modify and enhance the extension, follow these steps:

1. Make your changes to the source files.
2. Reload the extension on the `chrome://extensions/` page to see your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
