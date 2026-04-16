<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateChannelMembersTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'channel_id' => ['type' => 'INT', 'unsigned' => true],
            'user_id'    => ['type' => 'INT', 'unsigned' => true],
            'role'       => ['type' => 'VARCHAR', 'constraint' => 20, 'default' => 'member'], // 'admin', 'member'
            'joined_at'  => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addPrimaryKey(['channel_id', 'user_id']);
        $this->forge->addForeignKey('channel_id', 'channels', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('channel_members');
    }

    public function down()
    {
        $this->forge->dropTable('channel_members');
    }
}
