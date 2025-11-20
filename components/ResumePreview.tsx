import React, { forwardRef, useLayoutEffect } from 'react';
import { ResumeData, SectionKey, LayoutSettings } from '../types';
import { SectionHeader } from './SectionHeader';

interface ResumePreviewProps {
  data: ResumeData;
  viewMode: 'image' | 'pdf';
  layoutSettings: LayoutSettings;
}

// A4 height in px at 96 DPI is approx 1123px (297mm)
const A4_HEIGHT_PX = 1123;
// Gap between pages in PDF preview mode
const PAGE_GAP_PX = 20;

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ data, viewMode, layoutSettings }, ref) => {

  const { fontSize, lineHeight, pagePadding } = layoutSettings;

  // Helper to calculate derived font sizes
  // Standard ratios: 
  // Name: ~2.2x (30px for 14px base)
  // Headers: ~1.15x (16px for 14px base) - kept subtle as per original design which used text-base for headers vs text-sm body
  // Small text: ~0.85x
  const nameSize = Math.round(fontSize * 2.2);
  const headerSize = Math.round(fontSize * 1.15); 
  const smallSize = Math.max(10, Math.round(fontSize * 0.85));
  
  // Padding string
  const paddingStr = `${pagePadding}mm`;

  useLayoutEffect(() => {
    const container = (ref as React.MutableRefObject<HTMLDivElement>).current;
    if (!container) return;

    // 1. Reset all margins first
    const elements = container.querySelectorAll<HTMLElement>('.break-inside-avoid');
    elements.forEach(el => {
      el.style.marginTop = '';
      el.style.paddingTop = '';
      el.style.borderTop = '';
    });

    if (viewMode === 'pdf') {
      // 2. Calculate and apply breaks for Preview Mode Only
      const containerStyle = window.getComputedStyle(container);
      const paddingTop = parseFloat(containerStyle.paddingTop);
      const containerRect = container.getBoundingClientRect();

      elements.forEach(el => {
         const rect = el.getBoundingClientRect();
         const currentTopFromPaper = rect.top - containerRect.top; 
         const currentBottomFromPaper = currentTopFromPaper + rect.height;

         let pageIndex = 0;
         let pageStart = 0;
         let pageEnd = A4_HEIGHT_PX;

         while (currentTopFromPaper > pageEnd + PAGE_GAP_PX) {
            pageIndex++;
            pageStart = pageIndex * (A4_HEIGHT_PX + PAGE_GAP_PX);
            pageEnd = pageStart + A4_HEIGHT_PX;
         }

         if (currentBottomFromPaper > pageEnd) {
             const nextPageStart = (pageIndex + 1) * (A4_HEIGHT_PX + PAGE_GAP_PX);
             const targetTop = nextPageStart + paddingTop;
             const shift = targetTop - currentTopFromPaper;
             
             if (shift > 0) {
                 el.style.marginTop = `${shift}px`;
             }
         }
      });
    }

  }, [data, viewMode, ref, layoutSettings]);

  const renderSection = (key: SectionKey) => {
      if (!data.sections[key].visible) return null;

      switch (key) {
          case 'education':
              return (
                <section key={key} className="break-inside-avoid mb-4">
                    <SectionHeader title={data.sections.education.title} />
                    {data.education.map((edu) => (
                    <div key={edu.id} className="flex justify-between mb-2 items-baseline break-inside-avoid">
                        <div className="flex-1">
                        <div className="font-bold text-black" style={{ fontSize: headerSize }}>{edu.school}</div>
                        <div className="text-gray-700" style={{ fontSize: fontSize }}>{edu.degree}</div>
                        </div>
                        <div className="text-right min-w-[180px]">
                        <div className="font-medium text-black" style={{ fontSize: fontSize }}>{edu.startDate} - {edu.endDate}</div>
                        <div className="text-gray-600" style={{ fontSize: fontSize }}>{edu.location}</div>
                        </div>
                    </div>
                    ))}
                </section>
              );
          case 'work':
              return (
                <section key={key} className="break-inside-avoid mb-4">
                    <SectionHeader title={data.sections.work.title} />
                    {data.work.map((job) => (
                    <div key={job.id} className="mb-4 break-inside-avoid">
                        <div className="flex justify-between items-baseline mb-1">
                        <div className="font-bold text-black" style={{ fontSize: headerSize }}>
                            {job.company} {job.position && <span>- {job.position}</span>}
                        </div>
                        <div className="text-right min-w-[180px]">
                            <div className="font-medium text-black" style={{ fontSize: fontSize }}>{job.startDate} - {job.endDate}</div>
                            <div className="text-gray-600" style={{ fontSize: fontSize }}>{job.location}</div>
                        </div>
                        </div>
                        <div 
                            className="text-gray-800 text-justify [&>ul]:list-disc [&>ul]:list-outside [&>ul]:ml-4 [&>ul]:space-y-0.5 [&>ol]:list-decimal [&>ol]:list-outside [&>ol]:ml-4 [&>ol]:space-y-0.5 [&_li]:mb-0 [&_a]:text-black [&_a]:underline [&_a]:decoration-gray-500 [&_a]:underline-offset-2" 
                            style={{ fontSize: fontSize, lineHeight: lineHeight }}
                            dangerouslySetInnerHTML={{ __html: job.details }} 
                        />
                    </div>
                    ))}
                </section>
              );
          case 'projects':
              return (
                <section key={key} className="break-inside-avoid mb-4">
                    <SectionHeader title={data.sections.projects.title} />
                    {data.projects.map((proj) => (
                    <div key={proj.id} className="mb-4 break-inside-avoid">
                        <div className="flex justify-between items-baseline mb-1">
                        <div className="font-bold text-black" style={{ fontSize: headerSize }}>
                            {proj.name} {proj.role && <span>- {proj.role}</span>}
                        </div>
                        <div className="text-right min-w-[180px]">
                            <div className="font-medium text-black" style={{ fontSize: fontSize }}>{proj.startDate} - {proj.endDate}</div>
                            <div className="text-gray-600" style={{ fontSize: fontSize }}>{proj.location}</div>
                        </div>
                        </div>
                        <div 
                            className="text-gray-800 text-justify [&>ul]:list-disc [&>ul]:list-outside [&>ul]:ml-4 [&>ul]:space-y-0.5 [&>ol]:list-decimal [&>ol]:list-outside [&>ol]:ml-4 [&>ol]:space-y-0.5 [&_li]:mb-0 [&_a]:text-black [&_a]:underline [&_a]:decoration-gray-500 [&_a]:underline-offset-2" 
                            style={{ fontSize: fontSize, lineHeight: lineHeight }}
                            dangerouslySetInnerHTML={{ __html: proj.details }} 
                        />
                    </div>
                    ))}
                </section>
              );
          case 'others':
              return (
                <section key={key} className="break-inside-avoid mb-4">
                    <SectionHeader title={data.sections.others.title} />
                    <ul className="list-none space-y-1">
                    {data.others.map((item) => (
                        <li key={item.id} className="flex break-inside-avoid">
                            <span className="font-bold text-black min-w-[100px]" style={{ fontSize: fontSize }}>{item.label}：</span>
                            <span className="text-gray-800" style={{ fontSize: fontSize, lineHeight: lineHeight }}>{item.content}</span>
                        </li>
                    ))}
                    </ul>
                </section>
              );
          case 'summary':
              return (
                <section key={key} className="break-inside-avoid mb-4">
                    <SectionHeader title={data.sections.summary.title} />
                    <div 
                            className="text-gray-800 text-justify [&>ul]:list-disc [&>ul]:list-outside [&>ul]:ml-4 [&>ul]:space-y-0.5 [&>ol]:list-decimal [&>ol]:list-outside [&>ol]:ml-4 [&>ol]:space-y-0.5 [&_li]:mb-0 [&_a]:text-black [&_a]:underline [&_a]:decoration-gray-500 [&_a]:underline-offset-2" 
                            style={{ fontSize: fontSize, lineHeight: lineHeight }}
                            dangerouslySetInnerHTML={{ __html: data.summary }} 
                        />
                </section>
              );
          default:
              return null;
      }
  }

  return (
    <div 
        ref={ref} 
        id="resume-preview" 
        className={`a4-paper relative font-sans text-gray-800 ${viewMode === 'pdf' ? 'shadow-2xl' : ''}`}
        style={viewMode === 'pdf' ? {
             minHeight: '297mm',
             backgroundImage: `linear-gradient(to bottom, white ${A4_HEIGHT_PX}px, #e5e7eb ${A4_HEIGHT_PX}px, #e5e7eb ${A4_HEIGHT_PX + PAGE_GAP_PX}px)`,
             backgroundSize: `100% ${A4_HEIGHT_PX + PAGE_GAP_PX}px`,
             backgroundColor: '#e5e7eb',
             padding: paddingStr,
             lineHeight: lineHeight
        } : {
             padding: paddingStr,
             lineHeight: lineHeight
        }}
    >
      <style>{`
        @media print {
          /* 重置 JS 计算的 margin */
          .break-inside-avoid {
            margin-top: 0 !important;
          }
          
          section {
            margin-bottom: 1.5rem; 
            break-inside: avoid;
          }
          
          /* 打印容器设置 */
          #resume-preview {
            background-color: white !important;
            background-image: none !important;
            /* 核心：移除所有 padding，由 Table Spacer 接管垂直边距 */
            padding: 0 !important; 
            height: auto !important;
            display: block !important;
          }
          
          /* Table Layout Hack */
          .print-container {
            display: table;
            width: 100%;
            border-collapse: collapse; /* Ensure no extra spacing */
            box-sizing: border-box;
          }
          
          .print-header-spacer {
            display: table-header-group;
            height: ${paddingStr};
            line-height: 0; /* Remove font-related spacing */
          }
          
          .print-footer-spacer {
            display: table-footer-group;
            height: ${paddingStr};
            line-height: 0;
          }
          
          .print-body {
            display: table-row-group;
          }
          
          .print-row {
            display: table-row;
          }
          
          .print-cell {
            display: table-cell;
            padding-left: ${paddingStr};
            padding-right: ${paddingStr};
          }
          
          .spacer-content {
             height: ${paddingStr}; 
             visibility: hidden;
             line-height: 0;
          }
        }
        
        @media screen {
          .print-header-spacer,
          .print-footer-spacer {
            display: none;
          }
        }
      `}</style>

      {/* Print Table Structure Wrapper */}
      <div className="print-container">
        <div className="print-header-spacer">
            <div className="print-row">
                <div className="print-cell">
                    <div className="spacer-content">&nbsp;</div>
                </div>
            </div>
        </div>

        <div className="print-body">
            <div className="print-row">
                <div className="print-cell">
                    {/* Content */}
                    <header className="mb-6 break-inside-avoid">
                        <h1 
                            className="font-extrabold text-black tracking-wider mb-1"
                            style={{ fontSize: nameSize }}
                        >
                            {data.basics.name}
                        </h1>
                        <p className="text-gray-600 font-medium" style={{ fontSize: smallSize }}>{data.basics.contactInfo}</p>
                        {data.basics.note && <p className="text-gray-500 mt-1" style={{ fontSize: smallSize }}>{data.basics.note}</p>}
                    </header>

                    {/* Render sections based on order */}
                    {data.sectionOrder.map(key => renderSection(key))}

                </div>
            </div>
        </div>
        
        <div className="print-footer-spacer">
             <div className="print-row">
                <div className="print-cell">
                    <div className="spacer-content">&nbsp;</div>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';