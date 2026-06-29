# 3D Product Carousel - Problem & Solution Prompt

## CURRENT PROBLEM
The carousel products are **heavily overlapping** and create a messy, unprofessional appearance. The bottles are stacked chaotically instead of being arranged in a clean 3D cylinder. Navigation arrows and dots are barely visible due to overlapping content.

---

## REQUIREMENTS FOR CLEAN 3D CAROUSEL

### 1. PROPER 3D SPACING
- Products must NOT overlap
- Each product positioned at exact angles (90° intervals for 4 items)
- Use proper 3D math: `rotateY()` + `translateZ()` for cylindrical positioning
- Radius: 400px (larger spacing to prevent overlap)
- Perspective: 1500px (for better depth perception)

### 2. PRODUCT BOTTLE DESIGN
- **Realistic product bottle appearance**: tall, narrow container (5L bottles like in image)
- White/cream colored bottles with labels
- Show product name, category, and scent type on label
- Gold/tan "GET INFO" button at bottom
- Badge showing product number (01, 02, 03, 04)

### 3. CLEAN LAYOUT
- Front product: 100% visible and interactive
- Left/right products: 60% opacity, rotated away
- Back product: hidden/minimal opacity (not visible)
- Only front 3 items have pointer events enabled
- Smooth transitions between rotations (0.8s cubic-bezier)

### 4. NAVIGATION
- Left/Right circular arrow buttons (white with border)
- Position arrows OUTSIDE carousel area (no overlap)
- Bottom indicator dots (4 dots for 4 products)
- Smooth 90° rotation per click

### 5. PROFESSIONAL STYLING
- Dark blue gradient background (like your original)
- "Royal Klense" branding at top
- Clean white containers for product cards
- Proper shadows and depth effects
- Responsive font sizing

### 6. PRODUCTS TO DISPLAY
1. **Liquid Fresh** - Strawberry scent - Fresh Flora
2. **Room Freshener** - Fresh Floral scent
3. **Multi-Purpose Cleaner** - Original scent
4. **Glass/Surface Cleaner** - Original scent

---

## CODE REQUIREMENTS

```
Framework: React with Hooks
Style: Inline CSS with CSS Variables
No external libraries except React

KEY FUNCTIONS:
- calculatePosition(index, rotation) → returns transform style
- handleNext() → rotate by -90°
- handlePrev() → rotate by +90°
- getOpacity(index, rotation) → fades back items
```

### Transform Calculation Logic
```javascript
const anglePerItem = 360 / 4; // 4 products = 90° each
const radius = 400;

products.map((product, index) => {
  const angle = (index * anglePerItem) + rotation;
  const radians = (angle * Math.PI) / 180;
  
  return {
    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
    opacity: Math.cos(radians) > -0.1 ? 1 : 0.2,
    pointerEvents: Math.cos(radians) > 0 ? 'auto' : 'none'
  }
})
```

---

## FINAL DELIVERABLE
A professional, non-overlapping 3D carousel where:
- ✅ Products arranged perfectly in cylinder
- ✅ No overlapping or messiness
- ✅ Smooth 90° rotations on click
- ✅ Professional product bottle styling
- ✅ Clean navigation controls
- ✅ Proper depth perception
- ✅ Ready for production use