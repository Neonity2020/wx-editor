import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

export interface Article {
  id?: number;
  title: string;
  content: string;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  isPublished?: boolean;
}

export interface CachedImage {
  id?: number;
  key: string; // 图片的唯一标识（可以是URL或文件名）
  url: string; // 图片的URL
  blob: Blob; // 图片的二进制数据
  type: string; // MIME类型
  size: number; // 文件大小
  createdAt: Date;
  lastAccessed: Date;
}

interface WxEditorDB extends DBSchema {
  articles: {
    key: number;
    value: Article;
    indexes: {
      'by-title': string;
      'by-created': Date;
      'by-updated': Date;
      'by-tags': string;
    };
  };
  images: {
    key: number;
    value: CachedImage;
    indexes: {
      'by-key': string;
      'by-created': Date;
      'by-last-accessed': Date;
    };
  };
}

class DatabaseService {
  private db: IDBPDatabase<WxEditorDB> | null = null;
  private readonly DB_NAME = 'wxeditor-db';
  private readonly DB_VERSION = 2; // 增加版本号以支持新的图片表

  async init(): Promise<void> {
    try {
      this.db = await openDB<WxEditorDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db, oldVersion) {
          // 如果是从旧版本升级，需要创建新的图片表
          if (oldVersion < 2) {
            // 创建图片缓存表
            const imageStore = db.createObjectStore('images', {
              keyPath: 'id',
              autoIncrement: true,
            });

            // 创建图片索引
            imageStore.createIndex('by-key', 'key', { unique: true });
            imageStore.createIndex('by-created', 'createdAt');
            imageStore.createIndex('by-last-accessed', 'lastAccessed');
          }

          // 创建文章表（如果不存在）
          if (!db.objectStoreNames.contains('articles')) {
            const articleStore = db.createObjectStore('articles', {
              keyPath: 'id',
              autoIncrement: true,
            });

            // 创建索引
            articleStore.createIndex('by-title', 'title');
            articleStore.createIndex('by-created', 'createdAt');
            articleStore.createIndex('by-updated', 'updatedAt');
            articleStore.createIndex('by-tags', 'tags', { multiEntry: true });
          }
        },
      });
      console.log('数据库初始化成功');
    } catch (error) {
      console.error('数据库初始化失败:', error);
      throw error;
    }
  }

  async ensureDB(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  // 创建新文章
  async createArticle(article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    await this.ensureDB();
    
    const newArticle: Article = {
      ...article,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const id = await this.db!.add('articles', newArticle);
    return id as number;
  }

  // 更新文章
  async updateArticle(id: number, updates: Partial<Article>): Promise<void> {
    await this.ensureDB();
    
    const article = await this.db!.get('articles', id);
    if (!article) {
      throw new Error('文章不存在');
    }

    const updatedArticle: Article = {
      ...article,
      ...updates,
      updatedAt: new Date(),
    };

    await this.db!.put('articles', updatedArticle);
  }

  // 获取单篇文章
  async getArticle(id: number): Promise<Article | undefined> {
    await this.ensureDB();
    return await this.db!.get('articles', id);
  }

  // 获取所有文章
  async getAllArticles(): Promise<Article[]> {
    await this.ensureDB();
    return await this.db!.getAll('articles');
  }

  // 按标题搜索文章
  async searchArticlesByTitle(title: string): Promise<Article[]> {
    await this.ensureDB();
    const tx = this.db!.transaction('articles', 'readonly');
    const store = tx.objectStore('articles');
    const index = store.index('by-title');
    
    const articles: Article[] = [];
    let cursor = await index.openCursor();
    
    while (cursor) {
      if (cursor.value.title.toLowerCase().includes(title.toLowerCase())) {
        articles.push(cursor.value);
      }
      cursor = await cursor.continue();
    }
    
    return articles;
  }

  // 按标签搜索文章
  async searchArticlesByTag(tag: string): Promise<Article[]> {
    await this.ensureDB();
    const tx = this.db!.transaction('articles', 'readonly');
    const store = tx.objectStore('articles');
    const index = store.index('by-tags');
    
    return await index.getAll(tag);
  }

  // 获取最近修改的文章
  async getRecentArticles(limit: number = 10): Promise<Article[]> {
    await this.ensureDB();
    const tx = this.db!.transaction('articles', 'readonly');
    const store = tx.objectStore('articles');
    const index = store.index('by-updated');
    
    const articles: Article[] = [];
    let cursor = await index.openCursor(null, 'prev');
    let count = 0;
    
    while (cursor && count < limit) {
      articles.push(cursor.value);
      count++;
      cursor = await cursor.continue();
    }
    
    return articles;
  }

  // 删除文章
  async deleteArticle(id: number): Promise<void> {
    await this.ensureDB();
    await this.db!.delete('articles', id);
  }

  // 批量删除文章
  async deleteArticles(ids: number[]): Promise<void> {
    await this.ensureDB();
    const tx = this.db!.transaction('articles', 'readwrite');
    const store = tx.objectStore('articles');
    
    for (const id of ids) {
      await store.delete(id);
    }
    
    await tx.done;
  }

  // 清空所有文章
  async clearAllArticles(): Promise<void> {
    await this.ensureDB();
    await this.db!.clear('articles');
  }

  // 获取文章统计信息
  async getStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    totalSize: number;
  }> {
    await this.ensureDB();
    const articles = await this.getAllArticles();
    
    const total = articles.length;
    const published = articles.filter(a => a.isPublished).length;
    const draft = total - published;
    const totalSize = articles.reduce((size, article) => {
      return size + JSON.stringify(article).length;
    }, 0);
    
    return { total, published, draft, totalSize };
  }

  // 导出所有文章
  async exportArticles(): Promise<string> {
    await this.ensureDB();
    const articles = await this.getAllArticles();
    return JSON.stringify(articles, null, 2);
  }

  // 导入文章
  async importArticles(jsonData: string): Promise<number> {
    await this.ensureDB();
    const articles: Article[] = JSON.parse(jsonData);
    
    const tx = this.db!.transaction('articles', 'readwrite');
    const store = tx.objectStore('articles');
    
    let importedCount = 0;
    for (const article of articles) {
      // 移除id，让数据库自动生成新的id
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...articleWithoutId } = article;
      const newArticle: Article = {
        ...articleWithoutId,
        createdAt: new Date(article.createdAt),
        updatedAt: new Date(article.updatedAt),
      };
      
      await store.add(newArticle);
      importedCount++;
    }
    
    await tx.done;
    return importedCount;
  }

  // 图片缓存相关方法

  // 缓存图片
  async cacheImage(image: Omit<CachedImage, 'id' | 'createdAt' | 'lastAccessed'>): Promise<number> {
    await this.ensureDB();
    
    // 检查图片大小
    const imageSizeKB = image.size / 1024;
    const base64SizeKB = image.url.length / 1024;
    
    console.log('缓存图片信息:', {
      key: image.key,
      type: image.type,
      fileSize: imageSizeKB.toFixed(1) + 'KB',
      base64Size: base64SizeKB.toFixed(1) + 'KB',
      urlPreview: image.url.substring(0, 50) + '...'
    });
    
    // 如果base64数据太大，给出警告
    if (base64SizeKB > 500) { // 大于500KB
      console.warn('警告：图片base64数据较大，可能影响性能:', base64SizeKB.toFixed(1) + 'KB');
    }
    
    const cachedImage: CachedImage = {
      ...image,
      createdAt: new Date(),
      lastAccessed: new Date(),
    };

    try {
      const id = await this.db!.add('images', cachedImage);
      console.log('图片缓存成功，ID:', id);
      return id as number;
    } catch (error) {
      console.error('图片缓存失败:', error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('存储空间不足，请清理一些图片缓存');
      }
      throw error;
    }
  }

  // 根据key获取缓存的图片
  async getCachedImage(key: string): Promise<CachedImage | undefined> {
    await this.ensureDB();
    const tx = this.db!.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    const index = store.index('by-key');
    
    const image = await index.get(key);
    
    // 更新最后访问时间
    if (image) {
      image.lastAccessed = new Date();
      await store.put(image);
    }
    
    return image;
  }

  // 根据URL获取缓存的图片
  async getCachedImageByUrl(url: string): Promise<CachedImage | undefined> {
    await this.ensureDB();
    const tx = this.db!.transaction('images', 'readonly');
    const store = tx.objectStore('images');
    
    const images = await store.getAll();
    return images.find(img => img.url === url);
  }

  // 获取所有缓存的图片
  async getAllCachedImages(): Promise<CachedImage[]> {
    await this.ensureDB();
    return await this.db!.getAll('images');
  }

  // 删除缓存的图片
  async deleteCachedImage(id: number): Promise<void> {
    await this.ensureDB();
    await this.db!.delete('images', id);
  }

  // 根据key删除缓存的图片
  async deleteCachedImageByKey(key: string): Promise<void> {
    await this.ensureDB();
    const tx = this.db!.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    const index = store.index('by-key');
    
    const image = await index.get(key);
    if (image) {
      await store.delete(image.id!);
    }
  }

  // 清理过期的图片缓存（保留最近访问的图片）
  async cleanupImageCache(maxImages: number = 100): Promise<number> {
    await this.ensureDB();
    const tx = this.db!.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    const index = store.index('by-last-accessed');
    
    const images = await index.getAll();
    
    if (images.length <= maxImages) {
      return 0;
    }
    
    // 按最后访问时间排序，删除最旧的图片
    images.sort((a, b) => a.lastAccessed.getTime() - b.lastAccessed.getTime());
    const toDelete = images.slice(0, images.length - maxImages);
    
    for (const image of toDelete) {
      await store.delete(image.id!);
    }
    
    return toDelete.length;
  }

  // 获取图片缓存统计信息
  async getImageCacheStats(): Promise<{
    total: number;
    totalSize: number;
    oldestImage: Date | null;
    newestImage: Date | null;
  }> {
    await this.ensureDB();
    const images = await this.getAllCachedImages();
    
    if (images.length === 0) {
      return {
        total: 0,
        totalSize: 0,
        oldestImage: null,
        newestImage: null,
      };
    }
    
    const totalSize = images.reduce((size, image) => size + image.size, 0);
    const dates = images.map(img => img.createdAt);
    const oldestImage = new Date(Math.min(...dates.map(d => d.getTime())));
    const newestImage = new Date(Math.max(...dates.map(d => d.getTime())));
    
    return {
      total: images.length,
      totalSize,
      oldestImage,
      newestImage,
    };
  }

  // 清空所有图片缓存
  async clearImageCache(): Promise<void> {
    await this.ensureDB();
    await this.db!.clear('images');
  }
}

// 创建单例实例
export const databaseService = new DatabaseService();

// 初始化数据库 - 现在在App.tsx中手动控制
// databaseService.init().catch(console.error); 