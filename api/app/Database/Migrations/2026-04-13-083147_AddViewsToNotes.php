<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddViewsToNotes extends Migration
{
    public function up()
    {
        $this->forge->addColumn('notes', [
            'views' => [
                'type'       => 'INT',
                'unsigned'   => true,
                'default'    => 0,
                'null'       => false,
                'after'      => 'allow_comments'
            ]
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('notes', 'views');
    }
}
