<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateReportsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'          => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'reporter_id' => ['type' => 'INT', 'unsigned' => true],
            'target_type' => ['type' => 'VARCHAR', 'constraint' => 20], // 'user', 'note', 'message'
            'target_id'   => ['type' => 'INT', 'unsigned' => true],
            'reason'      => ['type' => 'VARCHAR', 'constraint' => 50],  // 'spam', 'harassment', 'inappropriate', etc.
            'description' => ['type' => 'TEXT', 'null' => true],
            'status'      => ['type' => 'VARCHAR', 'constraint' => 20, 'default' => 'pending'], // 'pending', 'resolved', 'dismissed'
            'created_at'  => ['type' => 'DATETIME', 'null' => true],
            'updated_at'  => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('reporter_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('reports');
    }

    public function down()
    {
        $this->forge->dropTable('reports');
    }
}
