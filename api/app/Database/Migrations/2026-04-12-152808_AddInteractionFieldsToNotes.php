<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddInteractionFieldsToNotes extends Migration
{
    public function up()
    {
        $this->forge->addColumn('notes', [
            'allow_likes' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 1,
                'null'       => false,
                'after'      => 'is_public'
            ],
            'allow_comments' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 1,
                'null'       => false,
                'after'      => 'allow_likes'
            ]
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('notes', 'allow_likes');
        $this->forge->dropColumn('notes', 'allow_comments');
    }
}
