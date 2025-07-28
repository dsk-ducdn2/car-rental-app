import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Danh sách các kích thước icon cần tạo
const iconSizes = [
  16, 32, 72, 96, 128, 144, 152, 192, 384, 512
];

// Tạo các icon placeholder (trong thực tế bạn sẽ cần một thư viện như sharp để resize)
const generateIcons = () => {
  const iconsDir = path.join(__dirname, '../public/icons');
  
  // Đảm bảo thư mục tồn tại
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Tạo các icon với kích thước khác nhau
  iconSizes.forEach(size => {
    const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    // Nếu file chưa tồn tại, copy từ icon-192x192.png
    if (!fs.existsSync(iconPath) && size !== 192 && size !== 512) {
      const sourcePath = path.join(iconsDir, 'icon-192x192.png');
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, iconPath);
        console.log(`Created icon-${size}x${size}.png`);
      }
    }
  });

  console.log('Icon generation completed!');
  console.log('Note: In production, you should use a proper image processing library like sharp to resize icons.');
};

generateIcons(); 