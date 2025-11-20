import React, { forwardRef, useLayoutEffect } from 'react';
import { ResumeData } from '../types';
import { SectionHeader } from './SectionHeader';

interface ResumePreviewProps {
  data: ResumeData;
  viewMode: 'image' | 'pdf';
}

// A4 height in px at 96 DPI is approx 1123px (297mm)
const A4_HEIGHT_PX = 1123;
// Gap between pages in PDF preview mode
const PAGE_GAP_PX = 20;

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ data, viewMode }, ref) => {

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

  }, [data, viewMode, ref]);

  return (
    <div 
        ref={ref} 
        id="resume-preview" 
        className={`a4-paper relative text-sm font-sans leading-relaxed text-gray-800 ${viewMode === 'pdf' ? 'shadow-2xl' : ''}`}
        style={viewMode === 'pdf' ? {
             minHeight: '297mm',
             backgroundImage: `linear-gradient(to bottom, white ${A4_HEIGHT_PX}px, #e5e7eb ${A4_HEIGHT_PX}px, #e5e7eb ${A4_HEIGHT_PX + PAGE_GAP_PX}px)`,
             backgroundSize: `100% ${A4_HEIGHT_PX + PAGE_GAP_PX}px`,
             backgroundColor: '#e5e7eb',
             padding: '3rem' // Preview Padding
        } : {
             padding: '3rem' // Image Export Padding
        }}
    >
      <style>{`
        @media print {
          /* 重置 JS 计算的 margin */
          .break-inside-avoid {
            margin-top: 0 !important;
          }
          
          section {
            margin-bottom: 2rem; 
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
            padding-left: 3rem; 
            padding-right: 3rem;
            box-sizing: border-box;
          }
          
          .print-header-spacer {
            display: table-header-group;
            height: 3rem; /* Explicit height */
          }
          
          .print-footer-spacer {
            display: table-footer-group;
            height: 3rem; /* Explicit height */
          }
          
          .print-body {
            display: table-row-group;
          }
          
          .print-row {
            display: table-row;
          }
          
          .print-cell {
            display: table-cell;
          }
          
          .spacer-content {
             height: 3rem; 
             visibility: hidden;
          }
        }
        
        /* 屏幕预览模式下隐藏 Table Spacer */
        @media screen {
          .print-header-spacer,
          .print-footer-spacer {
            display: none;
          }
        }
      `}</style>

      {/* Print Table Structure Wrapper */}
      <div className="print-container">
        {/* 
           Critical Fix: 移除了 'hidden print:block' 类
           这两个 Tailwind 类会设置 display: none / block
           这会覆盖 CSS 中的 display: table-header-group
           导致分页重复表头失效！
        */}
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
                    <header className="mb-8 break-inside-avoid">
                        <h1 className="text-4xl font-extrabold text-black tracking-wider mb-2">{data.basics.name}</h1>
                        <p className="text-gray-600 font-medium">{data.basics.contactInfo}</p>
                    </header>

                    {/* Education */}
                    {data.sections.education.visible && (
                    <section className="break-inside-avoid mb-6">
                        <SectionHeader title={data.sections.education.title} />
                        {data.education.map((edu) => (
                        <div key={edu.id} className="flex justify-between mb-3 items-baseline break-inside-avoid">
                            <div className="flex-1">
                            <div className="font-bold text-base text-black">{edu.school}</div>
                            <div className="text-gray-700">{edu.degree}</div>
                            </div>
                            <div className="text-right min-w-[180px]">
                            <div className="font-medium text-black">{edu.startDate} - {edu.endDate}</div>
                            <div className="text-gray-600">{edu.location}</div>
                            </div>
                        </div>
                        ))}
                    </section>
                    )}

                    {/* Work Experience */}
                    {data.sections.work.visible && (
                    <section className="break-inside-avoid mb-6">
                        <SectionHeader title={data.sections.work.title} />
                        {data.work.map((job) => (
                        <div key={job.id} className="mb-5 break-inside-avoid">
                            <div className="flex justify-between items-baseline mb-2">
                            <div className="font-bold text-base text-black">
                                {job.company} {job.position && <span>- {job.position}</span>}
                            </div>
                            <div className="text-right min-w-[180px]">
                                <div className="font-medium text-black">{job.startDate} - {job.endDate}</div>
                                <div className="text-gray-600">{job.location}</div>
                            </div>
                            </div>
                            <div 
                                className="text-sm text-gray-800 text-justify [&>ul]:list-disc [&>ul]:list-outside [&>ul]:ml-4 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:list-outside [&>ol]:ml-4 [&>ol]:space-y-1 [&_li]:mb-0.5 [&_a]:text-black [&_a]:underline [&_a]:decoration-gray-500 [&_a]:underline-offset-2" 
                                dangerouslySetInnerHTML={{ __html: job.details }} 
                            />
                        </div>
                        ))}
                    </section>
                    )}

                    {/* Project Experience */}
                    {data.sections.projects.visible && (
                    <section className="break-inside-avoid mb-6">
                        <SectionHeader title={data.sections.projects.title} />
                        {data.projects.map((proj) => (
                        <div key={proj.id} className="mb-5 break-inside-avoid">
                            <div className="flex justify-between items-baseline mb-2">
                            <div className="font-bold text-base text-black">
                                {proj.name} {proj.role && <span>- {proj.role}</span>}
                            </div>
                            <div className="text-right min-w-[180px]">
                                <div className="font-medium text-black">{proj.startDate} - {proj.endDate}</div>
                                <div className="text-gray-600">{proj.location}</div>
                            </div>
                            </div>
                            <div 
                                className="text-sm text-gray-800 text-justify [&>ul]:list-disc [&>ul]:list-outside [&>ul]:ml-4 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:list-outside [&>ol]:ml-4 [&>ol]:space-y-1 [&_li]:mb-0.5 [&_a]:text-black [&_a]:underline [&_a]:decoration-gray-500 [&_a]:underline-offset-2" 
                                dangerouslySetInnerHTML={{ __html: proj.details }} 
                            />
                        </div>
                        ))}
                    </section>
                    )}

                    {/* Others */}
                    {data.sections.others.visible && (
                    <section className="break-inside-avoid mb-6">
                        <SectionHeader title={data.sections.others.title} />
                        <ul className="list-none space-y-1.5">
                        {data.others.map((item) => (
                            <li key={item.id} className="flex break-inside-avoid">
                                <span className="font-bold text-black min-w-[100px]">{item.label}：</span>
                                <span className="text-gray-800">{item.content}</span>
                            </li>
                        ))}
                        </ul>
                    </section>
                    )}

                    {/* Summary */}
                    {data.sections.summary.visible && (
                    <section className="break-inside-avoid mb-6">
                        <SectionHeader title={data.sections.summary.title} />
                        <div 
                             className="text-sm text-gray-800 text-justify [&>ul]:list-disc [&>ul]:list-outside [&>ul]:ml-4 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:list-outside [&>ol]:ml-4 [&>ol]:space-y-1 [&_li]:mb-0.5 [&_a]:text-black [&_a]:underline [&_a]:decoration-gray-500 [&_a]:underline-offset-2" 
                             dangerouslySetInnerHTML={{ __html: data.summary }} 
                         />
                    </section>
                    )}
                </div>
            </div>
        </div>
        
        {/* Repeated Footer Spacer - 移除了 Tailwind 类 */}
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
