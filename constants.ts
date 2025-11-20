import { BaseItem, EducationItem, WorkItem, ProjectItem, SectionItem, SectionKey, SectionSettings, ResumeData } from './types';

// Re-export types
export * from './types';

// Ensure INITIAL_RESUME_DATA matches the ResumeData interface
export const INITIAL_RESUME_DATA: ResumeData = {
  basics: {
    name: '李白',
    contactInfo: '13800138000 丨 example@email.com 丨 城市',
    note: ''
  },
  sectionOrder: ['education', 'work', 'projects', 'others', 'summary'],
  sections: {
    education: { title: '教育经历', visible: true },
    work: { title: '工作与实习经历', visible: true },
    projects: { title: '项目经历', visible: true },
    others: { title: '技能与证书', visible: true },
    summary: { title: '个人总结', visible: true }
  },
  education: [
    {
      id: 'edu-1',
      school: '某某知名大学',
      degree: '相关专业 硕士',
      startDate: '2022年10月',
      endDate: '2023年02月',
      location: '城市'
    },
    {
      id: 'edu-2',
      school: '某某大学',
      degree: '相关专业 本科',
      startDate: '2017年09月',
      endDate: '2022年06月',
      location: '城市'
    }
  ],
  work: [
    {
      id: 'work-1',
      company: '某某科技有限公司（产品经理）',
      position: '',
      startDate: '2023年03月',
      endDate: '2023年06月',
      location: '城市',
      details: `<ul>
<li><b>项目管理:</b> 协助进行核心产品线的项目推进，积极与品牌、设计、研发等多部门协作推动项目，并在发现流程问题之后组织会议改进了跨部门协作流程，得到上级认可</li>
<li><b>数据分析:</b> 在某知名平台对相关品类寻找差异化定位，进而拆分核心数据指标（价格区间，功能细分，销量排名等）、利用数据抓取工具辅助整理数据并输出市场报告，头脑风暴后提出多个创意，被团队采纳</li>
<li><b>执行落地:</b> 协助团队推出联名款产品，完成包装设计、功能定义、UI界面的需求梳理，联合多部门实现具体需求并验收</li>
<li><b>方法论优化：</b>通过一次设计复盘，结合公司工作流程汇总出岗位To-Do文档被部门采纳用于辅导新人</li>
</ul>`
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: "某知名商业挑战赛（核心成员）",
      role: '',
      startDate: '2022年03月',
      endDate: '2022年04月',
      location: '城市',
      details: `<ul>
<li><b>积极主动:</b> 分析自身优劣势并在网上搜寻队伍，说服队员组队，以3人小组的形式参加该商业挑战赛的特定赛道</li>
<li><b>组织能力:</b> 为项目制定明确的时间规划表，分发子任务并推动线下会议，顺利在2个星期内完成策划方案</li>
<li><b>策划能力:</b> 选定特定市场和品牌作为切入点，结合当下热点改变用户对产品的刻板印象，设计用户旅程图和Slogan，最终得出创新方案，成功进入半决赛</li>
</ul>`
    }
  ],
  others: [
    { id: 'other-1', label: '技能', content: '熟练掌握相关设计软件、办公软件、AI辅助工具' },
    { id: 'other-2', label: '证书', content: 'PMP项目管理资格认证' },
    { id: 'other-3', label: '奖项', content: '某年度创意设计奖项' },
    { id: 'other-4', label: '语言', content: '外语流利' }
  ],
  summary: `<ul>
<li><b>乐观踏实:</b> 对待问题持乐观态度，永远是以解决问题为先，认真对待每一项任务并想办法协调内外部资源将工作踏实完成</li>
<li><b>积极主动:</b> 拥有强烈好奇心，对新鲜的领域感兴趣，会主动学习所需知识且执行力强，主动发起过很多项目并进行调研</li>
<li><b>学习能力:</b> 利用进度计划表和时间管理软件管理生活中的事情，有学习方法论和一定的执行力</li>
</ul>`
};
