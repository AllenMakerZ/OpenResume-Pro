import React, { useState } from 'react';
import { ResumeData, EducationItem, WorkItem, ProjectItem, SectionItem, SectionKey } from '../types';
import { ChevronDown, ChevronUp, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { RichInput } from './RichInput';

interface EditorProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
}

const SectionHeaderControl = ({ 
  title, 
  onUpdateTitle, 
}: { 
  title: string; 
  onUpdateTitle: (val: string) => void; 
}) => {
  return (
    <div className="mb-4">
        <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">模块标题</label>
        <input 
            className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm font-medium focus:border-black outline-none"
            value={title}
            onChange={(e) => onUpdateTitle(e.target.value)}
        />
    </div>
  );
};

export const Editor: React.FC<EditorProps> = ({ data, onChange }) => {
  const [openSection, setOpenSection] = useState<string | null>('basics');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const updateBasics = (field: keyof typeof data.basics, value: string) => {
    onChange({
      ...data,
      basics: { ...data.basics, [field]: value }
    });
  };

  const updateSectionConfig = (key: SectionKey, field: 'title' | 'visible', value: any) => {
    onChange({
        ...data,
        sections: {
            ...data.sections,
            [key]: { ...data.sections[key], [field]: value }
        }
    });
  };

  // Generic Helper to update array items
  const updateItem = <T extends { id: string }>(
    section: keyof ResumeData,
    id: string,
    field: keyof T,
    value: any
  ) => {
    const list = data[section] as any[];
    const newList = list.map(item => item.id === id ? { ...item, [field]: value } : item);
    onChange({ ...data, [section]: newList });
  };
  
  const addItem = (section: keyof ResumeData) => {
      // Factory for new items
      let newItem: any = { id: uuidv4() };
      if(section === 'education') newItem = { ...newItem, school: 'New School', degree: 'Degree', startDate: '2023', endDate: '2024', location: 'City' };
      if(section === 'work') newItem = { ...newItem, company: 'New Company', position: 'Role', startDate: '2023', endDate: 'Present', location: 'City', details: '<ul><li>New Role Detail</li></ul>' };
      if(section === 'projects') newItem = { ...newItem, name: 'New Project', role: 'Role', startDate: '2023', endDate: '2024', location: 'City', details: '<ul><li>Project Detail</li></ul>' };
      if(section === 'others') newItem = { ...newItem, label: 'Label', content: 'Content' };

      onChange({ ...data, [section]: [...(data[section] as any[]), newItem] });
  };

  const deleteItem = (section: keyof ResumeData, id: string) => {
      const list = data[section] as any[];
      onChange({ ...data, [section]: list.filter(i => i.id !== id) });
  };

  return (
    <div className="bg-white border-r h-full overflow-y-auto p-4 space-y-4 shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-gray-800">简历编辑器</h2>

      {/* Basics */}
      <SectionWrapper title="基本信息" isOpen={openSection === 'basics'} onToggle={() => toggleSection('basics')}>
        <Input label="姓名" value={data.basics.name} onChange={(e) => updateBasics('name', e.target.value)} />
        <Input label="联系方式 (电话 | 邮箱 | 城市)" value={data.basics.contactInfo} onChange={(e) => updateBasics('contactInfo', e.target.value)} />
      </SectionWrapper>

      {/* Education */}
      <SectionWrapper 
        title={data.sections.education.title || "教育经历"} 
        isOpen={openSection === 'education'} 
        onToggle={() => toggleSection('education')}
        isVisible={data.sections.education.visible}
        onToggleVisibility={() => updateSectionConfig('education', 'visible', !data.sections.education.visible)}
      >
        <SectionHeaderControl 
            title={data.sections.education.title}
            onUpdateTitle={(val) => updateSectionConfig('education', 'title', val)}
        />
        {data.education.map((edu) => (
          <div key={edu.id} className="mb-6 p-3 bg-gray-50 rounded border relative group">
             <DeleteButton onClick={() => deleteItem('education', edu.id)} />
            <div className="grid grid-cols-1 gap-2">
              <Input label="学校" value={edu.school} onChange={(e) => updateItem<EducationItem>('education', edu.id, 'school', e.target.value)} />
              <Input label="学位" value={edu.degree} onChange={(e) => updateItem<EducationItem>('education', edu.id, 'degree', e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <Input label="开始时间" value={edu.startDate} onChange={(e) => updateItem<EducationItem>('education', edu.id, 'startDate', e.target.value)} />
                <Input label="结束时间" value={edu.endDate} onChange={(e) => updateItem<EducationItem>('education', edu.id, 'endDate', e.target.value)} />
              </div>
              <Input label="地点" value={edu.location} onChange={(e) => updateItem<EducationItem>('education', edu.id, 'location', e.target.value)} />
            </div>
          </div>
        ))}
        <AddButton onClick={() => addItem('education')} label="添加教育经历" />
      </SectionWrapper>

       {/* Work */}
       <SectionWrapper 
        title={data.sections.work.title || "工作经历"} 
        isOpen={openSection === 'work'} 
        onToggle={() => toggleSection('work')}
        isVisible={data.sections.work.visible}
        onToggleVisibility={() => updateSectionConfig('work', 'visible', !data.sections.work.visible)}
       >
        <SectionHeaderControl 
            title={data.sections.work.title}
            onUpdateTitle={(val) => updateSectionConfig('work', 'title', val)}
        />
        {data.work.map((job) => (
          <div key={job.id} className="mb-6 p-3 bg-gray-50 rounded border relative group">
            <DeleteButton onClick={() => deleteItem('work', job.id)} />
            <div className="grid grid-cols-1 gap-2 mb-2">
              <Input label="公司" value={job.company} onChange={(e) => updateItem<WorkItem>('work', job.id, 'company', e.target.value)} />
              <Input label="职位 (可选)" value={job.position} onChange={(e) => updateItem<WorkItem>('work', job.id, 'position', e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <Input label="开始时间" value={job.startDate} onChange={(e) => updateItem<WorkItem>('work', job.id, 'startDate', e.target.value)} />
                <Input label="结束时间" value={job.endDate} onChange={(e) => updateItem<WorkItem>('work', job.id, 'endDate', e.target.value)} />
              </div>
              <Input label="地点" value={job.location} onChange={(e) => updateItem<WorkItem>('work', job.id, 'location', e.target.value)} />
            </div>
            <RichInput 
              label="详细内容 (要点)" 
              value={job.details} 
              onChange={(val) => updateItem<WorkItem>('work', job.id, 'details', val)} 
            />
          </div>
        ))}
         <AddButton onClick={() => addItem('work')} label="添加工作经历" />
      </SectionWrapper>

      {/* Projects */}
      <SectionWrapper 
        title={data.sections.projects.title || "项目经历"} 
        isOpen={openSection === 'projects'} 
        onToggle={() => toggleSection('projects')}
        isVisible={data.sections.projects.visible}
        onToggleVisibility={() => updateSectionConfig('projects', 'visible', !data.sections.projects.visible)}
      >
        <SectionHeaderControl 
            title={data.sections.projects.title}
            onUpdateTitle={(val) => updateSectionConfig('projects', 'title', val)}
        />
        {data.projects.map((proj) => (
          <div key={proj.id} className="mb-6 p-3 bg-gray-50 rounded border relative group">
            <DeleteButton onClick={() => deleteItem('projects', proj.id)} />
            <div className="grid grid-cols-1 gap-2 mb-2">
              <Input label="项目名称" value={proj.name} onChange={(e) => updateItem<ProjectItem>('projects', proj.id, 'name', e.target.value)} />
              <Input label="角色" value={proj.role} onChange={(e) => updateItem<ProjectItem>('projects', proj.id, 'role', e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <Input label="开始时间" value={proj.startDate} onChange={(e) => updateItem<ProjectItem>('projects', proj.id, 'startDate', e.target.value)} />
                <Input label="结束时间" value={proj.endDate} onChange={(e) => updateItem<ProjectItem>('projects', proj.id, 'endDate', e.target.value)} />
              </div>
              <Input label="地点" value={proj.location} onChange={(e) => updateItem<ProjectItem>('projects', proj.id, 'location', e.target.value)} />
            </div>
            <RichInput 
              label="项目详情" 
              value={proj.details} 
              onChange={(val) => updateItem<ProjectItem>('projects', proj.id, 'details', val)} 
            />
          </div>
        ))}
         <AddButton onClick={() => addItem('projects')} label="添加项目经历" />
      </SectionWrapper>

      {/* Others */}
      <SectionWrapper 
        title={data.sections.others.title || "其他 (技能/证书)"} 
        isOpen={openSection === 'others'} 
        onToggle={() => toggleSection('others')}
        isVisible={data.sections.others.visible}
        onToggleVisibility={() => updateSectionConfig('others', 'visible', !data.sections.others.visible)}
      >
        <SectionHeaderControl 
            title={data.sections.others.title}
            onUpdateTitle={(val) => updateSectionConfig('others', 'title', val)}
        />
        {data.others.map((item) => (
             <div key={item.id} className="mb-2 p-2 bg-gray-50 rounded border relative flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                    <Input label="标签 (如: 技能)" value={item.label} onChange={(e) => updateItem<SectionItem>('others', item.id, 'label', e.target.value)} />
                    <textarea className="w-full border rounded p-1 text-sm" rows={2} value={item.content} onChange={(e) => updateItem<SectionItem>('others', item.id, 'content', e.target.value)} />
                </div>
                <button onClick={() => deleteItem('others', item.id)} className="text-red-500 mt-6"><Trash2 size={16} /></button>
             </div>
        ))}
        <AddButton onClick={() => addItem('others')} label="添加其他项" />
      </SectionWrapper>

       {/* Summary */}
       <SectionWrapper 
        title={data.sections.summary.title || "个人总结"} 
        isOpen={openSection === 'summary'} 
        onToggle={() => toggleSection('summary')}
        isVisible={data.sections.summary.visible}
        onToggleVisibility={() => updateSectionConfig('summary', 'visible', !data.sections.summary.visible)}
       >
        <SectionHeaderControl 
            title={data.sections.summary.title}
            onUpdateTitle={(val) => updateSectionConfig('summary', 'title', val)}
        />
        <RichInput 
            label="内容 (支持富文本)" 
            value={data.summary} 
            onChange={(val) => onChange({ ...data, summary: val })} 
        />
      </SectionWrapper>
    </div>
  );
};

// Small Helper Components
const SectionWrapper: React.FC<{ 
    title: string; 
    isOpen: boolean; 
    onToggle: () => void; 
    children: React.ReactNode;
    isVisible?: boolean;
    onToggleVisibility?: () => void;
}> = ({ title, isOpen, onToggle, children, isVisible, onToggleVisibility }) => (
    <div className="border rounded-lg overflow-hidden mb-2">
        <div 
            className="w-full bg-gray-100 p-3 flex justify-between items-center font-semibold text-sm hover:bg-gray-200 transition-colors cursor-pointer group" 
            onClick={onToggle}
        >
            <div className="flex items-center gap-2">
                 <span className={isVisible === false ? "opacity-50 line-through decoration-gray-400" : ""}>
                    {title}
                </span>
                {isVisible === false && <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full font-normal">已隐藏</span>}
            </div>
           
            <div className="flex items-center gap-1">
                {onToggleVisibility && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
                        className={`p-1.5 rounded hover:bg-gray-300 transition-colors mr-1 ${isVisible === false ? 'text-red-500 hover:bg-red-100' : 'text-gray-400 hover:text-gray-700'}`}
                        title={isVisible === false ? "显示此模块" : "隐藏此模块"}
                    >
                        {isVisible === false ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
                <div className="text-gray-500">
                     {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </div>
        </div>
        {isOpen && <div className="p-3 bg-white animate-fade-in">{children}</div>}
    </div>
);

const Input: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div className="mb-1">
        <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
        <input type="text" className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-black outline-none transition-all" value={value} onChange={onChange} />
    </div>
);

const DeleteButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button onClick={onClick} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors">
        <Trash2 size={16} />
    </button>
);

const AddButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
    <button onClick={onClick} className="w-full py-2 mt-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-black hover:text-black transition-all text-sm flex items-center justify-center gap-2">
        <Plus size={16} /> {label}
    </button>
);
