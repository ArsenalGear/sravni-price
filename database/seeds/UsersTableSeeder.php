<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use TCG\Voyager\Models\Role;
use TCG\Voyager\Models\User;

class UsersTableSeeder extends Seeder
{
    /**
     * Auto generated seed file.
     *
     * @return void
     */
    public function run()
    {
        //Перед выполнением данного seeder'а необходимо создать роли, выполнив RolesTableSeeder

        if (User::count() == 0) {
            //Логин разработчика (должны быть назначены все права)
            $developerRoleId = Role::where('name', 'developer')->firstOrFail();

            User::create([
                'name'           => 'Разработчик',
                'email'          => 'developer@admin.adm',
                'password'       => bcrypt('admin123'),
                'remember_token' => Str::random(60),
                'role_id'        => $developerRoleId->id,
                'locale'       => 'ru'
            ]);

            //Логин администратора (не должно быть доступа к редактированию баз данных, отношений и прочего)
            $adminRoleId = Role::where('name', 'admin')->firstOrFail();
            User::create([
                'name'           => 'Администратор',
                'email'          => 'administrator@admin.adm',
                'password'       => bcrypt('admin123'),
                'remember_token' => Str::random(60),
                'role_id'        => $adminRoleId->id,
                'locale'       => 'ru'
            ]);
        }
    }
}
