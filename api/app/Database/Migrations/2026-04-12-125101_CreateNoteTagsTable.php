<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateNoteTagsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'note_id' => ['type' => 'INT', 'unsigned' => true],
            'tag_id' => ['type' => 'INT', 'unsigned' => true],
        ]);
        $this->forge->addKey(['note_id', 'tag_id'], true);
        $this->forge->addForeignKey('note_id', 'notes', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('tag_id', 'tags', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('note_tags');
    }

    public function down()
    {
        $this->forge->dropTable('note_tags');
    }
}