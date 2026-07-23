import os
from PIL import Image

img_path = r"d:\website devoplement-agency-official\client belgium\soozanapvan\assets\images\excellents\slide5.webp"
out_dir = r"d:\website devoplement-agency-official\client belgium\soozanapvan\assets\images\excellents"

img = Image.open(img_path)
width, height = img.size

# Cut horizontally (Left & Right halves for Desktop PC)
left_box = (0, 0, width // 2, height)
right_box = (width // 2, 0, width, height)

left_img = img.crop(left_box)
right_img = img.crop(right_box)

left_img.save(os.path.join(out_dir, "slide5_left.webp"), "webp", quality=90)
right_img.save(os.path.join(out_dir, "slide5_right.webp"), "webp", quality=90)

# Cut vertically (Top & Bottom halves for Mobile)
top_box = (0, 0, width, height // 2)
bottom_box = (0, height // 2, width, height)

top_img = img.crop(top_box)
bottom_img = img.crop(bottom_box)

top_img.save(os.path.join(out_dir, "slide5_top.webp"), "webp", quality=90)
bottom_img.save(os.path.join(out_dir, "slide5_bottom.webp"), "webp", quality=90)

print(f"Successfully cut slide5.webp ({width}x{height}) into physically split left, right, top, and bottom halves!")
