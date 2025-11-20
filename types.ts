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

export type SectionKey = 'education' | 'work' | 'projects' | 'others' | 'summary';

export interface SectionSettings {
  title: string;
  visible: boolean;
}

export interface ResumeData {
  basics: {
    name: string;
    contactInfo: string; // Combined phone | email | location string
  };
  sections: Record<SectionKey, SectionSettings>; // Configuration for section titles and visibility
  education: EducationItem[];
  work: WorkItem[];
  projects: ProjectItem[];
  others: SectionItem[]; // Skills, Awards, etc.
  summary: SectionItem[]; // Personal summary points
}
