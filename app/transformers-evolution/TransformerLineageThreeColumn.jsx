'use client';
import { useEffect, useRef, useState } from 'react';
import { data } from './data';
import { Diagram } from './diagrams';
import { getTargetStageIndex } from './AnimatedLineageDiagram';
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

const TransformerTocRow = ({ row, onSelect, isActive }) => {
  return (
    <button type="button" aria-current={isActive ? 'location' : undefined} className={`w-full text-left block cursor-pointer border-b border-black/20 ${isActive ? 'bg-black/[0.06]' : 'hover:bg-black/[0.02]'}`} onClick={() => onSelect(row.diag)}>
      <div className="flex items-center gap-x-5 py-3">
        <div className={`flex items-center justify-center text-sm whitespace-nowrap font-sans ${isActive ? 'text-te-primary' : 'text-te-accent'}`}>
          {row.year}
        </div>
        <div className="min-w-0 font-sans">
          <div className={`font-semibold leading-[1.15] ${isActive ? 'text-black' : 'text-te-primary'}`}>
            {row.name}
          </div>
        </div>
      </div>
    </button>
  );
};

const TransformerLineageEntry = ({ row, sectionRef, whyNotSoonerRef }) => {
  return (
    <section id={`entry-${row.diag}`} data-diag={row.diag} ref={sectionRef} className="font-serif max-w-[520px] scroll-mt-6 min-h-[78vh]">
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
        <div className="mb-5" ref={whyNotSoonerRef}>
          <Label>Why Not Sooner?</Label>
          <TextBlock text={row.whyNotSooner} />
        </div>
        <div>
          <Label>Example Models</Label>
          <ExampleModels text={row.examples} className="leading-relaxed text-te-accent" />
        </div>
      </div>
    </section>
  );
};

export default function TransformerLineageThreeColumn() {
  const [activeDiag, setActiveDiag] = useState(data[0]?.diag ?? null);
  const [diagramTargetStageIndex, setDiagramTargetStageIndex] = useState(getTargetStageIndex(data[0]?.diag ?? null));
  const sectionRefs = useRef({});
  const whyNotSoonerRefs = useRef({});
  const fixedColumnLeft = 'max(20px, calc((100vw - 1800px) / 2 + 20px))';

  useEffect(() => {
    let animationFrameId = null;
    const updateActiveDiagFromScroll = () => {
      animationFrameId = null;
      const anchorY = window.innerHeight * 0.24;
      const measuredSections = data.map(row => {
        const sectionElement = sectionRefs.current[row.diag];
        if (!sectionElement) return null;
        const rect = sectionElement.getBoundingClientRect();
        return {
          diag: row.diag,
          top: rect.top,
          bottom: rect.bottom,
          distanceFromAnchor: Math.abs(rect.top - anchorY),
        };
      }).filter(Boolean);
      if (!measuredSections.length) return;
      let activeSection = measuredSections[0];
      for (const measuredSection of measuredSections) {
        const anchorIsInsideSection = measuredSection.top <= anchorY && measuredSection.bottom >= anchorY;
        const activeAnchorIsInsideSection = activeSection.top <= anchorY && activeSection.bottom >= anchorY;
        if (anchorIsInsideSection && !activeAnchorIsInsideSection) {
          activeSection = measuredSection;
          continue;
        }
        if (anchorIsInsideSection === activeAnchorIsInsideSection && measuredSection.distanceFromAnchor < activeSection.distanceFromAnchor) {
          activeSection = measuredSection;
        }
      }
      if (!activeSection?.diag) return;
      const whyNotSoonerElement = whyNotSoonerRefs.current[activeSection.diag];
      const showFinalSubstage = whyNotSoonerElement ? whyNotSoonerElement.getBoundingClientRect().top <= anchorY : true;
      const nextTargetStageIndex = getTargetStageIndex(activeSection.diag, showFinalSubstage);
      setActiveDiag(currentDiag => currentDiag === activeSection.diag ? currentDiag : activeSection.diag);
      setDiagramTargetStageIndex(currentStageIndex => currentStageIndex === nextTargetStageIndex ? currentStageIndex : nextTargetStageIndex);
    };
    const scheduleScrollUpdate = () => {
      if (animationFrameId != null) return;
      animationFrameId = window.requestAnimationFrame(updateActiveDiagFromScroll);
    };
    scheduleScrollUpdate();
    window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
    window.addEventListener('resize', scheduleScrollUpdate);
    return () => {
      if (animationFrameId != null) window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', scheduleScrollUpdate);
      window.removeEventListener('resize', scheduleScrollUpdate);
    };
  }, []);

  const scrollToEntry = entryKey => {
    setActiveDiag(entryKey);
    setDiagramTargetStageIndex(getTargetStageIndex(entryKey, false));
    document.getElementById(`entry-${entryKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="font-serif text-te-primary">
      <div className="relative max-w-[1800px] mx-auto px-5 py-8" style={{ '--lineage-fixed-left': fixedColumnLeft }}>
        <aside className="fixed top-0 h-screen overflow-y-auto pt-8 pb-8" style={{ left: 'var(--lineage-fixed-left)', width: '430px' }}>
          <div>
            {data.map(row => (
              <TransformerTocRow key={row.diag} row={row} onSelect={scrollToEntry} isActive={row.diag === activeDiag} />
            ))}
          </div>
        </aside>
        <div className="fixed top-0 flex h-screen items-center" style={{ left: 'calc(var(--lineage-fixed-left) + 1030px)', width: '680px' }}>
          <Diagram type={activeDiag} className="w-full max-w-[680px]" targetStageIndex={diagramTargetStageIndex} />
        </div>
        <div style={{ paddingLeft: '470px' }}>
          <div className="space-y-[400px] max-w-[520px]">
            {data.map(row => (
              <TransformerLineageEntry key={row.diag} row={row} sectionRef={element => { sectionRefs.current[row.diag] = element; }} whyNotSoonerRef={element => { whyNotSoonerRefs.current[row.diag] = element; }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
