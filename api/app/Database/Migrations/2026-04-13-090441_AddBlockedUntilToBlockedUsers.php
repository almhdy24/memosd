<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddBlockedUntilToBlockedUsers extends Migration
{
    public function up()
    {
        $this->forge->addColumn('blocked_users', [
            'blocked_until' => ['type' => 'DATETIME', 'null' => true, 'after' => 'created_at']
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('blocked_users', 'blocked_until');
    }
}
