import TransformerLineage2 from './TransformerLineage2';

export default function TransformerLineagePage() {
  return (
    <div className="font-serif font-[var(--font-cormorant-garamond),Georgia,serif] bg-te-bg text-te-primary">
      {/* <header className="px-5 pt-8 pb-3 max-w-[2000px] mx-auto">
        <h1 className="font-[inherit] text-5xl font-normal text-te-primary tracking-[-0.02em] leading-none">
          The Transformer Lineage
        </h1>
      </header> */}
      <TransformerLineage2 />
    </div>
  );
}
