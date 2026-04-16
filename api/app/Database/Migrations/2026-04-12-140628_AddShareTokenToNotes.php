<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddShareTokenToNotes extends Migration
{
    public function up()
    {
        // SQLite workaround: add column without UNIQUE, then create index
        $this->forge->addColumn('notes', [
            'share_token' => [
                'type'       => 'VARCHAR',
                'constraint' => 64,
                'null'       => true,
                'after'      => 'category'
            ]
        ]);
        
        // Create a unique index separately (works in SQLite)
        $this->db->query('CREATE UNIQUE INDEX IF NOT EXISTS idx_notes_share_token ON notes(share_token) WHERE share_token IS NOT NULL');
    }

    public function down()
    {
        $this->db->query('DROP INDEX IF EXISTS idx_notes_share_token');
        $this->forge->dropColumn('notes', 'share_token');
    }
}
