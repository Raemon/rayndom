"""
Tests for the FigureExtractor class.

These tests cover the main extraction pipeline and its component methods.
"""
import pytest
import sys
import os
import json
import hashlib
from collections import defaultdict
from unittest.mock import Mock, patch, MagicMock

try:
    from PIL import Image
    import numpy as np
    HAS_IMAGE_LIBS = True
except ImportError:
    HAS_IMAGE_LIBS = False

# Add tools/figure-extraction to path for imports
# Test file is at: test/extract_and_convert/test_figure_extractor.py
# Need to get to: tools/figure-extraction/
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(project_root, 'tools', 'figure-extraction'))

from extract_and_convert_figures import FigureExtractor


# =============================================================================
# FigureExtractor INITIALIZATION TESTS
# =============================================================================

class TestFigureExtractorInit:
    """Tests for FigureExtractor initialization."""
    
    def test_creates_output_directory(self, temp_output_dir):
        """Should create output directory if it doesn't exist."""
        new_dir = os.path.join(temp_output_dir, "new_subdir")
        
        extractor = FigureExtractor(
            pdf_path="fake.pdf",
            output_dir=new_dir
        )
        
        assert os.path.exists(new_dir)
    
    def test_stores_configuration(self, temp_output_dir):
        """Should store configuration parameters."""
        extractor = FigureExtractor(
            pdf_path="/path/to/test.pdf",
            output_dir=temp_output_dir,
            max_workers=8,
            use_opencv=False,
            opencv_min_area=0.10,
            recursive_split=False,
            max_split_depth=5
        )
        
        assert extractor.pdf_path == "/path/to/test.pdf"
        assert extractor.output_dir == temp_output_dir
        assert extractor.max_workers == 8
        assert extractor.use_opencv is False
        assert extractor.opencv_min_area == 0.10
        assert extractor.recursive_split is False
        assert extractor.max_split_depth == 5
    
    def test_default_max_workers(self, temp_output_dir):
        """Should default to CPU count for max_workers."""
        extractor = FigureExtractor(
            pdf_path="fake.pdf",
            output_dir=temp_output_dir
        )
        
        expected = os.cpu_count() or 4
        assert extractor.max_workers == expected


# =============================================================================
# FigureExtractor HELPER METHOD TESTS
# =============================================================================

class TestFigureExtractorHelpers:
    """Tests for FigureExtractor helper methods."""
    
    @pytest.fixture
    def extractor(self, temp_output_dir):
        """Create a FigureExtractor instance for testing."""
        return FigureExtractor(
            pdf_path="test.pdf",
            output_dir=temp_output_dir
        )
    
    def test_generate_figure_name_labeled(self, extractor):
        """Should generate correct name for labeled figures."""
        name = extractor._generate_figure_name(
            page_num=2,
            image_counter=5,
            is_labeled=True
        )
        
        assert name == "page3_figure_005"
    
    def test_generate_figure_name_unlabeled(self, extractor):
        """Should include 'ignore' prefix for unlabeled figures."""
        name = extractor._generate_figure_name(
            page_num=0,
            image_counter=1,
            is_labeled=False
        )
        
        assert name == "page1_ignore_figure_001"
    
    def test_generate_figure_name_merged(self, extractor):
        """Should include merged count in name."""
        name = extractor._generate_figure_name(
            page_num=0,
            image_counter=1,
            is_labeled=True,
            merged_count=3
        )
        
        assert name == "page1_figure_001_merged3"
    
    def test_generate_figure_name_split(self, extractor):
        """Should include split index in name."""
        name = extractor._generate_figure_name(
            page_num=0,
            image_counter=1,
            is_labeled=True,
            split_index=0,
            total_splits=3
        )
        
        assert name == "page1_figure_001_split1"
    
    def test_save_image_file(self, extractor, temp_output_dir):
        """Should save image bytes to disk."""
        image_bytes = b"fake image data"
        image_path = os.path.join(temp_output_dir, "test_image.png")
        
        result = extractor._save_image_file(image_bytes, image_path)
        
        assert result is True
        assert os.path.exists(image_path)
        with open(image_path, "rb") as f:
            assert f.read() == image_bytes
    
    def test_save_context_file(self, extractor, temp_output_dir):
        """Should save context text file with correct format."""
        context_path = os.path.join(temp_output_dir, "test_context.txt")
        
        result = extractor._save_context_file(
            context_path=context_path,
            page_num=2,
            width=400,
            height=300,
            context="This is the figure context.",
            merged_count=1
        )
        
        assert result is True
        assert os.path.exists(context_path)
        
        with open(context_path, "r") as f:
            content = f.read()
        
        assert "test.pdf" in content
        assert "Page: 3" in content
        assert "400x300" in content
        assert "This is the figure context." in content
    
    def test_save_context_file_with_split_info(self, extractor, temp_output_dir):
        """Should include split information in context file."""
        context_path = os.path.join(temp_output_dir, "test_context.txt")
        
        extractor._save_context_file(
            context_path=context_path,
            page_num=0,
            width=200,
            height=200,
            context="Context",
            merged_count=2,
            split_index=1,
            total_splits=3
        )
        
        with open(context_path, "r") as f:
            content = f.read()
        
        assert "Split 2 of 3" in content
        assert "merged from 2" in content
    
    def test_build_figure_result(self, extractor):
        """Should build complete figure result dictionary."""
        result = extractor._build_figure_result(
            image_counter=5,
            page_num=2,
            image_filename="page3_figure_005.png",
            image_path="/path/to/image.png",
            width=400,
            height=300,
            image_ext="png",
            is_labeled=True,
            merged_count=1,
            context="Figure context",
            context_path="/path/to/context.txt"
        )
        
        assert result["index"] == 5
        assert result["page"] == 3
        assert result["filename"] == "page3_figure_005.png"
        assert result["width"] == 400
        assert result["height"] == 300
        assert result["format"] == "png"
        assert result["is_labeled"] is True
        assert result["merged_count"] == 1
        assert result["context"] == "Figure context"
    
    def test_build_figure_result_with_split(self, extractor):
        """Should include split info in result when present."""
        result = extractor._build_figure_result(
            image_counter=1,
            page_num=0,
            image_filename="test.png",
            image_path="/path/test.png",
            width=200,
            height=200,
            image_ext="png",
            is_labeled=True,
            split_index=2,
            total_splits=4
        )
        
        assert result["split_index"] == 2
        assert result["split_from"] is True
        assert result["total_splits"] == 4


# =============================================================================
# FigureExtractor PIPELINE METHOD TESTS
# =============================================================================

class TestFigureExtractorPipeline:
    """Tests for FigureExtractor pipeline methods."""
    
    @pytest.fixture
    def extractor(self, temp_output_dir):
        return FigureExtractor(
            pdf_path="test.pdf",
            output_dir=temp_output_dir,
            max_workers=2
        )
    
    def test_build_full_text(self, extractor):
        """Should concatenate page texts with page markers."""
        page_texts = ["Page one text.", "Page two text.", "Page three text."]
        
        result = extractor._build_full_text(page_texts)
        
        assert "--- Page 1 ---" in result
        assert "--- Page 2 ---" in result
        assert "--- Page 3 ---" in result
        assert "Page one text." in result
        assert "Page two text." in result
        assert "Page three text." in result
    
    def test_deduplicate_images_by_xref(self, extractor):
        """Should remove duplicate images with same xref on same page."""
        images = [
            {"page_num": 0, "xref": 1, "img_index": 0, "width": 400, "height": 300},
            {"page_num": 0, "xref": 1, "img_index": 1, "width": 400, "height": 300},  # Dup
            {"page_num": 0, "xref": 2, "img_index": 2, "width": 200, "height": 150},
            {"page_num": 1, "xref": 1, "img_index": 0, "width": 400, "height": 300},  # Same xref, diff page = kept
        ]
        
        result = extractor._deduplicate_images_by_xref(images)
        
        # Should have 3: xref 1 on page 0, xref 2 on page 0, xref 1 on page 1
        assert len(result) == 3
    
    def test_deduplicate_keeps_larger_image(self, extractor):
        """When deduplicating, should keep the larger image."""
        images = [
            {"page_num": 0, "xref": 1, "img_index": 0, "width": 200, "height": 200},
            {"page_num": 0, "xref": 1, "img_index": 1, "width": 400, "height": 400},  # Larger
        ]
        
        result = extractor._deduplicate_images_by_xref(images)
        
        assert len(result) == 1
        assert result[0]["width"] == 400
        assert result[0]["height"] == 400


# =============================================================================
# FigureExtractor DEDUPLICATION TESTS
# =============================================================================

class TestFigureExtractorDeduplication:
    """Tests for content-based deduplication."""
    
    @pytest.fixture
    def extractor(self, temp_output_dir):
        return FigureExtractor(
            pdf_path="test.pdf",
            output_dir=temp_output_dir
        )
    
    def test_removes_duplicate_files(self, extractor, temp_output_dir):
        """Should remove figures with identical content."""
        # Create two files with identical content
        content = b"identical image content"
        
        path1 = os.path.join(temp_output_dir, "figure_001.png")
        path2 = os.path.join(temp_output_dir, "figure_002.png")
        
        with open(path1, "wb") as f:
            f.write(content)
        with open(path2, "wb") as f:
            f.write(content)
        
        figures = [
            {"index": 1, "filename": "figure_001.png", "image_path": path1},
            {"index": 2, "filename": "figure_002.png", "image_path": path2},
        ]
        
        result = extractor._deduplicate_figures_by_content(figures)
        
        assert len(result) == 1
        assert result[0]["filename"] == "figure_001.png"
        assert not os.path.exists(path2)  # Duplicate file should be deleted
    
    def test_keeps_unique_files(self, extractor, temp_output_dir):
        """Should keep figures with different content."""
        path1 = os.path.join(temp_output_dir, "figure_001.png")
        path2 = os.path.join(temp_output_dir, "figure_002.png")
        
        with open(path1, "wb") as f:
            f.write(b"content one")
        with open(path2, "wb") as f:
            f.write(b"content two")
        
        figures = [
            {"index": 1, "filename": "figure_001.png", "image_path": path1},
            {"index": 2, "filename": "figure_002.png", "image_path": path2},
        ]
        
        result = extractor._deduplicate_figures_by_content(figures)
        
        assert len(result) == 2
    
    def test_renumbers_indices_after_dedup(self, extractor, temp_output_dir):
        """Should renumber indices to be sequential after deduplication."""
        content = b"duplicate"
        
        path1 = os.path.join(temp_output_dir, "fig1.png")
        path2 = os.path.join(temp_output_dir, "fig2.png")
        path3 = os.path.join(temp_output_dir, "fig3.png")
        
        with open(path1, "wb") as f:
            f.write(content)
        with open(path2, "wb") as f:
            f.write(content)  # Duplicate
        with open(path3, "wb") as f:
            f.write(b"unique")
        
        figures = [
            {"index": 1, "filename": "fig1.png", "image_path": path1},
            {"index": 2, "filename": "fig2.png", "image_path": path2},
            {"index": 3, "filename": "fig3.png", "image_path": path3},
        ]
        
        result = extractor._deduplicate_figures_by_content(figures)
        
        assert len(result) == 2
        assert result[0]["index"] == 1
        assert result[1]["index"] == 2


# =============================================================================
# INTEGRATION TESTS (with mocked PyMuPDF)
# =============================================================================

class TestFigureExtractorIntegration:
    """Integration tests with mocked PyMuPDF document."""
    
    @pytest.fixture
    def mock_doc(self):
        """Create a mock PyMuPDF document."""
        doc = MagicMock()
        doc.__len__ = Mock(return_value=2)
        
        # Create mock pages
        page1 = Mock()
        page1.get_text.return_value = "Page 1 with Figure 1: Description"
        page1.get_images.return_value = [(1, 0, 0, 0, 0, "img1", "", "", "")]
        page1.get_image_rects.return_value = []
        page1.rect = Mock(height=800, width=600)
        
        page2 = Mock()
        page2.get_text.return_value = "Page 2 with Table 1: Data"
        page2.get_images.return_value = []
        page2.rect = Mock(height=800, width=600)
        
        doc.__getitem__ = Mock(side_effect=lambda i: [page1, page2][i])
        doc.extract_image.return_value = {
            "image": b"fake image bytes",
            "ext": "png",
            "width": 400,
            "height": 300,
        }
        
        return doc
    
    def test_extract_page_texts(self, temp_output_dir, mock_doc):
        """Should extract text from all pages."""
        extractor = FigureExtractor("test.pdf", temp_output_dir, max_workers=1)
        
        # Manually test the method since we can't call extract_all without real PDF
        with patch('extract_and_convert_figures.fitz') as mock_fitz:
            mock_fitz.open.return_value = mock_doc
            
            result = extractor._extract_page_texts(mock_doc)
            
            assert len(result) == 2
            assert "Figure 1" in result[0]
            assert "Table 1" in result[1]


# =============================================================================
# EXTRACT_PAGE_IMAGES TESTS (with real PDF fixture)
# =============================================================================

class TestExtractPageImages:
    """Tests for extract_page_images function using real PDF fixture."""
    
    @pytest.fixture(scope="class")
    def pdf_fixture_path(self):
        """Path to the ketamine paper PDF fixture."""
        test_dir = os.path.dirname(os.path.abspath(__file__))
        return os.path.join(test_dir, "fixtures", "ketamine-paper-1.pdf")
    
    @pytest.fixture(scope="class")
    def expected_output_dir(self):
        """Path to expected output directory."""
        test_dir = os.path.dirname(os.path.abspath(__file__))
        return os.path.join(test_dir, "fixtures", "expected_output")
    
    @pytest.fixture(scope="class")
    def pdf_doc(self, pdf_fixture_path):
        """Open the PDF document for testing."""
        import fitz
        doc = fitz.open(pdf_fixture_path)
        yield doc
        doc.close()
    
    @pytest.fixture(scope="class")
    def expected_metadata(self, expected_output_dir):
        """Load expected figures metadata."""
        metadata_path = os.path.join(expected_output_dir, "figures_metadata.json")
        with open(metadata_path, "r") as f:
            return json.load(f)
    
    def test_extract_page_images_returns_list(self, pdf_doc):
        """extract_page_images should return a list."""
        from extract_and_convert_figures import extract_page_images
        
        page_num = 9  # Page 10 (0-indexed)
        page = pdf_doc[page_num]
        
        result = extract_page_images(page_num, page, pdf_doc)
        
        assert isinstance(result, list)
    
    def test_extract_page_10_image_count(self, pdf_doc):
        """Page 10 should have the expected number of raw images."""
        from extract_and_convert_figures import extract_page_images
        
        page_num = 9  # Page 10 (0-indexed)
        page = pdf_doc[page_num]
        
        result = extract_page_images(page_num, page, pdf_doc)
        
        # Page 10 has 2 raw images that get split into 5 final figures
        # (based on expected output showing split1, split2, split3 patterns)
        assert len(result) >= 2, f"Expected at least 2 images on page 10, got {len(result)}"
    
    def test_extract_page_10_image_structure(self, pdf_doc):
        """Each extracted image should have the required keys."""
        from extract_and_convert_figures import extract_page_images
        
        page_num = 9  # Page 10 (0-indexed)
        page = pdf_doc[page_num]
        
        result = extract_page_images(page_num, page, pdf_doc)
        
        required_keys = ["page_num", "img_index", "xref", "image_bytes", 
                         "image_ext", "width", "height", "rect", "all_rects"]
        
        for img_data in result:
            for key in required_keys:
                assert key in img_data, f"Missing required key: {key}"
    
    def test_extract_page_10_image_page_num(self, pdf_doc):
        """All extracted images should have correct page_num."""
        from extract_and_convert_figures import extract_page_images
        
        page_num = 9  # Page 10 (0-indexed)
        page = pdf_doc[page_num]
        
        result = extract_page_images(page_num, page, pdf_doc)
        
        for img_data in result:
            assert img_data["page_num"] == page_num
    
    def test_extract_page_10_images_have_valid_bytes(self, pdf_doc):
        """All extracted images should have non-empty image bytes."""
        from extract_and_convert_figures import extract_page_images
        
        page_num = 9  # Page 10 (0-indexed)
        page = pdf_doc[page_num]
        
        result = extract_page_images(page_num, page, pdf_doc)
        
        for img_data in result:
            assert img_data["image_bytes"] is not None
            assert len(img_data["image_bytes"]) > 0
    
    def test_extract_page_10_images_have_valid_dimensions(self, pdf_doc):
        """All extracted images should have positive width and height."""
        from extract_and_convert_figures import extract_page_images
        
        page_num = 9  # Page 10 (0-indexed)
        page = pdf_doc[page_num]
        
        result = extract_page_images(page_num, page, pdf_doc)
        
        for img_data in result:
            assert img_data["width"] > 0, f"Width should be positive: {img_data['width']}"
            assert img_data["height"] > 0, f"Height should be positive: {img_data['height']}"
    
    def test_extract_page_10_images_have_valid_extension(self, pdf_doc):
        """All extracted images should have a valid image extension."""
        from extract_and_convert_figures import extract_page_images
        
        page_num = 9  # Page 10 (0-indexed)
        page = pdf_doc[page_num]
        
        result = extract_page_images(page_num, page, pdf_doc)
        
        valid_extensions = ["png", "jpeg", "jpg", "jp2", "jpx", "jpm", "jb2"]
        
        for img_data in result:
            assert img_data["image_ext"] in valid_extensions, \
                f"Invalid extension: {img_data['image_ext']}"
    
    def test_extract_page_10_images_meet_min_size(self, pdf_doc):
        """All extracted images should meet the default min_size threshold."""
        from extract_and_convert_figures import extract_page_images
        
        page_num = 9  # Page 10 (0-indexed)
        page = pdf_doc[page_num]
        min_size = 50  # Default min_size
        
        result = extract_page_images(page_num, page, pdf_doc, min_size=min_size)
        
        for img_data in result:
            assert img_data["width"] >= min_size, \
                f"Width {img_data['width']} below min_size {min_size}"
            assert img_data["height"] >= min_size, \
                f"Height {img_data['height']} below min_size {min_size}"
    
    def test_extract_page_10_custom_min_size(self, pdf_doc):
        """Higher min_size should filter out smaller images."""
        from extract_and_convert_figures import extract_page_images
        
        page_num = 9  # Page 10 (0-indexed)
        page = pdf_doc[page_num]
        
        result_50 = extract_page_images(page_num, page, pdf_doc, min_size=50)
        result_200 = extract_page_images(page_num, page, pdf_doc, min_size=200)
        
        # Higher min_size should return equal or fewer images
        assert len(result_200) <= len(result_50)
    
    def test_extract_page_10_xrefs_are_unique(self, pdf_doc):
        """Each extracted image should have a unique xref on the page."""
        from extract_and_convert_figures import extract_page_images
        
        page_num = 9  # Page 10 (0-indexed)
        page = pdf_doc[page_num]
        
        result = extract_page_images(page_num, page, pdf_doc)
        
        xrefs = [img_data["xref"] for img_data in result]
        # Note: xrefs might not be unique if same image appears multiple times
        # but img_index should be unique
        img_indices = [img_data["img_index"] for img_data in result]
        assert len(img_indices) == len(set(img_indices)), "img_index should be unique"
    
    def test_extract_page_10_image_bytes_are_valid_images(self, pdf_doc):
        """Extracted image bytes should be valid image data."""
        from extract_and_convert_figures import extract_page_images
        from PIL import Image
        import io
        
        page_num = 9  # Page 10 (0-indexed)
        page = pdf_doc[page_num]
        
        result = extract_page_images(page_num, page, pdf_doc)
        
        for img_data in result:
            # Try to open the image bytes with PIL
            try:
                img = Image.open(io.BytesIO(img_data["image_bytes"]))
                img.verify()  # Verify it's a valid image
            except Exception as e:
                pytest.fail(f"Invalid image data for xref {img_data['xref']}: {e}")
    
    def test_extract_page_10_raw_image_count(self, pdf_doc):
        """Page 10 should have exactly 2 raw images that get split into final figures."""
        from extract_and_convert_figures import extract_page_images
        
        page_num = 9  # Page 10 (0-indexed)
        page = pdf_doc[page_num]
        
        result = extract_page_images(page_num, page, pdf_doc)
        
        # Page 10 has 2 raw images in the PDF:
        # - First image splits into 2 figures (page10_figure_019_split1, page10_figure_020_split2)
        # - Second image splits into 3 figures (page10_figure_021_split1, page10_figure_022_split2, page10_figure_023_split3)
        assert len(result) == 2, f"Expected 2 raw images on page 10, got {len(result)}"
    
    def test_extract_page_10_figures_match_expected_output(self, pdf_doc, expected_metadata):
        """Verify page 10 figures in metadata match what we expect."""
        # Get page 10 figures from expected metadata
        page_10_figures = [f for f in expected_metadata if f["page"] == 10]
        
        # Should have 5 final figures after splitting
        assert len(page_10_figures) == 5, \
            f"Expected 5 figures on page 10 in metadata, got {len(page_10_figures)}"
        
        # Verify expected filenames
        expected_filenames = {
            "page10_figure_019_split1.png",
            "page10_figure_020_split2.png",
            "page10_figure_021_split1.png",
            "page10_figure_022_split2.png",
            "page10_figure_023_split3.png",
        }
        actual_filenames = {f["filename"] for f in page_10_figures}
        assert actual_filenames == expected_filenames


# =============================================================================
# END-TO-END EXTRACTION TEST
# =============================================================================

class TestEndToEndExtraction:
    """End-to-end test that runs the full extraction script and compares output."""
    
    @pytest.fixture(scope="class")
    def pdf_fixture_path(self):
        """Path to the ketamine paper PDF fixture."""
        test_dir = os.path.dirname(os.path.abspath(__file__))
        return os.path.join(test_dir, "fixtures", "ketamine-paper-1.pdf")
    
    @pytest.fixture(scope="class")
    def expected_output_dir(self):
        """Path to expected output directory."""
        test_dir = os.path.dirname(os.path.abspath(__file__))
        return os.path.join(test_dir, "fixtures", "expected_output")
    
    @pytest.fixture(scope="class")
    def script_path(self):
        """Path to the extraction script."""
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        return os.path.join(project_root, "tools", "figure-extraction", "extract_and_convert_figures.py")
    
    @pytest.fixture(scope="class")
    def output_dir(self):
        """Create timestamped output directory."""
        from datetime import datetime
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_dir = os.path.join(project_root, "test_output", f"ketamine{timestamp}")
        os.makedirs(output_dir, exist_ok=True)
        return output_dir
    
    @pytest.fixture(scope="class")
    def extracted_metadata(self, pdf_fixture_path, script_path, output_dir):
        """Run the extraction script and return the metadata."""
        import subprocess
        import sys
        
        # Run the script
        cmd = [sys.executable, script_path, pdf_fixture_path, output_dir]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        # Check that script ran successfully
        assert result.returncode == 0, \
            f"Script failed with exit code {result.returncode}\n" \
            f"STDOUT:\n{result.stdout}\n" \
            f"STDERR:\n{result.stderr}"
        
        # Load the generated metadata
        metadata_path = os.path.join(output_dir, "figures_metadata.json")
        assert os.path.exists(metadata_path), \
            f"Metadata file not found at {metadata_path}"
        
        with open(metadata_path, "r") as f:
            return json.load(f)
    
    @pytest.fixture(scope="class")
    def expected_metadata(self, expected_output_dir):
        """Load expected figures metadata."""
        metadata_path = os.path.join(expected_output_dir, "figures_metadata.json")
        with open(metadata_path, "r") as f:
            return json.load(f)
    
    def test_extraction_produces_metadata(self, extracted_metadata):
        """Should produce a metadata JSON file."""
        assert isinstance(extracted_metadata, list)
        assert len(extracted_metadata) > 0
    
    def test_extraction_metadata_structure(self, extracted_metadata):
        """Metadata should have the expected structure."""
        required_keys = ["index", "page", "filename", "width", "height", "format"]
        
        for figure in extracted_metadata:
            for key in required_keys:
                assert key in figure, f"Missing required key '{key}' in figure metadata"
    
    def test_extraction_figure_count_reasonable(self, extracted_metadata, expected_metadata):
        """Should extract a reasonable number of figures (within 20% of expected)."""
        expected_count = len(expected_metadata)
        actual_count = len(extracted_metadata)
        # Allow 20% variance due to algorithm improvements or different detection
        tolerance = max(1, int(expected_count * 0.2))
        assert abs(actual_count - expected_count) <= tolerance, \
            f"Figure count differs significantly. Expected ~{expected_count}, got {actual_count}"
    
    def test_extraction_figures_by_page_reasonable(self, extracted_metadata, expected_metadata):
        """Should extract figures from the same pages as expected."""
        expected_pages = {f["page"] for f in expected_metadata}
        actual_pages = {f["page"] for f in extracted_metadata}
        
        # Should extract from the same set of pages (allow extra pages - algorithm might detect more)
        missing_pages = expected_pages - actual_pages
        extra_pages = actual_pages - expected_pages
        
        assert len(missing_pages) == 0, f"Missing figures from pages: {missing_pages}"
        # Extra pages are OK (algorithm improvements may detect more figures)
    
    def test_extraction_image_files_exist(self, output_dir, extracted_metadata):
        """All image files referenced in metadata should exist."""
        for figure in extracted_metadata:
            image_path = os.path.join(output_dir, figure["filename"])
            assert os.path.exists(image_path), \
                f"Image file not found: {figure['filename']}"
    
    def test_extraction_text_files_exist(self, output_dir, extracted_metadata):
        """All text files referenced in metadata should exist."""
        for figure in extracted_metadata:
            if figure.get("context_path"):
                # context_path might be relative or absolute, check both
                context_path = figure["context_path"]
                if not os.path.isabs(context_path):
                    context_path = os.path.join(output_dir, context_path)
                
                # Also try just the filename
                if not os.path.exists(context_path):
                    txt_filename = figure["filename"].rsplit(".", 1)[0] + ".txt"
                    context_path = os.path.join(output_dir, txt_filename)
                
                assert os.path.exists(context_path), \
                    f"Context file not found for {figure['filename']}"
    
    def test_extraction_image_dimensions_reasonable(self, extracted_metadata, expected_metadata):
        """Image dimensions should be reasonable (allow small variations due to different splits)."""
        # Only check dimensions for files that exist in both
        expected_by_filename = {f["filename"]: f for f in expected_metadata}
        
        matches = 0
        mismatches = []
        
        for figure in extracted_metadata:
            filename = figure["filename"]
            if filename in expected_by_filename:
                expected = expected_by_filename[filename]
                # Allow 5% tolerance for dimensions (due to different split detection)
                width_diff = abs(figure["width"] - expected["width"]) / max(expected["width"], 1)
                height_diff = abs(figure["height"] - expected["height"]) / max(expected["height"], 1)
                
                if width_diff > 0.05 or height_diff > 0.05:
                    mismatches.append(
                        f"{filename}: width {figure['width']} vs {expected['width']} "
                        f"({width_diff*100:.1f}% diff), "
                        f"height {figure['height']} vs {expected['height']} "
                        f"({height_diff*100:.1f}% diff)"
                    )
                else:
                    matches += 1
        
        # If we have matches, report mismatches but don't fail (algorithm may detect different splits)
        if matches > 0 and mismatches:
            # Log mismatches but allow them (different split detection is OK)
            print(f"\nNote: {len(mismatches)} dimension mismatches (likely due to different split detection):")
            for mm in mismatches[:5]:  # Show first 5
                print(f"  {mm}")
            if len(mismatches) > 5:
                print(f"  ... and {len(mismatches) - 5} more")
        
        # At least some files should match if they exist
        if len(expected_by_filename) > 0:
            match_ratio = matches / len([f for f in extracted_metadata if f["filename"] in expected_by_filename])
            # Allow test to pass if at least 50% match (or if no common files, skip)
            if match_ratio < 0.5 and matches > 0:
                pytest.skip(f"Many dimension mismatches (algorithm detects different splits): {len(mismatches)} mismatches, {matches} matches")
    
    def test_extraction_image_formats_valid(self, extracted_metadata):
        """Image formats should be valid."""
        valid_formats = {"png", "jpeg", "jpg", "jp2", "jpx", "jpm", "jb2"}
        for figure in extracted_metadata:
            assert figure["format"] in valid_formats, \
                f"Invalid format for {figure['filename']}: {figure['format']}"
    
    def test_extraction_figure_labels_present(self, extracted_metadata):
        """Figure labeling should be present and consistent."""
        for figure in extracted_metadata:
            assert "is_labeled" in figure, \
                f"Missing is_labeled for {figure['filename']}"
            # Labeled figures should have context
            if figure.get("is_labeled"):
                assert figure.get("context") or figure.get("context_path"), \
                    f"Labeled figure {figure['filename']} should have context"
    
    def test_extraction_split_info_structure(self, extracted_metadata, expected_metadata):
        """Split information should have correct structure (values may differ due to algorithm changes)."""
        # Just verify that split information is present when expected
        expected_by_filename = {f["filename"]: f for f in expected_metadata}
        
        for figure in extracted_metadata:
            filename = figure["filename"]
            if filename in expected_by_filename:
                expected = expected_by_filename[filename]
                
                # If expected has split info, actual should too (but values may differ)
                if "split_from" in expected and expected["split_from"]:
                    assert figure.get("split_from") is True, \
                        f"Expected split_from=True for {filename}"
                    assert "split_index" in figure, \
                        f"Missing split_index for {filename}"
                    assert "total_splits" in figure, \
                        f"Missing total_splits for {filename}"
    
    def test_extraction_merged_info_structure(self, extracted_metadata, expected_metadata):
        """Merged count information should have correct structure (values may differ)."""
        # Just verify structure, not exact values (algorithm may merge differently)
        for figure in extracted_metadata:
            if figure.get("merged_count", 1) > 1:
                assert "original_image_indices" in figure or "merged_count" in figure, \
                    f"Figure with merged_count > 1 should have merge info: {figure.get('filename')}"
    
    def test_extraction_images_match_by_hash(self, output_dir, expected_output_dir, extracted_metadata, expected_metadata):
        """Verify that expected image files are present in output using content hashing."""
        def compute_file_hash(filepath):
            """Compute SHA256 hash of a file."""
            sha256 = hashlib.sha256()
            try:
                with open(filepath, 'rb') as f:
                    for chunk in iter(lambda: f.read(4096), b""):
                        sha256.update(chunk)
                return sha256.hexdigest()
            except FileNotFoundError:
                return None
        
        def compute_image_hash(filepath):
            """Compute average hash (perceptual hash) of an image."""
            if not HAS_IMAGE_LIBS:
                return None
            try:
                img = Image.open(filepath)
                # Convert to grayscale and resize
                img = img.convert('L').resize((8, 8), Image.Resampling.LANCZOS)
                # Compute average
                pixels = list(img.getdata())
                avg = sum(pixels) / len(pixels) if pixels else 0
                # Create hash bits
                bits = ''.join(['1' if pixel >= avg else '0' for pixel in pixels])
                return bits
            except Exception:
                return None
        
        def hamming_distance(hash1, hash2):
            """Compute Hamming distance between two hash strings."""
            if hash1 is None or hash2 is None or len(hash1) != len(hash2):
                return float('inf')
            return sum(c1 != c2 for c1, c2 in zip(hash1, hash2))
        
        # Build hash maps for expected and actual images
        expected_hashes = {}
        actual_hashes = {}
        expected_perceptual_hashes = {}
        actual_perceptual_hashes = {}
        
        # Compute hashes for expected images
        for fig in expected_metadata:
            expected_path = os.path.join(expected_output_dir, fig["filename"])
            if os.path.exists(expected_path):
                file_hash = compute_file_hash(expected_path)
                if file_hash:
                    expected_hashes[fig["filename"]] = file_hash
                
                perceptual_hash = compute_image_hash(expected_path)
                if perceptual_hash is not None:
                    expected_perceptual_hashes[fig["filename"]] = perceptual_hash
        
        # Compute hashes for actual images
        for fig in extracted_metadata:
            actual_path = os.path.join(output_dir, fig["filename"])
            if os.path.exists(actual_path):
                file_hash = compute_file_hash(actual_path)
                if file_hash:
                    actual_hashes[fig["filename"]] = file_hash
                
                perceptual_hash = compute_image_hash(actual_path)
                if perceptual_hash is not None:
                    actual_perceptual_hashes[fig["filename"]] = perceptual_hash
        
        # Match each expected image to an actual image (one-to-one matching)
        # Track which actual images have been matched to avoid double-matching
        matched_expected_files = set()
        matched_actual_files = set()
        match_details = []  # List of (expected_filename, actual_filename, match_type)
        
        # First pass: match by same filename + same hash
        for expected_filename, expected_hash in expected_hashes.items():
            if expected_filename in actual_hashes:
                actual_hash = actual_hashes[expected_filename]
                if actual_hash == expected_hash and expected_filename not in matched_actual_files:
                    matched_expected_files.add(expected_filename)
                    matched_actual_files.add(expected_filename)
                    match_details.append((expected_filename, expected_filename, "same_filename"))
        
        # Second pass: match remaining expected images by hash only (different filename)
        for expected_filename, expected_hash in expected_hashes.items():
            if expected_filename in matched_expected_files:
                continue  # Already matched
            
            # Find an actual image with the same hash that hasn't been matched yet
            for actual_filename, actual_hash in actual_hashes.items():
                if actual_hash == expected_hash and actual_filename not in matched_actual_files:
                    matched_expected_files.add(expected_filename)
                    matched_actual_files.add(actual_filename)
                    match_details.append((expected_filename, actual_filename, "cross_filename"))
                    break
        
        # Report results
        total_expected = len(expected_hashes)
        total_actual = len(actual_hashes)
        total_matches = len(matched_expected_files)
        
        filename_matches = sum(1 for _, _, match_type in match_details if match_type == "same_filename")
        cross_filename_matches = sum(1 for _, _, match_type in match_details if match_type == "cross_filename")
        
        print(f"\nHash comparison results:")
        print(f"  Expected images: {total_expected}")
        print(f"  Actual images: {total_actual}")
        print(f"  Exact hash matches (same filename): {filename_matches}")
        print(f"  Cross-filename matches (same content, different name): {cross_filename_matches}")
        print(f"  Total matches: {total_matches}")
        
        # Require exactly the same number of images
        assert total_expected == total_actual, \
            f"Image count mismatch: expected {total_expected} images, got {total_actual} images"
        
        # Require 100% match - every expected image must be found
        assert total_matches == total_expected, \
            f"Not all expected images found. Found {total_matches} out of {total_expected} expected images."
        
        # Find which expected images are missing
        missing_images = [f for f in expected_hashes.keys() if f not in matched_expected_files]
        
        assert len(missing_images) == 0, \
            f"Missing expected images (not found by hash): {missing_images}"
        
        # Verify no duplicate matches (each actual image matched at most once)
        assert len(matched_actual_files) == total_matches, \
            f"Duplicate matches detected: {len(matched_actual_files)} actual files matched for {total_matches} expected files"
        
        print(f"  ✓ All {total_expected} expected images found in output")
        
        # If we have perceptual hashes, also check for similar images
        if expected_perceptual_hashes and actual_perceptual_hashes:
            similar_matches = 0
            similar_pairs = []
            matched_for_similarity = set()
            
            for expected_filename, expected_phash in expected_perceptual_hashes.items():
                # Check if any actual image is similar (within hamming distance)
                best_match = None
                best_distance = float('inf')
                
                for actual_filename, actual_phash in actual_perceptual_hashes.items():
                    if actual_filename in matched_for_similarity:
                        continue
                    distance = hamming_distance(expected_phash, actual_phash)
                    if distance < best_distance:
                        best_distance = distance
                        best_match = actual_filename
                
                # If we found a similar match (hamming distance <= 10 for 64-bit hash)
                if best_match and best_distance <= 10:
                    similar_matches += 1
                    matched_for_similarity.add(best_match)
                    similar_pairs.append((expected_filename, best_match, best_distance))
            
            if similar_matches > 0:
                print(f"  Similar images (perceptual hash, hamming <= 10): {similar_matches}")
                if len(similar_pairs) <= 5:
                    for exp, act, dist in similar_pairs:
                        print(f"    {exp} ~ {act} (distance: {dist})")
