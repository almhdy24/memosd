<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateLikesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'note_id'    => ['type' => 'INT', 'unsigned' => true],
            'user_id'    => ['type' => 'INT', 'unsigned' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true]
        ]);
        $this->forge->addPrimaryKey(['note_id', 'user_id']);
        $this->forge->addForeignKey('note_id', 'notes', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('likes');
    }

    public function down()
    {
        $this->forge->dropTable('likes');
    }
}
