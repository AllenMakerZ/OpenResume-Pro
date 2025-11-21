import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ResumePreview } from './components/ResumePreview';
import { Editor } from './components/Editor';
import { INITIAL_RESUME_DATA } from './constants';
import { ResumeData, LayoutSettings } from './types';
import { Download, Printer, FileImage, Images, FileText, RotateCcw, Type, ArrowUpDown, Maximize, HelpCircle, X } from 'lucide-react';
// @ts-ignore - dom-to-image 没有 TypeScript 类型定义
import domtoimage from 'dom-to-image';
import jsPDF from 'jspdf';
// @ts-ignore - 直接以原始文本方式导入 README 用于「使用须知」模态框展示
import usageDoc from './README.md?raw';

// 与 ResumePreview 中保持一致：A4 高度约 1123px（对应 297mm）
const A4_HEIGHT_PX = 1123;
const A4_HEIGHT_MM = 297;

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
  const [showUsageModal, setShowUsageModal] = useState(false);

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
      // 方案 C：页数计算尽量贴近打印布局
      // 1. 将 mm 与 px 做一次统一换算
      const pxPerMm = A4_HEIGHT_PX / A4_HEIGHT_MM; // ≈ 3.78
      const paddingMm = layoutSettings.pagePadding;
      const paddingPx = paddingMm * pxPerMm;

      // 2. 屏幕预览下，container 的高度 = 内容高度 + 上下 padding
      const contentHeightPx = Math.max(0, heightPx - 2 * paddingPx);

      // 3. 打印时每一页「有效内容区」约为：A4 总高 - 上下 Table Spacer（与 pagePadding 对应）
      const effectivePageHeightPx = Math.max(1, (A4_HEIGHT_MM - 2 * paddingMm) * pxPerMm);

      // 4. 使用内容高度 / 有效页高来预估页数，减去 1px 作为容差，避免浮点误差导致「空白第二页」
      const estimatedPages = Math.ceil(Math.max(0, contentHeightPx - 1) / effectivePageHeightPx);
      setTotalPages(Math.max(1, estimatedPages));
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

  // 帮助方法：在「图片预览」布局下执行导出，确保导出的长图与图片预览一致（不做分页、不插入空白间隔）
  const runInImageView = async <T,>(task: () => Promise<T>): Promise<T> => {
    const prevMode = viewMode;
    if (prevMode !== 'image') {
      setViewMode('image');
      // 等待两帧，确保 React 完成重新渲染并更新 DOM
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    }
    try {
      return await task();
    } finally {
      if (prevMode !== 'image') {
        setViewMode(prevMode);
      }
    }
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
      await runInImageView(async () => {
        if (!previewRef.current) return;
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

        // 先用 A4 计算「目标宽度」，保持与 A4 等宽
        const temp = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = temp.internal.pageSize.getWidth();

        // 计算在该宽度下的图片高度（mm）
        const imgHeightInPdf = (img.height * pdfWidth) / img.width;

        // 使用自定义页面尺寸：宽度等同 A4，高度按整张长图自适应
        const pdf = new jsPDF('p', 'mm', [pdfWidth, imgHeightInPdf]);

        // 整张长图塞进单页 PDF，不截断高度
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, imgHeightInPdf);
        pdf.save(`${resumeData.basics.name}_Resume.pdf`);
      });
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
      await runInImageView(async () => {
        if (!previewRef.current) return;
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
      });
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
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-black hover:bg-gray-800 text-white rounded transition-colors text-sm font-medium shadow-md"
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

            {/* Usage Doc Button */}
            <button
              onClick={() => setShowUsageModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-black hover:bg-gray-800 text-white rounded transition-colors text-sm font-medium shadow-md"
              title="查看本工具的详细使用说明"
            >
              <HelpCircle size={16} />
              使用须知
            </button>
          </div>
        </div>

        {/* Preview Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-200/50 flex justify-center print:p-0 print:m-0 print:bg-white print:overflow-visible print:h-auto print:block">
          <div className="scale-[0.85] md:scale-100 origin-top transition-transform duration-300 print:transform-none print:scale-100 print:w-full print:h-auto">
            <ResumePreview ref={previewRef} data={resumeData} viewMode={viewMode} layoutSettings={layoutSettings} />
          </div>
        </div>

        {/* Usage Modal */}
        {showUsageModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 print:hidden">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-[90%] max-h-[80vh] flex flex-col">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h2 className="text-[20px] font-semibold text-gray-900">使用须知</h2>
                <button
                  onClick={() => setShowUsageModal(false)}
                  className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  aria-label="关闭使用须知"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="px-4 py-3 overflow-auto text-gray-800">
                <div className="usage-markdown leading-relaxed">
                  <ReactMarkdown>{usageDoc}</ReactMarkdown>
                </div>
              </div>
              <div className="px-4 py-2 border-t flex justify-end">
                <button
                  onClick={() => setShowUsageModal(false)}
                  className="px-3 py-1.5 text-[20px] font-medium rounded bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  我知道了
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
