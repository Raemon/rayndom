# Post 3b: Formal (Faux) Corrigibility - Knowledge Analysis

**NOTE: The author later identified critical flaws in this formalism. See "Serious Flaws in CAST" post.**

## Background Knowledge
Prerequisites and existing concepts the author assumes familiarity with:

### Probability Theory & Statistics
- Bayes nets and causal graphs
- Conditional probability distributions
- Marginal distributions
- Expectation operators
- Sampling from distributions

### Information Theory
- Kullback-Leibler divergence
- Similarity measures between distributions

### Decision Theory
- Expected utility maximization
- Counterfactual reasoning
- Policy as function from context to action
- The null policy

### Mathematical Concepts
- Simplicity-weighted priors (Solomonoff-style)
- K-complexity
- Bounded utility functions
- Normalization of value functions

### Prior Work on Power/Empowerment
- Empowerment in RL (Salge, Glackin, Polani 2013)
- Alex Turner's work on power-seeking
- Jacob Cannell's "Empowerment is (almost) All We Need"

### AI Safety Concepts
- Value modification and manipulation
- The problem of fully updated deference
- Distributional shift
- Ontological shift
- Robustness requirements

### Time and Decision-Making
- Multi-timestep planning
- Temporal discounting
- Myopia in AI systems
- Present-biased reasoning

## New Knowledge (Author's Novel Contributions)

### Formal Power Measure
Novel mathematical definition of power:

localPower(x,v) = E_{v'~Q(V),a~P(A|x,v),d~P(D|x,v',a)}[v(d)] 
                - E_{v'~Q(V),a'~P(A|x,v'),d'~P(D|x,v',a')}[v(d')]

Key insight: Power should be measured by whether the world is good when actions are drawn from actual values vs. counterfactual values, not just whether the world is good.

### The Queen Alice Example
Illustrative worked example showing:
- Incompetent servants: ~15% power
- Competent servants: higher power
- Servants who read body language and ignore orders: ZERO power

This demonstrates that power requires actions to matter, not just values being satisfied.

### Simplicity-Weighting Argument
The argument that Q(V) must be simplicity-weighted rather than actual probability:
- If Q = P (actual distribution), then increasing entropy in values increases power
- This would make the AI want to randomize principal's values (bad!)
- Simplicity-weighting prevents optimization pressure on the value distribution

### Formal Empowerment and Manipulation
empowerment(π) = E_{x~P(X|π)}[power(x∪π)] - E_{x'~P(X|π_0)}[power(x'∪π_0)]

manipulation(π) = (1+max(0,-empowerment(π))) / sim(P(V|π),P(V|π_0)) - 1

### Formal Corrigibility Measure
corrigibility(π) = empowerment(π) × sim(P(V|π),P(V|π_0))

### Multi-Timestep Extension
Novel formalization for indefinite time horizons:
- Separate Value and Action nodes per timestep
- Single Domain node downstream of all
- Environment nodes mediating carry-over
- Average corrigibility across timesteps

### "Being Present" Solution
Novel approach to time problems:
- Enforce identical sub-policies across timesteps (when information is the same)
- Use AI's uncertainty about current time to concentrate weight on present
- This produces myopia naturally
- Suggested refinements: smoothed time distribution, manipulation penalties across time

### Key Self-Critique
The author emphasizes:
- The sim(.) term is too restrictive (blocks beneficial value updates)
- No robustness term included
- No graceful obsolescence handling
- The formalism is "assuredly wrong"
- Data-based training may be more robust than formal measures
- "I have far more trust in human intuition being able to spot subtle incorrigibility in a concrete setting than I have faith in developing an equation"
