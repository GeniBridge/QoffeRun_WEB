# QoffeRun Complete API Documentation

**Base URL:** `https://api.qofferun.com/api/v1`  
**Last Updated:** November 18, 2025

---

## 📋 Table of Contents

1. [Authentication](#-authentication)
2. [Browse Branches & Menus](#-browse-branches--menus)
3. [Shopping Cart](#-shopping-cart)
4. [Order & Payment](#-order--payment)
5. [Stripe Connect Payment Flow](#-stripe-connect-payment-flow)
6. [Flutter Implementation Examples](#-flutter-implementation-examples)
7. [Error Handling](#-error-handling)

---

## 🔐 Authentication

### Register New Customer

**Endpoint:** `POST /register`  
**Authentication:** Not required

See **IMPORTANT-API-ENDPOINTS.md** for complete registration and login documentation.

**Quick Example:**
```dart
final response = await _dio.post('/register', data: {
  'first_name': 'John',
  'last_name': 'Doe',
  'email': 'john@example.com',
  'password': 'SecurePass123!',
  'password_confirmation': 'SecurePass123!',
  'phone': '+393331234567', // optional
});

final token = response.data['data']['token'];
final user = response.data['data']['user'];
```

### Login

**Endpoint:** `POST /login`  
**Authentication:** Not required

Returns access token to use for authenticated requests.

---

## 🏪 Browse Branches & Menus

### 1. Get Available Branches

**Endpoint:** `GET /customer/branches`  
**Authentication:** Not required (public endpoint)

**Description:** Retrieves all branches that accept online orders and have menu items available.

**Request:**
```bash
curl 'https://api.qofferun.com/api/v1/customer/branches'
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 16,
      "name": "Caffè Roma - Via del Corso",
      "code": "CR001",
      "address": "Via del Corso 123, 00186 Roma (RM)",
      "phone": "+39 06 1234001",
      "email": "viacorso@cafferoma.it",
      "chain": {
        "id": 16,
        "name": "Caffè Roma",
        "logo": "chains/logos/chain_16_brand_logo_1763382072.png"
      },
      "services": {
        "delivery": true,
        "takeaway": true,
        "table_service": false
      },
      "coordinates": {
        "lat": "41.90280000",
        "lng": "12.49640000"
      },
      "accepting_orders": true,
      "ordering_hours": {
        "start": "08:00:00",
        "end": "20:00:00"
      }
    }
  ]
}
```

---

### 2. Get Branch Menu

**Endpoint:** `GET /customer/branches/{branchId}/menu`

**Endpoint:** `GET /customer/branches/{branchId}/menu`  
**Authentication:** Not required (public endpoint)

### Description
Retrieves all available menu items for a specific branch, grouped by category. Only returns items that are marked as available.

### Request

```bash
curl -X GET 'https://api.qofferun.com/api/v1/customer/branches/16/menu'
```

### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "branch": {
      "id": 16,
      "name": "Caffè Roma - Via del Corso",
      "chain_name": "Caffè Roma"
    },
    "menu": [
      {
        "category": "coffee",
        "items": [
          {
            "id": 45,
            "name": "Espresso",
            "price": "1.50",
            "price_raw": 1.5,
            "category": "coffee",
            "image": "https://api.qofferun.com/storage/menu/espresso.jpg",
            "description": "Classic Italian espresso",
            "is_available": true,
            "customizable": true,
            "customization_options": {
              "size": {
                "label": "Dimensione",
                "required": true,
                "options": {
                  "single": {
                    "label": "Singolo",
                    "price": 0
                  },
                  "double": {
                    "label": "Doppio",
                    "price": 0.50
                  }
                }
              },
              "sugar": {
                "label": "Zucchero",
                "required": false,
                "options": {
                  "no_sugar": {
                    "label": "Senza zucchero",
                    "price": 0
                  },
                  "one_sugar": {
                    "label": "1 bustina",
                    "price": 0
                  },
                  "two_sugar": {
                    "label": "2 bustine",
                    "price": 0
                  }
                }
              }
            }
          },
          {
            "id": 46,
            "name": "Cappuccino",
            "price": "2.50",
            "price_raw": 2.5,
            "category": "coffee",
            "image": "https://api.qofferun.com/storage/menu/cappuccino.jpg",
            "description": "Espresso with steamed milk foam",
            "is_available": true,
            "customizable": true,
            "customization_options": {
              "milk_type": {
                "label": "Tipo di latte",
                "required": false,
                "options": {
                  "regular": {
                    "label": "Normale",
                    "price": 0
                  },
                  "soy": {
                    "label": "Latte di soia",
                    "price": 0.50
                  },
                  "almond": {
                    "label": "Latte di mandorla",
                    "price": 0.60
                  },
                  "oat": {
                    "label": "Latte d'avena",
                    "price": 0.60
                  }
                }
              },
              "size": {
                "label": "Dimensione",
                "required": true,
                "options": {
                  "regular": {
                    "label": "Regolare",
                    "price": 0
                  },
                  "large": {
                    "label": "Grande",
                    "price": 0.50
                  }
                }
              }
            }
          }
        ]
      },
      {
        "category": "pastry",
        "items": [
          {
            "id": 47,
            "name": "Cornetto",
            "price": "1.80",
            "price_raw": 1.8,
            "category": "pastry",
            "image": null,
            "description": "Italian croissant",
            "is_available": true,
            "customizable": false,
            "customization_options": {}
          }
        ]
      }
    ]
  }
}
```

### Response (Error - 404)

```json
{
  "success": false,
  "message": "Filiale non trovata o non accetta ordini online"
}
```

### Response (Error - 422)

```json
{
  "success": false,
  "message": "La filiale non accetta ordini in questo momento",
  "ordering_hours": {
    "start": "08:00:00",
    "end": "20:00:00"
  }
}
```

---

## 🍕 2. Get Menu Item Details

**Endpoint:** `GET /customer/menu-items/{itemId}`  
**Authentication:** Not required (public endpoint)

### Description
Retrieves detailed information about a specific menu item, including all customization options, allergens, and nutritional information.

### Request

```bash
curl -X GET 'https://api.qofferun.com/api/v1/customer/menu-items/46'
```

### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "id": 46,
    "name": "Cappuccino",
    "description": "Espresso with steamed milk foam",
    "price": "2.50",
    "price_raw": 2.5,
    "category": "coffee",
    "image": "https://api.qofferun.com/storage/menu/cappuccino.jpg",
    "customizable": true,
    "customization_options": {
      "milk_type": {
        "label": "Tipo di latte",
        "required": false,
        "options": {
          "regular": {
            "label": "Normale",
            "price": 0
          },
          "soy": {
            "label": "Latte di soia",
            "price": 0.50
          },
          "almond": {
            "label": "Latte di mandorla",
            "price": 0.60
          }
        }
      },
      "size": {
        "label": "Dimensione",
        "required": true,
        "options": {
          "regular": {
            "label": "Regolare",
            "price": 0
          },
          "large": {
            "label": "Grande",
            "price": 0.50
          }
        }
      }
    },
    "nutritional_info": {
      "calories": 120,
      "protein": "6g",
      "carbs": "11g",
      "fat": "6g"
    },
    "allergens": ["dairy"],
    "branch": {
      "id": 16,
      "name": "Caffè Roma - Via del Corso"
    }
  }
}
```

### Response (Error - 404)

```json
{
  "success": false,
  "message": "Prodotto non trovato o non disponibile"
}
```

---

## 🏪 3. Get Available Branches

**Endpoint:** `GET /customer/branches`  
**Authentication:** Not required (public endpoint)

### Description
Retrieves all branches that accept online orders and have menu items available.

### Request

```bash
curl -X GET 'https://api.qofferun.com/api/v1/customer/branches'
```

### Response (Success - 200)

```json
{
  "success": true,
  "data": [
    {
      "id": 16,
      "name": "Caffè Roma - Via del Corso",
      "code": "CR001",
      "address": "Via del Corso 123, 00186 Roma (RM)",
      "phone": "+39 06 1234001",
      "email": "viacorso@cafferoma.it",
      "chain": {
        "id": 16,
        "name": "Caffè Roma",
        "logo": "chains/logos/chain_16_brand_logo_1763382072.png"
      },
      "services": {
        "delivery": true,
        "takeaway": true,
        "table_service": false
      },
      "coordinates": {
        "lat": "41.90280000",
        "lng": "12.49640000"
      },
      "accepting_orders": true,
      "ordering_hours": {
        "start": "08:00:00",
        "end": "20:00:00"
      }
    }
  ]
}
```

---

## 📱 Flutter Implementation Examples

### 1. Fetch Branch Menu

```dart
import 'package:dio/dio.dart';

class MenuService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'https://api.qofferun.com/api/v1',
  ));

  Future<Map<String, dynamic>> getBranchMenu(int branchId) async {
    try {
      final response = await _dio.get('/customer/branches/$branchId/menu');
      
      if (response.data['success']) {
        return response.data['data'];
      } else {
        throw Exception(response.data['message']);
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 422) {
        // Branch not accepting orders right now
        throw Exception(e.response?.data['message']);
      }
      rethrow;
    }
  }

  Future<MenuItem> getMenuItemDetails(int itemId) async {
    try {
      final response = await _dio.get('/customer/menu-items/$itemId');
      
      if (response.data['success']) {
        return MenuItem.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['message']);
      }
    } catch (e) {
      rethrow;
    }
  }
}
```

### 2. Menu Item Model

```dart
class MenuItem {
  final int id;
  final String name;
  final String description;
  final double price;
  final String category;
  final String? image;
  final bool customizable;
  final Map<String, CustomizationType> customizationOptions;
  final List<String> allergens;

  MenuItem({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.category,
    this.image,
    required this.customizable,
    required this.customizationOptions,
    required this.allergens,
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    Map<String, CustomizationType> options = {};
    
    if (json['customization_options'] != null) {
      (json['customization_options'] as Map<String, dynamic>).forEach((key, value) {
        options[key] = CustomizationType.fromJson(value);
      });
    }

    return MenuItem(
      id: json['id'],
      name: json['name'],
      description: json['description'] ?? '',
      price: double.parse(json['price_raw'].toString()),
      category: json['category'],
      image: json['image'],
      customizable: json['customizable'] ?? false,
      customizationOptions: options,
      allergens: List<String>.from(json['allergens'] ?? []),
    );
  }
}

class CustomizationType {
  final String label;
  final bool required;
  final Map<String, CustomizationOption> options;

  CustomizationType({
    required this.label,
    required this.required,
    required this.options,
  });

  factory CustomizationType.fromJson(Map<String, dynamic> json) {
    Map<String, CustomizationOption> opts = {};
    
    (json['options'] as Map<String, dynamic>).forEach((key, value) {
      opts[key] = CustomizationOption.fromJson(value);
    });

    return CustomizationType(
      label: json['label'],
      required: json['required'] ?? false,
      options: opts,
    );
  }
}

class CustomizationOption {
  final String label;
  final double price;

  CustomizationOption({
    required this.label,
    required this.price,
  });

  factory CustomizationOption.fromJson(Map<String, dynamic> json) {
    return CustomizationOption(
      label: json['label'],
      price: double.parse(json['price'].toString()),
    );
  }
}
```

### 3. Display Menu with Customization UI

```dart
class MenuItemCard extends StatelessWidget {
  final MenuItem item;
  final VoidCallback onTap;

  const MenuItemCard({
    required this.item,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: item.image != null
            ? CachedNetworkImage(
                imageUrl: item.image!,
                width: 60,
                height: 60,
                fit: BoxFit.cover,
                placeholder: (context, url) => CircularProgressIndicator(),
                errorWidget: (context, url, error) => Icon(Icons.restaurant),
              )
            : Icon(Icons.restaurant, size: 60),
        title: Text(item.name),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(item.description),
            SizedBox(height: 4),
            Text(
              '€${item.price.toStringAsFixed(2)}',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.green,
              ),
            ),
            if (item.customizable)
              Chip(
                label: Text('Personalizzabile'),
                backgroundColor: Colors.orange.shade100,
              ),
            if (item.allergens.isNotEmpty)
              Wrap(
                children: item.allergens.map((allergen) {
                  return Chip(
                    label: Text(allergen),
                    backgroundColor: Colors.red.shade100,
                  );
                }).toList(),
              ),
          ],
        ),
        trailing: Icon(Icons.arrow_forward_ios),
        onTap: onTap,
      ),
    );
  }
}
```

### 4. Customization Selection Screen

```dart
class CustomizationScreen extends StatefulWidget {
  final MenuItem item;

  const CustomizationScreen({required this.item});

  @override
  _CustomizationScreenState createState() => _CustomizationScreenState();
}

class _CustomizationScreenState extends State<CustomizationScreen> {
  Map<String, String> selectedOptions = {};
  double totalPrice = 0;

  @override
  void initState() {
    super.initState();
    totalPrice = widget.item.price;
  }

  void updateSelection(String typeKey, String optionKey, double price) {
    setState(() {
      // Remove previous selection for this type
      if (selectedOptions[typeKey] != null) {
        // Subtract old price
        final oldOption = widget.item.customizationOptions[typeKey]!
            .options[selectedOptions[typeKey]!]!;
        totalPrice -= oldOption.price;
      }
      
      // Add new selection
      selectedOptions[typeKey] = optionKey;
      totalPrice += price;
    });
  }

  bool canAddToCart() {
    // Check if all required options are selected
    for (var entry in widget.item.customizationOptions.entries) {
      if (entry.value.required && !selectedOptions.containsKey(entry.key)) {
        return false;
      }
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.item.name)),
      body: ListView(
        children: [
          // Item image and basic info
          if (widget.item.image != null)
            CachedNetworkImage(
              imageUrl: widget.item.image!,
              height: 200,
              fit: BoxFit.cover,
            ),
          
          Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.item.name,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                SizedBox(height: 8),
                Text(widget.item.description),
                SizedBox(height: 16),
                
                // Customization options
                ...widget.item.customizationOptions.entries.map((typeEntry) {
                  final typeKey = typeEntry.key;
                  final type = typeEntry.value;
                  
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            type.label,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (type.required)
                            Text(
                              ' *',
                              style: TextStyle(color: Colors.red),
                            ),
                        ],
                      ),
                      SizedBox(height: 8),
                      
                      ...type.options.entries.map((optionEntry) {
                        final optionKey = optionEntry.key;
                        final option = optionEntry.value;
                        final isSelected = selectedOptions[typeKey] == optionKey;
                        
                        return RadioListTile<String>(
                          title: Text(option.label),
                          subtitle: option.price > 0
                              ? Text('+€${option.price.toStringAsFixed(2)}')
                              : null,
                          value: optionKey,
                          groupValue: selectedOptions[typeKey],
                          onChanged: (value) {
                            updateSelection(typeKey, optionKey, option.price);
                          },
                        );
                      }).toList(),
                      
                      SizedBox(height: 16),
                    ],
                  );
                }).toList(),
              ],
            ),
          ),
        ],
      ),
      
      bottomNavigationBar: Container(
        padding: EdgeInsets.all(16),
        child: ElevatedButton(
          onPressed: canAddToCart() ? () {
            // Add to cart with selected customizations
            Navigator.pop(context, {
              'item': widget.item,
              'customizations': selectedOptions,
              'total_price': totalPrice,
            });
          } : null,
          child: Text('Aggiungi al carrello - €${totalPrice.toStringAsFixed(2)}'),
        ),
      ),
    );
  }
}
```

---

## 🔍 Important Notes

### Customization Options Structure

The `customization_options` field is a nested JSON object with the following structure:

```json
{
  "type_key": {                    // e.g., "size", "milk_type", "sugar"
    "label": "Display Name",       // What to show to user
    "required": true/false,        // Must user select this?
    "options": {
      "option_key": {              // e.g., "small", "medium", "large"
        "label": "Option Name",    // What to show for this option
        "price": 0.50              // Additional price (0 = free)
      }
    }
  }
}
```

### Price Calculation

To calculate the total price for a customized item:

1. Start with the base `price_raw`
2. Add the `price` of each selected customization option
3. Display final total to user

Example:
```dart
double calculateTotalPrice(MenuItem item, Map<String, String> selections) {
  double total = item.price;
  
  selections.forEach((typeKey, optionKey) {
    final option = item.customizationOptions[typeKey]!.options[optionKey]!;
    total += option.price;
  });
  
  return total;
}
```

### Validation

Before adding to cart, validate that:
- All **required** customization types have a selection
- Selected options exist in the item's customization options
- Branch is still accepting orders

### Image URLs

Menu item images may be `null` if no image is uploaded. Always handle null case with placeholder images.

---

## 🧪 Testing

Test the endpoints using these branch IDs:
- **Branch 16:** Caffè Roma - Via del Corso (has menu items)
- **Branch 18:** Caffè Roma - Ostia (has menu items)

```bash
# Get menu for branch 16
curl 'https://api.qofferun.com/api/v1/customer/branches/16/menu'

# Get specific item details (replace {itemId} with actual ID from menu)
curl 'https://api.qofferun.com/api/v1/customer/menu-items/{itemId}'

# Get all available branches
curl 'https://api.qofferun.com/api/v1/customer/branches'
```

---

## 📊 Response Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process data |
| 404 | Branch/Item not found | Show error message |
| 422 | Branch not accepting orders | Show ordering hours |
| 500 | Server error | Show generic error, retry |

---

## 🔄 Related Endpoints

After browsing menu items, users can:
1. Add items to cart: `POST /customer/cart/add`
2. View cart: `GET /customer/cart`
3. Create order: `POST /customer/orders` (requires authentication)

See **IMPORTANT-API-ENDPOINTS.md** for authentication endpoints.
