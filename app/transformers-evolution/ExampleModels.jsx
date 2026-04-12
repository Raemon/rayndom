'use client';
import Tooltip from '@/app/common/Tooltip';
import { exampleModelsByDiag } from './data/exampleModels';

const getExampleModels = (diag, text) => {
  const curatedExampleModels = exampleModelsByDiag[diag];
  if (curatedExampleModels?.length) return curatedExampleModels;
  return text.split(',').map(exampleModel => ({ name: exampleModel.trim() }));
};

const ExampleModelText = ({ exampleModel }) => {
  if (!exampleModel.usedFor) return <span>{exampleModel.name}</span>;
  return (
    <Tooltip
      content={
        <>
          <strong className="text-te-accent">{exampleModel.name}:</strong>{' '}
          {exampleModel.usedFor}
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

export const ExampleModels = ({ diag, text, as = 'div', className = '', itemClassName = '' }) => {
  const exampleModels = getExampleModels(diag, text);
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
