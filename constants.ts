import { ResumeData } from './types';
import { v4 as uuidv4 } from 'uuid';

export const INITIAL_RESUME_DATA: ResumeData = {
  basics: {
    name: '白桦',
    contactInfo: '182323232323 丨 xxxxxxx20@yeah.net 丨 深圳'
  },
  sections: {
    education: { title: '教育经历', visible: true },
    work: { title: '工作与实习经历', visible: true },
    projects: { title: '项目经历', visible: true },
    others: { title: '其他', visible: true },
    summary: { title: '个人总结', visible: true }
  },
  education: [
    {
      id: 'edu-1',
      school: '伦敦艺术大学',
      degree: 'Art Direction 硕士 一等荣誉学位',
      startDate: '2022年10月',
      endDate: '2023年02月',
      location: '伦敦'
    },
    {
      id: 'edu-2',
      school: '深圳大学',
      degree: '工业设计 本科',
      startDate: '2017年09月',
      endDate: '2022年06月',
      location: '深圳'
    }
  ],
  work: [
    {
      id: 'work-1',
      company: '智岩科技（智能硬件产品经理）',
      position: '',
      startDate: '2023年03月',
      endDate: '2023年06月',
      location: '深圳',
      details: `<ul>
<li><b>项目管理:</b> 协助进行居家品线4个品类的项目推进，积极与品牌、设计、研发等多部门协作推动项目，并在发现流程问题之后组织会议改进了“用户共创”的跨部门协作流程，得到mentor认可</li>
<li><b>数据分析:</b> 在Amazon平台对开关/桌灯品类寻找差异化定位，进而拆分核心数据指标（价格区间，功能细分，销量排名等）、利用数据抓取工具辅助整理数据并输出市场报告，头脑风暴后提出三个创意，被mentor采纳</li>
<li><b>执行落地:</b> 协助品牌专员推出Netflix联名款灯带，完成包装设计、灯效、UI界面的需求定义，联合多部门实现具体需求并验收</li>
<li><b>方法论优化：</b>通过一次ID设计事故，结合公司产品经理工作流程汇总出产品经理To-Do文档被产品部门采纳用于辅导新人</li>
</ul>`
    },
    {
      id: 'work-2',
      company: 'TCL集团（工业设计师）',
      position: '',
      startDate: '2020年03月',
      endDate: '2020年04月',
      location: '深圳',
      details: `<ul>
<li><b>桌面调研:</b> 对竞品公司的大尺寸柔性屏解决方案进行线上调研，进而对柔性屏电脑品类进行差异化定位，从而提出“卷轴电脑”的市场切入点被小组采纳</li>
<li><b>组织能力:</b> 组织头脑风暴会议，协助组员进行用户画像和使用场景的定义，最终进行产品表现以及汇报，取得项目奖金</li>
</ul>`
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: "L'Oréal 品牌风暴 UK赛区（商赛成员）",
      role: '',
      startDate: '2022年03月',
      endDate: '2022年04月',
      location: '伦敦',
      details: `<ul>
<li><b>积极主动:</b> 分析自身优劣势并在网上搜寻队伍，说服队员组队，以3人小组的形式参加欧莱雅商赛的“包容性”赛道</li>
<li><b>组织能力:</b> 为项目制定明确的时间规划表，分发子任务并推动线下会议，顺利在2个星期内完成策划方案</li>
<li><b>策划能力:</b> 选定男性护肤品市场和科颜氏品牌作为切入点，以健身房为场所结合元宇宙热点改变男性对护肤品的偏见，设计用户旅程图和Slogan，最终得出品牌快闪店方案SkinGym，成功进入UK赛区半决赛</li>
</ul>`
    }
  ],
  others: [
    { id: 'other-1', label: '技能', content: '设计软件Adobe全套、办公软件Office、Ai软件StableDiffusion/ChatGPT' },
    { id: 'other-2', label: '证书/执照', content: 'PMP项目管理资格认证' },
    { id: 'other-3', label: '奖项', content: '2019年深圳市创意设计新锐奖' },
    { id: 'other-4', label: '语言', content: '雅思6.5' }
  ],
  summary: [
    { id: 'sum-1', label: '乐观踏实', content: '对待问题持乐观态度，永远是以解决问题为先，认真对待每一项任务并想办法协调内外部资源将工作踏实完成' },
    { id: 'sum-2', label: '积极主动', content: '拥有强烈好奇心，对新鲜的领域感兴趣，会主动学习所需知识且执行力强，主动发起过很多项目并进行调研' },
    { id: 'sum-3', label: '学习能力', content: '利用进度计划表和时间管理软件管理生活中的事情，有学习方法论和一定的执行力' }
  ]
};
