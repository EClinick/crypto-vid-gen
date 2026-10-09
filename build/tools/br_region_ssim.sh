#!/bin/bash
REF=/home/ethan/dev/crypto-vid-gen/leomeethewoo_2107862685421572096.mp4
for r in "trees:1920:200:0:0" "waterhi:1920:150:0:200" "notif:1200:260:360:330" "waterlo:1920:250:0:600" "bezelL:300:800:0:0" "bezelR:300:800:1620:0"; do IFS=: read n w h x y <<<"$r"; printf "%s " $n; ffmpeg -nostats -t ${T:-1.2} -i "$1" -t ${T:-1.2} -i $REF -filter_complex "[0:v]scale=1920:1080,crop=$w:$h:$x:$y,scale=iw/2:ih/2,fps=30[a];[1:v]crop=1920:1080:1920:1080,crop=$w:$h:$x:$y,scale=iw/2:ih/2,fps=30[b];[a][b]ssim" -f null - 2>&1 | grep -o "All:[0-9.]*"; done
