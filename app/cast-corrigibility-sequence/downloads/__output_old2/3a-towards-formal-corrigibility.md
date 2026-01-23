# 3a. Towards Formal Corrigibility

## Background Knowledge

- Bayes nets and causal diagrams
- The MIRI 2015 Corrigibility paper and utility indifference
- The shutdown button / stop button problem in AI alignment
- Decision theory and expected utility maximization
- The concept of policies in reinforcement learning
- VNM utility theorem
- The difference between rewards, scores, and utility in AI systems
- The halting problem and diagonal arguments in computability
- Counterfactual reasoning in philosophy and AI
- The principle of explosion in logic
- The distinction between tool AI and agent AI
- Alex Turner's work on power-seeking and formalizing corrigibility

## New Knowledge

> **An agent is corrigible when it robustly acts to empower the principal to freely fix flaws in the agent's structure, thoughts, and actions (including their consequences), particularly in ways that avoid creating problems for the principal that they didn't foresee.**

> For the agent to "robustly act to empower the principal" I claim it naturally needs to continue to behave well even when significantly damaged or flawed.

> One of the key properties of robust systems is that they have lots of redundant checks on the quality of their outputs, and do not take for granted that the system is working well. Straightforwardness, conservatism, local scope, and resilience to having a cosmic ray flip the sign of the agent's utility function all stem from robustness.

> The word "freely" is intended to flag that if the agent is secretly (or overtly) controlling the principal, it is not corrigible.

> An agent has power over something insofar as their values are causally upstream of that part of reality in a way that results in their values over that part of the world being naturally satisfied through their actions.

> To do something (such as fixing flaws) freely, is to do it without being constrained by the external world. Some constraints, such as handcuffs, are dealt with under the general heading of being disempowered. In other words, power is a subset of freedom. But freedom also implies that nothing external is manipulating the agent's values or controlling the agent's information processing to screen off certain outcomes.

> It is hard to correctly balance arbitrary top-level goals against an antinatural goal like shutdownability or corrigibility.

> The whole notion of a "stop button" is a bit silly. Perhaps we can make things less bad by getting rid of the physical button, and replacing it with "a human has commanded the AI to stop." Now the AI can't encase the stop button in concrete or directly push the button itself. But (pretty obviously) the problem still persists.

> The AI still cares about not being shut down, and will take (superintelligent) actions to manipulate the humans (including simulated humans) around it into doing what it wants.

> **The kind of agent we want doesn't merely allow its principal to shut it down—it seeks for _the principal to actually be in control_.**

> It seems to me that the most straightforward way for the principal to actually be in charge of a powerful agent is if the agent is _indifferent_ to the choices of the principal. Insofar as the agent doesn't care about what decision the principal makes, any information it feeds the principal can't possibly be an attempt to manipulate the principal into making a decision one way or another.

> Even if utility indifference worked, it would not result in an AI with the kind of broad corrigibility that Christiano and I want to get. An indifferent AI won't deliberately repair a broken stop-button, proactively bring relevant information to the attention of the principal, ask for confirmation before doing strange things, or refine its own notion of corrigibility so as to highlight ways in which it could be made more corrigible.

> To truly get robust shutdownability the human must continually and genuinely be in control of whether the AI (and its child-agents) gets shut down. This means the agent must be involved in getting the relevant information to the human and preserving the controls.

> I believe that to be truly shutdownable, an agent needs to be _broadly_ corrigible.

> If I'm right that the sub-properties of corrigibility are mutually dependent, attempting to achieve corrigibility by addressing sub-properties in isolation is comparable to trying to create an animal by separately crafting each organ and then piecing them together. If any given half-animal keeps being obviously dead, this doesn't imply anything about whether a full-animal will be likewise obviously dead.

> I think that we can begin to see, here, how manipulation and empowerment are something like opposites. In fact, I might go so far as to claim that "manipulation," as I've been using the term, is actually synonymous with "disempowerment."

> Manipulation doesn't mean putting the other person into a state that they dislike—it's possible to manipulate someone into doing something that's ultimately better for them than they would've chosen themselves.

> Likewise, empowerment is not about putting the other person into a state they like—it's possible to empower someone and have them use that power to make bad choices, or even simply not use that power, instead focusing on other things.
