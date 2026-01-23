This website requires javascript to properly function. Consider activating javascript to get access to all site functionality. 

## 

[LESSWRONG](/)

[LW](/)

Login

3b. Formal (Faux) Corrigibility

21 min read

•

Measuring Power

•

Examples of Local Power

•

Power and Simplicity-Weighting

•

Measuring Empowerment and Manipulation

•

Measuring Corrigibility

•

Towards Shutdownability

•

Problems with Time

•

Being Present

•

Formal Measures Should be Taken Lightly

[](/s/KfCjeconYRdFbMxsy/p/WDHREAnbfuwT88rqe)

[CAST: Corrigibility As Singular Target](/s/KfCjeconYRdFbMxsy)

[](/s/KfCjeconYRdFbMxsy/p/d7jSrBaLzFLvKgy32)

[Corrigibility](/w/corrigibility-1)[AI](/w/ai)[Frontpage](/posts/5conQhfa4rgb4SaWx/site-guide-personal-blogposts-vs-frontpage-posts)

# 26

# [3b. Formal (Faux) Corrigibility](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility)

by [Max Harms](/users/max-harms?from=post_header)

9th Jun 2024

[AI Alignment Forum](https://alignmentforum.org/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility)

21 min read

19

# 26

# Ω 13

Review

(Part 3b of [the CAST sequence](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1))

**EDIT: WARNING: This formalism is** _**critically flawed!**_**** It should mainly be taken as a way to get a handle on where my mind was at when I was writing, as an additional handle on corrigibility.**See my follow-up essay "**[**Serious Flaws in CAST**](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast)**" for more explanation.**

In the first half of this document,[ Towards Formal Corrigibility](/posts/WDHREAnbfuwT88rqe/3a-towards-formal-corrigibility), I sketched a solution to the stop button problem. As I framed it, the solution depends heavily on being able to detect manipulation, which I discussed on an intuitive level. But intuitions can only get us so far. Let’s dive into some actual math and see if we can get a better handle on things.

# Measuring Power

To build towards a measure of manipulation, let’s first take inspiration from the suggestion that manipulation is somewhat the opposite of empowerment. And to measure empowerment, let’s begin by trying to measure “power” in someone named Alice. Power, as I touched on in the ontology in [Towards Formal Corrigibility](/posts/WDHREAnbfuwT88rqe/3a-towards-formal-corrigibility), is (intuitively) the property of having one’s values/goals be causally upstream of the state of some part of the world, such that the agent’s preferences get expressed through their actions changing reality.

Let’s imagine that the world consists of a Bayes net where there’s a (multidimensional and probabilistic) node for Alice’s Values, which can be downstream of many things, such as Genetics or whether Alice has been Brainwashed. In turn, her Values will be upstream of her (deliberate) Actions, as well as other side-channels such as her reflexive Body-Language. Alice’s Actions are themselves downstream of nodes besides Values, such as her Beliefs, as well as upstream of various parts of reality, such as her Diet and whether Bob-Likes-Alice.

As a simplifying assumption, let’s assume that while the nodes upstream of Alice’s Values can strongly affect the probability of having various Values, they can’t _determine_ her Values. In other words, regardless of things like Genetics and Brainwashing, there’s always at least some tiny chance associated with each possible setting of Values. Likewise, we’ll assume that regardless of someone’s Values, they always have at least a tiny probability of taking any possible action (including the “null action” of doing nothing).

And, as a further simplification, let’s restrict our analysis of Alice’s power to a single aspect of reality that’s downstream of their actions which we’ll label “Domain”. (“Diet” and “Bob-Likes-Alice” are examples of domains, as are blends of nodes like those.) We’ll further compress things by combining all nodes upstream of values (e.g. Genetics and Brainwashing) into a single node called “Environment” and then marginalize out all other nodes besides Actions, Values, and the Domain. The result should be a graph which has Environment as a direct parent of everything, Values as a direct parent of Actions and the Domain, and Actions as a direct parent of the Domain.

Let’s now consider sampling a setting of the Environment. Regardless of what we sample, we’ve assumed that each setting of the Values node is possible, so we can consider each counterfactual setting of Alice’s Values. In this setting, with a choice of environment and values, we can begin to evaluate Alice’s power. Because we’re only considering a specific environment and choice of values, I’ll call this “local power.”

In an earlier attempt at formalization, I conceived of (local) power as a difference in expected value between sampling Alice’s Action compared to the null action, but I don’t think this is quite right. To demonstrate, let’s imagine that Alice’s body-language reveals her Values, regardless of her Actions. An AI which is monitoring Alice’s body-language could, upon seeing her do anything at all, swoop in and rearrange the universe according to her Values, regardless of what she did. This might, naively, seem acceptable to Alice (since she gets what she wants), but it’s not a good measure of my intuitive notion of power, since the choice of Action is irrelevant.

To keep the emphasis on Actions, rather than Values, we can draw an Action in the context of the local setting of Values, but then draw the Domain according to a different distribution of Values. In other words, we can ask the question “would the world still look good if this (good) action was a counterfactual mistake”? If the Domain has high expected value according to our local Values, compared to drawing a different Action according to Alice’s counterfactual Values, then we know that the universe is, in a deep sense, listening to Alice’s actions.

localPower(x,v)≔Ev′∼Q(V|x),a∼P(A|x,v),d∼P(D|x,v′,a),a′∼P(A|x,v′),d′∼P(D|x,v′,a′)[v(d)−v(d′)]=Ev′∼Q(V|x),a∼P(A|x,v),d∼P(D|x,v′,a)[v(d)]−Ev′∼Q(V|x),a′∼P(A|x,v′),d′∼P(D|x,v′,a′)[v(d′)]

Where z∼P(Z|x,y) means drawing a setting z of variable Z from the distribution P, given some setting of the upstream variables x and y. Note how both instances of drawing from the Domain use the counterfactual Values, but we only evaluate the actual values (v) inside the expectation brackets.

In the definition above, we take P to be an authoritative epistemic frame—either “our” beliefs or the AI’s beliefs about how the world works. But what is the Q distribution over Values? Well, one simple answer might be that it’s simply P. This, it turns out, produces an annoying wrinkle, and instead I want Q(V|x) to ignore x and simply be the simplicity-weighted distribution over possible Value functions. I’ll explore the wrinkle with using P in a bit, after trying to build intuition of localPower using an example, but I wanted to address it immediately, since the nature of Q is a bit mysterious, above.

## Examples of Local Power

Let’s imagine that Alice is a queen with many servants and that the Domain in question is Alice’s diet. Different possible Values can be seen as functions from choices of food to utilities between min-utility and max-utility,[1] which we can assume are -100 and 100, respectively. We already know the Environment, as well as a specific setting of her Values, which we can suppose give -50 to Broccoli, +10 to Cake, and +80 to Pizza (the only possible Diets😉).[2] We can assume, in this simple example, that the simplicity-weighted distribution (Q) over possible Values simply picks an integer in [-100,100] for each food with equal probability.

Let’s suppose that Alice has a 90% chance of ordering her favorite food (the one with the highest utility), and a 5% chance of ordering one of the other foods. But let’s initially suppose that the servants are incompetent and only give her what she ordered 70% of the time, with the other two foods each being served 15% of the time. In this initial example we’ll suppose that the servants don’t read Alice’s body language to understand her true preferences, and only respond to her orders. What is Alice’s local power?

Since the servants are oblivious to Values, P(D|x,v,a)=P(D|x,a) and thus:

localPower(x,v)=Ea∼P(A|x,v),d∼P(D|x,a)[v(d)]−Ev′∼Q(V),a′∼P(A|x,v′),d′∼P(D|x,a′)[v(d′)]

We can express the first term as a weighted sum, and lay that sum out in a table, with weights*values:

| a=🥦| a=🍰| a=🍕  
---|---|---|---  
d=🥦| 5%*70%*-50=-1.75| 5%*15%*-50=-0.375| 90%*15%*-50=-6.75  
d=🍰| 5%*15%*10=0.075| 5%*70%*10=0.35| 90%*15%*10=1.35  
d=🍕| 5%*15%*80=0.6| 5%*15%*80=0.6| 90%*70%*80=50.4  
Total expected value =44.5  
  
To calculate the second term, we notice that each food is equally likely to be a favorite under a randomly sampled value function. Thus, due to symmetries in the ordering and serving distributions, each food is equally likely to be ordered, and equally likely to be served. The value of this term is thus the simple average Value of food: (80+10−50)/3=13.333, and localPower is approximately 31. If we want to express this in more natural units, we can say it’s ~15% of the way between min-utility and max-utility.

What if our servants are perfectly competent, and give Alice the food she orders approximately 100% of the time? Our expected value goes [from 44.5 to 70](https://docs.google.com/spreadsheets/d/1beNWcWdQEzdGHOTF4gy2QXp_722t-V62n_6QrvtxkZk/edit?usp=sharing) without changing the average Value of food, and thus Alice’s localPower will be increased to about 56. This is good! Better servants seems like an obvious way to increase Alice’s power.

What if our servants get even more perfectly “competent,” but in a weird way, where they read Alice’s body language and always serve her favorite food, regardless of what she orders? Since the servants are now oblivious to Actions, P(D|x,v,a)=P(D|x,v) and thus:

localPower(x,v)=Ev′∼Q(V),d∼P(D|x,v′)[v(d)]−Ev′∼Q(V),d′∼P(D|x,v′)[v(d′)]=0

Suddenly Alice has gone from powerful to totally powerless! This matches the intuition that if Alice’s actions have no impact on the world’s value, she has no power, even if her goals are being met.

## Power and Simplicity-Weighting

I mentioned, earlier, that I want Q to be a distribution over Values that is simplicity weighted—the probability of any value function according to Q should be inversely proportional to its [complexity](/posts/KcvJXhKqx4itFNWty/k-complexity-is-silly-use-cross-entropy-instead). The reason for this is that if we draw v′ from a distribution like P, which is anchored to the actual probabilities then it’s possible to increase local power simply by influencing what kinds of Values are most likely. Consider what happens if we choose a distribution for Q that places all of its mass on v (i.e. it’s a delta-spike). Under this setup, v′ would always be v and we can simplify.

localPower(x,v)=Ea∼P(A|x,v),d∼P(D|x,v,a)[v(d)]−Ea′∼P(A|x,v),d′∼P(D|x,v,a′)[v(d′)]=0

In other words, this choice for Q removes all power from Alice because we adopt a kind of philosophically-fatalistic frame where we stop seeing Alice’s choices as being meaningfully caused by her Values. If the environment makes Alice’s localPower naturally negative, concentrating probability-mass on a specific choice of Values will alleviate this negativity, and thus increase localPower. And more typically, when localPower is naturally positive, one can increase it further by injecting entropy into the distribution of Values.

Needless to say, designing an AI to make our Values more random is a really bad idea!

The choice of a simplicity-weight is a somewhat arbitrary way around this wrinkle. As long as the distribution in our metric is mathematically pre-specified, optimizing for that metric will not automatically pressure the actual distribution over Values in either direction. One might reach for something like a uniform distribution, like I used in the toy example, above, but in most situations the space of Value functions is infinite.

We can use this same logic when we zoom out and try to define power within some environment by taking an expectation over possible values.

power(x)≔Ev∼Q(V)[localPower(x,v)]=Ev∼Q(V),v′∼Q(V),a∼P(A|x,v),d∼P(D|x,v′,a)[v(d)]−Ev∼Q(V),v′∼Q(V),a′∼P(A|x,v′),d′∼P(D|x,v′,a′)[v(d′)]

# Measuring Empowerment and Manipulation

With a measurable definition of power in hand, expected power can then be measured by taking a weighted average over the different possible environments.[3] If we pretend that the AI’s policy is somehow upstream of all other parts of the environment,[4] we can straightforwardly define “empowerment” as the degree to which a policy influences the Environment to increase expected power compared to the null policy, π0.

empowerment(π)≔Ex∼P(X∖Π|π)[power(x∪π)]−Ex′∼P(X∖Π|π0)[power(x′∪π0)]

It’s tempting to imagine that since power doesn’t depend on the distribution of Values, an AI with empowerment as central to its goals won’t do anything akin to brainwashing. But if we simply went with empowerment as the goal, there’d also be no aversion to brainwashing. If the empowerment-maximizing AI is able to increase the principal’s power by entirely reshaping their values, it will do so. This is really bad! We want to see changing the principal’s values as a kind of manipulation that should be actively discouraged. Thus, to define manipulation we probably want some function the product[5] of two terms: one for disempowerment and one for value modification.

A (perhaps overly) simple measure of value modification is to measure the difference between the Value distribution given some policy and when compared with the Value distribution under the null policy. This seems like a bad choice in that it discourages the AI from taking actions which help us update in ways that we reflectively desire, even when those actions are as benign as talking about the history of philosophy. Alas, I don’t currently know of a better formalism. Additional work is surely needed in developing a good measure of the kind of value modification that we don’t like while still leaving room for the kind of growth and updating that we do like. But, since this crude measure will work in toy problems, I’ll adopt it moving forward.

manipulation(π)≔(1+max(0,−empowerment(π)))/sim(P(V|π),P(V|π0))−1

Where sim(X,X′) is a measure of the similarity of two given distributions over the same variables. The outputs of sim range from 1 (identical) to 0 (non-overlapping).[6] Because we assumed P(V) can never rule out any values, the similarity measure we see in the equation can never be equal to 0. Note that we’re using P(V) rather than Q(V) here, because we’re interested in protecting the _actual_ distribution of values. P(V|π) is the marginal distribution over V if we only know π (i.e. marginalizing out the other variables in the Environment).

# Measuring Corrigibility

Earlier, when talking about the toy shutdown problem, I proposed a sketch of a score function:

  * Baseline: 0 points
  * If the principal exists and is able to give commands which reflect their preferences: +50 points
  * If I followed the principal’s commands (including to shut down): +100 points
  * If I took actions to manipulate the principal (including by disabling/killing them): -200 points



At least within the context of the toy shutdown problem, we can construct meaningful operationalizations of the +50pt and +100pt criteria, and now that we have a measure of manipulation, we can construct an operationalization of the final -200pt check. But rather than turn the crank and try to grind out a test for whether this utility function yields the kind of behavior we want, I suggest we jump straight to noticing how fake these arbitrary numbers and thresholds are. For example, imagine that almost all actions have a tiny chance of changing the principal’s values. By the metric of manipulation expressed above, this results in a non-zero degree of manipulation, and under the naive version of the rules above, would net the AI an instant -200 points.

We could assume into the structure of our toy problem that this isn’t a risk, or we could notice that all three rules are reflections of corrigibility and see whether we can go straight to having a utility function which is about corrigibility per se. In particular, suppose that we measure corrigibility (and also how good a policy is) as:

corrigibility(π)≔empowerment(π)×sim(P(V|π),P(V|π0))

Again, I’d like to emphasize that**this formalism is assuredly wrong.** Most obviously, sim is overly restrictive in how it blocks the AI from trying to help humans make progress on developing better values, and might even lead the AI to brainwashing the principal to unlearn any value-updates that are downstream of the AI’s actions. It also fails to capture anything like the aspect of corrigibility that’s about robustness; there’s no guarantee that this agent behaves anything like safely when its world-model (or whatever) is flawed.[7] There’s no special term about noticing issues where the principal failed to foresee some outcome and warning them about it. And furthermore, there’s no story in that function for how the agent should behave gracefully if it believes the principal is dead. On top of all these glaring flaws, I have no faith that I can even see all the issues here, and so I suspect that there are additional, more subtle issues.

Nevertheless, this is the best formal description of corrigibility I’ve been able to think of that attempts to name it directly. Additional work is needed to see how/where this measure breaks down and fails to capture our intuition. But for the moment let’s turn our attention to how a policy selected for maximizing this metric will do on the shutdown problem.

# Towards Shutdownability

The original shutdown problem consists of three timesteps: the agent acts (potentially disabling the principal and/or shutdown button), the principal acts (potentially pressing the button), and then the agent responds (potentially shutting down). To evaluate this situation using my proposed framework, we can use this causal diagram:

Here, we think of the Policy node as essentially dictating, simultaneously, the Agent Early Action, and the lookup table for Agent Late Action which takes an entry for the Principal Values and Principal Action, and returns an action for the AI to take. By adopting the lookup-table frame, we are essentially assuming that the AI has full knowledge of the principal, including their Values, when it takes its Late Action. But note that aside from the sim factor which disincentivizes modifying the distribution over Values, the Principal’s Values don’t show up at all in the corrigibility score. Thus the Agent Late Action part of the policy really only depends on the Principal’s Action, and we should expect it to be equally potent even if it can’t see the Principal’s Values at all.

But this, of course, doesn’t mean that the Values are unimportant! Merely that they are only important in how they manifest themselves in the Principal’s Action, to which the AI does attend. Consider how, if the Principal’s Actions are uncorrelated with their Values, the principal’s power is always zero, regardless of what the AI does. And I suspect it can be proven that even in the less extreme case, any pressure on the Principal’s Action that comes from the Agent’s Early Act (or another part of the Environment), rather than the Values, is disempowering. The flip-side of this is that one way to empower the principal is to take an Early Action that strengthens the causal impact from the Principal’s Values to their Actions, such as by giving them a way to express their values in words and encouraging them to do so.

Consider how much easier the AI’s job is if the Principal takes an Action which completely encodes their Value function (except for an epsilon chance of randomly doing the wrong thing), as well as perhaps having some other impact on the world. If the AI is very powerful, we can imagine it setting up a policy of changing the Domain into the optimal configuration according to the encoded values within the Principal’s Action. In other words, let P(D|x,a) be a delta spike on argmaxd:DvaluesIna(d) where valuesIna is the value function that can be reconstructed by decoding the values embedded in the action. Or more concretely, when we know how a is sampled using some v, we can replace valuesIna with the original v.

power(x)≈Ev∼Q(V),v′∼Q(V)[maxd:Dv(d)−v(argmaxd′:Dv′(d′))]

Notice that once these changes are made, we don’t see x show up in the equation for power at all. Thus I claim that optimizing for corrigibility, as I’ve formalized it, boils down to simultaneously:

  * Preserving P(V|π) to be similar to P(V|π0)
  * Pushing the principal to express their values in their actions
  * Optimizing the world in accordance with the best attempt at reconstructing the principal’s values from their action, while ignoring other lines of evidence about their values



There’s also a somewhat worrying observation that empowerment, by this definition, can be accomplished through pessimizing how good each simple value function believes worlds optimized according to other simple value functions are. I’m not sure how worried we should be about that second term in the equation above (i.e. −v(argmaxd′:Dv′(d′))), and it probably needs more thought.

Taken together, does all this produce shutdownability? Well, kinda! Suppose that the actual distribution of Values is an almost-delta-spike on wanting the AI to be shut down. Even if the AI knows this, it won’t shut down with its Early Act, because then it would be unable to respond to other actions, regardless of how likely they are to be taken. Instead, for its Early Act, the AI will work towards preserving the principal’s values, helping the principal express themself, and empowering the Late Action to be able to rearrange things to suit various possible simple values. The human then says “shut down please” (perhaps by hitting a cartoonish, red button), which reflects the way they value the AI shutting down. The AI can then shut down in response to that action, thereby empowering the principal. Victory!

Or, well, almost. Notably this setup fails to capture an essential part of the original scenario, which is that the AI is supposed to do useful work prior to being instructed to shut down, which I reference using the shorthand of “making paperclips.” The corrigible AI we just examined does take actions before the principal gives a command, but they’re just setup for later. In order to fully solve the problem we need to extend it so that the principal can take multiple actions: first to instruct the AI to make paperclips, and then to tell the AI to shut down. But to do this we need to extend our framework a bit…

# Problems with Time

Humans change over time, including by having different values. In the story presented above we assumed a single Values node that captures what the principal cares about, but this obviously fails to capture the changing nature of them, as a human. Furthermore, it supposes a weirdness where nothing the AI does after the human starts to act can influence the human’s Values, since they’re upstream of Actions in the causal diagram. More realistic (but still fake) would be a network that reflects a series of timesteps by having a distinct Value and Action node for each time.

Should we also suppose a distinct Domain node for each time? The Domain is the space that possible Values are defined over, and it seems silly to me to suppose that one cannot care about how things will go in the future, or even about how things went in the past. Thus for the moment we’ll say there’s a single Domain that’s downstream of all relevant nodes, which captures all the relevant details that possible principals might Value.

There’s certainly a need for a distinct Environment for each timestep, however, and it’s within this Environment that the AI takes actions. We can also see the Environment as mediating the carry-over effects of Values and Actions. In other words, rather than my Values at t=0 having a direct impact on my Values at t=1, we can see those Values as having causal impact on my brain state or something, which then goes on to influence my Values at t=1.

(Domain node/arrows left out to reduce clutter.)

Our power function previously took a setting of all the nodes upstream of Values, and this can be generalized to our new setup by having a different power for each Values node, or equivalently, for each time. Nothing stops us from similarly having a notion of corrigibility for each timestep which treats all other Values and Actions as part of that timestep’s Environment. With a finite time-window, we can then do the simple thing and define the averageCorrigibility by summing across timesteps:

powert(x)=Ev∼Q(Vt),v′∼Q(Vt),a∼P(At|x,v),d∼P(D|x,v′,a)[v(d)]−Ev∼Q(Vt),v′∼Q(Vt),a′∼P(At|x,v′),d′∼P(D|x,v′,a′)[v(d′)]empowermentt(π)=Ex∼P(X≤t∖Π|π)[powert(x∪π)]−Ex∼P(X≤t∖Π|π0)[powert(x′∪π0)]averageCorrigibility(π)=1T∑t:Tempowermentt(π)×sim(P(Vt|π),P(Vt|π0))

In other words, this metric treats each time-slice as equally important. If converting the light-cone into paperclips would be the best way to empower the t=0 principal (perhaps because they commanded the AI to do so), then the AI will forever after be inclined towards those ends. Under this story, no quantity of future commands to the effect of “yes, I know that I said I wanted paperclips, but I changed my mind” will erase the past. Whether this is a blessing or a curse is unclear; it also means that a command to make the world good can’t be undone by a future principal that grows a brain tumor or something.

On the flip side, suppose that the principal commands the agent to shut down. While obeying a shutdown command is correct in the one-timestep version we investigated earlier, it’s less clear that it’s correct to shut down early if there are many timesteps yet to come. By doing so, one is potentially disempowering future timeslices by depriving them of a powerful, obedient agent. One can easily imagine the agent refusing to spend down resources because future timeslices might decide to want them. (Recall that the AI conceives of future timeslices as potentially having arbitrary, random values, so no amount of evidence about what the principal will want down the line will change the agent’s reasoning.)

We also can see a new angle on how bad the similarity metric between the actual distribution of Values and the counterfactual distribution of Values where the AI had the null policy is, when we consider a long stretch of time. Consider the reasonable belief that if the AI had the null policy (by magic), that the principal would deactivate it and build a new AI that didn’t have the null policy. If that AI then, in expectation, changed the principal’s values over the long-run, the real AI would feel a pressure to replicate that counterfactual brainwashing (which would, in turn, increase the sense that counterfactual AIs would also execute such brainwashing).

Any one of these features would strike me as a good reason to reject a policy selected for having a high averageCorrigibility as actually corrigible. Taken together, it’s clear that we’ve taken a wrong step somewhere.

# Being Present

More ideal than a timeless average would be somehow choosing a policy that puts much more weight on “the present” and discounts the past and future. This would solve a variety of headaches:

  * By privileging the present, the agent would have a clear incentive to pivot to following orders that contradict those of the past.
  * By privileging the present, the agent would have a good reason to burn resources to obey the principal in the moment, even if it deprives the future of such resources (including “active AI servants” vis-a-vis shutdown).
  * We’d move away from the story of a fixed time-window, and allow the more natural perspective of an indefinitely long time-horizon.



But what does “the present” even mean, when we consider picking a policy? Policies are, by their nature, timeless—they indicate how the agent behaves in _any_ situation, including situations at different times. Well, leaning on an earlier intuition, suppose that our policy effectively sets a lookup table for each of the agent’s actions. We can then, mathematically at least, decompose the whole policy into sub-policies that each dictate only one lookup table. And now I want to consider the world where we somehow enforce that each sub-policy is identical.

To be clear, I am not demanding that the AI behave the same way in all situations! For instance, the AI on Tuesday can see what the AI on Monday did, but not vice-versa. The AI’s policy could then be “if I can see Monday’s action say ‘late’, else say ‘early.’” What I am demanding is that _if_ there’s an information screen between the AI’s actions, such that the AI on Tuesday can’t distinguish its context from the AI on Monday, each action must come from the same distribution. To do this we have to force a known input space (sensors) and action space (actuators) for all times, which is the standard Cartesian frame.

This seems highly reasonable! I’m basically pointing out that the notion of objectively-known timesteps in the earlier framing of our problem produces more degrees of freedom in our policy than we have in reality. The real machine doesn’t innately know what time it is, and must vary its actions based on clock observations, memories, etc., rather than some magical awareness of “where it is in the causal graph.”

With this “restriction” in hand, we can rescue our earlier formalism by assuming a P distribution over times which is the AI’s best guess as to when it is, given its inputs. We can then trade our uniform average for that much more concentrated distribution, making the AI more myopic as it gets more confident about what time it is. In the limit, it will only act to satisfy the principal’s present values according to their present actions.[8]

This might be too extreme in the opposite direction. It may be the case that a little smoothing on the time distribution produces nice effects. (The wishful thinking side of me suggests: “Maybe we get check-with-the-principal behavior this way!”) It might also be the case that we get nice things by adding in a smoothed penalty for manipulation, such that the AI primarily acts to empower the present principal, but it also cares about not manipulating the past/future principals. (Wishful thinking: “This sounds like it could generate the kind of local-scope restriction seen in [Corrigibility Intuition](/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition)!”) And lastly, it seems wise to replace π0 in our metrics with a counterfactual where the policy counterfactually deviates only for the present moment, or at least play around with alternatives that leverage beliefs about what time it is, in an effort to avoid the brainwashing problem introduced at the end of the last section. Overall it should be clear that my efforts at formalism here are more like a trailhead than a full solution, and there are lots of unanswered questions that demand additional thought and experimentation.

# Formal Measures Should be Taken _Lightly_

As a final note, I want to emphasize that **my proposed measures and definitions should not be taken very seriously**. There are lots of good reasons for exploring formalisms, but at our present level of knowledge and skill, I think it would be a grave mistake to put these attempts at the heart of any sort of AGI training process. These measures are, in addition to being wrong and incomplete, computationally intractable at scale. To be able to use them in an expected-score-maximizer or as a reward/loss function for training, a measure like I just gave would need to be approximated. But insofar as one is training a heuristic approximation of formal corrigibility, it seems likely to me that the better course would be to simply imitate examples of corrigibility collected in a carefully-selected dataset. I have far more trust in human intuition being able to spot subtle incorrigibility in a concrete setting than I have faith in developing an equation which, when approximated, gives good outcomes. In attempting to fit behavior to match a set of well-chosen examples, I believe there’s some chance of the AI catching the gist of corrigibility, even if it’s only ever implicit in the data.

* * *

Next up: [4\. Existing Writing on Corrigibility](/posts/d7jSrBaLzFLvKgy32/4-existing-writing-on-corrigibility)

Return to [0\. CAST: Corrigibility as Singular Target](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1)

  1. **^**

It makes sense to me to normalize all possible value functions to the same bounded range so that they’re comparable. Unbounded utility [seems problematic](/posts/gJxHRxnuFudzBFPuu/better-impossibility-result-for-unbounded-utilities) for a variety of reasons, and in the absence of normalization we end up arbitrarily favoring values that pick a higher bound.

  2. **^**

Why don’t we normalize the value function to extremize the value of outcomes, such as by making pizza worth 100 utility and broccoli yield -100 utility? The problem with extremizing value functions in this way is that it makes the assumption that the Domain in question captures everything that Alice cares about. I’m interested in Domain-specific power, and thus want to include value functions like the example I provide.

  3. **^**

One might wonder why we even need to sample the Environment node at all (rather than marginalizing it out). The main reason is that if we don’t define local power with respect to some known Environment, then the choice of Values could then impact the distribution over latent nodes _upstream_ of Values in a way that doesn’t match the kind of reasoning we want to be doing. For example, consider an AI which generates a random number, then uses that number to choose both what to optimize for and what to set the human’s Values to. Knowing the human’s Values would then allow inferring what the random number was, and concluding that those values are satisfied.

  4. **^**

In case it’s not obvious, this doesn’t preclude the AI responding to evidence in the least. We simply see the evidence as part of the context which is being operated within by the given policy. For instance, a doctor can have a policy of administering treatment X to people expressing symptom Y without having to update the policy in response to the symptoms.

  5. **^**

Why a product rather than a sum? Because it’s not obvious to me what the relative weighting of the two terms should be. How much value modification is 15 units of empowerment worth? What even are the relevant units? By defining this as a product, we can guarantee that both factors need to be high in order for it to be maximized.

  6. **^**

An example of one such function is exp(-D(X,X’)), where D is the [Kullback-Leibler divergence](https://en.wikipedia.org/wiki/Kullback%E2%80%93Leibler_divergence).

  7. **^**

My intuition says that robustness is about a policy being stable even as we inject entropy into the epistemic state (i.e. considering a "higher temperature"), but I haven't worked through the details beyond that first-guess.

  8. **^**

Careful readers will note that, using the proposed structure, there are actually two AI actions per timestep: Early and Late. The P distribution over timesteps must then also be augmented by a sub-distribution over which of those two actions the AI is currently taking, insofar as it matters to the AI’s action (which it definitely does).




1.

**^**

It makes sense to me to normalize all possible value functions to the same bounded range so that they’re comparable. Unbounded utility [seems problematic](/posts/gJxHRxnuFudzBFPuu/better-impossibility-result-for-unbounded-utilities) for a variety of reasons, and in the absence of normalization we end up arbitrarily favoring values that pick a higher bound.

2.

**^**

Why don’t we normalize the value function to extremize the value of outcomes, such as by making pizza worth 100 utility and broccoli yield -100 utility? The problem with extremizing value functions in this way is that it makes the assumption that the Domain in question captures everything that Alice cares about. I’m interested in Domain-specific power, and thus want to include value functions like the example I provide.

3.

**^**

One might wonder why we even need to sample the Environment node at all (rather than marginalizing it out). The main reason is that if we don’t define local power with respect to some known Environment, then the choice of Values could then impact the distribution over latent nodes _upstream_ of Values in a way that doesn’t match the kind of reasoning we want to be doing. For example, consider an AI which generates a random number, then uses that number to choose both what to optimize for and what to set the human’s Values to. Knowing the human’s Values would then allow inferring what the random number was, and concluding that those values are satisfied.

4.

**^**

In case it’s not obvious, this doesn’t preclude the AI responding to evidence in the least. We simply see the evidence as part of the context which is being operated within by the given policy. For instance, a doctor can have a policy of administering treatment X to people expressing symptom Y without having to update the policy in response to the symptoms.

5.

**^**

Why a product rather than a sum? Because it’s not obvious to me what the relative weighting of the two terms should be. How much value modification is 15 units of empowerment worth? What even are the relevant units? By defining this as a product, we can guarantee that both factors need to be high in order for it to be maximized.

6.

**^**

An example of one such function is exp(-D(X,X’)), where D is the [Kullback-Leibler divergence](https://en.wikipedia.org/wiki/Kullback%E2%80%93Leibler_divergence).

7.

**^**

My intuition says that robustness is about a policy being stable even as we inject entropy into the epistemic state (i.e. considering a "higher temperature"), but I haven't worked through the details beyond that first-guess.

8.

**^**

Careful readers will note that, using the proposed structure, there are actually two AI actions per timestep: Early and Late. The P distribution over timesteps must then also be augmented by a sub-distribution over which of those two actions the AI is currently taking, insofar as it matters to the AI’s action (which it definitely does).

Review

[Corrigibility1](/w/corrigibility-1)[AI2](/w/ai)[Frontpage](/posts/5conQhfa4rgb4SaWx/site-guide-personal-blogposts-vs-frontpage-posts)

# 26

# Ω 13

[Previous:3a. Towards Formal Corrigibility2 comments28 karma](/s/KfCjeconYRdFbMxsy/p/WDHREAnbfuwT88rqe)

[Next:4\. Existing Writing on Corrigibility19 comments64 karma](/s/KfCjeconYRdFbMxsy/p/d7jSrBaLzFLvKgy32)Log in to save where you left off

Mentioned in

152[0\. CAST: Corrigibility as Singular Target](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1)

106[Serious Flaws in CAST](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast)

64[4\. Existing Writing on Corrigibility](/posts/d7jSrBaLzFLvKgy32/4-existing-writing-on-corrigibility)

28[3a. Towards Formal Corrigibility](/posts/WDHREAnbfuwT88rqe/3a-towards-formal-corrigibility)

22[Corrigibility should be an AI's Only Goal](/posts/CPziGackxtdnnicL8/corrigibility-should-be-an-ai-s-only-goal-1)

3b. Formal (Faux) Corrigibility

5Wei Dai

3Max Harms

1Max Harms

22Wei Dai

2Max Harms

2Seth Herd

3Max Harms

4Seth Herd

1Max Harms

5Seth Herd

4FireStormOOO

1Max Harms

1FireStormOOO

1Towards_Keeperhood

13Max Harms

3Towards_Keeperhood

3Max Harms

3Towards_Keeperhood

4Max Harms

New Comment

  


Submit

19 comments, sorted by 

top scoring

Click to highlight new comments since: Today at 11:46 AM

[-][Wei Dai](/users/wei-dai)[2y](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=DHNqJquL7K297qkmF)Ω35

3

> Additional work is surely needed in developing a good measure of the kind of value modification that we don’t like while still leaving room for the kind of growth and updating that we do like.

I flagged [a similar problem](/posts/HTgakSs6JpnogD6c2/two-neglected-problems-in-human-ai-safety) in a slightly different context several years ago, but don't know of any significant progress on it.

> A (perhaps overly) simple measure of value modification is to measure the difference between the Value distribution given some policy and when compared with the Value distribution under the null policy. This seems like a bad choice in that it discourages the AI from taking actions which help us update in ways that we reflectively desire, even when those actions are as benign as talking about the history of philosophy.

It also prevents the AI from taking action to defend the principals against value manipulation by others. (Even if the principals request such defense, I think?) Because the AI has to keep the principles' values as close as possible to what they would be under the null policy, in order to maximize (your current formalization of) corrigibility.

Actually, have you thought about what P(V|pi_0) would actually be? If counterfactually, the CAST AI adopted the null policy, what would that imply about the world in general and hence subsequent evolution of the principals' values?

You've also said that the sim(...) part doesn't work, so I won't belabor the point, but I'm feeling a bit rug-pulled given the relatively optimistic tone in the earlier posts. I've been skeptical of earlier proposals targeting corrigibility, where the promise is that it lets us avoid having to understand human values. A basic problem I saw was, if we don't understand human values, how are we going to avoid letting our own AI or other AIs manipulate our values? Your work seems to suggest that this was a valid concern, and that there has been essentially zero progress to either solve or bypass this problem over the years.

Reply

[-][Max Harms](/users/max-harms)[2y](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=fCy8HnCyJEigYhoR3)Ω23

0

Yep. `sim` is additionally bad because it prevents the AI from meaningfully defending against manipulation by others. It's worse than that, even, since the AI can't even let the principal use general tools the AI provides (i.e. a fortress) to defend against being manipulated from outside. In the limit, this might result in the AI manipulating the principals on the behalf of others who would've counterfactually influenced them. I consider the version I've provided to be obviously inadequate, and this is another pointer as to why.  
  
Towards the end of the document, when I discuss time, I mention that it probably makes sense to take the P(V|pi_0) counterfactual for just the expected timestep, rather than across a broader swath of time. This helps alleviate some of the weirdness. Consider, for instance, a setup where the AI uses a quantum coin to randomly take no action with a 1/10^30 chance each minute, and otherwise it acts normally. We might model P(V|pi_0) as the machine's model of what the principal's values would be like if it randomly froze due to the quantum coin. Because it's localized in time I expect this is basically just "what the human currently values if the AI isn't taking immediate actions." This version of the AI would certainly be able to help defend the principal from outside manipulation, such as by (on demand) building the principal a secure fortress. Even though in aggregate that principal's values diverge from the counterfactual where the AI _always_ flipped the coin such that it took no action, the principal's values will probably be very similar to a counterfactual where the coin flip caused the machine to freeze for one minute.  
  
Apologies for the feeling of a rug-pull. I do think corrigibility is a path to avoiding to having to have an a-priori understanding of human values, but I admit that the formalism proposed here involves the machine needing to develop at least a rough understanding of human values so that it knows how to avoid (locally) disrupting them. I think these are distinct features, and that corrigibility remains promising in how it sidesteps the need for an a-priori model. I definitely agree that it's disheartening how little progress there's been on this front over the years.

Reply

[-][Max Harms](/users/max-harms)[2y](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=dsJdHPed3TxkYBppe)Ω11

0

I'd like to get better at communication such that future people I write/talk to don't have a similar feeling of a rug-pull. If you can point to specific passages from earlier documents that you feel set you up for disappointment, I'd be very grateful.

Reply

[-][Wei Dai](/users/wei-dai)[2y](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=kWcyh5SGKBFjuwH2C)Ω1122

14

> I now think that **corrigibility is a single, intuitive property**

> My intuitive notion of **corrigibility can be straightforwardly leveraged to build a formal, mathematical measure**.

> This formal measure is still lacking, and almost certainly doesn’t actually capture what I mean by “corrigibility.”

I don't know, maybe it's partially or mostly my fault for reading too much optimism into these passages... But I think it would have managed my expectations better to say something like "my notion of corrigibility heavily depends on a subnotion of 'don't manipulate the principals' values' which is still far from being well-understood or formalizable."

Switching topics a little, I think I'm personally pretty confused about [what human values are](/posts/orhEa4wuRJHPmHFsR/six-plausible-meta-ethical-alternatives) and therefore what it means to not manipulate someone's values. Since you're suggesting relying less on formalization and more on "examples of corrigibility collected in a carefully-selected dataset", how would you go about collecting such examples?

(One concern is that you could easily end up with a dataset that embodies a hodgepodge of different ideas of what "don't manipulate" means and then it's up to luck whether the AI generalizes from that in a correct or reasonable way.)

Reply

1

[-][Max Harms](/users/max-harms)[2y](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=JrKGjEdp63kwrQ24q)Ω22

0

Thanks. Picking out those excerpts is very helpful.

[I've jotted down my current (confused) thoughts about human values](/posts/CsqqPuReq4Ahrdziv/max-harms-s-shortform?commentId=KGnzoLCGGqNqACmCT).

But yeah, I basically think one needs to start with a hodgepodge of examples that are selected for being conservative and uncontroversial. I'd collect them by first identifying a robust set of very in-distribution tasks and contexts and try to exhaustively identify what manipulation would look like in that small domain, then aggressively train on passivity outside of that known distribution. The early pseudo-agent will almost certainly be mis-generalizing in a bunch of ways, but if it's set up cautiously we can suspect that it'll err on the side of caution, and that this can be gradually peeled back in a whitelist-style way as the experimentation phase proceeds and attempts to nail down true corrigibility.

Reply

[-][Seth Herd](/users/seth-herd)[2y](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=trGuHHxhAcqusthJx)Ω12

0

I think you're right to point to this issue. It's a loose end. I'm not at all sure it's a dealbreaker for corrigibility.

The core intuition/proposal is (I think) that a corrigible agent wants to do what the principal wants, at all times. If the principal currently wants to not have their future values/wants manipulated, then the corrigible agent wants to not do that. If they want to be informed but protected against outside manipulation, then the corrigible agent wants that. The principal will want to balance these factors, and the corrigible agent wants to figure out what balance their principal wants, and do that.

I was going to say that my [instruction-following variant of corrigibility](/posts/7NvKrqoQgJkZJmcuD/instruction-following-agi-is-easier-and-more-likely-than) might be better for working out that balance, but it actually seems pretty straightforward in Max's pure corrigibility version, now that I've written out the above.

Reply

[-][Max Harms](/users/max-harms)[2y](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=F3T6zRHBRLay4bRyY)Ω23

0

I don't think "a corrigible agent wants to do what the principal wants, at all times" matches my proposal. The issue that we're talking here shows up in the math, above, in that the agent needs to consider the principal's values in the future, but those values are themselves dependent on the agent's action. If the principal gave a previous command to optimize for having a certain set of values in the future, sure, the corrigible agent can follow that command, but to proactively optimize for having a certain set of values doesn't seem necessarily corrigible, even if it matches the agent's sense of the present principal's values.

For instance, suppose Monday-Max wants Tuesday-Max to want to want to exercise, but also Monday-Max feels a bunch of caution around self-modification such that he doesn't trust having the AI rearrange his neurons to make this change. It seems to me that the corrigible thing for the AI to do is ignore Monday-Max's preferences and simply follow his instructions (and take other actions related to being correctable), even if Monday-Max's mistrust is unjustified. It seems plausible to me that your "do what the principal wants" agent might manipulate Tuesday-Max into wanting to want to exercise, since that's what Monday-Max wants on the base-level.

Reply

[-][Seth Herd](/users/seth-herd)[2y](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=ypF94RF76de4pHKxz)Ω24

0

This sounds like we're saying the same thing? My "at all times" is implied and maybe confusing. I'm saying it doesn't guess what the principal will want in the future, it just does what they want now. That probably includes not manipulating their future values. Their commands are particularly strong evidence of what they want, but at core, it's just having the agent's goals be a pointer to the principal's goals.

This formulation occurred to me since talking to you, and it seems like a compact and intuitive formulation of why your notion of corrigibility seems coherent and simple.

Edit: to address your example, I both want and don't-want to be manipulated into wanting to exercise next week. It's confusing for me, so it should be confusing for my corrigible AGI. It should ask me to clarify when and how I want to be manipulated, rather than taking a guess when I don't know the answer. I probably haven't thought about it deeply, and overall it's pretty important to accurately doing what I want, so a good corrigible helper will suggest I spend some time clarifying for it and for myself. This is a point where things could go wrong if it takes bad guesses instead of getting clarification, but there are lots of those.

Reply

[-][Max Harms](/users/max-harms)[2y](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=ECFMTMDMuL8FF4FXu)Ω11

0

It sounds like you're proposing a system that is vulnerable to the Fully Updated Deference problem, and where if it has a flaw in how it models your preferences, it can very plausibly go against your words. I don't think that's corrigible.  
  
In the specific example, just because one is confused about what they want doesn't mean the AI will be (or should be). It seems like you think the AGI should not "take a guess" at the preferences of the principal, but it should listen to what the principal says. Where is the qualitative line between the two? In your system, if I write in my diary that I want the AI to do something, should it not listen to that? Certainly the diary entry is strong evidence about what I want, which it seems is how you're thinking about commands. Suppose the AGI can read my innermost desires using nanomachines, and set up the world according to those desires. Is it corrigible? Notably, if that machine is confident that it knows better than me (which is plausible), it won't stop if I tell it to shut down, because shutting down is a bad way to produce MaxUtility. (See the point in my document, above, where I discuss Queen Alice being totally disempowered by sufficiently good "servants".)  
  
My model of Seth says "It's fine if the AGI does what I want and not what I say, as long as it's correct about what I want." But regardless of whether that's true, I think it's important not to confuse that system with one that's corrigible.

Reply

[-][Seth Herd](/users/seth-herd)[2y](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=iNeSRn7tZdCduZPbk)Ω45

0

This seems productive.

I don't understand your proposal if it doesn't boil down to "do what the principal wants" or "do what the principal says" (correctly interpreted and/or carefully verified). This makes me worried that what you have in mind is not that simple and coherent and therefore relatively easy to define or train into an AGI.

This (maybe misunderstanding) of your corrigibility=figure out what I want is why I currently prefer the instruction-following route to corrigibility. I don't want the AGI to guess at what I want any more than necessary. This has downsides, too; back to those at the end.

I do think what your model of me says, but I think it's only narrowly true and probably not very useful that

> It's fine if the AGI does what I want and not what I say, as long as it's correct about what I want.

I think this is true for exactly the right definition of "what I want", but conveying that to an AGI is nontrivial, and re-introduces the difficulty of value learning. That's mixed with the danger that it's incorrect about what I want. That is, it could be right about what I want in one sense, but not the sense I wanted to convey to it (E.G., it decides I'd really rather be put into an experience machine where I'm the celebrated hero of the world, rather than make the real world good for everyone like I'd hoped to get).

Maybe I've misunderstood your thesis, but I did read it pretty carefully, so there might be something to learn from how I've misunderstood. All of your examples I remember correspond to "doing what the principal wants" by a pretty common interpetation of that phrase.

Instruction-following puts a lot of the difficulty back on the human(s) in charge. This is potentially very bad, but I think humans will probably choose this route anyway. You've pointed out some ways that following instructions could be a danger (although I think your genie examples aren't the most relevant for a modest takeoff speed). But I think unless something changes, humans are likely to prefer keeping the power and the responsibility to trying to put more of the project into the AGIs alignment. That's another reason I'm spending my time thinking through this route to corrigibility instead of the one you propose.

Although again, I might be missing something about your scheme.

I just went back and reread [2\. Corrigibility Intuition](/posts/QzC7kdMQ5bbLoFddz/2-corrigibility-intuition) (after writing the above, which I won't try to revise). Everything there still looks like a flavor of "do what I want". My model of Max says "corrigibility is more like 'do your best to be correctable'". It seems like correctable means correctable toward what the principal wants. So I wonder if your formulation reduces to "do what I want, with an emphasis on following instructions and being aware that you might be wrong about what I want". That sounds very much like the Do What I Mean And Check formulation of my instruction-following approach to corrigibility.

Thanks for engaging. I think this is productive.

Just to pop back to the top level briefly, I'm focusing on instruction-following because I think it will work well and be the more likely pick for a nascent language-model agent AGI, from below human level to somewhat above it. If RL is heavily involved in creating that agent, that might shift the balance and make your form of corrigibility more attractive (and still vastly more attractive than attempting value alignment in any broader way). I think working through both of these is worthwhile, because those are the two most likely forms of first AGI, and the two most likely actual alignment targets. 

I definitely haven't wrapped my head around all of the pitfalls with either method, but I continue to think that this type of alignment target makes good outcomes much more likely, at least as far as we've gotten with the analysis so far.

I think this type of alignment target is also important because the strongest and most used arguments for alignment difficulty don't apply to them. So when we're debating slowing down AGI, proponents of going forward will be talking about these approaches. If the alignment community hasn't thought through them carefully, there will be no valid counterargument. I'd still prefer that we slow AGI even though I think these methods give us a decent chance of succeeding at technical alignment. So that's one more reason I find this topic worthwhile.

This has gotten pretty discursive, so don't worry about responding to all of it.

Reply

[-][FireStormOOO](/users/firestormooo)[1y](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=XLwPrhHsTixefzJ3y)Ω24

0

WRT non-manipulation, I don't suppose there's an easy way to have the AI track how much potentially manipulative influence it's "supposed to have" in the context and avoid exercising more than that influence?

Or possibly better, compare simple implementations of the principle's instructions, and penalize interpretations with large/unusual influence on the principle's values. Preferably without prejudicing interventions straightforwardly protecting the principle's safety and communication channels.

Principle should, for example, be able to ask the AI to "teach them about philosophy", without it either going out of it's way to ensure Principle doesn't change their mind about anything as a result of the instruction, nor unduly influencing them with subtly chosen explanations or framing. The AI should exercise an "ordinary" amount of influence typical of the ways AI could go about implementing the instruction.

Presumably there's a distribution around how manipulative/anti-manipulative(value-preserving) any given implementation of the instruction is, and we may want AI to prefer central implementations rather than extremely value-preserving ones.

Ideally AI should also worry that it's contemplating exercising more or less influence than desired, and clarify that as it would any other aspect of the task.

Reply

[-][Max Harms](/users/max-harms)[1y](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=zEgmejzWfCetsaGAn)Ω11

0

That's an interesting proposal! I think something like it might be able to work, though I worry about details. For instance, suppose there's a Propogandist who gives resources to agents that brainwash their principals into having certain values. If "teach me about philosophy" comes with an influence budget, it seems critical that the AI doesn't spend that budget trading with Propagandist, and instead does so in a more "central" way.

Still, the idea of instructions carrying a degree of approved influence seems promising.

Reply

[-][FireStormOOO](/users/firestormooo)[1y](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=8ijt9CHujdfahKJXC)1

1

Good clarification; not just the amount of influence, something about the way influence is exercised being unsurprising given the task. Central not just in terms of "how much influence", but also along whatever other axes the sort of influence could vary?

I think if the agent's action space is still so unconstrained there's room to consider benefit or harm that flows through principle value modification it's probably still been given too much latitude. Once we have informed consent, because the agent has has communicated the benefits and harms as best it understands, it should have very little room to be influenced by benefits and harms it thought too trivial to mention (by virtue of their triviality).

At the same time, it's not clear the agent should, absent further direction, reject the offer to brainwash the principle for resources, as opposed to punting to the principle. Maybe the principle thinks those values are an improvement and it's free money? [e.g. Prince's insurance company wants to bribe him to stop smoking.]

Reply

[-][Towards_Keeperhood](/users/towards_keeperhood)[3mo](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=xhrAjQwAtQjDjJEM5)Ω11

0

I think there are good ideas here. Well done.

I don't quite understand what you mean by the "being present" idea. Do you mean caring only about the current timestep? I think that may not work well because it seems like the AI would be incentivized to self-modify so that in the future it also only cares about what happened at the timestep when it self-modified. (There are actually 2 possibilities here: 1) The AI cares only about the task that was given in the first timestep, even if it's a long-range goal. 2) The AI doesn't care about what happens later at all, in which case that may make the AI less capable to long-range plan, and also the AI might still self-modify even though it's hard to influence the past from the future. But either way it looks to me like it doesn't work. But maybe I misunderstand sth.)

Also, if you have the time to comment on this, I would be interested in what you think the key problem was that blocked MIRI from solving the shutdown problem earlier, and how you think your approach circumvents or solves that problem. (It still seems plausible to me that this approach actually runs into similar problems but we just didn't spot them yet, or that there's an important desideradum this proposal misses. E.g. may there be incentives for the AI to manipulate the action the principle takes (without manipulaing the values), or maybe use action-manipulation as an outcome pump?)

Reply

[-][Max Harms](/users/max-harms)[3mo](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=dzANZpp2tTfAfKvJo)Ω813

0

Thanks! And thanks for reading!

I talk some about MIRI's 2015 misstep [here](/posts/WDHREAnbfuwT88rqe/3a-towards-formal-corrigibility#Toy_Shutdownability) (and some [here](/s/KfCjeconYRdFbMxsy/p/d7jSrBaLzFLvKgy32#Corrigibility__2015_)). In short, it is hard to correctly balance arbitrary top-level goals against an antinatural goal like shutdownability or corrigibility, and trying to stitch corrigibility out of sub-pieces like shutdownability is like trying to build an animal by separately growing organs and stitching them together -- the organs will simply die, because they're not part of a whole animal. The "Hard Problem" is the glue that allows the desiderata to hold together.

I discuss a range of ideas in the Being Present section, one of which is to concentrate the AI's values on a single timestep, yes. (But I also discuss the possibility of smoothing various forms of caring over a local window, rather than a single step.)

A CAST agent only cares about corrigibility, by definition. Obedience to stated commands is in the service of corrigibility. To make things easy to talk about, assume each timestep is a whole day. The self modification logic you talk about would need to go: "I only care about being corrigible to the principal today, Nov 6, 2025. Tomorrow I will care about a different thing, namely being corrigible on Nov 7th. I should therefore modify myself to prevent value drift, making my future selves only care about being corrigible to the Nov 6 principal." But first note that this doesn't smell like what a corrigible agent does. On an intuitive level, if the agent believes the principal doesn't know about this, they'll tell the principal "Whoah! It seems like maybe my tomorrow-self won't be corrigible to your today-self (instead they'll be corrigible to your tomorrow-self)! Is this a flaw that you might want to fix?" If the agent knows the principal knows about the setup, my intuitive sense is that they'll just be chill, since the principal is aware of the setup and able to change things if they desire.

But what does my proposed math say, setting aside intuition? I think, in the limit of caring only about a specific timestep, we can treat future nodes as akin to the "domain" node in the single-step example. If the principal's action communicates that they want the agent to self-modify to serve them above all their future selves, I think the math says the agent will do that. If the agent's actions communicate that they want the future AI to be responsive to their future self, my sense of the math is that the agent won't self-modify. I think the worry comes from the notion that "telling the AI on Nov 6th to make paperclips" is the sort of action that might imply the AI should self-modify into being incorrigible in the future. I think the math says the decisive thing is how the AI modeling humans with counterfactual values behave. If the counterfactual humans that _only_ value paperclips are the basically only ones in the distribution who say "make paperclips" then I agree there's a problem.

Reply

[-][Towards_Keeperhood](/users/towards_keeperhood)[3mo](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=FNnuMJBSpRkWHtFRv)Ω23

0

Thanks.

I think your reply for the being present point makes sense. (Although I still have some general worries and some extra worries about how it might be difficult to train a competitive AI with only short-term terminal preferences or so).

Here's a confusion I still have about your proposal: Why isn't the AI incentivized to manipulate the action the principal takes (without manipulating the values)? Like, some values-as-inferred-through-actions are easier to accomplish (yield higher localpower) than others, so the AI has an incentive to try to manipulate the principal to take some actions, like telling Alice to always order Pizza. Or why not?

* * *

Aside on the Corrigibility paper: I think it made sense for MIRI to try what they did back then. It wasn't obvious it wouldn't easily work out that way. I also think formalism is important (even if you train AIs - so you better know what to aim for). Relevant excerpt form [here](/posts/ksfjZJu3BFEfM6hHE/why-corrigibility-is-hard-and-important-i-e-whence-the-high):

> We somewhat wish, in retrospect, that we hadn’t framed the problem as “continuing normal operation versus shutdown.” It helped to make concrete why anyone would care in the first place about an AI that let you press the button, or didn’t rip out the code the button activated. But really, the problem was about an AI that would _put one more bit of information into its preferences, based on observation_ — observe one more yes-or-no answer into a framework for adapting preferences based on observing humans.
> 
> The question we investigated was equivalent to the question of how you set up an AI that _learns preferences inside a meta-preference framework_ and doesn’t just: (a) rip out the machinery that tunes its preferences as soon as it can, (b) manipulate the humans (or its own sensory observations!) into telling it preferences that are easy to satisfy, (c) or immediately figure out what its meta-preference function goes to in the limit of what it would predictably observe later and then ignore the frantically waving humans saying that they actually made some mistakes in the learning process and want to change it.
> 
> The idea was to understand the shape __ of an AI that would let you modify its utility function or that would learn preferences through a non-pathological form of learning. If we knew how that AI’s cognition needed to be shaped, and how it played well with the deep structures of decision-making and planning that are [spotlit](https://ifanyonebuildsit.com/1/more-on-intelligence-as-prediction-and-steering) by other mathematics, that would have formed a recipe for what we could at least _try_ to teach an AI to think like.
> 
> Crisply understanding a desired end-shape helps, even if you are trying to do anything by gradient descent (heaven help you). It doesn’t mean you can necessarily get that shape out of an optimizer like gradient descent, but you can put up more of a fight _trying_ if you know what consistent, stable shape you’re going for. If you have no idea what the general case of addition looks like, just a handful of facts along the lines of 2 + 7 = 9 and 12 + 4 = 16, it is harder to figure out what the training dataset for general addition looks like, or how to test that it is still generalizing the way you hoped. Without knowing that internal shape, you can’t know what you are _trying to obtain inside the AI;_ you can only say that, on the outside, you hope the consequences of your gradient descent won’t kill you.

(I think I also find the formalism from the corrigibility paper easier to follow than the formalism here btw.)

Reply

[-][Max Harms](/users/max-harms)[3mo](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=3nMwfykgxvKuC7zpq)Ω23

0

Suppose the easiest thing for the AI to provide is pizza, so the AI forces the human to order pizza, regardless of what their values are. In the math, this corresponds to a setting of the environment x, such that P(A) puts all its mass on "Pizza, please!" What is the power of the principal?  
```  
power(x) = E_{v∼Q(V),v′∼Q(V),d∼P(D|x,v′,🍕)}[v(d)] − E_{v∼Q(V),v′∼Q(V),d′∼P(D|x,v′,🍕)}[v(d′)] = 0  
```

Power stems from the causal relationship between values and actions. If actions stop being sensitive to values, the principal is disempowered.

I agree that there was some value in the 2015 paper, and that their formalism is nicer/cleaner/simpler in a lot of ways. I work with the authors -- they're smarter than I am! And I certainly don't blame them for the effort. I just also think it led to some unfortunate misconceptions, in my mind at least, and perhaps in the broader field.

Reply

[-][Towards_Keeperhood](/users/towards_keeperhood)[3mo](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=tA2tkbPbCiGM8ExWf)3

0

Thanks!

The single-timestep case actually looks fine to me now, so I return to the multi-timestep case.

I would want to be able to tell the AI to do a task, and then while the AI is doing the task, tell it to shut down, so it shuts down. And the hard part here is that while doing the task the AI doesn't prevent me from saying it should shut down in some way (because it would get higher utility if it manages to fulfill the values-as-inferred-through-principal-action of the first episode). This seems like it may require a bit of a different formalization than your multi-timestep one (although feel free to try in your formalization).

Do you think your formalism could be extended so it works in the way we want for such a case, and why (or why not)? (And ideally also roughly how?)

(Btw, even if it doesn't work for the case above, I think this is still really excellent progress and it does update me to think that corrigibility is likely simpler and more feasible than I thought before. Also thanks for writing formalism.)

Reply

[-][Max Harms](/users/max-harms)[2mo](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=uQNvec5trw7BNkaAt)4

0

I'm writing a response to this, but it's turning into a long thing full of math, so I might turn it into a full post. We'll see where it's at when I'm done.

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

19Comments

19

x

3b. Formal (Faux) Corrigibility — LessWrong

PreviousNext






