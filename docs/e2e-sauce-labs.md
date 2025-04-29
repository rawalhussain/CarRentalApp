# End to End Testing

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [End to End Testing](#end-to-end-testing)
  - [Requirements](#requirements)
  - [Usage](#usage)
  - [Upload New Builds](#upload-new-builds)
    - [Android](#android)
      - [Emulator Build](#emulator-build)
      - [Real Device Build](#real-device-build)
    - [iOS](#ios)
      - [Simulator Build](#simulator-build)
      - [Real Device Build](#real-device-build-1)
  - [Troubleshooting](#troubleshooting)
    - [Issue 1](#issue-1)

<!-- /code_chunk_output -->

BILDIT Reference App is using Appium to run e2e testing inside [SauceLabs](https://saucelabs.com/). Please make sure that you already have a valid SauceLabs account.

## Requirements

- `npm install -g appium`
- SauceLabs `username` and `Access Key` that you can find on [User Settings](https://app.saucelabs.com/user-settings) page
- Add `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` to your environment variable.

  ```sh
    # ~/.zshrc or ~/.bash.rc or ~/.bash_profile
    export SAUCE_ACCESS_KEY=your_access_key
    export SAUCE_USERNAME=your_user_name
  ```

  If you add the variable through terminal, you have to re-open the terminal or re-load the profile using `source ~/.bash_profile` or `source ~/.zshrc`

- Make sure the variable detected by printing the variable. Run `$SAUCE_USERNAME` or `$SAUCE_ACCESS_KEY` and you should see your variable value.

## Usage

You need to run the command to trigger the e2e testing. We have 2 options:

1. Android Emulator or iOS Simulator

   - Android: `yarn run test.e2e.android.sauce.emu.us`
   - iOS: `yarn run test.e2e.ios.sauce.sim.us`

2. Real Android and iOS device

   - Android: `yarn run test.e2e.android.sauce.rdc.us`
   - iOS: `yarn run test.e2e.ios.sauce.rdc.us`

## Upload New Builds

You need to upload the build to SauceLabs [storage](https://app.saucelabs.com/live/app-testing) and make sure that you select `DATA CENTER: US WEST 1` on the top right corner. Supported files are .apk, .aab, .ipa, or .zip with a valid app bundle.

### Android

#### Emulator Build

1. `yarn run android:build_sauce_emu`
2. Upload `AfroCartEmu.apk` to SauceLabs [storage](https://app.saucelabs.com/live/app-testing)

#### Real Device Build

1. `yarn run android:build_sauce`
2. Upload `AfroCart.apk` to SauceLabs [storage](https://app.saucelabs.com/live/app-testing)

### iOS

#### Simulator Build

1. Open `ios/AfroCart.xcworkspace`
2. Run the `Release` build to your simulator
3. Open `Derived Data` directory, eg: `/Users/<username>/Library/Developer/Xcode/DerivedData/AfroCart-<randomstring>/Build/Products/Release-iphonesimulator`
4. Zip the `AfroCart.app`
5. Upload the zip file to SauceLabs [storage](https://app.saucelabs.com/live/app-testing)

#### Real Device Build

1. Open `ios/AfroCart.xcworkspace`
2. Archive the project by following this [link](https://help.dropsource.com/docs/documentation/after-dropsource/publishing-your-app/submitting-an-ios-app-to-the-app-store/#archive-your-app)
3. Then export it as `Ad-Hoc`
4. Upload the `.ipa` file to SauceLabs [storage](https://app.saucelabs.com/live/app-testing)

## Troubleshooting

### Issue 1

```sh
  ERROR @wdio/runner: Error: A "user" or "key" was provided but could not be connected to a known cloud service (Sauce Labs, Browerstack, Testingbot or Lambdatest). Please check if given user and key properties are correct!
```

Solution:

Please make sure that the config can read the `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` from your env variables. You can add `console.log(config)` in `__tests__/e2e/configs/wdio.shared.sauce.confg.ts` to see if it's accessible. You can just hardcode the credential on above file and make sure not to commit the changes.
