#!/bin/zsh

VOLUME=`hdiutil attach -nobrowse "$1" | grep Volumes | cut -f 3`
cp -rf "$VOLUME"/*.app "$2"
hdiutil detach "$VOLUME"