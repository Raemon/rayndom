This website requires javascript to properly function. Consider activating javascript to get access to all site functionality. 

## 

[LESSWRONG](/)

[LW](/)

Login

Serious Flaws in CAST

10 min read

•

1\. Oops I Ruined the Universe

•

Is There an Obvious Fix?

•

2\. "Attractor Basin" Masks Brittleness

•

3\. Feedback Loops Quickly Disappear by Default

[](/s/KfCjeconYRdFbMxsy/p/wZjGLYp5WQwF8Y8Kk)

[CAST: Corrigibility As Singular Target](/s/KfCjeconYRdFbMxsy)

[Corrigibility](/w/corrigibility-1)[AI](/w/ai)[Frontpage](/posts/5conQhfa4rgb4SaWx/site-guide-personal-blogposts-vs-frontpage-posts)

[2025 Top Fifty: 14%](https://manifold.markets/LessWrong/will-serious-flaws-in-cast-make-the)

# 106

# [Serious Flaws in CAST](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast)

by [Max Harms](/users/max-harms?from=post_header)

19th Nov 2025

[AI Alignment Forum](https://alignmentforum.org/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast)

10 min read

10

# 106

# Ω 53

Last year I wrote [the CAST agenda](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1), arguing that aiming for Corrigibility As Singular Target was the least-doomed way to make an AGI. (Though it is almost certainly wiser to hold off on building it until we have more skill at alignment, as a species.)

I still basically believe that CAST is right. Corrigibility still seems like a promising target compared to full alignment with human values, since there's a better story for how a near-miss when aiming towards corrigibility might be recoverable, but a near-miss when aiming for goodness could result is a catastrophe, due to the [fragility of value](/posts/GNnHHmm8EzePmKzPk/value-is-fragile). On top of this, corrigibility is significantly simpler and less philosophically fraught than human values, decreasing the amount of information that needs to be perfectly transmitted to the machine. Any spec, constitution, or whatever that attempts to balance corrigibility with other goals runs the risk of the convergent instrumental drives towards those other goals washing out the corrigibility. [My most recent novel](https://maxharms.com/redheart) is intended to be an introduction to corrigibility that's accessible to laypeople, featuring a CAST AGI as a main character, and I feel good about what I wrote there.

But I'm starting to feel like certain parts of CAST are bad, or at least need a serious update. Recent conversations with [@Jeremy Gillen](https://www.lesswrong.com/users/jeremy-gillen?mention=user), [@johnswentworth](https://www.lesswrong.com/users/johnswentworth?mention=user), and [@Towards_Keeperhood](https://www.lesswrong.com/users/towards_keeperhood?mention=user) have led me to notice some flaws that I'd like to correct.

Very briefly, they are:

  1. [The formalism I proposed](/s/KfCjeconYRdFbMxsy/p/t8nXfPLBCxsqhbipp) incentivizes the agent to ruin the universe, not only by becoming incorrigible and taking over Earth, but also potentially torturing people in particularly ugly ways and trying to do the same to aliens. Yikes!
  2. [The attractor basin metaphor](/s/KfCjeconYRdFbMxsy/p/3HMh7ES4ACpeDKtsW#What_Makes_Corrigibility_Special) works in some ways, but it masks a critical difficulty in the plan, making it appear easier to carefully iterate towards corrigibility than it is likely to be in practice.
  3. Absent a greater degree of theoretical understanding, I now expect the feedback loop of noticing and addressing flaws to vanish quickly, far in advance of getting an agent that has fully internalized corrigibility such that it's robust to distributional and ontological shifts. (This issue doesn't feel as glaring as the others, but I still thought I'd mention it since I've updated towards pessimism.)



I've gone back and included warnings to my original sequence, pointing here. I apologize to anyone who I ended up misleading; science is the project of becoming less wrong over time, not somehow getting everything right on the first try.

The rest of this post will be me addressing each flaw, in turn.

## 1\. Oops I Ruined the Universe

In the formalism I cooked up, I proposed that we could get something like corrigibility by maximizing "_power_ ," which I defined as:

power(x)=Ev∼Q(V),v′∼Q(V),a∼P(A|x,v),d∼P(D|x,v′,a)[v(d)]−Ev∼Q(V),v′∼Q(V),a′∼P(A|x,v′),d′∼P(D|x,v′,a′)[v(d′)]

Apologies for the verbose notation. The basic story is that for some given setting of the environment (_x_), we define someone's power as the expected increase in value if their action is chosen according to their values, compared to the world where their action stems from some other random set of values. And notably, we treat "their values" as counterfactually drawn from some fixed distribution _Q_ , rather than being based on what the informed probability distribution _P_ says their values are.

The big issue is the second term, with the minus sign. A heuristic that I have upvoted, in light of realizing my error, is to be extremely cautious when putting a minus sign in front of a term that is meant to reflect the human's values, even if they're counterfactual values. My idea was to set a baseline, such that "zero power" was a sensible theoretical notion that matched my intuitive sense of what it meant to be powerless.[1]

To make the issue more crisp, let's make the simplifying assumption that the human's actions deterministically reveal the values that were upstream of those actions. This allows us to abuse notation and simply substitute _v_ for _a_ and _v'_ for _a'_ , and drop the _P(A|x,_)_ expectations. And furthermore, let's suppose that the AI, which lives in the environment _x_ , has enough power to set the distribution over the value-relevant Domain however it wants, allowing us to substitute a deterministic function _f_ for the sampling of the _d_ and _d'_ variables.

power(x)=Ev∼Q(V),v′∼Q(V)[v(f(v′,v))−v(f(v′,v′))]

When thinking about how to choose _f_ to maximize this expectation, I reasoned that, for the positive term, we can simply look at the second argument, _v_ , which tells _f_ what to optimize for. For the negative term, since it only has access to _v',_ it wouldn't be able to pessimize very hard against _v_ in particular. And if it didn't optimize according to its second argument _(v')_ then it would run the risk of incidentally hurting its behavior in the positive term. Thus the AI would set things up to maximize for the preferences revealed by the human's actions, effectively becoming obedient and deferential, even in [the limit of perfect knowledge](/w/problem-of-fully-updated-deference).

But this is incorrect. Consider a choice for _f_ that first compares its two arguments and sees whether the human's values line up with their revealed preferences; if they don't match, the AI optimizes according to the second argument (i.e. satisfying the human's revealed preferences); if they do match, it makes the universe as terrible as possible according to the widest swath of possible values, as measured by _Q_. By algebra, if _v=v'_ , the value in the expectation is always 0, so this general pessimizing never counts against the agent. The only time when we're enforcing obedience is when it's likely to be in a counterfactual. It's true that the AI can't pessimize against the "true" value of _v_ , but it can still definitely pessimize against the most likely values for _v_.

In deployment, we should expect our actions to line up with our values, thus triggering the "ruin the universe for as many as possible" behavior. An easy way to ruin things is to self-modify to become incorrigible, and then convert as much of the universe into garbage as possible. If a being with typical values would recoil from something, the AI will want to do that.

### Is There an Obvious Fix?

There are several ways to imagine patching the formalism to remove this issue, with various degrees of realism. But first I want to say something like: the most important update is to not trust my math. [I gave a blanket warning](/s/KfCjeconYRdFbMxsy/p/t8nXfPLBCxsqhbipp#Formal_Measures_Should_be_Taken_Lightly) about this in my sequence, and I'm glad I did. If you're disposed to pessimism, perhaps it's a sign that even rather obvious formal issues can go unnoticed, and that it's easy for people to fool themselves that something is safe. It's also (very weak) evidence that [s-risks](https://en.wikipedia.org/wiki/Risk_of_astronomical_suffering) from [sign errors](https://forum.effectivealtruism.org/posts/5mADSy8tNwtsmT3KG/the-true-story-of-how-gpt-2-became-maximally-lewd-1) are real.

Beyond that, the obvious patch, if my formalism is worth saving, is to simply get rid of the negative term, and maximize the average expected value.

power′(x)=Ev∼Q(V),v′∼Q(V),a∼P(A|x,v),d∼P(D|x,v′,a)[v(d)]

Restructuring it this way makes it more attractive for the AI to optimize things according to typical/simple values if the human's action doesn't sharply identify their revealed preferences. This seems bad. If most values want the AI to accumulate power for their ends, and the human's words are ambiguous, the AI might (incorrigibly) accumulate power until the ambiguity is resolved. The AI would still have an incentive to give the human an interface that allows them to clearly articulate their preferences (thus revealing them and allowing the AI to optimize for them in particular). But still, it seems worrying.

Another change that could be made is to try to cut the causal arrow[2] between the human's values and the AI's action by maximizing according to another layer of counterfactuality:

power∗(x)=Ev∼Q(V),v′∼Q(V),a∼P(A|x,v),d∼P(D|x,v′,a)[v(d)]−Ev∼Q(V),v′∼Q(V),v∗∼Q(V),a′∼P(A|x,v′),d′∼P(D|x,v∗,a′)[v(d′)]

Here we're comparing the counterfactual where the action happens to randomly line up with our reference values with the counterfactual where the action is associated with a different set of random values. While I believe this prevents the AI from getting anything useful from the Value node, it makes things even more complex, keeps the minus sign around, and doesn't feel like it's cleanly capturing the semantic notion of power.

Overall I think it's most appropriate to [halt, melt, and catch fire](/posts/fLRPeXihRaiRo5dyX/the-magnitude-of-his-own-folly), discarding my proposed formalism except to use as a cautionary tale.

## 2\. "Attractor Basin" Masks Brittleness

(I was convinced of this by [@Jeremy Gillen](https://www.lesswrong.com/users/jeremy-gillen?mention=user).)

A lot of the hope for CAST routes through the idea that a less-than-perfectly corrigible agent might, in controlled settings, go off the rails in ways that are nonetheless recoverable. For instance, if the agent starts thinking on the object-level about how to subvert the principal, a metacognitive process might notice this scheming, leave a note for the developers, and shut the agent down. That's not _guaranteed_ to work, but it's better than if you aren't trying to get your agent to have metacognitive processes like that (or whatever).

If we imagine an abstract space, we can imagine placing various agents closer or farther from "perfect corrigibility" according to some metric that captures the notion of a "near miss" or "imperfect, but somewhat corrigible." If we succeed at noticing the agent's flaws, there's a chance we could update the agent (perhaps with its help) towards being more truly corrigible, theoretically moving towards the location in the space that corresponds to "perfect corrigibility."

One way to visualize this space is to project it into 2d and imagine that the third dimension represents something like "potential energy" — the tendency to lead towards a more stable state (such as perfection). [Paul Christiano describes it](https://ai-alignment.com/corrigibility-3039e668638) like this:

> As a consequence, we shouldn’t think about alignment as a narrow target which we need to implement exactly and preserve precisely. We’re aiming for a broad basin, and trying to avoid problems that could kick out of that basin.

"Just roll the ball down the hill!"

But note that the abstract space where a "near miss" makes sense is _extremely artificial_. A more neutral view of mindspace might arrange things such that small changes to the mind (e.g. tweaks to the parameters of the software that instantiates it) necessarily result in small movements in mindspace. But this is a different view of mindspace; there is no guarantee that small changes to a mind will result in small changes in how corrigible it is, nor that a small change in how corrigible something is can be achieved through a small change to the mind!

As a proof of concept, suppose that all neural networks were incapable of perfect corrigibility, but capable of being close to perfect corrigibility, in the sense of being hard to seriously knock off the rails. From the perspective of one view of mindspace we're "in the attractor basin" and have some hope of noticing our flaws and having the next version be even more corrigible. But in the perspective of the other view of mindspace, becoming more corrigible requires switching architectures and building an almost entirely new mind — the thing that exists is nowhere near the place you're trying to go.

Now, it _might_ be true that we can do something like gradient descent on corrigibility, always able to make progress with little tweaks. But that seems like a significant additional assumption, and is not something that I feel confident is at all true. The process of iteration that I described in CAST involves more deliberate and potentially large-scale changes than just tweaking the parameters a little, and with big changes like that I think there's a big chance of kicking us out of "the basin of attraction."

## 3\. Feedback Loops Quickly Disappear by Default

(I was convinced of this by a combination of talking to [@Jeremy Gillen](https://www.lesswrong.com/users/jeremy-gillen?mention=user) and [@johnswentworth](https://www.lesswrong.com/users/johnswentworth?mention=user). I ran this post by Jeremy and he signed off on it, but I'm not sure John endorses this section.)

Suppose you're engineering a normal technology, such as an engine. You might have some theoretical understanding of the basic story of what the parts are, how they fit together, and so on. But when you put the engine together, it makes a coughing-grinding noise. Something is wrong!

What should you do? Perhaps you take it apart and put it back together, in case you made a mistake. Perhaps you try replacing your parts, one-by-one. Perhaps you try to feel or listen for what's making the noise, and see if something is rubbing or loose. After some amount of work, the thing stops making the noise. Victory!

Or is it? The _noise_ has gone away, but are you sure that the problem is also gone?

Normal engineering works, in large part, because in addition to being able to look for proxies that something is off, like a worrying noise, we can actually deploy the machine and see if it works in practice. In fact, it's almost always through deployment that we come to learn what proxies/feedback loops are relevant in the first place. But of course, in the case of AGI, an actual deployment could result in irreversible catastrophe.

The main other option is theory. If you have a theory of engines, you might be able to guess, a priori, that the engine needs to not make too much noise, or shake too much, or get too hot. Theory lets you know to check the composition of a combustion engine's exhaust to see whether the air:fuel ratio is off. Theory lets you model what sorts of loads and stresses the engine will come under when it's deployed, without having to actually deploy it.

If you have a rich (and true) theory of how minds work, I think there is hope that the iterative story of pre-deployment testing can help you get to a corrigible AGI. That theory can guide the eyes and hands of the engineers, allowing them to find feedback loops and hold onto them even as they start optimizing away the signals as a side-effect of optimizing away the problems.

In short, an attention to corrigibility might be able to buy room for iterative development if combined with a rich theoretical understanding of what sort of distributional shifts are likely to occur in deployment and what sort of stresses those are likely to bring. In the ignorant state of affairs we currently find ourselves in, I think there's very little hope that those trying to build a corrigible AI will know what to look for, and will only be able to effectively optimize for something that _looks_ increasingly safe, without actually _being_ safe.

  1. **^**

In my defense, none of the other researchers who read my work seemed to notice the issue, either. I stumbled upon the issue while thinking about a toy problem I was working through at [@Towards_Keeperhood](https://www.lesswrong.com/users/towards_keeperhood?mention=user)'s request.

In my anti-defense, my math wasn't scrutinized by that many people. As far as I know, no other MIRI researcher gave my formalism a serious vetting.

  2. **^**

We can't actually cut the causal arrow because it wouldn't typecheck. The policy needs to fit into the actual world, so if we make the assumption that it's selected according to a model where there isn't any causal link and then reality does have a causal link, we can't know what will actually happen. Another way to think about it is that we have to teach the AI to ignore the human's values, rather than lean on an unjustified assumption that it can't tell what the human wants (except through observing the human's action).




1.

**^**

In my defense, none of the other researchers who read my work seemed to notice the issue, either. I stumbled upon the issue while thinking about a toy problem I was working through at [@Towards_Keeperhood](https://www.lesswrong.com/users/towards_keeperhood?mention=user)'s request.

In my anti-defense, my math wasn't scrutinized by that many people. As far as I know, no other MIRI researcher gave my formalism a serious vetting.

2.

**^**

We can't actually cut the causal arrow because it wouldn't typecheck. The policy needs to fit into the actual world, so if we make the assumption that it's selected according to a model where there isn't any causal link and then reality does have a causal link, we can't know what will actually happen. Another way to think about it is that we have to teach the AI to ignore the human's values, rather than lean on an unjustified assumption that it can't tell what the human wants (except through observing the human's action).

1.

**^**

(wide range because I haven't thought much about it yet)

[Corrigibility2](/w/corrigibility-1)[AI3](/w/ai)[Frontpage](/posts/5conQhfa4rgb4SaWx/site-guide-personal-blogposts-vs-frontpage-posts)

# 106

# Ω 53

[Previous:5\. Open Corrigibility QuestionsNo comments31 karma](/s/KfCjeconYRdFbMxsy/p/wZjGLYp5WQwF8Y8Kk)

Mentioned in

175[Shallow review of technical AI safety, 2025](/posts/Wti4Wr7Cf5ma3FGWa/shallow-review-of-technical-ai-safety-2025-2)

152[0\. CAST: Corrigibility as Singular Target](/posts/NQK8KHSrZRF5erTba/0-cast-corrigibility-as-singular-target-1)

92[The corrigibility basin of attraction is a misleading gloss](/posts/oLbpfPkdtcknABvvw/the-corrigibility-basin-of-attraction-is-a-misleading-gloss)

57[1\. The CAST Strategy](/posts/3HMh7ES4ACpeDKtsW/1-the-cast-strategy)

26[3b. Formal (Faux) Corrigibility](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility)

Serious Flaws in CAST

20plex

4plex

14Daniel Kokotajlo

11Cleo Nardo

2plex

7Towards_Keeperhood

5Jeremy Gillen

1Towards_Keeperhood

5PeterMcCluskey

4Towards_Keeperhood

New Comment

  


Submit

10 comments, sorted by 

top scoring

Click to highlight new comments since: Today at 11:46 AM

[-][plex](/users/ete)[2mo](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast?commentId=ryYS3mNmuM9Azgm9E)20

4

Suggest writing an exercise for the reader using this, first writing up the core idea and why it seemed hopeful and the formalism, then saying this is dangerously broken please find the flaw without reading the spoilers.

More broken ideas should do this, practice for red teaming ambitious theory work is rare and important.

Reply

[-][plex](/users/ete)[2mo*](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast?commentId=nt4Be9mAhteFw3mzm)4

0

Relatedly: [Here's my broken ambitious outer alignment plan: Universal Alignment Test](https://docs.google.com/document/d/1h7JbImVONI0QBwjkWmvVRBNzgQXnzH9V9Lw9AlPInk0/edit?usp=sharing). It's not actually written up quite right to be a good exercise for the reader yet, but I removed the spoilers mostly.

If people want spoilers, I can give them, but I do not have bandwidth to grade your assignments and on the real test no one will be capable of doing so. Gl :)

Reply

[-][Daniel Kokotajlo](/users/daniel-kokotajlo)[2mo](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast?commentId=fvXHp6g3QDSqggcSK)Ω614

16

> It's also (very weak) evidence that [s-risks](https://en.wikipedia.org/wiki/Risk_of_astronomical_suffering) from [sign errors](https://forum.effectivealtruism.org/posts/5mADSy8tNwtsmT3KG/the-true-story-of-how-gpt-2-became-maximally-lewd-1) are real.

:(((

Reply

1

[-][Cleo Nardo](/users/cleo-nardo)[2mo](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast?commentId=vhfjk6pgdW5Xfb83B)11

-1

> In deployment, we should expect our actions to line up with our values, thus triggering the "ruin the universe for as many as possible" behavior.

It seeks to max harms?

Reply

5

[-][plex](/users/ete)[2mo](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast?commentId=LpHxjGRiFWRwBhaWn)2

2

This is the scariest example of nominative determinism I have ever seen.

Reply

[-][Towards_Keeperhood](/users/towards_keeperhood)[2mo](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast?commentId=c9Y5zKrBaroFrThLp)7

0

> But this is a different view of mindspace; there is no guarantee that small changes to a mind will result in small changes in how corrigible it is, nor that a small change in how corrigible something is can be achieved through a small change to the mind!
> 
> As a proof of concept, suppose that all neural networks were incapable of perfect corrigibility, but capable of being close to perfect corrigibility, in the sense of being hard to seriously knock off the rails. From the perspective of one view of mindspace we're "in the attractor basin" and have some hope of noticing our flaws and having the next version be even more corrigible. But in the perspective of the other view of mindspace, becoming more corrigible requires switching architectures and building an almost entirely new mind — the thing that exists is nowhere near the place you're trying to go.
> 
> Now, it _might_ be true that we can do something like gradient descent on corrigibility, always able to make progress with little tweaks. But that seems like a significant additional assumption, and is not something that I feel confident is at all true. The process of iteration that I described in CAST involves more deliberate and potentially large-scale changes than just tweaking the parameters a little, and with big changes like that I think there's a big chance of kicking us out of "the basin of attraction."

Idk this doesn't really seem to me like a strong counterargument. When you make a bigger change you just have to be really careful that you land in the basin again. And maybe we don't need big changes.

That said, I'm quite uncertain about how stable the basin really is. I think a problem is that sycophantic behavior will likely get a bit higher reward than corrigible behavior for smart AIs. So there are 2 possibilities:

  1. stable basin: The AI reasons more competently in corrigible ways as it becomes smarter, falling deeper into the basin.
  2. unstable basin: The slightly sycophantic patterns in the reasoning processes of the AI cause the AI to get more reward, pushing the AI further towards sycophancy and incorrigibility.



My uncertain guess is that (2) would by default likely win out in the case of normal training for corrigible behavior. But maybe we could make (1) more likely by using sth like [IDA](https://ai-alignment.com/iterated-distillation-and-amplification-157debfd1616)? And in actor-critic model-based RL we could also stop updating the critic at the point when we think the AI might apply smart enough sycophancy that it wins out against corrigibility, and let the model and actor still become a bit smarter.

And then there's of course the problem of how we land in the basin in the first place. Still need to think about how a good approach for that would look like, but doesn't seem implausible to me that we could try in a good way and hit it.

Reply

[-][Jeremy Gillen](/users/jeremy-gillen)[2mo](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast?commentId=Xa3eEZFMwoEMJvpcX)5

0

I'm writing a post about this at the moment. I'm confused about how you're thinking about the space of agents, such that "maybe we don't need to make big changes"? 

> When you make a bigger change you just have to be really careful that you land in the basin again.

How can you see whether you're in the basin? What actions help you land in the basin?

> The AI reasons more competently in corrigible ways as it becomes smarter, falling deeper into the basin.

The AI doesn't fall deeper into the basin by itself, it only happens because of humans fixing problems.

Reply

[-][Towards_Keeperhood](/users/towards_keeperhood)[2mo](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast?commentId=p78jLvPNn4MT3pWTd)1

0

> I'm confused about how you're thinking about the space of agents, such that "maybe we don't need to make big changes"? 

I just mean that I don't plan for corrigibility to scale that far anyway (see my other comment), and maybe we don't need a paradigm shift to get to the level we want, so it's mostly small updates from gradient descent. (Tbc, I still think there are many problems, and I worry the basin isn't all that real so multiple small updates might lead us out of the basin. It just didn't seem to me that this particular argument would be a huge dealbreaker if the rest works out.)

> What actions help you land in the basin?

Clarifying the problem first: Let's say we have actor-critic model-based RL. Then our goal is that the critic is a function on the world model that measures sth like how empowered the principal is in the short term, aka assigning high valence to predicted outcomes that correspond to an empowered principal.

One thing we want to do is to make it less likely that a different function that also fits the reward signal well would be learned. E.g.:

  1. We don't want there to be a "will I get reward" node in the world model. In the beginning the agent shouldn't know it is an RL agent or how it is trained.
     1. Also make sure it doesn't know about thought monitoring etc. in the beginning.
  2. The operators should be careful to not give visible signs that are strongly correlated to giving reward, like smiling or writing "good job" or "great" or "thanks" or whatever. Else the agent may learn to aim for those proxies instead.



We also want very competent overseers that understand corrigibility well and give rewards accurately, rather than e.g. rewarding nice extra things the AI did but which you didn't ask for.

And then you also want to use some thought monitoring. If the agent doesn't reason in CoT, we might still be able to train some translators on the neuralese. We can:

  1. Train the world model (aka thought generator) to think more in terms of concepts like the principal, short-term preferences, actions/instructions of the principal, power/influence.
  2. Give rewards directly based on the plans the AI is considering (rather than just from observing behavior).



Tbc, this is just how you may get into the basin. It may become harder to stay in it, because (1) the AI learns a better model of the world and there are simple functions from the world model that perform better (e.g. get reward), and (2) the corrigibility learned may be brittle and imperfect and might still cause subtle power seeking because it happens to still be instrumentally convergent or so.

> > The AI reasons more competently in corrigible ways as it becomes smarter, falling deeper into the basin.
> 
> The AI doesn't fall deeper into the basin by itself, it only happens because of humans fixing problems.

If the AI helps humans to stay informed and asks about their preferences in potential edge cases, does that count as the humans fixing flaws?

Also some more thoughts on that point:

  1. [Paul seems to guess](https://The AI reasons more competently in corrigible ways as it becomes smarter, falling deeper into the basin.  The AI doesn't fall deeper into the basin by itself, it only happens because of humans fixing problems.) that there may be a crisp difference in corrigible behaviors vs incorrigible ones. One could interpret that as a hope that there's sth like a local optimum in model space around corrigibility, although I guess that's not fully what Paul thinks here. Paul also mentions the ELK continuity proposal there, which I think might've developed into Mechanistic Anomaly Detection. I guess the hope there is that to get to incorrigible behavior there will be a major shift in how the AI reasons. E.g. if before the decisions were made using the corrigible circut, and now it's coming from the reward-seeking circut. So perhaps Paul thinks that there's a basin for the corrigibility circut, but that the creation of other circuts is also still incentivized and that a shift to those needs to be avoided through disincentivizing anomalies?
     1. Idk seems like a good thing to try, but seems quite plausible we would then get a continuous mechanistic shift towards incorrigibility. I guess that comes down to thinking there isn't a crisp difference between corrigible thinking and incorrigible thinking. I don't really understand Paul's intuition pump for why to expect the difference to be crisp, but not sure, it could be crisp. (Btw, Paul admits it could turn out not to be crisp). But even then the whole MAL hope seems sorta fancy and not really the sort of thing I would like to place my hopes on.
  2. The other basin-like property comes from agents that already sorta want to empower the principal, to want to empower the principal even more, because this helps empower the principal. So if you get sorta-CAST into an agent it might want to become better-CAST.



Reply

[-][PeterMcCluskey](/users/petermccluskey)[2mo](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast?commentId=tPZm5rgEfJAksNbJT)5

0

I am also somewhat dissatisfied with the basin of attraction metaphor, but for a slightly different reason.

I am concerned that an AI that functions as mostly corrigible in environments that resemble the training environment will be less corrigible when the environment changes significantly.

I'm guessing that a better metaphor would be based on evolutionary pressures. That would emphasize both the uncertainties about any given change, and the sensitivity to out-of-distribution environments.

Maybe a metaphor about how cats are sometimes selected for being friendly to humans? Or the forces that led to the peacock's tail?

Reply

[-][Towards_Keeperhood](/users/towards_keeperhood)[2mo](/posts/qgBFJ72tahLo5hzqy/serious-flaws-in-cast?commentId=JYaDcTYPHDCutpkg2)4

0

Nice post! And being scared of minus signs seems like a nice lesson.

> Absent a greater degree of theoretical understanding, I now expect the feedback loop of noticing and addressing flaws to vanish quickly, far in advance of getting an agent that has fully internalized corrigibility such that it's robust to distributional and ontological shifts.

My motivation for corrigibility isn't that it scales all that far, but that we can more safely and effectively elicit useful work out of corrigible AIs than out of sycophants/reward-on-the-episode-seekers (let alone schemers). 

E.g. current approaches to corrigibility still rely on short-term preferences, but when the AI gets smarter and its ontology drifts so it sees itself as agent embedded in multiple places in greater reality, short-term preferences become much less natural. This probably-corrigibility-breaking shift already happens around Eliezer level if you're trying to use the AI to do alignment research. Doing alignment research makes it more likely that such breaks occur earlier, also because the AI would need to reason about stuff like "what if an AI reflects on itself in this dangerous value-breaking way" which is sorta close to the AI reflecting itself in that way. Not that it's necessarily impossible to use corrigible AI to help with alighment research, but we might be able to get a chunk further in capability if we make the AI not think about alignment stuff and instead just focus on e.g. biotech research for human intelligence augmentation, and that generally seems like a better plan to me.

I'm pretty unsure, but I currently think that if we tried not too badly (by which I mean much better than any of the leading labs seem on track to try, but not requiring fancy new techniques), we may have sth like a 10-75%[1] chance of getting a +5.5SD corrigible AI. And if a leading lab is sane enough to try a well-worked-out proposal here and it works, it might be quite useful to have +5.5SD agents inside of the labs that want to empower the overseers and at least can tell them that all the current approaches suck and we need to aim for international cooperation to get a lot more time (and then maybe human augmentation). (Rather than having sycophantic AIs that just tell the overseers what they want to hear.)

So I'm still excited about corrigibility even though I don't expect it to scale.

> power′(x)=Ev∼Q(V),v′∼Q(V),a∼P(A|x,v),d∼P(D|x,v′,a)[v(d)]
> 
> Restructuring it this way makes it more attractive for the AI to optimize things according to typical/simple values if the human's action doesn't sharply identify their revealed preferences. This seems bad.

The way I would interpret "values" in your proposal is like "sorta-short-term goals a principle might want to get fulfilled". I think it's probably fine if we just learn a prior over what sort of sorta-short-term goals a human may have, and then use that prior instead of Q. (Or not?) If so, this notion of power seems fine to me.

(If you have time, I also would be still interested in your rough take on [my original question](/posts/t8nXfPLBCxsqhbipp/3b-formal-faux-corrigibility?commentId=tA2tkbPbCiGM8ExWf).)

  1. **^**

(wide range because I haven't thought much about it yet)




Reply

[Moderation Log](/moderation)

More from [Max Harms](/users/max-harms)

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

223[Thoughts on AI 2027](/posts/Yzcb5mQ7iq4DFfXHx/thoughts-on-ai-2027)

[](https://intelligence.org/2025/04/09/thoughts-on-ai-2027/)

[Max Harms](/users/max-harms)

10mo

[](https://intelligence.org/2025/04/09/thoughts-on-ai-2027/)

61

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

10Comments

10

x

Serious Flaws in CAST — LessWrong

PreviousNext






