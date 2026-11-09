import os
from pathlib import Path

def analyze_sizes(root_dir):
    root = Path(root_dir)
    items = []
    total_size = 0
    for p in root.rglob('*'):
        if p.is_file():
            size = p.stat().st_size
            total_size += size
            rel = p.relative_to(root)
            items.append((size, str(rel)))
            
    items.sort(key=lambda x: x[0], reverse=True)
    
    print(f"TOTAL FOLDER SIZE: {total_size / (1024 * 1024):.2f} MB ({total_size:,} bytes)\n")
    print("TOP 25 LARGEST FILES:")
    for size, path in items[:25]:
        if size > 1024 * 1024:
            size_str = f"{size / (1024 * 1024):.2f} MB"
        elif size > 1024:
            size_str = f"{size / 1024:.2f} KB"
        else:
            size_str = f"{size} B"
        print(f"  {size_str:>10} : {path}")

    # Directory summary
    print("\nDIRECTORY BREAKDOWN:")
    dir_sizes = {}
    for size, path in items:
        top_dir = path.split(os.sep)[0] if os.sep in path else "(root)"
        dir_sizes[top_dir] = dir_sizes.get(top_dir, 0) + size
        
    for d, s in sorted(dir_sizes.items(), key=lambda x: x[1], reverse=True):
        if s > 1024 * 1024:
            s_str = f"{s / (1024 * 1024):.2f} MB"
        else:
            s_str = f"{s / 1024:.2f} KB"
        print(f"  {s_str:>10} : {d}")

if __name__ == "__main__":
    analyze_sizes(r"C:\Users\morit\Documents\dinbrief-temp")
