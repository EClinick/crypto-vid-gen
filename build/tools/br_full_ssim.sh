#!/bin/bash
# renders one BR loop (0..3.767) and prints mean SSIM + per-0.25s phase
cd /home/ethan/dev/crypto-vid-gen/build
node render.js --only br --out out/br3/loop.mp4 --to 3.767 --workers 6 2>&1 | grep ERR
REF=/home/ethan/dev/crypto-vid-gen/leomeethewoo_2107862685421572096.mp4
ffmpeg -nostats -t 3.767 -i out/br3/loop.mp4 -t 3.767 -i $REF -filter_complex "[0:v]scale=960:540,fps=30[a];[1:v]crop=1920:1080:1920:1080,scale=960:540,fps=30[b];[a][b]ssim=stats_file=out/br3/loop.log" -f null - 2>/dev/null
python3 - <<'PY'
import re,collections
v=[float(re.search(r'All:([\d.]+)',l).group(1)) for l in open('out/br3/loop.log')]
b=collections.defaultdict(list)
for i,x in enumerate(v): b[int((i/30)*4)/4].append(x)
print(f"mean {sum(v)/len(v):.4f} |", ' '.join(f"{k:.2f}:{sum(x)/len(x):.3f}" for k,x in sorted(b.items())))
PY
