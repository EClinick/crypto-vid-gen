#!/bin/bash
# usage: tools/br_range_ssim.sh FROM TO  -> renders BR [FROM,TO) and prints SSIM vs ref
cd /home/ethan/dev/crypto-vid-gen/build
node render.js --only br --out out/br3/rng.mp4 --from $1 --to $2 --workers 6 2>&1 | grep ERR
REF=/home/ethan/dev/crypto-vid-gen/leomeethewoo_2107862685421572096.mp4
D=$(python3 -c "print($2-$1)")
ffmpeg -nostats -i out/br3/rng.mp4 -ss $1 -t $D -i $REF -filter_complex "[0:v]scale=960:540,fps=30,setpts=PTS-STARTPTS[a];[1:v]crop=1920:1080:1920:1080,scale=960:540,fps=30,setpts=PTS-STARTPTS[b];[a][b]ssim" -f null - 2>&1 | grep -o "All:[0-9.]*"
