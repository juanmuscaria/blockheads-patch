#!/bin/bash
# Objection is needed to patch the apk for nonrooted devices.
objection patchapk -s base.apk -c config.json -l _agent.js --architecture armeabi-v7a