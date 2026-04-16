<?php namespace App\Controllers;

use App\Models\UserModel;
use CodeIgniter\Files\File;

class UploadController extends BaseApiController
{
    public function avatar()
    {
        $userId = $this->getUserId();
        $file = $this->request->getFile('avatar');
        
        // Check if file was uploaded
        if (!$file || !$file->isValid() || $file->hasMoved()) {
            return $this->errorResponse('No file uploaded or upload failed', [], 400);
        }

        // Validate file
        $validationRule = [
            'avatar' => [
                'label' => 'Avatar',
                'rules' => [
                    'uploaded[avatar]',
                    'is_image[avatar]',
                    'max_size[avatar,5120]',        // 5MB (in KB)
                    'mime_in[avatar,image/jpg,image/jpeg,image/png,image/webp]',
                    'max_dims[avatar,4096,4096]',    // Max dimensions 4096x4096
                ]
            ]
        ];

        if (!$this->validate($validationRule)) {
            $errors = $this->validator->getErrors();
            return $this->errorResponse('Validation failed', $errors, 400);
        }

        try {
            // Generate secure filename
            $extension = $file->getExtension();
            $newName = $userId . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
            
            // Define upload path (outside public for security, then symlink or serve via controller)
            $uploadPath = WRITEPATH . 'uploads/avatars/';
            if (!is_dir($uploadPath)) {
                mkdir($uploadPath, 0755, true);
            }

            // Move file
            $file->move($uploadPath, $newName);
            
            // Optional: Create image thumbnail / optimize (if GD available)
            $this->optimizeImage($uploadPath . $newName);
            
            // Generate URL (serve via public symlink or controller route)
            $avatarUrl = base_url('uploads/avatars/' . $newName);
            
            // Ensure public symlink exists
            $publicLink = FCPATH . 'uploads/avatars';
            if (!is_dir($publicLink)) {
                symlink($uploadPath, $publicLink);
            }

            // Update user avatar in database
            $userModel = new UserModel();
            $userModel->update($userId, ['avatar' => $avatarUrl]);

            return $this->successResponse(['avatar' => $avatarUrl], 'Avatar uploaded successfully');

        } catch (\Exception $e) {
            log_message('error', 'Avatar upload failed: ' . $e->getMessage());
            return $this->errorResponse('Upload failed: ' . $e->getMessage(), [], 500);
        }
    }

    /**
     * Optimize image if GD extension is available.
     */
    private function optimizeImage(string $filePath): void
    {
        if (!extension_loaded('gd')) {
            return;
        }

        $info = getimagesize($filePath);
        if (!$info) return;

        $mime = $info['mime'];
        $width = $info[0];
        $height = $info[1];

        // Resize if larger than 1024px (maintain aspect ratio)
        $maxDim = 1024;
        if ($width <= $maxDim && $height <= $maxDim) {
            return;
        }

        $ratio = $width / $height;
        if ($width > $height) {
            $newWidth = $maxDim;
            $newHeight = (int) ($maxDim / $ratio);
        } else {
            $newHeight = $maxDim;
            $newWidth = (int) ($maxDim * $ratio);
        }

        $src = match ($mime) {
            'image/jpeg' => imagecreatefromjpeg($filePath),
            'image/png'  => imagecreatefrompng($filePath),
            'image/webp' => imagecreatefromwebp($filePath),
            default      => null
        };

        if (!$src) return;

        $dst = imagecreatetruecolor($newWidth, $newHeight);
        
        // Preserve transparency for PNG/WebP
        if ($mime === 'image/png' || $mime === 'image/webp') {
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
            $transparent = imagecolorallocatealpha($dst, 255, 255, 255, 127);
            imagefilledrectangle($dst, 0, 0, $newWidth, $newHeight, $transparent);
        }

        imagecopyresampled($dst, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        // Save optimized image
        match ($mime) {
            'image/jpeg' => imagejpeg($dst, $filePath, 85),
            'image/png'  => imagepng($dst, $filePath, 8),
            'image/webp' => imagewebp($dst, $filePath, 85),
            default      => null
        };

        imagedestroy($src);
        imagedestroy($dst);
    }
}
