#!/bin/bash
# quick SSIM of BR phone segment (local 0..1.2s) vs reference; arg: candidate (only-br render starting at t=0)
REF=/home/ethan/dev/crypto-vid-gen/leomeethewoo_2107862685421572096.mp4
ffmpeg -nostats -t 1.2 -i "$1" -t 1.2 -i $REF -filter_complex "[0:v]scale=960:540,fps=30[a];[1:v]crop=1920:1080:1920:1080,scale=960:540,fps=30[b];[a][b]ssim=stats_file=/tmp/claude-1000/-home-ethan-dev-crypto-vid-gen/ca186d67-0b47-4d38-a2f8-3f34760deee8/scratchpad/phs.log" -f null - 2>&1 | grep -o "Y:[0-9.]* .*All:[0-9.]*"
