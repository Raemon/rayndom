'use client';
import { C } from './colors';
import { Diagram } from './diagrams';
import { JargonText } from './JargonText';

const TextBlock = ({ text }) => {
  const paragraphs = text.split('\n\n');
  return (
    <div style={{ lineHeight: "1.6" }}>
      {paragraphs.map((p, i) => (
        <div key={i} style={{ marginBottom: i < paragraphs.length - 1 ? '0.6em' : 0 }}>
          <JargonText>{p}</JargonText>
        </div>
      ))}
    </div>
  );
};

export const TransformerCard = ({ row }) => {
  const bg = C.rowEven;
  return (
    <tr style={{ background: bg, verticalAlign: "top", fontSize: ".86em" }}>
      <td style={{ padding: "14px", fontWeight: 600, color: C.textAccent, whiteSpace: "nowrap" }}>
        {row.year}
      </td>
      <td style={{ padding: "14px", lineHeight: 1.6 }}>
        <div style={{ fontWeight: 600, color: "#1a1a1a", fontSize: "1.1em", marginBottom: 2 }}>{row.name}</div>
        <div style={{ color: C.textSecondary, fontStyle: "italic", marginBottom: 8 }}>{row.oneLiner}</div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: "0.82em", textTransform: "uppercase", letterSpacing: "0.08em", color: C.headerText, marginBottom: 2 }}>Problem Solved</div>
          <TextBlock text={row.problem} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: "0.82em", textTransform: "uppercase", letterSpacing: "0.08em", color: C.headerText, marginBottom: 2 }}>Why Not Sooner?</div>
          <TextBlock text={row.whyNotSooner} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "0.82em", textTransform: "uppercase", letterSpacing: "0.08em", color: C.headerText, marginBottom: 2 }}>Notable Models</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {row.examples.split(",").map((ex, i) => (
              <li key={i} style={{ fontSize: "0.88em", color: C.textAccent, marginBottom: 2 }}>{ex.trim()}</li>
            ))}
          </ul>
        </div>
      </td>
      <td style={{ padding: "10px", minWidth: 300 }}>
        <Diagram type={row.diag} />
      </td>
    </tr>
  );
};
