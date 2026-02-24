#!/usr/bin/env python3
"""
list_pngs.py

Usage examples:
    python list_pngs.py                 # list all PNGs recursively in current folder (prints JSON list)
    python list_pngs.py some/folder     # same, but in some/folder
    python list_pngs.py -s              # non-recursive (only the given folder)
    python list_pngs.py -p              # print plain paths, one per line
"""

from pathlib import Path
from typing import List
import argparse
import json

def list_pngs(folder: Path | str = '.', recursive: bool = True) -> List[Path]:
    """Return a list of Path objects for PNG files in `folder`.
       - folder: path-like or string
       - recursive: if True, search subdirectories (default True)
    """
    p = Path(folder)
    if recursive:
        iterator = p.rglob('*')   # recursive
    else:
        iterator = p.iterdir()    # only top-level

    pngs = [f for f in iterator if f.is_file() and f.suffix.lower() == '.png']
    return sorted(pngs)

def main():
    parser = argparse.ArgumentParser(description="List PNG files in a folder.")
    parser.add_argument('folder', nargs='?', default='.', help='Folder to search (default: current folder)')
    parser.add_argument('-s', '--shallow', action='store_true', help='Do not search subdirectories (non-recursive)')
    parser.add_argument('-p', '--plain', action='store_true', help='Print plain paths, one per line (instead of JSON)')
    args = parser.parse_args()

    files = list_pngs(args.folder, recursive=not args.shallow)

    if args.plain:
        for p in files:
            print(p)
    else:
        # print JSON list of strings (paths)
        print(json.dumps([str(p) for p in files], indent=2))

if __name__ == '__main__':
    main()