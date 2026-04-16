<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateUserMessageLimitsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'user_id'       => ['type' => 'INT', 'unsigned' => true],
            'date'          => ['type' => 'DATE'],
            'message_count' => ['type' => 'INT', 'unsigned' => true, 'default' => 0],
        ]);
        $this->forge->addPrimaryKey(['user_id', 'date']);
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('user_message_limits');
    }

    public function down()
    {
        $this->forge->dropTable('user_message_limits');
    }
}
