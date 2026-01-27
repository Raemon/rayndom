# extract-and-convert-figures

Extract figures from a PDF and convert them to tables in one command.

This command runs both `extract_figures_parallel.py` and `convert_figures_to_tables.py` sequentially:
1. First extracts all figures from the PDF to the output directory
2. Then converts all extracted figures to tables using Claude Opus 4.5

Usage:
    python tools/figure-extraction/extract_figures_parallel.py <pdf_path> <output_dir> [--max-workers N]
    python tools/figure-extraction/convert_figures_to_tables.py <output_dir> [--api-workers N]

Example:
    python tools/figure-extraction/extract_figures_parallel.py downloads/ketamine-in-vitro-safety/10.3390_cells8101139.pdf downloads/ketamine-in-vitro-safety/figures --max-workers 10
    python tools/figure-extraction/convert_figures_to_tables.py downloads/ketamine-in-vitro-safety/figures --api-workers 5

The scripts will:
- Extract all images/figures from the PDF
- Save them as image files with accompanying context text files
- Generate a figures_metadata.json file
- Convert each figure to a markdown table using vision models
- Save table results as _table.md files alongside the images
