#!/bin/bash
API="https://iris-and-inesh-2026.vercel.app/api/wishlist"
PWD="admin123"

add() {
  curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -d "{\"password\":\"$PWD\",\"person\":\"iris\",\"name\":\"$1\",\"description\":\"$2\",\"price\":\"$3\",\"url\":\"$4\",\"category\":\"$5\"}" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('ok') else d)"
  sleep 0.5
}

echo "Adding Iris wishlist items..."

add "Nike Sportswear Club Fleece Sweatpants" "Mid-rise wide leg sweatpants" "" "https://www.nike.com/t/sportswear-club-fleece-womens-mid-rise-wide-leg-sweatpants-TPk2F9w2/FB2727-461" "Clothing"
add "Women's Aconcagua 3 Hoodie" "The North Face puffer hoodie" "\$250" "https://www.thenorthface.com/en-us/p/womens/womens-jackets-and-vests/womens-puffer-jackets-829825/womens-aconcagua-3-hoodie-NF0A84IV?color=4H0&size=M" "Clothing"
add "Nike Cotton Cushioned Training Socks (6 Pack)" "Everyday DRI-FIT crew socks, white" "\$18.99" "https://www.walmart.com/ip/Nike-Unisex-Everyday-Cotton-Cushioned-Crew-Training-Socks-with-DRI-FIT-Technology-Pack-of-6-Pairs-White/1763734469" "Clothing"
add "Coach Brooklyn Shoulder Bag 28" "Brown or Black" "\$395" "https://www.coach.com/products/brooklyn-shoulder-bag-28/CU068-B4MPL.html" "Accessories"
add "NUTIKAS Desk Shelves Desktop Organizer" "Corner bookshelf tabletop shelving, white" "\$25.92" "https://www.amazon.com/dp/B0DR31GC3D" "Home"
add "BESIGN Aluminum Laptop Stand" "Ergonomic detachable riser, 10–15.6\", silver" "\$14.99" "https://www.amazon.com/dp/B08BRCT4JH" "Tech"
add "Kodak PIXPRO FZ55 Digital Camera" "16MP, 5x optical zoom, 1080p Full HD, black" "\$139.99" "https://www.amazon.com/dp/B09ZRN1N3Z" "Tech"
add "The North Face Jester Backpack" "Classic everyday backpack, black" "\$90" "https://www.thenorthface.com/en-us/p/bags-and-gear/backpacks-224451/jester-backpack-NF0A3VXF?color=4H0&size=OS" "Accessories"
add "Womens Thermal Underwear Set" "Long johns base layer fleece lined, black, medium" "\$14.99" "https://www.amazon.com/dp/B09CGN2VJT" "Clothing"
add "Offstage Hoodie Glacier Grey" "White Fox Boutique — already reserved" "" "https://whitefoxboutique.com/products/offstage-hoodie-glacier-grey" "Clothing"
add "Nike One High-Waisted 7/8 Leggings" "Nike One women's leggings" "\$70" "https://www.nike.com/t/one-womens-high-waisted-7-8-leggings-a4SMPF70/IB9131-010" "Clothing"
add "Trendy Queen Oversized Hoodie" "Fleece sweatshirt, black/grey, size M" "\$32.99" "https://www.amazon.com/dp/B0C65S55Q2" "Clothing"
add "Pandora Charms for Tennis Bracelet" "Silver charms" "" "" "Accessories"
add "UNIQLO Wide Sweatpants" "Small — available in Grey, Black, Dark Green" "\$39.90" "https://www.uniqlo.com/us/en/products/E483282-000/00" "Clothing"
add "ProCase Rotating Jewelry Stand Organizer" "Ring tray, earring/bracelet/necklace holder, gold" "\$11.99" "https://www.amazon.com/dp/B0F53X72FQ" "Home"
add "LEGO Botanicals Happy Plants (10349)" "Building toy, desk/shelf decor" "\$18.39" "https://www.amazon.com/dp/B0DRW6C2RF" "Other"

echo "Done! All 16 items added."
