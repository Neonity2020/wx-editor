import { databaseService } from './database';
import type { CachedImage } from './database';

export interface PicGoConfig {
  server: string;
  token?: string;
  [key: string]: unknown;
}

export class ImageUploadService {
  private config: PicGoConfig;
  private dbService: typeof databaseService;

  constructor(config: PicGoConfig, dbService: typeof databaseService) {
    this.config = config;
    this.dbService = dbService;
  }

  async uploadImage(file: File): Promise<string> {
    try {
      console.log('开始上传图片:', file.name, file.size, file.type);
      console.log('PicGo服务器地址:', this.config.server);
      
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${this.config.server}/upload`, {
        method: 'POST',
        headers: {
          ...(this.config.token && { 'Authorization': `Bearer ${this.config.token}` }),
        },
        body: formData,
      });

      console.log('PicGo响应状态:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PicGo响应错误:', errorText);
        
        // 如果PicGo不可用，使用本地base64存储作为备用方案
        console.log('PicGo不可用，使用本地base64存储');
        return await this.uploadToLocal(file);
      }

      const result = await response.json();
      console.log('PicGo响应结果:', result);
      
      if (result.success && result.data && result.data.length > 0) {
        const url = result.data[0].url;
        console.log('获取到图片URL:', url);
        
        // 缓存图片到IndexedDB
        await this.cacheImageToDB(file, url);
        
        return url;
      } else {
        console.error('PicGo响应格式错误:', result);
        console.log('PicGo响应格式错误，使用本地base64存储');
        return await this.uploadToLocal(file);
      }
    } catch (error) {
      console.error('图片上传错误:', error);
      
      // 如果网络错误，使用本地base64存储作为备用方案
      console.log('网络错误，使用本地base64存储');
      try {
        const localUrl = await this.uploadToLocal(file);
        console.log('本地存储成功，URL:', localUrl.substring(0, 50) + '...');
        return localUrl;
      } catch (localError) {
        console.error('本地存储也失败:', localError);
        throw new Error(`图片上传失败: ${error instanceof Error ? error.message : '网络错误'}`);
      }
    }
  }

  // 本地base64存储备用方案
  private async uploadToLocal(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        console.log('开始处理本地图片:', file.name, file.size, file.type);
        
        // 如果图片太大，先压缩
        if (file.size > 1024 * 1024) { // 大于1MB
          console.log('图片较大，进行压缩处理');
          this.compressImage(file)
            .then(compressedBlob => {
              const compressedFile = new File([compressedBlob], file.name, { type: compressedBlob.type });
              this.convertToBase64(compressedFile).then(resolve).catch(reject);
            })
            .catch(reject);
        } else {
          this.convertToBase64(file).then(resolve).catch(reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  // 压缩图片
  private async compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // 计算压缩后的尺寸，保持宽高比
          const maxWidth = 1200;
          const maxHeight = 1200;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // 绘制压缩后的图片
          ctx?.drawImage(img, 0, 0, width, height);
          
          // 转换为blob，使用0.8的质量
          canvas.toBlob(
            (blob) => {
              if (blob) {
                console.log('图片压缩完成:', {
                  originalSize: file.size,
                  compressedSize: blob.size,
                  compressionRatio: ((file.size - blob.size) / file.size * 100).toFixed(1) + '%'
                });
                resolve(blob);
              } else {
                reject(new Error('图片压缩失败'));
              }
            },
            'image/jpeg',
            0.8
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = URL.createObjectURL(file);
    });
  }

  // 转换为base64
  private async convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string;
          console.log('生成本地base64 URL，大小:', (base64.length / 1024).toFixed(1) + 'KB');
          
          // 缓存图片到IndexedDB
          await this.cacheImageToDB(file, base64);
          
          resolve(base64);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsDataURL(file);
    });
  }

  async uploadFromClipboard(): Promise<string> {
    try {
      const clipboardItems = await navigator.clipboard.read();
      
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const file = new File([blob], `clipboard-${Date.now()}.png`, { type });
            return await this.uploadImage(file);
          }
        }
      }
      
      throw new Error('剪贴板中没有找到图片');
    } catch (error) {
      console.error('剪贴板图片上传错误:', error);
      throw error;
    }
  }

  // 处理粘贴事件中的图片
  async handlePasteImage(event: ClipboardEvent): Promise<string | null> {
    try {
      const items = event.clipboardData?.items;
      if (!items) {
        console.log('剪贴板中没有items');
        return null;
      }

      console.log('剪贴板items数量:', items.length);
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log('检查item类型:', item.type);
        
        if (item.type.startsWith('image/')) {
          console.log('找到图片类型:', item.type);
          const file = item.getAsFile();
          if (file) {
            console.log('成功获取文件:', file.name, file.size, file.type);
            return await this.uploadImage(file);
          } else {
            console.error('无法从剪贴板获取文件');
          }
        }
      }
      
      console.log('未找到图片类型的数据');
      return null;
    } catch (error) {
      console.error('处理粘贴图片错误:', error);
      throw error; // 重新抛出错误以便上层处理
    }
  }

  // 从URL获取图片并缓存
  async getImageFromUrl(url: string): Promise<string> {
    try {
      // 先检查是否已经缓存
      const cached = await this.dbService.getCachedImageByUrl(url);
      if (cached) {
        return cached.url;
      }

      // 如果没有缓存，下载并缓存
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`获取图片失败: ${response.statusText}`);
      }

      const blob = await response.blob();
      const file = new File([blob], `url-${Date.now()}.${this.getExtensionFromMimeType(blob.type)}`, { type: blob.type });
      
      return await this.uploadImage(file);
    } catch (error) {
      console.error('从URL获取图片错误:', error);
      throw error;
    }
  }

  // 缓存图片到IndexedDB
  private async cacheImageToDB(file: File, url: string): Promise<void> {
    try {
      const key = this.generateImageKey(file, url);
      
      // 检查是否已经缓存
      const existing = await this.dbService.getCachedImage(key);
      if (existing) {
        console.log('图片已缓存，跳过重复缓存');
        return; // 已经缓存过了
      }

      console.log('开始缓存图片到数据库:', key, file.name, file.size);

      const cachedImage: Omit<CachedImage, 'id' | 'createdAt' | 'lastAccessed'> = {
        key,
        url,
        blob: file, // File对象继承自Blob，可以直接存储
        type: file.type,
        size: file.size,
      };

      const id = await this.dbService.cacheImage(cachedImage);
      console.log('图片缓存成功，ID:', id);
      
      // 清理过期的缓存
      const deletedCount = await this.dbService.cleanupImageCache(100);
      if (deletedCount > 0) {
        console.log('清理了', deletedCount, '张过期图片');
      }
    } catch (error) {
      console.error('缓存图片到数据库失败:', error);
      throw error; // 重新抛出错误以便上层处理
    }
  }

  // 生成图片的唯一key
  private generateImageKey(file: File, url: string): string {
    const timestamp = Date.now();
    const fileInfo = `${file.name}_${file.size}_${file.lastModified}`;
    const hash = this.simpleHash(url + fileInfo + timestamp);
    return `img_${hash}_${timestamp}`;
  }

  // 简单的哈希函数
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }

  // 从MIME类型获取文件扩展名
  private getExtensionFromMimeType(mimeType: string): string {
    const extensions: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'image/bmp': 'bmp',
    };
    return extensions[mimeType] || 'png';
  }

  // 获取缓存的图片
  async getCachedImage(key: string): Promise<CachedImage | undefined> {
    return await this.dbService.getCachedImage(key);
  }

  // 获取所有缓存的图片
  async getAllCachedImages(): Promise<CachedImage[]> {
    return await this.dbService.getAllCachedImages();
  }

  // 清理图片缓存
  async cleanupCache(maxImages: number = 100): Promise<number> {
    return await this.dbService.cleanupImageCache(maxImages);
  }

  // 获取缓存统计
  async getCacheStats() {
    return await this.dbService.getImageCacheStats();
  }

  setConfig(config: PicGoConfig) {
    this.config = config;
  }

  getConfig(): PicGoConfig {
    return this.config;
  }
}

// 默认配置
export const defaultPicGoConfig: PicGoConfig = {
  server: 'http://127.0.0.1:36677',
};

// 创建默认实例（需要传入数据库服务）
export const createImageUploadService = (dbService: typeof databaseService) => {
  return new ImageUploadService(defaultPicGoConfig, dbService);
}; 