'use client';
import Tooltip from '@/app/common/Tooltip';
import { exampleModelDescriptions } from './data/exampleModels';

const ExampleModelText = ({ exampleModel }) => {
  const usedFor = exampleModelDescriptions[exampleModel.name];
  if (!usedFor) return <span>{exampleModel.name}</span>;
  return (
    <Tooltip
      content={
        <>
          <strong className="text-te-accent">{exampleModel.name}:</strong>{' '}
          {usedFor}
        </>
      }
      interactive
      leaveDelayMs={200}
      placement="bottom-start"
      maxWidth={300}
      contentClassName="!bg-white !text-[#1a1a1a] border border-neutral-300 shadow-lg text-sm leading-normal whitespace-pre-wrap font-sans"
      wrapperClassName="cursor-help border-b border-dashed border-black/30"
    >
      <span>{exampleModel.name}</span>
    </Tooltip>
  );
};

export const ExampleModels = ({ text, as = 'div', className = '', itemClassName = '' }) => {
  const exampleModels = text.split(',').map(exampleModel => ({ name: exampleModel.trim() }));
  if (as === 'ul') {
    return (
      <ul className={className}>
        {exampleModels.map((exampleModel, idx) => (
          <li key={idx} className={itemClassName}><ExampleModelText exampleModel={exampleModel} /></li>
        ))}
      </ul>
    );
  }
  return (
    <div className={className}>
      {exampleModels.map((exampleModel, idx) => (
        <div key={idx} className={itemClassName}><ExampleModelText exampleModel={exampleModel} /></div>
      ))}
    </div>
  );
};
