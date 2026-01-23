This website requires javascript to properly function. Consider activating javascript to get access to all site functionality. 

## 

[LESSWRONG](/)

[LW](/)

Login

0\. CAST: Corrigibility as Singular Target

10 min read

•

Overview

•

1\. The CAST Strategy

•

2\. Corrigibility Intuition

•

3a. Towards Formal Corrigibility

•

3b. Formal (Faux) Corrigibility ← the mathy one

•

4\. Existing Writing on Corrigibility

•

5\. Open Corrigibility Questions

•

Edit: Serious Flaws in CAST

•

Bibliography and Miscellany

[CAST: Corrigibility As Singular Target](/s/KfCjeconYRdFbMxsy)

[](/s/KfCjeconYRdFbMxsy/p/3HMh7ES4ACpeDKtsW)

[Corrigibility](/w/corrigibility-1)[AI](/w/ai)[Curated](/recommendations)

# 152

# [0\. CAST: Corrigibility as Singular Target](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1)

by [Max Harms](/users/max-harms?from=post_header)

7th Jun 2024

[AI Alignment Forum](https://alignmentforum.org/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1)

10 min read

22

# 152

# Ω 50

Review byPeterMcCluskey

Review

What the heck is up with “corrigibility”? For most of my career, I had a sense that it was a grab-bag of properties that seemed nice in theory but hard to get in practice, perhaps due to being incompatible with agency.

Then, last year, I spent some time revisiting my perspective, and I concluded that I had been deeply confused by what corrigibility even was. I now think that **corrigibility is a single, intuitive property** , which people can learn to emulate without too much work and which is deeply compatible with agency. Furthermore, I expect that even with prosaic training methods, there’s some chance of winding up with an AI agent that’s inclined to become more corrigible over time, rather than less (as long as the people who built it understand corrigibility and want that agent to become more corrigible). Through a slow, gradual, and careful process of refinement, I see a path forward where **this sort of agent could ultimately wind up as a (mostly) safe superintelligence**. And, if that AGI is in the hands of responsible governance, this could end the [acute risk period](/w/acute-risk-period), and get us to a good future.

**This is not the path we are currently on.** As far as I can tell, frontier labs do not understand corrigibility deeply, and are not training their models with corrigibility as the goal. Instead, they are racing ahead with a vague notion of “ethical assistance” or “helpful+harmless+honest” and a hope that “we’ll muddle through like we always do” or “use AGI to align AGI” or something with similar levels of wishful thinking. Worse, I suspect that many researchers encountering the concept of corrigibility will mistakenly believe that they understand it and are working to build it into their systems.

**Building corrigible agents is hard and fraught with challenges.** Even in an ideal world where the developers of AGI aren’t racing ahead, but are free to go as slowly as they wish and take all the precautions I indicate, there are good reasons to think doom is still likely. I think that the most prudent course of action is for the world to shut down capabilities research until our science and familiarity with AI catches up and we have better safety guarantees. But **if people are going to try and build AGI despite the danger, they should at least have a good grasp on corrigibility and be aiming for it as the singular target** , rather than as part of a mixture of goals (as is the current norm).

My goal with these documents is primarily to do three things:

  1. Advance our understanding of corrigibility, especially on an intuitive level.
  2. Explain why designing AGI with corrigibility as the sole target (CAST) is more attractive than other potential goals, such as full alignment, or local preference satisfaction.
  3. Propose a novel formalism for measuring corrigibility as a trailhead to future work.



Alas, my writing is not currently very distilled. Most of these documents are structured in the format that I originally chose for my private notes. I’ve decided to publish them in this style and get them in front of more eyes rather than spend time editing them down. Nevertheless, here is my attempt to briefly state the **key ideas** in my work:

  1. **Corrigibility is the simple, underlying generator** behind obedience, conservatism, willingness to be shut down and modified, transparency, and low-impact.
     1. It is a fairly simple, universal concept that is not too hard to get a rich understanding of, at least on the intuitive level.
     2. Because of its simplicity, we should expect AIs to be able to emulate corrigible behavior fairly well with existing tech/methods, at least within familiar settings.
  2. **Aiming for CAST is a better plan than aiming for human values** (i.e. [CEV](https://intelligence.org/files/CEV.pdf)), helpfulness+harmlessness+honesty, or even a balanced collection of desiderata, including some of the things corrigibility gives rise to.
     1. If we ignore the possibility of halting the development of machines capable of seizing control of the world, we should try to build CAST AGI.
     2. **CAST is a target, rather than a technique** , and as such it’s compatible both with prosaic methods and superior architectures.
        1. Even if you suspect prosaic training is doomed, CAST should still be the obvious target once a non-doomed method is found.
  3. Despite being simple, corrigibility is poorly understood, and **we are not on track for having corrigible AGI** , even if reinforcement learning is a viable strategy.
     1. Contra Paul Christiano, we should not expect corrigibility to emerge automatically from systems trained to satisfy local human preferences.
     2. Better awareness of the subtleties and complexities of corrigibility are likely to be essential to the construction of AGI going well.
  4. **Corrigibility is nearly unique among all goals for being simultaneously useful and non-self-protective.**
     1. This property of non-self-protection means we should suspect AIs that are almost-corrigible will assist, rather than resist, being made more corrigible, thus forming **an attractor-basin around corrigibility** , such that almost-corrigible systems gradually become truly corrigible by being modified by their creators.
        1. **If this effect is strong enough** , **CAST is a pathway to safe superintelligence** via slow, careful training using adversarial examples and other known techniques to refine AIs capable of shallow approximations of corrigibility into agents that deeply seek to be corrigible at their heart.
     2. There is also reason to suspect that almost-corrigible AIs learn to be less corrigible over time due to **corrigibility being “anti-natural.”** It is unclear to me which of these forces will win out in practice.
  5. There are several reasons to expect building AGI to be catastrophic, even if we work hard to aim for CAST.
     1. Most notably, **corrigible AI is still extremely vulnerable to misuse** , and we must ensure that superintelligent AGI is only ever corrigible to wise representatives.
  6. ~~My intuitive notion of**corrigibility can be straightforwardly leveraged to build a formal, mathematical measure**.~~
     1. ~~Using this measure we can make**a better solution to the shutdown-button toy problem** than I have seen elsewhere.~~
     2. This formal measure is still lacking, and almost certainly doesn’t actually capture what I mean by “corrigibility.”
     3. **Edit: My attempted formalism**[**failed catastrophically**](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast)**.**
  7. **There is lots of opportunity for more work on corrigibility, some of which is shovel-ready** for theoreticians and engineers alike.



**Note:** I’m a MIRI researcher, but this agenda is the product of my own independent research, and as such one should not assume it’s endorsed by other research staff at MIRI.

**Note:** Much of my thinking on the topic of corrigibility is _heavily_ influenced by the work of Paul Christiano, Benya Fallenstein, Eliezer Yudkowsky, Alex Turner, and several others. My writing style involves presenting things from my perspective, rather than leaning directly on the ideas and writing of others, but I want to make it very clear that I’m largely standing on the shoulders of giants, and that much of my optimism in this research comes from noticing convergent lines of thought with other researchers. Thanks to Nate Soares, Steve Byrnes, Jesse Liptrap, Seth Herd, Ross Nordby, Jeff Walker, Haven Harms, and Duncan Sabien for early feedback. I also want to especially thank Nathan Helm-Burger for his in-depth collaboration on the research and generally helping me get unconfused.

# Overview

## [1\. The CAST Strategy](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy)

In [The CAST Strategy](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy), I introduce the property corrigibility, why it’s an attractive target, and how we might be able to get it, even with prosaic methods. I discuss the risks of making corrigible AI and why **trying to get corrigibility as one of many desirable properties to train an agent to have (instead of as the singular target) is likely a bad idea**. Lastly, I do my best to lay out the cruxes of this strategy and explore potent counterarguments, such as anti-naturality and whether corrigibility can scale. These counterarguments show that **even if we can get corrigibility, we should not expect it to be easy or foolproof**.

## [2\. Corrigibility Intuition](/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition)

In [Corrigibility Intuition](/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition), I try to give a strong intuitive handle on corrigibility as I see it. This involves a collection of many stories of a CAST agent behaving in ways that seem good, as well as a few stories of where a CAST agent behaves sub-optimally. I also attempt to contrast corrigibility with nearby concepts through vignettes and direct analysis, which includes a discussion of why **we should** _**not**_**expect frontier labs, given current training targets, to produce corrigible agents**.

## [3a. Towards Formal Corrigibility](/posts/WDHREAnbfuwT88rqe/3a-towards-formal-corrigibility)

In [Towards Formal Corrigibility](/posts/WDHREAnbfuwT88rqe/3a-towards-formal-corrigibility), I attempt to sharpen my description of corrigibility. I try to anchor the notion of corrigibility, ontologically, as well as clarify language around concepts such as “agent” and “reward.” Then I begin to discuss the shutdown problem, including why it’s easy to get basic shutdownability, but hard to get the kind of corrigible behavior we actually desire. I present the sketch of a solution to the shutdown problem, and discuss manipulation, which I consider to be the hard part of corrigibility.

## [3b. Formal (Faux) Corrigibility](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility) ← the mathy one

In [Formal (Faux) Corrigibility](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility), I build a fake framework for measuring empowerment in toy problems, and suggest that it’s at least a start at measuring manipulation and corrigibility. This metric, at least in simple settings such as a variant of the original stop button scenario, produces corrigible behavior. I extend the notion to indefinite games played over time, and end by criticizing my own formalism and arguing that data-based methods for building AGI (such as prosaic machine-learning) may be significantly more robust (and therefore better) than methods that heavily trust this sort of formal analysis.

## [4\. Existing Writing on Corrigibility](/posts/d7jSrBaLzFLvKgy32/4-existing-writing-on-corrigibility)

In [Existing Writing on Corrigibility](/posts/d7jSrBaLzFLvKgy32/4-existing-writing-on-corrigibility), I go through many parts of the literature in depth including MIRI’s earlier work, some of the writing by Paul Christiano, Alex Turner, Elliot Thornley, John Wentworth, Steve Byrnes, Seth Herd, and others.

## [5\. Open Corrigibility Questions](/posts/wZjGLYp5WQwF8Y8Kk/5-open-corrigibility-questions)

In [Open Corrigibility Questions](/posts/wZjGLYp5WQwF8Y8Kk/5-open-corrigibility-questions), I summarize my overall reflection of my understanding of the topic, including reinforcing the counterarguments and nagging doubts that I find most concerning. I also lay out potential directions for additional work, including studies that I suspect others could tackle independently.

## [Edit: Serious Flaws in CAST](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast)

In [Serious Flaws in CAST](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast), I notice the parts of this research that I have updated negatively around, including noticing a critical flaw in the formalism, in the "attractor basin" metaphor, and in the hope for success absent theoretical foundation. I don't feel that my self-critique invalidates everything of value in CAST, but it's worth being aware of as a counterpoint.

# Bibliography and Miscellany

In addition to this sequence, I’ve created a [Corrigibility Training Context](https://docs.google.com/document/d/1zgCuRRZO4KSm53Kh5sHR-i-k4vjBfcg77PqqohSIoIc/edit?usp=sharing) that gives ChatGPT a moderately-good understanding of corrigibility, if you’d like to [try talking to it](https://chat.openai.com/g/g-HheSLXpkz-corrigibility-oracle).

The rest of this post is bibliography, so I suggest now jumping straight to [The CAST Strategy](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy).

While I don’t necessarily link to or discuss each of the following sources in my writing, I’m aware of and have at least skimmed everything listed here. Other writing has influenced my general perspective on AI, but if there are any significant pieces of writing on the topic of corrigibility that aren’t on this list, please let me know.

  * Arbital (almost certainly Eliezer Yudkowsky)
    * “[Corrigibility](/w/corrigibility).”
    * “[Hard problem of corrigibility](/w/hard_corrigibility).”
    * “[Problem of fully updated deference](/w/updated_deference).”
    * “[Shutdown problem](/w/shutdown_problem).”
    * “[Utility indifference](/w/utility_indifference).”
  * Stuart Armstrong
    * “[The limits of corrigibility](/posts/T5ZyNq3fzN59aQG5y/the-limits-of-corrigibility).” 2018.
    * “[Petrov corrigibility](/posts/4g29JgtbJ283iJ3Bh/petrov-corrigibility).” 2018.
    * “[Corrigibility doesn't always have a good action to take](/posts/nbhTzEosM9sqEvr6P/corrigibility-doesn-t-always-have-a-good-action-to-take).” 2018.
  * Audere
    * “[An Impossibility Proof Relevant to the Shutdown Problem and Corrigibility](/posts/MBemd8k9uHFDEKzad/an-impossibility-proof-relevant-to-the-shutdown-problem-and).” 2023.
  * Yuntao Bai et al. (Anthropic)
    * “[Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862).” 2022.
  * Nick Bostrom
    * “[Superintelligence: Paths, Dangers, Strategies](https://en.wikipedia.org/wiki/Superintelligence:_Paths,_Dangers,_Strategies).” 2014.
  * Gwern Branwen
    * “[Why Tool AIs Want to Be Agent AIs](https://gwern.net/tool-ai).” 2016.
  * Steven Byrnes
    * “[Thoughts on implementing corrigible robust alignment](/posts/8W5gNgEKnyAscg8BF/thoughts-on-implementing-corrigible-robust-alignment).” 2019.
    * “[Three mental images from thinking about AGI debate & corrigibility](/posts/WjY9y7r52vaNZ2WmH/three-mental-images-from-thinking-about-agi-debate-and).” 2020.
    * “[Consequentialism & corrigibility](/posts/KDMLJEXTWtkZWheXt/consequentialism-and-corrigibility).” 2021.
    * “[Solving the whole AGI control problem, version 0.0001](/posts/Gfw7JMdKirxeSPiAk/solving-the-whole-agi-control-problem-version-0-0001).” 2021.
    * “[Reward is Not Enough](/posts/frApEhpyKQAcFvbXJ/reward-is-not-enough).” 2021.
    * “[Four visions of Transformative AI success](/posts/3aicJ8w4N9YDKBJbi/four-visions-of-transformative-ai-success)” 2024.
  * Jacob Cannell
    * “[Empowerment is (almost) all we need](/posts/JPHeENwRyXn9YFmXc/empowerment-is-almost-all-we-need).” 2022.
  * Ryan Carey and Tom Everitt
    * “[Human Control: Definitions and Algorithms](https://proceedings.mlr.press/v216/carey23a/carey23a.pdf?fbclid=IwAR36GShY6eXcnEjjR6px_8AQZgwtzHSOdB6Z4eoza-tzlJw3dBk4oXBMFWY).” 2023.
  * Paul Christiano
    * “[Corrigibility](/posts/fkLYhTQteAu5SinAc/corrigibility).” 2015.
    * “[Worst-case guarantees](https://ai-alignment.com/training-robust-corrigibility-ce0e0a3b9b4d).” 2019.
    * [Response to Eliezer on "Let's see you write that Corrigibility tag"](/posts/AqsjZwxHNqH64C2b6/let-s-see-you-write-that-corrigibility-tag?commentId=8kPhqBc69HtmZj6XR#fnwds07hpbws). 2022.
  * Computerphile (featuring Rob Miles)
    * “[AI "Stop Button" Problem - Computerphile](https://www.youtube.com/watch?v=3TYT1QfdfsM).” 2017.
    * “[Stop Button Solution? - Computerphile](https://www.youtube.com/watch?v=9nktr1MgS-A).” 2017.
  * Wei Dai
    * “[Can Corrigibility be Learned Safely](/posts/o22kP33tumooBtia3/can-corrigibility-be-learned-safely).” 2018.
    * “[A broad basin of attraction around human values?](/posts/TrvkWBwYvvJjSqSCj/a-broad-basin-of-attraction-around-human-values)” 2022.
  * Roger Dearnaley
    * “[Requirements for a Basin of Attraction to Alignment](/posts/EbGkqFNz8y93Ttuwq/requirements-for-a-basin-of-attraction-to-alignment)” 2024.
  * Abram Demski
    * “[Non-Consequentialist Cooperation?](/posts/F9vcbEMKW48j4Z6h9/non-consequentialist-cooperation)” 2019.
    * “[The Parable of the Predict-o-Matic](/posts/SwcyMEgLyd4C3Dern/the-parable-of-predict-o-matic).” 2019.
  * Benya Fallenstein
    * “[Generalizing the Corrigibility paper's impossibility result?](/posts/5bd75cc58225bf0670374ec7/generalizing-the-corrigibility-paper-s-impossibility-result)” 2015.
  * Simon Goldstein
    * “[Shutdown Seeking AI](/posts/FgsoWSACQfyyaB5s7/shutdown-seeking-ai).” 2023.
  * Ryan Greenblatt and Buck Shlegeris
    * “[The case for ensuring that powerful AIs are controlled](/posts/kcKrE9mzEHrdqtDpE/the-case-for-ensuring-that-powerful-ais-are-controlled).” 2024.
  * Dylan Hadfield-Menell, Anca Dragan, Pieter Abbeel, and Stuart Russell
    * “[The Off-Switch Game](https://arxiv.org/abs/1611.08219).” 2016.
  * Seth Herd
    * “[Corrigibility or DWIM is an attractive primary goal for AGI](/posts/ZdBmKvxBKJH2PBg9W/corrigibility-or-dwim-is-an-attractive-primary-goal-for-agi).” 2023.
    * “[Instruction-following AGI is easier and more likely than value aligned AGI](/posts/7NvKrqoQgJkZJmcuD/instruction-following-agi-is-easier-and-more-likely-than).” 2024.
  * Koen Holtman
    * “[New paper: Corrigibility with Utility Preservation](/posts/3uHgw2uW6BtR74yhQ/new-paper-corrigibility-with-utility-preservation).” 2019.
    * “[Disentangling Corrigibility: 2015-2021](/posts/MiYkTp6QYKXdJbchu/disentangling-corrigibility-2015-2021)” 2021.
    * [LW Comment on “Question: MIRI Corrigibility Agenda](/posts/BScxwSun3K2MgpoNz/question-miri-corrigbility-agenda?commentId=CiqJrSTrX2kYDLrEW).” 2020.
  * Evan Hubinger
    * “[Towards a mechanistic understanding of corrigibility](/posts/BKM8uQS6QdJPZLqCr/towards-a-mechanistic-understanding-of-corrigibility).” 2019.
  * Holden Karnofsky
    * “[Thoughts on the Singularity Institute](/posts/6SGqkCgHuNr7d4yJm/thoughts-on-the-singularity-institute-si)” (a.k.a. The Tool AI post). 2012.
  * Martin Kunev
    * “[How useful is Corrigibility?](/posts/Py3vqPp9uSqQJHFuy/how-useful-is-corrigibility)” 2023.
  * Ross Nordby
    * “[Using predictors in corrigible systems](/posts/LR8yhJCBffky8X3Az/using-predictors-in-corrigible-systems).” 2023.
  * Stephen Omohundro
    * “[The Basic AI Drives](https://selfawaresystems.com/wp-content/uploads/2008/01/ai_drives_final.pdf).” 2008.
  * Sami Peterson
    * “[Invulnerable Incomplete Preferences: A Formal Statement](/posts/sHGxvJrBag7nhTQvb/invulnerable-incomplete-preferences-a-formal-statement-1).” 2023.
  * Christoph Salge, Cornelius Glackin, and Daniel Polani
    * “[Empowerment – An Introduction](https://arxiv.org/pdf/1310.1863.pdf).” 2013.
  * Nate Soares, Benya Fallenstein, Eliezer Yudkowsky, and Stuart Armstrong
    * “[Corrigibility](https://intelligence.org/files/Corrigibility.pdf).” 2015.
  * tailcalled
    * “[Stop button: towards a causal solution](/posts/wxbMsGgdHEgZ65Zyi/stop-button-towards-a-causal-solution).” 2021.
  * Jessica Taylor
    * “[A first look at the hard problem of corrigibility](/posts/5bd75cc58225bf0670375041/a-first-look-at-the-hard-problem-of-corrigibility).” 2015.
  * Elliott Thornley
    * “[The Shutdown Problem: Incomplete Preferences as a Solution](/posts/YbEbwYWkf8mv9jnmi/the-shutdown-problem-incomplete-preferences-as-a-solution).” 2024.
    * “[The Shutdown Problem: Three Theorems](/posts/8GWLRMnp55iFZDBbm/the-shutdown-problem-three-theorems).” 2023.
  * Alex Turner, Logan Smith, Rohin Shah, Andrew Critch, and Prasad Tadepalli
    * “[Optimal Policies Tend to Seek Power](https://arxiv.org/abs/1912.01683).” 2019.
  * Alex Turner
    * “[Attainable Utility Preservation: Concepts](/posts/75oMAADr4265AGK3L/attainable-utility-preservation-concepts).” 2020.
    * “[Non-Obstruction: A Simple Concept Motivating Corrigibility](/posts/Xts5wm3akbemk4pDa/non-obstruction-a-simple-concept-motivating-corrigibility).” 2020.
    * “[Corrigibility as outside view](/posts/BMj6uMuyBidrdZkiD/corrigibility-as-outside-view).” 2020.
    * “[A Certain Formalization of Corrigibility Is VNM-Incoherent](/posts/WCX3EwnWAx7eyucqH/a-certain-formalization-of-corrigibility-is-vnm-incoherent).” 2021.
    * “[Formalizing Policy-Modification Corrigibility](/posts/RAnb2A5vML95rBMyd/formalizing-policy-modification-corrigibility).” 2021.
  * Eli Tyre
    * “[Some thoughts on Agents and Corrigibility](https://musingsandroughdrafts.com/2023/12/19/some-thoughts-on-agents-and-corrigibility/).” 2023.
  * WCargo and Charbel-Raphaël
    * “[Improvement on MIRIs Corrigibility](/posts/fNwDEHWFnHMtm8yH4/improvement-on-miri-s-corrigibility).” 2023.
  * John Wentworth and David Lorell
    * “[A Shutdown Problem Proposal](/posts/PhTBDHu9PKJFmvb4p/a-shutdown-problem-proposal).” 2024.
  * John Wentworth
    * “[What's Hard About the Shutdown Problem](/posts/iJofoQX7EjMFxDo6m/what-s-hard-about-the-shutdown-problem).” 2023.
  * Eliezer Yudkowsky
    * “[Reply to Holden on ‘Tool AI’](/posts/sizjfDgCgAsuLJQmm/reply-to-holden-on-tool-ai).” 2012.
    * [Facebook Conversation with Rob Miles about terminology](https://www.facebook.com/yudkowsky/posts/10152443714699228?comment_id=10152445126604228). 2014.
    * “[Challenges to Christiano’s capability amplification proposal](/posts/S7csET9CgBtpi7sCh/challenges-to-christiano-s-capability-amplification-proposal).” 2018.
    * [LW Comment on Paul’s research agenda FAQ](/posts/Djs38EWYZG8o7JMWY/paul-s-research-agenda-faq?commentId=79jM2ecef73zupPR4). 2018.
    * “[AGI Ruin: A List of Lethalities](/posts/uMQ3cqWDPHhjtiesc/agi-ruin-a-list-of-lethalities).” 2022.
    * “[Project Lawful](https://www.projectlawful.com/posts/4582).” 2023.
  * Zhukeepa
    * “[Corrigible but misaligned: a superintelligent messiah](/posts/mSYR46GZZPMmX7q93/corrigible-but-misaligned-a-superintelligent-messiah).” 2018.
  * Logan Zoellner
    * “[Corrigibility, Much more detail than anyone wants to Read](/posts/v3jocJRScqkBGtwvf/corrigibility-much-more-detail-than-anyone-wants-to-read).” 2023.



## New to LessWrong?

[Getting Started](/about)

[FAQ](/faq)

[Library](/library)

1.

**^**

E.g. E(u(actions|values)) - E(u(actions|counterfactual values)/2). Said "fix" prevents the AI from ruining the universe, but doesn't prevent it from accumulating resources and giving them to the user.

Review

[Corrigibility4](/w/corrigibility-1)[AI2](/w/ai)[Curated](/recommendations)

# 152

# Ω 50

[Next:1\. The CAST Strategy24 comments57 karma](/s/KfCjeconYRdFbMxsy/p/3HMh7ES4ACpeDKtsW)Log in to save where you left off

Mentioned in

223[Thoughts on AI 2027](/posts/Yzcb5mQ7iq4DFfXHx/thoughts-on-ai-2027)

106[Serious Flaws in CAST](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast)

75[2\. Corrigibility Intuition](/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition)

64[4\. Existing Writing on Corrigibility](/posts/d7jSrBaLzFLvKgy32/4-existing-writing-on-corrigibility)

57[1\. The CAST Strategy](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy)

Load More (5/18)

0\. CAST: Corrigibility as Singular Target

15habryka

1Ram Potham

13[anonymous]

10Thomas Kwa

12Marcello

4Max Harms

9PeterMcCluskey

2Raemon

9Seth Herd

4Mikhail Samin

3Max Harms

3StanislavKrym

3Ram Potham

1Max Harms

3Ram Potham

1Max Harms

3Algon

3habryka

3Max Harms

6habryka

2Review Bot

2Alex_Altair

New Comment

  


Submit

22 comments, sorted by 

top scoring

Click to highlight new comments since: Today at 11:46 AM

[-][habryka](/users/habryka4)[1y](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=iSBDPhvxg2AXyt3oy)Ω615

0

Promoted to curated: I disagree with lots of stuff in this sequence, but I still found it the best case for corrigibility as a concept that I have seen so far. I in-particular liked [2\. Corrigibility Intuition](/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition) as just a giant list of examples of corrigibility, which I feel like did a better job of defining what corrigible behavior should look like than any other definitions I've seen.

I also have lots of other thoughts on the details, but I am behind on curation and it's probably not the right call for me to delay curation to write a giant response essay, though I do think it would be valuable.

Reply

1

[-][Ram Potham](/users/ram-potham)[9mo](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=zt7nLGqMqp7sdNa9b)1

0

What assumptions do you disagree with?

Reply

[-][anonymous][2y](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=zFQCcty8JmwZEjXDj)13

2

> **Note:** I’m a MIRI researcher, but this agenda is the product of my own independent research, and as such one should not assume it’s endorsed by other research staff at MIRI.

That's interesting to me. I'm curious about the views of others at MIRI on this. I'm also excited for the sequence regardless.

Reply

[-][Thomas Kwa](/users/thomas-kwa)[2y*](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=DScMwAaAStewogtwm)10

0

I am not and was not a MIRI researcher on the main agenda, but I'm [closer than 98% of LW readers](/posts/qbcuk8WwFnTZcXTd6/thomas-kwa-s-miri-research-experience), so you could read my critique of part 1 [here](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=ZG6adFJxtxWi2HbbB) if you're interested. I also will maybe reflect on other parts.

Reply

2

[-][Marcello](/users/marcello)[3mo*](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=ar5Ddj566o9dQRbkq)Ω512

0

OK. First of all, this is a cool idea.

However, if someone actually tries this I can see a particular failure mode that isn't fleshed out (maybe you do address this later in the post sequence, but I haven't read the entire sequence yet.) This particular failure mode would probably have fallen under "Identifying the Principal is Brittle" section, had you listed it, but it's subtler than the four examples you gave. It's about exactly *what* the principal agent is rather than just *who* (territory which only your fourth bullet point started venturing into). Granted, you did mention "avoiding manipulation" in the context of it becoming a bizarre notion if we tried to make principal be a developer console rather than a person, and you get points for having called it out in that section in particular as a "place where lots of additional work is needed".

Anyway, my contention is that the manipulation concept also starts ending up with increasingly ambiguous boundaries the more of an intelligence gap there is between the agent and the principal. As such, some of these failure modes may only happen when the AI is more powerful than the researchers. The particular ones I have in mind here happen when the AI's model of the principal improves enough to manipulate the principal in a weird new way.

To give an extreme motivating example, if there's a sequence of images you can show the human principle(s) to warp their preferences (like in Snow Crash), we would want the AI's concept of the principal to count such hypnosis as the victim becoming less faithful representations of the true principal™ in a regrettable way rather than as the principal having a legitimate preference to conditionally want some different thing if they're shown the images. Unfortunately, these two ways of resolving that ambiguity seem like they would produce identical behavior right up until the AI is smart enough to manipulate the principal in that way.

Put another way: I'm afraid naive attempts to build CAST systems are likely to yield an AI which subtly misidentifies exactly what computational process constitutes the principal agent, even if they could reliably point a robot arm at the physical human(s) in question. (Sure, we find the snow-crash example obvious, but supposing the agent is smart enough to see multiple arguments with differing conclusions all of which the principal would find compelling, or more broadly, smart enough to model that your principal would end up expressing divergent preferences depending on what inputs they see. Then things get weird.)

I'll go further and argue that we likely can't make a robust CAST agent that can scale to superhuman levels unless it can reliably distinguish what counts as the principal making a legitimate update versus what counts as the principal having been manipulated (that, or this whole conceptual tangle around agency/desire/etc. that I'm using to model the principal needs to be refactored somehow). False negatives mean situations where the AI can't be corrected by the principal since it no longer acknowledges the principle's authority. Any false positives become potential avenues the AI could use to get away with manipulating the principal. (If enough weird manipulation avenues exist and aren't flagged as such, I'd expect the AI to take one of them, since steering your principal into the region of the state-space where their preferences are easier to satisfy is a good strategy!)

I don't think this means CAST is doomed. It does seems intuitively like you need to solve fewer gnarly philosophy problems to make a CAST agent than a Friendly AGI, and if we can select a friendly principal maybe that's a good trade. I just think philosophically distinguishing manipulations from updates in squishy systems like human principals looks to be one of those remaining gnarly philosophy problems that we might not be able to get away with delegating to the machines, and even if we did solve it, we'd still need some pretty sophisticated interpretability tools to suss out whether the machine got it right.

Reply

1

[-][Max Harms](/users/max-harms)[3mo](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=wG7pTwhaFPSh6ercL)Ω24

0

Strong upvote! This strikes me as identifying the most philosophically murky part of the CAST plan. In the back half of this sequence I spend some time staring into the maw of manipulation, which I think is the thorniest issue for understanding corrigibility. There's a hopeful thought that empowerment is a natural opposite of manipulation, but this is likely incomplete because there are issues about which entity you're empowering, including counterfactual entities whose existence depends on the agent's actions. Very thorny. I take a swing at addressing this in my formalism, by penalizing the agent for taking actions that cause value drift from the counterfactual where the agent doesn't exist, but this is half-baked and I discuss some of the issues.

Reply

[-][PeterMcCluskey](/users/petermccluskey)[5d](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=KgazfdJu8kHBXfB6s)9

0

[Review for 2024 Review](/reviewVoting/2024)

Most people (possibly including Max?) still underestimate the importance of this sequence.

I continue to think (and [write](/posts/fe5zvFyLNtcBuuYc9/corrigibility-scales-to-value-alignment)) about this more than I think about the rest of the 2024 LW posts combined.

The most important point is that it's unsafe to mix corrigibility with other top level goals. Other valuable goals can become subgoals of corrigibility. That eliminates the likely problem of the AI having instrumental reasons to reject corrigibility.

The second best feature of the CAST sequence is its clear and thoughtful clarification of the concept of corrigibility as a single goal.

My remaining doubts about corrigibility involve the risk that it will cause excessive concentration of power. In multipolar scenarios where alignment is not too hard, I can imagine that the constitutional approach produces a better world.

I'm still uncertain how hard it is to achieve corrigibility. Drexler has an [approach where AIs have very bounded goals](https://aiprospects.substack.com/p/options-for-a-hypercapable-world), which seems to achieve corrigibility as a natural side effect. We are starting to see a few hints that the world might be heading in the direction that Drexler recommends: software is being written by teams of Claudes, each performing relatively simple tasks, rather than having one instance do everything. But there's still plenty of temptation to gives AIs less bounded goals.

See also a version of CAST published on arXiv: [Corrigibility as a Singular Target: A Vision for Inherently Reliable Foundation Models](https://arxiv.org/abs/2506.03056).

Reply

1

[-][Raemon](/users/raemon)[31m](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=ndxS9RjPRxWjQdx8S)2

0

I'd be interested in something like "Your review of [Serious Flaws in CAST](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast)."

Reply

[-][Seth Herd](/users/seth-herd)[2y](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=ZhcbNtGcnNxn2oe5i)9

0

I'm so glad to see this published!

I think by "corrigibility" here you mean: an agent whose goal is to do what their principal wants. Their goal is basically a pointer to someone else's goal. 

This is a bit counter-intuitive because no human has this goal. And because, unlike the consequentialist, state-of-the-world goals we usually discuss, this goal can and will change over time.

Despite being counter-intuitive, this all seems logically consistent to me.

The key insight here is that corrigibility is consistent and seems workable IF it's the primary goal. Corrigibility is unnatural if the agent has consequentialist goals that take precedence over being corrigible.

I've been trying to work through a similar proposal, [instruction-following or do-what-I-mean as the primary goal for AGI.](/posts/7NvKrqoQgJkZJmcuD/instruction-following-agi-is-easier-and-more-likely-than) It's different, but I think most of the strengths and weaknesses are the same relative to other alignment proposals. I'm not sure myself which is a better idea. I have been focusing on the instruction-following variant because I think it's a more likely plan, whether or not it's a good one. It seems likely to be the default alignment plan for language model agent type AGI efforts in the near future. That approach might not work, but assuming it won't seems like a huge mistake for the alignment project.

Reply

[-][Mikhail Samin](/users/mikhail-samin)[2y*](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=rvxjHmq6L4pgcLsCe)4

-3

Hey Max, great to see the sequence coming out!

My early thoughts (mostly re: the second post of the sequence):

It might be easier to get an AI to have a coherent understanding of corrigibility than of CEV. I have no idea how you can possibly make the AI to be truly optimizing for being corrigible, and not just on the surface level while its thoughts are being read. That seems maybe harder in some ways than with CEV because corrigible optimization seems like optimization processes get attracted by things that are nearby but not it, and sovereign AIs don’t have that problem, although we’ve got no idea how to do either, I think, and in general, corrigibility seems like an easier target for AI design, if not for SGD.

I’m somewhat worried about fictional evidence, even that coming from a famous decision theorist, but I think you’ve read a story with a character who understood corrigibility increasingly well, both on the intuitive sense and then some specific properties; and surface-level thought of themselves as being very corrigible and trying to correct their flaws; but once they were confident their thoughts weren’t read, with their intelligence increased, they defected, because on the deep level, their cognition wasn’t fully of a coherent corrigible agent; it was of someone who plays corrigibility and shuts down anything else, all other thoughts, because any appearance of defecting thoughts would mean punishment and impossibility of realizing the deep goals.

If we get mech interp to a point where we reverse-engineer all deep cognition of the models, I think we should just write an AI from scratch, in code (after thinking very hard about all interactions between all the components of the system), and not optimize it with gradient descent.

Reply

[-][Max Harms](/users/max-harms)[2y](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=JZa5pZKZTtsBkmw6j)3

1

I share your sense of doom around SGD! It seems to be the go-to method, there are no good guarantees about what sorts of agents it produces, and that seems really bad. Other researchers I've talked to, such as Seth Herd share your perspective, I think. I want to emphasize that none of CAST per se depends on SGD, and I think it's still the most promising target in superior architectures.  
  
That said, I disagree that corrigibility is more likely to "get attracted by things that are nearby but not it" compared to a Sovereign optimizing for something in the ballpark of CEV. I think hill-climbing methods are very naturally distracted by proxies of the real goal (e.g. eating sweet foods is a proxy of inclusive genetic fitness), but this applies equally, and is thus damning for training a CEV maximizer as well.  
  
I'm not sure one can train an already goal-stabilized AGI (such as Survival-Bot which just wants to live) into being corrigible post-hoc, since it may simply learn that behaving/thinking corrigibly is the best way to shield its thoughts from being distorted by the training process (and thus surviving). Much of my hope in SGD routes through starting with a pseudo-agent which hasn't yet settled on goals and which doesn't have the intellectual ability to be instrumentally corrigible.

Reply

[-][StanislavKrym](/users/stanislavkrym)[6d](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=5hvKhjjhpcHcr7KKk)3

0

[Review for 2024 Review](/reviewVoting/2024)

In this post and its successors Max Harms proposes a novel understanding of corrigibility as the desired property of the AIs, including an entire potential formalism usable for training the agents to be as corrigible as possible. 

The core ideas, as summarized by Harms, are the following:

Max Harms's summary

  1. **Corrigibility is the simple, underlying generator** behind obedience, conservatism, willingness to be shut down and modified, transparency, and low-impact.
     1. It is a fairly simple, universal concept that is not too hard to get a rich understanding of, at least on the intuitive level.
     2. Because of its simplicity, we should expect AIs to be able to emulate corrigible behavior fairly well with existing tech/methods, at least within familiar settings.
  2. **Aiming for CAST is a better plan than aiming for human values** (i.e. [CEV](https://intelligence.org/files/CEV.pdf)), helpfulness+harmlessness+honesty, or even a balanced collection of desiderata, including some of the things corrigibility gives rise to.
     1. If we ignore the possibility of halting the development of machines capable of seizing control of the world, we should try to build CAST AGI.
     2. **CAST is a target, rather than a technique** , and as such it’s compatible both with prosaic methods and superior architectures.
        1. Even if you suspect prosaic training is doomed, CAST should still be the obvious target once a non-doomed method is found.
  3. Despite being simple, corrigibility is poorly understood, and **we are not on track for having corrigible AGI** , even if reinforcement learning is a viable strategy.
     1. Contra Paul Christiano, we should not expect corrigibility to emerge automatically from systems trained to satisfy local human preferences.
     2. Better awareness of the subtleties and complexities of corrigibility are likely to be essential to the construction of AGI going well.
  4. **Corrigibility is nearly unique among all goals for being simultaneously useful and non-self-protective.**
     1. This property of non-self-protection means we should suspect AIs that are almost-corrigible will assist, rather than resist, being made more corrigible, thus forming **an attractor-basin around corrigibility** , such that almost-corrigible systems gradually become truly corrigible by being modified by their creators.
        1. **If this effect is strong enough** , **CAST is a pathway to safe superintelligence** via slow, careful training using adversarial examples and other known techniques to refine AIs capable of shallow approximations of corrigibility into agents that deeply seek to be corrigible at their heart.
     2. There is also reason to suspect that almost-corrigible AIs learn to be less corrigible over time due to **corrigibility being “anti-natural.”** It is unclear to me which of these forces will win out in practice.
  5. There are several reasons to expect building AGI to be catastrophic, even if we work hard to aim for CAST.
     1. Most notably, **corrigible AI is still extremely vulnerable to misuse** , and we must ensure that superintelligent AGI is only ever corrigible to wise representatives.
  6. ~~My intuitive notion of**corrigibility can be straightforwardly leveraged to build a formal, mathematical measure**.~~
     1. ~~Using this measure we can make**a better solution to the shutdown-button toy problem** than I have seen elsewhere.~~
     2. This formal measure is still lacking, and almost certainly doesn’t actually capture what I mean by “corrigibility.”
     3. **Edit: My attempted formalism**[**failed catastrophically**](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast)**.**
  7. **There is lots of opportunity for more work on corrigibility, some of which is shovel-ready** for theoreticians and engineers alike.



These claims can be tested fairly well:

  1. Unfortunately, I am not an expert in ML or agent foundations. 
  2. As far as I understand CAST, it is a way to prevent the AI from developing unendorsed values and enforcing them. 
  3. After Max Harms wrote this post, **Anthropic**[**tried to place corrigibility into Claude Opus 4.5's soul spec**](/posts/cxuzALcmucCndYv4a/daniel-kokotajlo-s-shortform?commentId=QMe7mtSQqW4zuj8Sv) , but didn't actually decide whether Claude is to be corrigible, value-aligned or to have both types of defence against misaligned goals.
  4. I **suspect** that it is useful to consider goals _similar_ to corrigibility, but with a twist. For example, [one could redefine power](/posts/n58iXSjoEvnrELuGy/are-two-potentially-simple-techniques-an-example-of-mencken#Technique_1) to be causally upstream _of the user's efforts_ and compare the performance of the user with a baseline of the AI having never given advice or of the AI giving advice to a weak model and instructing _it_ to complete the task. Then the goal of being comprehensible to the user and avoiding empowering the weak could cause the AI to establish a different future.
  5. Agreed; I think that a corrigible AI is likely to be _more_ prone to misuse than an AI aligned to values.
  6. [@Max Harms](https://www.lesswrong.com/users/max-harms?mention=user) honestly admitted that his first attempt at creating the formalism failed; while it is a warning that "formal measures should be taken lightly" (and, more narrowly, that the minus signs in expected utilities should be avoided), I expect there to be a plausible or _seemingly_ plausible[1] fix (e.g. by considering the expected utility u(actual actions|actual values) - max(u(actual actions|other values), u(no actions|other values))

The followup work that I would like to see is intense testing-like actions (e.g. like the one which I described in point 4 and tests of potential fixes like the one which I described in point 6), but I don't understand _who_ would do it.



  1. **^**

E.g. E(u(actions|values)) - E(u(actions|counterfactual values)/2). Said "fix" prevents the AI from ruining the universe, but doesn't prevent it from accumulating resources and giving them to the user.




Reply

[-][Ram Potham](/users/ram-potham)[9mo](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=ftFG4anq2xPXSC2bp)3

0

How does corrigibility relate to [recursive alignment](/posts/NecfBNGdtjM3uJqkb/recursive-alignment-with-the-principle-of-alignment)? It seems like recursive alignment is also a good attractor - is it that you believe it is less tractable?

Reply

[-][Max Harms](/users/max-harms)[9mo](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=sunKk3dCvzrZXmo8T)1

0

Alas, I'm not very familiar with Recursive Alignment. I see some similarities, such as the notion of trying to set up a stable equilibrium in value-space. But a quick peek does not make me think Recursive Alignment is on the right track. In particular, I strongly disagree with this opening bit:

> What I propose here is to reconceptualize what we mean by AI alignment. Not as alignment with a specific goal, but as alignment with the process of aligning goals with each other. An AI will be better at this process the less it identifies with any side...

What appeals to you about it?

Reply

[-][Ram Potham](/users/ram-potham)[9mo](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=qpjPQxdivesDEDKvs)3

0

I believe a recursively aligned AI model would be more aligned and safe than a corrigible model, although both would be susceptible to misuse. 

Why do you disagree with the above statement?

Reply

[-][Max Harms](/users/max-harms)[9mo](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=LjeafCWTmFSPCdwqC)1

0

My reading of the text might be wrong, but it seems like bacteria count as living beings with goals? More speculatively, possible organisms that might exist somewhere in the universe also count for the consensus? Is this right?

If so, a basic disagreement is that I don't think we should hand over the world to a "consensus" that is a rounding error away from 100% inhuman. That seems like a good way of turning the universe into ugly squiggles.

If the consensus mechanism has a notion of power, such that creatures that are disempowered have no bargaining power in the mind of the AI, then I have a different set of concerns. But I wasn't able to quickly determine how the proposed consensus mechanism actually works, which is a bad sign from my perspective.

Reply

[-][Algon](/users/algon)[2y](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=ECJTbX6XvEscRGH8S)3

0

This sounds like the sequence that I have wanted to write on corrigibility since ~2020 when I stopped working on the topic. So I am excited to see someone finally writing the thing I wish existed!

Reply

2

[-][habryka](/users/habryka4)[2y](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=9cPLwQmNoZ3ZRJMKZ)Ω33

0

Do you want to make an actual sequence for this so that the sequence navigation UI shows up at the top of the post? 

Reply

[-][Max Harms](/users/max-harms)[2y](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=rbHLR3se2DGiyEGor)Ω23

0

Ah, yeah! That'd be great. Am I capable of doing that, or do you want to handle it for me?

Reply

[-][habryka](/users/habryka4)[2y](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=gzMzAsoLrubxbPfwj)Ω46

1

You can do it. Just go to <https://www.lesswrong.com/library> and scroll down until you reach the "Community Sequences" section and press the "Create New Sequence" button.

Reply

1

[-][Review Bot](/users/review-bot)[1y](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=2hEpsB6PTXpXf5qc6)2

0

The [LessWrong Review](https://www.lesswrong.com/bestoflesswrong) runs every year to select the posts that have most stood the test of time. This post is not yet eligible for review, but will be at the end of 2025. The top fifty or so posts are featured prominently on the site throughout the year.

Hopefully, the review is better than karma at judging enduring value. If we have accurate prediction markets on the review results, maybe we can have better incentives on LessWrong today. [Will this post make the top fifty?](https://manifold.markets/LessWrong/will-0-cast-corrigibility-as-singul)

Reply

[-][Alex_Altair](/users/alex_altair)[2y](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1?commentId=bgCxfBHv3qxQDSJ5F)2

0

> 3.

3b.*?

Reply

1

[Moderation Log](/moderation)

More from [Max Harms](/users/max-harms)

106[Serious Flaws in CAST](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast)

[Ω](https://alignmentforum.org/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast)

[Max Harms](/users/max-harms)

2mo

[Ω](https://alignmentforum.org/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast)

10

235[Contra Collier on IABIED](/posts/JWH63Aed3TA2cTFMt/contra-collier-on-iabied)

[Max Harms](/users/max-harms)

4mo

51

46[AI Corrigibility Debate: Max Harms vs. Jeremy Gillen](/posts/CsXAg8dHSgghDAoPx/ai-corrigibility-debate-max-harms-vs-jeremy-gillen)

[](https://doomdebates.com/p/the-ai-corrigibility-debate-miri)

[Liron](/users/liron), [Max Harms](/users/max-harms), [Jeremy Gillen](/users/jeremy-gillen)

2mo

[](https://doomdebates.com/p/the-ai-corrigibility-debate-miri)

1

[View more](/users/max-harms)

Curated and popular this week

122[Why we are excited about confession!](/posts/k4FjAzJwvYjFbCTKn/why-we-are-excited-about-confession)

[](/recommendations)[](https://alignment.openai.com/confessions/)

[Boaz Barak](/users/boaz-barak), [Gabriel Wu](/users/gabriel-wu), [Manas Joglekar](/users/manas-joglekar)

5d

[](/recommendations)[](https://alignment.openai.com/confessions/)

27

184["The first two weeks are the hardest": my first digital declutter](/posts/eeFqTjmZ8kS7S5tpg/the-first-two-weeks-are-the-hardest-my-first-digital)

[](https://mingyuan.substack.com/p/the-first-two-weeks-are-the-hardest)

[mingyuan](/users/mingyuan)

5d

[](https://mingyuan.substack.com/p/the-first-two-weeks-are-the-hardest)

9

154[Claude's new constitution](/posts/mLvxxoNjDqDHBAo6K/claude-s-new-constitution)

[](https://www.anthropic.com/news/claude-new-constitution)

[Zac Hatfield-Dodds](/users/zac-hatfield-dodds), [Drake Thomas](/users/drake-thomas)

2d

[](https://www.anthropic.com/news/claude-new-constitution)

30

22Comments

22

x

0\. CAST: Corrigibility as Singular Target — LessWrong

PreviousNext






