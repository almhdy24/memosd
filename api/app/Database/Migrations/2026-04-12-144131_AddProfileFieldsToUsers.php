<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddProfileFieldsToUsers extends Migration
{
    public function up()
    {
        $this->forge->addColumn('users', [
            'bio' => [
                'type'       => 'TEXT',
                'null'       => true,
                'after'      => 'email'
            ],
            'avatar' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
                'after'      => 'bio'
            ],
            'allow_follow' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 1,
                'null'       => false,
                'after'      => 'avatar'
            ]
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('users', 'bio');
        $this->forge->dropColumn('users', 'avatar');
        $this->forge->dropColumn('users', 'allow_follow');
    }
}
