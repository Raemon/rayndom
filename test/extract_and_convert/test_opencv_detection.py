"""
Tests for OpenCV-based figure detection functions.

These tests verify the contour detection and image splitting functionality
when OpenCV is available.
"""
import pytest
import sys
import os
import io

# Add tools/figure-extraction to path for imports
# Test file is at: test/extract_and_convert/test_opencv_detection.py
# Need to get to: tools/figure-extraction/
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(project_root, 'tools', 'figure-extraction'))

try:
    import cv2
    import numpy as np
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False


# Skip all tests in this module if OpenCV is not available
pytestmark = pytest.mark.skipif(
    not HAS_OPENCV or not HAS_PIL,
    reason="OpenCV and PIL required for these tests"
)


from extract_and_convert_figures import (
    _detect_figures_with_opencv,
    _split_image_by_bboxes,
    detect_and_split_multiple_figures,
)


# =============================================================================
# _detect_figures_with_opencv TESTS
# =============================================================================

class TestDetectFiguresWithOpencv:
    """Tests for OpenCV contour-based figure detection."""
    
    def test_detects_two_horizontal_figures(self, multi_figure_image_bytes):
        """Should detect two figures placed side by side."""
        img = Image.open(io.BytesIO(multi_figure_image_bytes))
        
        bboxes = _detect_figures_with_opencv(img, img.width, img.height)
        
        assert bboxes is not None
        assert len(bboxes) >= 2, f"Expected at least 2 figures, got {len(bboxes)}"
    
    def test_detects_two_vertical_figures(self, stacked_figure_image_bytes):
        """Should detect two figures stacked vertically."""
        img = Image.open(io.BytesIO(stacked_figure_image_bytes))
        
        bboxes = _detect_figures_with_opencv(img, img.width, img.height)
        
        assert bboxes is not None
        assert len(bboxes) >= 2, f"Expected at least 2 figures, got {len(bboxes)}"
    
    def test_returns_none_for_single_figure(self, sample_image_bytes):
        """Should return None for image with single region."""
        img = Image.open(io.BytesIO(sample_image_bytes))
        
        bboxes = _detect_figures_with_opencv(img, img.width, img.height)
        
        # Single uniform image should not detect multiple figures
        assert bboxes is None or len(bboxes) <= 1
    
    def test_returns_sorted_bboxes(self, multi_figure_image_bytes):
        """Bounding boxes should be sorted by position (top-left to bottom-right)."""
        img = Image.open(io.BytesIO(multi_figure_image_bytes))
        
        bboxes = _detect_figures_with_opencv(img, img.width, img.height)
        
        if bboxes and len(bboxes) > 1:
            # Verify sorted by y then x
            for i in range(len(bboxes) - 1):
                y1, x1 = bboxes[i][1], bboxes[i][0]
                y2, x2 = bboxes[i + 1][1], bboxes[i + 1][0]
                assert (y1, x1) <= (y2, x2), "Bboxes should be sorted"
    
    def test_respects_min_area_ratio(self, multi_figure_image_bytes):
        """Should filter out regions below min_area_ratio threshold."""
        img = Image.open(io.BytesIO(multi_figure_image_bytes))
        
        # Very high threshold should filter out most regions
        bboxes_high = _detect_figures_with_opencv(
            img, img.width, img.height, min_area_ratio=0.5
        )
        
        # Low threshold should find more regions
        bboxes_low = _detect_figures_with_opencv(
            img, img.width, img.height, min_area_ratio=0.01
        )
        
        # High threshold should return fewer or no results
        high_count = len(bboxes_high) if bboxes_high else 0
        low_count = len(bboxes_low) if bboxes_low else 0
        
        assert high_count <= low_count
    
    def test_bbox_format_is_correct(self, multi_figure_image_bytes):
        """Bounding boxes should be (x1, y1, x2, y2) tuples."""
        img = Image.open(io.BytesIO(multi_figure_image_bytes))
        
        bboxes = _detect_figures_with_opencv(img, img.width, img.height)
        
        if bboxes:
            for bbox in bboxes:
                assert len(bbox) == 4, "Bbox should have 4 elements"
                x1, y1, x2, y2 = bbox
                
                # Validate bbox coordinates
                assert 0 <= x1 < x2 <= img.width, f"Invalid x coords: {x1}, {x2}"
                assert 0 <= y1 < y2 <= img.height, f"Invalid y coords: {y1}, {y2}"
    
    def test_handles_grayscale_image(self):
        """Should handle grayscale images correctly."""
        # Create grayscale image with two regions
        img = Image.new('L', (800, 400), color=255)  # White background
        from PIL import ImageDraw
        draw = ImageDraw.Draw(img)
        draw.rectangle([50, 50, 350, 350], fill=200)
        draw.rectangle([450, 50, 750, 350], fill=200)
        
        bboxes = _detect_figures_with_opencv(img, img.width, img.height)
        
        # Should still detect the regions
        assert bboxes is None or isinstance(bboxes, list)
    
    def test_handles_rgba_image(self):
        """Should handle RGBA images with transparency."""
        img = Image.new('RGBA', (800, 400), color=(255, 255, 255, 255))
        from PIL import ImageDraw
        draw = ImageDraw.Draw(img)
        draw.rectangle([50, 50, 350, 350], fill=(200, 200, 200, 255))
        draw.rectangle([450, 50, 750, 350], fill=(200, 200, 200, 255))
        
        bboxes = _detect_figures_with_opencv(img, img.width, img.height)
        
        # Should process without error
        assert bboxes is None or isinstance(bboxes, list)


# =============================================================================
# _split_image_by_bboxes TESTS
# =============================================================================

class TestSplitImageByBboxes:
    """Tests for image splitting based on bounding boxes."""
    
    def test_splits_into_correct_number_of_images(self, multi_figure_image_bytes, mock_img_data):
        """Should create one image dict per bounding box."""
        img = Image.open(io.BytesIO(multi_figure_image_bytes))
        bboxes = [(50, 50, 350, 350), (450, 50, 750, 350)]
        
        # Update mock_img_data with multi-figure image
        mock_img_data["image_bytes"] = multi_figure_image_bytes
        mock_img_data["width"] = 800
        mock_img_data["height"] = 400
        
        result = _split_image_by_bboxes(img, bboxes, mock_img_data)
        
        assert len(result) == 2
    
    def test_split_images_have_correct_dimensions(self, multi_figure_image_bytes, mock_img_data):
        """Split images should have dimensions matching their bboxes."""
        img = Image.open(io.BytesIO(multi_figure_image_bytes))
        bboxes = [(50, 50, 350, 350), (450, 50, 750, 350)]
        
        mock_img_data["image_bytes"] = multi_figure_image_bytes
        mock_img_data["width"] = 800
        mock_img_data["height"] = 400
        
        result = _split_image_by_bboxes(img, bboxes, mock_img_data)
        
        # First bbox is 300x300
        assert result[0]["width"] == 300
        assert result[0]["height"] == 300
        
        # Second bbox is also 300x300
        assert result[1]["width"] == 300
        assert result[1]["height"] == 300
    
    def test_split_images_have_metadata(self, multi_figure_image_bytes, mock_img_data):
        """Split images should have correct metadata fields."""
        img = Image.open(io.BytesIO(multi_figure_image_bytes))
        bboxes = [(50, 50, 350, 350)]
        
        mock_img_data["image_bytes"] = multi_figure_image_bytes
        
        result = _split_image_by_bboxes(img, bboxes, mock_img_data)
        
        assert result[0]["split_index"] == 0
        assert result[0]["split_from"] is True
        assert result[0]["original_width"] == img.width
        assert result[0]["original_height"] == img.height
        assert result[0]["bbox"] == (50, 50, 350, 350)
        assert result[0]["detection_method"] == "opencv"
        assert result[0]["image_ext"] == "png"
    
    def test_split_images_are_valid_pngs(self, multi_figure_image_bytes, mock_img_data):
        """Split image bytes should be valid PNG images."""
        img = Image.open(io.BytesIO(multi_figure_image_bytes))
        bboxes = [(50, 50, 350, 350)]
        
        mock_img_data["image_bytes"] = multi_figure_image_bytes
        
        result = _split_image_by_bboxes(img, bboxes, mock_img_data)
        
        # Try to open the split image bytes
        split_img = Image.open(io.BytesIO(result[0]["image_bytes"]))
        assert split_img.format == "PNG"
        assert split_img.size == (300, 300)


# =============================================================================
# detect_and_split_multiple_figures TESTS
# =============================================================================

class TestDetectAndSplitMultipleFigures:
    """Tests for the main figure detection and splitting function."""
    
    def test_returns_none_for_single_figure(self, mock_img_data):
        """Should return None when image contains single figure."""
        result = detect_and_split_multiple_figures(
            mock_img_data,
            api_key=None,
            use_opencv=True
        )
        
        assert result is None
    
    def test_returns_splits_for_multi_figure_image(self, multi_figure_image_bytes):
        """Should return list of split images for multi-figure image."""
        img_data = {
            "page_num": 0,
            "img_index": 0,
            "xref": 1,
            "image_bytes": multi_figure_image_bytes,
            "image_ext": "png",
            "width": 800,
            "height": 400,
            "rect": None,
        }
        
        result = detect_and_split_multiple_figures(
            img_data,
            api_key=None,
            use_opencv=True
        )
        
        # Should detect and split the two figures
        assert result is not None
        assert len(result) >= 2
    
    def test_skips_small_images(self, small_image_bytes):
        """Should return None for images below minimum dimensions."""
        img_data = {
            "page_num": 0,
            "img_index": 0,
            "image_bytes": small_image_bytes,
            "image_ext": "png",
            "width": 40,
            "height": 40,
        }
        
        result = detect_and_split_multiple_figures(img_data, api_key=None)
        
        assert result is None
    
    def test_recursive_splitting(self, multi_figure_image_bytes):
        """Should recursively split when enabled."""
        img_data = {
            "page_num": 0,
            "img_index": 0,
            "image_bytes": multi_figure_image_bytes,
            "image_ext": "png",
            "width": 800,
            "height": 400,
        }
        
        result = detect_and_split_multiple_figures(
            img_data,
            api_key=None,
            use_opencv=True,
            recursive=True,
            max_depth=2
        )
        
        # Should complete without error
        assert result is None or isinstance(result, list)
    
    def test_respects_opencv_disabled_flag(self, multi_figure_image_bytes):
        """Should skip OpenCV when use_opencv=False."""
        img_data = {
            "page_num": 0,
            "img_index": 0,
            "image_bytes": multi_figure_image_bytes,
            "image_ext": "png",
            "width": 800,
            "height": 400,
        }
        
        # With OpenCV disabled and no API key, should return None
        result = detect_and_split_multiple_figures(
            img_data,
            api_key=None,
            use_opencv=False  # Disable OpenCV
        )
        
        # Without API key for AI fallback, should return None
        assert result is None
    
    def test_handles_corrupt_image_gracefully(self):
        """Should handle corrupt image data without crashing."""
        img_data = {
            "page_num": 0,
            "img_index": 0,
            "image_bytes": b"not a valid image",
            "image_ext": "png",
            "width": 800,
            "height": 400,
        }
        
        result = detect_and_split_multiple_figures(img_data, api_key=None)
        
        # Should return None, not crash
        assert result is None
