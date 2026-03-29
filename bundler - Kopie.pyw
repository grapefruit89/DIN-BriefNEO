#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Antigravity Context Bundler MINI v6.8 (Aviation Portrait)
========================================================
The high-speed instrument. Portrait Layout. Zero Redundancy.
Fokus: Top-Dropzone, High-Visibility Radar, Massive Power Button.
"""

import os
import re
import json
import time
import threading
from concurrent.futures import ProcessPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
import tkinter as tk
from tkinter import ttk, filedialog

try:
    from tkinterdnd2 import TkinterDnD, DND_FILES
    HAS_DND = True
except ImportError:
    HAS_DND = False

# ============================================================
# CONFIGURATION
# ============================================================

WHITELIST_EXT = {
    '.txt', '.md', '.markdown', '.ps1', '.py', '.pyw', '.js', '.mjs', '.ts', '.tsx', 
    '.jsx', '.json', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.html', 
    '.htm', '.svg', '.css', '.scss', '.sql', '.dockerfile', '.gitignore', '.bat', '.env',
    '.rs', '.go', '.c', '.cpp', '.h', '.hpp', '.cs', '.java', '.rb', '.php', '.sh'
}

WHITELIST_FILES = {
    '.env', '.geminiignore', '.eslintrc', '.stylelintrc', '.prettierrc', 
    'package.json', 'manifest.json', 'Dockerfile', 'Makefile', 'Cargo.toml', 'GEMINI.md'
}

FORBIDDEN_ZONE = {'node_modules', '.git', '.vs', '.idea', '__pycache__', 'venv', 'dist', 'build'}

HEAVY_THRESHOLD = 50 * 1024 
MAX_RADAR_ITEMS = 10        # Slightly more in portrait mode

# ============================================================
# CORE LOGIC
# ============================================================

def is_junction(path: Path) -> bool:
    try:
        if os.path.islink(path): return True
        if os.name == 'nt':
            import stat
            return bool(os.lstat(str(path)).st_file_attributes & 1024)
        return False
    except: return False

def is_binary(path: Path) -> bool:
    try:
        with open(path, 'rb') as f:
            return b'\x00' in f.read(1024)
    except: return True

def is_safe(path: Path) -> bool:
    name = path.name.lower()
    if name in FORBIDDEN_ZONE or is_junction(path): return False
    if path.is_dir() and name.startswith('.') and name not in {'.brain', '.gemini', '.specify'}: return False
    return True

def compress_code(text: str) -> str:
    text = re.sub(r'[ \t]+$', '', text, flags=re.M)
    return re.sub(r'\n\s*\n+', '\n\n', text).strip()

# ============================================================
# GUI ENGINE
# ============================================================

class AviationBundler:
    def __init__(self):
        self.root = TkinterDnD.Tk() if HAS_DND else tk.Tk()
        self.root.title("Aviation Bundler v6.8")
        self.root.geometry("500x850") # Portrait orientation
        self.root.resizable(False, False)
        
        self.heavy_candidates = [] 
        self.silent_files = []     
        self.current_paths = []
        
        self.disp_tokens = tk.StringVar(value="READY FOR MISSION")
        self.disp_target = tk.StringVar(value="Drop files/folder above")
        
        self._build_ui()

    def _build_ui(self):
        self.root.configure(bg="#0f172a")
        main = tk.Frame(self.root, bg="#0f172a", padx=25, pady=25)
        main.pack(fill="both", expand=True)

        # 1. TOP DROP ZONE
        self.drop_zone = tk.Label(main, text="📂 DROP PROJECT HERE\n(node_modules auto-killed)", 
                                  bg="#1e293b", fg="#94a3b8", font=("Segoe UI", 12, "bold"), 
                                  relief="flat", height=8, cursor="hand2")
        self.drop_zone.pack(fill="x", pady=(0, 20))
        
        if HAS_DND:
            self.drop_zone.drop_target_register(DND_FILES)
            self.drop_zone.dnd_bind('<<Drop>>', self._on_drop)
        self.drop_zone.bind("<Button-1>", lambda e: self.browse())

        # 2. RADAR SECTION
        tk.Label(main, text="HEAVYWEIGHT RADAR (FILES > 50KB)", font=("Segoe UI", 9, "bold"), 
                 bg="#0f172a", fg="#64748b").pack(anchor="w")
        
        self.radar_frame = tk.Frame(main, bg="#1e293b", height=280)
        self.radar_frame.pack(fill="x", pady=(5, 20))
        self.radar_frame.pack_propagate(False)

        # 3. STATS & INFO
        info_frame = tk.Frame(main, bg="#0f172a")
        info_frame.pack(fill="x", pady=10)
        
        tk.Label(info_frame, textvariable=self.disp_target, font=("Consolas", 10), bg="#0f172a", fg="#475569").pack()
        tk.Label(info_frame, textvariable=self.disp_tokens, font=("Segoe UI", 12, "bold"), bg="#0f172a", fg="#38bdf8").pack(pady=5)

        # 4. GIGANTIC POWER BUTTON
        self.start_btn = tk.Button(main, text="🚀 START MISSION BUNDLE", font=("Segoe UI", 14, "bold"), 
                                   bg="#334155", fg="#94a3b8", relief="flat", state="disabled",
                                   activebackground="#16a34a", activeforeground="white",
                                   command=self.start)
        self.start_btn.pack(fill="x", side="bottom", ipady=25)

    def _on_drop(self, event):
        paths = []
        matches = re.findall(r'\{([^{}]+)\}|(\S+)', event.data)
        for m in matches: paths.append(m[0] if m[0] else m[1])
        self._analyze(paths)

    def browse(self):
        p = filedialog.askdirectory()
        if p: self._analyze([p])

    def _analyze(self, paths):
        self.current_paths = [p for p in paths if os.path.exists(p) and is_safe(Path(p))]
        if not self.current_paths: return
        
        for w in self.radar_frame.winfo_children(): w.destroy()
        self.heavy_candidates = []
        self.silent_files = []
        
        all_files = []
        for p in self.current_paths:
            p_obj = Path(p)
            if p_obj.is_file(): all_files.append(p_obj)
            else:
                for r, ds, fs in os.walk(p):
                    ds[:] = [d for d in ds if is_safe(Path(r)/d)]
                    for f in fs: all_files.append(Path(r)/f)
        
        for f in all_files:
            if is_binary(f): continue
            ext = f.suffix.lower()
            if ext not in WHITELIST_EXT and f.name not in WHITELIST_FILES: continue
            
            size = f.stat().st_size
            if size > HEAVY_THRESHOLD:
                self.heavy_candidates.append({"path": f, "size": size, "selected": True})
            else:
                self.silent_files.append({"path": f, "size": size})

        heavy_sorted = sorted(self.heavy_candidates, key=lambda x: x['size'], reverse=True)[:MAX_RADAR_ITEMS]
        self.heavy_candidates = heavy_sorted 
        
        if not heavy_sorted:
            tk.Label(self.radar_frame, text="Clean Airspace. No heavy files.", bg="#1e293b", fg="#64748b", font=("Segoe UI", 10)).pack(expand=True)
        else:
            for item in heavy_sorted:
                self._add_radar_row(item)

        p0 = Path(self.current_paths[0])
        self.disp_target.set(f"TARGET: {p0.parent.name if len(self.current_paths)>1 else p0.name}")
        self.start_btn.config(state="normal", bg="#16a34a", fg="white", cursor="hand2")
        self._update_stats()

    def _add_radar_row(self, item):
        row = tk.Frame(self.radar_frame, bg="#1e293b")
        row.pack(fill="x", padx=15, pady=4)
        
        btn_txt = tk.StringVar(value="[ ✓ ]")
        toggle_btn = tk.Label(row, textvariable=btn_txt, font=("Consolas", 11, "bold"), 
                              bg="#1e293b", fg="#38bdf8", cursor="hand2", width=5)
        toggle_btn.pack(side="left")
        
        def toggle(e, i=item, v=btn_txt, lb=toggle_btn):
            i['selected'] = not i['selected']
            v.set("[ ✓ ]" if i['selected'] else "[   ]")
            lb.config(fg="#38bdf8" if i['selected'] else "#64748b")
            self._update_stats()
            
        toggle_btn.bind("<Button-1>", toggle)
        tk.Label(row, text=f"{item['size']/1024:>7.1f} KB", font=("Consolas", 9), bg="#1e293b", fg="#94a3b8").pack(side="left", padx=10)
        tk.Label(row, text=item['path'].name, font=("Segoe UI", 10), bg="#1e293b", fg="#e2e8f0").pack(side="left")

    def _update_stats(self):
        total = sum(f['size'] for f in self.silent_files)
        total += sum(f['size'] for f in self.heavy_candidates if f['selected'])
        self.disp_tokens.set(f"TOKENS: ~{int(total/3.5):,} | SIZE: {total/1024:.1f} KB")

    def start(self):
        self.start_btn.config(state="disabled", text="⚡ BUNDLING...", bg="#334155")
        threading.Thread(target=self._run, daemon=True).start()

    def _run(self):
        root = Path(self.current_paths[0])
        name = root.parent.name if len(self.current_paths) > 1 else root.name
        out_path = Path(__file__).parent / f"{datetime.now().strftime('%Y-%m-%d')}_{name}_v1.0_BUNDLED.md"
        
        to_process = [f['path'] for f in self.silent_files]
        to_process += [f['path'] for f in self.heavy_candidates if f['selected']]
        
        results = []
        c_root = str(root.parent if root.is_file() else root)
        with ProcessPoolExecutor() as ex:
            f_map = {ex.submit(process_file_content, str(f), c_root): f for f in to_process}
            for fut in as_completed(f_map):
                res = fut.result()
                if res: results.append(res)

        with open(out_path, "w", encoding="utf-8", newline="\n") as f:
            f.write(f"---\ntitle: \"{name} Snapshot\"\ncreated: {datetime.now().isoformat()}\nllm_ready: true\n---\n\n")
            for item in sorted(results, key=lambda x: x['path']):
                f.write(f"<file path=\"{item['path']}\">\n<metadata>Lines: {item['lines']} | Size: {item['size']} B</metadata>\n<content>\n{item['content']}\n</content>\n</file>\n\n")

        self.root.after(0, self._finish)

    def _finish(self):
        self.start_btn.config(state="normal", text="🚀 START MISSION BUNDLE", bg="#16a34a")

def process_file_content(file_path, root_path):
    try:
        rel_path = os.path.relpath(file_path, root_path).replace("\\", "/")
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            raw = f.read()
        return {"path": rel_path, "size": len(raw), "lines": raw.count("\n")+1, "content": compress_code(raw).replace('```', '~~~')}
    except: return None

if __name__ == "__main__":
    AviationBundler().root.mainloop()
