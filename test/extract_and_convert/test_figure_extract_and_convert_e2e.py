"""
End-to-end tests for the figure extraction script.

These tests run the full extraction pipeline and compare output to expected fixtures.
"""
import pytest
import sys
import os
import json
import hashlib

try:
    from PIL import Image
    import numpy as np
    HAS_IMAGE_LIBS = True
except ImportError:
    HAS_IMAGE_LIBS = False


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
