import React, { useState, useRef, useEffect } from 'react';
import { ResumePreview } from './components/ResumePreview';
import { Editor } from './components/Editor';
import { INITIAL_RESUME_DATA } from './constants';
import { ResumeData } from './types';
import { Download, Printer, FileImage, Images, FileText } from 'lucide-react';
// @ts-ignore - dom-to-image 没有 TypeScript 类型定义
import domtoimage from 'dom-to-image';
import jsPDF from 'jspdf';

export default function App() {
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('resumeData');
    return saved ? JSON.parse(saved) : INITIAL_RESUME_DATA;
  });

  const previewRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'image' | 'pdf'>('image');

  // Persist data
  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  useEffect(() => {
    if (!previewRef.current) return;

    const updatePageCount = () => {
      if (!previewRef.current) return;
      const heightPx = previewRef.current.offsetHeight;
      // A4 height in px at 96DPI is approx 1123px (297mm)
      // Using a slightly smaller value to ensure we catch the overflow correctly
      const pageHeight = 1122;
      setTotalPages(Math.max(1, Math.ceil(heightPx / pageHeight)));
    };

    // Initial check
    updatePageCount();

    const resizeObserver = new ResizeObserver(updatePageCount);
    resizeObserver.observe(previewRef.current);
    return () => resizeObserver.disconnect();
  }, [viewMode, resumeData]); // Re-run on view mode or data change

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
          height: `${previewElement.offsetHeight}px`,
          // Ensure margins are reset/ignored for image export if needed, 
          // but usually user sees what they get.
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
    <div className="flex h-screen overflow-hidden bg-gray-100 font-sans print:h-auto print:overflow-visible print:block">
      {/* Left Sidebar - Editor */}
      <div className="w-1/3 min-w-[350px] max-w-[500px] h-full z-10 print:hidden">
        <Editor data={resumeData} onChange={setResumeData} />
      </div>

      {/* Right Area - Preview & Toolbar */}
      <div className="flex-1 flex flex-col h-full relative print:block print:h-auto print:static">

        {/* Toolbar */}
        <div className="bg-white border-b p-4 flex justify-between items-center shadow-sm z-20 print:hidden">
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('image')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'image' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Images size={14} />
                图片预览
              </button>
              <button
                onClick={() => setViewMode('pdf')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'pdf' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FileText size={14} />
                PDF 预览
              </button>
            </div>

            <div className="h-4 w-px bg-gray-200" />

            <div className="text-gray-500 text-xs font-medium">
              共 {totalPages} 页
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded transition-colors text-sm font-medium shadow-md" title="推荐使用此方式，可保留超链接和文字选中功能">
              <Printer size={16} />
              打印 / 另存为 PDF (推荐)
            </button>
            <button onClick={handleExportPNG} disabled={isExporting} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded transition-colors text-sm font-medium">
              <FileImage size={16} />
              {isExporting ? '导出中...' : '下载 PNG'}
            </button>
            <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded transition-colors text-sm font-medium">
              <Download size={16} />
              {isExporting ? '生成中...' : '下载 PDF (图片版)'}
            </button>
          </div>
        </div>

        {/* Preview Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-200/50 flex justify-center print:p-0 print:m-0 print:bg-white print:overflow-visible print:h-auto print:block">
          <div className="scale-[0.85] md:scale-100 origin-top transition-transform duration-300 print:transform-none print:scale-100 print:w-full print:h-auto">
            <ResumePreview ref={previewRef} data={resumeData} viewMode={viewMode} />
          </div>
        </div>
      </div>
    </div>
  );
}
