// ============================================================
// GLOSSARY — aggregated from category files in this folder
// ============================================================
// Each file exports an `entries` array of { term, altTerms?, definition }.
// This index flattens them into a single Record<string, string> where
// both the primary term and all altTerms map to the same definition.
//
// ADDING A NEW TERM:
//   1. Find (or create) the appropriate category file
//   2. Add an entry: { term: "MyTerm", altTerms: ["Alias"], definition: "..." }
//   3. If the term has plurals or common variants, use altTerms instead of
//      creating separate entries
//
// See ../claude-glossary.md for writing guidelines.
// ============================================================
import { entries as foundationalMl } from './foundational-ml';
import { entries as recurrentNetworks } from './recurrent-networks';
import { entries as nlpSequenceModeling } from './nlp-sequence-modeling';
import { entries as attentionTransformer } from './attention-transformer';
import { entries as pretrainingTransfer } from './pretraining-transfer';
import { entries as scalingEmergent } from './scaling-emergent';
import { entries as vision } from './vision';
import { entries as mixtureOfExperts } from './mixture-of-experts';
import { entries as positionEncodings } from './position-encodings';
import { entries as alignmentRlhf } from './alignment-rlhf';
import { entries as chainOfThought } from './chain-of-thought';
import { entries as efficiencySystems } from './efficiency-systems';
import { entries as longContext } from './long-context';
import { entries as testTimeCompute } from './test-time-compute';
import { entries as ssmHybrids } from './ssm-hybrids';
import { entries as agentic } from './agentic';

const allEntries = [
  ...foundationalMl,
  ...recurrentNetworks,
  ...nlpSequenceModeling,
  ...attentionTransformer,
  ...pretrainingTransfer,
  ...scalingEmergent,
  ...vision,
  ...mixtureOfExperts,
  ...positionEncodings,
  ...alignmentRlhf,
  ...chainOfThought,
  ...efficiencySystems,
  ...longContext,
  ...testTimeCompute,
  ...ssmHybrids,
  ...agentic,
];

const built = {};
for (const { term, altTerms = [], definition } of allEntries) {
  built[term] = definition;
  for (const alt of altTerms) {
    built[alt] = definition;
  }
}

export const glossary = built;
