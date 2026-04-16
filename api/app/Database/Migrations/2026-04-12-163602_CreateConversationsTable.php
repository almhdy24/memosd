<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateConversationsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'user_one' => ['type' => 'INT', 'unsigned' => true],
            'user_two' => ['type' => 'INT', 'unsigned' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true]
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('user_one', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('user_two', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('conversations');
    }

    public function down()
    {
        $this->forge->dropTable('conversations');
    }
}
