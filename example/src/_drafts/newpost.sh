#!/bin/bash

read -p 'Title: ' orig_title
echo

title=$(sed 's/ /-/g' <<< $orig_title | tr '[:upper:]' '[:lower:]')
folder=`date +%Y-%m-%d`-$title
filename=$folder.md

cp ./template.md $filename 

sed -i '' -e "s/TITLE/$orig_title/" $filename

read -e -p "Post has files? [Y/n] " YN

[[ $YN == "y" || $YN == "Y" ]] && mkdir ../files/$folder
