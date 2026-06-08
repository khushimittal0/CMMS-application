# SMS CMMS Mobile Application

A fully functional, cross-platform mobile application built using **React Native CLI (TypeScript)**. This app implements a login workflow, a centralized dashboard, and a grid-based task table system.

---

## 📱 Features

1. **🔐 Authentication & Validation (`LoginScreen`)**
   - Secure username/password credential check.
   - Credentials supported:
     - **Username:** `operator` | **Password:** `operator123` (logs in as Operator)
   - *Note: Administrative access blocks have been removed to prioritize Operator access.*

2. **🧑‍💼 Dynamic Dashboard (`DashboardScreen`)**
   - Greeting and title adjust dynamically based on the logged-in session details.
   - Clean shortcuts to navigation components: **Profile** and **Tasks**.

3. **📋 Grid-based Tasks List (`TasksScreen`)**
   - Restored original grid data table (ID, Equipment, Area, Zone columns).
   - Category tabs filter (`ALL`, `MAINTENANCE`, `REPAIR`, `INSPECTION`) using a flex-divided row structure, ensuring tabs fit perfectly without text clipping on narrow screen widths (e.g. `570x1230` Genymotion).
   - **Dynamic Row Heights**: Cells wrap text content dynamically if it exceeds space boundaries, preventing information from being hidden or truncated.
   - Back button to return to the Dashboard.

4. **🔍 Detailed Ticket Inspector (`TaskDetailsScreen`)**
   - Detailed task descriptions and metadata with live status updater buttons (`Pending`, `In Progress`, `Completed`).

5. **👤 Minimal Card Profile (`ProfileScreen`)**
   - Cohesively designed centered-card layout matching the Login page.
   - Dynamic user info and logout triggers.

6. **🍔 Hamburger Menu Drawer (`SidebarModal`)**
   - Left-sliding modal displaying navigation shortcuts (**Task**, **Profile**).

7. **⚡ Loading Feedback Overlays (For Slower Devices)**
   - **Authentication Loading Page**: Visual spinner overlay displayed during login validations (`"Authenticating, please wait..."`).
   - **Mounting Task Loader**: Displays a loading screen spinner (`"Loading task list..."`) for 450ms when rendering the tasks page, ensuring users know the app is active and retrieving data.
   - **Status Change Spinner**: Displays an update progress overlay (`"Updating task status..."`) when toggling task statuses inside the inspector.

---

## 💻 Genymotion Execution Guide

Follow these steps to run the application on your **Genymotion** emulator:

### Step 1: Configure Genymotion ADB Settings (Crucial)
To avoid ADB version conflicts between Genymotion's built-in tools and the Android SDK, link Genymotion directly to your custom SDK:
1. Open Genymotion and click **Settings**.
2. Select the **ADB** tab.
3. Select **Use custom Android SDK tools**.
4. Browse and select your local Android SDK directory (usually located at `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`).

---

### Step 2: Run Genymotion Virtual Device
- Start your configured Genymotion Android Virtual Device.
- Open a command terminal and verify that ADB detects the simulator:
  ```sh
  adb devices
  ```
  *(You should see an IP-based emulator listed, e.g., `192.168.56.101:5555 device`).*

---

### Step 3: Launch Metro Bundler
In the root directory of your project (`F:\smsApp`), start the Metro JS packager:
```sh
npm start
```
*Keep this terminal window open in the background.*

---

### Step 4: Build & Deploy
In a new terminal window at `F:\smsApp`, execute the Android compilation:
```sh
npx react-native run-android
```
React Native will build the APK and install it automatically on your running Genymotion device.

---

## 🛠️ Troubleshooting Genymotion Issues

### Red Screen / Connection Error
If the app opens on the emulator but displays a red screen with a network connection error:
1. Run the port-forwarding bridge command to link your emulator back to the Metro server port:
   ```sh
   adb reverse tcp:8081 tcp:8081
   ```
2. Shake the device or press **Ctrl + M** inside the Genymotion emulator, select **Reload**, and the bundle should load.

### Manual Drag & Drop Install (Bulletproof Backup)
If `npx react-native run-android` encounters deployment hurdles:
1. Build the APK locally using Gradle:
   ```sh
   cd android
   .\gradlew assembleDebug
   ```
2. Navigate to:
   📁 `F:\smsApp\android\app\build\outputs\apk\debug\`
3. Locate **`app-debug.apk`**.
4. **Drag and drop** this file directly onto your Genymotion emulator screen. The app will install instantly!
5. Open the app, start Metro (`npm start`), reverse ports if needed (`adb reverse tcp:8081 tcp:8081`), and begin testing!
