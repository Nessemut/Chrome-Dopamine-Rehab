# Dopamine Rehab Chrome Plugin

A Chrome extension to help manage time on addictive sites.

## Features

- **Universal Site Management**: Add any website domain for custom behavior control
- **Flexible Actions**: Apply Grayscale or Force Close to any site
- **Domain Intelligence**: Supports both exact domain matching and subdomain detection
- **Easy Management**: Add, configure, and remove custom sites with a simple interface

## How to Build and Install
### Building from Source

1.  **Install Dependencies**: Run `npm install` in the project root.
2.  **Build the Project**: Run `npm run build`. This will create a `dist` folder with the bundled extension.
    - Use `npm run watch` for development (auto-rebuilds on changes).

### Loading the Extension in Chrome

1.  Open the **Chrome Browser**.
2.  Navigate to `chrome://extensions/`.
3.  Enable **Developer mode** in the top right.
4.  Click **Load unpacked**.
5.  Select the `dist` folder in the project directory.

## Project Structure

- `manifest.json`: The extension's configuration file.
- `src/`: Contains the source code for the dashboard.
- `dashboard.html`: The HTML structure for the configuration dashboard.
- `dashboard.ts`: Logic for saving and loading settings using Chrome's storage API.
