#!/bin/bash
# Usage: tools/ssim.sh <candidate_full_stage.mp4> [outdir]
#        Q=tl ONLY=1 tools/ssim.sh <candidate_only_tl.mp4> [outdir]   (single-quadrant render)
# Per-quadrant SSIM vs reference (both at 960x540, 30fps). Prints mean and worst 0.5s windows.
C=$1; O=${2:-$(dirname $C)}; REF=/home/ethan/dev/crypto-vid-gen/leomeethewoo_2107862685421572096.mp4
QS=${Q:-tl tr bl br}
for q in $QS; do case $q in tl) r="crop=1920:1080:0:0";c="crop=iw/2:ih/2:0:0";; tr) r="crop=1920:1080:1920:0";c="crop=iw/2:ih/2:iw/2:0";; bl) r="crop=1920:1080:0:1080";c="crop=iw/2:ih/2:0:ih/2";; br) r="crop=1920:1080:1920:1080";c="crop=iw/2:ih/2:iw/2:ih/2";; esac
 [ "${ONLY:-0}" = 1 ] && c=null
 ffmpeg -v error -i "$C" -i $REF -filter_complex "[0:v]$c,scale=960:540,fps=30,setpts=PTS-STARTPTS[a];[1:v]$r,scale=960:540,fps=30,setpts=PTS-STARTPTS[b];[a][b]ssim=stats_file=$O/ssim_$q.log:shortest=1" -f null - &
done; wait
Q="$QS" python3 - "$O" <<'PY'
import sys,re
O=sys.argv[1]
import os
for q in os.environ.get('Q','tl tr bl br').split():
  v=[float(re.search(r'All:([\d.]+)',l).group(1)) for l in open(f'{O}/ssim_{q}.log')]
  w=[(sum(v[i:i+15])/15,i/30) for i in range(0,len(v)-15,15)]
  w.sort()
  print(f"{q}: mean SSIM {sum(v)/len(v):.4f}; worst windows: "+", ".join(f"{t:.1f}-{t+.5:.1f}s={s:.3f}" for s,t in w[:5]))
PY
