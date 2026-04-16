<?php namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class SudaneseMegaSeeder extends Seeder
{
    public function run()
    {
        $faker = \Faker\Factory::create();
        $db = \Config\Database::connect();
        
        // 100 Sudanese names (first + last)
        $firstNames = ['Mohamed', 'Ahmed', 'Fatima', 'Amira', 'Khalid', 'Omer', 'Hiba', 'Yousif', 'Samar', 'Tariq', 'Rania', 'Bakri', 'Nadia', 'Osman', 'Hassan', 'Mona', 'Sara', 'Ali', 'Zeinab', 'Ibrahim', 'Aisha', 'Mustafa', 'Huda', 'Talal', 'Layla', 'Adam', 'Noor', 'Hatim', 'Safia', 'Waleed', 'Mariam', 'Musa', 'Rasha', 'Bilal', 'Salma', 'Yassin', 'Asma', 'Faisal', 'Nada', 'Zain', 'Rayan', 'Hana', 'Jamal', 'Sana', 'Majid', 'Amani', 'Kamal', 'Eman', 'Fathi', 'Nawal'];
        $lastNames = ['Abdalla', 'Omer', 'Ali', 'Hassan', 'Ahmed', 'Yousif', 'Ibrahim', 'Musa', 'Osman', 'Fadul', 'Idris', 'Babiker', 'Salih', 'Nur', 'Taha', 'Suliman', 'Khalifa', 'Mahmoud', 'Elfadil', 'Elamin', 'Elbashir', 'Elnour', 'Elsadig', 'Eltayeb', 'Elzein'];

        // Helper to pick random
        $randomName = fn() => $faker->randomElement($firstNames) . ' ' . $faker->randomElement($lastNames);
        $randomEmail = fn($name) => strtolower(str_replace(' ', '.', $name)) . rand(10,99) . '@' . $faker->randomElement(['gmail.com', 'yahoo.com', 'hotmail.com', 'sudanmail.sd']);

        // Sudanese cities / universities for bio
        $cities = ['Khartoum', 'Omdurman', 'Bahri', 'Port Sudan', 'Wad Madani', 'Nyala', 'El Fasher', 'Kassala', 'El Obeid', 'Gedaref'];
        $universities = ['University of Khartoum', 'Sudan University of Science and Technology', 'Ahfad University', 'International University of Africa', 'Omdurman Islamic University', 'Al-Neelain University', 'Red Sea University', 'Gezira University'];
        $subjects = ['Medicine', 'Engineering', 'Computer Science', 'Pharmacy', 'Dentistry', 'Law', 'Economics', 'Arabic Literature', 'Islamic Studies', 'Physics'];

        // Emoji sets
        $emojis = ['😊', '🙂', '📚', '✍️', '💡', '🔥', '👍', '❤️', '🙏', '🌍', '🇸🇩', '📝', '🎓', '🏥', '💻', '🕌', '🌴', '☕', '📱', '✨'];

        echo "Creating 100 Sudanese users...\n";
        
        $users = [];
        $userIds = [];
        for ($i = 1; $i <= 100; $i++) {
            $name = $randomName();
            $email = $randomEmail($name);
            $password = password_hash('123456', PASSWORD_DEFAULT);
            $city = $faker->randomElement($cities);
            $uni = $faker->randomElement($universities);
            $subject = $faker->randomElement($subjects);
            $bio = "📚 Student at $uni, $city. Studying $subject. " . $faker->randomElement(['Love sharing knowledge.', 'Passionate about learning.', 'Always ready to help.']) . ' ' . $faker->randomElement($emojis) . ' ' . $faker->randomElement($emojis);
            $allow_follow = rand(0,10) > 1 ? 1 : 0;
            $avatar = null; // no avatar, use initials
            
            $db->table('users')->insert([
                'name' => $name,
                'email' => $email,
                'password' => $password,
                'bio' => $bio,
                'allow_follow' => $allow_follow,
                'created_at' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 90) . ' days'))
            ]);
            $userId = $db->insertID();
            $users[] = ['id' => $userId, 'name' => $name];
            $userIds[] = $userId;
            if ($i % 20 == 0) echo "Created $i users...\n";
        }

        echo "Creating follows...\n";
        // Each user follows 5-20 random users
        foreach ($userIds as $followerId) {
            $followCount = rand(5, 20);
            $followed = $faker->randomElements($userIds, $followCount);
            foreach ($followed as $followedId) {
                if ($followerId == $followedId) continue;
                $db->table('follows')->ignore(true)->insert([
                    'follower_id' => $followerId,
                    'followed_id' => $followedId,
                    'created_at' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 60) . ' days'))
                ]);
            }
        }

        echo "Creating tags...\n";
        $tagNames = ['anatomy', 'physiology', 'cardio', 'neuro', 'msk', 'pharma', 'surgery', 'pediatrics', 'obgyn', 'radiology', 
                     'programming', 'javascript', 'python', 'react', 'php', 'database', 'algorithms', 'webdev', 'mobile', 'AI',
                     'physics', 'mechanics', 'electricity', 'optics', 'thermodynamics', 'quantum',
                     'history', 'sudan', 'africa', 'culture', 'arabic', 'islam', 'quran', 'hadith', 'fiqh',
                     'math', 'calculus', 'algebra', 'statistics', 'linear',
                     'chemistry', 'organic', 'biochem', 'analytical',
                     'english', 'literature', 'grammar', 'vocabulary',
                     'general', 'tips', 'notes', 'study', 'exams'];
        $tagIds = [];
        foreach ($tagNames as $tagName) {
            $db->table('tags')->insert(['name' => $tagName, 'user_id' => $faker->randomElement($userIds)]);
            $tagIds[$tagName] = $db->insertID();
        }

        echo "Creating notes (2-8 per user)...\n";
        $noteIds = [];
        $noteTitles = [
            '📝 ' . $faker->randomElement(['Heart Anatomy', 'JavaScript Closures', 'Newton\'s Laws', 'Antibiotics Overview', 'Oral Pathology', 'Derivatives Cheat Sheet', 'Cell Organelles', 'Sudan Independence', 'Ohm\'s Law', 'Arabic Grammar']),
            '🔥 ' . $faker->randomElement(['Upper Limb Nerves', 'React Hooks', 'Thermodynamics Basics', 'Common Cold Treatment', 'Dental Caries', 'Integration Techniques', 'African History', 'Circuit Analysis', 'Poetry Analysis', 'Islamic Golden Age']),
            '💡 ' . $faker->randomElement(['Cranial Nerves Mnemonic', 'Python List Comprehensions', 'Projectile Motion', 'Antibiotic Resistance', 'Periodontal Disease', 'Matrix Multiplication', 'Nubian Kingdoms', 'Signal Processing', 'Shakespeare Sonnets', 'Sufism']),
        ];
        foreach ($users as $user) {
            $noteCount = rand(2, 8);
            for ($j = 0; $j < $noteCount; $j++) {
                $title = $faker->randomElement($noteTitles) . ' ' . $faker->randomElement($emojis);
                $content = $this->generateNoteContent($faker, $emojis);
                $isPublic = rand(0,10) > 2 ? 1 : 0;
                $allowLikes = rand(0,10) > 1 ? 1 : 0;
                $allowComments = rand(0,10) > 1 ? 1 : 0;
                $db->table('notes')->insert([
                    'user_id' => $user['id'],
                    'title' => $title,
                    'content' => $content,
                    'category' => $faker->randomElement(['study', 'programming', 'personal', '']),
                    'is_public' => $isPublic,
                    'allow_likes' => $allowLikes,
                    'allow_comments' => $allowComments,
                    'created_at' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 180) . ' days')),
                    'updated_at' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 30) . ' days'))
                ]);
                $noteId = $db->insertID();
                $noteIds[] = $noteId;
                
                // attach 1-3 random tags
                $tagsForNote = $faker->randomElements($tagNames, rand(1,3));
                foreach ($tagsForNote as $tn) {
                    $db->table('note_tags')->insert(['note_id' => $noteId, 'tag_id' => $tagIds[$tn]]);
                }
            }
        }

        echo "Creating likes...\n";
        foreach ($noteIds as $noteId) {
            $likeCount = rand(0, 25);
            $likers = $faker->randomElements($userIds, $likeCount);
            foreach ($likers as $likerId) {
                $db->table('likes')->ignore(true)->insert([
                    'note_id' => $noteId,
                    'user_id' => $likerId,
                    'created_at' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 30) . ' days'))
                ]);
            }
        }

        echo "Creating comments...\n";
        $commentBodies = [
            'Great note! 👍', 'Very helpful, thanks! 🙏', 'I have a question about this... 🤔', 
            'Excellent explanation! 📚', 'Could you elaborate more? ✍️', 'This saved my exam! 🎓',
            'جزاك الله خيراً', 'ما شاء الله', 'ممتاز', 'شرح وافي', 'Thank you from Sudan 🇸🇩',
            'I love this! ❤️', 'Keep it up! 💪', 'Very clear, thank you 😊'
        ];
        foreach ($noteIds as $noteId) {
            $commentCount = rand(0, 8);
            $commenters = $faker->randomElements($userIds, $commentCount);
            foreach ($commenters as $commenterId) {
                $db->table('comments')->insert([
                    'note_id' => $noteId,
                    'user_id' => $commenterId,
                    'content' => $faker->randomElement($commentBodies) . ' ' . $faker->randomElement($emojis),
                    'created_at' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 20) . ' days'))
                ]);
            }
        }

        echo "Creating conversations and messages...\n";
        $convCount = rand(200, 400);
        for ($i = 0; $i < $convCount; $i++) {
            $u1 = $faker->randomElement($userIds);
            $u2 = $faker->randomElement($userIds);
            if ($u1 == $u2) continue;
            $uA = min($u1, $u2);
            $uB = max($u1, $u2);
            $db->table('conversations')->ignore(true)->insert([
                'user_one' => $uA,
                'user_two' => $uB,
                'created_at' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 90) . ' days')),
                'updated_at' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 10) . ' days'))
            ]);
            $convId = $db->insertID();
            if (!$convId) continue;
            $msgCount = rand(1, 15);
            for ($j = 0; $j < $msgCount; $j++) {
                $sender = rand(0,1) ? $uA : $uB;
                $db->table('messages')->insert([
                    'conversation_id' => $convId,
                    'sender_id' => $sender,
                    'content' => $this->generateMessageContent($faker, $emojis),
                    'read' => rand(0,1),
                    'created_at' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 60) . ' days'))
                ]);
            }
        }

        echo "Creating notifications...\n";
        $notifCount = rand(500, 1000);
        for ($i = 0; $i < $notifCount; $i++) {
            $recipientId = $faker->randomElement($userIds);
            $actorId = $faker->randomElement($userIds);
            if ($recipientId == $actorId) continue;
            $type = $faker->randomElement(['like', 'comment', 'follow']);
            $noteId = ($type != 'follow') ? $faker->randomElement($noteIds) : null;
            $db->table('notifications')->insert([
                'user_id' => $recipientId,
                'type' => $type,
                'actor_id' => $actorId,
                'note_id' => $noteId,
                'read' => rand(0,10) > 3 ? 1 : 0,
                'created_at' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 30) . ' days'))
            ]);
        }

        echo "✅ Seeded 100 Sudanese users with full social data!\n";
    }

    private function generateNoteContent($faker, $emojis) {
        $paragraphs = rand(1,3);
        $content = '';
        for ($i=0; $i<$paragraphs; $i++) {
            $content .= $faker->paragraph(rand(2,5)) . "\n\n";
        }
        $content .= ' ' . $faker->randomElement($emojis) . ' ' . $faker->randomElement($emojis);
        return trim($content);
    }

    private function generateMessageContent($faker, $emojis) {
        $messages = [
            'Salam! How are you?', 'Did you see the new notes?', 'Can you share your notes on ' . $faker->word . '?',
            'Thanks! 🙏', 'See you at the library? 📚', 'Good luck with exams! 🎓',
            'I sent you the link.', 'Check this out!', 'LOL 😂', 'ما شاء الله',
            'Where are you from?', 'Khartoum?', 'I\'m from Omdurman', 'Nice to meet you!',
            'Let\'s study together sometime.', 'Do you have notes for ' . $faker->word . '?',
            'Yes, I will share them.', 'Thank you so much!', 'You\'re welcome 😊'
        ];
        return $faker->randomElement($messages) . ' ' . $faker->randomElement($emojis);
    }
}
