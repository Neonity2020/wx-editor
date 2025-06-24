import React, { useState, useEffect, useCallback } from 'react';
import { databaseService, type Article } from '../services/database';
import { 
  Plus, 
  Search, 
  FileText, 
  Calendar, 
  Tag, 
  Trash2, 
  Edit3,
  Download,
  Upload
} from 'lucide-react';

interface ArticleManagerProps {
  onSelectArticle: (article: Article) => void;
  onNewArticle: () => void;
  currentArticleId?: number;
  refreshTrigger?: number;
}

const ArticleManager: React.FC<ArticleManagerProps> = ({
  onSelectArticle,
  onNewArticle,
  currentArticleId,
  refreshTrigger = 0
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    totalSize: 0
  });

  // 加载文章列表
  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      const allArticles = await databaseService.getAllArticles();
      setArticles(allArticles);
      const statsData = await databaseService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('加载文章失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 搜索文章
  const searchArticles = useCallback(async () => {
    if (!searchTerm.trim()) {
      await loadArticles();
      return;
    }

    try {
      setLoading(true);
      const results = await databaseService.searchArticlesByTitle(searchTerm);
      setArticles(results);
    } catch (error) {
      console.error('搜索文章失败:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, loadArticles]);

  // 按标签筛选
  const filterByTag = useCallback(async (tag: string) => {
    if (!tag.trim()) {
      await loadArticles();
      return;
    }
    try {
      setLoading(true);
      const results = await databaseService.searchArticlesByTag(tag);
      setArticles(results);
    } catch (error) {
      console.error('按标签筛选失败:', error);
    } finally {
      setLoading(false);
    }
  }, [loadArticles]);

  // 删除文章
  const deleteArticle = async (id: number) => {
    if (!confirm('确定要删除这篇文章吗？')) {
      return;
    }

    try {
      await databaseService.deleteArticle(id);
      await loadArticles();
    } catch (error) {
      console.error('删除文章失败:', error);
    }
  };

  // 导出文章
  const exportArticles = async () => {
    try {
      const jsonData = await databaseService.exportArticles();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wxeditor-articles-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出文章失败:', error);
    }
  };

  // 导入文章
  const importArticles = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const count = await databaseService.importArticles(text);
          alert(`成功导入 ${count} 篇文章`);
          await loadArticles();
        } catch (error) {
          console.error('导入文章失败:', error);
          alert('导入失败，请检查文件格式');
        }
      }
    };
    input.click();
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取文章标题
  const getArticleTitle = (content: string) => {
    const match = content.match(/<h1[^>]*>(.*?)<\/h1>/);
    return match ? match[1] : '无标题文章';
  };

  // 获取所有标签
  const getAllTags = () => {
    const tags = new Set<string>();
    articles.forEach(article => {
      article.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  };

  // 初始加载
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // 监听refreshTrigger变化，自动刷新文章列表
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadArticles();
    }
  }, [refreshTrigger, loadArticles]);

  useEffect(() => {
    if (searchTerm) {
      const timer = setTimeout(searchArticles, 300);
      return () => clearTimeout(timer);
    } else {
      loadArticles();
    }
  }, [searchTerm, searchArticles, loadArticles]);

  useEffect(() => {
    if (filterTag) {
      filterByTag(filterTag);
    } else {
      loadArticles();
    }
  }, [filterTag, filterByTag, loadArticles]);

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 article-manager-panel">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">文章管理</h2>
          <button
            onClick={onNewArticle}
            className="btn-primary"
          >
            <Plus size={14} />
            新建文章
          </button>
        </div>

        {/* 搜索框 */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索文章..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 标签筛选 */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => setFilterTag('')}
            className={`px-3 py-1 text-xs rounded-full ${
              filterTag === '' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {getAllTags().map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-3 py-1 text-xs rounded-full ${
                filterTag === tag 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* 统计信息 */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>总计: {stats.total}</span>
          <span>已发布: {stats.published}</span>
          <span>草稿: {stats.draft}</span>
          <span>大小: {(stats.totalSize / 1024).toFixed(1)}KB</span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="p-3 border-b border-gray-200 flex gap-2">
        <button
          onClick={exportArticles}
          className="btn-secondary flex-1"
          title="导出所有文章"
        >
          <Download size={14} />
          导出
        </button>
        <button
          onClick={importArticles}
          className="btn-secondary flex-1"
          title="导入文章"
        >
          <Upload size={14} />
          导入
        </button>
      </div>

      {/* 文章列表 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <FileText size={48} className="mb-2 opacity-50" />
            <p>暂无文章</p>
            <button
              onClick={onNewArticle}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              创建第一篇文章
            </button>
          </div>
        ) : (
          <div className="p-2">
            {articles.map(article => (
              <div
                key={article.id}
                className={`p-3 rounded-lg mb-2 cursor-pointer transition-all ${
                  currentArticleId === article.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => onSelectArticle(article)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {getArticleTitle(article.content)}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Calendar size={12} />
                      <span>{formatDate(article.updatedAt)}</span>
                      {article.isPublished && (
                        <span className="text-green-600">已发布</span>
                      )}
                    </div>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Tag size={12} className="text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 2).map(tag => (
                            <span
                              key={tag}
                              className="px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {article.tags.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{article.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectArticle(article);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="编辑"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteArticle(article.id!);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="删除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleManager; 