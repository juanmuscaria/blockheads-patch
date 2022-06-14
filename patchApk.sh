#!/bin/bash

# Manifest patching, maybe try to introduce it while objection rebuild the apk using apktool instead of doubling the work?
apktool d base.apk -o ./.patch/
# Patch suggested by @JarlPenguin
# Enables audio to be recorded as well game save data to be kept after the app is uninstalled
sed -i 's|<application android:debuggable="false"|<application android:debuggable="false" android:allowAudioPlaybackCapture="true" android:hasFragileUserData="true"|g' ./.patch//AndroidManifest.xml
apktool b ./.patch/ -o manifest_patch.apk

# Patch the apk
objection patchapk -s manifest_patch.apk -c config.json -l _agent.js --architecture armeabi-v7a

# Cleanup
rm -rf ./.patch/
rm -f ./manifest_patch.apk
cp ./manifest_patch.objection.apk ./patched.apk
rm -f ./manifest_patch.objection.apk
