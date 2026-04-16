<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateChannelMessagesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'channel_id' => ['type' => 'INT', 'unsigned' => true],
            'sender_id' => ['type' => 'INT', 'unsigned' => true],
            'content' => ['type' => 'TEXT'],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('channel_id', 'channels', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('sender_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('channel_messages');
    }

    public function down()
    {
        $this->forge->dropTable('channel_messages');
    }
}
