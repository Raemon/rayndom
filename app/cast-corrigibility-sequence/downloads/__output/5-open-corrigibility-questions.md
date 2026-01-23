# Post 5: Open Corrigibility Questions - Knowledge Analysis

## Background Knowledge
Prerequisites and concepts referenced:

### From Earlier Posts in Sequence
- The CAST formalism (power, empowerment, manipulation measures)
- The attractor basin hypothesis
- Corrigibility desiderata
- Anti-naturality concerns

### AI Safety Research Areas
- Mechanistic interpretability
- Constitutional AI
- Adversarial training
- Gridworld benchmarks
- Decision theory debates

### Mathematical/Formal Concepts
- Model temperature in optimization
- Lower-bound optimization
- Time and policies relationship
- Robustness formalization

### Prior Work Referenced
- Alex Turner's power/attainable utility preservation
- The MIRI 2015 corrigibility paper
- AI safety benchmarks
- Existing interpretability methods

## New Knowledge (Author's Novel Contributions)

### Remaining Theoretical Confusion (Identified Gaps)
The author catalogues unsolved problems:

1. **Empowerment scope**: Does restricting empowerment to agent's structure/thoughts/actions matter, or is general empowerment sufficient?
2. **Obedience to self-harming commands**: Formalism should capture obeying commands that disempower principal
3. **Pressure from outside values**: Can we prove that external pressure on principal is disempowering?
4. **Decision theory entanglement**: What decision theory is implicit in the formalism?
5. **Multi-timestep rescuing**: Are the proposed solutions philosophically coherent?
6. **Meta-values and growth**: How to distinguish good value change from manipulation?
7. **Learning vs. values**: Is there a clean line? Does corrigibility risk blocking learning?
8. **Self-protection scope**: Protect from agent's actions only, or protect generally?
9. **Priority of present over past**: Why do current commands override past ones?
10. **Team as principal**: How to ground multi-human principals ontologically?
11. **Self-contradictory principals**: How to behave when principal is inconsistent?
12. **Death formalization**: Graceful behavior when principal dies
13. **Principal identification brittleness**: How robust is the ontological link?
14. **Values/actions ontology brittleness**: What if these categories blur?
15. **Robustness formalization**: What does "pop up to outside view" mean formally?
16. **Relationship to Turner's work**: Can power/AUP be unified with CAST?
17. **Anti-naturality strength**: How strong is this force in practice?
18. **Basin width**: How wide is the corrigibility attractor basin?
19. **Distributional shift danger**: How sharp is the shift when AGI can think independently?
20. **Path to human values**: Is there a "ravine" from corrigibility basin to human values?
21. **Scaling indicators**: How to judge when more corrigibility work is needed vs. safe to scale?

### Proposed Research Directions

#### Training Corrigible Models
- Fine-tune open-source model on corrigibility examples
- Test if model can reconstruct excluded desiderata
- Identify main distractor behaviors (helpful but not corrigible)
- Benchmark corrigibility scaling with compute
- Compare CAST vs. mixed-goal training

#### Human Understanding Studies
Novel proposal to test corrigibility concept via human experiments:
- Present situations, ask how corrigible agent would behave
- Measure inter-rater agreement (agreement implies coherence)
- Identify biggest sources of confusion
- Use multiple judges including LLM judges
- High agreement = evidence corrigibility is natural/coherent concept

#### Other Experiments
- Train anti-natural goals (Omohundro-opposed) vs. neutral goals like diamond
- Test if anti-naturality makes goals harder to instill
- Build score-maximizing agent using formal corrigibility measure
- Train/evaluate gridworld agent with corrigibility measure
- Roleplay games: Human, AI, Environment, Devil players
- Generate diverse corrigibility vignettes with LLMs

### Key Meta-Points
1. **Distillation needed**: "One of the most useful next-steps is distillation and attempting to communicate these ideas in a more accessible way"
2. **Community engagement**: Invitation to suggest experiments and engage via comments/email
3. **Open science framing**: "We're all in this together"
