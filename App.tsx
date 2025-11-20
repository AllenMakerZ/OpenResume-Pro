import React, { useState, useRef, useEffect } from 'react';
import { ResumePreview } from './components/ResumePreview';
import { Editor } from './components/Editor';
import { INITIAL_RESUME_DATA } from './constants';
import { ResumeData, LayoutSettings } from './types';
import { Download, Printer, FileImage, Images, FileText, RotateCcw, Type, ArrowUpDown, Maximize } from 'lucide-react';
// @ts-ignore - dom-to-image 没有 TypeScript 类型定义
import domtoimage from 'dom-to-image';
import jsPDF from 'jspdf';

// 默认布局配置：宽松适中，适合 A4
const DEFAULT_LAYOUT: LayoutSettings = {
  fontSize: 14,
  lineHeight: 1.6,
  pagePadding: 14
};

export default function App() {
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('resumeData');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: ensure sectionOrder exists
      if (!parsed.sectionOrder) {
        parsed.sectionOrder = ['education', 'work', 'projects', 'others', 'summary'];
      }
      return parsed;
    }
    return INITIAL_RESUME_DATA;
  });

  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(() => {
    const saved = localStorage.getItem('layoutSettings');
    if (saved) {
      return JSON.parse(saved);
    }
    return DEFAULT_LAYOUT;
  });

  const previewRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'image' | 'pdf'>('pdf');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  // Persist data
  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  // Persist layout settings
  useEffect(() => {
    localStorage.setItem('layoutSettings', JSON.stringify(layoutSettings));
  }, [layoutSettings]);

  useEffect(() => {
    if (!previewRef.current) return;

    const updatePageCount = () => {
      if (!previewRef.current) return;
      const heightPx = previewRef.current.offsetHeight;
      // A4 height in px at 96DPI is approx 1123px (297mm)
      const pageHeight = 1123;
      // Use -1 tolerance to handle potential sub-pixel rounding differences
      setTotalPages(Math.max(1, Math.ceil((heightPx - 1) / pageHeight)));
    };

    // Initial check
    updatePageCount();

    const resizeObserver = new ResizeObserver(updatePageCount);
    resizeObserver.observe(previewRef.current);
    return () => resizeObserver.disconnect();
  }, [viewMode, resumeData, layoutSettings]);

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (window.confirm('确定要重置所有数据吗？这将清除您的当前编辑和排版设置。')) {
      setResumeData(INITIAL_RESUME_DATA);
      setLayoutSettings(DEFAULT_LAYOUT);
      localStorage.removeItem('resumeData');
      localStorage.removeItem('layoutSettings');
    }
  };

  // Range Generators
  const fontSizes = Array.from({ length: 9 }, (_, i) => 10 + i); // 10 to 18
  const lineHeights = Array.from({ length: 11 }, (_, i) => (1.0 + i * 0.1).toFixed(1)); // 1.0 to 2.0
  // 10mm to 24mm, step 2. (Removed > 24mm as requested)
  const paddings = Array.from({ length: 8 }, (_, i) => 10 + i * 2);

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
        <div className="bg-white border-b px-4 min-h-[68px] flex justify-between items-center shadow-sm z-20 print:hidden flex-wrap gap-y-2">
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

            <div className="text-gray-500 text-xs font-medium whitespace-nowrap">
              共 {totalPages} 页 A4
            </div>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            {/* Layout Controls */}
            <div className="flex items-center gap-2 mr-2">

              {/* Font Size Select */}
              <div className="relative flex items-center" title="字体大小 (px)">
                <Type size={14} className="absolute left-2 text-gray-500 pointer-events-none" />
                <select
                  value={layoutSettings.fontSize}
                  onChange={(e) => setLayoutSettings(s => ({ ...s, fontSize: Number(e.target.value) }))}
                  className="pl-7 pr-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none hover:bg-gray-50 cursor-pointer"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                >
                  {fontSizes.map(size => (
                    <option key={size} value={size}>{size} px</option>
                  ))}
                </select>
              </div>

              {/* Line Height Select */}
              <div className="relative flex items-center" title="行高倍数">
                <ArrowUpDown size={14} className="absolute left-2 text-gray-500 pointer-events-none" />
                <select
                  value={layoutSettings.lineHeight}
                  onChange={(e) => setLayoutSettings(s => ({ ...s, lineHeight: Number(e.target.value) }))}
                  className="pl-7 pr-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none hover:bg-gray-50 cursor-pointer"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                >
                  {lineHeights.map(lh => (
                    <option key={lh} value={lh}>{lh} x</option>
                  ))}
                </select>
              </div>

              {/* Page Padding Select */}
              <div className="relative flex items-center" title="页边距 (mm)">
                <Maximize size={14} className="absolute left-2 text-gray-500 pointer-events-none" />
                <select
                  value={layoutSettings.pagePadding}
                  onChange={(e) => setLayoutSettings(s => ({ ...s, pagePadding: Number(e.target.value) }))}
                  className="pl-7 pr-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none hover:bg-gray-50 cursor-pointer"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                >
                  {paddings.map(p => (
                    <option key={p} value={p}>{p} mm</option>
                  ))}
                </select>
              </div>
            </div>

            <button onClick={handleReset} className="flex items-center gap-2 px-3 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded transition-colors text-sm font-medium" title="重置为默认模版">
              <RotateCcw size={16} />
              <span className="hidden sm:inline">重置</span>
            </button>
            <button onClick={handlePrint} className="hidden lg:flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded transition-colors text-sm font-medium shadow-md" title="推荐使用此方式，可保留超链接和文字选中功能">
              <Printer size={16} />
              打印/另存为PDF（推荐）
            </button>

            {/* Combined Download Button */}
            <div className="relative">
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded transition-colors text-sm font-medium"
              >
                <Download size={16} />
                下载
              </button>

              {showDownloadMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowDownloadMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-40 animate-fade-in">
                    <button
                      onClick={() => { handleExportPNG(); setShowDownloadMenu(false); }}
                      disabled={isExporting}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FileImage size={16} />
                      下载为 PNG
                    </button>
                    <button
                      onClick={() => { handleExportPDF(); setShowDownloadMenu(false); }}
                      disabled={isExporting}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FileText size={16} />
                      下载为 PDF（图片版）
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Preview Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-200/50 flex justify-center print:p-0 print:m-0 print:bg-white print:overflow-visible print:h-auto print:block">
          <div className="scale-[0.85] md:scale-100 origin-top transition-transform duration-300 print:transform-none print:scale-100 print:w-full print:h-auto">
            <ResumePreview ref={previewRef} data={resumeData} viewMode={viewMode} layoutSettings={layoutSettings} />
          </div>
        </div>
      </div>
    </div>
  );
}
