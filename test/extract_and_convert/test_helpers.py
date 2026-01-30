"""
Tests for pure helper functions in extract_and_convert_figures.py

These tests cover functions that have minimal dependencies and can be tested
in isolation without mocking PyMuPDF or making API calls.
"""
import pytest
import os
import sys
from unittest.mock import patch, Mock

# Add tools/figure-extraction to path for imports
# Test file is at: test/extract_and_convert/test_helpers.py
# Need to get to: tools/figure-extraction/
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(project_root, 'tools', 'figure-extraction'))

from extract_and_convert_figures import (
    _is_valid_image_size,
    _build_image_data,
    find_figure_context,
    is_logo_or_banner,
    is_labeled_figure_or_table,
)


# =============================================================================
# _is_valid_image_size TESTS
# =============================================================================

class TestIsValidImageSize:
    """Tests for _is_valid_image_size helper function."""
    
    def test_valid_size_both_dimensions_above_min(self):
        """Image with both dimensions >= min_size should be valid."""
        base_image = {"width": 100, "height": 100}
        assert _is_valid_image_size(base_image, min_size=50) is True
    
    def test_valid_size_exactly_at_min(self):
        """Image with dimensions exactly at min_size should be valid."""
        base_image = {"width": 50, "height": 50}
        assert _is_valid_image_size(base_image, min_size=50) is True
    
    def test_invalid_width_below_min(self):
        """Image with width below min_size should be invalid."""
        base_image = {"width": 40, "height": 100}
        assert _is_valid_image_size(base_image, min_size=50) is False
    
    def test_invalid_height_below_min(self):
        """Image with height below min_size should be invalid."""
        base_image = {"width": 100, "height": 40}
        assert _is_valid_image_size(base_image, min_size=50) is False
    
    def test_invalid_both_below_min(self):
        """Image with both dimensions below min_size should be invalid."""
        base_image = {"width": 30, "height": 30}
        assert _is_valid_image_size(base_image, min_size=50) is False
    
    def test_missing_width_returns_false(self):
        """Missing width key should return False."""
        base_image = {"height": 100}
        assert _is_valid_image_size(base_image, min_size=50) is False
    
    def test_missing_height_returns_false(self):
        """Missing height key should return False."""
        base_image = {"width": 100}
        assert _is_valid_image_size(base_image, min_size=50) is False
    
    def test_zero_dimensions(self):
        """Zero dimensions should be invalid."""
        base_image = {"width": 0, "height": 0}
        assert _is_valid_image_size(base_image, min_size=50) is False


# =============================================================================
# _build_image_data TESTS
# =============================================================================

class TestBuildImageData:
    """Tests for _build_image_data helper function."""
    
    def test_builds_complete_dict(self):
        """Should build a complete image data dictionary."""
        base_image = {
            "image": b"fake_bytes",
            "ext": "png",
            "width": 400,
            "height": 300,
        }
        mock_rect = Mock()
        image_rects = [mock_rect]
        
        result = _build_image_data(
            page_num=2,
            img_index=5,
            xref=42,
            base_image=base_image,
            image_rects=image_rects
        )
        
        assert result["page_num"] == 2
        assert result["img_index"] == 5
        assert result["xref"] == 42
        assert result["image_bytes"] == b"fake_bytes"
        assert result["image_ext"] == "png"
        assert result["width"] == 400
        assert result["height"] == 300
        assert result["rect"] == mock_rect
        assert result["all_rects"] == image_rects
    
    def test_handles_empty_rects_list(self):
        """Should handle empty image_rects list."""
        base_image = {
            "image": b"data",
            "ext": "jpeg",
            "width": 200,
            "height": 150,
        }
        
        result = _build_image_data(
            page_num=0,
            img_index=0,
            xref=1,
            base_image=base_image,
            image_rects=[]
        )
        
        assert result["rect"] is None
        assert result["all_rects"] == []
    
    def test_defaults_for_missing_keys(self):
        """Should use defaults for missing base_image keys."""
        base_image = {"image": b"data"}  # Missing ext, width, height
        
        result = _build_image_data(
            page_num=0,
            img_index=0,
            xref=1,
            base_image=base_image,
            image_rects=[]
        )
        
        assert result["image_ext"] == "png"  # Default
        assert result["width"] == 0  # Default
        assert result["height"] == 0  # Default


# =============================================================================
# is_logo_or_banner TESTS
# =============================================================================

class TestIsLogoOrBanner:
    """Tests for logo/banner detection function."""
    
    @pytest.fixture
    def mock_page(self):
        """Create a mock page with standard dimensions."""
        page = Mock()
        page.rect = Mock()
        page.rect.height = 800
        page.rect.width = 600
        return page
    
    @pytest.mark.parametrize("width,height,expected", [
        # Typical logo dimensions (wide and short)
        (500, 175, True),   # Classic logo shape
        (400, 100, True),   # Wide banner
        (550, 170, True),   # Near threshold
        
        # Too big to be a logo
        (600, 200, False),  # Width at threshold
        (700, 300, False),  # Clearly a figure
        
        # Square or tall shapes (not logos)
        (200, 200, False),  # Square
        (150, 300, False),  # Tall
        (100, 100, False),  # Small square
    ])
    def test_logo_detection_by_dimensions(self, width, height, expected, mock_page):
        """Test logo detection based on various dimension combinations."""
        img_data = {
            "width": width,
            "height": height,
            "rect": None,
        }
        
        result = is_logo_or_banner(img_data, 0, mock_page, "")
        assert result == expected, f"Expected {expected} for {width}x{height}"
    
    def test_logo_at_bottom_of_page(self, mock_page):
        """Small wide image at bottom of page should be detected as logo."""
        mock_rect = Mock()
        mock_rect.y0 = 700  # Near bottom of 800px page
        
        img_data = {
            "width": 500,
            "height": 150,
            "rect": mock_rect,
        }
        
        result = is_logo_or_banner(img_data, 0, mock_page, "")
        assert result is True
    
    def test_logo_with_publisher_text(self, mock_page):
        """Small wide image with publisher-related text nearby should be logo."""
        img_data = {
            "width": 450,
            "height": 150,
            "rect": None,
        }
        
        page_text = "Published by MDPI, Basel, Switzerland. Copyright 2024."
        result = is_logo_or_banner(img_data, 0, mock_page, page_text)
        assert result is True
    
    def test_zero_dimensions_not_logo(self, mock_page):
        """Zero dimensions should not crash and return False."""
        img_data = {
            "width": 0,
            "height": 0,
            "rect": None,
        }
        
        result = is_logo_or_banner(img_data, 0, mock_page, "")
        assert result is False


# =============================================================================
# is_labeled_figure_or_table TESTS
# =============================================================================

class TestIsLabeledFigureOrTable:
    """Tests for figure/table label detection."""
    
    def test_detects_figure_label(self):
        """Should detect 'Figure X' pattern."""
        page_texts = [
            "Some text. Figure 1: Description of results. More text."
        ]
        
        result = is_labeled_figure_or_table(0, page_texts, 0)
        assert result is True
    
    def test_detects_fig_abbreviation(self):
        """Should detect 'Fig. X' pattern."""
        page_texts = [
            "As shown in Fig. 2, the data indicates..."
        ]
        
        result = is_labeled_figure_or_table(0, page_texts, 0)
        assert result is True
    
    def test_detects_table_label(self):
        """Should detect 'Table X' pattern."""
        page_texts = [
            "Table 3 summarizes the experimental parameters."
        ]
        
        result = is_labeled_figure_or_table(0, page_texts, 0)
        assert result is True
    
    def test_detects_label_with_letter_suffix(self):
        """Should detect labels like 'Figure 2A'."""
        page_texts = [
            "Figure 2A shows the control group."
        ]
        
        result = is_labeled_figure_or_table(0, page_texts, 0)
        assert result is True
    
    def test_checks_adjacent_pages(self):
        """Should check adjacent pages for labels."""
        page_texts = [
            "Page without labels.",
            "Figure 1 is on this page.",
            "Another page.",
        ]
        
        # Check page 0 - should find label on adjacent page 1
        result = is_labeled_figure_or_table(0, page_texts, 0)
        assert result is True
    
    def test_no_labels_returns_false(self):
        """Should return False when no labels found."""
        page_texts = [
            "This page has only plain text content.",
            "Neither does this one contain any special labels.",
        ]
        
        result = is_labeled_figure_or_table(0, page_texts, 0)
        assert result is False
    
    def test_handles_empty_page_texts(self):
        """Should handle empty page texts list."""
        result = is_labeled_figure_or_table(0, [], 0)
        assert result is False
    
    def test_logo_detection_integration(self, mock_page, logo_img_data):
        """Logo-shaped images should return False even if labels exist."""
        page_texts = ["Figure 1: Some description"]
        
        # Logo-shaped image should be rejected
        result = is_labeled_figure_or_table(
            0, page_texts, 0, 
            img_data=logo_img_data, 
            page=mock_page
        )
        assert result is False


# =============================================================================
# find_figure_context TESTS
# =============================================================================

class TestFindFigureContext:
    """Tests for figure context extraction."""
    
    def test_finds_specific_figure_reference(self, sample_page_texts, sample_full_text):
        """Should find text referencing specific figure number."""
        context = find_figure_context(0, sample_page_texts, sample_full_text, 1)
        
        assert "Figure 1" in context or "figure" in context.lower()
    
    def test_includes_page_text_excerpt_when_no_match(self):
        """Should include page excerpt when no specific reference found."""
        page_texts = ["Generic text without specific figure references."]
        full_text = page_texts[0]
        
        context = find_figure_context(0, page_texts, full_text, 99)
        
        # Should include some content from the page
        assert len(context) > 0
    
    def test_handles_out_of_range_page(self, sample_page_texts, sample_full_text):
        """Should handle page number out of range."""
        context = find_figure_context(99, sample_page_texts, sample_full_text, 1)
        
        # Should not crash, may return empty or minimal context
        assert isinstance(context, str)


# =============================================================================
# get_openrouter_api_key TESTS
# =============================================================================

class TestGetOpenrouterApiKey:
    """Tests for API key retrieval."""
    
    def test_reads_from_environment(self):
        """Should read API key from environment variable."""
        from extract_and_convert_figures import get_openrouter_api_key
        
        with patch.dict(os.environ, {'OPENROUTER_API_KEY': 'test-api-key-123'}):
            result = get_openrouter_api_key()
            assert result == 'test-api-key-123'
    
    def test_returns_empty_when_not_set(self):
        """Should return empty string when key not found."""
        from extract_and_convert_figures import get_openrouter_api_key
        
        with patch.dict(os.environ, {}, clear=True):
            # Also need to prevent it from reading .env files
            with patch('os.path.exists', return_value=False):
                result = get_openrouter_api_key()
                assert result == ''
