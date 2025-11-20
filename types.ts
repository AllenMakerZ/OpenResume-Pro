export interface BaseItem {
  id: string;
}

export interface EducationItem extends BaseItem {
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  location: string;
}

export interface WorkItem extends BaseItem {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location: string;
  details: string; // HTML content
}

export interface ProjectItem extends BaseItem {
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  location: string;
  details: string; // HTML content
}

export interface SectionItem extends BaseItem {
  label: string;
  content: string; // For simple text entries like "Skills"
}

export type BuiltinSectionKey = 'education' | 'work' | 'projects' | 'others' | 'summary';
export type SectionKey = BuiltinSectionKey | string;

export interface SectionSettings {
  title: string;
  visible: boolean;
}

export interface CustomSection extends BaseItem {
  title: string;
  content: string; // HTML content
  visible: boolean;
}

export interface ResumeData {
  basics: {
    name: string;
    contactInfo: string; // Combined phone | email | location string
    note?: string; // Additional note/tagline
  };
  sectionOrder: SectionKey[];
  sections: Record<BuiltinSectionKey, SectionSettings>; // Configuration for builtin section titles and visibility
  customSections: CustomSection[]; // Dynamic custom sections
  education: EducationItem[];
  work: WorkItem[];
  projects: ProjectItem[];
  others: string; // HTML content for Skills, Awards, etc. (Refactored from SectionItem[])
  summary: string; // HTML content for Personal summary
}

export interface LayoutSettings {
  fontSize: number;     // px, e.g. 14
  lineHeight: number;   // multiple, e.g. 1.4
  pagePadding: number;  // mm, e.g. 20
}
