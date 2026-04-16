<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddIsPublicToNotes extends Migration
{
    public function up()
    {
        $this->forge->addColumn('notes', [
            'is_public' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 0,
                'null'       => false,
                'after'      => 'share_token'
            ]
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('notes', 'is_public');
    }
}
