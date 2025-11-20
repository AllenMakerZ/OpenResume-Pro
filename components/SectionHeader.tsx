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
    <div className="mb-2 mt-4">
      <div className="relative inline-block group">
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
            - pl-6: Reduced left padding to move text slightly left.
            - pr-10: Increased right padding to ensure text doesn't hit the slope area.
        */}
        <div 
            className="bg-black text-white inline-block pl-6 pr-10 py-1 font-bold tracking-wide text-sm relative z-10"
            style={blackBlockStyle}
        >
          {title || '\u00A0'}
        </div>
      </div>
      <div className="border-b-2 border-black mt-0.5 w-full"></div>
    </div>
  );
};