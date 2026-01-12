# How to Build Your Android APK

I have set up the project with **Capacitor** to wrap your web application as an Android app. The final step to generate the `.apk` file must be done inside **Android Studio**.

## Prerequisites
- **Android Studio** installed on your machine.
- **Java Development Kit (JDK)** (usually bundled with Android Studio).

## Steps to Build

### 1. Open the Project in Android Studio
1.  Open **Android Studio**.
2.  Select **Open**.
3.  Navigate to your project folder: `c:\Users\João Victor\Desktop\kairhos-rh-e-crm`.
4.  Select the `android` folder inside it and click **OK**.
    - *Note: It may take a few minutes for Gradle to sync and download dependencies correctly.*

### 2. Run in Emulator (Optional)
If you want to test it on a virtual device before building:
1.  Click the **Device Manager** icon (phone icon) in the top-right toolbar.
2.  Create a virtual device (e.g., Pixel 4) if you haven't already.
3.  Click the green **Run (Play)** button in the top toolbar.

### 3. Generate the Signed APK
To create the file you can install on your phone:
1.  Go to the top menu: **Build > Generate Signed Bundle / APK**.
2.  Select **APK** and click **Next**.
3.  **Key Store Path**: You will need to create a new key store if you don't have one.
    - Click **Create new...**.
    - Choose a location (e.g., inside your project folder, but **do not** commit this file if using git publicly).
    - Set a password for the keystore and the key.
    - Fill in at least one field in "Certificate" (e.g., First and Last Name).
    - Click **OK**.
4.  Fill in the passwords you just created.
5.  Click **Next**.
6.  Select **release**.
7.  Check the box **V1 (Jar Signature)** and **V2 (Full APK Signature)**.
8.  Click **Create** (or **Finish**).

### 4. Locate your APK
Once the build finishes (you'll see a popup "Generate Signed APK: APK(s) generated successfully"):
1.  Click **locate** in the popup, or navigate to:
    `c:\Users\João Victor\Desktop\kairhos-rh-e-crm\android\app\release\`
2.  You will find `app-release.apk`.
3.  Transfer this file to your Android phone and install it!

> **Note:** Since this is a self-signed APK (not from the Play Store), your phone might ask for permission to install apps from unknown sources.

## Updating the App
If you make changes to your React code:
1.  Run `npm run build` in your terminal.
2.  Run `npx cap sync` to copy the new changes to the Android project.
3.  Open Android Studio and run the build again.
