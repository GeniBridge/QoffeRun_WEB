# Image URLs Fixed - Mobile App Integration

## Issue Summary
Mobile app was receiving 404 errors for chain logos and cover images.

**Root Cause:**
- Database had outdated/incorrect image paths
- Chain model was missing accessors for `logo_path` attribute
- Paths were stored with incorrect prefixes causing double `/storage/` in URLs

## Resolution

### 1. Database Updates
Updated Chain #16 (Caffè Roma) with correct image paths:
- **Logo:** `chains/logos/chain_16_brand_logo_1763382072.png`
- **Cover:** `chains/covers/chain_16_cover_1763382064.png`

### 2. Chain Model Updates
Added to `/backend/src/app/Models/Chain.php`:
- Added `brand_logo_path` and `cover_image_path` to `$fillable` array
- Added `getLogoPathAttribute()` accessor for backward compatibility
- The accessor returns `brand_logo_path` if available, falls back to legacy `logo_path`

### 3. File Storage Structure
```
/var/www/html/storage/app/public/
├── chains/
│   ├── logos/
│   │   └── chain_16_brand_logo_1763382072.png
│   └── covers/
│       └── chain_16_cover_1763382064.png
└── [symlinked to /var/www/html/public/storage]
```

## API Response Format

### Public Branches Endpoint
**Endpoint:** `GET /api/v1/public/branches?eligible=true`

**Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "id": 18,
      "name": "Caffè Roma - Ostia",
      "address": "Lungomare Paolo Toscanelli 20, 00122 Lido di Ostia (RM)",
      "chain": {
        "id": 16,
        "name": "Caffè Roma",
        "logo_url": "https://api.qofferun.com/storage/chains/logos/chain_16_brand_logo_1763382072.png",
        "cover_url": "https://api.qofferun.com/storage/chains/covers/chain_16_cover_1763382064.png",
        "description": "Autentico caffè italiano nel cuore di Roma"
      },
      "products_count": 7,
      "delivery_enabled": true,
      "takeaway_enabled": true
    }
  ]
}
```

## Verified Image URLs

✅ **Logo:** https://api.qofferun.com/storage/chains/logos/chain_16_brand_logo_1763382072.png
- Status: HTTP/2 200
- Content-Type: image/png
- Size: 1,162,264 bytes

✅ **Cover:** https://api.qofferun.com/storage/chains/covers/chain_16_cover_1763382064.png
- Status: HTTP/2 200
- Content-Type: image/png
- Size: 73,662 bytes

## Mobile App Integration

### Flutter Example
```dart
// Fetch branches with chain images
final response = await http.get(
  Uri.parse('https://api.qofferun.com/api/v1/public/branches?eligible=true'),
);

if (response.statusCode == 200) {
  final data = json.decode(response.body);
  final branches = data['data'] as List;
  
  for (var branch in branches) {
    final chain = branch['chain'];
    final logoUrl = chain['logo_url'];
    final coverUrl = chain['cover_url'];
    
    // Display images using CachedNetworkImage
    CachedNetworkImage(
      imageUrl: logoUrl,
      placeholder: (context, url) => CircularProgressIndicator(),
      errorWidget: (context, url, error) => Icon(Icons.error),
    );
  }
}
```

### Image Caching Recommendations
```dart
dependencies:
  cached_network_image: ^3.3.0
```

Use `CachedNetworkImage` to cache chain logos and covers for better performance:
```dart
CachedNetworkImage(
  imageUrl: chain['logo_url'],
  fit: BoxFit.cover,
  memCacheWidth: 400, // Resize for performance
  placeholder: (context, url) => ShimmerPlaceholder(),
  errorWidget: (context, url, error) => DefaultChainLogo(),
)
```

## Image Upload Format

When uploading new chain images via admin panel, files are stored with naming pattern:
- Logo: `chain_{id}_brand_logo_{timestamp}.{ext}`
- Cover: `chain_{id}_cover_{timestamp}.{ext}`

Database stores path without `/storage/` prefix:
- `chains/logos/chain_16_brand_logo_1763382072.png`
- `chains/covers/chain_16_cover_1763382064.png`

Controller adds `url('storage/' . $path)` to create full URL.

## Testing Checklist

- [x] Logo URL returns HTTP 200
- [x] Cover URL returns HTTP 200
- [x] API response includes correct `logo_url` and `cover_url`
- [x] URLs are properly formatted (no double `/storage/`)
- [x] Images are accessible via HTTPS
- [ ] Mobile app displays logos correctly
- [ ] Mobile app displays cover images correctly
- [ ] Image caching works properly in mobile app

## Notes for Other Chains

Currently only Chain #16 (Caffè Roma) has images. Other chains will return `null` for `logo_url` and `cover_url`.

To upload images for other chains:
1. Use admin panel: `POST /api/v1/chains/{id}/upload-logo`
2. Use admin panel: `POST /api/v1/chains/{id}/upload-cover`
3. Files will be automatically stored in correct format

## Date Fixed
November 18, 2025
