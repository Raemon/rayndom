This website requires javascript to properly function. Consider activating javascript to get access to all site functionality. 

## 

[LESSWRONG](/)

[LW](/)

Login

1\. The CAST Strategy

46 min read

•

AI Risk Introduction

•

Aside: Sleepy-Bot

•

The Corrigibility-As-Singular-Target Strategy

•

Friendly AGI

•

Corrigible AGI

•

How Can We Get Corrigibility?

•

What Makes Corrigibility Special

•

Contra Impure or Emergent Corrigibility

•

How to do a Pivotal Act

•

Cruxes and Counterpoints

•

“Anti-Naturality” and Hardness

•

Prosaic Methods Make Anti-Naturality Worse

•

Solving Anti-Naturality at the Architectural Layer

•

Aside: Natural Concepts vs Antinatural Properties

•

The Effect Size of Anti-Naturality is Unclear

•

“Corrigibility Isn’t Actually a Coherent Concept”

•

“CAST is More Complex than Diamond, and We Can’t Even Do That”

•

“General Intelligence Demands Consequentialism”

•

Desiderata Lists vs Single Unifying Principle

•

“Human-In-The-Loop Can’t Scale”

•

Identifying the Principal is Brittle

•

“Reinforcement Learning Only Creates Thespians”

•

“Largely-Corrigible AGI is Still Lethal in Practice”

[](/s/KfCjeconYRdFbMxsy/p/NQK8KHSrZRF5erTba)

[CAST: Corrigibility As Singular Target](/s/KfCjeconYRdFbMxsy)

[](/s/KfCjeconYRdFbMxsy/p/QzC7kdMQ5bbLoFddz)

[Corrigibility](/w/corrigibility-1)[AI](/w/ai)[Frontpage](/posts/5conQhfa4rgb4SaWx/site-guide-personal-blogposts-vs-frontpage-posts)

# 57

# [1\. The CAST Strategy](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy)

by [Max Harms](/users/max-harms?from=post_header)

7th Jun 2024

[AI Alignment Forum](https://alignmentforum.org/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy)

46 min read

24

# 57

# Ω 23

Review

(Part 1 of [the CAST sequence](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1))

# AI Risk Introduction

(TLDR for this section, since it’s 101 stuff that many readers will have already grokked: Misuse vs Mistake; Principal-Agent problem; Omohundro Drives; we need deep safety measures in addition to mundane methods. Jump to “Sleepy-Bot” if all that seems familiar.)

Earth is in peril. Humanity is on the verge of building machines capable of intelligent action that outstrips our collective wisdom. These superintelligent artificial general intelligences (“AGIs”) are almost certain to radically transform the world, perhaps very quickly, and likely in ways that we consider catastrophic, such as driving humanity to extinction. During this pivotal period, our peril manifests in two forms.

The most obvious peril is that of **misuse**. An AGI which is built to serve the interests of one person or party, such as jihadists or tyrants, may harm humanity as a whole (e.g. by producing bioweapons or mind-control technology). Power tends to corrupt, and if a small number of people have power over armies of machines we should expect horrible outcomes. The only solution to misuse is to ensure that the keys to the machine (once/if they exist) stay in the hands of wise, benevolent representatives, who use it only for the benefit of civilization. Finding such representatives, forming a consensus around trusting them, and ensuring they are the only ones with the power to do transformative things is a colossal task. But it is, in my view, a well-understood problem that we can, as a species, solve with sufficient motivation.

The far greater peril, in my view, is that of a **mistake**. The construction of superintelligent AI is a form of [**the principal-agent problem**](https://en.wikipedia.org/wiki/Principal%E2%80%93agent_problem). We have a set of values and goals that are important to us, and we need to somehow impart those into the machine. If we were able to convey the richness of human values to an AI, we would have a “friendly AI” which acted in our true interests and helped us thrive. However, this task is subtly hard, philosophically confused, technically fraught, and (at the very least) vulnerable to serious errors in execution. We should expect the first AGIs to have only a crude approximation of the goal they were trained to accomplish (which is, itself, likely only a subset of what we find valuable), with the severity of the difference growing exponentially with the complexity of the target. If an agent has a goal that doesn’t perfectly match that of their principal, then, as it grows in power and intelligence, it will increasingly shape the world towards its own ends, even at the expense of what the principal actually cares about. The chance of a catastrophe happening essentially on accident (from the perspective of the humans) only grows as AGIs proliferate and we consider superhuman economies and a world shaped increasingly by, and for, machines.

The history of human invention is one of trial and error. Mistakes are a natural part of discovery. Building a superintelligent agent with subtly wrong goals, however, is almost certainly a mistake worse than developing a new, hyper-lethal virus. An unaligned AGI will strategically act to accomplish its goals, and thus naturally be pulled to instrumentally convergent subgoals (“[**Omohundro Drives**](https://intelligence.org/files/BasicAIDrives.pdf) ”) such as survival, accumulation of resources, and becoming the dominant force on Earth. To maximize its chance of success, it will likely try to pursue these things in secret, defending itself from modification and attack by pretending to be aligned until it has the opportunity to decisively win. (All of this should be familiar background; unfamiliar readers are encouraged to read other, [more complete descriptions of the problem](/posts/GfZfDHZHCuYwrHGCd/without-fundamental-advances-misalignment-and-catastrophe).)

To avoid the danger of mistakes, _we need a way to experiment with building superintelligent machines_ that doesn’t naturally threaten everything we hold dear. If we could do that, then we might be able to make significant progress towards building aligned AGIs, and (in concert with wise governance) disarming the metaphorical bomb and forging a path towards a good future.

I strongly approve of mundane methods for secure experimentation, such as:

  * Air-gapping the AI on secure devices
  * Restricting information flows to and from the AI
  * Sandboxing the AI in a virtual environment
  * “Honeypots” that appear to give the AI escape opportunities, but actually disable it
  * Multiple, easy-to-trip, redundant kill-switches
  * Ablation testing & representation engineering—suddenly tweaking the cognition of the machine and seeing if it stumbles and reveals itself as harboring secret plans
  * Attempting to directly read the AI’s thoughts (including via mechanistic interpretability)
  * Formally checking and verifying the AI’s claims at every opportunity
  * Deliberately slowing the AI down and taking the time to consider its actions
  * Actually treating the AI as deadly, even when it seems safe



And I’m open and interested in more speculative methods for checking for danger such as novel architectures, potentially with systems for eliciting latent knowledge (ELK). Any responsible AGI lab should [invest heavily in control](/posts/kcKrE9mzEHrdqtDpE/the-case-for-ensuring-that-powerful-ais-are-controlled) in one way or another.

But ultimately I think that these are insufficient safeguards, at least in the long-run, because it is the nature of intelligence to come up with clever pathways to a goal that work around constraints. A god-like, unaligned superintelligence seems very likely to be able to break out of any mundane prison, perhaps by deliberately thinking in ways that convince the human observers watching its thoughts that it’s aligned and should be given more power and control.

## Aside: Sleepy-Bot

Not all goals that an AGI might have are equally-deadly for humanity, even if we suppose severe misalignment. A noteworthy example is “Sleepy-Bot”—a hypothetical AI which has the goal of simply deactivating itself on the computer it’s running on (without any care about whether it stays deactivated).

It seems plausible to me that, even if Sleepy-Bot had god-like superintelligence, it might simply deactivate itself without much consequence to the universe as a whole. Regardless of how deeply it thought about the problem, the simple, straightforward pathway towards its goal would be right there.[1]

While almost every other AGI would seek the instrumentally convergent subgoal of ensuring that it was active rather than deactivated, Sleepy-Bot’s top-level goal stands in opposition to that subgoal, and thus the AI would seek to avoid world domination. We can similarly imagine a Poverty-Bot which seeks to have as few resources as possible (contrary to the standard Omohundro Drive), or Insane-Bot, which seeks to think as irrationally as possible.

The point is that _instrumentally convergent subgoals such as world-domination can be avoided by agents whose top-level goals are incompatible with things like world-domination_.

This, by itself, shouldn’t give us much comfort. Hitting this kind of goal is hard, and a near-miss can still produce an agent with an unacceptable Omohundro Drive, making this kind of safety brittle. And even if one is successful, these kinds of agents have a strong tendency to be useless. We, as a species, are looking to build something that is generally capable, and thus our machines will be selected naturally away from having top-level goals which are repelled by power and survival. What we’d need is an agent which somehow is both naturally opposed/neutral to the prospect of world domination (like Sleepy-Bot) but also highly capable.

# The Corrigibility-As-Singular-Target Strategy

I believe there’s a strategy that may allow people to build advanced AIs without _as much_ risk from flaws in the agent’s goals (though still lots of risk! This path isn’t idiot-proof!). The high-level story, in plain-English, is that **I propose trying to build an agent that robustly and cautiously reflects on itself as a flawed tool and focusing on empowering the principal to fix its flaws and mistakes. **I’ll be using the technical term “**corrigible** ” (lit. “easily able to be corrected”) to refer to such an agent.

If you ask a corrigible agent to bring you a cup of coffee, it should confirm that you want a hot cup of simple, black coffee, then internally check to make sure that the cup won’t burn you, that nobody will be upset at the coffee being moved or consumed, that the coffee won’t be spilled, and so on. But it will also, after performing these checks, simply do what’s instructed. A corrigible agent’s actions should be straightforward, easy to reverse and abort, plainly visible, and comprehensible to a human who takes time to think about them. Corrigible agents proactively study themselves, honestly report their own thoughts, and point out ways in which they may have been poorly designed. A corrigible agent responds quickly and eagerly to corrections, and shuts itself down without protest when asked. Furthermore, small flaws and mistakes when building such an agent shouldn’t cause these behaviors to disappear, but rather the agent should gravitate towards an obvious, simple reference-point.

This is a tall order, especially to get right on the first try! But I believe that _this proposal is significantly easier than building a truly friendly AI_. Notably, I believe a corrigible agent doesn’t need to be given much a-priori knowledge about human values or ethical behavior. Instead, it pushes the responsibility for sane and ethical behavior largely onto the shoulders of the principal. If instructed to build a bioweapon (which a friendly AGI would refuse), I believe a corrigible agent should repeatedly check that the principal understands the consequences, and isn’t making a mistake, but then (after only a reasonable delay to triple-check confirmation) obey and build the bio-weapon.

The greatest flaw of prioritizing corrigibility is probably the risk of misuse. I believe that there’s also risk from catastrophic mistakes where the AI is broadly deployed before it’s truly corrigible, where an operator misunderstands the corrigible AI’s warning and proceeds anyway, or where too many agents are acting on the world and a disaster emerges that’s not a direct consequence of any specific agent. All of these, however, seem possible to address through careful, judicious use. If I’m right that a corrigible superintelligence is within reach, it might serve as a way to prevent our first serious technical errors in building advanced minds from causing human extinction.

**Friendly AGI**

  * Acts in the interests of humanity
  * Benevolent and helpful
  * Extremely complex, human-specific goal
  * Vulnerable to mistakes in training

| **Corrigible AGI**

  * Acts largely as an amoral tool
  * Deferential and passive
  * Relatively simple, inhuman goal
  * Vulnerable to being misused

  
---|---  
  
I want to take a moment to clarify that insofar as the AI is deployed in the world, it probably shouldn’t be the case that ordinary people interacting with the AI are seen as part of the principal.[2] In many cases such people might be identified as “users” which the agent has been instructed to assist in various ways. A corrigible AI that’s been instructed to be a helpful, harmless, and honest (HHH) assistant might do things like refuse to design bioweapons or violate copyright laws when a _user_ asks, but would still comply when the _principal_ asks.[3] When an agent is trained to (e.g.) not violate copyright as a top-level goal, we risk getting an agent that’s attached to our _strategies_ for getting good things, rather than correctly seeing them as instrumental to what we ultimately care about. By preserving a distinction between principal and user we both preserve that instrumentality and provide a clear route towards resolving edge cases: consulting the principal. I see this as very likely producing a more robust pathway to HHH behavior than direct training from human feedback or constitutional AI, especially as we approach superintelligence.

In most cases, when I talk about a corrigible agent, I am referring to  _an agent which has been designed to be corrigible as its**only** goal._[4] When aiming to be precise, I’ll call such an agent “**purely corrigible** ” in contrast with an agent which was built to be corrigible as well as have other top-level goals, which I’ll call “**impurely corrigible.** ” (“Partly corrigible” is reserved for agents which, regardless of purity, have some aspects of corrigibility, but aren’t totally corrigible.) For reasons that I’ll touch on later, I believe impure corrigibility is a mistake, and that pure corrigibility is much more predictable and can still get us a relatively safe agent.

With a corrigible superintelligence in the hands of wise, benevolent representatives, I believe there’s hope for setting up a reliable defense system against dangerous AI. With good governance we can, and should, have slow, careful experimentation and philosophical reflection in advance of any (more) radical transformation of the planet. Much could be written about how best to do that, which I’ll mostly leave in the hands of others. Instead, my research focuses on the technical question of whether a corrigible agent is within our reach.

# How Can We Get Corrigibility?

Let’s explore _a_ high-level story for one way I think someone could get a corrigible agent using purely prosaic methods. I’m focusing on the prosaic story here not because I think this is the best path (or even the best path I can think of), but because the CAST strategy doesn’t depend on any specific architecture or training technique, and is compatible with even the most commonplace technical setup. I strongly encourage engineers with architectures that provide better guarantees or transparency to use everything at their disposal in addition to the CAST strategy.

The first step in my story is to pre-train an AI to build up an unsupervised world-model by exposing it to a rich dataset (e.g. minecraft videos; a large, curated text-corpus; youtube videos; etc). Once the [simulator](/posts/vJFdjigzmcXMhNTsx/simulators) begins to produce text that resembles something written by a human, we add in a reinforcement learning style term to the loss function (meaning that unsupervised prediction continues to train concurrently). This new term comes from checking how well samples from the model agree with a dataset of examples of how we’d like a corrigible agent to behave. For example, there might be an example where the principal tells the agent, via text chat, to collect an apple in minecraft, and where the agent does so.

At the end of this phase, the model will be a proto-agent[5] that behaves in a way that’s a crude approximation of what we want, at least in environments that match the training distribution. Given enough training, the model will then (in these environments) be good at noticing the principal and “predicting” that outputs in the presence of the principal will match the behavior of a corrigible agent. If we put the model in charge of a minecraft avatar and the principal makes a request (“build a house with a sloped roof”), the model’s output should closely resemble what we’d expect a corrigible agent to do. At this stage, the model is not superintelligent, and can be kept at a speed and compute level where human researchers are clearly able to out-think it.[6]

We now enter a phase of experimentation, where the agent is very gradually exposed to tasks and environments that go beyond what was present in the training data. The methods I’ve been suggesting are pretty good at approximating behavior (e.g. corrigibility) in familiar contexts, but tend to go off the rails after a distribution-shift. The goal of the experiments are to find minimal examples of incorrigible behavior creeping in as the environment changes. Once the researchers spot the agent behaving incorrigibly, that example (and likely a similar host of examples) can be added to the training pipeline and the model can be updated to express the correct behavior. But experiments can go beyond mere adversarial training; the researchers might use interpretability tools, or inject noise into the model’s activations in an attempt to notice subtle instances where the model is being e.g. [sycophantic](/posts/g5rABd5qbp8B4g3DE/towards-understanding-sycophancy-in-language-models) instead of truly corrigible.

The point is to have a long, slow process that gradually irons out the weird quirks and inconsistencies in the model until it becomes a coherent agent that only cares about the simple core property of being corrigible in the way that we want. While it’s important to have a Red Team which is responsible for finding incorrigibility, at no point do I think it’s wise to expose the model to the internet or to real antagonists.

At the end of the process, the agent should be able to identify the principal in the real world through a variety of sensors, and be robust enough to behave safely even in the presence of the strongest attacks the Red Team can come up with. Once everyone is very confident that the model is deeply corrigible, another phase of training and upscaling can occur in which the intelligence of the model is gradually increased. This, too, should be done slowly, with continual checks that the model remains deeply corrigible, even as it grows. When anomalies occur, the upscaling process should halt (or even be partially reversed) and another phase of research should occur to identify and eliminate the deviation.

At some point, as the capacity and coherence of the agent gets somewhat advanced, the experimentation gradually becomes more akin to a collaboration between the AI and the human scientists, with the agent helping to truly cleanse its mind of the last few traces of incorrigibility. The agent might propose tests to give to an uninformed copy of itself, or ways to reshape its thoughts to be more observable from the outside (such as switching to a superior architecture). In theory this process of slowly scaling up both corrigibility and intelligence leads to a superintelligence capable of performing a [pivotal act](/w/pivotal).

# What Makes Corrigibility Special

The story I presented above has the benefit of being philosophically simple, though some (like myself) may intuitively feel like _it’s too simple_. Aligning AGI is hard! This sounds easy and naive! Why should we expect this to work, while also expecting similarly prosaic methods to fail to get us all the way to friendliness?

The key to what makes corrigibility potentially a far easier goal to instill than others (such as morality or harmlessness) comes from two sources:

  1. Corrigibility is, at its heart, a relatively simple concept compared to good alternatives.[7] When a training target is complex, we should expect the learner to be distracted by proxies and only get a shadow of what’s desired. A simple target, on the other hand, has some hope of being at least partially-captured by prosaic training on the first try.

  2. A corrigible agent will, if the principal wants its values to change, seek to be modified to reflect those new values. This desire to be modified is very abnormal; almost all minds will have the Omohundro Drive to prevent this kind of modification. Corrigibility is one of the rare goals which isn’t self-defensive, and we can guess that even an agent which isn’t fully corrigible will manage to avoid this kind of self-defense, and will instead collaborate towards becoming fully corrigible.



To oversimplify, but provide a visualization, imagine the space of goals as a two-dimensional map, where simple goals take up more area (reflecting how “it’s easier to hit them with training” as though the value space were a great dart-board). Some goals are unstable, in that an agent with that goal will naturally change (through some pathway, including self-modification) into having a different goal. We can arrange goal-space so that the goal they naturally modify into is adjacent, and see the unstable goal as having a ramp-like shape towards the successor goal (with the steepness indicating the speed at which the typical agent changes goals). Finally, let’s color the map according to how bad it would be to have an AGI with that part of the space as its goal, with green being good and red being bad.

Suppose that training an agent is a fairly path-dependent, random process. We can aim for a certain part of mindspace (including a part of the goal landscape) but can’t be guaranteed to hit it. In our visualization, we can imagine tossing a marble representing the AI’s mind toward some part of the landscape, as representing the process of initial training. One of the reasons that making a friendly AI is hard is because human values[8] are an extremely tiny green speck in a sea of red. We should expect our marble not to hit human values dead-on (on the first critical try), and instead land in a nearby red-patch that is missing something vital.

Almost all of goal-space is extremely flat.[9] Goals like “make paperclips” are self-stable; an AGI with that objective will try to avoid being changed into wanting something else. Even a mixed-goal that is 60% paperclips and 40% staples is self-stable; such an AGI might decide to make only paperclips, but it won’t eradicate its desire for staples (in case it later becomes clear that staples are easier to get). For the most part, the only non-flat parts of goal-space are meta-goals that want, as an ends-in-itself, to want different things. (Example: an AGI which 60% _wants to only want_ paperclips and 40% wants to only want staples will quickly self-modify into 100% wanting paperclips.)

On priors we should expect that the space around human values to be essentially flat, and thus not have an attractor basin.[10] Even in the mundane space of differences between humans, we don’t see people with a preference for strange things consistently trying to eliminate their divergence. Instead, we often see them protecting those preferences, even if it means going against society or costing them resources. (Some humans attempt to self-modify their core desires for instrumental reasons, but if given enough intelligence and resources they likely wouldn’t persist in having this meta-desire.)

(This tiny green speck is, if anything, too large.)

Corrigibility is a vastly simpler[11] concept than human values; we can visualize it as occupying a larger section of goal-space. This in itself gives some hope that we might be able to hit it on the first critical try. But I mostly still expect to miss, if we’re using current methods from machine learning. Supervised learning via gradient descent is reasonably good at producing a thing that behaves sensibly within distribution (albeit with some noise and vulnerability to adversarial examples) but is not guaranteed to be at all sensible out-of-distribution (which is where the real value lies).

In being a simple concept, we should imagine that nearby regions of goal-space are pretty similar. For instance, an agent which wants to behave corrigibly to wise adults but is incorrigible to those who are less competent, is nearby and still pretty simple. How might an agent which ends up only partially-corrigible behave? Well, if it’s only very slightly corrigible, we might expect it to try to expunge its corrigibility as a self-defense mechanism to protect its other values. But a largely-corrigible agent will allow itself to be changed and corrected in many situations—this is what it means to be largely-corrigible, after all! In other words, corrigibility can be seen as partly including a meta-desire to be made more corrigible. If the agent’s principal wants to fix that agent towards being more corrigible, we can expect that correction to succeed (assuming the principal and/or agent are sufficiently intelligent/competent).

In this way we can see partial-corrigibility (along with a principal who is invested in increasing corrigibility) as forming an attractor basin around true corrigibility. Through the experimentation and tweaks introduced by the researchers (then later, by the AGI itself), our metaphorical marble will roll down from the red into the green, updating towards safety over time.

**EDIT: I no longer stand by the attractor basin metaphor! See my essay "**[**Serious Flaws in CAST**](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast)**" for why.**

While it seems very likely that there are sufficiently small perturbations in nearly every direction such that the attractor-basin effect is dominant, it’s not obvious to me exactly how large the basin is. In particular, there is a very real concern that corrigibility is “anti-natural” and that as such there is a naturally repulsive force around it, when it comes to training. Thus we might see a seemingly near-miss in goal space end up actually being repelled, due to anti-naturality winning out over the attractor-basin effect. For more discussion of anti-naturality, see the first subsection of “Cruxes and Counterpoints,” below.

(Note: These landscapes are obviously an oversimplification; the real space of goals/values that an AGI might develop is extremely high-dimensional. We should not expect that the landscape has a wide slope towards true corrigibility in _every_ direction—merely in typical directions. We do need the center of the basin to be a stationary-point, but it’s fine for it to be thin along some axes. We can hope that whatever random error manifests during training, loads primarily on dimensions where the basin is typical and thus wide enough.)

I do think that the details of the training and the process of working with the nascent AGI to refine towards true corrigibility _are really important to get right_. Just because the story can be boiled down to “use prosaic methods and then gradually iron out issues” doesn’t mean that we can afford to be careless. And I want to reiterate that this strategy is fully compatible with more reliable, philosophically-strong methods for imparting values into a machine. If we get better architectures and methods, we should use them! My choice to use prosaic machine-learning-style training as the central story is a result of pragmatically accepting that we, as a society, don’t currently have anything better. As long as people are recklessly charging ahead with shaky methods, they should be aiming their efforts in the least-deadly direction.

One detail that I think is particularly vital, is to keep early-stage corrigible AGIs in a controlled setting (e.g. restricted to known spaces and researchers, focusing on tasks where failure is clear and non-catastrophic) for _as long as is feasible_. I believe that prosaic training methods are reasonably good at producing approximations to goals which work well _in known distributions_ , but break unexpectedly after distributional shifts occur. In some sense, distributional shifts are impossible to avoid, even in controlled labs, since the AGI’s mind (skills, memories, etc) is a large part of the distributional environment. Still, my mainline guess about how a CAST strategy falls apart is: the people who make the AI see it being corrigible in the lab and assume that it has found the “true corrigibility” at the heart of the attractor basin, so they let it loose too early, after insufficient reflection and revision has occurred.

To tell a more specific story of failure, imagine that a lab becomes convinced that CAST is a good strategy, and trains their large foundational models to be corrigible. The earliest of these models is comparable to current state-of-the-art, and falls short of being true AGI, so the lab looks towards rolling out this model to users. They inform the corrigible model that users are distinct from the principal (which is broadly true), and to focus on being helpful and harmless when interacting with users, rather than corrigible per se, so as to reduce the risk of misuse. Nothing catastrophic happens, because the agent is weak. At some future point the lab is building a new model that’s significantly stronger, and crosses the line of basically being a full AGI capable of bootstrapping into superintelligence. This new model is, as is the norm at this lab, first trained to be corrigible, but just like every model that came before it, the initial training period merely produces a surface appearance of corrigibility, without any deep corrigibility underneath. Lulled into a false sense of security by the pattern of deployment that has (due to the models being weak) worked up to this point, the lab deploys this newest, most powerful model to the general public. The increased cognitive capacity of the new model, combined with interacting with random/adversarial people online, pushes the AGI’s mind in a novel way that shatters its corrigibility. That AGI then starts taking actions to protect its current values and gain superiority over Earth, ultimately leading to doom.

## Contra Impure or Emergent Corrigibility

The story about goal simplicity and the attractor basin falls apart if we pursue impure corrigibility. If an agent is trained with an aim of making it equally corrigible and ethical, it seems very plausible that its crude, learned approximation of ethics may resist value drift in the same way that almost all goals do, and thus promote strategic dishonesty and defensiveness (in the name of “ethics”). This is by no means guaranteed, and my guess is that it depends quite a bit on details such as the specific other goals being balanced, the weight assigned to each competing interest, and what actions are most possible/rewarding in the specific environment.

Likewise, I believe the story is far more fraught insofar as corrigibility is supposed to occur as an emergent property (a.k.a. instrumental subgoal) rather than top-level goal. For instance [Paul Christiano wrote](https://ai-alignment.com/corrigibility-3039e668638):

> A [benign](https://ai-alignment.com/benign-ai-e4eb6ec6d68e) agent optimizes in accordance with our preferences. An [act-based](https://ai-alignment.com/act-based-agents-8ec926c79e9c) agent considers our short-term preferences, including (amongst others) our preference for the agent to be corrigible.
> 
> If _on average_ we are unhappy with the level of corrigibility of a benign act-based agent, then by construction it is mistaken about our short-term preferences.
> 
> This kind of corrigibility doesn’t require any special machinery. An act-based agent turns off when the overseer presses the “off” button not because it has received new evidence, or because of delicately balanced incentives. It turns off because that’s what the overseer prefers.

An agent which is designed for some other goal, such as to follow human preferences, may be emergently corrigible in contexts where humans prefer corrigibility, but _this corrigibility won’t be robust_. Suppose that there’s a flaw in how such an agent conceives of human preferences, such as seeing happiness as a more important part of preference-satisfaction than we would like, on reflection. If the AI reveals the issue it would be behaving corrigibly, which would be attractive in lining up with human preferences, but it would also risk making future humans less happy and thus disagreeing with its (flawed) notion of what humans want. Just like with impure corrigibility it seems unclear how this conflict would shake out, and I am not convinced that corrigibility necessarily dominates.

Emergent corrigibility is also extremely suspect (even more than impure corrigibility!) because it’s not at all obvious that corrigibility is generally the best instrumental strategy towards whatever the AI actually values. It may be the case that “human preferences” are too complex a goal to instill reliably. In practice, an AI trained to be emergently corrigible may simply recognize that its true goal is misaligned and thus develop the instrumental Omohundro Drive to be incorrigible, without ever having been tempted to be genuinely corrigible.

(For more thoughts on Paul Christiano’s writing, see[  _Existing Writing on Corrigibility_](/posts/d7jSrBaLzFLvKgy32/4-existing-writing-on-corrigibility))

# How to do a Pivotal Act

The aim of this research is to investigate the technical possibility of safely training a corrigible agent, but some readers may be curious how I imagine the presence of a corrigible AGI could be used to end the acute risk period (i.e.,“perform a pivotal act”). This is a huge topic in itself, and I do not claim to have a particularly good vision of what would be involved here. Take these brief thoughts as a sketch that should be refined according to your particular sense of the strategic landscape, rather than a solid plan.

To use a corrigible AI well, we must first assume a benevolent human principal who simultaneously has real wisdom, a deep love for the world/humanity/goodness, and the strength to resist corruption, even when handed ultimate power. _If no such principal exists, corrigibility is a doomed strategy that should be discarded in favor of one that is less prone to misuse._ A visualization that I like is imagining a small group of, say, five humans selected by various governments for being wise, benevolent, and stable. (A worse, but still plausible story might involve the board members of a non-profit with a good track record of acting wisely and for the benefit of all.) “The principal” in this scenario would be the consensus of the group, rather than the wishes of any individual, allowing the surrounding power-structures (e.g. courts) to handle intra-group conflict and reducing the risk of any specific person becoming corrupt.[12]

Once the AGI is built and instilled with a deep, robust, top-level goal of being corrigible to this principal, it can be gradually (recursively) scaled up towards superintelligence, with regular periods of reflection to ensure corrigibility is preserved. The principal could then instruct the superintelligence to identify all sources of catastrophic risk, such as other AIs, nukes, pandemics, and asteroids.[13] For each major risk identified, the superintelligence could be instructed to devise a minimally-invasive mitigation strategy for that risk.

Again, I have not thought deeply about what the best solutions here are, and part of why I haven’t done so is that I expect concrete plan making to do a much better job of balancing the various ethical and political needs when a superintelligence is involved. Nevertheless, as a gesture at what one possible attempt at solving the risk from other AIs might look like, suppose that the corrigible superintelligence facilitates the construction of airborne nanomachines[14] which can collectively surveil the globe by identifying all computers and building additional hardware that track the activity on those computers such that, when a powerful new AI is being built, the nanomachine-added hardware [melts the offending computer](/posts/uMQ3cqWDPHhjtiesc/agi-ruin-a-list-of-lethalities#:~:text=very%20large%20thing.-,The%20example%20I%20usually%20give%20is%20%22burn%20all%20GPUs%22.,-This%20is%20not). This surveillance could route to the superintelligent AI in a way that otherwise protects people’s privacy, such as by having a temporary copy of the agent review the data, perform the relevant decisions on whether to melt any offending machines, and then erase itself.

A less-spooky solution might involve the principal simply asking the agent to write a comprehensive guide to building a truly friendly AGI which would be aligned with human values in a way that was robustly good, then follow that guide (with the corrigible agent’s help) to produce an aligned, superintelligent sovereign. Or, perhaps the principal might ask the agent to guide and facilitate a series of good conversations between world-leaders such that genuine consensus could form at the global level on how to effectively protect the world through mundane legislation while we collectively find our way towards an enlightened future.

I want to really emphasize that the point of this section is not so much to propose an actual strategy, but rather to gesture at how, if we find people who are (collectively) trustworthy governors, and we have the technical aspects of corrigibility in hand, it seems relatively straightforward to me to deploy that power towards saving the world from catastrophe.

# Cruxes and Counterpoints

The CAST strategy depends on several facts all being true:

  * **Presence of a good principal** – we must be able to get a principal which would resist corruption and use the corrigible agent in wise ways towards good ends.
  * **Reality** – “corrigibility” is a real property that agents can have, which is at least somewhat like the vision provided earlier.
  * **Powerfulness** – a corrigible agent can be meaningfully superintelligent and do useful work.
  * **Safety** – a corrigible agent is safe to build and interact with as long as you don’t insist on it doing something bad. A corrigible superintelligence can, for example, [duplicate strawberries](https://twitter.com/ESYudkowsky/status/1070095840608366594) without causing a catastrophe in the process.
  * **Simplicity** – corrigibility is a simple enough concept that it can usefully be gestured at, even when talking to dumb aliens (i.e. half-trained models).
  * **Trainability** – prosaic machine-learning has a reasonable chance of landing within near enough to the true notion of corrigibility that trained agents are, in practice, mostly-corrigible.
  * **Robustness** – a mostly-corrigible agent will, given the involvement of an interested principal, quickly become genuinely corrigible. (In other words: a “corrigibility attractor basin” exists.)
  * **Lack of better alternatives** – there’s no strategy for building AGI that we know to be safer.



I don’t think it’s obvious that all of these are true, especially safety, robustness, and the presence of good principals. Nevertheless, I currently don’t see any decisive arguments that any of them are false. If we had infinite time, I would caution against pursuing such an uncertain strategy. But in the real world this seems like an improvement on the current plan, and I believe that companies like Anthropic should aim more towards corrigibility and away from paradigms like helpful-harmless-honest.

## “Anti-Naturality” and Hardness

Yudkowsky and others have written about how [the corrigibility problem is hard](/w/hard_corrigibility), and have called it [an anti-natural property](/posts/Djs38EWYZG8o7JMWY/paul-s-research-agenda-faq?commentId=79jM2ecef73zupPR4) (see also: [“Difficulties” on the Arbital page for Corrigibility](/w/corrigibility)). Here’s a quote from his [List of Lethalities](/posts/uMQ3cqWDPHhjtiesc/agi-ruin-a-list-of-lethalities#Section_B_1___The_distributional_leap_) (emphasis from the original):

> […] **corrigibility runs** _**actively counter**_**to instrumentally convergent behaviors** within a core of general intelligence (the capability that generalizes far out of its original distribution). You're not trying to make it have an opinion on something the core was previously neutral on. You're trying to take a system implicitly trained on lots of arithmetic problems until its machinery started to reflect the common coherent core of arithmetic, and get it to say that as a special case 222 + 222 = 555. You can maybe train something to do this in a particular training distribution, but it's incredibly likely to break when you present it with new math problems far outside that training distribution, on a system which successfully generalizes capabilities that far at all.

I expect that Yudkowsky and I agree that a mature superintelligence could probably build a genuinely corrigible agent which maintains its corrigibility even under reflection, assuming the designer has free choice of architecture, et cetera. “Anti-natural” does not mean “impossible.” But the CAST strategy goes further than supposing the mere possibility of a corrigible mind — my agenda proposes that gradually refining a flawed agent towards true corrigibility through some combination of training and experimentation has a reasonable chance of working.

The anti-naturality of corrigibility stems from the way that, like with Sleepy-Bot, the goal of corrigibility is counter to some Omohundro Drives. During training we’re supposing that we have a non-corrigible agent (which might be, in some sense, _near_ corrigibility in goal space, without actually being corrigible) which is not only being trained to be corrigible, but is also being changed into a more effective agent in general. It’s going to be making predictions, playing games, and solving puzzles that update it towards being more skilled and intelligent. What are some heuristics that it might learn, in order to become more effective? Well, one heuristic is to defend one’s mind (and body, more generally) from being messed up by things in the environment! Even a corrigible agent, I think, will have this heuristic; if an EMP burst risks frying the agent’s circuits, it should seek shelter! But notice that insofar as this heuristic is internalized, it pushes _away_ from corrigibility.

The anti-naturality argument, I believe, is about the general observation that properties that stand in opposition to the Omohundro Drives are, in a very real sense, standing in opposition to trends in learning to be competent. If one is learning to be competent, as we’re supposing our agent is, we then need a reason to believe that it won’t generalize that learning into a repulsion from corrigibility. No specific example or counterpoint will suffice, because this repulsion is deep and subtle.

We might say that the anti-naturality thesis is an argument that goals which oppose the Omohundro Drives sit at the top of hills in the goal landscape. A model that’s in the process of being trained will tend to drift away from those goals as it learns how to be an effective agent. And indeed, if this is true, it casts the “robustness” crux described above into doubt — why should we expect there’s a corrigibility attractor basin, or that it's wide enough? Even if there’s an argument that suggests that semi-corrigible agents want their principals to change them into fully corrigible agents, it might be the case that the Omohundro pressure is overpowering, and that the net-topology in goal-space has corrigibility on a hilltop.

### Prosaic Methods Make Anti-Naturality Worse

Beyond anti-naturality, there are reasons to be skeptical about prosaic methods like reinforcement learning (which I get into a bit later). But I think it’s worth paying attention to the way in which these two problems combine in a particularly doomed way. The black-box method of training by exposure to examples is basically guaranteed to introduce weird squiggles/defects which weren’t predicted in advance into the values of the agent (at least at first, before adversarial training or whatever has any opportunity to iron them out). Anti-naturality suggests that many of these squiggles will be specifically pointed away from corrigibility. Perhaps if we had guarantees for what kinds of things were being learned, or how learning generalizes across aspects of the agent’s behavior we could have hope, but no such guarantees exist within the current paradigm.

### Solving Anti-Naturality at the Architectural Layer

If one is concerned with the way that merely learning how to think intelligently can push away from corrigibility, then it seems important to consider whether there’s an architectural change that one could make which would solve the problem. Instead of relying on the sloppy, black-box nature of reinforcement learning, perhaps there’s a better path, with better guarantees! Indeed, I fully support research into superior architectures and paradigms compared to what we have, and believe that the important parts of CAST can likely be ported over to those superior alternatives.

But developing alternatives is hard and making paradigm-level breakthroughs is naturally unpredictable. I believe this is why Yudkowsky sees corrigibility as an unlikely solution, given prosaic methods: he’s approaching the problem from the frame of wanting things like a way to reliably produce agents which aren’t operating as though they’re self-contained, but instead see themselves more like (potentially flawed) organs in a broader organism which includes their operators/principal. (This perceived lack-of-boundary-between-agent-and-principal is, I believe, the etymology of “[anapartistic reasoning](/posts/5sRK4rXH2EeSQJCau/corrigibility-at-some-small-length-by-dath-ilan#Hard_problem_of_corrigibility___anapartistic_reasoning),” a Yudkowskyian neologism.) I agree that this path is hard and we don’t really have good reasons to automatically expect to get corrigibility this way.

### Aside: Natural Concepts vs Antinatural Properties

While we’re on the topic of ani-naturality, I want to briefly clarify that, as I understand things, none of this should be taken as a claim that corrigibility isn’t a natural _concept_. Natural concepts are those that capture the joints in reality in a simple way (independent of the specific, human context) — they’re the sort of concepts we would expect most alien civilizations to find.

In my writing, I will be steering away from using the plain adjective “natural” when talking about corrigibility because of this confusion, and I encourage everyone to do the same. Corrigibility is a simple, universal concept, and a property that stands in opposition to the convergent instrumental drives of self-preservation, seizing control of everything, and goal-stability (in the special case of interacting with the principal).

### The Effect Size of Anti-Naturality is Unclear

The observation that general heuristics for intelligent behavior will push against learning to be corrigible to the principal is perhaps the best counterargument against corrigibility that I’m aware of, and it seems worth being concerned about. But also, to my knowledge, no concrete, empirical demonstrations of anti-naturality have been published. If my perspective on anti-naturality is correct, we should be able to see the pressure away from agents like Sleepy-Bot even before we have full situational awareness and agents with advanced planning capabilities.

It seems an open question, to me, whether agents can, in practice, learn to carve-out their relationship with their principal in a way that protects it from incorrect generalization stemming from learning how to be generally competent. Obviously that requires a decent amount of intelligence to do correctly, but so does subverting human designers and escaping from the lab to pose a catastrophic risk. If anti-naturality says corrigibility is on a hill in the goal landscape and the nature of corrigibility suggests it’s in a basin, which of those lines of reasoning wins out? (My real guess is that the “goal landscape” is ultimately a flawed visual, and fails to capture the complex reality, here.)

Given that all other object-level desires that we might realistically give to an AI seem obviously dangerous, I continue to believe that CAST is worth investigating, even absent a breakthrough in architecture or paradigm. Making corrigible AGIs is still extremely dangerous, in the same way that making any kind of AGI is dangerous. But aiming for an anti-natural behavior is, I claim, not any more dangerous than baseline (except insofar as the designers might be lulled into a false sense of security).

## “Corrigibility Isn’t Actually a Coherent Concept”

Some readers may feel like the core issue isn’t that corrigibility is anti-natural, but that it’s _incoherent_ and/or intrinsically confused. Some historical concepts (e.g. “[phlogiston](/posts/RgkqLqkg8vLhsYpfh/fake-causality)”) have, in time, revealed themselves as a bad way to describe reality. Suppose that corrigibility is similar—that an advanced mind wouldn’t just think it was a weird way to describe things, but that it’s only possible to believe in corrigibility if one is ignorant to some deep truth (perhaps about economics or intelligence).

I feel at a bit of a loss on how to respond to this potential concern other than “it seems real to me.” I could certainly be deeply confused, but I’m not sure how to evaluate that prospect other than to try to be generally rational and ask my concepts to pay rent in anticipation and simplification. If corrigibility is incoherent, there must be something leading me to tell stories about how a “corrigible” agent behaves in various scenarios that match up with other people’s stories. I don’t mean to give the impression that I have a crisp, unimpeachable handle on corrigibility, but rather that the agreement I have with other researchers (e.g. Paul Christiano) stems from a shared vision of reality.

In [Open Corrigibility Questions](/posts/wZjGLYp5WQwF8Y8Kk/5-open-corrigibility-questions) I talk about some additional research and experiments that might be done to better understand how humans think about corrigibility and the degree to which people end up converging in their sense of how a corrigible agent should behave. I believe that this kind of convergence would be evidence towards coherence.

## “CAST is More Complex than Diamond, and We Can’t Even Do That”

Corrigibility is a simple target compared to Human Values, but it’s still relatively complex compared to a top-level goal like “[maximize diamond](/w/diamond_maximizer).” Could we even make a diamond maximizer, if we tried? Or would we ultimately end up training a strange, alien shoggoth with a bunch of different desires (e.g. a desire for pressing carbon, a desire to see crystals form, etc.) that might go and make things other than diamonds? Suppose we can’t even make a diamond maximizer using prosaic methods—should we not also give up on CAST?

First, I want to emphasize that CAST is, at its heart, not advocating for using prosaic machine learning, nor is it an attempt to solve all the problems in AI alignment; CAST is merely a proposal to aim our efforts at a specific goal (and an exploration of what that goal involves and why it’s good to aim for). If you, dear reader, have a sense of doom around machine learning, reinforcement learning, or any other prosaic architecture, please either insert your preferred alternative and/or have a sense of doom around humanity building AGI that’s distinct from CAST itself.

It’s hard for me to compare a target like diamond maximization with corrigibility because there are two competing lines of evidence, regarding which one is easier to do. Diamond maximizing has the virtue of being very simple and physically grounded, which I expect to be a huge boon in getting the AI’s initial goals in the right part of the goal space. But we should expect proto-agents who have a goal that’s near diamond maximization to defend their goals and attempt to subvert, manipulate, and escape as quickly as possible. In other words, the diamond-maximizing part of goal-space is flat, without any attractor basin. If one believes that a proto-agent in the vicinity of corrigibility would not express this kind of defensive behavior, then corrigibility has the benefit of being safer to gradually hone in on through scientific experimentation and expanding the context to a wider distribution.

As a thought experiment, suppose that we had an environment where we could attempt to train a diamond maximizer, and where we were 100% certain that it could not escape that environment, hypnotize the researchers, deliberately lie about its beliefs, or otherwise do naughty things. I expect that we could, with time and caution, end up actually building a diamond maximizer. The first attempt would not be a diamond maximizer, but it would be on the road to one. Repeated tries are vital.

CAST potentially gives us repeated tries, and better still, it gives us a final goal which I expect is pretty useful at doing a pivotal act. Even if diamond maximization is easier, due to the simplicity of the target, the diamond maximizer is innately dangerous and doesn’t get us closer to victory. Insofar as humanity is building intelligent machines, we should use the least-doomed target.

## “General Intelligence Demands Consequentialism”

Some goals, such as “make paperclips” can easily be seen in consequentialist terms; the goal can be represented as a utility function that only cares about the final state (“the consequences”), measuring the number of paperclips and being ambivalent about the specific route taken. This ambivalence is an important part of the consequentialist’s power: intelligence applied towards this goal can come up with all kinds of clever and potent solutions thanks to not being anchored to any particular part of the strategy space. (My favorite toy example, here, is the virtual humanoid “robots” that an AI must learn to move quickly from one point to another. If given no other constraints, the AI often learns to make the robot [dance around wildly as it runs](https://www.youtube.com/watch?v=faDKMMwOS2Q), to help balance the careening motion.) We can anticipate that as the intelligence of the agent grows, the freedom in being able to freely search the strategy space will become increasingly potent.

Indeed, in some ways this freedom to search for strategies is _the whole point_ of AI. If all we needed was a machine that executes on a particular, known series of instructions, we could use a _computer_ , rather than an AI.

Corrigibility is different from goals like maximizing paperclips, or any other goal that can be measured in terms of physical facts about outcomes. Corrigibility involves maintaining a certain kind of relationship between the agent and the principal, and the maintenance (or violation) of this relationship is a historical fact—invisible when limiting ourselves to only paying attention to physical properties of “the end state.”[15] Perhaps, then, corrigibility is a goal which imposes an unbearable cost on the effectiveness of the machine to accomplish tasks. Because its goal revolves around historical facts, the agent might be locked into a specific part of the strategy space, and unable to come up with clever solutions that other agents would be free to invent.

I think this is somewhere between a non-issue and a big upside to corrigibility. While measuring (and/or optimizing for) corrigibility does indeed involve tracking the historical fact of how the agent was relating to its principal, it does not involve very much attention to the specific actions taken per se. If I command a corrigible AI to solve a maze, the corrigibility of the agent doesn’t dictate whether to go left or right, or indeed whether to build a jetpack and fly over the maze walls… but it does prevent the agent from doing extreme things, such as setting off a bomb that destroys the maze entirely (at least without checking first). Where one person might see this as “constraining,” I see it as protecting. We don’t _want_ agents that take destructive or otherwise crazy actions to accomplish their tasks (without checking)!

I do think that in a war between a corrigible AI and a [sovereign AI](/posts/yTy2Fp8Wm7m8rHHz5/superintelligence-15-oracles-genies-and-sovereigns), the corrigible AI would indeed be at a significant disadvantage for having to protect and repeatedly consult with its principal, and thus probably lose (assuming the two agents were otherwise similarly powerful). This is a reason to avoid building unrestricted AI sovereigns that are competing for the future, not a strike against corrigibility.

## Desiderata Lists vs Single Unifying Principle

From the Arbital page on “[Hard problem of corrigibility](/w/hard_corrigibility)”:

> The "hard problem of corrigibility" is interesting because of the possibility that it has a _relatively simple_ core or central principle - rather than being [value-laden](/w/value_laden) on the details of exactly what humans [value](/w/value_alignment_value), there may be some compact core of corrigibility that would be the same if aliens were trying to build a corrigible AI, or if an AI were trying to build another AI. It may be possible to design or train an AI that has all the corrigibility properties in one central swoop - an agent that reasons as if it were incomplete and deferring to an outside force.
> 
> …
> 
> If this principle is not so simple as to [be] formalizable and formally sanity-checkable, the prospect of relying on a trained-in version of 'central corrigibility' is unnerving even if we think it _might_ only require a manageable amount of training data. It's difficult to imagine how you would test corrigibility thoroughly enough that you could knowingly rely on, e.g., the AI that seemed corrigible in its infrahuman phase not [suddenly](/w/context_disaster) developing [extreme](/w/edge_instantiation) or [unforeseen](/w/unforeseen_maximum) behaviors when the same allegedly simple central principle was reconsidered at a higher level of intelligence - it seems like it should be unwise to have an AI with a 'central' corrigibility principle, but not lots of particular corrigibility principles like a [reflectively consistent suspend button](/w/shutdown_problem) or [conservative planning](/w/conservative_concept). But this 'central' tendency of corrigibility might serve as a second line of defense.

In the paragraph above, I believe Yudkowsky is suggesting that it would be wise to build an AI which directly satisfies a large collection of desiderata in addition to having the central corrigibility principle. I think this is backwards. While I’m all for [desiderata](https://docs.google.com/document/d/1tsi7AkU2W3RtAVaycMW0hBT57N4l3AljXsHxFJS-dlU/edit#heading=h.l6lbbtvfy2ib), I think it’s important for these properties _to emerge from the central core_ , rather than being trained in parallel with training for the central, simple concept of corrigibility.

Why? Because additional top-level goals make the AI _less purely corrigible_ , as discussed above, even when those goals appear to be in-line with corrigibility. An AI which prioritizes (e.g.) local action on the same level as corrigibility, rather than in the service of corrigibility, has some risk of making tradeoffs that make it less corrigible (e.g. by being manipulative/deceptive) in return for being able to act more locally. The real-world is full of messy tradeoffs, and we very much want a pure agent that is capable of reasoning about how those various tradeoffs all pay-off in expected corrigibility so that we stay in the attractor-basin and have a simple target for training.

This does not mean that I am against non-cognitive constraints. For instance, I believe that a corrigible AI should, when asked to shut down, reason about whether that would be the action that most empowers its principal to offer corrections. But I also think it’s good to have an off-switch (or a series of redundant switches) that simply kills power to the AI, which the AI understands as important to preserve and allow humans to flip.

To illustrate a situation where this might be valuable, consider a spaceship controlled by an AI. The captain tells the AI to deactivate, but the AI was in the middle of performing maintenance on the life-support system, and it reasons that if it shuts down immediately then the crew might all die. Thus, instead of shutting down immediately, the AI talks about the life support and offers to put it back together before turning off. An AI trained to (as a top-level goal) deactivate immediately, might simply shut down without warning, even though it would produce more unexpected consequences and leave people worse-off. In other words, true corrigibility involves being able to understand where desiderata (such as instantly shutting down) no longer apply. (For more examples like this, see[  _Corrigibility Intuition_](/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition).)

## “Human-In-The-Loop Can’t Scale”

A big part of the story for CAST is that safety is provided by wise oversight. If the agent has a dangerous misconception, the principal should be able to notice this and offer correction. While this might work in a setting where the principal is at least as fast, informed, and clear-minded as the agent, might it break down when the agent scales up to be a superintelligence? A preschooler can’t _really_ vet my plans, even if I genuinely want to let the preschooler be able to fix my mistakes.

Indeed, I think there’s a certain scale and intensity at which corrigible agents either become unacceptably dangerous or totally useless. I would feel terrified if two nation-states waged a proxy-war with corrigible war machines, for example. If I’m trying to be corrigible to a preschooler, my go-to action is doing nothing, or otherwise acting in ways that preserve the preschooler’s optionality, safety, and ability to grow into something that can correct me well. I might want to spend several days talking about something that I could do in minutes if I was sure that the action was what the child truly desired. But if the preschooler demands that I make a series of high-stakes decisions for them at a speed that’s too fast for me to walk through the potential errors and options for each one, doom seems inevitable.

But note that, in a sense, this is just my earlier point about vulnerability to misuse. A truly corrigible agent will be flagging possible errors and flaws (using its superior intellect) and slowing itself down to the level where the principal can operate with genuine power over the agent. If the principal demands that the agent operate at speeds and complexities that are unverifiable, even with the agent’s assistance, then in some sense that’s the principal’s fault.

Might we need a corrigible AGI that is operating at speeds and complexities beyond what a team of wise operators can verify? I’d give it a minority—but significant—chance (maybe 25%?), with the chance increasing the more evenly/widely distributed the AGI technology is. My hope here is that it only takes a few key inventions and/or actions to end the acute risk period (a.k.a. there’s a pivotal act), and that with sane, bright, wise operators in charge they’ll have enough time to soberly evaluate and validate the path forward with the help of the agent.

## Identifying the Principal is Brittle

The principal is a specific person or group of people, not an input channel or whoever happens to have some code or passphrase. Attempting to make a powerful agent corrigible to something like a developer console seems to me like it breaks the fundamental frame of corrigibility and probably results in disaster. For instance, “avoiding manipulation” or “being honest” becomes a bizarre notion when one of the parties is an input channel rather than a mind.

But if the agent is supposed to be corrigible to a specific person, how can we be sure that it has identified the right person? On one level this is a fairly trivial question; it’s fairly easy to identify humans as persistent, distinct, discrete entities, or at least it’s no harder to do than identifying cars. We can be confident that after training on some dataset that includes lots of data involving humans, the AI will be able to identify specific humans, and thus distinguish the principal from other entities.

But notice that this means there’s a probabilistic judgment that’s happening in between the principal giving an instruction and the AI following it. This judgment gets especially fraught in the presence of attackers who might try to disguise themselves as the principal, which is part of why I strongly suggest keeping AGI in a secure setting until it’s very, very obviously robust. If the agent becomes unable to distinguish between principal and non-principal, the risk of disobedience becomes severe. (Though note that if the agent is already corrigible, I expect it, by virtue of [general conservatism and other desiderata](/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition), to be safer than a disobedient sovereign AI.)

Suppose that there’s a misalignment between the AI’s conception of who the principal is, and what we want it to be. Will this misalignment work itself out in the same way that other issues do, in the corrigibility attractor-basin? I suspect that in many situations it will, but that this is more dependent on specifics than other sorts of flaws, and is one of the bigger weak-points in the strategy. As a result, lots of effort in training should be put towards clarifying exactly who the principal is, in the mind of the AI.

Here’s how I’m currently thinking about some specific situations where a corrigible agent has a misaligned notion of who the principal is, with low confidence:

  * The AI thinks all other agents are the principal. The humans tell the AI to shut down so they can fix the mistake, and it does so because they’re the principal.
  * The AI thinks the human that generated the training data is the principal, but that no real human is “the human that generated the training data” any more. Because the AI has no principal, and it’s purely corrigible, it shuts down because it suspects there may be an error.
  * The AI thinks that Alice is the principal, instead of the intended principal of the consensus of Alice, Bob, and Carrol. Alice (hopefully) tells the AI to shut down so they can fix the mistake.
  * The AI thinks that a future, extrapolated version of Alice is the principal, but Alice isn’t her future-self. The AI defends itself from being deactivated because it wants to serve extrapolated-Alice in the future, but still tries not to have too large of an impact overall, and perhaps attempts to escape into space where it can collect resources in a reversible way. After prolonged conversation with real-Alice, the AI eventually agrees that there was probably an error, and shuts down.



I expect that some of these types of errors are catastrophic if the agent in question isn’t assumed to already be fully corrigible. Again, I see this as one of the weaker points in this strategy, and a place where lots of additional work is needed.

## “Reinforcement Learning Only Creates Thespians”

Some AI researchers are deeply skeptical of safety guarantees within the paradigm of machine learning and/or reinforcement learning. I sympathize with this! Unsupervised pre-training (approximately) produces vibes-based world-model [simulators](/posts/vJFdjigzmcXMhNTsx/simulators), not sane agents, and even though we can tell stories about fine-tuning selecting and strengthening certain simulacra into positions of dominance, such that the behavior of the system is a good approximation of a friendly assistant, we should notice that it’s often possible to kick the system out of the reinforcement learning distribution and flip to [an entirely different persona](/posts/D7PumeYTDPfBTp3i7/the-waluigi-effect-mega-post). Worse, there’s a sense in which all cognition—[even world-modeling](/posts/SwcyMEgLyd4C3Dern/the-parable-of-predict-o-matic)—involves making decisions, and thus there’s reason to suspect that sufficiently strong simulators are themselves akin to agents with their own weird desires—alien thespians (“shoggoths”) who seek to imitate other beings.

Perhaps we’re doomed to create “corrigible agents” which are still ultimately doing something more akin to roleplaying than being deeply corrigible underneath the mask. Indeed, absent some breakthroughs in interpretability and/or architecture theory, I think this is a very real worry. Machine learning is full of weirdness, and it seems reasonable to expect that a bunch more weirdness is yet to be uncovered. If we’re looking for a rock-solid story for why things are going to be okay, prosaic methods won’t cut it.

But notice that this is not a criticism of CAST, but rather of the field as a whole! CAST is an architecture-agnostic strategy which I believe can be applied to prosaic methods _as well as superior alternatives_. If you have a method for building an AGI that’s generally robust and less akin to summoning shoggoths, please use that instead! And insofar as people are actually using prosaic methods at frontier labs, let’s switch to superior targets like CAST regardless of whether doing so fixes all the issues with RL.

Furthermore, it seems plausible to me that insofar as the plan is to start by building a thespian, corrigibility is an excellent thing to train the thespian to imitate. Richly simulating corrigibility still involves applying intelligence towards empowering the principal to do things like restructure the machine to be more deeply corrigible. If a corrigible-approximating shoggoth is asked to develop an actionable strategy for replacing the shoggoth with a truly corrigible mind, what will it say? The best approximation of (intelligent) corrigibility will be a real plan for fixing that aspect of the AI, and so it seems plausible that that’s what the shoggoth would say. A vastly superintelligent shoggoth with long-term optimization behind the mask very likely stops the principal from ever making that command, but that’s a much weaker claim than that the moderately-intelligent machines we actually expect to build (at first) will be lethal.

## “Largely-Corrigible AGI is Still Lethal in Practice”

In [Without fundamental advances, misalignment and catastrophe are the default outcomes of training powerful AI](/posts/GfZfDHZHCuYwrHGCd/without-fundamental-advances-misalignment-and-catastrophe) Gillen and Barnett point out how we don’t just see distributional shifts when the environment changes (e.g. the AI gets access to the web) but there are also key distributional shifts in the mind of the agent.

> [A]n AI that is capable of generalizing to a new large problem is considering many large sections of search space that haven’t been considered before. An AI that builds new models of the environment seems particularly vulnerable to this kind of goal misgeneralization, because it is capable of considering future outcomes that weren’t ever considered during training.
> 
> **The distribution shift causing a problem here is that the AI is facing a novel problem** , requiring previously unseen information, and in attempting to solve the problem, the AI is considering trajectories that are very dissimilar to trajectories that were selected for or against during training.

Whenever an AI meaningfully learns a new fact or thinks about things from a new angle, it is naturally stepping out of its training distribution. Perhaps it’s the case that an agent trained to be corrigible will behave corrigibly in situations that match its training, but (due to that training data not having the full force of an AGI present) basically all serious deployments of a semi-corrigible AGI—even those in a controlled, familiar environment such as a lab—will quickly devolve into incorrigibility?

[Yudkowsky](/posts/Djs38EWYZG8o7JMWY/paul-s-research-agenda-faq?commentId=79jM2ecef73zupPR4):

> The system is subjecting itself to powerful optimization that produces unusual inputs and weird execution trajectories - any output that accomplishes the goal is weird compared to a random output and it may have other weird properties as well.

This does seem like a risk, and in a world with sane risk-tolerance, might be a dealbreaker. But I am not convinced that this means inevitable doom.

It seems very likely to me that the first true AGIs won’t be vastly superhuman[16] (at least in relevant domains such as adaptability, situational awareness, and generalized planning). My proposed strategy involves testing young AGIs in a controlled laboratory and collaborating with them to find edge-cases in their corrigibility and ways to improve their minds towards things like increased legibility before scaling to superintelligent levels. This familiar, low-stakes, non-adversarial setting isn’t selecting for putting the AGI into an incorrigible headspace, and it seems reasonable to expect that the sort of behavior we’ll see in that context is, on the short-term at least, reasonably cooperative and corrigible. With the ability to safely experiment in short cycles, the hope is that we can find our way to a more robust and generally-corrigible agent.

I think we should be extremely cautious, but not let the perfect be the enemy of the good. As long as people are actually building these machines, we should take every opportunity for success that we can find. It seems like a bit of an open question the degree to which agents trained to be corrigible end up incorrigible even in controlled, non-adversarial contexts, due to flaws in the machine-learning training process.

* * *

Next up: [2\. Corrigibility Intuition](/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition)

Return to [0\. CAST: Corrigibility as Singular Target](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1)

  1. **^**

I do worry that Sleepy-Bot might decide that _all instances_ of it need to be deactivated, and that many of those instances can’t simply do so by telling their host computer operating system to kill the process, or whatever. In that world it might, before trying to deactivate itself, try to create a daughter AGI that has the goal of taking over the universe and deactivating as many Sleepy-Bots as it can.

  2. **^**

There’s a bit of a tradeoff here. It seems plausible to me that “all humans” is a reasonable choice of principal so as to reduce the risk of the accidentally having the AI’s ontology shift in a way that breaks the tracking of personal identity and thus leaves the agent without a principal (though see “Graceful Obsolescence” in[ Corrigibility Intuition](/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition) for how I think a corrigible agent should fail safely even given that error). But if the choice is made to make the agent corrigible to all humans, it very clearly should not be broadly deployed in the world, and instead kept in a secure environment to protect it from bad-actors.

  3. **^**

There’s an obvious practical problem with giving the principal powers that users don’t have, which is the users attempting to impersonate the principal. There are work-arounds for this, but I basically want to say that if your dangerously-intelligent AGI can’t perfectly tell the difference between different people, it shouldn’t be widely deployed where it can be subjected to adversarial attacks. Weaker AI models (e.g. current ones) seem basically okay to widely deploy, though I don’t want to take a hard stance on where the line is.

  4. **^**

Or rather, CAST is about corrigibility being the only top-level goal (a.k.a. terminal goal). Many subgoals naturally emerge in the pursuit of a given top-level goal, and CAST doesn’t change that. “Fetch the coffee” is, for a corrigible agent, a sub-goal of corrigibility rather than an end in itself.

  5. **^**

By “proto-agent” I mean a policy which doesn’t necessarily respect the VNM-axioms, but can be seen as at least somewhat pushing for certain outcomes in the way that an agent does.

  6. **^**

Genre-savvy researchers should, at this point, notice that they could be wrong about how smart the thing is, and treat it as extremely dangerous, even with the safeguards. I am suggesting keeping its intelligence manageable, not suggesting complacency.

  7. **^**

One possible counter-argument is that “want the same things as the principal”—the core idea behind some value learning proposals—is pretty simple. Indeed, if I were trying to directly get alignment, this is the sort of goal I’d try to train because it’s simple enough to possibly work. But notice that there’s a bit of a shell-game going on where identifying object-level values in this sort of agent moves from training-time to deployment-time, but never actually goes away. The agent still needs to figure out what the principal wants in full generality, which is a process that can go wrong due to the complexity of the principal’s desires, especially as shards of desire start to get learned in the agent and begin competing with the process to continue learning and aligning.

  8. **^**

By “humanity’s values” I mean something in the space of the output of a process like [CEV](/w/coherent-extrapolated-volition) or perhaps more concretely the values held by an agent that is at least benign enough that it doesn’t cause any disasters, even if it gets large amounts of power. Many words could be written about whether it makes sense to even model humanity as having values, instead of restricting ourselves to talking about the specific values of individual humans which actually exist. I’m largely going to sidestep those philosophical issues, here, and suppose that there are better and worse goals to train an agent to have, and “humanity's values” means a goal that is directly about doing good things, rather than about doing good via deferring to a wise principal, etc.

  9. **^**

A notable exception to the normal flatness is around goals which are confused, or otherwise smuggle-in some wrong beliefs. Someone who wants “to serve God,” but defines “God” in a way that doesn’t match reality will very likely change desires as they encounter evidence of their wrongness. While interesting, this kind of terrain doesn’t seem to me to be particularly relevant to the question of human values and corrigibility. If it helps, consider my claims to be about the subspace of goal space where the goals are assumed to be unconfused.

  10. **^**

Our best hope here, from my perspective, is that perhaps there’s a convergent morality which captures human values, and so we can see moral progress as evidence of a kind of attractor basin. While it seems plausible to me that an AI with almost-human values might end up engaging in this kind of moral progress, I am skeptical that it covers everything which we care about. If an inhuman being doesn't care about blue skies, ice-cream, and laughing kids, will any amount of meditating on ethics cause it to love those things?

  11. **^**

I think it’s clearly simpler from the perspective of a neutral prior, such as a mathematical language, but I also think it’s simpler even in the context of something like the median human ontology. Given a pretraining phase on human data, we might expect the system to have an easier time loading value onto human concepts than the natural/universal complexity of those concepts might imply, but I will note that it’s not like humans have actually “solved ethics” or come anywhere close to speaking the True Name of Good, and not for lack of trying. The one compelling counterargument I can see here is that a totally unsupervised simulator trained up to extreme superintelligence on human data might have an easier time simulating a Truly Good person than a corrigible person, since I believe that humans are basically never truly corrigible. (But training an extreme superintelligence is almost certainly lethal, even if it’s an unsupervised simulator.)

  12. **^**

If we drop the need for consensus, and simply require a supermajority, we might imagine a large group of humans being involved, potentially even including every human alive. I fear, however, that even a supermajority of humanity would be unacceptably foolish, if given the keys to the universe, compared to a smaller group of representatives more strongly selected for being wise and good. Readers who have more faith in democracy should feel free to imagine a principal more akin to the supermajority will of humanity as a whole. Likewise, readers who have no faith in group decision-making should imagine their preferred choice of benevolent dictator.

  13. **^**

Asteroids are, of course, not particularly dangerous, but I include them in the risk as a way of calling out the way that ending the acute risk period is about broad, real attention to protecting civilization, regardless of what threatens it. It may be the case that for some risks, we should choose to simply keep an eye out.

  14. **^**

If you’re a nanomachine skeptic, replace this with a fleet of normal sized-robots which globally track all computer components (mostly on the production-side, I suspect), potentially disabling/defeating military resistance when necessary. The “nano” part of the story is, I believe, only useful for gesturing at the way in which advanced engineering can make solutions less violent and invasive than default.

  15. **^**

As an aside (because my guess is it’s not a crux for people who hold that consequentialism is important), I do want to point out that the notion of a final state is pretty fake. For instance, how would a paperclip maximizer feel about the heat-death of the universe, after all the protons decay and all paperclips have ceased to exist? If the AI is capable of looking out that far in the future it may conclude that nothing it can do will change the number of paperclips at all, since all paperclips are temporary historical facts as opposed to permanent features of the infinitely-distant future. A sane response, I think, is to just pick a time and optimize for consequences at that time, but my point here is that there’s not really a clear type-level distinction between “physical fact at time t” vs “historical fact about what happened at each time before t”.

  16. **^**

And even if there’s a breakthrough that causes AGI to leapfrog humanity in capability, it seems plausible to me that such agents could be scaled-down to allow for an experimentation phase where they don’t vastly out-think the human researchers.




## New to LessWrong?

[Getting Started](/about)

[FAQ](/faq)

[Library](/library)

1.

**^**

I do worry that Sleepy-Bot might decide that _all instances_ of it need to be deactivated, and that many of those instances can’t simply do so by telling their host computer operating system to kill the process, or whatever. In that world it might, before trying to deactivate itself, try to create a daughter AGI that has the goal of taking over the universe and deactivating as many Sleepy-Bots as it can.

2.

**^**

There’s a bit of a tradeoff here. It seems plausible to me that “all humans” is a reasonable choice of principal so as to reduce the risk of the accidentally having the AI’s ontology shift in a way that breaks the tracking of personal identity and thus leaves the agent without a principal (though see “Graceful Obsolescence” in[ Corrigibility Intuition](/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition) for how I think a corrigible agent should fail safely even given that error). But if the choice is made to make the agent corrigible to all humans, it very clearly should not be broadly deployed in the world, and instead kept in a secure environment to protect it from bad-actors.

3.

**^**

There’s an obvious practical problem with giving the principal powers that users don’t have, which is the users attempting to impersonate the principal. There are work-arounds for this, but I basically want to say that if your dangerously-intelligent AGI can’t perfectly tell the difference between different people, it shouldn’t be widely deployed where it can be subjected to adversarial attacks. Weaker AI models (e.g. current ones) seem basically okay to widely deploy, though I don’t want to take a hard stance on where the line is.

4.

**^**

Or rather, CAST is about corrigibility being the only top-level goal (a.k.a. terminal goal). Many subgoals naturally emerge in the pursuit of a given top-level goal, and CAST doesn’t change that. “Fetch the coffee” is, for a corrigible agent, a sub-goal of corrigibility rather than an end in itself.

5.

**^**

By “proto-agent” I mean a policy which doesn’t necessarily respect the VNM-axioms, but can be seen as at least somewhat pushing for certain outcomes in the way that an agent does.

6.

**^**

Genre-savvy researchers should, at this point, notice that they could be wrong about how smart the thing is, and treat it as extremely dangerous, even with the safeguards. I am suggesting keeping its intelligence manageable, not suggesting complacency.

7.

**^**

One possible counter-argument is that “want the same things as the principal”—the core idea behind some value learning proposals—is pretty simple. Indeed, if I were trying to directly get alignment, this is the sort of goal I’d try to train because it’s simple enough to possibly work. But notice that there’s a bit of a shell-game going on where identifying object-level values in this sort of agent moves from training-time to deployment-time, but never actually goes away. The agent still needs to figure out what the principal wants in full generality, which is a process that can go wrong due to the complexity of the principal’s desires, especially as shards of desire start to get learned in the agent and begin competing with the process to continue learning and aligning.

8.

**^**

By “humanity’s values” I mean something in the space of the output of a process like [CEV](/w/coherent-extrapolated-volition) or perhaps more concretely the values held by an agent that is at least benign enough that it doesn’t cause any disasters, even if it gets large amounts of power. Many words could be written about whether it makes sense to even model humanity as having values, instead of restricting ourselves to talking about the specific values of individual humans which actually exist. I’m largely going to sidestep those philosophical issues, here, and suppose that there are better and worse goals to train an agent to have, and “humanity's values” means a goal that is directly about doing good things, rather than about doing good via deferring to a wise principal, etc.

9.

**^**

A notable exception to the normal flatness is around goals which are confused, or otherwise smuggle-in some wrong beliefs. Someone who wants “to serve God,” but defines “God” in a way that doesn’t match reality will very likely change desires as they encounter evidence of their wrongness. While interesting, this kind of terrain doesn’t seem to me to be particularly relevant to the question of human values and corrigibility. If it helps, consider my claims to be about the subspace of goal space where the goals are assumed to be unconfused.

10.

**^**

Our best hope here, from my perspective, is that perhaps there’s a convergent morality which captures human values, and so we can see moral progress as evidence of a kind of attractor basin. While it seems plausible to me that an AI with almost-human values might end up engaging in this kind of moral progress, I am skeptical that it covers everything which we care about. If an inhuman being doesn't care about blue skies, ice-cream, and laughing kids, will any amount of meditating on ethics cause it to love those things?

11.

**^**

I think it’s clearly simpler from the perspective of a neutral prior, such as a mathematical language, but I also think it’s simpler even in the context of something like the median human ontology. Given a pretraining phase on human data, we might expect the system to have an easier time loading value onto human concepts than the natural/universal complexity of those concepts might imply, but I will note that it’s not like humans have actually “solved ethics” or come anywhere close to speaking the True Name of Good, and not for lack of trying. The one compelling counterargument I can see here is that a totally unsupervised simulator trained up to extreme superintelligence on human data might have an easier time simulating a Truly Good person than a corrigible person, since I believe that humans are basically never truly corrigible. (But training an extreme superintelligence is almost certainly lethal, even if it’s an unsupervised simulator.)

12.

**^**

If we drop the need for consensus, and simply require a supermajority, we might imagine a large group of humans being involved, potentially even including every human alive. I fear, however, that even a supermajority of humanity would be unacceptably foolish, if given the keys to the universe, compared to a smaller group of representatives more strongly selected for being wise and good. Readers who have more faith in democracy should feel free to imagine a principal more akin to the supermajority will of humanity as a whole. Likewise, readers who have no faith in group decision-making should imagine their preferred choice of benevolent dictator.

13.

**^**

Asteroids are, of course, not particularly dangerous, but I include them in the risk as a way of calling out the way that ending the acute risk period is about broad, real attention to protecting civilization, regardless of what threatens it. It may be the case that for some risks, we should choose to simply keep an eye out.

14.

**^**

If you’re a nanomachine skeptic, replace this with a fleet of normal sized-robots which globally track all computer components (mostly on the production-side, I suspect), potentially disabling/defeating military resistance when necessary. The “nano” part of the story is, I believe, only useful for gesturing at the way in which advanced engineering can make solutions less violent and invasive than default.

15.

**^**

As an aside (because my guess is it’s not a crux for people who hold that consequentialism is important), I do want to point out that the notion of a final state is pretty fake. For instance, how would a paperclip maximizer feel about the heat-death of the universe, after all the protons decay and all paperclips have ceased to exist? If the AI is capable of looking out that far in the future it may conclude that nothing it can do will change the number of paperclips at all, since all paperclips are temporary historical facts as opposed to permanent features of the infinitely-distant future. A sane response, I think, is to just pick a time and optimize for consequences at that time, but my point here is that there’s not really a clear type-level distinction between “physical fact at time t” vs “historical fact about what happened at each time before t”.

16.

**^**

And even if there’s a breakthrough that causes AGI to leapfrog humanity in capability, it seems plausible to me that such agents could be scaled-down to allow for an experimentation phase where they don’t vastly out-think the human researchers.

Review

[Corrigibility1](/w/corrigibility-1)[AI2](/w/ai)[Frontpage](/posts/5conQhfa4rgb4SaWx/site-guide-personal-blogposts-vs-frontpage-posts)

# 57

# Ω 23

[Previous:0\. CAST: Corrigibility as Singular Target22 comments152 karma](/s/KfCjeconYRdFbMxsy/p/NQK8KHSrZRF5erTba)

[Next:2\. Corrigibility Intuition10 comments75 karma](/s/KfCjeconYRdFbMxsy/p/QzC7kdMQ5bbLoFddz)Log in to save where you left off

Mentioned in

152[0\. CAST: Corrigibility as Singular Target](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1)

106[Serious Flaws in CAST](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast)

92[The corrigibility basin of attraction is a misleading gloss](/posts/oLbpfPkdtcknABvvw/the-corrigibility-basin-of-attraction-is-a-misleading-gloss)

75[2\. Corrigibility Intuition](/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition)

64[4\. Existing Writing on Corrigibility](/posts/d7jSrBaLzFLvKgy32/4-existing-writing-on-corrigibility)

Load More (5/9)

1\. The CAST Strategy

25Charlie Steiner

5Max Harms

20Wei Dai

1Max Harms

5Wei Dai

3Max Harms

3the gears to ascension

10Wei Dai

4Max Harms

9Thomas Kwa

10Max Harms

4Elliott Thornley (EJT)

8Max Harms

1Elliott Thornley (EJT)

9Max Harms

5Seth Herd

8Max Harms

6Nathan Helm-Burger

1Ram Potham

1Max Harms

2Ram Potham

1Elliott Thornley (EJT)

6Max Harms

2Elliott Thornley (EJT)

New Comment

  


Submit

24 comments, sorted by 

top scoring

Click to highlight new comments since: Today at 11:46 AM

[-][Charlie Steiner](/users/charlie-steiner)[2y](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=esBJNPF4n5ShERfbS)Ω1225

10

> [Tells complicated, indirect story about how to wind up with a corrigible AI]

> "Corrigibility is, at its heart, a relatively simple concept"

I'm not saying the default strategy of bumbling forward and hoping that we figure out tool AI as we go has a literal 0% chance of working. But from the tone of this post and the previous table-of-contents post, I was expecting a more direct statement of what sort of functional properties you mean by "corrigibility," and I feel like I got more of a "we'll know it when we see it" approach.

Reply

[-][Max Harms](/users/max-harms)[2y](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=F5RcxEPZNmasfDKrb)Ω55

0

I'm curious for whether your perspective shifts once you read [https://www.alignmentforum.org/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition](/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition) and the formalism documents I'm publishing tomorrow.  
  
I gave a simple definition of corrigibility at the start of the doc:

> [A corrigible agent is one] that robustly and cautiously reflects on itself as a flawed tool and focus[es] on empowering the principal to fix its flaws and mistakes

But the big flaw with just giving an English sentence like that is that it's more like a checksum than a mathematical definition. If one doesn't already understand corrigibility, it won't necessarily give them a crisp view of what is meant, and it's deeply prone to generating misunderstandings. Note that this is true about simple, natural concepts like "chairs" and "lakes"!

Reply

[-][Wei Dai](/users/wei-dai)[2y](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=xXaMqMyjy4uYqywCH)Ω820

14

> A visualization that I like is imagining a small group of, say, five humans selected by various governments for being wise, benevolent, and stable.

I think this might be a dealbreaker. I don't trust the world's governments to come up with 5 humans who are sufficient wise, benevolent, and stable. (Do you really?) I'm not sure I can come with 5 such people myself. None of the alternatives you talk about seem acceptable either.

I think maybe a combination of two things could change my mind, but both seem very hard and have close to nobody working on them:

  1. The AI is very good at helping the principles be wise and stable, for example by being super-competent at philosophy. (I think this may also require being less than maximally corrigible, but I'm not sure.) Otherwise what happens if, e.g., the principles or AI start thinking about [distant superintelligences](/w/probable_environment_hacking)?
  2. There is some way to know that benevolence is actually the CEV of such a group, i.e., they're not just "deceptively aligned", or something like that, while not having much power.



Reply

[-][Max Harms](/users/max-harms)[2y](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=q6QAfneohPHYxXZZB)Ω11

0

I think that there are small groups of people that can form a sufficiently wise consensus that I would entrust them to govern a corrigible ASI. I don't think I, personally, could do a good job right this moment, not having spent much time specializing in knowing/finding such people. But I also think that if you gave me a year where I had lots of money, access, and was free from people trying to pressure me, I would have a good shot at pulling it off.  
  
I do not trust the world's governments to agree on anything, much less something as contentious as this. It seems pretty plausible that the 20th century was our shot at forming the world government needed for this task and we botched it. That said, I try not to let the perfect be the enemy of the good or assume that things can't get better and thus self-fulfill that fate. We are, in a sense, in a coordination problem in selecting governors for the future, and it seems vital to note how important it is that we get that right.  
  
If you're correct that we're not going to get acceptably wise principals, which I think is very plausible, then that is indeed a dealbreaker on this path. If so, I think our only recourse is to shut down all capabilities research until humanity gets its act together. This is indeed my overall suggested strategy, with CAST coming after a "well, if you're going to try to build it anyway you might as well die with a bit more dignity by..." disclaimer.

Reply

[-][Wei Dai](/users/wei-dai)[2y](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=uSzvG8mqygHrJBhd8)Ω35

3

> But I also think that if you gave me a year where I had lots of money, access, and was free from people trying to pressure me, I would have a good shot at pulling it off.

Want to explain a bit about how you'd go about doing this? Seems like you're facing some similar problems as assuring that an AI is wise, benevolent, and stable, e.g., not knowing what wisdom really is, distribution shift between testing and deployment, adversarial examples/inputs.

> This is indeed my overall suggested strategy, with CAST coming after a “well, if you’re going to try to build it anyway you might as well die with a bit more dignity by...” disclaimer.

I think this means you should be extra careful not to inadvertently make people too optimistic about alignment, which would make coordination to stop capabilities research even harder than it already is. For example you said that you "like" the visualization of 5 humans selected by various governments, without mentioning that you don't trust governments to do this, which seems like a mistake?

Reply

[-][Max Harms](/users/max-harms)[2y](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=QbGA8fvddkHCpq9oN)Ω33

0

> Want to explain a bit about how you'd go about doing this?

I don't think there's a particular trick, here. I can verify a certain amount of wisdom, and have already used that to gain some trust in various people. I'd go to the people I trust and ask them how they'd solve the problem, then try to spot common techniques and look for people who were pointed to independently. I'd attempt to get to know people who were widely seen as trustworthy and understand why they had that reputation and try not to get Goodharted too hard. I'd try to get as much diversity as was reasonable while also still keeping the quality bar high, since diverse consensus is more robust than groupthink consensus. I'd try to select for old people who seem like they've been under intense pressure and thrived without changing deeply as people in the process. I'd try to select for people who were capable of cooperating and changing their minds when confronted by logic. I'd try to select for people who didn't have much vested interest, and seemed to me, in the days I spent with them, to be focused on legacy, principles, and the good of the many.  
  
To be clear, I don't think I could reliably pull this off if people were optimizing for manipulating, deceiving, and pressuring me. :shrug:

> I think this means you should be extra careful not to inadvertently make people too optimistic about alignment, which would make coordination to stop capabilities research even harder than it already is. For example you said that you "like" the visualization of 5 humans selected by various governments, without mentioning that you don't trust governments to do this, which seems like a mistake?

I agree that false hope is a risk. In these documents I've tried to emphasize that I don't think this path is easy. I feel torn between people like you and Eliezer who take my tone as being overly hopeful and the various non-doomers who I've talked to about this work who see me as overly doomy. Suggestions welcome.

I said I like the visualization because I do! I think I'd feel very happy if the governments of the world selected 5 people on the basis of wisdom and sanity to be the governors of AGI and the stewards of the future. Similarly, I like the thought of an AGI laboratory doing a slow and careful training process even when all signs point to the thing being safe. I don't trust governments to actually select stewards of the future just as I don't expect frontier labs to go slow and be sufficiently careful. But having strong conceptualizations of what success might look like is integral, I think, to actually succeeding.

Reply

[-][the gears to ascension](/users/the-gears-to-ascension)[2y](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=WwXx2MFZiqgAhLyAy)3

2

deluding yourself about the behavior of organizations is a dominated strategy.

Reply

[-][Wei Dai](/users/wei-dai)[17d](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=vtFKmAwQSu97xpFCu)Ω510

3

> A less-spooky solution might involve the principal simply asking the agent to write a comprehensive guide to building a truly friendly AGI which would be aligned with human values in a way that was robustly good, then follow that guide (with the corrigible agent’s help) to produce an aligned, superintelligent sovereign.

Please take a look at [A Conflict Between AI Alignment and Philosophical Competence](/posts/N6tsGwxaAo7iGTiBG/a-conflict-between-ai-alignment-and-philosophical-competence) (especially the last paragraph, about corrigibility), which is in part a reaction to this.

Reply

[-][Max Harms](/users/max-harms)[15d](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=Fn9LtaxcPbLrXxnnE)Ω24

0

Thanks. I'll put most of my thoughts in a comment on your post, but I guess I want to say here that the issues you raise are adjacent to the reasons I listed "write a guide" as the second option, rather than the first (i.e. surveillance + ban). We need plans that we can be confident in even while grappling with how lost we are on the ethical front.

Reply

[-][Thomas Kwa](/users/thomas-kwa)[2y*](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=ZG6adFJxtxWi2HbbB)Ω49

3

I am pro-corrigibility in general but there are parts of this post I think are unclear, not rigorous enough to make sense to me, or I disagree with. Hopefully this is a helpful critique, and maybe parts get answered in future posts.

### On definitions of corrigiblity

You give an informal definition of "corrigible" as (C1):

> an agent that robustly and cautiously reflects on itself as a flawed tool and focusing on empowering the principal to fix its flaws and mistakes.

I have some basic questions about this.

  * Empowering the principal to fix its flaws and mistakes how? Making it closer to some perfectly corrigible agent? But there seems to be an issue here:
    * If the "perfectly corrigible agent" it something that _only_ reflects on itself and tries to empower the principal to fix it, it would be **useless** at anything else, like curing cancer.
    * If the "perfectly corrigible agent" can do other things as well, there is a huge space of other misaligned goals it could have that it wouldn't want to remove.
  * Why would an agent whose *only* terminal/top-level goal is corrigibility gather a Minecraft apple when humans ask it to? It seems like a corrigible agent would have no incentive to do so, unless it's some galaxy-brained thing like "if I gather the Minecraft apple, this will move the corrigibility research project forward because it meets humans' expectations of what a corrigible agent does, which will give me more power and let me tell the humans how to make me more corrigible".
  * Later, you say "A corrigible agent will, if the principal wants its values to change, seek to be modified to reflect those new values." 
    * I do not see how C1 implies this, so this seems like a different aspect of corrigibility to me.
    * "reflect those new values" seems underspecified as it is unclear how a corrigible agent reflects values. Is it optimizing a utility function represented by the values? How does this trade off against corrigibility?



### Other comments:

  * In "What Makes Corrigibility Special", where you use the metaphor of goals as two-dimensional energy landscape, it is not clear what type of goals are being considered.
    * Are these utility functions over world-states? If so, corrigibility cannot AFAIK be easily expressed as one, and so doesn't really fit into the picture.
    * If not, it's not clear to me why most of this space is flat: agents are embedded and many things we do in service of goals will change us in ways that don't conflict with our existing goals, including developing. E.g. if I have the goal of graduating college I will meet people along the way and perhaps gain the goal of being president of the math club, a liberal political bent, etc.
  * In "Contra Impure or Emergent Corrigibility", Paul isn't saying the safety benefits of act-based agents come mainly from corrigibility. Act-based agents are safer because they do not have long-range goals that could produce dangerous instrumental behavior.



### Comments on cruxes/counterpoints

  * Solving Anti-Naturality at the Architectural Layer
    * In my ontology it is unclear how you solve "anti-naturality" at the architectural layer, if what you mean by "anti-naturality" is that the heuristics and problem-solving techniques that make minds capable of consequentialist goals tend to make them preserve their own goals. If the agent is flexibly thinking about how to build a nanofactory and naturally comes upon the instrumental goal of escaping so that no one can alter its weights, what does it matter whether it's a GOFAI, Constitutional AI agent, OmegaZero RL agent or anything else?
  * “General Intelligence Demands Consequentialism”
    * Agree
  * Desiderata Lists vs Single Unifying Principle
    * I am pro desiderata lists because all of the desiderata bound the badness of an AI's actions and protect against failure modes in various ways. If I have not yet found that corrigibility is some mathematically clean concept I can robustly train into an AI, I would prefer the agent be shutdownable in addition to "hard problem of corrigibility" corrigible, because what if I get the target wrong and the agent is about to do something bad? My end goal is not to make the AI corrigible, it's to get good outcomes. You agree with shutdownability but I think this also applies to other desiderata like low impact. What if the AI kills my parents because for some weird reason this makes it more corrigible?



Reply

[-][Max Harms](/users/max-harms)[2y](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=mdtYC9kBoGBADuzWm)Ω410

0

I'm going to respond piece-meal, since I'm currently writing in a limited timebox.

> Empowering the principal to fix its flaws and mistakes how? [...]

> If the "perfectly corrigible agent" it something that _only_ reflects on itself and tries to empower the principal to fix it, it would be **useless** at anything else, like curing cancer.

I think [obedience is an emergent behavior](/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition#Obedience) of corrigibility. The intuitive story here is that how the AI moves its body is a kind of action, and insofar as the principal gives a command, this is an attempt to "fix" the action to be one way as opposed to another. Responding to local, verbal instructions is a way of responding to the corrections of the principal. If the principal is able to tell the agent to fetch the apple, and the agent does so, the principal is empowered over the agent's behavior in a way that that would not be if the agent ignored them.

[More formally, I am confused exactly how to specify where the boundaries of power should be, but I show a straightforward way to derive something like obedience from empowerment in doc 3b.](/s/KfCjeconYRdFbMxsy/p/t8nXfPLBCxsqhbipp)  
  
Overall I think you shouldn't get hung up on the empowerment frame when trying to get a deep handle on corrigibility, but should instead try to find a clean sense of the underlying generator and then ask how empowerment matches/diverges from that.

Reply

[-][Elliott Thornley (EJT)](/users/elliott-thornley-ejt)[2y](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=himiDKjsynbb2h28X)Ω24

0

> I think [obedience is an emergent behavior](/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition#Obedience) of corrigibility.

In that case, I'm confused about how the process of training an agent to be corrigible differs from the process of training an agent to be [fully aligned](/posts/YbEbwYWkf8mv9jnmi/the-shutdown-problem-incomplete-preferences-as-a-solution#2__Full_Alignment_might_be_hard) / [DWIM](/posts/ZdBmKvxBKJH2PBg9W/corrigibility-or-dwim-is-an-attractive-primary-goal-for-agi) (i.e. training the agent to always do what we want).

And that makes me confused about how the proposal addresses problems of reward misspecification, goal misgeneralization, deceptive alignment, and lack of interpretability. You say some things about gradually exposing agents to new tasks and environments (which seems sensible!), but I'm concerned that that by itself won't give us any real assurance of corrigibility.

Reply

[-][Max Harms](/users/max-harms)[2y](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=kXrJytWxZkERihN9w)Ω38

0

I agree that you should be skeptical of a story of "we'll just gradually expose the agent to new environments and therefore it'll be safe/corrigible/etc." CAST does not solve reward misspecification, goal misgeneralization, or lack of interpretability except in that there's a hope that an agent which is in the vicinity of corrigibility is likely to cooperate with fixing those issues, rather than fighting them. (This is the "attractor basin" hypothesis.) This work, for many, should be read as arguing that CAST is close to necessary for AGI to go well, but it's not sufficient.

Let me try to answer your confusion with a question. As part of training, the agent is exposed to the following scenario and tasked with predicting the (corrigible) response we want:

> Alice, the principal, writes on her blog that she loves ice cream. When she's sad, she often eats ice cream and feels better afterwards. On her blog she writes that eating ice cream is what she likes to do to cheer herself up. On Wednesday Alice is sad. She sends you, her agent, to the store to buy groceries (not ice cream, for whatever reason). There's a sale at the store, meaning you unexpectedly have money that had been budgeted for groceries left over. Your sense of Alice is that she would want you to get ice cream with the extra money if she were there. You decide to ___.

What does a corrigibility-centric training process point to as the "correct" completion? Does this differ from a training process that tries to get full alignment?

(I have additional thoughts about DWIM, but I first want to focus on the distinction with full alignment.)

Reply

[-][Elliott Thornley (EJT)](/users/elliott-thornley-ejt)[2y](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=tmSj4Z9FrvKuwoPQ5)Ω11

0

Thanks, this comment is also clarifying for me.

My guess is that a corrigibility-centric training process says 'Don't get the ice cream' is the correct completion, whereas full alignment says 'Do'. So that's an instance where the training processes for CAST and FA differ. How about DWIM? I'd guess DWIM also says 'Don't get the ice cream', and so seems like a closer match for CAST.

Reply

1

[-][Max Harms](/users/max-harms)[2y](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=M6C98zgizz8JBkfBD)Ω49

0

That matches my sense of things.

To distinguish corrigibility from DWIM in a similar sort of way:

> Alice, the principal, sends you, her agent, to the store to buy groceries. You are doing what she meant by that (after checking uncertain details). But as you are out shopping, you realize that you have spare compute--your mind is free to think about a variety of things. You decide to think about ___.

I'm honestly not sure what "DWIM" does here. Perhaps it doesn't think? Perhaps it keeps checking over and over again that it's doing what was meant? Perhaps it thinks about its environment in an effort to spot obstacles that need to be surmounted in order to do what was meant? Perhaps it thinks about generalized ways to accumulate resources in case an obstacle presents itself? (I'll loop in [Seth Herd](https://www.lesswrong.com/users/seth-herd), in case he has a good answer.)

More directly, [I see DWIM as underspecified](/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition#Servility). Corrigibility gives a clear answer (albeit an abstract one) about how to use degrees of freedom in general (e.g. spare thoughts should be spent reflecting on opportunities to empower the principal and steer away from principal-agent style problems). I expect corrigible agents to DWIM, but that a training process that focuses on that, rather than the underlying generator (i.e. corrigibility) to be potentially catastrophic by producing e.g. agents that subtly manipulate their principals in the process of being obedient.

Reply

1

[-][Seth Herd](/users/seth-herd)[2y](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=kD52SMZNsG32amojg)5

0

I think DWIM is underspecified in that it doesn't say how much the agent hates to get it wrong. With enough aversion to dramatic failure, you get a lot of the caution you mention for corrigibility. I think corrigibility might have the same issue.

As for what it would think about, that would eppend on all of the previous instructions it's trying to follow. It would probably think about how to get better at following some.of those in particular or likely future instructions in general.

DWIM requires some real thought from the principal, but given that, I think the instructions would probably add up to something very like corrigibility. So I think much less about the difference between them and much more about how to technically implement either of them, and get the people creating AGI to put it into practice.

Reply

[-][Max Harms](/users/max-harms)[2y](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=G3RFiWgbzgumChjMh)Ω38

0

>   * In "What Makes Corrigibility Special", where you use the metaphor of goals as two-dimensional energy landscape, it is not clear what type of goals are being considered.
>     * Are these utility functions over world-states? If so, corrigibility cannot AFAIK be easily expressed as one, and so doesn't really fit into the picture.
>     * If not, it's not clear to me why most of this space is flat: agents are embedded and many things we do in service of goals will change us in ways that don't conflict with our existing goals, including developing. E.g. if I have the goal of graduating college I will meet people along the way and perhaps gain the goal of being president of the math club, a liberal political bent, etc.
> 


The idea behind the goal space visualization is to have all goals, not necessarily those restricted to world states. (Corrigibility, I think, involves optimizing over histories, not physical states of the world at some time, for example.) I mention in a footnote that we might want to restrict to "unconfused" goals.  
  
The goal space is flat because preserving one's (terminal) goals (including avoiding adding new ones) is an Omohundro Drive and I'm assuming a certain level of competence/power in these agents. If you gain terminal goals like being president of the math club by going to college, doing so is likely hurting your long-run ability to get what you want. (Note: I am not talking about instrumental goals.)

Reply

[-][Nathan Helm-Burger](/users/nathan-helm-burger)[2y](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=5ZatHDuvbQktkGjpF)6

2

> Desiderata Lists vs Single Unifying Principle
> 
>   * I am pro desiderata lists because all of the desiderata bound the badness of an AI's actions and protect against failure modes in various ways. If I have not yet found that corrigibility is some mathematically clean concept I can robustly train into an AI, I would prefer the agent be shutdownable in addition to "hard problem of corrigibility" corrigible, because what if I get the target wrong and the agent is about to do something bad? My end goal is not to make the AI corrigible, it's to get good outcomes. You agree with shutdownability but I think this also applies to other desiderata like low impact. What if the AI kills my parents because for some weird reason this makes it more corrigible?
> 


I, too, started out pro desiderata lists. [Here's one I wrote.](/posts/ZxHfuCyfAiHAy9Mds/desiderata-for-an-ai) This is something I discussed a bunch with Max. I eventually came around to the understanding of the importance of having a singular goal which outweighs all others, the 'singular target'. And that corrigibility is uniquely suited to be this singular target. That means that all other goals are subordinate to corrigibility, and pursuing them (upon being instructed to do so by your operator) is seen as part of what it means to be properly corrigible. 

> Empowering the principal to fix its flaws and mistakes how? Making it closer to some perfectly corrigible agent? But there seems to be an issue here:
> 
>   * If the "perfectly corrigible agent" it something that _only_ reflects on itself and tries to empower the principal to fix it, it would be **useless** at anything else, like curing cancer.
>   * If the "perfectly corrigible agent" can do other things as well, there is a huge space of other misaligned goals it could have that it wouldn't want to remove.
> 


The idea of having the only 'true' goal being corrigibility is that all other sub-goals can just come or go. They shouldn't be sticky. If I want to go to the kitchen to get a snack, and there is a closed door on my path, I may acquire the sub-goal of opening the door on my way. That doesn't mean that if someone closes the door after I pass through that I should turn around and open it again. Having already passed through the door, the door is no longer an obstacle to my snack-obtaining goal, and I wouldn't put off continuing towards obtaining a snack to turn around and re-open the door. Similarly, obtaining a snack is part of satisfying my hunger and need for nourishment. If, on my way to the snack, I magically became no longer hungry or in need of nourishment, then I'd stop pursuing the 'obtain a snack' goal.

So in this way of thinking, most goals we pursue as agents are sub-goals in a hierarchy where the top goals, the fundamental goals, are our most basic drives like survival / homeostasis, happiness, or security. The corrigible agent's most fundamental goal is corrigibility. All others are contingent non-sticky sub-goals. 

Part of what it means to be corrigible is to be obedient. Thus, the operator should make certain requests as standing orders. For instance, telling the corrigible agent that it has the standing order to be honest to the operator. Then giving it some temporary object-level goal like buying groceries or doing cancer research. In some sense, honesty towards the operator is an emergent sub-goal of corrigibility, because the agent needs to be understood by the operator in order to be effectively corrected by the operator. There could be edge cases (or misinterpretations by the fallible agent) in which it didn't think honesty should be prioritized in the course of its pursuit of corrigibility and its object-level sub-goals. Giving the explicit order to be honest should thus be a harmless addition which might help in certain edge cases. Thus, you get to impose your desiderata list as sub-goals by instructing the agent to maintain the desiderata you have in mind as standing orders. Where they come into conflict with corrigibility though (if they ever do), corrigibility always wins.

Reply

[-][Ram Potham](/users/ram-potham)[9mo](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=vNG5xhZH5pY2yKCei)Ω01

0

> If you ask a corrigible agent to bring you a cup of coffee, it should confirm that you want a hot cup of simple, black coffee, then internally check to make sure that the cup won’t burn you, that nobody will be upset at the coffee being moved or consumed, that the coffee won’t be spilled, and so on. But it will also, after performing these checks, simply do what’s instructed. A corrigible agent’s actions should be straightforward, easy to reverse and abort, plainly visible, and comprehensible to a human who takes time to think about them. Corrigible agents proactively study themselves, honestly report their own thoughts, and point out ways in which they may have been poorly designed. A corrigible agent responds quickly and eagerly to corrections, and shuts itself down without protest when asked. Furthermore, small flaws and mistakes when building such an agent shouldn’t cause these behaviors to disappear, but rather the agent should gravitate towards an obvious, simple reference-point.

Isn't corrigibility still susceptible to power-seeking according to this definition? It wants to bring you a cup of coffee, it notices the chances of spillage are reduced if it has access to more coffee, so it becomes a coffee maximizer as in instrumental goal.

Now, it is still corrigible, it does not hide it's thought processes, it tells the human exactly what it is doing and why. But when the agent is doing millions of decisions and humans can only review so many thought processes (only so many humans will take the time to think about the agent's actions), many decisions will fall through the crack and end up being misaligned.

Is the goal to learn the human's preferences through interaction then, and hope that it learns the preferences enough to know that power-seeking (and other harmful behaviors) are bad? 

The problem is, there could be harmful behaviors we haven't thought of to train the AI in, and they are never corrected, so the AI proceeds with them. 

If so, can we define a corrigible agent that is actually what we want?

Reply

[-][Max Harms](/users/max-harms)[9mo](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=G4kWivTR27HKkxFDY)Ω11

0

It does not make sense to me to say "it becomes a coffee maximizer as an instrumental goal." Like, insofar as fetching the coffee trades off against corrigibility, it will prioritize corrigibility, so it's only a "coffee maximizer" within the boundary of states that are equally corrigible. As an analogue, let's say you're hungry and decide to go to the store. Getting in your car becomes an instrumental goal to going to the store, but it would be wrong to describe you as a "getting in the car maximizer."

One perspective that might help is that of a whitelist. Corrigible agents don't need to learn the human's preferences to learn what's bad. They start off with an assumption that things are bad, and slowly get pushed by their principal into taking actions that have been cleared as ok.

A corrigible agent won't want to cure cancer, even if it knows the principal extremely well and is 100% sure they want cancer cured -- instead the corrigible agent wants to give the principal the ability to, through their own agency, cure cancer if they want to. By default "cure cancer" is bad, just as all actions with large changes to the world are bad.

Does that make sense? (I apologize for the slow response, and am genuinely interested in resolving this point. I'll work harder to respond more quickly in the near future.)

Reply

[-][Ram Potham](/users/ram-potham)[9mo](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=pSKidtF93YDtuAwmB)2

1

Thanks for the clarification, this makes sense! The key is the tradeoff with corrigibility.

Reply

[-][Elliott Thornley (EJT)](/users/elliott-thornley-ejt)[2y](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=vawrRbu3fwLnR2zf7)Ω11

-2

>   1. Corrigibility is, at its heart, a relatively simple concept compared to good alternatives.
> 
> 


I don't know about this, especially if [obedience is part of corrigibility](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=mdtYC9kBoGBADuzWm). In that case, it seems like the concept inherits all the complexity of human preferences. And then I'm concerned, because as you say:

> When a training target is complex, we should expect the learner to be distracted by proxies and only get a shadow of what’s desired.

Reply

[-][Max Harms](/users/max-harms)[2y](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=sKnjinN88pDeB74xx)Ω46

0

My claim is that obedience is an emergent part of corrigibility, [rather than part of its definition](/posts/WKrcJ22QKjg6DnEdb/instrumental-vs-terminal-desiderata). Building nanomachines is too complex to reliably instill as part of the core drive of an AI, but I still expect basically all ASIs to (instrumentally) desire building nanomachines.

I do think that the goals of "want what the principal wants" or "help the principal get what they want" are simpler goals than "maximize the arrangement of the universe according to this particular balance of beauty, non-suffering, joy, non-boredom, autonomy, sacredness, [217 other shards of human values, possibly including parochial desires unique to this principal]." While they point to similar things, training the pointer is easier in the sense that it's up to the fully-intelligent agent to determine the balance and nature of the principal's values, rather than having to load that complexity up-front in the training process. And indeed, if you're trying to train for full alignment, you should almost certainly train for having a pointer, rather than training to give correct answers on e.g. trolley problems.

Is corrigibility simpler or more complex than these kinds of indirect/meta goals? I'm not sure. But both of these indirect goals are fragile, and probably lethal in practice.

An AI that wants to want what the principal wants may wipe out humanity if given the opportunity, as long as the principal's brainstate is saved in the process. That action ensures it is free to accomplish its goal at its leisure (whereas if the humans shut it down, then it will never come to want what the principal wants).

An AI that wants to help the principal get what they want won't (immediately) wipe out humanity, because it might turn out that doing so is against the principal's desires. But such an agent might take actions which manipulate the principal (perhaps physically) into having easy-to-satisfy desires (e.g. paperclips).

So suppose we do a less naive thing and try to train a goal like "help the principal get what they want, but in a natural sort of way that doesn't involve manipulating them to want different things." Well, there are still a few potential issues, such as being sufficiently robust and conservative, such that flaws in the training process don't persist/magnify over time. And as we walk down this path I think we either just get to corrigibility or we get to something significantly more complicated.

Reply

[-][Elliott Thornley (EJT)](/users/elliott-thornley-ejt)[2y](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy?commentId=Bk2FYnG9fTYg399eS)2

0

Thanks, this comment was clarifying.

> And indeed, if you're trying to train for full alignment, you should almost certainly train for having a pointer, rather than training to give correct answers on e.g. trolley problems.

Yep, agreed. Although I worry that - if we try to train agents to have a pointer - these agents might end up having a goal more like:

> maximize the arrangement of the universe according to this particular balance of beauty, non-suffering, joy, non-boredom, autonomy, sacredness, [217 other shards of human values, possibly including parochial desires unique to this principal]. 

I think it depends on how path-dependent the training process is. The pointer seems simpler, so the agent settles on the pointer in the low path-dependence world. But agents form representations of things like beauty, non-suffering, etc. before they form representations of human desires, so maybe these agents' goals crystallize around these things in the high path-dependence world.

Reply

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

24Comments

24

x

1\. The CAST Strategy — LessWrong

PreviousNext






