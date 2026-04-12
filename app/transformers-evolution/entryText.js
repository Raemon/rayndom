export const joinEntrySectionText = (oneLiner = '', text = '') => {
  return [oneLiner, text].filter(Boolean).join('\n\n');
};

export const splitEntrySectionText = (text = '') => {
  const [oneLiner = '', ...remainingParagraphs] = text.split('\n\n');
  return { oneLiner, text: remainingParagraphs.join('\n\n') };
};
