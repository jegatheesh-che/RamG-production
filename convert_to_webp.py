import os
import glob
from PIL import Image

image_dir = r"D:\website devoplement-agency-official\client belgium\soozanapvan\assets\images\excellents"

# Find all JPG/jpeg files
patterns = [os.path.join(image_dir, "*.jpg"), os.path.join(image_dir, "*.JPG"), os.path.join(image_dir, "*.jpeg")]
files = []
for p in patterns:
    files.extend(glob.glob(p))

for file in files:
    try:
        img = Image.open(file)
        webp_file = os.path.splitext(file)[0] + ".webp"
        
        # Calculate resize if image is huge (width > 2000px)
        max_width = 1600
        if img.width > max_width:
            ratio = max_width / img.width
            new_size = (max_width, int(img.height * ratio))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        # Save as webp with 80% quality
        img.save(webp_file, "webp", quality=80)
        print(f"Converted: {os.path.basename(file)} -> {os.path.basename(webp_file)}")
    except Exception as e:
        print(f"Failed to convert {file}: {e}")

print("Done converting images to WebP!")
