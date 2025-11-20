import React, { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Link, List, ListOrdered } from 'lucide-react';

interface RichInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export const RichInput: React.FC<RichInputProps> = ({ value, onChange, label }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Only update from props if not focused to prevent cursor jumping
    // Or if the content is significantly different (e.g. switching items)
    if (editorRef.current && value !== editorRef.current.innerHTML) {
       // If focused, we trust user input, but if value changed externally (e.g. reset), we must update.
       // A simple check: if we are focused, assume the change came from us (onChange), so don't overwrite.
       // But if value changed completely (different item), we need to update. 
       // Since `key` usually handles item switching in parent, we can be safer.
       if (!isFocused) {
         editorRef.current.innerHTML = value;
       }
    }
  }, [value, isFocused]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
        editorRef.current.focus();
        onChange(editorRef.current.innerHTML);
    }
  };

  const addLink = () => {
      const url = prompt("请输入链接地址 (如: https://github.com):");
      if (url) {
          exec('createLink', url);
      }
  };

  return (
    <div className="mb-2">
      {label && <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>}
      <div className="border rounded-md overflow-hidden border-gray-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all bg-white">
        {/* Toolbar */}
        <div className="flex items-center gap-1 bg-gray-50 border-b px-2 py-1">
          <button 
            onMouseDown={(e) => { e.preventDefault(); exec('bold'); }}
            className="p-1 hover:bg-gray-200 rounded text-gray-700"
            title="加粗"
          >
            <Bold size={14} />
          </button>
          <button 
            onMouseDown={(e) => { e.preventDefault(); exec('italic'); }}
            className="p-1 hover:bg-gray-200 rounded text-gray-700"
            title="斜体"
          >
            <Italic size={14} />
          </button>
          <button 
            onMouseDown={(e) => { e.preventDefault(); addLink(); }}
            className="p-1 hover:bg-gray-200 rounded text-gray-700"
            title="超链接"
          >
            <Link size={14} />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <button 
            onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }}
            className="p-1 hover:bg-gray-200 rounded text-gray-700"
            title="无序列表"
          >
            <List size={14} />
          </button>
          <button 
            onMouseDown={(e) => { e.preventDefault(); exec('insertOrderedList'); }}
            className="p-1 hover:bg-gray-200 rounded text-gray-700"
            title="序号列表"
          >
            <ListOrdered size={14} />
          </button>
        </div>
        
        {/* Editor */}
        <div
            ref={editorRef}
            className="p-2 min-h-[120px] text-sm outline-none [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>ul>li]:mb-1 [&>ol>li]:mb-1 [&>a]:text-blue-600 [&>a]:underline [&>a]:cursor-pointer"
            contentEditable
            onInput={handleInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
        />
      </div>
    </div>
  );
};
