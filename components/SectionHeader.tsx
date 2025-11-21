import React from 'react';

interface SectionHeaderProps {
  title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  // Updated Slope Logic:
  // "Slope too oblique" -> Reduced the horizontal cut distance to make it more vertical.
  // New Slant Width for Black Block: 12px (was 20px).
  // New Slant Width for Gray Block: 12px * 0.8 (height ratio) = 9.6px. Let's round to 10px for cleanliness.
  
  const blackBlockStyle = {
    clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0% 100%)'
  };

  const grayBlockStyle = {
    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0% 100%)'
  };

  return (
    <div className="mb-2 mt-4 flex flex-col">
      <div className="relative w-fit group">
        {/* Decorative background block */}
        {/* 
            - Linked closely to parent width (left-2, -right-2). 
            - Height increased slightly to ~85% for better visual overlap.
        */}
        <div 
            className="absolute bottom-0 left-1.5 -right-1.5 h-[85%] bg-gray-200 z-0" 
            style={grayBlockStyle}
        ></div>
        
        {/* Main Content Block */}
        {/* 
            - pl-6: 左侧留白，保证标题不会贴边。
            - pr-16: 右侧留白显著大于斜切宽度 12px，确保导出为图片/PDF 时最后一个字不会被斜切区域或截图边界裁掉。
              （保持几何参数不变，仅通过增加安全留白解决“缺一个字”的问题）
        */}
        <div 
            className="bg-black text-white pl-6 pr-16 py-1 font-bold tracking-wide text-sm relative z-10"
            style={blackBlockStyle}
        >
          {title || '\u00A0'}
        </div>
      </div>
      <div className="h-[2px] bg-black w-full -mt-[1px] relative z-0"></div>
    </div>
  );
};