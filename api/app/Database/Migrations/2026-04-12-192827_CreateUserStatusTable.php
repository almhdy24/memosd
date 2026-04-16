<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateUserStatusTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'user_id'    => ['type' => 'INT', 'unsigned' => true],
            'is_online'  => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
            'last_seen'  => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true]
        ]);
        $this->forge->addPrimaryKey('user_id');
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('user_status');
    }

    public function down()
    {
        $this->forge->dropTable('user_status');
    }
}
