<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateBlockedUsersTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'blocker_id' => ['type' => 'INT', 'unsigned' => true],
            'blocked_id' => ['type' => 'INT', 'unsigned' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true]
        ]);
        $this->forge->addPrimaryKey(['blocker_id', 'blocked_id']);
        $this->forge->addForeignKey('blocker_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('blocked_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('blocked_users');
    }

    public function down()
    {
        $this->forge->dropTable('blocked_users');
    }
}
