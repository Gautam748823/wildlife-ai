"""Wrapper entrypoint so commands work from the outer repository folder.

Usage from outer folder:
    python scripts/prepare_dataset.py --source data/downloads/raw --train-ratio 0.8 --seed 42 --clear-output
"""

from pathlib import Path
import runpy
import sys


INNER_SCRIPT = (
    Path(__file__).resolve().parent.parent
    / "wildlife-ai"
    / "scripts"
    / "prepare_dataset.py"
)


def main() -> None:
    if not INNER_SCRIPT.exists():
        raise FileNotFoundError(f"Inner script not found: {INNER_SCRIPT}")

    # Preserve CLI args and execute the real script in-place.
    sys.argv[0] = str(INNER_SCRIPT)
    runpy.run_path(str(INNER_SCRIPT), run_name="__main__")


if __name__ == "__main__":
    main()
