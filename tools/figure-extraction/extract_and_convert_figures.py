#!/usr/bin/env python3
"""
Extract figures, graphs, and images from scientific papers and optionally convert to tables.

Features:
- Identifies all images, graphs, and figures in a PDF
- Extracts them into separate image files
- Grabs accompanying text and context, saves to matching txt files
- Uses OpenCV or OpenRouter/Claude for multi-figure detection
- Merges split figures that belong together
- Recursively splits combined figures to find sub-figures
- Removes duplicates
- Optionally converts images to tables using separate conversion script or built-in conversion
- Fully parallelized for maximum performance

Figure Splitting:
- OpenCV (preferred): Uses contour detection to find separate figure regions.
  Lightweight and fast, no deep learning dependencies required.
  Install: pip3 install opencv-python
- AI Fallback: Uses Claude Opus via OpenRouter API when OpenCV is unavailable.

Usage:
    python extract_and_convert_figures.py <pdf_path> <output_dir> [--convert-to-tables] [--max-workers N]
    
Example:
    python extract_and_convert_figures.py downloads/ketamine-in-vitro-safety/10.3390_cells8101139.pdf downloads/ketamine-in-vitro-safety/figures --convert-to-tables --max-workers 10
    
    # Disable OpenCV and use only AI-based detection:
    python extract_and_convert_figures.py paper.pdf figures/ --no-opencv
    
    # Use separate conversion script instead of built-in:
    python extract_and_convert_figures.py paper.pdf figures/ --use-separate-converter
"""
import os
import sys
import re
import json
import base64
import argparse
import subprocess
import hashlib
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

try:
    from PIL import Image
    import io
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

# OpenCV imports (optional - for contour-based figure detection)
try:
    import numpy as np
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False
    # numpy may still be available without opencv
    try:
        import numpy as np
        HAS_NUMPY = True
    except ImportError:
        HAS_NUMPY = False


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
        # Also try project root
        if not api_key:
            project_root = os.path.dirname(os.path.dirname(script_dir))
            for env_file in env_files:
                env_path = os.path.join(project_root, env_file)
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


def _try_extract_base_image(doc, xref: int) -> Optional[Dict[str, Any]]:
    """Extract base image data from document by xref. Returns None if extraction fails."""
    try:
        return doc.extract_image(xref)
    except Exception:
        return None


def _is_valid_image_size(base_image: Dict[str, Any], min_size: int) -> bool:
    """Check if image meets minimum size requirements."""
    width = base_image.get("width", 0)
    height = base_image.get("height", 0)
    return width >= min_size and height >= min_size


def _build_image_data(
    page_num: int,
    img_index: int,
    xref: int,
    base_image: Dict[str, Any],
    image_rects: List[Any]
) -> Dict[str, Any]:
    """Construct the image data dictionary from extracted components."""
    return {
        "page_num": page_num,
        "img_index": img_index,
        "xref": xref,
        "image_bytes": base_image["image"],
        "image_ext": base_image.get("ext", "png"),
        "width": base_image.get("width", 0),
        "height": base_image.get("height", 0),
        "rect": image_rects[0] if image_rects else None,
        "all_rects": image_rects,
    }


def _process_single_image(
    page_num: int,
    img_index: int,
    xref: int,
    doc,
    page,
    min_size: int
) -> Optional[Dict[str, Any]]:
    """
    Process a single image: extract, validate size, get rectangles, build data.
    Returns None if image should be skipped.
    """
    base_image = _try_extract_base_image(doc, xref)
    if not base_image:
        return None
    
    if not _is_valid_image_size(base_image, min_size):
        return None
    
    image_rects = page.get_image_rects(xref)
    return _build_image_data(page_num, img_index, xref, base_image, image_rects)


def extract_page_images(page_num: int, page, doc, min_size: int = 50) -> List[Dict[str, Any]]:
    """Extract images from a single page (for parallel processing)."""
    images = page.get_images(full=True)
    
    results = []
    for img_index, img in enumerate(images):
        xref = img[0]
        try:
            image_data = _process_single_image(page_num, img_index, xref, doc, page, min_size)
            if image_data:
                results.append(image_data)
        except Exception as e:
            print(f"  Error extracting image from page {page_num + 1}, image {img_index}: {e}")
    
    return results


def find_figure_labels_with_positions(page_num: int, page) -> List[Dict[str, Any]]:
    """
    Find figure/table labels and their approximate positions on the page.
    Returns a list of dicts with label text, figure number, and approximate y-position.
    """
    figure_labels = []
    try:
        # Get text blocks with their positions
        text_dict = page.get_text("dict")
        
        # Patterns to match figure/table labels
        figure_patterns = [
            (r'Figure\s+(\d+[A-Za-z]?)', 'figure'),
            (r'Fig\.\s+(\d+[A-Za-z]?)', 'figure'),
            (r'Table\s+(\d+[A-Za-z]?)', 'table'),
            (r'Tbl\.\s+(\d+[A-Za-z]?)', 'table'),
        ]
        
        for block in text_dict.get("blocks", []):
            if "lines" not in block:
                continue
            
            for line in block["lines"]:
                if "spans" not in line:
                    continue
                
                line_text = "".join(span.get("text", "") for span in line["spans"])
                line_bbox = line.get("bbox", [0, 0, 0, 0])  # [x0, y0, x1, y1]
                y_pos = (line_bbox[1] + line_bbox[3]) / 2  # Middle y-position
                
                for pattern, label_type in figure_patterns:
                    match = re.search(pattern, line_text, re.IGNORECASE)
                    if match:
                        figure_labels.append({
                            "text": line_text.strip(),
                            "number": match.group(1),
                            "type": label_type,
                            "y_pos": y_pos,
                            "bbox": line_bbox,
                        })
                        break
        
    except Exception as e:
        print(f"  Warning: Could not extract figure label positions from page {page_num + 1}: {e}")
    
    return figure_labels


def _detect_figures_with_opencv(
    img: 'Image.Image',
    width: int,
    height: int,
    min_area_ratio: float = 0.05
) -> Optional[List[Tuple[int, int, int, int]]]:
    """
    Use OpenCV contour detection to find separate figure regions in an image.
    
    This works by:
    1. Converting to grayscale
    2. Detecting edges or using adaptive thresholding
    3. Finding contours (boundaries of distinct regions)
    4. Filtering for large rectangular regions that could be separate figures
    
    Args:
        img: PIL Image object
        width: Image width in pixels
        height: Image height in pixels
        min_area_ratio: Minimum area as ratio of total image (default 0.05 = 5%)
    
    Returns:
        List of bounding boxes [(x1, y1, x2, y2), ...] if multiple figures detected, None otherwise.
    """
    if not HAS_OPENCV:
        return None
    
    try:
        # Convert PIL Image to numpy array
        img_array = np.array(img)
        
        # Ensure RGB format
        if len(img_array.shape) == 2:
            # Already grayscale
            gray = img_array
        elif img_array.shape[2] == 4:
            # RGBA - convert to grayscale
            gray = cv2.cvtColor(img_array[:, :, :3], cv2.COLOR_RGB2GRAY)
        else:
            # RGB - convert to grayscale
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Use adaptive thresholding to find regions
        # This works well for scientific figures with white backgrounds
        thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY_INV, 11, 2
        )
        
        # Apply morphological operations to connect nearby regions
        # Smaller kernel (15x15) and fewer iterations (2) to avoid merging adjacent graphs
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 15))
        dilated = cv2.dilate(thresh, kernel, iterations=2)
        
        # Find contours
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return None
        
        # Calculate minimum area threshold
        total_area = width * height
        min_area = total_area * min_area_ratio
        
        # Filter contours by size and get bounding boxes
        bboxes = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            area = w * h
            
            # Filter: must be large enough and reasonably shaped
            if area >= min_area and w >= 100 and h >= 100:
                # Check aspect ratio - figures are usually not extremely elongated
                aspect_ratio = max(w, h) / min(w, h) if min(w, h) > 0 else 999
                if aspect_ratio < 5:  # Not too elongated
                    x1 = max(0, x)
                    y1 = max(0, y)
                    x2 = min(width, x + w)
                    y2 = min(height, y + h)
                    bboxes.append((x1, y1, x2, y2))
        
        # If we have multiple valid boxes, return them
        if len(bboxes) > 1:
            # Sort by position (top-left to bottom-right)
            bboxes.sort(key=lambda b: (b[1], b[0]))
            return bboxes
        
        return None
        
    except Exception as e:
        print(f"  Warning: OpenCV detection failed: {e}")
        return None


def _split_image_by_bboxes(
    img: 'Image.Image',
    bboxes: List[Tuple[int, int, int, int]],
    img_data: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Split an image into multiple images based on bounding boxes.
    
    Args:
        img: PIL Image object
        bboxes: List of bounding boxes [(x1, y1, x2, y2), ...]
        img_data: Original image data dict
    
    Returns:
        List of new image data dicts, one for each bounding box.
    """
    result = []
    width, height = img.size
    
    for i, (x1, y1, x2, y2) in enumerate(bboxes):
        # Crop the image to this bounding box
        cropped = img.crop((x1, y1, x2, y2))
        
        # Convert to bytes
        output = io.BytesIO()
        cropped.save(output, format='PNG')
        cropped_bytes = output.getvalue()
        
        # Create new image dict
        split_data = img_data.copy()
        split_data["image_bytes"] = cropped_bytes
        split_data["image_ext"] = "png"
        split_data["width"] = cropped.width
        split_data["height"] = cropped.height
        split_data["split_index"] = i
        split_data["split_from"] = True
        split_data["original_width"] = width
        split_data["original_height"] = height
        split_data["bbox"] = (x1, y1, x2, y2)
        split_data["detection_method"] = "opencv"
        
        result.append(split_data)
    
    return result


def detect_and_split_multiple_figures(
    img_data: Dict[str, Any],
    api_key: Optional[str] = None,
    use_opencv: bool = True,
    opencv_min_area: float = 0.05,
    recursive: bool = False,
    max_depth: int = 3,
    current_depth: int = 0
) -> Optional[List[Dict[str, Any]]]:
    """
    Check if a single image contains multiple figures, and if so, split them.
    
    Uses OpenCV contour detection if available, otherwise falls back
    to OpenRouter/Claude Opus for AI-based detection.
    
    OpenCV uses edge detection and contour analysis to find separate figure
    regions within an image.
    
    Args:
        img_data: Image data dict with 'image_bytes', 'width', 'height', etc.
        api_key: OpenRouter API key (required for AI-based detection fallback)
        use_opencv: Whether to try OpenCV first (default True)
        opencv_min_area: Minimum area ratio for detected regions (0.0-1.0, default 0.05 = 5%)
        recursive: Whether to recursively split detected figures (default False)
        max_depth: Maximum recursion depth for recursive splitting (default 3)
        current_depth: Current recursion depth (internal use)
    
    Returns:
        List of split image dicts if multiple figures detected, None otherwise.
        Each dict will have the same structure as img_data but with split image bytes.
    """
    if not HAS_PIL:
        return None
    
    try:
        # Load the image
        image_bytes = img_data["image_bytes"]
        img = Image.open(io.BytesIO(image_bytes))
        width, height = img.size
        
        # Skip very small images - unlikely to contain multiple figures
        if width < 400 or height < 300:
            return None
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Try OpenCV first if available and enabled
        if use_opencv and HAS_OPENCV:
            bboxes = _detect_figures_with_opencv(img, width, height, min_area_ratio=opencv_min_area)
            if bboxes and len(bboxes) > 1:
                print(f"  OpenCV detected {len(bboxes)} figures in image" + (f" (depth {current_depth})" if current_depth > 0 else ""))
                split_results = _split_image_by_bboxes(img, bboxes, img_data)
                
                # If recursive mode is enabled, try to split each result further
                if recursive and current_depth < max_depth:
                    final_results = []
                    for split_img in split_results:
                        sub_splits = detect_and_split_multiple_figures(
                            split_img,
                            api_key=api_key,
                            use_opencv=use_opencv,
                            opencv_min_area=opencv_min_area,
                            recursive=True,
                            max_depth=max_depth,
                            current_depth=current_depth + 1
                        )
                        if sub_splits and len(sub_splits) > 1:
                            final_results.extend(sub_splits)
                        else:
                            final_results.append(split_img)
                    return final_results
                
                return split_results
        
        # Fall back to AI-based detection
        if not api_key:
            # No API key provided, skip AI detection
            return None
        
        if not HAS_REQUESTS:
            return None
        
        # Use AI to detect splits
        splits = _detect_splits_with_ai(img, image_bytes, api_key, width, height)
        
        # If no splits detected, return None (single figure)
        if not splits:
            return None
        
        # Split the image based on detected boundaries
        split_images = []
        for split_type, split_pos in splits:
            if split_type == 'vertical':
                # Split vertically at split_pos (x coordinate)
                left_img = img.crop((0, 0, split_pos, height))
                right_img = img.crop((split_pos, 0, width, height))
                split_images.extend([left_img, right_img])
            elif split_type == 'horizontal':
                # Split horizontally at split_pos (y coordinate)
                top_img = img.crop((0, 0, width, split_pos))
                bottom_img = img.crop((0, split_pos, width, height))
                split_images.extend([top_img, bottom_img])
        
        # If we have splits, create new image dicts for each split
        if split_images:
            result = []
            for i, split_img in enumerate(split_images):
                # Convert split image back to bytes
                output = io.BytesIO()
                split_img.save(output, format='PNG')
                split_bytes = output.getvalue()
                
                # Create new image dict
                split_data = img_data.copy()
                split_data["image_bytes"] = split_bytes
                split_data["image_ext"] = "png"
                split_data["width"] = split_img.width
                split_data["height"] = split_img.height
                split_data["split_index"] = i
                split_data["split_from"] = True
                split_data["original_width"] = width
                split_data["original_height"] = height
                split_data["detection_method"] = "ai"
                
                result.append(split_data)
            
            # If recursive mode is enabled, try to split each result further
            if recursive and current_depth < max_depth:
                final_results = []
                for split_img_data in result:
                    sub_splits = detect_and_split_multiple_figures(
                        split_img_data,
                        api_key=api_key,
                        use_opencv=use_opencv,
                        opencv_min_area=opencv_min_area,
                        recursive=True,
                        max_depth=max_depth,
                        current_depth=current_depth + 1
                    )
                    if sub_splits and len(sub_splits) > 1:
                        final_results.extend(sub_splits)
                    else:
                        final_results.append(split_img_data)
                return final_results
            
            return result
        
        return None
        
    except Exception as e:
        print(f"  Warning: Error detecting/splitting multiple figures: {e}")
        return None


def _detect_splits_with_ai(
    img: 'Image.Image',
    image_bytes: bytes,
    api_key: str,
    width: int,
    height: int
) -> Optional[List[Tuple[str, int]]]:
    """
    Use OpenRouter/Claude Opus to detect if image contains multiple figures and where to split.
    
    This is the fallback method when OpenCV is not available.
    
    Args:
        img: PIL Image object
        image_bytes: Raw image bytes
        api_key: OpenRouter API key
        width: Image width in pixels
        height: Image height in pixels
    
    Returns:
        List of split tuples [(split_type, position), ...] if multiple figures detected, None otherwise.
    """
    try:
        # Encode image to base64
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        
        # Determine MIME type
        mime_type = 'image/png'
        
        system_prompt = """You are an expert at analyzing scientific figures and images from research papers.

Your task is to determine if a single image contains multiple distinct, separate figures (e.g., two different graphs side by side, or stacked diagrams).

IMPORTANT: Only identify multiple figures if they are CLEARLY SEPARATE and DISTINCT. Do not split:
- Single figures with multiple panels (A, B, C labels)
- Figures with subfigures that belong together
- Single complex diagrams or flowcharts
- Figures with legends or labels that span the whole image

Only split if there are MULTIPLE COMPLETELY SEPARATE figures that could stand alone.

If the image contains multiple distinct figures, identify:
1. The split direction: "vertical" (side by side) or "horizontal" (stacked)
2. The exact pixel coordinate where to split:
   - For vertical splits: the x-coordinate (0 to image width)
   - For horizontal splits: the y-coordinate (0 to image height)

The split position should be at the boundary between the figures, typically in a white/empty space between them.

Respond ONLY with valid JSON in this exact format:
{
  "has_multiple_figures": true or false,
  "split_type": "vertical" or "horizontal" or null,
  "split_position": <integer pixel coordinate> or null
}

If has_multiple_figures is false, set split_type and split_position to null."""

        user_prompt = f"""Analyze this scientific figure image (dimensions: {width}x{height} pixels).

Determine if this image contains multiple DISTINCT, SEPARATE figures that should be split into separate images.

If yes, provide:
- split_type: "vertical" if figures are side by side, "horizontal" if stacked
- split_position: the exact pixel coordinate (x for vertical, y for horizontal) where to split

Respond with JSON only."""

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        
        payload = {
            "model": "anthropic/claude-opus-4",
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
            "max_tokens": 300,
            "temperature": 0.1,
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        
        result = response.json()
        if "choices" in result and len(result["choices"]) > 0:
            content = result["choices"][0]["message"]["content"]
            
            # Try to extract JSON from response (handle both single-line and multi-line JSON)
            import json as json_module
            json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', content, re.DOTALL)
            if json_match:
                try:
                    ai_result = json_module.loads(json_match.group())
                    
                    if (ai_result.get("has_multiple_figures") and 
                        ai_result.get("split_type") and 
                        ai_result.get("split_position") is not None):
                        
                        split_type = ai_result["split_type"].lower()
                        split_pos = int(ai_result["split_position"])
                        
                        # Validate split position is within image bounds
                        if split_type == "vertical" and 0 < split_pos < width:
                            return [("vertical", split_pos)]
                        elif split_type == "horizontal" and 0 < split_pos < height:
                            return [("horizontal", split_pos)]
                        else:
                            print(f"  Warning: AI returned invalid split position {split_pos} for {split_type} split (image: {width}x{height})")
                            return None
                except (json_module.JSONDecodeError, ValueError, KeyError) as e:
                    print(f"  Warning: Failed to parse AI response JSON: {e}")
                    print(f"  Response content: {content[:200]}")
                    return None
        
        return None
        
    except requests.exceptions.RequestException as e:
        print(f"  Warning: AI detection API request failed: {e}")
        return None
    except Exception as e:
        print(f"  Warning: AI detection failed: {e}")
        return None


def merge_image_group(image_group: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Merge a group of images into a single image.
    Images are arranged vertically or horizontally based on their positions.
    """
    if not image_group:
        return None
    
    if len(image_group) == 1:
        return image_group[0]
    
    if not HAS_PIL:
        # If PIL not available, just return the first image
        print("  Warning: PIL not available, cannot merge images. Using first image only.")
        return image_group[0]
    
    try:
        # Load all images
        pil_images = []
        for img_data in image_group:
            image_bytes = img_data["image_bytes"]
            img = Image.open(io.BytesIO(image_bytes))
            pil_images.append((img, img_data))
        
        # Sort images by their position (top to bottom, left to right)
        def get_sort_key(img_tuple):
            img, img_data = img_tuple
            rect = img_data.get("rect")
            if rect:
                try:
                    # PyMuPDF rect objects have x0, y0, x1, y1 attributes
                    return (rect.y0, rect.x0)  # Sort by y then x
                except (AttributeError, TypeError):
                    # If rect is a tuple/list, use indexing
                    if isinstance(rect, (list, tuple)) and len(rect) >= 4:
                        return (rect[1], rect[0])  # y0, x0
            return (0, 0)
        
        pil_images.sort(key=get_sort_key)
        
        # Determine if images should be stacked vertically or horizontally
        # Check if images are mostly aligned horizontally (side by side)
        if len(pil_images) >= 2:
            _, first_data = pil_images[0]
            _, second_data = pil_images[1]
            rect1 = first_data.get("rect")
            rect2 = second_data.get("rect")
            
            def get_x0(rect):
                try:
                    return rect.x0 if rect else None
                except (AttributeError, TypeError):
                    return rect[0] if isinstance(rect, (list, tuple)) and len(rect) >= 1 else None
            
            def get_x1(rect):
                try:
                    return rect.x1 if rect else None
                except (AttributeError, TypeError):
                    return rect[2] if isinstance(rect, (list, tuple)) and len(rect) >= 3 else None
            
            x0_1 = get_x0(rect1)
            x1_1 = get_x1(rect1)
            x0_2 = get_x0(rect2)
            
            if x0_1 is not None and x1_1 is not None and x0_2 is not None:
                # If second image is mostly to the right of first, arrange horizontally
                if x0_2 > x1_1 * 0.8:
                    # Arrange horizontally
                    total_width = sum(img.width for img, _ in pil_images)
                    max_height = max(img.height for img, _ in pil_images)
                    merged = Image.new('RGB', (total_width, max_height), 'white')
                    x_offset = 0
                    for img, _ in pil_images:
                        merged.paste(img, (x_offset, 0))
                        x_offset += img.width
                else:
                    # Arrange vertically
                    max_width = max(img.width for img, _ in pil_images)
                    total_height = sum(img.height for img, _ in pil_images)
                    merged = Image.new('RGB', (max_width, total_height), 'white')
                    y_offset = 0
                    for img, _ in pil_images:
                        merged.paste(img, (0, y_offset))
                        y_offset += img.height
            else:
                # Default: stack vertically
                max_width = max(img.width for img, _ in pil_images)
                total_height = sum(img.height for img, _ in pil_images)
                merged = Image.new('RGB', (max_width, total_height), 'white')
                y_offset = 0
                for img, _ in pil_images:
                    merged.paste(img, (0, y_offset))
                    y_offset += img.height
        else:
            # Single image (shouldn't happen, but handle it)
            merged, _ = pil_images[0]
        
        # Convert back to bytes
        output = io.BytesIO()
        merged.save(output, format='PNG')
        merged_bytes = output.getvalue()
        
        # Create merged image data dict
        merged_data = image_group[0].copy()
        merged_data["image_bytes"] = merged_bytes
        merged_data["image_ext"] = "png"
        merged_data["width"] = merged.width
        merged_data["height"] = merged.height
        merged_data["merged_from"] = len(image_group)
        merged_data["original_images"] = [img["img_index"] for img in image_group]
        
        return merged_data
        
    except Exception as e:
        print(f"  Warning: Could not merge images: {e}. Using first image only.")
        return image_group[0]


def group_images_by_figure(
    images_data: List[Dict[str, Any]],
    page_num: int,
    page,
    page_text: str
) -> List[List[Dict[str, Any]]]:
    """
    Group images that belong to the same conceptual figure.
    
    Returns a list of groups, where each group is a list of image dicts that belong together.
    """
    if not images_data:
        return []
    
    # Find figure labels and their positions
    figure_labels = find_figure_labels_with_positions(page_num, page)
    
    # If no figure labels found, try to group by spatial proximity
    if not figure_labels:
        # Group images that are close together vertically (within 100 pixels)
        groups = []
        used_indices = set()
        
        for i, img1 in enumerate(images_data):
            if i in used_indices:
                continue
            
            group = [img1]
            used_indices.add(i)
            
            rect1 = img1.get("rect")
            if not rect1:
                continue
            
            y1_center = (rect1.y0 + rect1.y1) / 2
            
            # Find other images on the same page that are close vertically
            for j, img2 in enumerate(images_data[i+1:], start=i+1):
                if j in used_indices:
                    continue
                
                rect2 = img2.get("rect")
                if not rect2:
                    continue
                
                y2_center = (rect2.y0 + rect2.y1) / 2
                
                # If images are close vertically (within 150 pixels) and horizontally overlapping
                vertical_distance = abs(y1_center - y2_center)
                horizontal_overlap = not (rect1.x1 < rect2.x0 or rect2.x1 < rect1.x0)
                
                if vertical_distance < 150 and horizontal_overlap:
                    group.append(img2)
                    used_indices.add(j)
            
            groups.append(group)
        
        return groups if groups else [[img] for img in images_data]
    
    # Group images by their proximity to figure labels
    # Sort labels by y-position (top to bottom)
    figure_labels.sort(key=lambda x: x["y_pos"])
    
    groups = []
    used_indices = set()
    
    for label_idx, label in enumerate(figure_labels):
        label_y = label["y_pos"]
        group = []
        
        # Find the next label below this one (if any) to establish boundaries
        next_label_y = None
        if label_idx + 1 < len(figure_labels):
            next_label_y = figure_labels[label_idx + 1]["y_pos"]
        
        # Find images that are near this label (within 500 pixels below it)
        for i, img in enumerate(images_data):
            if i in used_indices:
                continue
            
            rect = img.get("rect")
            if not rect:
                continue
            
            img_y_center = (rect.y0 + rect.y1) / 2
            
            # Image should be below the label but not too far
            # More conservative: reduce range from 800 to 500 pixels
            # Also, if there's a next label, don't group images that are closer to the next label
            max_distance = 500
            if next_label_y:
                # Don't group if image is closer to next label than current label
                distance_to_current = abs(img_y_center - label_y)
                distance_to_next = abs(img_y_center - next_label_y)
                if distance_to_next < distance_to_current:
                    continue
                # Also limit range to halfway point between labels
                halfway = (label_y + next_label_y) / 2
                max_distance = min(500, halfway - label_y)
            
            if img_y_center > label_y - 100 and img_y_center < label_y + max_distance:
                group.append(img)
                used_indices.add(i)
        
        if group:
            groups.append(group)
    
    # Add any ungrouped images as individual groups
    for i, img in enumerate(images_data):
        if i not in used_indices:
            groups.append([img])
    
    return groups if groups else [[img] for img in images_data]


def is_logo_or_banner(
    img_data: Dict[str, Any],
    page_num: int,
    page,
    page_text: str
) -> bool:
    """
    Detect if an image is likely a logo, banner, or decorative element.
    
    Logos typically have:
    - Small dimensions (width < 600px or height < 200px)
    - Wide aspect ratio (width/height > 2.0)
    - Often at bottom or top of page
    - May have text like "logo", publisher name, copyright nearby
    """
    width = img_data.get("width", 0)
    height = img_data.get("height", 0)
    
    if width == 0 or height == 0:
        return False
    
    aspect_ratio = width / height if height > 0 else 0
    
    # Check size and aspect ratio - logos are typically small and wide
    # Example: 500x175 = aspect ratio ~2.86, which is typical for logos
    if width < 600 and height < 200:
        if aspect_ratio > 2.0:  # Wide aspect ratio
            return True
    
    # Also check for very small images that are wide (like figure 8: 500x175)
    if width < 550 and height < 180 and aspect_ratio > 2.5:
        return True
    
    # Check position - logos often at bottom of page
    rect = img_data.get("rect")
    if rect:
        try:
            page_height = page.rect.height if hasattr(page, 'rect') else 800
            y_pos = rect.y0 if hasattr(rect, 'y0') else (rect[1] if isinstance(rect, (list, tuple)) else 0)
            
            # If image is in bottom 20% of page and small/wide, likely a logo
            if y_pos > page_height * 0.80 and width < 600 and aspect_ratio > 2.0:
                return True
            
            # If image is in top 10% of page and small, might be header logo
            if y_pos < page_height * 0.10 and width < 600 and height < 150:
                return True
        except (AttributeError, TypeError, IndexError):
            pass
    
    # Check for logo-related text nearby
    logo_keywords = ['logo', 'copyright', 'publisher', 'journal', 'doi:', 'issn', 
                     'mdcpi', 'mdpi', 'springer', 'elsevier', 'wiley', 'nature',
                     'plos', 'bioscientifica', 'hindawi', 'cells', 'basel']
    page_text_lower = page_text.lower()
    for keyword in logo_keywords:
        if keyword in page_text_lower:
            # If logo keyword found and image is small/wide, likely a logo
            if width < 600 and height < 200 and aspect_ratio > 2.0:
                return True
    
    return False


def is_labeled_figure_or_table(
    page_num: int,
    page_texts: List[str],
    img_index: int,
    img_data: Dict[str, Any] = None,
    page = None
) -> bool:
    """
    Check if an image is a labeled Figure or Table by searching for labels in the page text.
    
    Returns True if the image appears to be a labeled figure/table, False otherwise.
    """
    # First check if it's a logo - logos should be ignored
    if img_data and page is not None:
        page_text = page_texts[page_num] if page_num < len(page_texts) else ""
        if is_logo_or_banner(img_data, page_num, page, page_text):
            return False
    
    # Get text from the current page and adjacent pages
    pages_to_check = []
    for offset in [-1, 0, 1]:
        adj_page = page_num + offset
        if 0 <= adj_page < len(page_texts):
            pages_to_check.append((adj_page, page_texts[adj_page]))
    
    # Patterns to look for: Figure/Fig/Table labels
    figure_table_patterns = [
        r'Figure\s+\d+[A-Za-z]?',  # "Figure 1", "Figure 2A", etc.
        r'Fig\.\s+\d+[A-Za-z]?',   # "Fig. 1", "Fig. 2A", etc.
        r'Table\s+\d+[A-Za-z]?',   # "Table 1", "Table 2A", etc.
        r'Tbl\.\s+\d+[A-Za-z]?',   # "Tbl. 1", etc.
    ]
    
    # Check each page for figure/table labels
    for page_idx, page_text in pages_to_check:
        for pattern in figure_table_patterns:
            matches = re.findall(pattern, page_text, re.IGNORECASE)
            if matches:
                # Found at least one figure/table label on this page or adjacent pages
                # This suggests the image might be a labeled figure/table
                return True
    
    # Also check for caption-like text (text that might be a caption)
    # Look for lines that contain both figure/table keywords and descriptive text
    for page_idx, page_text in pages_to_check:
        lines = page_text.split('\n')
        for line in lines:
            line_lower = line.lower().strip()
            # Check if line contains figure/table keywords and looks like a caption
            has_label = any(kw in line_lower for kw in ['figure', 'fig.', 'table', 'tbl.'])
            # Captions are usually short and descriptive
            if has_label and len(line.strip()) > 10 and len(line.strip()) < 500:
                return True
    
    # No figure/table labels found - likely not a labeled figure/table
    return False


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
    
    def __init__(
        self,
        pdf_path: str,
        output_dir: str,
        max_workers: int = None,
        use_opencv: bool = True,
        opencv_min_area: float = 0.05,
        recursive_split: bool = True,
        max_split_depth: int = 3
    ):
        self.pdf_path = pdf_path
        self.output_dir = output_dir
        self.figures: List[Dict[str, Any]] = []
        self.max_workers = max_workers or os.cpu_count() or 4
        self.use_opencv = use_opencv
        self.opencv_min_area = opencv_min_area
        self.recursive_split = recursive_split
        self.max_split_depth = max_split_depth
        
        os.makedirs(output_dir, exist_ok=True)
    
    # =========================================================================
    # EXTRACTION PIPELINE METHODS
    # =========================================================================
    
    def _extract_page_texts(self, doc) -> List[str]:
        """Extract text from all pages in parallel."""
        num_pages = len(doc)
        page_texts = [""] * num_pages
        
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            text_futures = {
                executor.submit(extract_page_text, page_num, doc[page_num]): page_num 
                for page_num in range(num_pages)
            }
            
            for future in as_completed(text_futures):
                page_num, text = future.result()
                page_texts[page_num] = text
        
        return page_texts
    
    def _build_full_text(self, page_texts: List[str]) -> str:
        """Build full document text for context matching."""
        full_text = ""
        for page_num, text in enumerate(page_texts):
            full_text += f"\n--- Page {page_num + 1} ---\n{text}"
        return full_text
    
    def _extract_all_images(self, doc, min_size: int) -> List[Dict[str, Any]]:
        """Extract images from all pages in parallel."""
        all_images_data = []
        
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            image_futures = {
                executor.submit(extract_page_images, page_num, doc[page_num], doc, min_size): page_num
                for page_num in range(len(doc))
            }
            
            for future in as_completed(image_futures):
                images_data = future.result()
                all_images_data.extend(images_data)
        
        # Sort images by page number and index to maintain order
        all_images_data.sort(key=lambda x: (x["page_num"], x["img_index"]))
        return all_images_data
    
    def _deduplicate_images_by_xref(self, all_images_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Deduplicate images based on xref (same image can appear multiple times on same page).
        Note: Same xref on different pages are kept as separate images.
        """
        seen_xrefs_by_page = {}  # {page_num: {xref: img}}
        images_without_xref = []
        
        for img in all_images_data:
            xref = img.get("xref")
            page_num = img.get("page_num")
            
            if xref is None:
                images_without_xref.append(img)
                continue
            
            if page_num not in seen_xrefs_by_page:
                seen_xrefs_by_page[page_num] = {}
            
            area = img.get("width", 0) * img.get("height", 0)
            
            if xref not in seen_xrefs_by_page[page_num]:
                seen_xrefs_by_page[page_num][xref] = img
            else:
                # Keep the one with larger area
                existing_img = seen_xrefs_by_page[page_num][xref]
                existing_area = existing_img.get("width", 0) * existing_img.get("height", 0)
                if area > existing_area:
                    seen_xrefs_by_page[page_num][xref] = img
        
        # Create deduplicated list, preserving order by page and index
        deduplicated_images = []
        for page_num in sorted(seen_xrefs_by_page.keys()):
            page_images = list(seen_xrefs_by_page[page_num].values())
            page_images.sort(key=lambda x: x.get("img_index", 0))
            deduplicated_images.extend(page_images)
        
        deduplicated_images.extend(images_without_xref)
        return deduplicated_images
    
    def _group_images_into_figures(
        self,
        all_images_data: List[Dict[str, Any]],
        doc,
        page_texts: List[str]
    ) -> List[List[Dict[str, Any]]]:
        """Group images by page, then by figure proximity."""
        images_by_page = {}
        for img in all_images_data:
            page_num = img["page_num"]
            if page_num not in images_by_page:
                images_by_page[page_num] = []
            images_by_page[page_num].append(img)
        
        grouped_images = []
        for page_num, page_images in images_by_page.items():
            page = doc[page_num]
            page_text = page_texts[page_num]
            groups = group_images_by_figure(page_images, page_num, page, page_text)
            grouped_images.extend(groups)
        
        return grouped_images
    
    # =========================================================================
    # IMAGE SAVING METHODS
    # =========================================================================
    
    def _generate_figure_name(
        self,
        page_num: int,
        image_counter: int,
        is_labeled: bool,
        merged_count: int = 1,
        split_index: int = None,
        total_splits: int = None
    ) -> str:
        """Generate a figure filename (without extension)."""
        prefix = "figure" if is_labeled else "ignore_figure"
        base = f"page{page_num + 1}_{prefix}_{image_counter:03d}"
        
        if split_index is not None and total_splits is not None:
            return f"{base}_split{split_index + 1}"
        elif merged_count > 1:
            return f"{base}_merged{merged_count}"
        return base
    
    def _save_image_file(self, image_bytes: bytes, image_path: str) -> bool:
        """Save image bytes to disk. Returns True on success."""
        try:
            with open(image_path, "wb") as f:
                f.write(image_bytes)
            return True
        except Exception as e:
            print(f"  Error saving image {image_path}: {e}")
            return False
    
    def _save_context_file(
        self,
        context_path: str,
        page_num: int,
        width: int,
        height: int,
        context: str,
        merged_count: int = 1,
        split_index: int = None,
        total_splits: int = None
    ) -> bool:
        """Save context text to disk. Returns True on success."""
        try:
            with open(context_path, "w", encoding="utf-8") as f:
                f.write(f"Figure extracted from: {os.path.basename(self.pdf_path)}\n")
                f.write(f"Page: {page_num + 1}\n")
                f.write(f"Image dimensions: {width}x{height}\n")
                
                if split_index is not None and total_splits is not None:
                    f.write(f"Split {split_index + 1} of {total_splits} from original image\n")
                    if merged_count > 1:
                        f.write(f"Original image was merged from {merged_count} separate image files\n")
                elif merged_count > 1:
                    f.write(f"Merged from {merged_count} separate image files\n")
                
                f.write(f"\n{'='*60}\n")
                f.write("CONTEXT:\n")
                f.write(f"{'='*60}\n\n")
                f.write(context)
            return True
        except Exception as e:
            print(f"  Error saving context for {context_path}: {e}")
            return False
    
    def _build_figure_result(
        self,
        image_counter: int,
        page_num: int,
        image_filename: str,
        image_path: str,
        width: int,
        height: int,
        image_ext: str,
        is_labeled: bool,
        merged_count: int = 1,
        context: str = "",
        context_path: str = None,
        split_index: int = None,
        total_splits: int = None,
        original_image_indices: List[int] = None
    ) -> Dict[str, Any]:
        """Build a figure result dictionary."""
        result = {
            "index": image_counter,
            "page": page_num + 1,
            "filename": image_filename,
            "image_path": image_path,
            "context_path": context_path,
            "width": width,
            "height": height,
            "format": image_ext,
            "context": context,
            "is_labeled": is_labeled,
            "merged_count": merged_count
        }
        
        if split_index is not None:
            result["split_index"] = split_index
            result["split_from"] = True
            result["total_splits"] = total_splits
        
        if original_image_indices:
            result["original_image_indices"] = original_image_indices
        
        return result
    
    # =========================================================================
    # IMAGE GROUP PROCESSING METHODS
    # =========================================================================
    
    def _save_split_figure(
        self,
        split_img_data: Dict[str, Any],
        split_idx: int,
        total_splits: int,
        merged_count: int,
        doc,
        page_texts: List[str],
        full_text: str,
        image_counter: int
    ) -> Optional[Dict[str, Any]]:
        """Save a single split figure and return its result dict."""
        page_num = split_img_data["page_num"]
        image_bytes = split_img_data["image_bytes"]
        image_ext = split_img_data["image_ext"]
        width = split_img_data["width"]
        height = split_img_data["height"]
        
        page = doc[page_num]
        is_labeled = is_labeled_figure_or_table(page_num, page_texts, 0, split_img_data, page)
        
        fig_name = self._generate_figure_name(
            page_num, image_counter, is_labeled, merged_count, split_idx, total_splits
        )
        image_filename = f"{fig_name}.{image_ext}"
        image_path = os.path.join(self.output_dir, image_filename)
        
        if not self._save_image_file(image_bytes, image_path):
            return None
        
        context = ""
        context_path = None
        
        if is_labeled:
            print(f"  Extracted (split {split_idx + 1}/{total_splits}): {image_filename} ({width}x{height})")
            context = find_figure_context(page_num, page_texts, full_text, image_counter)
            context_path = os.path.join(self.output_dir, f"{fig_name}.txt")
            self._save_context_file(
                context_path, page_num, width, height, context,
                merged_count, split_idx, total_splits
            )
        else:
            print(f"  Ignored (not labeled, split {split_idx + 1}/{total_splits}): {image_filename} ({width}x{height})")
        
        return self._build_figure_result(
            image_counter, page_num, image_filename, image_path,
            width, height, image_ext, is_labeled, merged_count,
            context, context_path, split_idx, total_splits
        )
    
    def _save_single_figure(
        self,
        img_data: Dict[str, Any],
        merged_count: int,
        doc,
        page_texts: List[str],
        full_text: str,
        image_counter: int
    ) -> Optional[Dict[str, Any]]:
        """Save a single (non-split) figure and return its result dict."""
        page_num = img_data["page_num"]
        img_index = img_data.get("img_index", 0)
        image_bytes = img_data["image_bytes"]
        image_ext = img_data["image_ext"]
        width = img_data["width"]
        height = img_data["height"]
        
        page = doc[page_num]
        is_labeled = is_labeled_figure_or_table(page_num, page_texts, img_index, img_data, page)
        
        fig_name = self._generate_figure_name(page_num, image_counter, is_labeled, merged_count)
        image_filename = f"{fig_name}.{image_ext}"
        image_path = os.path.join(self.output_dir, image_filename)
        
        if not self._save_image_file(image_bytes, image_path):
            return None
        
        # Log extraction status
        if is_labeled:
            merge_info = f" (merged {merged_count} images)" if merged_count > 1 else ""
            print(f"  Extracted{merge_info}: {image_filename} ({width}x{height})")
        else:
            merge_info = f" (not labeled, merged {merged_count})" if merged_count > 1 else " (not labeled)"
            print(f"  Ignored{merge_info}: {image_filename} ({width}x{height})")
        
        context = ""
        context_path = None
        
        if is_labeled:
            context = find_figure_context(page_num, page_texts, full_text, image_counter)
            context_path = os.path.join(self.output_dir, f"{fig_name}.txt")
            self._save_context_file(context_path, page_num, width, height, context, merged_count)
        
        return self._build_figure_result(
            image_counter, page_num, image_filename, image_path,
            width, height, image_ext, is_labeled, merged_count,
            context, context_path,
            original_image_indices=img_data.get("original_images") if merged_count > 1 else None
        )
    
    def _process_image_group(
        self,
        image_group: List[Dict[str, Any]],
        doc,
        page_texts: List[str],
        full_text: str,
        api_key: str,
        image_counter_start: int
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Process a group of images: merge if needed, split if needed, save to disk.
        
        Processing order:
        1. MERGE first - multiple image files may contain parts of same graphic
        2. SPLIT after merge - merged/single image may contain multiple distinct figures
        
        Returns:
            Tuple of (list of figure results, final image counter value)
        """
        if not image_group:
            return [], image_counter_start
        
        image_counter = image_counter_start
        results = []
        
        # Step 1: Merge images if group has multiple
        if len(image_group) > 1:
            img_data = merge_image_group(image_group)
            if not img_data:
                return [], image_counter
            merged_count = len(image_group)
        else:
            img_data = image_group[0]
            merged_count = 1
        
        # Step 2: Check if image contains multiple distinct figures and split if needed
        split_images = detect_and_split_multiple_figures(
            img_data,
            api_key=api_key,
            use_opencv=self.use_opencv,
            opencv_min_area=self.opencv_min_area,
            recursive=self.recursive_split,
            max_depth=self.max_split_depth
        )
        
        # Process splits or single image
        if split_images and len(split_images) > 1:
            print(f"  Detected {len(split_images)} figures in single image, splitting...")
            for split_idx, split_img_data in enumerate(split_images):
                image_counter += 1
                result = self._save_split_figure(
                    split_img_data, split_idx, len(split_images), merged_count,
                    doc, page_texts, full_text, image_counter
                )
                if result:
                    results.append(result)
        else:
            image_counter += 1
            result = self._save_single_figure(
                img_data, merged_count, doc, page_texts, full_text, image_counter
            )
            if result:
                results.append(result)
        
        return results, image_counter
    
    # =========================================================================
    # MAIN EXTRACTION METHOD
    # =========================================================================
    
    def extract_all(self, min_size: int = 50) -> List[Dict[str, Any]]:
        """
        Extract all figures from the PDF using parallel processing.
        
        Pipeline:
        1. Extract text from all pages (parallel)
        2. Extract images from all pages (parallel)
        3. Deduplicate images by xref
        4. Group images into figures
        5. Process each group: merge parts, split distinct figures, save
        6. Deduplicate final figures by content hash
        """
        if not HAS_PYMUPDF:
            print("Error: PyMuPDF (fitz) is required for image extraction.")
            print("Install it with: pip install PyMuPDF")
            return []
        
        doc = fitz.open(self.pdf_path)
        print(f"Opened PDF with {len(doc)} pages")
        print(f"Using {self.max_workers} worker threads for parallel processing")
        
        # Step 1: Extract text from all pages
        print("Extracting text from pages...")
        page_texts = self._extract_page_texts(doc)
        full_text = self._build_full_text(page_texts)
        
        # Step 2: Extract images from all pages
        print("Extracting images from pages...")
        all_images_data = self._extract_all_images(doc, min_size)
        
        # Step 3: Deduplicate images by xref
        print("Deduplicating images...")
        original_count = len(all_images_data)
        all_images_data = self._deduplicate_images_by_xref(all_images_data)
        print(f"Deduplicated {original_count} images to {len(all_images_data)} unique images")
        
        # Step 4: Group images into figures
        print("Grouping images by figure...")
        grouped_images = self._group_images_into_figures(all_images_data, doc, page_texts)
        print(f"Grouped {len(all_images_data)} images into {len(grouped_images)} figure groups")
        
        # Step 5: Process each group (merge, split, save)
        print(f"Processing {len(grouped_images)} figure groups...")
        api_key = get_openrouter_api_key()
        image_counter = 0
        
        for image_group in grouped_images:
            results, image_counter = self._process_image_group(
                image_group, doc, page_texts, full_text, api_key, image_counter
            )
            self.figures.extend(results)
        
        # Sort figures by index to maintain order
        self.figures.sort(key=lambda x: x["index"])
        
        # Step 6: Deduplicate figures by content hash
        print("Deduplicating extracted figures by content...")
        self.figures = self._deduplicate_figures_by_content(self.figures)
        
        doc.close()
        
        print(f"\nExtracted {len(self.figures)} figures total (after deduplication)")
        return self.figures
    
    def _deduplicate_figures_by_content(self, figures: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Remove duplicate figures by comparing image content hashes.
        Keeps the first occurrence of each unique image.
        """
        seen_hashes = {}
        deduplicated = []
        removed_count = 0
        
        for fig in figures:
            image_path = fig.get("image_path")
            if not image_path or not os.path.exists(image_path):
                # If file doesn't exist, keep it (might be an error case)
                deduplicated.append(fig)
                continue
            
            try:
                # Read image file and compute hash
                with open(image_path, "rb") as f:
                    image_bytes = f.read()
                    image_hash = hashlib.md5(image_bytes).hexdigest()
                
                # Check if we've seen this image before
                if image_hash in seen_hashes:
                    # Duplicate found - remove the file and skip this figure
                    removed_count += 1
                    print(f"  Removed duplicate: {fig['filename']} (same as {seen_hashes[image_hash]['filename']})")
                    
                    # Delete the duplicate file
                    try:
                        os.remove(image_path)
                        # Also remove context file if it exists
                        context_path = fig.get("context_path")
                        if context_path and os.path.exists(context_path):
                            os.remove(context_path)
                    except Exception as e:
                        print(f"  Warning: Could not delete duplicate file {image_path}: {e}")
                    
                    continue
                
                # First time seeing this image - keep it
                seen_hashes[image_hash] = fig
                deduplicated.append(fig)
                
            except Exception as e:
                # If we can't read/hash the file, keep it to be safe
                print(f"  Warning: Could not hash image {image_path}: {e}")
                deduplicated.append(fig)
        
        if removed_count > 0:
            print(f"Deduplicated: removed {removed_count} duplicate figure(s)")
        
        # Renumber indices to be sequential
        for i, fig in enumerate(deduplicated, start=1):
            fig["index"] = i
        
        return deduplicated


def main():
    parser = argparse.ArgumentParser(
        description='Extract figures from PDFs and optionally convert to tables (parallelized)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument('pdf_path', help='Path to the PDF file')
    parser.add_argument('output_dir', help='Directory to save extracted figures')
    parser.add_argument(
        '--convert-to-tables', '-t',
        action='store_true',
        help='Convert extracted images to tables using separate conversion script'
    )
    parser.add_argument(
        '--use-separate-converter',
        action='store_true',
        help='Use separate convert_figures_to_tables.py script instead of built-in conversion'
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
    parser.add_argument(
        '--no-opencv',
        action='store_true',
        help='Disable OpenCV contour detection and use only AI-based detection'
    )
    parser.add_argument(
        '--opencv-min-area', '-d',
        type=float,
        default=0.05,
        help='OpenCV minimum area ratio for figure detection (default: 0.05 = 5%% of image)'
    )
    parser.add_argument(
        '--recursive-split', '-r',
        action='store_true',
        default=True,
        help='Recursively split detected figures to find sub-figures (default: enabled)'
    )
    parser.add_argument(
        '--no-recursive-split',
        action='store_true',
        help='Disable recursive splitting of figures'
    )
    parser.add_argument(
        '--max-split-depth',
        type=int,
        default=3,
        help='Maximum recursion depth for figure splitting (default: 3)'
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
    
    # Determine if recursive splitting is enabled
    recursive_split = args.recursive_split and not args.no_recursive_split
    
    # Print detection method info
    print("="*60)
    print("FIGURE EXTRACTION CONFIGURATION")
    print("="*60)
    if args.no_opencv:
        print("Multi-figure detection: AI-based (OpenCV disabled)")
    elif HAS_OPENCV:
        print("Multi-figure detection: OpenCV contour detection (preferred)")
        print(f"  Minimum area ratio: {args.opencv_min_area}")
    else:
        print("Multi-figure detection: AI-based (OpenCV not installed)")
        print("  To use OpenCV: pip3 install opencv-python")
    
    if recursive_split:
        print(f"Recursive splitting: ENABLED (max depth: {args.max_split_depth})")
    else:
        print("Recursive splitting: DISABLED")
    print()
    
    # Extract figures
    print(f"Extracting figures from: {args.pdf_path}")
    print(f"Output directory: {args.output_dir}")
    print()
    
    extractor = FigureExtractor(
        args.pdf_path,
        args.output_dir,
        max_workers=args.max_workers,
        use_opencv=not args.no_opencv,
        opencv_min_area=args.opencv_min_area,
        recursive_split=recursive_split,
        max_split_depth=args.max_split_depth
    )
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
    if args.convert_to_tables or args.use_separate_converter:
        print("\n" + "="*60)
        print("CONVERTING IMAGES TO TABLES")
        print("="*60)
        
        # Use separate conversion script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        convert_script = os.path.join(script_dir, 'convert_figures_to_tables.py')
        
        if not os.path.exists(convert_script):
            print(f"Error: Conversion script not found: {convert_script}")
            sys.exit(1)
        
        # Build convert command
        convert_cmd = [sys.executable, convert_script, args.output_dir]
        if args.api_workers:
            convert_cmd.extend(['--api-workers', str(args.api_workers)])
        
        result = subprocess.run(convert_cmd)
        if result.returncode != 0:
            print(f"\nError: Table conversion failed with exit code {result.returncode}")
            sys.exit(result.returncode)
    
    print("\n" + "="*60)
    print("EXTRACTION COMPLETE")
    print("="*60)
    print(f"Extracted {len(figures)} figures")
    print(f"Output directory: {args.output_dir}")


if __name__ == '__main__':
    main()
