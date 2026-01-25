# Dopamine Rehab Chrome Plugin

A powerful Chrome extension designed to help you regain control over your digital habits by managing time spent on addictive websites.

## 🚀 Key Features

- **Universal Site Management**: Add any website domain to start managing your digital intake.
- **Multiple Actions per Site**: Configure multiple rules for the same website to handle different scenarios.
- **Advanced Scheduling**:
  - **Time Windows**: Set specific start and end times for when an action should be active.
  - **Day Selection**: Choose specific days of the week (e.g., only weekdays or only weekends).
  - **Always Active**: Option to keep rules running 24/7.
- **Granular Path Control**: 
  - Apply actions only to specific URL paths (e.g., `/direct/inbox` or `/reels`).
  - Use **Include** or **Exclude** logic to target exactly what you want to see or avoid.
- **Powerful Website Actions**:
  - **Grayscale**: Remove color from websites to make them less stimulating. Now includes a **configurable intensity slider** (0% to 100%).
  - **Force Close**: Automatically close the tab when you shouldn't be browsing.
  - **Remove HTML Elements**: Hide distracting UI elements (like feed containers, notification badges, or sidebar ads) by their **HTML class or ID**.
- **Sleek Dashboard**: A dedicated configuration page to manage all your settings in one place.

## 🛠 How to Build and Install

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
