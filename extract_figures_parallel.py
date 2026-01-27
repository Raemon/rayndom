#!/usr/bin/env python3
"""
Extract figures, graphs, and images from scientific papers (PARALLELIZED VERSION).

Features:
- Identifies all images, graphs, and figures in a PDF
- Extracts them into separate image files
- Grabs accompanying text and context, saves to matching txt files
- Uses OpenRouter with Claude Opus 4.5 to convert images to tables
- Fully parallelized for maximum performance

Usage:
    python extract_figures_parallel.py <pdf_path> <output_dir> [--convert-to-tables] [--max-workers N]
    
Example:
    python extract_figures_parallel.py downloads/ketamine-in-vitro-safety/10.3390_cells8101139.pdf downloads/ketamine-in-vitro-safety/figures --convert-to-tables --max-workers 10
"""
import os
import sys
import re
import json
import base64
import argparse
from typing import List, Dict, Any, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import partial

try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


def get_openrouter_api_key() -> str:
    """Get OpenRouter API key from environment."""
    api_key = os.environ.get('OPENROUTER_API_KEY')
    if not api_key:
        # Try loading from env files
        script_dir = os.path.dirname(__file__)
        env_files = ['.env', 'ssds.env']
        for env_file in env_files:
            env_path = os.path.join(script_dir, env_file)
            if os.path.exists(env_path):
                with open(env_path, 'r') as f:
                    for line in f:
                        if line.startswith('OPENROUTER_API_KEY='):
                            api_key = line.strip().split('=', 1)[1].strip('"\'')
                            if api_key:
                                break
            if api_key:
                break
    return api_key or ''


def extract_page_text(page_num: int, page) -> Tuple[int, str]:
    """Extract text from a single page (for parallel processing)."""
    try:
        text = page.get_text()
        return (page_num, text)
    except Exception as e:
        print(f"  Error extracting text from page {page_num + 1}: {e}")
        return (page_num, "")


def extract_page_images(page_num: int, page, doc, min_size: int = 50) -> List[Dict[str, Any]]:
    """Extract images from a single page (for parallel processing)."""
    images_data = []
    images = page.get_images(full=True)
    
    for img_index, img in enumerate(images):
        xref = img[0]
        
        try:
            # Extract image data
            base_image = doc.extract_image(xref)
            if not base_image:
                continue
            
            image_bytes = base_image["image"]
            image_ext = base_image.get("ext", "png")
            
            # Skip very small images (likely icons or artifacts)
            width = base_image.get("width", 0)
            height = base_image.get("height", 0)
            if width < min_size or height < min_size:
                continue
            
            images_data.append({
                "page_num": page_num,
                "img_index": img_index,
                "xref": xref,
                "image_bytes": image_bytes,
                "image_ext": image_ext,
                "width": width,
                "height": height,
            })
            
        except Exception as e:
            print(f"  Error extracting image from page {page_num + 1}, image {img_index}: {e}")
    
    return images_data


def find_figure_context(
    page_num: int, 
    page_texts: List[str], 
    full_text: str,
    fig_index: int
) -> str:
    """Find contextual text for a figure (for parallel processing)."""
    context_parts = []
    
    # Get text from the current page
    current_page_text = page_texts[page_num] if page_num < len(page_texts) else ""
    
    # Look for figure references in the text
    figure_patterns = [
        rf'Figure\s*{fig_index}\b[^.]*\.',
        rf'Fig\.\s*{fig_index}\b[^.]*\.',
        r'Figure\s*\d+[A-Z]?\s*[:.][^.]*\.',
        r'Fig\.\s*\d+[A-Z]?\s*[:.][^.]*\.',
    ]
    
    # Search for figure captions/references
    for pattern in figure_patterns:
        matches = re.findall(pattern, current_page_text, re.IGNORECASE)
        for match in matches:
            if match not in context_parts:
                context_parts.append(match.strip())
    
    # Also search in surrounding pages
    for offset in [-1, 1]:
        adj_page = page_num + offset
        if 0 <= adj_page < len(page_texts):
            for pattern in figure_patterns[:2]:  # Only specific figure refs
                matches = re.findall(pattern, page_texts[adj_page], re.IGNORECASE)
                for match in matches:
                    if match not in context_parts:
                        context_parts.append(f"[From page {adj_page + 1}] {match.strip()}")
    
    # If no specific figure reference found, include relevant page text
    if not context_parts:
        # Try to find any figure-related text on the page
        lines = current_page_text.split('\n')
        relevant_lines = []
        for line in lines:
            if any(kw in line.lower() for kw in ['figure', 'fig.', 'graph', 'chart', 'table', 'image', 'panel']):
                relevant_lines.append(line.strip())
        
        if relevant_lines:
            context_parts.append("Potentially related text from page:")
            context_parts.extend(relevant_lines[:10])  # Limit to 10 lines
        else:
            # Just include a snippet of the page
            context_parts.append("Page text excerpt:")
            context_parts.append(current_page_text[:1000])
    
    return "\n".join(context_parts)


class FigureExtractor:
    """Extract figures and images from PDF documents (parallelized)."""
    
    def __init__(self, pdf_path: str, output_dir: str, max_workers: int = None):
        self.pdf_path = pdf_path
        self.output_dir = output_dir
        self.figures: List[Dict[str, Any]] = []
        self.max_workers = max_workers or os.cpu_count() or 4
        
        os.makedirs(output_dir, exist_ok=True)
    
    def extract_all(self, min_size: int = 50) -> List[Dict[str, Any]]:
        """Extract all figures from the PDF using parallel processing."""
        if not HAS_PYMUPDF:
            print("Error: PyMuPDF (fitz) is required for image extraction.")
            print("Install it with: pip install PyMuPDF")
            return []
        
        doc = fitz.open(self.pdf_path)
        num_pages = len(doc)
        
        print(f"Opened PDF with {num_pages} pages")
        print(f"Using {self.max_workers} worker threads for parallel processing")
        
        # Extract text from all pages in parallel
        print("Extracting text from pages...")
        page_texts = [""] * num_pages
        
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            text_futures = {
                executor.submit(extract_page_text, page_num, doc[page_num]): page_num 
                for page_num in range(num_pages)
            }
            
            for future in as_completed(text_futures):
                page_num, text = future.result()
                page_texts[page_num] = text
        
        # Build full text for context matching
        full_text = ""
        for page_num, text in enumerate(page_texts):
            full_text += f"\n--- Page {page_num + 1} ---\n{text}"
        
        # Extract images from all pages in parallel
        print("Extracting images from pages...")
        all_images_data = []
        
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            image_futures = {
                executor.submit(extract_page_images, page_num, doc[page_num], doc, min_size): page_num
                for page_num in range(num_pages)
            }
            
            for future in as_completed(image_futures):
                images_data = future.result()
                all_images_data.extend(images_data)
        
        # Sort images by page number and index to maintain order
        all_images_data.sort(key=lambda x: (x["page_num"], x["img_index"]))
        
        # Process images and save them (can parallelize file I/O too)
        print(f"Processing {len(all_images_data)} images...")
        image_counter = 0
        
        def process_and_save_image(img_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
            """Process a single image and save it."""
            nonlocal image_counter
            image_counter += 1
            
            page_num = img_data["page_num"]
            image_bytes = img_data["image_bytes"]
            image_ext = img_data["image_ext"]
            width = img_data["width"]
            height = img_data["height"]
            
            # Generate filename
            fig_name = f"figure_{image_counter:03d}_page{page_num + 1}"
            image_filename = f"{fig_name}.{image_ext}"
            image_path = os.path.join(self.output_dir, image_filename)
            
            # Save image
            try:
                with open(image_path, "wb") as f:
                    f.write(image_bytes)
            except Exception as e:
                print(f"  Error saving image {image_filename}: {e}")
                return None
            
            print(f"  Extracted: {image_filename} ({width}x{height})")
            
            # Find context for this image
            context = find_figure_context(
                page_num, page_texts, full_text, image_counter
            )
            
            # Save context to text file
            context_path = os.path.join(self.output_dir, f"{fig_name}.txt")
            try:
                with open(context_path, "w", encoding="utf-8") as f:
                    f.write(f"Figure extracted from: {os.path.basename(self.pdf_path)}\n")
                    f.write(f"Page: {page_num + 1}\n")
                    f.write(f"Image dimensions: {width}x{height}\n")
                    f.write(f"\n{'='*60}\n")
                    f.write("CONTEXT:\n")
                    f.write(f"{'='*60}\n\n")
                    f.write(context)
            except Exception as e:
                print(f"  Error saving context for {image_filename}: {e}")
            
            return {
                "index": image_counter,
                "page": page_num + 1,
                "filename": image_filename,
                "image_path": image_path,
                "context_path": context_path,
                "width": width,
                "height": height,
                "format": image_ext,
                "context": context
            }
        
        # Process images in parallel (file I/O can benefit from parallelization)
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            figure_futures = [
                executor.submit(process_and_save_image, img_data)
                for img_data in all_images_data
            ]
            
            for future in as_completed(figure_futures):
                figure = future.result()
                if figure:
                    self.figures.append(figure)
        
        # Sort figures by index to maintain order
        self.figures.sort(key=lambda x: x["index"])
        
        doc.close()
        
        print(f"\nExtracted {len(self.figures)} figures total")
        return self.figures


class ImageToTableConverter:
    """Convert images to tables using OpenRouter API with Claude Opus 4.5."""
    
    OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
    MODEL = "anthropic/claude-sonnet-4"  # Claude Opus 4.5 via OpenRouter
    
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    def convert_to_table(self, image_path: str, context: str = "") -> Dict[str, Any]:
        """
        Convert an image to a table using Claude Opus 4.5.
        
        Args:
            image_path: Path to the image file
            context: Optional context about the figure
            
        Returns:
            Dictionary with the converted table data
        """
        if not HAS_REQUESTS:
            return {"error": "requests library not installed"}
        
        if not self.api_key:
            return {"error": "OPENROUTER_API_KEY not set"}
        
        # Read and encode the image
        with open(image_path, "rb") as f:
            image_data = f.read()
        
        # Determine MIME type
        ext = os.path.splitext(image_path)[1].lower()
        mime_types = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
        }
        mime_type = mime_types.get(ext, 'image/png')
        
        # Encode to base64
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Construct the prompt
        system_prompt = """You are an expert at extracting data from scientific figures and converting them into structured tables.

Your task is to:
1. Analyze the image carefully
2. Identify any data, measurements, or information that can be represented as a table
3. Extract that data into a well-structured markdown table
4. Include any relevant labels, units, and context

If the image contains a graph or chart:
- Extract approximate values from the visual representation
- Note the axes labels and units
- Include data points, trends, or key measurements

If the image contains text or a table:
- Transcribe the content accurately
- Preserve the structure

If the image doesn't contain tabular data:
- Describe what's in the image
- Extract any quantitative information possible
- Create a summary table if appropriate

Always format your response with:
1. A brief description of what the figure shows
2. One or more markdown tables with the extracted data
3. Any notes or caveats about the data extraction"""

        user_prompt = f"""Please analyze this figure and convert any data into a structured table.

Context about this figure:
{context if context else 'No additional context provided.'}

Extract all relevant data into markdown table(s). If this is a graph, estimate the data points. If this is a flowchart or diagram, create a table summarizing the key elements and relationships."""

        # Make the API request
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        
        payload = {
            "model": self.MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{image_base64}"
                            }
                        },
                        {
                            "type": "text",
                            "text": user_prompt
                        }
                    ]
                }
            ],
            "max_tokens": 4096,
            "temperature": 0.1,  # Low temperature for accuracy
        }
        
        try:
            response = requests.post(
                self.OPENROUTER_URL,
                headers=headers,
                json=payload,
                timeout=120
            )
            response.raise_for_status()
            
            result = response.json()
            
            if "choices" in result and len(result["choices"]) > 0:
                content = result["choices"][0]["message"]["content"]
                return {
                    "success": True,
                    "table_markdown": content,
                    "model": self.MODEL,
                    "usage": result.get("usage", {})
                }
            else:
                return {"error": "No response content", "raw": result}
                
        except requests.exceptions.RequestException as e:
            return {"error": f"API request failed: {str(e)}"}
        except json.JSONDecodeError as e:
            return {"error": f"Failed to parse API response: {str(e)}"}


def convert_figure_to_table(
    fig: Dict[str, Any],
    converter: ImageToTableConverter,
    output_dir: str,
    pdf_basename: str
) -> Dict[str, Any]:
    """Convert a single figure to a table (for parallel processing)."""
    print(f"Processing: {fig['filename']}")
    
    result = converter.convert_to_table(
        fig['image_path'],
        fig.get('context', '')
    )
    
    # Save the result
    table_filename = fig['filename'].rsplit('.', 1)[0] + '_table.md'
    table_path = os.path.join(output_dir, table_filename)
    
    if result.get('success'):
        with open(table_path, 'w', encoding='utf-8') as f:
            f.write(f"# Table extracted from {fig['filename']}\n\n")
            f.write(f"Source: Page {fig['page']} of {pdf_basename}\n\n")
            f.write("---\n\n")
            f.write(result['table_markdown'])
        print(f"  Saved table to: {table_filename}")
    else:
        with open(table_path, 'w', encoding='utf-8') as f:
            f.write(f"# Error processing {fig['filename']}\n\n")
            f.write(f"Error: {result.get('error', 'Unknown error')}\n")
        print(f"  Error: {result.get('error')}")
    
    # Return updated figure dict
    fig['table_result'] = result
    return fig


def main():
    parser = argparse.ArgumentParser(
        description='Extract figures from PDFs and optionally convert to tables (parallelized)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument('pdf_path', help='Path to the PDF file')
    parser.add_argument('output_dir', help='Directory to save extracted figures')
    parser.add_argument(
        '--convert-to-tables', '-c',
        action='store_true',
        help='Convert extracted images to tables using Claude Opus 4.5'
    )
    parser.add_argument(
        '--min-size', '-m',
        type=int,
        default=50,
        help='Minimum image dimension to extract (default: 50px)'
    )
    parser.add_argument(
        '--max-workers', '-w',
        type=int,
        default=None,
        help='Maximum number of worker threads (default: CPU count)'
    )
    parser.add_argument(
        '--api-workers', '-a',
        type=int,
        default=5,
        help='Maximum number of parallel API calls for table conversion (default: 5)'
    )
    
    args = parser.parse_args()
    
    # Validate input
    if not os.path.exists(args.pdf_path):
        print(f"Error: PDF not found: {args.pdf_path}")
        sys.exit(1)
    
    if not HAS_PYMUPDF:
        print("Error: PyMuPDF is required for image extraction.")
        print("Install it with: pip install PyMuPDF")
        sys.exit(1)
    
    # Extract figures
    print(f"Extracting figures from: {args.pdf_path}")
    print(f"Output directory: {args.output_dir}")
    print()
    
    extractor = FigureExtractor(args.pdf_path, args.output_dir, max_workers=args.max_workers)
    figures = extractor.extract_all(min_size=args.min_size)
    
    if not figures:
        print("No figures extracted.")
        sys.exit(0)
    
    # Save figure metadata
    metadata_path = os.path.join(args.output_dir, "figures_metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(figures, f, indent=2, ensure_ascii=False)
    print(f"\nSaved metadata to: {metadata_path}")
    
    # Convert to tables if requested
    if args.convert_to_tables:
        print("\n" + "="*60)
        print("CONVERTING IMAGES TO TABLES (PARALLELIZED)")
        print("="*60)
        
        api_key = get_openrouter_api_key()
        if not api_key:
            print("Error: OPENROUTER_API_KEY not found in environment or .env file")
            print("Set it with: export OPENROUTER_API_KEY=your_key_here")
            sys.exit(1)
        
        if not HAS_REQUESTS:
            print("Error: requests library required for API calls")
            print("Install it with: pip install requests")
            sys.exit(1)
        
        converter = ImageToTableConverter(api_key)
        pdf_basename = os.path.basename(args.pdf_path)
        
        # Convert all figures in parallel
        print(f"Using {args.api_workers} parallel API workers")
        
        with ThreadPoolExecutor(max_workers=args.api_workers) as executor:
            conversion_futures = {
                executor.submit(convert_figure_to_table, fig, converter, args.output_dir, pdf_basename): fig['index']
                for fig in figures
            }
            
            for future in as_completed(conversion_futures):
                try:
                    updated_fig = future.result()
                    # Update the figure in the list
                    fig_index = updated_fig['index']
                    for i, fig in enumerate(figures):
                        if fig['index'] == fig_index:
                            figures[i] = updated_fig
                            break
                except Exception as e:
                    fig_index = conversion_futures[future]
                    print(f"  Error converting figure {fig_index}: {e}")
        
        # Update metadata with table results
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(figures, f, indent=2, ensure_ascii=False)
        print(f"\nUpdated metadata with table results")
    
    print("\n" + "="*60)
    print("EXTRACTION COMPLETE")
    print("="*60)
    print(f"Extracted {len(figures)} figures")
    print(f"Output directory: {args.output_dir}")


if __name__ == '__main__':
    main()
