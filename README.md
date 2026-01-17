# Dopamine Rehab Chrome Plugin

A Chrome extension to help manage time on addictive sites.

## Features

- **Universal Site Management**: Add any website domain for custom behavior control
- **Flexible Actions**: Apply Nothing, Black & White, or Force Close to any site
- **Domain Intelligence**: Supports both exact domain matching and subdomain detection
- **Easy Management**: Add, configure, and remove custom sites with a simple interface

## How to Install and Run Locally

1.  **Clone or Download** this repository to your local machine.
2.  Open the **Chrome Browser**.
3.  Navigate to `chrome://extensions/` by typing it in the address bar and pressing Enter.
4.  In the top right corner, enable **Developer mode** by clicking the toggle switch.
5.  Click the **Load unpacked** button that appears in the top left.
6.  In the file selection dialog, navigate to the directory where you saved this plugin (`C:\dev\dopamineRehabPlugin`) and select the folder.
7.  The "Dopamine Rehab Plugin" should now appear in your list of extensions.
8.  Click the **Extensions icon** (puzzle piece) in the Chrome toolbar and pin the Dopamine Rehab Plugin for easy access.
9.  Click on the plugin icon to open the dashboard and configure your settings.

## Project Structure

- `manifest.json`: The extension's configuration file.
- `src/`: Contains the source code for the dashboard.
- `dashboard.html`: The HTML structure for the configuration dashboard.
- `dashboard.js`: Logic for saving and loading settings using Chrome's storage API.

## Next Steps

- Improve the UI/UX of the dashboard.
- Add more custom site-specific features.
