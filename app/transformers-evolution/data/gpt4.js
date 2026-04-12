export const entry = {
  year: 2023,
  name: "GPT-4 / Multimodal Models",
  diag: "gpt4",
  oneLiner: "Models that see images alongside text",
  problem: `The world is multimodal — people communicate with images, diagrams, charts, and screenshots alongside words. A text-only model cannot read a photograph, interpret a graph, or understand a meme. This limited LLMs to tasks where all relevant information could be expressed as text.

GPT-4 and its contemporaries added vision by connecting a visual encoder (typically a Vision Transformer that converts an image into a sequence of embedding vectors) to the language model. The image embeddings are projected into the same vector space as text token embeddings, and from the Transformer's perspective, an image is just another sequence of tokens interleaved with text. This enables cross-modal reasoning: the model can answer questions about an image, describe a chart, or follow instructions that reference visual content.`,
  whyNotSooner: `Individual pieces existed, but challenges remained: training stability when combining vision and language at scale, curating balanced datasets, and enormous compute requirements. CLIP (2021) was a prerequisite for vision-language alignment.`,
  howInvented: `Multimodal LLMs were invented by joining strong vision encoders to strong language models and training the combined system so images and text share a usable representation space. Independent convergence: at least 3 major groups were converging quickly — OpenAI, Google/DeepMind, and Anthropic-era competitors building vision-language assistants on similar principles.`,
  examples: "GPT-4,GPT-4o",
};
