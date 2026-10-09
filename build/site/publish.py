#!/usr/bin/env python3
"""Publish an iteration: python3 site/publish.py --version v3 --video x.mp4 --sheets a.png b.png --judges j.json --notes "text"
Re-running with the same --version replaces/merges the entry. Omitted --video/--sheets/--judges/--notes keep prior values."""
import argparse, json, os, shutil, subprocess, sys, time, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data.json")

def probe(path):
    try:
        out = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0",
            "-show_entries", "stream=width,height", "-of", "csv=p=0", path], text=True).strip()
        w, h = out.split(",")[:2]
        return int(w), int(h)
    except Exception:
        return 0, 0

def has_audio(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries",
        "stream=index", "-of", "csv=p=0", path], capture_output=True, text=True).stdout
    return bool(out.strip())

def build_sbs(version, src, vdir, stamp):
    name = f"{version}_side_by_side.mp4"
    dst = os.path.join(vdir, name)
    font = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    clean = lambda t: t.replace("'", "").replace(":", "").replace("\\", "")
    def txt(t, size, color, y):
        return (f"drawtext=fontfile={font}:text='{t}':fontsize={size}:fontcolor={color}:"
                f"x=(w-text_w)/2:y={y}")
    sc = "fps=30,scale=1760:990:force_original_aspect_ratio=decrease,pad=1760:990:(ow-iw)/2:(oh-ih)/2:color=0x0b0d12,setsar=1"
    def panel(idx, big, sub, tag):
        # 1760x1260 panel: header band 150px (label + subtitle), then video
        return (f"[{idx}:v]{sc},pad=1760:1140:0:150:color=0x0b0d12,"
                + txt(clean(big), 64, "white", 18) + "," + txt(sub, 32, "0x9aa3b5", 96) + f"[{tag}]")
    fc = (panel(0, "ORIGINAL", "reference", "l") + ";" +
          panel(1, f"CLAUDE  \u00b7  {version}", "recreated from scratch", "r") + ";"
          "color=c=0x0b0d12:s=80x1140:r=30[g];[l][g][r]hstack=inputs=3,pad=3720:1260:60:60:color=0x0b0d12,format=yuv420p[v]")
    ref = os.path.join(HERE, "ref", "reference.mp4")
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", ref, "-i", src, "-filter_complex", fc, "-map", "[v]"]
    if has_audio(src): cmd += ["-map", "1:a", "-c:a", "aac", "-b:a", "160k"]
    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "20", "-r", "30", "-shortest",
            "-movflags", "+faststart", dst + ".tmp.mp4"]
    subprocess.check_call(cmd)
    os.replace(dst + ".tmp.mp4", dst)
    w, h = probe(dst)
    return {"path": f"versions/{version}/{name}?v={stamp}", "name": name,
            "size": os.path.getsize(dst), "width": w, "height": h}

def load():
    try:
        with open(DATA) as f:
            return json.load(f)
    except Exception:
        return []

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--version")
    ap.add_argument("--regen-sbs", action="store_true", help="rebuild side-by-side for all versions (or --version) from stored originals")
    ap.add_argument("--video")
    ap.add_argument("--sheets", nargs="*", default=None)
    ap.add_argument("--judges")
    ap.add_argument("--notes")
    a = ap.parse_args()

    entries = load()
    if a.regen_sbs:
        for e in entries:
            if a.version and e["version"] != a.version: continue
            vd = os.path.join(HERE, "versions", e["version"])
            src = os.path.join(vd, e["download"]["name"]) if e.get("download") else os.path.join(vd, "video.mp4")
            e["sidebyside"] = build_sbs(e["version"], src, vd, int(time.time()))
            print("rebuilt", e["version"])
        with open(DATA, "w") as f: json.dump(entries, f, indent=2)
        return
    if not a.version: ap.error("--version required")
    old = next((e for e in entries if e["version"] == a.version), {})
    vdir = os.path.join(HERE, "versions", a.version)
    os.makedirs(vdir, exist_ok=True)
    stamp = int(time.time())

    video = old.get("video")
    download = old.get("download")
    sbs = old.get("sidebyside")
    web = old.get("web")
    if a.video:
        dst = os.path.join(vdir, "video.mp4")
        tmp = dst + ".tmp.mp4"
        w, h = probe(a.video)
        if w > 1920 or h > 1080 or not a.video.lower().endswith(".mp4"):
            cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", a.video,
                   "-vf", "scale='min(1920,iw)':-2", "-r", "30", "-c:v", "libx264",
                   "-preset", "medium", "-crf", "23", "-pix_fmt", "yuv420p"]
            cmd += ["-c:a", "aac", "-b:a", "128k"] if has_audio(a.video) else ["-an"]
            cmd += ["-movflags", "+faststart", tmp]
            subprocess.check_call(cmd)
        else:
            subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", a.video, "-c", "copy",
                                   "-movflags", "+faststart", tmp])
        os.replace(tmp, dst)
        video = f"versions/{a.version}/video.mp4?v={stamp}"
        base = os.path.basename(a.video)
        for f in os.listdir(vdir):  # drop stale originals
            if f.lower().endswith((".mp4", ".mov", ".mkv", ".webm")) and f not in ("video.mp4", base):
                os.remove(os.path.join(vdir, f))
        if base == "video.mp4":
            base = f"{a.version}_original.mp4"
        shutil.copy2(a.video, os.path.join(vdir, base))
        ow, oh = probe(a.video); ww, wh = probe(dst)
        download = {"path": f"versions/{a.version}/{base}?v={stamp}", "name": base,
                    "size": os.path.getsize(a.video), "width": ow, "height": oh}
        sbs = build_sbs(a.version, a.video, vdir, stamp)
        web = {"size": os.path.getsize(dst), "width": ww, "height": wh}

    sheets = old.get("sheets", [])
    if a.sheets is not None and a.sheets:
        for s in os.listdir(vdir):
            if s.startswith("sheet_"):
                os.remove(os.path.join(vdir, s))
        sheets = []
        for i, s in enumerate(a.sheets):
            name = f"sheet_{i}_{os.path.basename(s)}"
            shutil.copy(s, os.path.join(vdir, name))
            sheets.append(f"versions/{a.version}/{name}?v={stamp}")

    judges = old.get("judges", [])
    if a.judges:
        with open(a.judges) as f:
            judges = json.load(f)
    scores = [float(j["score"]) for j in judges if j.get("score") is not None]
    avg = round(sum(scores) / len(scores), 2) if scores else None

    entry = {"version": a.version, "timestamp": old.get("timestamp") if old and not a.video else
             time.strftime("%Y-%m-%dT%H:%M:%S%z"),
             "video": video, "download": download, "sidebyside": sbs, "web": web, "sheets": sheets, "judges": judges, "avg": avg,
             "status": "judged" if judges else "judging",
             "notes": a.notes if a.notes is not None else old.get("notes", "")}
    if not entry["timestamp"]:
        entry["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%S%z")
    if old:
        entries[entries.index(old)] = entry
    else:
        entries.append(entry)
    fd, tmp = tempfile.mkstemp(dir=HERE, suffix=".json")
    with os.fdopen(fd, "w") as f:
        json.dump(entries, f, indent=2)
    os.chmod(tmp, 0o644)
    os.replace(tmp, DATA)
    print(f"published {a.version}: avg={avg} status={entry['status']}")

if __name__ == "__main__":
    main()
