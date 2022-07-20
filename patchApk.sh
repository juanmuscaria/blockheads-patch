#!/bin/bash

# Patch the apk
objection patchapk -s base.apk -c config.json -m manifest.xml -l _agent.js --architecture armeabi-v7a
#objection patchapk -s base.apk -N -m manifest.xml --architecture armeabi-v7a

cp ./base.objection.apk ./patched.apk
rm -f ./base.objection.apk