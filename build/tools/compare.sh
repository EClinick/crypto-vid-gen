#!/bin/bash
# Usage: tools/compare.sh <candidate.mp4> <out.png> [quadrant tl|tr|bl|br|all] [times...]
# Makes a sheet: each row = timestamp; left = REFERENCE, right = CANDIDATE.
set -e
CAND=$1; OUT=$2; Q=${3:-all}; shift 3 || true
REF=/home/ethan/dev/crypto-vid-gen/leomeethewoo_2107862685421572096.mp4
TIMES=${@:-0.2 1.0 2.4 3.4 4.6 5.6}
TMP=$(mktemp -d)
case $Q in tl) RC="crop=1920:1080:0:0";; tr) RC="crop=1920:1080:1920:0";; bl) RC="crop=1920:1080:0:1080";; br) RC="crop=1920:1080:1920:1080";; *) RC="null";; esac
# Candidate is a full-stage render (any resolution) unless ONLY=1 (rendered with --only); crop quadrant proportionally.
CC=null
if [ "$Q" != all ] && [ "${ONLY:-0}" != 1 ]; then case $Q in tl) CC="crop=iw/2:ih/2:0:0";; tr) CC="crop=iw/2:ih/2:iw/2:0";; bl) CC="crop=iw/2:ih/2:0:ih/2";; br) CC="crop=iw/2:ih/2:iw/2:ih/2";; esac; fi
i=0; for t in $TIMES; do
  ffmpeg -v error -y -ss $t -i "$REF" -frames:v 1 -vf "$RC,scale=640:360,drawtext=text='REF $t':x=6:y=6:fontsize=22:fontcolor=yellow:box=1:boxcolor=black" $TMP/r$i.png
  ffmpeg -v error -y -ss $t -i "$CAND" -frames:v 1 -vf "$CC,scale=640:360,drawtext=text='NEW $t':x=6:y=6:fontsize=22:fontcolor=cyan:box=1:boxcolor=black" $TMP/c$i.png
  ffmpeg -v error -y -i $TMP/r$i.png -i $TMP/c$i.png -filter_complex hstack $TMP/row$i.png; i=$((i+1)); done
ins=""; for j in $(seq 0 $((i-1))); do ins="$ins -i $TMP/row$j.png"; done
if [ $i -eq 1 ]; then cp $TMP/row0.png "$OUT"; else ffmpeg -v error -y $ins -filter_complex "vstack=inputs=$i" "$OUT"; fi; rm -rf $TMP; echo "$OUT"
