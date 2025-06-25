import { useState } from 'react';
import { Download, Upload, Loader2 } from 'lucide-react';
import { getThemeById } from '../themes';

interface HtmlExporterProps {
  content: string;
  articleTitle: string;
  currentTheme: string;
  onCopySuccess?: () => void;
  onCopyError?: (error: string) => void;
}

const HtmlExporter: React.FC<HtmlExporterProps> = ({
  content,
  articleTitle,
  currentTheme,
  onCopySuccess,
  onCopyError
}) => {
  const [isCopying, setIsCopying] = useState(false);

  // 获取文章标题
  const getArticleTitle = (content: string): string => {
    const match = content.match(/<h1[^>]*>(.*?)<\/h1>/);
    return match ? match[1] : '无标题文章';
  };

  // 生成完整的HTML内容
  const generateHtmlContent = (): string => {
    const title = articleTitle || getArticleTitle(content);
    const theme = getThemeById(currentTheme);
    
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${theme?.css || ''}
        body { margin: 0; padding: 20px; }
    </style>
</head>
<body>
    <div class="editor-content">
        ${content}
    </div>
</body>
</html>`;
  };

  // 导出HTML文件
  const handleExportHTML = () => {
    const htmlContent = generateHtmlContent();
    const title = articleTitle || getArticleTitle(content);
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Bear红色主题富文本内容生成
  const createBearRedRichTextContent = (html: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 标题
    doc.querySelectorAll('h1').forEach(el => {
      el.setAttribute('style', 'color:#c0392b;font-size:2.2em;font-weight:700;margin:0 0 28px 0;line-height:1.2;background:none;background-color:transparent;');
    });
    doc.querySelectorAll('h2').forEach(el => {
      el.setAttribute('style', 'color:#e74c3c;font-size:1.6em;font-weight:600;margin:32px 0 16px 0;line-height:1.3;background:none;background-color:transparent;');
    });
    doc.querySelectorAll('h3').forEach(el => {
      el.setAttribute('style', 'color:#e74c3c;font-size:1.2em;font-weight:600;margin:24px 0 12px 0;line-height:1.3;background:none;background-color:transparent;');
    });

    // 段落
    doc.querySelectorAll('p').forEach(el => {
      el.setAttribute('style', 'margin:0 0 16px 0;line-height:1.7;background:none;background-color:transparent;font-weight:400;-webkit-font-smoothing:antialiased;font-smooth:always;');
    });

    // 强调
    doc.querySelectorAll('strong').forEach(el => {
      el.setAttribute('style', 'color:#c0392b;font-weight:700;background:none;background-color:transparent;');
    });
    doc.querySelectorAll('em').forEach(el => {
      el.setAttribute('style', 'color:#e74c3c;font-style:italic;background:none;background-color:transparent;');
    });

    // 无序列表
    doc.querySelectorAll('ul').forEach(el => {
      el.setAttribute('style', 'margin:16px 0 16px 0;padding-left:24px;list-style: initial;background:none;background-color:transparent;color:#e74c3c;');
    });
    doc.querySelectorAll('ul li').forEach(li => {
      // 包裹内容
      if (li.childNodes.length > 0) {
        const span = document.createElement('span');
        span.setAttribute('style', 'color:initial;font-weight:400;-webkit-font-smoothing:antialiased;font-smooth:always;');
        while (li.firstChild) span.appendChild(li.firstChild);
        li.appendChild(span);
      }
      li.setAttribute('style', 'margin:8px 0;line-height:1.6;background:none;background-color:transparent;');
    });

    // 有序列表
    doc.querySelectorAll('ol').forEach(el => {
      el.setAttribute('style', 'margin:16px 0 16px 0;padding-left:24px;list-style: decimal;background:none;background-color:transparent;color:#c0392b;');
    });
    doc.querySelectorAll('ol li').forEach(li => {
      if (li.childNodes.length > 0) {
        const span = document.createElement('span');
        span.setAttribute('style', 'color:initial;font-weight:400;-webkit-font-smoothing:antialiased;font-smooth:always;');
        while (li.firstChild) span.appendChild(li.firstChild);
        li.appendChild(span);
      }
      li.setAttribute('style', 'margin:8px 0;line-height:1.6;background:none;background-color:transparent;');
    });

    // blockquote
    doc.querySelectorAll('blockquote').forEach(el => {
      el.setAttribute('style', 'border-left:4px solid #e74c3c;padding:16px 24px;margin:24px 0;background:#fff5f3;color:#c0392b;font-style:italic;');
    });

    // code
    doc.querySelectorAll('code').forEach(el => {
      el.setAttribute('style', 'background:#fff0ee;color:#e74c3c;padding:2px 6px;border-radius:4px;font-family:monospace;');
    });
    doc.querySelectorAll('pre').forEach(el => {
      el.setAttribute('style', 'background:#fff0ee;color:#c0392b;padding:16px 20px;border-radius:8px;overflow-x:auto;margin:24px 0;');
    });

    // 图片
    doc.querySelectorAll('img').forEach(el => {
      el.setAttribute('style', 'max-width:100%;height:auto;border-radius:8px;margin:16px 0;box-shadow:0 2px 8px rgba(231,76,60,0.08);background:none;background-color:transparent;');
    });

    // 链接
    doc.querySelectorAll('a').forEach(el => {
      el.setAttribute('style', 'color:#e74c3c;text-decoration:underline;background:none;background-color:transparent;');
    });

    return `<div style="font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;">${doc.body.innerHTML}</div>`;
  };

  // 复制到剪贴板
  const handleCopyToClipboard = async () => {
    try {
      setIsCopying(true);
      console.log('开始复制内容到剪贴板...');
      
      // Bear红色主题内容
      const bearRedContent = createBearRedRichTextContent(content);
      console.log('生成的富文本内容长度:', bearRedContent.length);

      if (window.electronAPI) {
        console.log('使用Electron API复制...');
        await window.electronAPI.writeClipboard(bearRedContent);
        console.log('Electron API复制成功');
        onCopySuccess?.();
      } else {
        console.log('使用浏览器API复制...');
        await copyRichTextToClipboard(bearRedContent);
        console.log('浏览器API复制成功');
        onCopySuccess?.();
      }
    } catch (error) {
      console.error('复制失败:', error);
      
      // 提供更详细的错误信息
      let errorMessage = '复制失败，请重试';
      if (error instanceof Error) {
        errorMessage = `复制失败: ${error.message}`;
      }
      
      onCopyError?.(errorMessage);
    } finally {
      setIsCopying(false);
    }
  };

  // 浏览器环境下复制富文本
  const copyRichTextToClipboard = async (htmlContent: string): Promise<void> => {
    try {
      // 首先尝试使用现代的Clipboard API
      if (navigator.clipboard && window.ClipboardItem) {
        console.log('使用现代Clipboard API...');
        
        // 创建包含HTML和文本的ClipboardItem
        const clipboardItem = new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([htmlContent.replace(/<[^>]*>/g, '')], { type: 'text/plain' })
        });
        
        await navigator.clipboard.write([clipboardItem]);
        console.log('现代Clipboard API复制成功');
        return;
      }
    } catch (error) {
      console.warn('现代Clipboard API失败，尝试传统方法:', error);
    }

    // 后备方案：使用传统的execCommand方法
    console.log('使用传统execCommand方法...');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.opacity = '0';
    document.body.appendChild(tempDiv);

    try {
      // 选择内容
      const range = document.createRange();
      range.selectNodeContents(tempDiv);
      
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        
        // 复制富文本
        const successful = document.execCommand('copy');
        if (!successful) {
          throw new Error('execCommand复制失败');
        }
        console.log('传统方法复制成功');
      } else {
        throw new Error('无法获取选择对象');
      }
    } finally {
      // 清理
      document.body.removeChild(tempDiv);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleExportHTML}
        className="btn-success"
        title="导出为HTML文件"
      >
        <Download size={14} />
        导出HTML
      </button>
      
      <button
        onClick={handleCopyToClipboard}
        className="btn-copy-content"
        disabled={isCopying}
        title="复制内容到剪贴板，可直接粘贴到微信公众号编辑器"
      >
        {isCopying ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>复制中...</span>
          </>
        ) : (
          <>
            <Upload size={14} />
            <span>复制内容</span>
          </>
        )}
      </button>
    </div>
  );
};

export default HtmlExporter; 