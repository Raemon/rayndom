export const entry = {
  year: 1986,
  name: "Backpropagation",
  diag: "backprop",
  oneLiner: "How to train networks with many layers at once",
  problemOneLiner: `Hidden layers had no training signal, so backprop sent error gradients backward through every layer.`,
  problem: `Multi-layer networks — stacking several layers of perceptrons — could in theory represent complex, non-linear patterns, solving XOR and far beyond. But when the output is wrong, you can adjust the final layer's weights directly — what about the hidden layers buried inside? Their contribution to the error is indirect, and no clear method existed to figure out how to nudge them.

Backpropagation solved this using the chain rule — a calculus formula for derivatives of composed functions. Applied layer by layer from output back to input, it computes exactly how much each weight in every layer contributed to the error. This gives you a gradient — a direction to adjust each weight to reduce the error. The process of repeatedly following this direction is called gradient descent. Together, backprop + gradient descent made end-to-end training of deep networks practical for the first time.`,
  whyNotSoonerOneLiner: `The chain rule existed, but end-to-end neural credit assignment needed both a clear demo and the right audience.`,
  whyNotSooner: `The chain rule was centuries old, and automatic differentiation was described by Linnainmaa in 1970. Werbos applied backprop to networks in his 1974 thesis. But Rumelhart, Hinton & Williams' 1986 paper demonstrated it on compelling problems and reached the right audience. The field also needed to recover from the "AI winter" triggered by Minsky & Papert's 1969 critique of perceptrons.`,
  examples: "NETtalk (text-to-speech),Handwriting recognition,Foundation for ALL deep learning that followed",
};
