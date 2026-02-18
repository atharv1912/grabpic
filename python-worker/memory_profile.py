import tracemalloc
import psutil
import os
import numpy as np
from face_worker_optimized import FaceEmbeddingWorker
import gc
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MemoryProfiler:
    """Track memory usage during face processing"""
    
    def __init__(self):
        self.process = psutil.Process(os.getpid())
        self.baseline_memory = 0
    
    def get_memory_mb(self) -> float:
        """Get current memory usage in MB"""
        return self.process.memory_info().rss / 1024 / 1024
    
    def set_baseline(self):
        """Set baseline memory (after model loading)"""
        gc.collect()  # Force garbage collection
        self.baseline_memory = self.get_memory_mb()
        logger.info(f"Baseline memory: {self.baseline_memory:.2f} MB")
    
    def get_delta(self) -> float:
        """Get memory increase from baseline"""
        current = self.get_memory_mb()
        return current - self.baseline_memory
    
    def print_stats(self, label: str):
        """Print current memory stats"""
        current = self.get_memory_mb()
        delta = self.get_delta()
        print(f"{label:.<40} {current:>8.2f} MB (Δ {delta:>+7.2f} MB)")


def profile_image_processing(image_path: str, max_image_size: int = 1920):
    """
    Profile memory usage for a single image.
    
    Args:
        image_path: Path to test image
        max_image_size: Max dimension for resizing
    """
    profiler = MemoryProfiler()
    
    print(f"\n{'='*60}")
    print(f"MEMORY PROFILE: {image_path}")
    print(f"Max Image Size: {max_image_size}px")
    print(f"{'='*60}\n")
    
    # Start tracking
    tracemalloc.start()
    
    # 1. Initial state
    profiler.print_stats("Initial memory")
    
    # 2. Load model
    worker = FaceEmbeddingWorker(max_image_size=max_image_size, min_confidence=0.5)
    gc.collect()
    profiler.print_stats("After model loading")
    profiler.set_baseline()
    
    # 3. Process image
    print(f"\nProcessing image...")
    snapshot_before = tracemalloc.take_snapshot()
    
    faces = worker.process_image(image_path)
    
    snapshot_after = tracemalloc.take_snapshot()
    profiler.print_stats("After processing")
    
    # 4. Memory allocated during processing
    top_stats = snapshot_after.compare_to(snapshot_before, 'lineno')
    
    print(f"\nTop 5 memory allocations during processing:")
    for stat in top_stats[:5]:
        print(f"  {stat}")
    
    # 5. After cleanup
    del faces
    gc.collect()
    profiler.print_stats("After cleanup")
    
    # Summary
    current_total = profiler.get_memory_mb()
    print(f"\n{'='*60}")
    print(f"SUMMARY:")
    print(f"  Total memory used: {current_total:.2f} MB")
    print(f"  Within 512MB limit: {'✅ YES' if current_total < 512 else '❌ NO'}")
    print(f"  Headroom: {512 - current_total:.2f} MB")
    print(f"{'='*60}\n")
    
    tracemalloc.stop()
    
    return current_total


def test_different_image_sizes():
    """Test memory usage with different max_image_size settings"""
    
    image_path = 'test_image.jpg'
    
    # Test different resize limits
    test_configs = [
        ("No resize (original)", None),
        ("Max 1920px", 1920),
        ("Max 1280px", 1280),
        ("Max 640px", 640),
    ]
    
    results = []
    
    for label, max_size in test_configs:
        # Create config dict
        config = {"max_image_size": max_size} if max_size else {"max_image_size": 10000}  # Large number = no resize
        
        memory_used = profile_image_processing(image_path, **config)
        results.append((label, memory_used))
        
        # Clean up between tests
        gc.collect()
        
        print("\n" + "="*60 + "\n")
    
    # Summary table
    print("\n" + "="*60)
    print("COMPARISON: Memory Usage by Image Size")
    print("="*60)
    print(f"{'Configuration':<30} {'Memory (MB)':<15} {'Status'}")
    print("-"*60)
    
    for label, memory in results:
        status = "✅ OK" if memory < 512 else "❌ EXCEEDS LIMIT"
        print(f"{label:<30} {memory:>10.2f} MB    {status}")
    
    print("="*60 + "\n")


# Additional: Profile with @profile decorator for line-by-line analysis
def detailed_line_profile():
    """
    Run this with: python -m memory_profiler memory_profile.py
    
    This will show line-by-line memory usage
    """
    from memory_profiler import profile
    
    @profile
    def process_with_profiler():
        worker = FaceEmbeddingWorker(max_image_size=1920)
        faces = worker.process_image('test_image.jpg')
        return faces
    
    process_with_profiler()


if __name__ == "__main__":
    # Test 1: Single image profiling
    print("TEST 1: Single Image Memory Profile")
    profile_image_processing('test_image.jpg', max_image_size=1920)
    
    # Test 2: Compare different image sizes
    print("\n\nTEST 2: Compare Different Resize Settings")
    test_different_image_sizes()