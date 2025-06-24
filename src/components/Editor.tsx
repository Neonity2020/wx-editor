import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  FolderOpen,
} from 'lucide-react';
import { createImageUploadService } from '../services/imageUpload';
import { databaseService } from '../services/database';
import ImageManager from './ImageManager';
import bearBanner from '../assets/bear-banner.jpg';

interface EditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const Editor: React.FC<EditorProps> = ({ content = '', onChange, onImageUpload }) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showImageManager, setShowImageManager] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // 创建图片上传服务实例
  const imageUploadService = createImageUploadService(databaseService);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-sm',
        },
        allowBase64: true,
        inline: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-800 transition-colors',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor) {
      const currentContent = editor.getHTML();
      
      // 只在内容真正不同时才更新，避免在用户编辑时重置光标
      if (content !== currentContent) {
        // 保存当前光标位置
        const { from, to } = editor.state.selection;
        
        // 设置新内容
        editor.commands.setContent(content, false);
        
        // 尝试恢复光标位置，如果位置无效则保持默认
        setTimeout(() => {
          try {
            const newState = editor.state;
            if (from <= newState.doc.content.size && to <= newState.doc.content.size) {
              editor.commands.setTextSelection({ from, to });
            }
          } catch {
            // 如果恢复光标位置失败，忽略错误
          }
        }, 0);
      }
    }
  }, [content, editor]);

  // 处理粘贴事件
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      if (!editor || isUploading) return;

      const items = event.clipboardData?.items;
      if (!items) return;

      let hasImage = false;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          hasImage = true;
          break;
        }
      }

      if (hasImage) {
        event.preventDefault();
        setIsUploading(true);
        
        try {
          console.log('检测到图片粘贴，开始处理...');
          
          // 创建图片上传服务实例
          const imageUploadService = createImageUploadService(databaseService);
          
          const imageUrl = await imageUploadService.handlePasteImage(event);
          if (imageUrl) {
            console.log('图片上传成功，URL:', imageUrl);
            editor.chain().focus().setImage({ src: imageUrl }).run();
          } else {
            console.error('图片上传失败：未返回URL');
            alert('图片上传失败，请检查PicGo配置或网络连接');
          }
        } catch (error) {
          console.error('粘贴图片失败:', error);
          alert(`图片上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
        } finally {
          setIsUploading(false);
        }
      }
    };

    const editorElement = editorRef.current;
    if (editorElement) {
      editorElement.addEventListener('paste', handlePaste);
    }

    return () => {
      if (editorElement) {
        editorElement.removeEventListener('paste', handlePaste);
      }
    };
  }, [editor, isUploading, imageUploadService]);

  if (!editor) {
    return null;
  }

  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsUploading(true);
        try {
          let url: string;
          if (onImageUpload) {
            url = await onImageUpload(file);
          } else {
            url = await imageUploadService.uploadImage(file);
          }
          editor.chain().focus().setImage({ src: url }).run();
        } catch (error) {
          console.error('图片上传失败:', error);
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
  };

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const handleSelectImage = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run();
    setShowImageManager(false);
  };

  return (
    <div className="editor-container" style={{ background: 'none', backgroundColor: 'transparent' }}>
      {/* 工具栏 */}
      <div className="editor-toolbar">
        {/* 文本格式 */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`toolbar-button ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
            title="标题 1"
          >
            <Heading1 size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
            title="标题 2"
          >
            <Heading2 size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`toolbar-button ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
            title="标题 3"
          >
            <Heading3 size={16} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`toolbar-button ${editor.isActive('bold') ? 'is-active' : ''}`}
            title="粗体"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`toolbar-button ${editor.isActive('italic') ? 'is-active' : ''}`}
            title="斜体"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`toolbar-button ${editor.isActive('underline') ? 'is-active' : ''}`}
            title="下划线"
          >
            <UnderlineIcon size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`toolbar-button ${editor.isActive('highlight') ? 'is-active' : ''}`}
            title="高亮"
          >
            <Highlighter size={16} />
          </button>
        </div>

        {/* 列表和引用 */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`toolbar-button ${editor.isActive('bulletList') ? 'is-active' : ''}`}
            title="无序列表"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`toolbar-button ${editor.isActive('orderedList') ? 'is-active' : ''}`}
            title="有序列表"
          >
            <ListOrdered size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`toolbar-button ${editor.isActive('blockquote') ? 'is-active' : ''}`}
            title="引用"
          >
            <Quote size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`toolbar-button ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
            title="代码块"
          >
            <Code size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`toolbar-button ${editor.isActive('code') ? 'is-active' : ''}`}
            title="内联代码"
          >
            <Code size={16} />
          </button>
        </div>

        {/* 对齐方式 */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
            title="左对齐"
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
            title="居中对齐"
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
            title="右对齐"
          >
            <AlignRight size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}`}
            title="两端对齐"
          >
            <AlignJustify size={16} />
          </button>
        </div>

        {/* 插入元素 */}
        <div className="toolbar-group">
          <button
            onClick={addImage}
            className={`toolbar-button ${isUploading ? 'is-loading' : ''}`}
            title="插入图片"
            disabled={isUploading}
          >
            <ImageIcon size={16} />
            {isUploading && <span className="loading-spinner"></span>}
          </button>
          <button
            onClick={() => setShowImageManager(true)}
            className="toolbar-button"
            title="图片管理器"
          >
            <FolderOpen size={16} />
          </button>
          <button
            onClick={() => setShowLinkInput(!showLinkInput)}
            className={`toolbar-button ${editor.isActive('link') ? 'is-active' : ''}`}
            title="插入链接"
          >
            <LinkIcon size={16} />
          </button>
          <button
            onClick={addTable}
            className="toolbar-button"
            title="插入表格"
          >
            <TableIcon size={16} />
          </button>
          <button
            onClick={() => setShowBanner(!showBanner)}
            className={`toolbar-button ${showBanner ? 'is-active' : ''}`}
            title={showBanner ? '隐藏Banner' : '显示Banner'}
          >
            <ImageIcon size={16} />
          </button>
        </div>

        {/* 颜色选择 */}
        <div className="toolbar-group">
          <input
            type="color"
            onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
            className="color-picker"
            title="文字颜色"
          />
        </div>
      </div>

      {/* 链接输入框 */}
      {showLinkInput && (
        <div className="link-input-container">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="输入链接地址..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="link-input"
              onKeyDown={(e) => e.key === 'Enter' && setLink()}
            />
            <button
              onClick={setLink}
              className="btn-primary"
            >
              确定
            </button>
            <button
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl('');
              }}
              className="btn-secondary"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 编辑器内容区域 */}
      <div 
        ref={editorRef}
        className="editor-content" 
        style={{ background: 'none', backgroundColor: 'transparent' }}
      >
        {/* Banner */}
        {showBanner && (
          <div className="editor-banner">
            <img 
              src={bearBanner} 
              alt="Bear Banner" 
              className="banner-image"
            />
          </div>
        )}

        <EditorContent editor={editor} />
        {isUploading && (
          <div className="upload-indicator">
            <div className="upload-spinner"></div>
            <span>正在上传图片...</span>
          </div>
        )}
      </div>

      {/* 图片管理器 */}
      <ImageManager
        isOpen={showImageManager}
        onClose={() => setShowImageManager(false)}
        onSelectImage={handleSelectImage}
      />
    </div>
  );
};

export default Editor;