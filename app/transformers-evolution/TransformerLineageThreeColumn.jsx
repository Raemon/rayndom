'use client';
import { data } from './data';
import { Diagram } from './diagrams';
import { JargonText } from './JargonText';
import { ExampleModels } from './ExampleModels';

const TextBlock = ({ text }) => {
  const paragraphs = text.split('\n\n');
  return (
    <div className="leading-relaxed text-lg">
      {paragraphs.map((paragraph, idx) => (
        <div key={idx} className={idx < paragraphs.length - 1 ? 'mb-[0.6em]' : ''}>
          <JargonText>{paragraph}</JargonText>
        </div>
      ))}
    </div>
  );
};

const Label = ({ children }) => {
  return <div className="font-semibold text-[0.82em] uppercase tracking-[0.08em] text-black mb-2">{children}</div>;
};

const TransformerTocRow = ({ row, onSelect }) => {
  return (
    <button type="button" className="w-full text-left block cursor-pointer border-b border-black/20" onClick={() => onSelect(row.diag)}>
      <div className="flex items-center gap-x-5 py-3">
        <div className="flex items-center justify-center text-sm text-te-accent whitespace-nowrap font-sans">
          {row.year}
        </div>
        <div className="min-w-0 font-sans">
          <div className="font-semibold text-te-primary leading-[1.15]">
            {row.name}
          </div>
        </div>
      </div>
    </button>
  );
};

const TransformerLineageEntry = ({ row }) => {
  return (
    <section id={`entry-${row.diag}`} className="font-serif grid grid-cols-[minmax(320px,520px)_minmax(320px,320px)] gap-x-8 items-start scroll-mt-6">
      <div>
        <div className="font-[inherit] text-[2em] font-normal text-te-primary tracking-[-0.02em] leading-[1.05]">
          <div className="text-te-accent font-sans text-base">{row.year}</div>
          <div className="my-3">{row.name}</div>
        </div>
        <div className="text-te-secondary italic text-[1.06em] mt-1 mb-5">{row.oneLiner}</div>
        <div className="my-10">
          <Label>Problem</Label>
          <TextBlock text={row.problem} />
        </div>
        <div className="mb-5">
          <Label>Why Not Sooner?</Label>
          <TextBlock text={row.whyNotSooner} />
        </div>
        <div>
          <Label>Example Models</Label>
          <ExampleModels text={row.examples} className="leading-relaxed text-te-accent" />
        </div>
      </div>
      <div className="pt-2">
        <Diagram type={row.diag} />
      </div>
    </section>
  );
};

export default function TransformerLineageThreeColumn() {
  const scrollToEntry = diag => {
    document.getElementById(`entry-${diag}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="font-serif text-te-primary sticky top-0">
      <div className="flex">
        <aside className="w-[430px] shrink-0 px-5 py-8 h-screen">
            <div>
              {data.map(row => (
                <TransformerTocRow key={row.diag} row={row} onSelect={scrollToEntry} />
              ))}
            </div>
          </aside>
          <main className="flex-1">
            <div className="max-w-[1800px] mx-auto px-6 py-8">
              <div className="space-y-12">
                {data.map(row => (
                  <TransformerLineageEntry key={row.diag} row={row} />
                ))}
              </div>
            </div>
          </main>
      </div>
    </div>
  );
}
