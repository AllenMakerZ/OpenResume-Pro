import React, { useState } from 'react';
import { ResumeData, EducationItem, WorkItem, ProjectItem, SectionItem, SectionKey } from '../types';
import { ChevronDown, ChevronUp, Plus, Trash2, Eye, EyeOff, GripVertical, ListOrdered, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { RichInput } from './RichInput';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EditorProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
}

const ALL_SECTIONS: { key: SectionKey; label: string }[] = [
    { key: 'education', label: '教育经历' },
    { key: 'work', label: '工作经历' },
    { key: 'projects', label: '项目经历' },
    { key: 'others', label: '其他 (技能/证书)' },
    { key: 'summary', label: '个人总结' }
];

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

// Sortable Item Wrapper for SECTIONS
const SortableSectionItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto',
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style}>
             {React.cloneElement(children as React.ReactElement, { dragHandleProps: { ...attributes, ...listeners } })}
        </div>
    );
};

// Sortable Item Wrapper for INNER LIST Items
const SortableRowItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto',
        position: 'relative' as const,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 bg-gray-50 border rounded mb-2 group">
            <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-700 p-1" onClick={e => e.stopPropagation()}>
                <GripVertical size={14} />
            </div>
            <div className="flex-1 truncate text-sm font-medium text-gray-700">
                {children}
            </div>
        </div>
    );
};

// Inner List Sort Manager
const SectionSortManager = ({ 
    items, 
    onReorder, 
    onDelete,
    renderLabel 
}: { 
    items: any[]; 
    onReorder: (oldIndex: number, newIndex: number) => void; 
    onDelete: (id: string) => void;
    renderLabel: (item: any) => string;
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex(i => i.id === active.id);
            const newIndex = items.findIndex(i => i.id === over.id);
            onReorder(oldIndex, newIndex);
        }
    };

    return (
        <div className="bg-gray-100 rounded-lg p-3 mb-4 border-2 border-blue-100">
             <div className="text-xs font-bold text-gray-500 mb-2 flex justify-between items-center">
                <span>调整顺序 & 删除</span>
                <span className="text-[10px] font-normal text-gray-400">拖拽左侧手柄排序</span>
             </div>
             <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragEnd={handleDragEnd}
                // Important: stop propagation to prevent outer section drag
                modifiers={[]}
            >
                <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {items.map(item => (
                        <div key={item.id} className="relative flex items-center">
                             <div className="flex-1 min-w-0">
                                <SortableRowItem id={item.id}>
                                    {renderLabel(item) || <span className="text-gray-400 italic">未命名项目</span>}
                                </SortableRowItem>
                             </div>
                             <button 
                                onClick={() => onDelete(item.id)} 
                                className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded transition-colors"
                                title="删除此项"
                             >
                                <Trash2 size={16} />
                             </button>
                        </div>
                    ))}
                </SortableContext>
             </DndContext>
             {items.length === 0 && <div className="text-xs text-gray-400 text-center py-2">暂无项目</div>}
        </div>
    );
};

export const Editor: React.FC<EditorProps> = ({ data, onChange }) => {
  const [openSection, setOpenSection] = useState<string | null>('basics');
  const [sortingSection, setSortingSection] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = data.sectionOrder.indexOf(active.id as SectionKey);
      const newIndex = data.sectionOrder.indexOf(over.id as SectionKey);
      
      onChange({
        ...data,
        sectionOrder: arrayMove(data.sectionOrder, oldIndex, newIndex),
      });
    }
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const toggleSorting = (section: string) => {
      setSortingSection(sortingSection === section ? null : section);
      // Ensure section is open when sorting
      if (sortingSection !== section && openSection !== section) {
          setOpenSection(section);
      }
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

  const reorderItems = (section: keyof ResumeData, oldIndex: number, newIndex: number) => {
      const list = data[section] as any[];
      onChange({ ...data, [section]: arrayMove(list, oldIndex, newIndex) });
  };

  // Section Management
  const removeSection = (key: SectionKey) => {
      if (window.confirm(`确定要移除"${data.sections[key].title}"模块吗？(数据会保留，可随时添加回来)`)) {
        onChange({
            ...data,
            sectionOrder: data.sectionOrder.filter(k => k !== key)
        });
      }
  };

  const addSection = (key: SectionKey) => {
      onChange({
          ...data,
          sectionOrder: [...data.sectionOrder, key]
      });
      setOpenSection(key);
  };

  const renderSectionContent = (key: SectionKey) => {
      const isSorting = sortingSection === key;

      switch(key) {
          case 'education':
              return (
                <>
                    <SectionHeaderControl 
                        title={data.sections.education.title}
                        onUpdateTitle={(val) => updateSectionConfig('education', 'title', val)}
                    />
                    
                    {isSorting && (
                        <SectionSortManager 
                            items={data.education}
                            onReorder={(oldIdx, newIdx) => reorderItems('education', oldIdx, newIdx)}
                            onDelete={(id) => deleteItem('education', id)}
                            renderLabel={(item: EducationItem) => item.school}
                        />
                    )}

                    {data.education.map((edu) => (
                    <div key={edu.id} className="mb-6 p-3 bg-gray-50 rounded border relative group">
                        {/* Note: Delete button removed from here, moved to Sort Manager */}
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
                </>
              );
            case 'work':
                return (
                    <>
                        <SectionHeaderControl 
                            title={data.sections.work.title}
                            onUpdateTitle={(val) => updateSectionConfig('work', 'title', val)}
                        />

                        {isSorting && (
                            <SectionSortManager 
                                items={data.work}
                                onReorder={(oldIdx, newIdx) => reorderItems('work', oldIdx, newIdx)}
                                onDelete={(id) => deleteItem('work', id)}
                                renderLabel={(item: WorkItem) => item.company}
                            />
                        )}

                        {data.work.map((job) => (
                        <div key={job.id} className="mb-6 p-3 bg-gray-50 rounded border relative group">
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
                    </>
                );
            case 'projects':
                return (
                    <>
                        <SectionHeaderControl 
                            title={data.sections.projects.title}
                            onUpdateTitle={(val) => updateSectionConfig('projects', 'title', val)}
                        />

                        {isSorting && (
                            <SectionSortManager 
                                items={data.projects}
                                onReorder={(oldIdx, newIdx) => reorderItems('projects', oldIdx, newIdx)}
                                onDelete={(id) => deleteItem('projects', id)}
                                renderLabel={(item: ProjectItem) => item.name}
                            />
                        )}

                        {data.projects.map((proj) => (
                        <div key={proj.id} className="mb-6 p-3 bg-gray-50 rounded border relative group">
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
                    </>
                );
            case 'others':
                return (
                    <>
                        <SectionHeaderControl 
                            title={data.sections.others.title}
                            onUpdateTitle={(val) => updateSectionConfig('others', 'title', val)}
                        />

                        {isSorting && (
                            <SectionSortManager 
                                items={data.others}
                                onReorder={(oldIdx, newIdx) => reorderItems('others', oldIdx, newIdx)}
                                onDelete={(id) => deleteItem('others', id)}
                                renderLabel={(item: SectionItem) => item.label}
                            />
                        )}

                        {data.others.map((item) => (
                            <div key={item.id} className="mb-2 p-2 bg-gray-50 rounded border relative flex gap-2 items-start">
                                <div className="flex-1 space-y-2">
                                    <Input label="标签 (如: 技能)" value={item.label} onChange={(e) => updateItem<SectionItem>('others', item.id, 'label', e.target.value)} />
                                    <textarea className="w-full border rounded p-1 text-sm" rows={2} value={item.content} onChange={(e) => updateItem<SectionItem>('others', item.id, 'content', e.target.value)} />
                                </div>
                                {/* Delete is available in Sort Manager, but "Others" are small so maybe keep it here too? 
                                    Requirements said "internal only focus content", let's stick to rule and remove it from here to encourage using sort manager 
                                */}
                                {/* <button onClick={() => deleteItem('others', item.id)} className="text-red-500 mt-6"><Trash2 size={16} /></button> */}
                            </div>
                        ))}
                        <AddButton onClick={() => addItem('others')} label="添加其他项" />
                    </>
                );
            case 'summary':
                return (
                    <>
                        <SectionHeaderControl 
                            title={data.sections.summary.title}
                            onUpdateTitle={(val) => updateSectionConfig('summary', 'title', val)}
                        />
                        <RichInput 
                            label="内容 (支持富文本)" 
                            value={data.summary} 
                            onChange={(val) => onChange({ ...data, summary: val })} 
                        />
                    </>
                );
            default:
                return null;
      }
  }

  const availableSections = ALL_SECTIONS.filter(s => !data.sectionOrder.includes(s.key));

  return (
    <div className="bg-white border-r h-full overflow-y-auto p-4 space-y-4 shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-gray-800">简历编辑器</h2>

      {/* Basics - Fixed at top */}
      <SectionWrapper title="基本信息" isOpen={openSection === 'basics'} onToggle={() => toggleSection('basics')}>
        <Input label="姓名" value={data.basics.name} onChange={(e) => updateBasics('name', e.target.value)} />
        <Input label="联系方式 (电话 | 邮箱 | 城市)" value={data.basics.contactInfo} onChange={(e) => updateBasics('contactInfo', e.target.value)} />
      </SectionWrapper>

      <div className="border-t border-b py-2 my-4">
        <p className="text-xs text-gray-400 mb-2 px-1">拖拽下方模块调整顺序</p>
        <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSectionDragEnd}
        >
            <SortableContext 
                items={data.sectionOrder}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-3">
                    {data.sectionOrder.map((key) => (
                        <SortableSectionItem key={key} id={key}>
                            <SectionWrapper 
                                title={data.sections[key].title}
                                isOpen={openSection === key}
                                onToggle={() => toggleSection(key)}
                                isVisible={data.sections[key].visible}
                                onToggleVisibility={() => updateSectionConfig(key, 'visible', !data.sections[key].visible)}
                                onDelete={() => removeSection(key)}
                                // Sort Props
                                isSorting={sortingSection === key}
                                onToggleSort={() => toggleSorting(key)}
                                showSortButton={key !== 'summary'} // Summary doesn't need sorting
                            >
                                {renderSectionContent(key)}
                            </SectionWrapper>
                        </SortableSectionItem>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
      </div>

      {/* Add Module Section */}
      {availableSections.length > 0 && (
          <div className="mt-6">
              <h3 className="text-sm font-bold text-gray-700 mb-2">添加模块</h3>
              <div className="grid grid-cols-2 gap-2">
                  {availableSections.map(s => (
                      <button 
                        key={s.key}
                        onClick={() => addSection(s.key)}
                        className="flex items-center gap-2 p-2 border border-dashed border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 text-gray-600 text-sm transition-all"
                      >
                          <Plus size={14} />
                          {s.label}
                      </button>
                  ))}
              </div>
          </div>
      )}
      
    </div>
  );
};

// Helper Components
const SectionWrapper: React.FC<{ 
    title: string; 
    isOpen: boolean; 
    onToggle: () => void; 
    children: React.ReactNode;
    isVisible?: boolean;
    onToggleVisibility?: () => void;
    onDelete?: () => void;
    dragHandleProps?: any;
    isSorting?: boolean;
    onToggleSort?: () => void;
    showSortButton?: boolean;
}> = ({ 
    title, 
    isOpen, 
    onToggle, 
    children, 
    isVisible, 
    onToggleVisibility, 
    onDelete, 
    dragHandleProps,
    isSorting,
    onToggleSort,
    showSortButton
}) => (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <div 
            className="w-full bg-gray-100 p-3 flex justify-between items-center font-semibold text-sm hover:bg-gray-200 transition-colors cursor-pointer group select-none" 
            onClick={onToggle}
        >
            <div className="flex items-center gap-2 flex-1">
                {/* Drag Handle */}
                {dragHandleProps && (
                    <div {...dragHandleProps} className="cursor-grab text-gray-400 hover:text-gray-700 p-1" onClick={(e) => e.stopPropagation()}>
                        <GripVertical size={14} />
                    </div>
                )}
                
                 <span className={isVisible === false ? "opacity-50 line-through decoration-gray-400" : ""}>
                    {title}
                </span>
                {isVisible === false && <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full font-normal">已隐藏</span>}
            </div>
           
            <div className="flex items-center gap-1">
                
                {showSortButton && onToggleSort && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleSort(); }}
                        className={`p-1.5 rounded hover:bg-blue-100 hover:text-blue-600 transition-colors mr-1 ${isSorting ? 'text-blue-600 bg-blue-50 ring-1 ring-blue-200' : 'text-gray-400'}`}
                        title={isSorting ? "关闭排序" : "调整内部顺序"}
                    >
                        {isSorting ? <X size={16} /> : <ListOrdered size={16} />}
                    </button>
                )}

                {onToggleVisibility && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
                        className={`p-1.5 rounded hover:bg-gray-300 transition-colors ${isVisible === false ? 'text-red-500' : 'text-gray-400 hover:text-gray-700'}`}
                        title={isVisible === false ? "显示此模块" : "隐藏此模块"}
                    >
                        {isVisible === false ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
                {onDelete && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                        title="移除此模块"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
                <div className="text-gray-500 ml-1">
                     {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </div>
        </div>
        {isOpen && <div className="p-3 bg-white animate-fade-in border-t">{children}</div>}
    </div>
);

const Input: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div className="mb-1">
        <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
        <input type="text" className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-black outline-none transition-all" value={value} onChange={onChange} />
    </div>
);

// DeleteButton removed from global use, or rather redefined locally if needed
// But we are using it inside sorting manager now.
// We'll keep AddButton
const AddButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
    <button onClick={onClick} className="w-full py-2 mt-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-black hover:text-black transition-all text-sm flex items-center justify-center gap-2">
        <Plus size={16} /> {label}
    </button>
);