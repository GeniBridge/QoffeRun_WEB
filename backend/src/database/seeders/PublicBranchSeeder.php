<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Chain;
use App\Models\Branch;
use App\Models\Menu;
use App\Models\MenuItem;

class PublicBranchSeeder extends Seeder
{
    public function run(): void
    {
        // Create a test chain with logo
        $chain = Chain::create([
            'owner_id' => 2, // Using existing user ID
            'name' => 'Caffè Roma',
            'business_name' => 'Caffè Roma S.r.l.',
            'vat_number' => 'IT12345678901',
            'tax_code' => 'CFFRM12345678901',
            'phone' => '+39 06 12345678',
            'email' => 'info@cafferoma.it',
            'status' => 'active',
            'logo_path' => 'logos/caffe-roma-logo.png', // Will need to add actual logo
        ]);

        // Create test branches
        $branches = [
            [
                'name' => 'Caffè Roma - Via del Corso',
                'via' => 'Via del Corso',
                'numero_civico' => '123',
                'citta' => 'Roma',
                'provincia' => 'RM',
                'regione' => 'Lazio',
                'cap' => '00186',
                'paese' => 'Italia',
                'lat' => 41.9028,
                'lng' => 12.4964,
                'phone' => '+39 06 1234001',
            ],
            [
                'name' => 'Caffè Roma - Trastevere',
                'via' => 'Via di Trastevere',
                'numero_civico' => '45',
                'citta' => 'Roma',
                'provincia' => 'RM',
                'regione' => 'Lazio',
                'cap' => '00153',
                'paese' => 'Italia',
                'lat' => 41.8919,
                'lng' => 12.4688,
                'phone' => '+39 06 1234002',
            ],
            [
                'name' => 'Caffè Roma - Termini',
                'via' => 'Via Giovanni Giolitti',
                'numero_civico' => '34',
                'citta' => 'Roma',
                'provincia' => 'RM',
                'regione' => 'Lazio',
                'cap' => '00185',
                'paese' => 'Italia',
                'lat' => 41.9010,
                'lng' => 12.5013,
                'phone' => '+39 06 1234003',
            ],
        ];

        foreach ($branches as $i => $branchData) {
            $branch = Branch::create([
                'chain_id' => $chain->id,
                'code' => 'ROM' . str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                'name' => $branchData['name'],
                'address' => $branchData['via'] . ' ' . $branchData['numero_civico'] . ', ' . $branchData['cap'] . ' ' . $branchData['citta'],
                'via' => $branchData['via'],
                'numero_civico' => $branchData['numero_civico'],
                'citta' => $branchData['citta'],
                'provincia' => $branchData['provincia'],
                'regione' => $branchData['regione'],
                'cap' => $branchData['cap'],
                'paese' => $branchData['paese'],
                'lat' => $branchData['lat'],
                'lng' => $branchData['lng'],
                'city' => $branchData['citta'], // Legacy field
                'province' => $branchData['provincia'], // Legacy field
                'phone' => $branchData['phone'],
                'email' => 'roma' . ($i + 1) . '@cafferoma.it',
                'delivery_enabled' => true,
                'takeaway_enabled' => true,
                'table_service_enabled' => false,
                'stripe_account_id' => 'acct_test_' . uniqid(), // Test Stripe account
                'status' => 'active',
            ]);

            // Create a menu for each branch
            $menu = Menu::create([
                'branch_id' => $branch->id,
                'name' => 'Menu Principale',
                'description' => 'Il nostro menu completo con caffè, dolci e snack',
                'is_active' => true,
                'menu_type' => 'drinks',
            ]);

            // Create menu items (minimum 5 products required)
            $menuItems = [
                [
                    'name' => 'Espresso',
                    'description' => 'Classico caffè espresso italiano',
                    'price' => 1.20,
                    'category' => 'coffee',
                    'preparation_time' => 2,
                    'allergens' => [],
                    'customization_options' => [
                        'sugar' => [
                            'label' => 'Zucchero',
                            'required' => false,
                            'options' => [
                                'none' => ['label' => 'Senza zucchero', 'price' => 0],
                                'white' => ['label' => 'Zucchero bianco', 'price' => 0],
                                'brown' => ['label' => 'Zucchero di canna', 'price' => 0.10],
                            ]
                        ]
                    ],
                ],
                [
                    'name' => 'Cappuccino',
                    'description' => 'Espresso con latte montato e schiuma',
                    'price' => 2.50,
                    'category' => 'coffee',
                    'preparation_time' => 3,
                    'allergens' => ['dairy'],
                    'customization_options' => [
                        'size' => [
                            'label' => 'Dimensione',
                            'required' => true,
                            'options' => [
                                'regular' => ['label' => 'Normale', 'price' => 0],
                                'large' => ['label' => 'Grande', 'price' => 0.50],
                            ]
                        ],
                        'milk' => [
                            'label' => 'Tipo di latte',
                            'required' => false,
                            'options' => [
                                'whole' => ['label' => 'Latte intero', 'price' => 0],
                                'skim' => ['label' => 'Latte scremato', 'price' => 0],
                                'soy' => ['label' => 'Latte di soia', 'price' => 0.40],
                                'almond' => ['label' => 'Latte di mandorla', 'price' => 0.40],
                                'oat' => ['label' => 'Latte d\'avena', 'price' => 0.50],
                            ]
                        ]
                    ],
                ],
                [
                    'name' => 'Cornetto',
                    'description' => 'Cornetto italiano classico',
                    'price' => 1.80,
                    'category' => 'pastry',
                    'preparation_time' => 1,
                    'allergens' => ['gluten', 'eggs'],
                    'customization_options' => [
                        'filling' => [
                            'label' => 'Ripieno',
                            'required' => false,
                            'options' => [
                                'empty' => ['label' => 'Vuoto', 'price' => 0],
                                'jam' => ['label' => 'Marmellata', 'price' => 0.30],
                                'nutella' => ['label' => 'Nutella', 'price' => 0.50],
                                'cream' => ['label' => 'Crema', 'price' => 0.40],
                            ]
                        ]
                    ],
                ],
                [
                    'name' => 'Panino Prosciutto e Mozzarella',
                    'description' => 'Panino con prosciutto cotto e mozzarella fresca',
                    'price' => 4.50,
                    'category' => 'sandwich',
                    'preparation_time' => 5,
                    'allergens' => ['gluten', 'dairy'],
                    'customization_options' => [
                        'bread' => [
                            'label' => 'Tipo di pane',
                            'required' => true,
                            'options' => [
                                'white' => ['label' => 'Pane bianco', 'price' => 0],
                                'whole' => ['label' => 'Pane integrale', 'price' => 0.20],
                                'ciabatta' => ['label' => 'Ciabatta', 'price' => 0.30],
                            ]
                        ],
                        'extras' => [
                            'label' => 'Extra',
                            'required' => false,
                            'options' => [
                                'tomato' => ['label' => 'Pomodoro', 'price' => 0.30],
                                'salad' => ['label' => 'Insalata', 'price' => 0.20],
                                'mayo' => ['label' => 'Maionese', 'price' => 0.10],
                            ]
                        ]
                    ],
                ],
                [
                    'name' => 'Acqua Naturale',
                    'description' => 'Bottiglia d\'acqua naturale 500ml',
                    'price' => 1.00,
                    'category' => 'beverage',
                    'preparation_time' => 1,
                    'allergens' => [],
                    'customization_options' => [],
                ],
                [
                    'name' => 'Spremuta d\'Arancia',
                    'description' => 'Spremuta fresca di arance siciliane',
                    'price' => 3.50,
                    'category' => 'beverage',
                    'preparation_time' => 3,
                    'allergens' => [],
                    'customization_options' => [
                        'ice' => [
                            'label' => 'Ghiaccio',
                            'required' => false,
                            'options' => [
                                'no' => ['label' => 'Senza ghiaccio', 'price' => 0],
                                'yes' => ['label' => 'Con ghiaccio', 'price' => 0],
                            ]
                        ]
                    ],
                ],
                [
                    'name' => 'Tiramisù',
                    'description' => 'Tiramisù della casa fatto in giornata',
                    'price' => 4.00,
                    'category' => 'dessert',
                    'preparation_time' => 2,
                    'allergens' => ['eggs', 'dairy', 'gluten'],
                    'customization_options' => [],
                ],
            ];

            foreach ($menuItems as $itemData) {
                MenuItem::create([
                    'menu_id' => $menu->id,
                    'name' => $itemData['name'],
                    'description' => $itemData['description'],
                    'price' => $itemData['price'],
                    'category' => $itemData['category'],
                    'is_available' => true,
                    'preparation_time' => $itemData['preparation_time'],
                    'allergens' => $itemData['allergens'],
                    'customization_options' => $itemData['customization_options'],
                ]);
            }
        }

        $this->command->info('Created test chain "Caffè Roma" with 3 branches and 7 menu items each');
    }
}