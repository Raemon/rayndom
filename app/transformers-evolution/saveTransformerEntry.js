export const saveTransformerEntry = async entry => {
  const response = await fetch('/api/transformers-evolution/entry', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entry }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || 'Failed to save transformer entry');
  }
};
