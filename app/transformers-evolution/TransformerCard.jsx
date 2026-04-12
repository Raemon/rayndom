'use client';
import { Diagram } from './diagrams';
import { JargonText } from './JargonText';

const TextBlock = ({ text }) => {
  const paragraphs = text.split('\n\n');
  return (
    <div className="leading-relaxed">
      {paragraphs.map((p, i) => (
        <div key={i} className={i < paragraphs.length - 1 ? 'mb-[0.6em]' : ''}>
          <JargonText>{p}</JargonText>
        </div>
      ))}
    </div>
  );
};

export const TransformerCard = ({ row }) => {
  return (
    <tr className="bg-te-row-even align-top text-[.86em] font-serif">
      <td className="p-3.5 font-semibold text-te-accent whitespace-nowrap ">
        {row.year}
      </td>
      <td className="p-3.5 leading-relaxed w-full max-w-[600px] p-8">
        <div className="text-xl text-te-primary text-[1.6em] mb-0.5">{row.name}</div>
        <div className="text-te-secondary italic mb-6 text-[1.1em]">{row.oneLiner}</div>
        <div className="mb-2 max-w-[500px]">
          <h3 className="font-semibold text-[0.82em] uppercase tracking-[0.08em] text-black mb-3">The Problem</h3>
          <TextBlock text={row.problem} />
        </div>
        <div className="mb-2 max-w-[500px]">
          <h3 className="font-semibold text-[0.82em] uppercase tracking-[0.08em] text-black mb-3">Why Not Sooner?</h3>
          <TextBlock text={row.whyNotSooner} />
        </div>
      </td>
      <td className="p-2.5 max-w-[500px] w-full p-8">
        <Diagram type={row.diag} />
        <div className="font-semibold text-[0.82em] uppercase tracking-[0.08em] text-black mb-0.5">Notable Models</div>
          <ul className="m-0 pl-4">
            {row.examples.split(",").map((ex, i) => (
              <li key={i} className="text-[0.88em] text-te-accent mb-0.5">{ex.trim()}</li>
            ))}
          </ul>
      </td>
    </tr>
  );
};
