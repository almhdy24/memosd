<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateNotificationsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'         => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'user_id'    => ['type' => 'INT', 'unsigned' => true], // recipient
            'type'       => ['type' => 'VARCHAR', 'constraint' => 20], // 'like', 'comment', 'follow'
            'actor_id'   => ['type' => 'INT', 'unsigned' => true], // who triggered
            'note_id'    => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'comment_id' => ['type' => 'INT', 'unsigned' => true, 'null' => true],
            'read'       => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
            'created_at' => ['type' => 'DATETIME', 'null' => true]
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('actor_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('note_id', 'notes', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('comment_id', 'comments', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('notifications');
    }

    public function down()
    {
        $this->forge->dropTable('notifications');
    }
}
