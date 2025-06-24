import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Trash2, Eye, X } from 'lucide-react';
import { databaseService } from '../services/database';
import type { CachedImage } from '../services/database';

interface ImageManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage?: (url: string) => void;
}

const ImageManager: React.FC<ImageManagerProps> = ({ isOpen, onClose, onSelectImage }) => {
  const [images, setImages] = useState<CachedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    totalSize: 0,
    oldestImage: null as Date | null,
    newestImage: null as Date | null,
  });

  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const cachedImages = await databaseService.getAllCachedImages();
      setImages(cachedImages);
      
      const imageStats = await databaseService.getImageCacheStats();
      setStats(imageStats);
    } catch (error) {
      console.error('加载图片失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (id: number) => {
    try {
      await databaseService.deleteCachedImage(id);
      await loadImages(); // 重新加载图片列表
    } catch (error) {
      console.error('删除图片失败:', error);
    }
  };

  const clearAllImages = async () => {
    if (window.confirm('确定要清空所有缓存的图片吗？此操作不可撤销。')) {
      try {
        await databaseService.clearImageCache();
        await loadImages();
      } catch (error) {
        console.error('清空图片缓存失败:', error);
      }
    }
  };

  const cleanupCache = async () => {
    try {
      const deletedCount = await databaseService.cleanupImageCache(50);
      if (deletedCount > 0) {
        alert(`已清理 ${deletedCount} 张过期图片`);
        await loadImages();
      } else {
        alert('没有需要清理的图片');
      }
    } catch (error) {
      console.error('清理缓存失败:', error);
    }
  };

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
    }).format(date);
  };

  if (!isOpen) return null;

  return (
    <div className="image-manager-overlay">
      <div className="image-manager-modal">
        <div className="image-manager-header">
          <h2 className="image-manager-title">
            <ImageIcon size={20} />
            图片管理器
          </h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <div className="image-manager-stats">
          <div className="stat-item">
            <span className="stat-label">总图片数:</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">总大小:</span>
            <span className="stat-value">{formatFileSize(stats.totalSize)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">最早图片:</span>
            <span className="stat-value">
              {stats.oldestImage ? formatDate(stats.oldestImage) : '无'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">最新图片:</span>
            <span className="stat-value">
              {stats.newestImage ? formatDate(stats.newestImage) : '无'}
            </span>
          </div>
        </div>

        <div className="image-manager-actions">
          <button onClick={cleanupCache} className="btn-secondary">
            清理过期图片
          </button>
          <button onClick={clearAllImages} className="btn-secondary">
            清空所有图片
          </button>
        </div>

        <div className="image-manager-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span>加载中...</span>
            </div>
          ) : images.length === 0 ? (
            <div className="empty-state">
              <ImageIcon size={48} />
              <p>暂无缓存的图片</p>
              <span>复制粘贴图片到编辑器时会自动缓存</span>
            </div>
          ) : (
            <div className="image-grid">
              {images.map((image) => (
                <div key={image.id} className="image-item">
                  <div className="image-preview">
                    <img 
                      src={image.url} 
                      alt={`缓存图片 ${image.id}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="image-overlay">
                      <button
                        onClick={() => onSelectImage?.(image.url)}
                        className="image-action-btn"
                        title="插入到编辑器"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => deleteImage(image.id!)}
                        className="image-action-btn delete"
                        title="删除图片"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="image-info">
                    <div className="image-size">{formatFileSize(image.size)}</div>
                    <div className="image-date">{formatDate(image.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageManager; 