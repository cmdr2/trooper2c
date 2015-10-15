## trooper2c

simple, first-person zombie shooter for Google Cardboard Virtual Reality viewer, built using Unity 5.2.

feel free to contribute or fork to create your own game for personal or commercial use.

*note:* if you seriously intend to fork this for your own purposes, let me know so i can clean up the code a bit to make it easier to read.

## dev environment setup
* get a Google Cardboard. either search on google for cheaper options in your country, or see this list of [viewers in US/EU](https://www.google.com/get/cardboard/get-cardboard/)
* install [Unity 5.x](https://unity3d.com/get-unity/download) (free or pro)
* `git clone git@github.com:cmdr2/trooper2c.git`
* open the downloaded trooper2c project in Unity
* press the play button to run in Unity. connect your phone and press Ctrl+B or Cmd+B to run on your phone and see in the Cardboard viewer.
* `Assets/Scripts/EnemySpawnManager.js` contains the core logic (written in UnityScript (similar to Javascript))

## publishing to play store
* create your [Play Store account](https://play.google.com/apps/publish/)
* open Player settings from Edit > Project Settings > Player
* set the `Bundle Identifier` and `Bundle Version` to your.company.product under 'Other Settings' (e.g. org.cmdr2.places)
* select the `Create New Keystore` checkbox under 'Publishing settings', then press `Browse Keystore` and select user.keystore
* enter a new Keystore password (and confirm password)
* open the `alias` dropdown and select create new. fill in the details, and create a new password
* (optional) click on 'Analytics' in the 'Hierarchy' pane and set the Tracking code, Product Name, and Bundle Identifier to your choice.
* Build the .apk using File > Build Settings > Build.
* Upload the .apk file to Google Play Store and publish after filling in your application details and screenshots.

## license
[MIT](https://github.com/cmdr2/trooper2c/blob/master/LICENSE)
