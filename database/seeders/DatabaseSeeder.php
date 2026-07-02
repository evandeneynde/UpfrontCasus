<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->admin()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);

        User::factory()->create([
            'name' => 'Untrained User',
            'email' => 'untrained@example.com',
        ]);

        User::factory()->trained()->create([
            'name' => 'Trained User',
            'email' => 'trained@example.com',
        ]);

        $this->seedProducts();
        $this->call(TrainingStepSeeder::class);
        $this->call(ProductionRunSeeder::class);
    }

    /**
     * Seed a couple of sample product types with their recipes.
     */
    private function seedProducts(): void
    {
        $recipes = [
            'Eiwit Oats Appel Kaneel' => [
                'bag_weight_kg' => 1.0,
                'ingredients' => [
                    'Havervlokken' => 420,
                    'Wei-eiwit concentraat (melk)' => 170,
                    'Melkpoeder' => 100,
                    'Havermeel' => 70,
                    'Lijnzaad' => 50,
                    'Chiazaad' => 50,
                    'Ruwe rietsuiker' => 40,
                    'Gedroogde appel' => 40,
                    'Kokosmelkpoeder' => 30,
                    'Rozijnen' => 20,
                    'Natuurlijk aroma' => 4,
                    'Kaneel' => 4,
                    'Zeezout' => 2,
                    'Vanilline' => 1,
                ],
            ],
            'Whey Milkshake Chocolade' => [
                'bag_weight_kg' => 1,
                'ingredients' => [
                    'Wei-eiwit concentraat (melk)' => 890,
                    'Cacaopoeder' => 50,
                    'Natuurlijk cacao aroma' => 15,
                    'Zonnebloemlecithine' => 15,
                    'Natuurlijke vanille aroma' => 10,
                    'Sucralose' => 10,
                    'Xanthaangom' => 5,
                    'Vanilline' => 5,
                ],
            ],
        ];

        foreach ($recipes as $name => $recipe) {
            $product = Product::create([
                'name' => $name,
                'bag_weight_kg' => $recipe['bag_weight_kg'],
                'is_active' => true,
            ]);

            $sortOrder = 0;

            foreach ($recipe['ingredients'] as $ingredientName => $gramsPerBag) {
                $product->ingredients()->create([
                    'name' => $ingredientName,
                    'grams_per_bag' => $gramsPerBag,
                    'sort_order' => $sortOrder++,
                ]);
            }
        }
    }
}
