<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateMessagesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'conversation_id' => ['type' => 'INT', 'unsigned' => true],
            'sender_id' => ['type' => 'INT', 'unsigned' => true],
            'content' => ['type' => 'TEXT', 'null' => false],
            'read' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
            'created_at' => ['type' => 'DATETIME', 'null' => true]
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('conversation_id', 'conversations', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('sender_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('messages');
    }

    public function down()
    {
        $this->forge->dropTable('messages');
    }
}
