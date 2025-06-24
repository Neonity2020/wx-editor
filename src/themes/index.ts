import type { Theme } from '../components/ThemeSelector';

export const themes: Theme[] = [
  {
    id: 'default',
    name: '默认主题',
    css: `
      .editor-content {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      
      .editor-content h1, .editor-content h2, .editor-content h3 {
        color: #2c3e50;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }
      
      .editor-content h1 { font-size: 2em; }
      .editor-content h2 { font-size: 1.5em; }
      .editor-content h3 { font-size: 1.25em; }
      
      .editor-content p {
        margin-bottom: 1em;
      }
      
      .editor-content blockquote {
        border-left: 4px solid #3498db;
        padding-left: 1em;
        margin: 1em 0;
        color: #666;
        font-style: italic;
      }
      
      .editor-content code {
        background-color: #f8f9fa;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      }
      
      .editor-content pre {
        background-color: #f8f9fa;
        padding: 1em;
        border-radius: 5px;
        overflow-x: auto;
      }
    `,
    preview: '默认的微信公众号样式'
  },
  {
    id: 'bear',
    name: 'Bear主题',
    css: `
      .editor-content {
        font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
        line-height: 1.7;
        color: #1d1d1f;
        font-weight: 400;
        letter-spacing: -0.003em;
      }
      
      .editor-content h1, .editor-content h2, .editor-content h3 {
        font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
        color: #1d1d1f;
        font-weight: 600;
        margin-top: 2.5em;
        margin-bottom: 1em;
        letter-spacing: -0.02em;
      }
      
      .editor-content h1 { 
        font-size: 2.2em; 
        font-weight: 700;
        margin-top: 2em;
        margin-bottom: 1.2em;
      }
      .editor-content h2 {
        color: #d70015; 
        font-size: 1.6em; 
        font-weight: 600;
        margin-top: 2.2em;
        margin-bottom: 0.8em;
      }
      .editor-content h3 { 
        color: #c0392b; 
        font-size: 1.3em; 
        font-weight: 600;
        margin-top: 1.8em;
        margin-bottom: 0.6em;
      }
      
      .editor-content p {
        margin-bottom: 1.2em;
        text-align: left;
        word-wrap: break-word;
      }
      
      .editor-content blockquote {
        position: relative;
        border-left: none;
        padding: 1.5em 2em;
        margin: 2em 0;
        background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
        border-radius: 12px;
        color: #742a2a;
        font-style: italic;
        font-weight: 400;
        box-shadow: 0 4px 15px rgba(220, 38, 38, 0.1);
        border: 1px solid #feb2b2;
      }
      
      .editor-content blockquote::before {
        content: '"';
        position: absolute;
        top: -10px;
        left: 20px;
        font-size: 4em;
        color: #dc2626;
        font-family: 'Georgia', serif;
        line-height: 1;
        opacity: 0.4;
      }
      
      .editor-content blockquote::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: linear-gradient(180deg, #dc2626 0%, #ef4444 100%);
        border-radius: 12px 0 0 12px;
      }
      
      .editor-content code {
        background-color: #f5f5f7;
        padding: 0.2em 0.4em;
        border-radius: 4px;
        font-family: 'SF Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        color: #d70015;
        font-size: 0.9em;
        font-weight: 500;
      }
      
      .editor-content pre {
        background-color: #f5f5f7;
        padding: 1.2em;
        border-radius: 8px;
        overflow-x: auto;
        border: 1px solid #e5e5e7;
        margin: 1.5em 0;
      }
      
      .editor-content pre code {
        background: none;
        padding: 0;
        color: #1d1d1f;
        font-size: 0.9em;
      }
      
      .editor-content ul, .editor-content ol {
        margin: 1em 0;
        padding-left: 1.5em;
      }
      
      .editor-content li {
        margin-bottom: 0.5em;
        line-height: 1.6;
      }
      
      .editor-content strong {
        font-weight: 600;
        color: #1d1d1f;
      }
      
      .editor-content em {
        font-style: italic;
        color: #515154;
      }
      
      .editor-content a {
        color: #007aff;
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: border-bottom-color 0.2s ease;
      }
      
      .editor-content a:hover {
        border-bottom-color: #007aff;
      }
      
      .editor-content img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 1.5em 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }
      
      .editor-content hr {
        border: none;
        height: 1px;
        background-color: #e5e5e7;
        margin: 2em 0;
      }
      
      .editor-content table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5em 0;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .editor-content th, .editor-content td {
        padding: 0.8em 1em;
        text-align: left;
        border-bottom: 1px solid #e5e5e7;
      }
      
      .editor-content th {
        background-color: #f5f5f7;
        font-weight: 600;
        color: #1d1d1f;
      }
      
      .editor-content td {
        background-color: white;
      }
      
      /* Bear主题项目符号/序号为红色 */
      .editor-content ul li::marker,
      .editor-content ol li::marker {
        color: #d70015;
      }
    `,
    preview: 'Bear笔记风格，优雅简洁'
  },
  {
    id: 'elegant',
    name: '优雅主题',
    css: `
      .editor-content {
        font-family: 'Georgia', 'Times New Roman', serif;
        line-height: 1.8;
        color: #2c3e50;
      }
      
      .editor-content h1, .editor-content h2, .editor-content h3 {
        color: #34495e;
        font-weight: 300;
        margin-top: 2em;
        margin-bottom: 0.8em;
      }
      
      .editor-content h1 { 
        font-size: 2.2em; 
        border-bottom: 2px solid #ecf0f1;
        padding-bottom: 0.3em;
      }
      .editor-content h2 { font-size: 1.6em; }
      .editor-content h3 { font-size: 1.3em; }
      
      .editor-content p {
        margin-bottom: 1.2em;
        text-align: justify;
      }
      
      .editor-content blockquote {
        border-left: 4px solid #9b59b6;
        padding: 1em 1.5em;
        margin: 1.5em 0;
        background-color: #f8f9fa;
        border-radius: 0 5px 5px 0;
        font-style: italic;
        color: #7f8c8d;
      }
      
      .editor-content code {
        background-color: #ecf0f1;
        padding: 0.3em 0.6em;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        color: #e74c3c;
      }
      
      .editor-content pre {
        background-color: #2c3e50;
        color: #ecf0f1;
        padding: 1.5em;
        border-radius: 8px;
        overflow-x: auto;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
    `,
    preview: '优雅的阅读体验'
  },
  {
    id: 'modern',
    name: '现代主题',
    css: `
      .editor-content {
        font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
        line-height: 1.7;
        color: #1a1a1a;
      }
      
      .editor-content h1, .editor-content h2, .editor-content h3 {
        color: #000;
        font-weight: 600;
        margin-top: 1.8em;
        margin-bottom: 0.6em;
      }
      
      .editor-content h1 { 
        font-size: 2.4em; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .editor-content h2 { font-size: 1.8em; }
      .editor-content h3 { font-size: 1.4em; }
      
      .editor-content p {
        margin-bottom: 1.1em;
      }
      
      .editor-content blockquote {
        border-left: 4px solid #667eea;
        padding: 1.2em 1.8em;
        margin: 1.8em 0;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        border-radius: 0 8px 8px 0;
        font-weight: 500;
      }
      
      .editor-content code {
        background-color: #f8f9fa;
        padding: 0.25em 0.5em;
        border-radius: 6px;
        font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
        color: #e74c3c;
        font-weight: 500;
      }
      
      .editor-content pre {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5em;
        border-radius: 12px;
        overflow-x: auto;
        box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
      }
    `,
    preview: '现代简约风格'
  },
  {
    id: 'wechat',
    name: '微信风格',
    css: `
      .editor-content {
        font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
        line-height: 1.75;
        color: #333;
        max-width: 100%;
      }
      
      .editor-content h1, .editor-content h2, .editor-content h3 {
        color: #333;
        font-weight: 600;
        margin-top: 1.5em;
        margin-bottom: 0.8em;
      }
      
      .editor-content h1 { 
        font-size: 1.8em; 
        text-align: center;
        color: #07c160;
      }
      .editor-content h2 { font-size: 1.4em; }
      .editor-content h3 { font-size: 1.2em; }
      
      .editor-content p {
        margin-bottom: 1em;
        text-align: justify;
      }
      
      .editor-content blockquote {
        border-left: 4px solid #07c160;
        padding: 1em 1.5em;
        margin: 1.5em 0;
        background-color: #f7f7f7;
        border-radius: 0 8px 8px 0;
        color: #666;
      }
      
      .editor-content code {
        background-color: #f7f7f7;
        padding: 0.2em 0.4em;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', monospace;
        color: #07c160;
      }
      
      .editor-content pre {
        background-color: #f7f7f7;
        padding: 1em;
        border-radius: 8px;
        overflow-x: auto;
        border: 1px solid #e5e5e5;
      }
      
      .editor-content img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
    `,
    preview: '微信公众号专用样式'
  },
  {
    id: 'dark',
    name: '夜间模式',
    css: `
      .editor-content {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #e2e8f0;
        background-color: #1a202c;
      }
      
      .editor-content h1, .editor-content h2, .editor-content h3 {
        color: #f7fafc;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }
      
      .editor-content h1 { 
        font-size: 2em; 
        color: #90cdf4;
      }
      .editor-content h2 { 
        font-size: 1.5em; 
        color: #81e6d9;
      }
      .editor-content h3 { 
        font-size: 1.25em; 
        color: #fbb6ce;
      }
      
      .editor-content p {
        margin-bottom: 1em;
        color: #e2e8f0;
      }
      
      .editor-content blockquote {
        border-left: 4px solid #4299e1;
        padding-left: 1em;
        margin: 1em 0;
        color: #a0aec0;
        font-style: italic;
        background-color: #2d3748;
        border-radius: 0 8px 8px 0;
        padding: 1em 1.5em;
      }
      
      .editor-content code {
        background-color: #2d3748;
        color: #f6ad55;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        border: 1px solid #4a5568;
      }
      
      .editor-content pre {
        background-color: #2d3748;
        color: #e2e8f0;
        padding: 1em;
        border-radius: 5px;
        overflow-x: auto;
        border: 1px solid #4a5568;
      }
      
      .editor-content ul, .editor-content ol {
        color: #e2e8f0;
      }
      
      .editor-content li {
        color: #e2e8f0;
      }
      
      .editor-content strong {
        color: #f7fafc;
      }
      
      .editor-content em {
        color: #a0aec0;
      }
      
      .editor-content a {
        color: #63b3ed;
      }
      
      .editor-content a:hover {
        color: #90cdf4;
      }
      
      .editor-content img {
        border: 1px solid #4a5568;
      }
      
      .editor-content hr {
        background-color: #4a5568;
      }
      
      .editor-content table {
        background-color: #2d3748;
        border: 1px solid #4a5568;
      }
      
      .editor-content th {
        background-color: #4a5568;
        color: #f7fafc;
      }
      
      .editor-content td {
        background-color: #2d3748;
        color: #e2e8f0;
        border-bottom: 1px solid #4a5568;
      }
    `,
    preview: '护眼的夜间阅读模式'
  },
  {
    id: 'bear-dark',
    name: 'Bear夜间主题',
    css: `
      .editor-content {
        font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
        line-height: 1.7;
        color: #f5f5f7;
        background-color: #1d1d1f;
        font-weight: 400;
        letter-spacing: -0.003em;
      }
      
      .editor-content h1, .editor-content h2, .editor-content h3 {
        font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
        color: #f5f5f7;
        font-weight: 600;
        margin-top: 2.5em;
        margin-bottom: 1em;
        letter-spacing: -0.02em;
      }
      
      .editor-content h1 { 
        font-size: 2.2em; 
        font-weight: 700;
        margin-top: 2em;
        margin-bottom: 1.2em;
        color: #ff6b6b;
      }
      .editor-content h2 {
        color: #ff8e8e; 
        font-size: 1.6em; 
        font-weight: 600;
        margin-top: 2.2em;
        margin-bottom: 0.8em;
      }
      .editor-content h3 { 
        color: #ffa5a5; 
        font-size: 1.3em; 
        font-weight: 600;
        margin-top: 1.8em;
        margin-bottom: 0.6em;
      }
      
      .editor-content p {
        margin-bottom: 1.2em;
        text-align: left;
        word-wrap: break-word;
        color: #f5f5f7;
      }
      
      .editor-content blockquote {
        position: relative;
        border-left: none;
        padding: 1.5em 2em;
        margin: 2em 0;
        background: linear-gradient(135deg, #2c2c2e 0%, #3a3a3c 100%);
        border-radius: 12px;
        color: #a1a1a6;
        font-style: italic;
        font-weight: 400;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        border: 1px solid #3a3a3c;
      }
      
      .editor-content blockquote::before {
        content: '“';
        position: absolute;
        top: -10px;
        left: 20px;
        font-size: 4em;
        color: #0a84ff;
        font-family: 'Georgia', serif;
        line-height: 1;
        opacity: 0.3;
      }
      
      .editor-content blockquote::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: linear-gradient(180deg, #0a84ff 0%, #5ac8fa 100%);
        border-radius: 12px 0 0 12px;
      }
      
      .editor-content code {
        background-color: #2c2c2e;
        padding: 0.2em 0.4em;
        border-radius: 4px;
        font-family: 'SF Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        color: #ff6b6b;
        font-size: 0.9em;
        font-weight: 500;
        border: 1px solid #3a3a3c;
      }
      
      .editor-content pre {
        background-color: #2c2c2e;
        padding: 1.2em;
        border-radius: 8px;
        overflow-x: auto;
        border: 1px solid #3a3a3c;
        margin: 1.5em 0;
        color: #f5f5f7;
      }
      
      .editor-content pre code {
        background: none;
        padding: 0;
        color: #f5f5f7;
        font-size: 0.9em;
        border: none;
      }
      
      .editor-content ul, .editor-content ol {
        margin: 1em 0;
        padding-left: 1.5em;
        color: #f5f5f7;
      }
      
      .editor-content li {
        margin-bottom: 0.5em;
        line-height: 1.6;
        color: #f5f5f7;
      }
      
      .editor-content strong {
        font-weight: 600;
        color: #f5f5f7;
      }
      
      .editor-content em {
        font-style: italic;
        color: #a1a1a6;
      }
      
      .editor-content a {
        color: #0a84ff;
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: border-bottom-color 0.2s ease;
      }
      
      .editor-content a:hover {
        border-bottom-color: #0a84ff;
        color: #5ac8fa;
      }
      
      .editor-content img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 1.5em 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 1px solid #3a3a3c;
      }
      
      .editor-content hr {
        border: none;
        height: 1px;
        background-color: #3a3a3c;
        margin: 2em 0;
      }
      
      .editor-content table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5em 0;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        background-color: #2c2c2e;
        border: 1px solid #3a3a3c;
      }
      
      .editor-content th, .editor-content td {
        padding: 0.8em 1em;
        text-align: left;
        border-bottom: 1px solid #3a3a3c;
      }
      
      .editor-content th {
        background-color: #3a3a3c;
        font-weight: 600;
        color: #f5f5f7;
      }
      
      .editor-content td {
        background-color: #2c2c2e;
        color: #f5f5f7;
      }
      
      /* Bear夜间主题项目符号/序号为红色 */
      .editor-content ul li::marker,
      .editor-content ol li::marker {
        color: #ff6b6b;
      }
    `,
    preview: 'Bear笔记夜间风格，护眼舒适'
  },
  {
    id: 'modern-dark',
    name: '现代夜间主题',
    css: `
      .editor-content {
        font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
        line-height: 1.7;
        color: #e2e8f0;
        background-color: #0f172a;
      }
      
      .editor-content h1, .editor-content h2, .editor-content h3 {
        color: #f8fafc;
        font-weight: 600;
        margin-top: 1.8em;
        margin-bottom: 0.6em;
      }
      
      .editor-content h1 { 
        font-size: 2.4em; 
        background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .editor-content h2 { 
        font-size: 1.8em; 
        color: #93c5fd;
      }
      .editor-content h3 { 
        font-size: 1.4em; 
        color: #c4b5fd;
      }
      
      .editor-content p {
        margin-bottom: 1.1em;
        color: #e2e8f0;
      }
      
      .editor-content blockquote {
        border-left: 4px solid #60a5fa;
        padding: 1.2em 1.8em;
        margin: 1.8em 0;
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        color: #f1f5f9;
        border-radius: 0 8px 8px 0;
        font-weight: 500;
        border: 1px solid #475569;
      }
      
      .editor-content code {
        background-color: #1e293b;
        padding: 0.25em 0.5em;
        border-radius: 6px;
        font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
        color: #fca5a5;
        font-weight: 500;
        border: 1px solid #475569;
      }
      
      .editor-content pre {
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        color: #f1f5f9;
        padding: 1.5em;
        border-radius: 12px;
        overflow-x: auto;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        border: 1px solid #475569;
      }
      
      .editor-content ul, .editor-content ol {
        color: #e2e8f0;
      }
      
      .editor-content li {
        color: #e2e8f0;
      }
      
      .editor-content strong {
        color: #f8fafc;
      }
      
      .editor-content em {
        color: #cbd5e1;
      }
      
      .editor-content a {
        color: #60a5fa;
      }
      
      .editor-content a:hover {
        color: #93c5fd;
      }
      
      .editor-content img {
        border: 1px solid #475569;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      
      .editor-content hr {
        background-color: #475569;
      }
      
      .editor-content table {
        background-color: #1e293b;
        border: 1px solid #475569;
      }
      
      .editor-content th {
        background-color: #334155;
        color: #f8fafc;
      }
      
      .editor-content td {
        background-color: #1e293b;
        color: #e2e8f0;
        border-bottom: 1px solid #475569;
      }
    `,
    preview: '现代简约夜间风格'
  },
  {
    id: 'elegant-dark',
    name: '优雅夜间主题',
    css: `
      .editor-content {
        font-family: 'Georgia', 'Times New Roman', serif;
        line-height: 1.8;
        color: #d1d5db;
        background-color: #111827;
      }
      
      .editor-content h1, .editor-content h2, .editor-content h3 {
        color: #f9fafb;
        font-weight: 300;
        margin-top: 2em;
        margin-bottom: 0.8em;
      }
      
      .editor-content h1 { 
        font-size: 2.2em; 
        border-bottom: 2px solid #374151;
        padding-bottom: 0.3em;
        color: #e5e7eb;
      }
      .editor-content h2 { 
        font-size: 1.6em; 
        color: #d1d5db;
      }
      .editor-content h3 { 
        font-size: 1.3em; 
        color: #9ca3af;
      }
      
      .editor-content p {
        margin-bottom: 1.2em;
        text-align: justify;
        color: #d1d5db;
      }
      
      .editor-content blockquote {
        border-left: 4px solid #8b5cf6;
        padding: 1em 1.5em;
        margin: 1.5em 0;
        background-color: #1f2937;
        border-radius: 0 5px 5px 0;
        font-style: italic;
        color: #9ca3af;
        border: 1px solid #374151;
      }
      
      .editor-content code {
        background-color: #1f2937;
        padding: 0.3em 0.6em;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        color: #f87171;
        border: 1px solid #374151;
      }
      
      .editor-content pre {
        background-color: #1f2937;
        color: #e5e7eb;
        padding: 1.5em;
        border-radius: 8px;
        overflow-x: auto;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        border: 1px solid #374151;
      }
      
      .editor-content ul, .editor-content ol {
        color: #d1d5db;
      }
      
      .editor-content li {
        color: #d1d5db;
      }
      
      .editor-content strong {
        color: #f9fafb;
      }
      
      .editor-content em {
        color: #9ca3af;
      }
      
      .editor-content a {
        color: #8b5cf6;
      }
      
      .editor-content a:hover {
        color: #a78bfa;
      }
      
      .editor-content img {
        border: 1px solid #374151;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      
      .editor-content hr {
        background-color: #374151;
      }
      
      .editor-content table {
        background-color: #1f2937;
        border: 1px solid #374151;
      }
      
      .editor-content th {
        background-color: #374151;
        color: #f9fafb;
      }
      
      .editor-content td {
        background-color: #1f2937;
        color: #d1d5db;
        border-bottom: 1px solid #374151;
      }
    `,
    preview: '优雅的夜间阅读体验'
  },
  {
    id: 'wechat-dark',
    name: '微信夜间主题',
    css: `
      .editor-content {
        font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
        line-height: 1.75;
        color: #e5e7eb;
        max-width: 100%;
        background-color: #1a1a1a;
      }
      
      .editor-content h1, .editor-content h2, .editor-content h3 {
        color: #f9fafb;
        font-weight: 600;
        margin-top: 1.5em;
        margin-bottom: 0.8em;
      }
      
      .editor-content h1 { 
        font-size: 1.8em; 
        text-align: center;
        color: #10b981;
      }
      .editor-content h2 { 
        font-size: 1.4em; 
        color: #34d399;
      }
      .editor-content h3 { 
        font-size: 1.2em; 
        color: #6ee7b7;
      }
      
      .editor-content p {
        margin-bottom: 1em;
        text-align: justify;
        color: #e5e7eb;
      }
      
      .editor-content blockquote {
        border-left: 4px solid #10b981;
        padding: 1em 1.5em;
        margin: 1.5em 0;
        background-color: #262626;
        border-radius: 0 8px 8px 0;
        color: #a3a3a3;
        border: 1px solid #404040;
      }
      
      .editor-content code {
        background-color: #262626;
        padding: 0.2em 0.4em;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', monospace;
        color: #10b981;
        border: 1px solid #404040;
      }
      
      .editor-content pre {
        background-color: #262626;
        padding: 1em;
        border-radius: 8px;
        overflow-x: auto;
        border: 1px solid #404040;
        color: #e5e7eb;
      }
      
      .editor-content img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 1px solid #404040;
      }
      
      .editor-content ul, .editor-content ol {
        color: #e5e7eb;
      }
      
      .editor-content li {
        color: #e5e7eb;
      }
      
      .editor-content strong {
        color: #f9fafb;
      }
      
      .editor-content em {
        color: #a3a3a3;
      }
      
      .editor-content a {
        color: #10b981;
      }
      
      .editor-content a:hover {
        color: #34d399;
      }
      
      .editor-content hr {
        background-color: #404040;
      }
      
      .editor-content table {
        background-color: #262626;
        border: 1px solid #404040;
      }
      
      .editor-content th {
        background-color: #404040;
        color: #f9fafb;
      }
      
      .editor-content td {
        background-color: #262626;
        color: #e5e7eb;
        border-bottom: 1px solid #404040;
      }
    `,
    preview: '微信公众号夜间专用样式'
  }
];

export const getThemeById = (id: string): Theme | undefined => {
  return themes.find(theme => theme.id === id);
};

export const getDefaultTheme = (): Theme => {
  return themes[0];
}; 