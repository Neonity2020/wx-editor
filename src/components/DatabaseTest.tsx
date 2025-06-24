import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/database';
import { createImageUploadService } from '../services/imageUpload';
import type { CachedImage } from '../services/database';

const DatabaseTest: React.FC = () => {
  const [cachedImages, setCachedImages] = useState<CachedImage[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    totalSize: number;
    oldestImage: Date | null;
    newestImage: Date | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  const loadCachedImages = async () => {
    setLoading(true);
    try {
      const images = await databaseService.getAllCachedImages();
      setCachedImages(images);
      
      const imageStats = await databaseService.getImageCacheStats();
      setStats(imageStats);
      
      console.log('缓存的图片:', images);
      console.log('图片统计:', imageStats);
    } catch (error) {
      console.error('加载缓存图片失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const testImageUpload = async () => {
    setLoading(true);
    try {
      // 创建一个测试图片
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText('TEST IMAGE', 40, 100);
        ctx.fillText(Date.now().toString(), 40, 140);
      }
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `test-${Date.now()}.png`, { type: 'image/png' });
          
          const imageUploadService = createImageUploadService(databaseService);
          const url = await imageUploadService.uploadImage(file);
          
          console.log('测试图片上传成功:', url);
          alert(`测试图片上传成功！\nURL: ${url}`);
          
          // 重新加载缓存图片
          await loadCachedImages();
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('测试图片上传失败:', error);
      alert(`测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const testArticleWithImage = async () => {
    setLoading(true);
    try {
      // 创建一个包含图片的测试文章
      const testContent = `
        <h1>测试文章 - 包含图片</h1>
        <p>这是一个测试文章，包含一张图片。</p>
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="测试图片" />
        <p>图片应该能够正确显示和保存。</p>
      `;
      
      const newArticleId = await databaseService.createArticle({
        title: '测试文章 - 包含图片',
        content: testContent,
        theme: 'default',
        tags: ['测试'],
        isPublished: false,
      });
      
      console.log('测试文章已创建，ID:', newArticleId);
      
      // 立即读取文章验证
      const savedArticle = await databaseService.getArticle(newArticleId);
      if (savedArticle) {
        console.log('保存的文章内容:', savedArticle.content);
        console.log('文章中的图片数量:', (savedArticle.content.match(/<img/g) || []).length);
        alert(`测试文章创建成功！\nID: ${newArticleId}\n图片数量: ${(savedArticle.content.match(/<img/g) || []).length}`);
      }
      
      // 重新加载缓存图片
      await loadCachedImages();
      
    } catch (error) {
      console.error('测试文章创建失败:', error);
      alert(`测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearAllImages = async () => {
    if (window.confirm('确定要清空所有缓存的图片吗？')) {
      try {
        await databaseService.clearImageCache();
        await loadCachedImages();
        alert('所有图片已清空');
      } catch (error) {
        console.error('清空图片失败:', error);
        alert('清空失败');
      }
    }
  };

  // 测试base64图片保存和加载
  const testBase64ImageSave = async () => {
    try {
      // 创建一个简单的base64图片
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('TEST', 20, 60);
      }
      
      const base64 = canvas.toDataURL('image/png');
      console.log('测试base64图片:', base64.substring(0, 50) + '...');
      
      // 创建测试文章
      const testContent = `
        <h1>测试文章</h1>
        <p>这是一个测试base64图片保存的文章。</p>
        <img src="${base64}" alt="测试图片" style="max-width: 200px;">
        <p>图片应该显示为红色方块。</p>
      `;
      
      const articleId = await databaseService.createArticle({
        title: 'Base64图片测试',
        content: testContent,
        theme: 'default',
        tags: ['test'],
        isPublished: false,
      });
      
      console.log('测试文章已创建，ID:', articleId);
      
      // 立即加载文章验证
      const loadedArticle = await databaseService.getArticle(articleId);
      if (loadedArticle) {
        console.log('加载的测试文章:', {
          id: loadedArticle.id,
          contentLength: loadedArticle.content.length,
          hasImages: loadedArticle.content.includes('<img'),
          base64InContent: loadedArticle.content.includes('data:image/')
        });
        
        if (loadedArticle.content.includes('data:image/')) {
          setTestResult('✅ Base64图片保存和加载测试成功！');
        } else {
          setTestResult('❌ Base64图片在加载的文章中丢失');
        }
      }
      
    } catch (error) {
      console.error('Base64图片测试失败:', error);
      setTestResult(`❌ 测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  useEffect(() => {
    loadCachedImages();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">IndexedDB 图片缓存测试</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={loadCachedImages}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? '加载中...' : '刷新缓存列表'}
          </button>
          
          <button
            onClick={testImageUpload}
            disabled={loading}
            className="btn-success"
          >
            测试图片上传
          </button>
          
          <button
            onClick={testArticleWithImage}
            disabled={loading}
            className="btn-secondary"
          >
            测试文章创建
          </button>
          
          <button
            onClick={clearAllImages}
            disabled={loading}
            className="btn-secondary"
          >
            清空所有图片
          </button>
          
          <button
            onClick={testBase64ImageSave}
            disabled={loading}
            className="btn-secondary"
          >
            测试Base64图片保存和加载
          </button>
        </div>

        {stats && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium mb-2">缓存统计</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>总图片数: {stats.total}</div>
              <div>总大小: {formatFileSize(stats.totalSize)}</div>
              <div>最早图片: {stats.oldestImage ? formatDate(stats.oldestImage) : '无'}</div>
              <div>最新图片: {stats.newestImage ? formatDate(stats.newestImage) : '无'}</div>
            </div>
          </div>
        )}

        <div>
          <h4 className="font-medium mb-2">缓存的图片 ({cachedImages.length})</h4>
          {cachedImages.length === 0 ? (
            <p className="text-gray-500">暂无缓存的图片</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {cachedImages.map((image) => (
                <div key={image.id} className="border border-gray-200 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <img 
                      src={image.url} 
                      alt="缓存图片"
                      className="w-8 h-8 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{image.key}</div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(image.size)} • {image.type} • {formatDate(image.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {testResult && (
          <div className="mt-4 p-3 border border-gray-200 rounded-lg">
            <h4 className="font-medium mb-2">测试结果</h4>
            <p>{testResult}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseTest; 