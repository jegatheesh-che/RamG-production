import os
from PIL import Image

image_dir = r"d:\website devoplement-agency-official\client belgium\soozanapvan\assets\images\excellents"

# Select 5 stunning non-slide portfolio images
featured_images = [
    "DSC09416.webp",
    "DSC07335.webp",
    "DSC02909.webp",
    "DSC07287.webp",
    "DSC07134.webp"
]

for idx, img_name in enumerate(featured_images, 1):
    img_path = os.path.join(image_dir, img_name)
    if not os.path.exists(img_path):
        print(f"Skipping {img_name}, not found.")
        continue

    img = Image.open(img_path)
    width, height = img.size

    # Cut horizontally (Left & Right halves for Desktop PC)
    left_box = (0, 0, width // 2, height)
    right_box = (width // 2, 0, width, height)

    left_img = img.crop(left_box)
    right_img = img.crop(right_box)

    left_img.save(os.path.join(image_dir, f"split_bg_{idx}_left.webp"), "webp", quality=88)
    right_img.save(os.path.join(image_dir, f"split_bg_{idx}_right.webp"), "webp", quality=88)

    # Cut vertically (Top & Bottom halves for Mobile)
    top_box = (0, 0, width, height // 2)
    bottom_box = (0, height // 2, width, height)

    top_img = img.crop(top_box)
    bottom_img = img.crop(bottom_box)

    top_img.save(os.path.join(image_dir, f"split_bg_{idx}_top.webp"), "webp", quality=88)
    bottom_img.save(os.path.join(image_dir, f"split_bg_{idx}_bottom.webp"), "webp", quality=88)

    print(f"Generated split set {idx} from {img_name} ({width}x{height})")

print("Finished generating all 5 split image sets!")
