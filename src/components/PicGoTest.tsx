import React, { useState } from 'react';
import { createImageUploadService } from '../services/imageUpload';
import { databaseService } from '../services/database';

const PicGoTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  const testPicGoConnection = async () => {
    setIsTesting(true);
    setTestResult('正在测试PicGo连接...');
    
    try {
      const imageUploadService = createImageUploadService(databaseService);
      
      // 创建一个测试图片
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText('TEST', 20, 60);
      }
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'test.png', { type: 'image/png' });
          
          try {
            const url = await imageUploadService.uploadImage(file);
            setTestResult(`✅ PicGo连接成功！测试图片URL: ${url}`);
          } catch (error) {
            setTestResult(`❌ PicGo连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
          }
        } else {
          setTestResult('❌ 无法创建测试图片');
        }
        setIsTesting(false);
      }, 'image/png');
      
    } catch (error) {
      setTestResult(`❌ 测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setIsTesting(false);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">PicGo连接测试</h3>
      
      <button
        onClick={testPicGoConnection}
        disabled={isTesting}
        className="btn-primary mb-4"
      >
        {isTesting ? '测试中...' : '测试PicGo连接'}
      </button>
      
      {testResult && (
        <div className={`p-3 rounded-lg ${
          testResult.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>请确保：</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>PicGo应用已启动</li>
          <li>PicGo服务器地址为: http://127.0.0.1:36677</li>
          <li>PicGo已配置图床服务</li>
        </ul>
      </div>
    </div>
  );
};

export default PicGoTest; 