<?php

use Illuminate\Database\Seeder;

class CitiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('regions')->insert([
            [ 'id' => 1, 'name' => 'Москва', 'created_at' => date("Y-m-d H:i:s"), 'updated_at' => date("Y-m-d H:i:s")],
        ]);

        DB::table('cities')->insert([
            [ 'id' => 1, 'name_first_form' => 'Москва', 'name_second_form' => 'Москве', 'slug' => 'moskow', 'region_id' => 1, 'created_at' => date("Y-m-d H:i:s"), 'updated_at' => date("Y-m-d H:i:s")],
        ]);
    }
}
