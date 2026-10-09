# crypto-vid-gen

A frame-by-frame recreation of a 14.7 s 4K60 promo video, built as an HTML/JS scene and rendered with Playwright + ffmpeg.

## Recreation (4K60)

_Animated previews below; click one to open the full-quality MP4 with audio._

[![Recreation preview](media/recreation.webp)](crypto_recreation_4k60.mp4)

[Download `crypto_recreation_4k60.mp4`](crypto_recreation_4k60.mp4)

## Reference

[![Reference preview](media/reference.webp)](leomeethewoo_2107862685421572096.mp4)

[Download the reference video](leomeethewoo_2107862685421572096.mp4) · [Audio (mp3)](leomeethewoo_2107862685421572096.mp3)

## How it works

- `build/stage.html` lays out a 4-quadrant stage. Each quadrant is a scene in `build/scenes/{tl,tr,bl,br}.js`, written as a pure function of time.
- `build/render.js` drives headless Chromium through every frame and encodes the PNGs with ffmpeg, muxing in the reference mp3:

  ```sh
  cd build && npm install
  node render.js --out out/final.mp4 --fps 60 --scale 1
  ```

- `build/tools/` holds the comparison scripts: SSIM against the reference, side-by-side sheets, and the judge prompt used to score each version.
- `build/site/` is a small gallery that tracks every rendered version (`python3 serve.py`, port 8765).
