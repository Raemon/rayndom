"""
Shared pytest fixtures for figure extraction tests.
"""
import pytest
import sys
import os
import io
import tempfile
from datetime import datetime
from unittest.mock import Mock, MagicMock

# Add tools/figure-extraction to path for imports
# Test file is at: test/extract_and_convert/conftest.py
# Need to get to: tools/figure-extraction/
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(project_root, 'tools', 'figure-extraction'))

try:
    from PIL import Image, ImageDraw
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

try:
    import cv2
    import numpy as np
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False


# =============================================================================
# IMAGE FIXTURES
# =============================================================================

@pytest.fixture
def sample_image_bytes():
    """Create a simple 400x300 white test image as bytes."""
    if not HAS_PIL:
        pytest.skip("PIL not installed")
    
    img = Image.new('RGB', (400, 300), color='white')
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()


@pytest.fixture
def small_image_bytes():
    """Create a small 40x40 image (below typical min_size threshold)."""
    if not HAS_PIL:
        pytest.skip("PIL not installed")
    
    img = Image.new('RGB', (40, 40), color='gray')
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()


@pytest.fixture
def logo_shaped_image_bytes():
    """Create a wide, short image typical of logos (500x175)."""
    if not HAS_PIL:
        pytest.skip("PIL not installed")
    
    img = Image.new('RGB', (500, 175), color='blue')
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()


@pytest.fixture
def multi_figure_image_bytes():
    """
    Create an 800x400 image with two distinct rectangular regions side by side.
    Simulates a PDF page with two figures placed horizontally.
    """
    if not HAS_PIL:
        pytest.skip("PIL not installed")
    
    img = Image.new('RGB', (800, 400), color='white')
    draw = ImageDraw.Draw(img)
    
    # Left figure region (with some content)
    draw.rectangle([50, 50, 350, 350], fill='lightgray', outline='black')
    draw.text((150, 180), "Fig A", fill='black')
    
    # Right figure region
    draw.rectangle([450, 50, 750, 350], fill='lightgray', outline='black')
    draw.text((550, 180), "Fig B", fill='black')
    
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()


@pytest.fixture
def stacked_figure_image_bytes():
    """
    Create a 400x800 image with two distinct rectangular regions stacked vertically.
    """
    if not HAS_PIL:
        pytest.skip("PIL not installed")
    
    img = Image.new('RGB', (400, 800), color='white')
    draw = ImageDraw.Draw(img)
    
    # Top figure region
    draw.rectangle([50, 50, 350, 350], fill='lightgray', outline='black')
    
    # Bottom figure region
    draw.rectangle([50, 450, 350, 750], fill='lightgray', outline='black')
    
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()


# =============================================================================
# IMAGE DATA DICT FIXTURES
# =============================================================================

@pytest.fixture
def mock_img_data(sample_image_bytes):
    """Standard image data dict matching extract_page_images output."""
    return {
        "page_num": 0,
        "img_index": 0,
        "xref": 1,
        "image_bytes": sample_image_bytes,
        "image_ext": "png",
        "width": 400,
        "height": 300,
        "rect": None,
        "all_rects": [],
    }


@pytest.fixture
def mock_img_data_with_rect(sample_image_bytes):
    """Image data dict with a mock rect object."""
    mock_rect = Mock()
    mock_rect.x0 = 100
    mock_rect.y0 = 200
    mock_rect.x1 = 500
    mock_rect.y1 = 500
    
    return {
        "page_num": 0,
        "img_index": 0,
        "xref": 1,
        "image_bytes": sample_image_bytes,
        "image_ext": "png",
        "width": 400,
        "height": 300,
        "rect": mock_rect,
        "all_rects": [mock_rect],
    }


@pytest.fixture
def logo_img_data(logo_shaped_image_bytes):
    """Image data dict for a logo-shaped image."""
    return {
        "page_num": 0,
        "img_index": 0,
        "xref": 2,
        "image_bytes": logo_shaped_image_bytes,
        "image_ext": "png",
        "width": 500,
        "height": 175,
        "rect": None,
        "all_rects": [],
    }


# =============================================================================
# MOCK PAGE/DOCUMENT FIXTURES
# =============================================================================

@pytest.fixture
def mock_page():
    """Mock PyMuPDF page object."""
    page = Mock()
    page.get_text.return_value = "Sample page text with Figure 1 reference."
    page.get_images.return_value = []
    
    # Mock rect for page dimensions
    page.rect = Mock()
    page.rect.height = 800
    page.rect.width = 600
    
    return page


@pytest.fixture
def mock_page_with_figure_labels():
    """Mock page with figure/table labels in text."""
    page = Mock()
    page.get_text.return_value = """
    This is some introductory text.
    
    Figure 1. This is the caption for figure one.
    
    More text discussing the results.
    
    Table 2. Summary of experimental data.
    
    Fig. 3A shows the comparison.
    """
    
    # Mock get_text("dict") for label position detection
    page.get_text.side_effect = lambda fmt=None: {
        None: page.get_text.return_value,
        "dict": {
            "blocks": [
                {
                    "lines": [
                        {
                            "spans": [{"text": "Figure 1. This is the caption"}],
                            "bbox": [50, 200, 400, 220]
                        }
                    ]
                },
                {
                    "lines": [
                        {
                            "spans": [{"text": "Table 2. Summary of data"}],
                            "bbox": [50, 400, 400, 420]
                        }
                    ]
                }
            ]
        }
    }.get(fmt, "")
    
    page.rect = Mock()
    page.rect.height = 800
    page.rect.width = 600
    
    return page


@pytest.fixture
def mock_doc(mock_page):
    """Mock PyMuPDF document object."""
    doc = Mock()
    doc.__len__ = Mock(return_value=3)
    doc.__getitem__ = Mock(return_value=mock_page)
    doc.extract_image.return_value = {
        "image": b"fake_image_data",
        "ext": "png",
        "width": 400,
        "height": 300,
    }
    return doc


# =============================================================================
# FILESYSTEM FIXTURES
# =============================================================================

@pytest.fixture(scope="session")
def test_output_base_dir():
    """Create a single test output directory at downloads/test/ketamine[timestamp] for the entire test session."""
    # Get project root (3 levels up from test/extract_and_convert/conftest.py)
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    # Create timestamp string (format: YYYYMMDD_HHMMSS) - only once per session
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Create output directory path
    output_dir = os.path.join(project_root, "downloads", "test", f"ketamine{timestamp}")
    
    # Create directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    return output_dir


@pytest.fixture
def temp_output_dir(test_output_base_dir):
    """Create a test output directory using the session-scoped base directory."""
    # Use the session-scoped base directory for all tests
    yield test_output_base_dir
    
    # Note: We don't clean up the directory after tests so outputs persist


@pytest.fixture
def temp_pdf_path(temp_output_dir):
    """Path for a temporary PDF (does not create the file)."""
    return os.path.join(temp_output_dir, "test.pdf")


# =============================================================================
# PAGE TEXT FIXTURES
# =============================================================================

@pytest.fixture
def sample_page_texts():
    """List of page texts for a 3-page document."""
    return [
        "Page 1 introduction text.\nFigure 1: Overview of the system.",
        "Page 2 with more content.\nFig. 2 shows detailed results.\nTable 1 summarizes findings.",
        "Page 3 conclusion.\nAs shown in Figure 3, the results confirm our hypothesis.",
    ]


@pytest.fixture
def sample_full_text(sample_page_texts):
    """Full document text built from page texts."""
    return "\n".join(
        f"\n--- Page {i + 1} ---\n{text}" 
        for i, text in enumerate(sample_page_texts)
    )
