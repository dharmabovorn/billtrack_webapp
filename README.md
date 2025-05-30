# Bill Tracker Web App

A simple, mobile-friendly web application for tracking your monthly bills and expenses. This app runs entirely in your browser with no server required.

## Features

- Track monthly income and expenses
- Add, edit, and delete bills
- Mark bills as paid/unpaid
- Create and manage custom categories
- View monthly summary with remaining balance
- Export data to CSV for further analysis
- Works offline (after first load)
- Responsive design for all devices

## How to Launch the App

### Option 1: Open Directly in Browser
1. Simply double-click the `index.html` file to open it in your default web browser
2. The app will load and be ready to use immediately

### Option 2: Using a Local Web Server (Recommended)

For the best experience, especially when working with file exports, use a local web server:

#### Using Python (Built-in Server)
1. Open a command prompt/terminal
2. Navigate to the folder containing the app files
3. Run one of these commands:
   - Python 3: `python -m http.server 8000`
   - Python 2: `python -m SimpleHTTPServer 8000`
4. Open your browser and go to: `http://localhost:8000`

#### Using Node.js with http-server
1. Install Node.js if you haven't already
2. Install http-server globally: `npm install -g http-server`
3. Navigate to the app folder in your terminal
4. Run: `http-server -p 8000`
5. Open your browser to: `http://localhost:8000`

## First-Time Setup

1. Set your monthly income by clicking "Edit" next to the income field
2. Add your bills using the "+ Add Bill" button
3. Categorize your expenses for better tracking

## Managing Categories

1. Click "Manage Categories" in the bill form to add, view, or remove categories
2. Categories can only be deleted if no bills are using them
3. When a category is deleted, any bills using it will be moved to "Other"

## Data Management

- All data is stored locally in your browser's localStorage
- To back up your data, use the "Export to CSV" feature
- To reset the app, clear your browser's local storage for this page

## Browser Compatibility

This app works best with modern browsers including:
- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari
- Opera

## Troubleshooting

- If the app doesn't load, try clearing your browser cache
- Make sure JavaScript is enabled in your browser
- For export issues, try using a different browser or the local server method

## License

This project is open source and available under the [MIT License](LICENSE).

---

Enjoy managing your bills with ease! If you have any questions or find any issues, please report them in the issue tracker.
