import { useState, useEffect, useRef, useCallback } from 'react';
import Editor from './components/Editor';
import ThemeSelector from './components/ThemeSelector';
import ArticleManager from './components/ArticleManager';
import TagManager from './components/TagManager';
import PicGoTest from './components/PicGoTest';
import DatabaseTest from './components/DatabaseTest';
import HtmlExporter from './components/HtmlExporter';
import { themes, getThemeById, getDefaultTheme } from './themes';
import { createImageUploadService, type PicGoConfig } from './services/imageUpload';
import { databaseService, type Article } from './services/database';
import { 
  Save, 
  Settings, 
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  FolderOpen,
  FolderClosed,
  Edit3,
  X
} from 'lucide-react';

declare global {
  interface Window {
    electronAPI: {
      saveFileDialog: () => Promise<{ canceled: boolean; filePath?: string }>;
      onNewDocument: (callback: () => void) => void;
      onOpenFile: (callback: (filePath: string) => void) => void;
      onSaveDocument: (callback: () => void) => void;
      removeAllListeners: (channel: string) => void;
      platform: string;
      readClipboard: () => Promise<string>;
      writeClipboard: (text: string) => Promise<void>;
      uploadImage: (imageData: string) => Promise<string>;
      getPicGoConfig: () => Promise<PicGoConfig>;
      setPicGoConfig: (config: PicGoConfig) => Promise<void>;
    };
  }
}

function App() {
  const [content, setContent] = useState(`<h1>欢迎使用微信公众号编辑器</h1>
<p>开始编写你的文章吧！这是一个优雅的写作环境，专注于内容创作。</p>

<h2>夜间模式主题</h2>
<p>现在支持多种夜间模式主题，包括：</p>
<ul>
<li><strong>夜间模式</strong> - 护眼的夜间阅读模式</li>
<li><strong>Bear夜间主题</strong> - Bear笔记夜间风格，护眼舒适</li>
<li><strong>现代夜间主题</strong> - 现代简约夜间风格</li>
<li><strong>优雅夜间主题</strong> - 优雅的夜间阅读体验</li>
<li><strong>微信夜间主题</strong> - 微信公众号夜间专用样式</li>
</ul>

<h3>代码示例</h3>
<p>夜间主题对代码块有特殊优化：</p>
<pre><code>function helloWorld() {
  console.log("Hello, 夜间模式!");
  return "欢迎使用夜间主题";
}</code></pre>

<h3>引用块测试</h3>
<blockquote>
<p>这是一个引用块，在夜间模式下会有特殊的背景色和边框样式，让内容更加突出。</p>
</blockquote>

<h3>表格示例</h3>
<table>
<thead>
<tr>
<th>主题名称</th>
<th>特点</th>
<th>适用场景</th>
</tr>
</thead>
<tbody>
<tr>
<td>默认主题</td>
<td>简洁清晰</td>
<td>日常写作</td>
</tr>
<tr>
<td>Bear主题</td>
<td>优雅美观</td>
<td>正式文档</td>
</tr>
<tr>
<td>夜间模式</td>
<td>护眼舒适</td>
<td>夜间使用</td>
</tr>
</tbody>
</table>

<h2>功能特色</h2>
<p>本编辑器提供了丰富的文本编辑功能，包括：</p>
<ol>
<li>多种标题样式</li>
<li>文本格式化（粗体、斜体、下划线、高亮）</li>
<li>列表和引用</li>
<li>图片插入</li>
<li>链接管理</li>
<li>表格创建</li>
<li>文本对齐</li>
<li>颜色选择</li>
</ol>

<h2>使用说明</h2>
<p>你可以使用工具栏中的各种按钮来格式化你的文本。编辑器支持实时预览，让你能够看到最终的排版效果。</p>

<h3>文本格式化</h3>
<p>选择文本后，点击相应的格式化按钮即可应用样式。支持<strong>粗体</strong>、<em>斜体</em>、<u>下划线</u>和高亮等效果。</p>

<h3>插入元素</h3>
<p>点击工具栏中的相应按钮可以插入图片、链接和表格等元素。</p>

<h2>滚动测试</h2>
<p>这是一个很长的段落，用来测试编辑器的滚动功能。当你看到这个段落时，说明滚动功能正在正常工作。</p>

<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>

<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

<h3>更多测试内容</h3>
<p>这里是一些额外的测试内容，用来确保滚动条能够正常显示和工作。</p>

<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>

<p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>

<h2>结尾</h2>
<p>感谢使用微信公众号编辑器！希望这个工具能够帮助你创作出优秀的文章。</p>

<hr>

<p><em>提示：你可以通过主题选择器切换到不同的夜间主题来体验不同的视觉效果。</em></p>`);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showArticleManager, setShowArticleManager] = useState(true);
  const [showArticleDetails, setShowArticleDetails] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleTags, setArticleTags] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [picGoConfig, setPicGoConfig] = useState<PicGoConfig>({
    server: 'http://127.0.0.1:36677'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  // 应用主题样式
  useEffect(() => {
    const theme = getThemeById(currentTheme) || getDefaultTheme();
    
    if (!styleRef.current) {
      styleRef.current = document.createElement('style');
      document.head.appendChild(styleRef.current);
    }
    
    styleRef.current.textContent = theme.css;
  }, [currentTheme]);

  // 监听Electron事件
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onNewDocument(() => {
        handleNewArticle();
      });

      window.electronAPI.onSaveDocument(() => {
        handleSaveArticle();
      });

      // 加载PicGo配置
      window.electronAPI.getPicGoConfig().then(setPicGoConfig);
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('new-document');
        window.electronAPI.removeAllListeners('save-document');
      }
    };
  }, );

  // 图片上传处理
  const handleImageUpload = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      // 创建图片上传服务实例
      const imageUploadService = createImageUploadService(databaseService);
      
      // 更新PicGo配置
      imageUploadService.setConfig(picGoConfig);
      
      // 上传图片
      const url = await imageUploadService.uploadImage(file);
      
      // 保存配置到Electron
      if (window.electronAPI) {
        await window.electronAPI.setPicGoConfig(picGoConfig);
      }
      
      return url;
    } catch (error) {
      console.error('图片上传失败:', error);
      alert('图片上传失败，请检查PicGo配置');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // 新建文章
  const handleNewArticle = () => {
    setCurrentArticle(null);
    setContent('<h1>新文章</h1><p></p>');
    setArticleTitle('新文章');
    setArticleTags([]);
    setIsPublished(false);
    setShowArticleDetails(false);
  };

  // 选择文章
  const handleSelectArticle = (article: Article) => {
    console.log('选择文章:', {
      id: article.id,
      title: article.title,
      contentLength: article.content.length,
      hasImages: article.content.includes('<img')
    });
    
    setCurrentArticle(article);
    setContent(article.content);
    setCurrentTheme(article.theme);
    setArticleTitle(getArticleTitle(article.content));
    setArticleTags(article.tags || []);
    setIsPublished(article.isPublished || false);
    setShowArticleDetails(false);
    
    // 保存最后编辑的文章ID
    if (article.id) {
      saveLastEditedArticle(article.id);
    }
  };

  // 刷新文章列表
  const refreshArticleList = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // 保存文章
  const handleSaveArticle = async () => {
    if (!content.trim()) {
      alert('文章内容不能为空');
      return;
    }

    setIsSaving(true);
    try {
      const title = getArticleTitle(content);
      setArticleTitle(title);
      
      // 检查文章内容中的图片
      const imgMatches = content.match(/<img[^>]+src="([^"]+)"[^>]*>/g) || [];
      const base64Images = imgMatches.filter(img => img.includes('data:image/'));
      
      console.log('保存文章:', {
        title,
        contentLength: content.length,
        totalImages: imgMatches.length,
        base64Images: base64Images.length
      });
      
      if (currentArticle?.id) {
        // 更新现有文章
        await databaseService.updateArticle(currentArticle.id, {
          title,
          content,
          theme: currentTheme,
          tags: articleTags,
          isPublished,
        });
        console.log('文章已更新，ID:', currentArticle.id);
      } else {
        // 创建新文章
        const newArticleId = await databaseService.createArticle({
          title,
          content,
          theme: currentTheme,
          tags: articleTags,
          isPublished,
        });
        
        console.log('文章已创建，新ID:', newArticleId);
        
        // 更新当前文章状态
        const newArticle = await databaseService.getArticle(newArticleId);
        if (newArticle) {
          setCurrentArticle(newArticle);
        }
      }
      
      // 刷新文章列表
      refreshArticleList();
    } catch (error) {
      console.error('保存文章失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 获取文章标题
  const getArticleTitle = (content: string): string => {
    const match = content.match(/<h1[^>]*>(.*?)<\/h1>/);
    return match ? match[1] : '无标题文章';
  };

  // 保存最后编辑的文章ID到localStorage
  const saveLastEditedArticle = (articleId: number) => {
    try {
      localStorage.setItem('wxeditor-last-article-id', articleId.toString());
    } catch (error) {
      console.warn('保存最后编辑文章ID失败:', error);
    }
  };

  // 从localStorage获取最后编辑的文章ID
  const getLastEditedArticleId = (): number | null => {
    try {
      const id = localStorage.getItem('wxeditor-last-article-id');
      return id ? parseInt(id, 10) : null;
    } catch (error) {
      console.warn('获取最后编辑文章ID失败:', error);
      return null;
    }
  };

  // 加载最后编辑的文章
  const loadLastEditedArticle = async () => {
    const lastArticleId = getLastEditedArticleId();
    if (lastArticleId) {
      try {
        const article = await databaseService.getArticle(lastArticleId);
        if (article) {
          console.log('自动加载最后编辑的文章:', article.title);
          handleSelectArticle(article);
          return true;
        }
      } catch (error) {
        console.warn('加载最后编辑的文章失败:', error);
      }
    }
    return false;
  };

  // 初始化
  useEffect(() => {
    const init = async () => {
      try {
        await databaseService.init();
        console.log('数据库初始化成功');
        
        // 尝试加载最后编辑的文章
        const loaded = await loadLastEditedArticle();
        if (!loaded) {
          // 如果没有最后编辑的文章，创建默认文章
          handleNewArticle();
        }
      } catch (error) {
        console.error('初始化失败:', error);
        handleNewArticle();
      }
    };
    
    init();
  }, []);

  // 保存设置
  const handleSaveSettings = async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.setPicGoConfig(picGoConfig);
      }
      setShowSettings(false);
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  };

  // 取消设置
  const handleCancelSettings = () => {
    // 重新加载原始配置
    if (window.electronAPI) {
      window.electronAPI.getPicGoConfig().then(setPicGoConfig);
    }
    setShowSettings(false);
  };

  // 处理ESC键关闭设置面板
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showSettings) {
        handleCancelSettings();
      }
    };

    if (showSettings) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showSettings]);

  // 处理快捷键
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/CMD + S 保存文章
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault(); // 阻止浏览器默认的保存行为
        handleSaveArticle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [content, currentArticle, currentTheme, articleTags, isPublished]); // 依赖项包含保存所需的所有状态

  return (
    <div className={`h-full flex flex-col theme-${currentTheme}`}>
      {/* 顶部工具栏 - Bear 风格 */}
      <div className="top-toolbar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="app-title flex items-center gap-2">
              <Sparkles size={20} />
              微信公众号编辑器
            </h1>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveArticle}
                className="btn-primary"
                disabled={isSaving}
                title="保存文章 (Ctrl/Cmd + S)"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {isSaving ? '保存中...' : '保存'}
              </button>
              
              <HtmlExporter
                content={content}
                articleTitle={articleTitle}
                currentTheme={currentTheme}
                onCopySuccess={() => alert('内容已复制到剪贴板，可直接粘贴到微信公众号编辑器')}
                onCopyError={(error) => alert(error)} 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeSelector
              themes={themes}
              currentTheme={currentTheme}
              onThemeChange={setCurrentTheme}
            />
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary"
            >
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPreview ? '隐藏预览' : '显示预览'}
            </button>
            
            <button
              onClick={() => setShowArticleDetails(!showArticleDetails)}
              className="btn-secondary"
            >
              <Edit3 size={14} />
              文章详情
            </button>
            
            <button
              onClick={() => setShowArticleManager(!showArticleManager)}
              className="btn-secondary"
            >
              {showArticleManager ? <FolderClosed size={14} /> : <FolderOpen size={14} />}
              {showArticleManager ? '隐藏管理' : '显示管理'}
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="btn-secondary"
            >
              <Settings size={14} />
              设置
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 文章管理侧边栏 */}
        {showArticleManager && (
          <div className="w-80">
            <ArticleManager
              onSelectArticle={handleSelectArticle}
              onNewArticle={handleNewArticle}
              currentArticleId={currentArticle?.id}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        {/* 文章详情侧边栏 */}
        {showArticleDetails && (
          <div className="w-80 bg-white border-r border-gray-200 p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">文章详情</h3>
            
            <div className="space-y-4">
              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文章标题
                </label>
                <input
                  type="text"
                  value={articleTitle}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-not-allowed"
                  placeholder="输入文章标题..."
                />
              </div>

              {/* 发布状态 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  发布状态
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!isPublished}
                      onChange={() => setIsPublished(false)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      !isPublished ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {!isPublished && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className="text-sm text-gray-700">草稿</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={isPublished}
                      onChange={() => setIsPublished(true)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isPublished ? 'border-green-500 bg-green-500' : 'border-gray-300'
                    }`}>
                      {isPublished && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className="text-sm text-gray-700">已发布</span>
                  </label>
                </div>
              </div>

              {/* 标签 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签
                </label>
                <TagManager
                  tags={articleTags}
                  onChange={setArticleTags}
                  maxTags={10}
                />
              </div>

              {/* 文章信息 */}
              {currentArticle && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">文章信息</h4>
                  <div className="space-y-2 text-xs text-gray-500">
                    <div>创建时间: {new Date(currentArticle.createdAt).toLocaleString('zh-CN')}</div>
                    <div>更新时间: {new Date(currentArticle.updatedAt).toLocaleString('zh-CN')}</div>
                    <div>主题: {currentTheme}</div>
                    <div>字符数: {content.replace(/<[^>]*>/g, '').length}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 编辑器区域 */}
        <div className={`flex-1 flex flex-col ${showPreview ? 'w-1/2' : 'w-full'}`}>
          <Editor
            content={content}
            onChange={setContent}
            onImageUpload={handleImageUpload}
          />
          {isUploading && (
            <div className="loading-indicator">
              <Loader2 size={14} className="animate-spin" />
              正在上传图片...
            </div>
          )}
        </div>

        {/* 预览区域 */}
        {showPreview && (
          <div className="preview-container w-1/2">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">预览效果</h2>
              <div 
                className="preview-content"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="settings-overlay" onClick={handleCancelSettings}>
          <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">PicGo 配置</h2>
              <button
                onClick={handleCancelSettings}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="关闭"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="settings-label">
                  PicGo 服务器地址
                </label>
                <input
                  type="url"
                  value={picGoConfig.server}
                  onChange={(e) => setPicGoConfig({ ...picGoConfig, server: e.target.value })}
                  className="settings-input"
                  placeholder="http://127.0.0.1:36677"
                />
              </div>
              
              <div>
                <label className="settings-label">
                  Token (可选)
                </label>
                <input
                  type="text"
                  value={picGoConfig.token || ''}
                  onChange={(e) => setPicGoConfig({ ...picGoConfig, token: e.target.value })}
                  className="settings-input"
                  placeholder="PicGo Token"
                />
              </div>
              
              {/* PicGo连接测试 */}
              <PicGoTest />
              
              {/* 数据库缓存测试 */}
              <DatabaseTest />
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleSaveSettings}
                className="btn-primary flex-1"
              >
                保存
              </button>
              <button
                onClick={handleCancelSettings}
                className="btn-secondary flex-1"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
