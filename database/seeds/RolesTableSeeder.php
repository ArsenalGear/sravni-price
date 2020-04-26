<?php

use Illuminate\Database\Seeder;
use TCG\Voyager\Models\Role;

class RolesTableSeeder extends Seeder
{
    /**
     * Auto generated seed file.
     */
    public function run()
    {

        //Разработчик должен обладать всеми правами
        $role = Role::firstOrNew(['name' => 'developer']);
        if (!$role->exists) {
            $role->fill([
                'display_name' => "Разработчик",
            ])->save();
        }

        //Администратор не должен иметь доступа к редактированию базы данных, отношений и др.
        $role = Role::firstOrNew(['name' => 'admin']);
        if (!$role->exists) {
            $role->fill([
                    'display_name' => "Администратор",
                ])->save();
        }

    }
}
