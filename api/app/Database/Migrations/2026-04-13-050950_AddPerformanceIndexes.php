<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddPerformanceIndexes extends Migration
{
    public function up()
    {
        // Notes indexes
        $this->forge->addKey('user_id', false, true, 'idx_notes_user_id');
        $this->forge->addKey('is_public', false, true, 'idx_notes_is_public');
        $this->forge->addKey('updated_at', false, true, 'idx_notes_updated_at');
        
        // Follows indexes
        $this->forge->addKey('follower_id', false, true, 'idx_follows_follower_id');
        $this->forge->addKey('followed_id', false, true, 'idx_follows_followed_id');
        
        // Likes indexes
        $this->forge->addKey('note_id', false, true, 'idx_likes_note_id');
        $this->forge->addKey('user_id', false, true, 'idx_likes_user_id');
        
        // Comments indexes
        $this->forge->addKey('note_id', false, true, 'idx_comments_note_id');
        $this->forge->addKey('user_id', false, true, 'idx_comments_user_id');
        
        // Notifications indexes
        $this->forge->addKey('user_id', false, true, 'idx_notifications_user_id');
        $this->forge->addKey('read', false, true, 'idx_notifications_read');
        
        // Messages indexes
        $this->forge->addKey('conversation_id', false, true, 'idx_messages_conversation_id');
        $this->forge->addKey('sender_id', false, true, 'idx_messages_sender_id');
    }

    public function down()
    {
        // No need to drop indexes explicitly in SQLite
    }
}
