<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateFollowsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'follower_id' => ['type' => 'INT', 'unsigned' => true],
            'followed_id' => ['type' => 'INT', 'unsigned' => true],
            'created_at'  => ['type' => 'DATETIME', 'null' => true]
        ]);
        $this->forge->addPrimaryKey(['follower_id', 'followed_id']);
        $this->forge->addForeignKey('follower_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('followed_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('follows');
    }

    public function down()
    {
        $this->forge->dropTable('follows');
    }
}
