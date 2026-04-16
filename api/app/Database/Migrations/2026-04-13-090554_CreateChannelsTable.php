<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateChannelsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'          => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'name'        => ['type' => 'VARCHAR', 'constraint' => 100],
            'description' => ['type' => 'TEXT', 'null' => true],
            'owner_id'    => ['type' => 'INT', 'unsigned' => true],
            'is_private'  => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
            'created_at'  => ['type' => 'DATETIME', 'null' => true],
            'updated_at'  => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('owner_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('channels');
    }

    public function down()
    {
        $this->forge->dropTable('channels');
    }
}
