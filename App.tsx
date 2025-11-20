import React, { useState, useRef } from 'react';
import { ResumePreview } from './components/ResumePreview';
import { Editor } from './components/Editor';
import { INITIAL_RESUME_DATA } from './constants';
import { ResumeData } from './types';
import { Download, Printer, Share2, FileImage } from 'lucide-react';
// @ts-ignore - dom-to-image 没有 TypeScript 类型定义
import domtoimage from 'dom-to-image';
import jsPDF from 'jspdf';

export default function App() {
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const previewElement = previewRef.current;

      // 使用 2 倍分辨率以提高导出质量
      const scale = 2;
      const width = previewElement.offsetWidth * scale;
      const height = previewElement.offsetHeight * scale;

      // 使用 dom-to-image，对 clip-path 支持更好
      const dataUrl = await domtoimage.toPng(previewElement, {
        quality: 1,
        width: width,
        height: height,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${previewElement.offsetWidth}px`,
          height: `${previewElement.offsetHeight}px`
        }
      });

      // 创建一个临时 Image 对象来获取尺寸
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // 计算缩放比例
      const imgHeightInPdf = (img.height * pdfWidth) / img.width;

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, imgHeightInPdf);
      pdf.save(`${resumeData.basics.name}_Resume.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Could not generate PDF. Please try printing to PDF instead.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPNG = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const previewElement = previewRef.current;

      // 使用 2 倍分辨率以提高导出质量
      const scale = 2;
      const width = previewElement.offsetWidth * scale;
      const height = previewElement.offsetHeight * scale;

      // 使用 dom-to-image，对 clip-path 支持更好
      const dataUrl = await domtoimage.toPng(previewElement, {
        quality: 1,
        width: width,
        height: height,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${previewElement.offsetWidth}px`,
          height: `${previewElement.offsetHeight}px`
        }
      });

      const link = document.createElement('a');
      link.download = `${resumeData.basics.name}_Resume.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("PNG Generation Error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 font-sans">
      {/* Left Sidebar - Editor */}
      <div className="w-1/3 min-w-[350px] max-w-[500px] h-full z-10">
        <Editor data={resumeData} onChange={setResumeData} />
      </div>

      {/* Right Area - Preview & Toolbar */}
      <div className="flex-1 flex flex-col h-full relative">

        {/* Toolbar */}
        <div className="bg-white border-b p-4 flex justify-between items-center shadow-sm z-20">
          <div className="text-gray-600 text-sm font-medium">
            <span className="bg-black text-white px-2 py-0.5 rounded text-xs mr-2">A4</span>
            预览模式
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportPNG} disabled={isExporting} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors text-sm font-medium">
              <FileImage size={16} />
              {isExporting ? '导出中...' : '下载 PNG'}
            </button>
            <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-black text-white rounded transition-colors text-sm font-medium shadow-md">
              <Download size={16} />
              {isExporting ? '生成中...' : '下载 PDF'}
            </button>
          </div>
        </div>

        {/* Preview Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-200/50 flex justify-center">
          <div className="scale-[0.85] md:scale-100 origin-top transition-transform duration-300">
            <ResumePreview ref={previewRef} data={resumeData} />
          </div>
        </div>
      </div>
    </div>
  );
}
