# Concept Trung Nguyên Legend "MỘT GIỌT": prompt ảnh Gemini (22 ảnh)

Lưu **đúng tên file** vào Downloads hoặc `landing-lab/builds/tn-concept/inbox/`. Prompt có 📎 thì đính kèm ảnh đó khi tạo.
Thứ tự: **C1 trước C0 và C2–C5** (để mọi bộ hạt cùng cách chụp). Các ảnh khác tuỳ anh.
Hướng chốt: "MỘT GIỌT", 4 chương ĐẤT → LỬA → NƯỚC → SỮA (xem spec). Hạt C0–C5 sẽ thành hàng trăm hạt bay và tụ thành số, nên **phải tách rời, mỗi hạt rõ nét**.

## Quy tắc chung
- Mỗi prompt bắt đầu bằng một đoạn STYLE. Dán **nguyên văn**, không viết lại.
  - **STYLE-STUDIO** cho ảnh em sẽ tách nền: hạt, quả, lá, phin, gói, ly.
  - **STYLE-DARK** cho ảnh cận cảnh tràn màn hình, tông tối.
  - **STYLE-PHOTO** cho phong cảnh và các tấm ảnh nhỏ ở dải mốc thời gian.
- **Không được có logo, chữ hay bao bì Trung Nguyên trong ảnh.** Gemini mà tự vẽ logo hay chữ thì tạo lại. Tên hãng em sẽ gõ bằng font của trang.
- Ảnh cần tách nền phải có các món **rời nhau, không chạm, không chồng lên nhau**.
- Mỗi ảnh nên tạo 2–3 bản rồi chọn bản đẹp nhất.

### STYLE-STUDIO
```
Photorealistic commercial product photo. Plain seamless light grey studio background (#C8C8C8), no gradient, no props. Large softbox key light from the upper left, soft fill, a gentle natural contact shadow, crisp focus across the whole subject, true-to-life colours. No text, no logos, no labels, no packaging print, no people, no hands, no watermark.
```

### STYLE-DARK
```
Photorealistic macro food photography, dark moody low-key lighting on a deep espresso-brown background, a warm rim light, rich glossy textures, shallow depth of field, cinematic. No text, no logos, no packaging, no people, no watermark.
```

### STYLE-PHOTO
```
Photorealistic editorial photo, natural light, warm and slightly nostalgic colour, 35mm lens. Vietnam. No readable text, no signs, no logos, no brand names. People only small or partly seen, no clear faces.
```

## A. Mở màn "giọt phin"
**A1 → `phin-giot.png`** · STYLE-DARK +
```
Extreme close-up of a traditional Vietnamese aluminium coffee filter (phin) on top of a short glass, a single dark glossy drop of coffee hanging from the bottom of the filter, about to fall. Steam curling softly. The phin fills the upper half of the frame, the glass rim at the bottom edge. Vertical 9:16.
```
**A2 → `crema.png`** · STYLE-DARK +
```
Top-down macro of the surface of freshly dripped Vietnamese coffee in a glass, a thick hazel-brown crema with a soft spiral swirl and tiny bubbles, filling the entire frame edge to edge. Square 1:1.
```

## B. Đất đỏ Buôn Ma Thuột
**B1 → `dat-do.png`** · STYLE-PHOTO +
```
Early morning in Vietnam's Central Highlands: rows of coffee trees on rolling hills of deep red basalt soil, soft mist in the valleys, warm low sun from the left, a few red coffee cherries visible on the nearest branch in the foreground. Ultra-wide 21:9.
```
**B2 → `qua-chin.png`** · STYLE-STUDIO +
```
Ripe coffee cherries: one cluster of five glossy red cherries on a short twig, plus four single loose cherries (two red, one yellow-orange, one green), every item separate with wide empty space between them, nothing touching. Seen from slightly above. Landscape 4:3.
```
**B3 → `la-ca-phe.png`** · STYLE-STUDIO +
```
Four fresh glossy dark-green coffee leaves of different sizes, wavy edges and clear veins, laid separately with wide empty space between them, nothing touching, seen from directly above. Landscape 4:3.
```

## C. Năm công thức Sáng Tạo (hạt từng giống)
**C1 → `robusta.png`** · STYLE-STUDIO +
```
Nine whole roasted Robusta coffee beans, dark roast, small and rounded with a straight centre crease, each bean shown from a different angle, arranged in a loose 3 by 3 grid with wide empty space between every bean, nothing touching. Seen from slightly above. Landscape 4:3.
```
**C0 → `nhan-xanh.png`** · 📎 `robusta.png` · STYLE-STUDIO +
```
Same framing, lighting and grid as the attached image, but nine raw unroasted green coffee beans (green-grey, matte, pale centre crease), each from a different angle, nothing touching. Landscape 4:3.
```
**C2 → `arabica.png`** · 📎 `robusta.png` · STYLE-STUDIO +
```
Same framing, lighting and grid as the attached image, but nine whole roasted Arabica coffee beans, medium roast, larger and more oval with a gently S-curved centre crease, each from a different angle, nothing touching. Landscape 4:3.
```
**C3 → `excelsa.png`** · 📎 `robusta.png` · STYLE-STUDIO +
```
Same framing, lighting and grid as the attached image, but nine whole roasted Excelsa (Liberica var. dewevrei) coffee beans, medium-dark roast, elongated and slightly asymmetric teardrop shape, each from a different angle, nothing touching. Landscape 4:3.
```
**C4 → `catimor.png`** · 📎 `robusta.png` · STYLE-STUDIO +
```
Same framing, lighting and grid as the attached image, but nine whole roasted Catimor coffee beans, medium roast, medium-sized oval beans with a slightly irregular crease, each from a different angle, nothing touching. Landscape 4:3.
```
**C5 → `culi.png`** · 📎 `robusta.png` · STYLE-STUDIO +
```
Same framing, lighting and grid as the attached image, but nine whole roasted peaberry coffee beans: each bean is a single small rounded oval with no flat side, dark roast, each from a different angle, nothing touching. Landscape 4:3.
```
**C6 → `nam-dam.png`** · STYLE-STUDIO +
```
A small loose heap of very dark roasted coffee beans with an oily sheen, about two handfuls, centred, a few beans rolled slightly away from the heap. Landscape 4:3.
```
**C7 → `nam-vua.png`** · 📎 `nam-dam.png` · STYLE-STUDIO +
```
Same framing, lighting and heap shape as the attached image, but the beans are a lighter medium roast, dry matte surface, warm chestnut brown. Landscape 4:3.
```

## D. Chiếc phin (chương NƯỚC)
**D1 → `phin.png`** · STYLE-STUDIO +
```
A traditional Vietnamese aluminium coffee filter (phin), fully assembled with its domed lid on, standing alone and seen straight from the side at eye level, plain brushed aluminium with no engraving, centred with empty space around it. Vertical 3:4.
```

## E. G7 (2003)
**E1 → `goi-xe.png`** · STYLE-STUDIO +
```
A small blank matte dark-red instant coffee sachet with no print at all, torn open at the top corner, a burst of fine brown instant coffee powder and granules flying out of the tear in a dynamic arc, frozen mid-air. Centred with empty space around. Landscape 4:3.
```

## F. Hành trình 30 năm (ảnh nhỏ cho dải mốc)
**F1 → `m1996.png`** · STYLE-PHOTO +
```
Close-up of two weathered hands holding freshly picked red coffee cherries above a woven basket, coffee trees and red soil softly blurred behind, early morning light. Landscape 4:3.
```
**F2 → `m1998.png`** · STYLE-PHOTO +
```
A small Saigon coffee shop from the late 1990s: wooden chairs, a marble-top table with a phin dripping into a glass, old ceiling fan, warm afternoon light through a doorway, no signs. Landscape 4:3.
```
**F3 → `m2003.png`** · STYLE-PHOTO +
```
A white porcelain cup on a saucer, hot water just poured over instant coffee, a rich brown swirl and fine foam forming on the surface, seen from slightly above, soft window light. Landscape 4:3.
```
**F4 → `m2018.png`** · STYLE-PHOTO +
```
A museum-style display of antique coffee equipment from around the world: old brass and wooden hand grinders, ornate copper coffee pots, a vintage roaster, arranged on dark wooden shelves with warm spotlights. Landscape 4:3.
```
**F5 → `m2026.png`** · STYLE-PHOTO +
```
Sunrise over coffee hills of the Central Highlands, a glass of iced Vietnamese milk coffee on a wooden railing in the sharp foreground, golden light, mist in the valleys behind. Landscape 4:3.
```

## G. Kết màn "ly đầu ngày"
**G1 → `ly-sua-da.png`** · STYLE-STUDIO +
```
A tall clear glass of Vietnamese iced milk coffee (cà phê sữa đá): dark coffee swirling into creamy condensed milk, filled with clear ice cubes, condensation droplets on the outside of the glass, a long spoon inside. Three-quarter view, centred. Vertical 3:4.
```
**G2 → `da.png`** · STYLE-STUDIO +
```
Six clear ice cubes with soft edges and tiny bubbles inside, scattered with wide empty space between each cube, nothing touching, seen from slightly above. Landscape 4:3.
```
