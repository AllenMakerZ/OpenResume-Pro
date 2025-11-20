import React, { forwardRef } from 'react';
import { ResumeData } from '../types';
import { SectionHeader } from './SectionHeader';

interface ResumePreviewProps {
  data: ResumeData;
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ data }, ref) => {
  return (
    <div ref={ref} id="resume-preview" className="a4-paper p-12 text-sm font-sans leading-relaxed text-gray-800">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-black tracking-wider mb-2">{data.basics.name}</h1>
        <p className="text-gray-600 font-medium">{data.basics.contactInfo}</p>
      </header>

      {/* Education */}
      {data.sections.education.visible && (
      <section>
        <SectionHeader title={data.sections.education.title} />
        {data.education.map((edu) => (
          <div key={edu.id} className="flex justify-between mb-3 items-baseline">
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
      <section>
        <SectionHeader title={data.sections.work.title} />
        {data.work.map((job) => (
          <div key={job.id} className="mb-5">
            <div className="flex justify-between items-baseline mb-2">
              <div className="font-bold text-base text-black">
                {job.company} {job.position && <span>- {job.position}</span>}
              </div>
              <div className="text-right min-w-[180px]">
                <div className="font-medium text-black">{job.startDate} - {job.endDate}</div>
                <div className="text-gray-600">{job.location}</div>
              </div>
            </div>
            <ul className="list-disc list-outside ml-4 space-y-1">
              {job.details.map((detail, idx) => {
                 const splitIndex = detail.indexOf(':') > -1 ? detail.indexOf(':') + 1 : detail.indexOf('：') + 1;
                 const hasLabel = splitIndex > 1;
                 
                 return (
                  <li key={idx} className="text-gray-800 text-justify">
                    {hasLabel ? (
                      <>
                        <span className="font-bold text-black">{detail.substring(0, splitIndex)}</span>
                        <span>{detail.substring(splitIndex)}</span>
                      </>
                    ) : (
                      detail
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
      )}

       {/* Project Experience */}
       {data.sections.projects.visible && (
       <section>
        <SectionHeader title={data.sections.projects.title} />
        {data.projects.map((proj) => (
          <div key={proj.id} className="mb-5">
            <div className="flex justify-between items-baseline mb-2">
              <div className="font-bold text-base text-black">
                {proj.name} {proj.role && <span>- {proj.role}</span>}
              </div>
              <div className="text-right min-w-[180px]">
                <div className="font-medium text-black">{proj.startDate} - {proj.endDate}</div>
                <div className="text-gray-600">{proj.location}</div>
              </div>
            </div>
            <ul className="list-disc list-outside ml-4 space-y-1">
              {proj.details.map((detail, idx) => {
                 const splitIndex = detail.indexOf(':') > -1 ? detail.indexOf(':') + 1 : detail.indexOf('：') + 1;
                 const hasLabel = splitIndex > 1;
                 
                 return (
                  <li key={idx} className="text-gray-800 text-justify">
                    {hasLabel ? (
                      <>
                        <span className="font-bold text-black">{detail.substring(0, splitIndex)}</span>
                        <span>{detail.substring(splitIndex)}</span>
                      </>
                    ) : (
                      detail
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
      )}

      {/* Others */}
      {data.sections.others.visible && (
      <section>
        <SectionHeader title={data.sections.others.title} />
        <ul className="list-none space-y-1.5">
          {data.others.map((item) => (
             <li key={item.id} className="flex">
                <span className="font-bold text-black min-w-[100px]">{item.label}：</span>
                <span className="text-gray-800">{item.content}</span>
             </li>
          ))}
        </ul>
      </section>
      )}

      {/* Summary */}
      {data.sections.summary.visible && (
      <section>
        <SectionHeader title={data.sections.summary.title} />
        <ul className="list-disc list-outside ml-4 space-y-1.5">
          {data.summary.map((item) => (
             <li key={item.id} className="text-gray-800 text-justify">
                <span className="font-bold text-black">{item.label}：</span>
                <span>{item.content}</span>
             </li>
          ))}
        </ul>
      </section>
      )}

    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';