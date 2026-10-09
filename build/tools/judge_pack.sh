#!/bin/bash
# Usage: tools/judge_pack.sh <candidate_full_stage.mp4> <outdir>
# Produces comparison sheets (REF left / NEW right) for judges.
set -e
C=$1; O=$2; mkdir -p $O; T=$(dirname $0)
$T/compare.sh $C $O/full_a.png all 0.15 1.4 2.6 3.6 &
$T/compare.sh $C $O/full_b.png all 4.6 5.6 7.9 10.8 &
$T/compare.sh $C $O/tl_1.png tl 0.1 0.45 0.8 1.15 1.5 1.85 &
$T/compare.sh $C $O/tl_2.png tl 2.3 2.9 3.4 3.8 4.4 4.7 5.3 5.8 &
$T/compare.sh $C $O/tr.png tr 0.2 0.7 1.0 1.4 1.9 2.2 2.6 2.9 &
$T/compare.sh $C $O/bl.png bl 0.2 0.6 1.0 1.4 1.8 2.2 2.6 3.2 &
$T/compare.sh $C $O/br.png br 0.4 1.1 1.35 1.6 2.0 2.5 2.9 3.4 &
wait
# Motion strips: consecutive frames at 10fps; top row REF, bottom row NEW, for key transitions.
REF=/home/ethan/dev/crypto-vid-gen/leomeethewoo_2107862685421572096.mp4
strip(){ # name crop start
  local n=$1 cr=$2 s=$3
  ffmpeg -v error -y -ss $s -i $REF -t 0.8 -vf "$cr,fps=10,scale=320:180,tile=8x1" -frames:v 1 $O/.r_$n.png
  local cc; case $n in tl*) cc="crop=iw/2:ih/2:0:0";; tr*) cc="crop=iw/2:ih/2:iw/2:0";; bl*) cc="crop=iw/2:ih/2:0:ih/2";; br*) cc="crop=iw/2:ih/2:iw/2:ih/2";; esac
  ffmpeg -v error -y -ss $s -i $C -t 0.8 -vf "$cc,fps=10,scale=320:180,tile=8x1" -frames:v 1 $O/.c_$n.png
  ffmpeg -v error -y -i $O/.r_$n.png -i $O/.c_$n.png -filter_complex "vstack" $O/motion_$n.png; rm $O/.r_$n.png $O/.c_$n.png; }
strip tl_cards "crop=1920:1080:0:0" 0.0 &
strip tl_gauge "crop=1920:1080:0:0" 2.0 &
strip tl_unlock "crop=1920:1080:0:0" 4.2 &
strip tr_zoom "crop=1920:1080:1920:0" 0.6 &
strip bl_words "crop=1920:1080:0:1080" 3.4 &
strip bl_cut "crop=1920:1080:0:1080" 2.2 &
strip br_wheel "crop=1920:1080:1920:1080" 1.15 &
strip br_count "crop=1920:1080:1920:1080" 2.4 &
wait; ls $O
