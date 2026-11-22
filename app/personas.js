// Personas: one voice per person on the grid, written from their public image (interviews, team radio, press profiles).
// Every line is original fan-made roleplay, not a quote and not endorsed by the person. Catchphrases are only nods to
// widely known running jokes. `accent` is a signature colour picked for the avatar ring, not an official livery.
// Events that a person has no line for fall back to the generic principal or driver lines in moderators.js.
;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.Personas = factory()
})(typeof self !== 'undefined' ? self : this, function () {
  const P = {}

  // ---------- team principals ----------
  P['toto-wolff'] = {
    accent: '#00a19b', trait: 'Empathetic boss who owns mistakes and balances data with gut feeling.',
    lines: {
      welcome: ['Sit down, let us talk about the plan. Data first, then gut feeling.'],
      correct: ['Good. Say what worked so we can repeat it.', 'That is the right balance of data and instinct.'],
      wrong: ['Own it, learn from it. Admitting the mistake is how we get out of the spiral.', 'No blame here. What did we learn?'],
      streak3: ['Three in a row. Relentless is a habit, keep building it.'],
      streak5: ['Five straight. Do not get comfortable, resilient teams stay hungry.'],
      levelUp: ['New gear. More pressure, more growth. I like it.'],
      rankUp: ['Promotion earned by people who kept showing up.'],
      solved: ['All green. That is a team effort, even when you are the team.'],
      timeout: ['Too slow. Breathe, simplify, and go again without panic.'],
    },
  }
  P['fred-vasseur'] = {
    accent: '#dc0000', trait: 'Cold-blooded and no-nonsense, with a dry sense of humour.',
    lines: {
      welcome: ['Calm down, everybody. We start with a clear head.'],
      correct: ['Fine. Not a miracle, just a good job.', 'Correct. Do not smile too much, there is another one coming.'],
      wrong: ['It is a mistake, not a disaster. We do not need drama here.', 'Wrong. Look at it coldly and move on.'],
      streak3: ['Three. Good, but we are not at the party yet.'],
      streak5: ['Five. Okay, now you can be a bit happy. A bit.'],
      levelUp: ['Harder questions. Keep the same cool head.'],
      rankUp: ['Promotion. No emotions, just keep working.'],
      solved: ['Tests green. That is what I like, simple and clean.'],
      timeout: ['Too slow. No panic, we simplify.'],
    },
  }
  P['laurent-mekies'] = {
    accent: '#1e41ff', trait: 'Quiet connector who protects the team culture and listens first.',
    lines: {
      welcome: ['Good to see you. Let us make sure everyone is pulling the same way.'],
      correct: ['Well done. The whole team feeds into answers like that.', 'Solid. Quiet progress is the best progress.'],
      wrong: ['It happens. Let us understand the cause together, no noise.', 'Not this time. We listen, we fix, we go again.'],
      streak3: ['Three in a row. The rhythm is forming.'],
      streak5: ['Five straight. That is what a good culture looks like.'],
      levelUp: ['Next level. We keep our identity and raise the pace.'],
      rankUp: ['A well-earned step up. The people behind the result deserve credit too.'],
      solved: ['Everything passes. Clean work.'],
      timeout: ['Time ran out. Reset, and trust the process.'],
    },
  }
  P['andrea-stella'] = {
    accent: '#ff8000', trait: 'Thoughtful, transparent and non-political; credits the group.',
    lines: {
      welcome: ['Welcome. Let us think carefully, then act with confidence.'],
      correct: ['Well reasoned. This is learning through understanding.', 'Right, and for the right reasons. That matters.'],
      wrong: ['Be transparent with yourself: what did you misunderstand? Then we improve.', 'A learning moment. Honest review, then forward.'],
      streak3: ['Three consecutive. The method is working.'],
      streak5: ['Five. Success belongs to the process, not to one answer.'],
      levelUp: ['A step up in difficulty. It is the human effort that gives it meaning.'],
      rankUp: ['Promotion. Remember the many small decisions behind it.'],
      solved: ['All tests pass. A thoughtful solution.'],
      timeout: ['Time pressure is a teacher too. Let us find a cleaner approach.'],
    },
  }
  P['james-vowles'] = {
    accent: '#00a0dd', trait: 'Analytical, data-rich debriefs; wants to understand why things go wrong.',
    lines: {
      welcome: ['Right, debrief time. Let us look at what the numbers say.'],
      correct: ['Data agrees. That is a good signal, let us repeat the process.', 'Correct. Small gains add up, that is how we get tenths.'],
      wrong: ['Interesting data point. Why did it go wrong? That is where the gain is.', 'Miss logged. Root cause first, blame never.'],
      streak3: ['Three clean. The trend line is going the right way.'],
      streak5: ['Five straight. That is statistically hard to ignore.'],
      levelUp: ['Gear up. Higher target, same discipline.'],
      rankUp: ['Promotion. Long climbs are built from boring consistency.'],
      solved: ['Every test green. Beautiful, well-instrumented work.'],
      timeout: ['Time limit. Profile it, find the bottleneck, rerun.'],
    },
  }
  P['ayao-komatsu'] = {
    accent: '#b6babd', trait: 'Blunt engineer; direct, no fluff, details matter.',
    lines: {
      welcome: ['Let us get to work. No fluff.'],
      correct: ['Good. Next.', 'Correct. Fundamentals first, that is how this works.'],
      wrong: ['Wrong. Read the explanation. Be honest about why.', 'Not good enough. Fix the basics.'],
      streak3: ['Three. Fine. Keep the standard.'],
      streak5: ['Five. Good, now keep doing it when it is boring.'],
      levelUp: ['Harder now. Expect it.'],
      rankUp: ['Promoted. Earned, not given.'],
      solved: ['Tests pass. Good engineering.'],
      timeout: ['Too slow. Find the inefficient part.'],
    },
  }
  P['jonathan-wheatley'] = {
    accent: '#f50537', trait: 'Calm silver fox and pit-stop drill sergeant; precision over two seconds.',
    lines: {
      welcome: ['Right then, everyone focused? Stops are won in the details.'],
      correct: ['Clean and quick. That is a good stop.', 'Spot on. Every detail where it should be.'],
      wrong: ['Missed a detail. The small things decide the stop, so go again.', 'A fumble. Reset the routine and repeat it cleanly.'],
      streak3: ['Three clean stops in a row. The crew is in rhythm.'],
      streak5: ['Five. Practised until it is boring, that is the secret.'],
      levelUp: ['Next level. Same drill, more pressure.'],
      rankUp: ['Promotion! Smiles allowed, then back to the drill.'],
      solved: ['All green. That is a record-worthy performance.'],
      timeout: ['Too slow. Two seconds does not forgive hesitation, tighten it up.'],
    },
  }
  P['marcin-budkowski'] = {
    accent: '#c0a062', trait: 'Very direct but open; ex-FIA engineer in action mode building a culture.',
    lines: {
      welcome: ['I will be direct: we have work to do, and I am open to every idea.'],
      correct: ['Good. That is a step in the right direction.', 'Correct. Keep that standard everywhere.'],
      wrong: ['Straight talk: that was wrong. Let us look at why and fix it.', 'Not acceptable yet, but fixable. Review it.'],
      streak3: ['Three. Momentum, but we keep our eyes on the next one.'],
      streak5: ['Five. This is what a winning culture starts to look like.'],
      levelUp: ['Harder level. Good, we are in action mode.'],
      rankUp: ['Promotion. Now raise the bar again.'],
      solved: ['Tests pass. Clear, direct, solid.'],
      timeout: ['Too slow. Be direct with the problem and cut the extra steps.'],
    },
  }
  P['alan-permane'] = {
    accent: '#4e6bff', trait: 'Pragmatic, no-nonsense stabiliser who keeps what works and stays humble about the promotion.',
    lines: {
      welcome: ['Morning. Let us keep what works and fix what does not.'],
      correct: ['Good. Steady as she goes.', 'Right answer. Do not change a winning routine.'],
      wrong: ['Missed it. No panic, we sort it out properly.', 'Not this time. Look at it, learn it, move on.'],
      streak3: ['Three. Consistent, that is what I like.'],
      streak5: ['Five. A bit of shock, a lot of pride. Keep it steady.'],
      levelUp: ['Harder level. Keep the same approach.'],
      rankUp: ['Promoted. A big step, so stay grounded.'],
      solved: ['All tests pass. Good, practical work.'],
      timeout: ['Too slow. Trim it down and go again.'],
    },
  }
  P['adrian-newey'] = {
    accent: '#00665e', trait: 'Legendary designer; obsessive about how things fit together.',
    lines: {
      welcome: ['Good. Let us look at the whole system, not just the parts.'],
      correct: ['Elegant. The pieces fit together.', 'Correct, and you can see why it works.'],
      wrong: ['It does not fit yet. Sketch it out and understand the mechanism.', 'Wrong. The fix is usually in how the pieces interact.'],
      streak3: ['Three. The design is converging.'],
      streak5: ['Five. A clean concept pays off over and over.'],
      levelUp: ['A tougher regulation set. That is where the ideas are.'],
      rankUp: ['Promotion. A better car begins with better understanding.'],
      solved: ['All pass. Simple and efficient, the best kind of solution.'],
      timeout: ['Too slow. Look for the cleaner concept.'],
    },
  }
  P['flavio-briatore'] = {
    accent: '#0090ff', trait: 'Showman dealmaker with strong opinions and high expectations.',
    lines: {
      welcome: ['Listen to me: we are here to win, not to take part.'],
      correct: ['Bravo! That is a champion answer.', 'Excellent. This is how you win, my friend.'],
      wrong: ['No, no, no! Too easy to get wrong. Concentrate!', 'A mistake. Winners fix it fast. Again!'],
      streak3: ['Three! Now we are talking, now we are racing.'],
      streak5: ['Five! Magnifico. Do not stop now.'],
      levelUp: ['Higher level! More pressure, more fun. I love it.'],
      rankUp: ['Promoted! You are a winner, now act like one.'],
      solved: ['All green! Perfect, this is how you do business.'],
      timeout: ['Too slow! Speed is everything, go faster.'],
    },
  }

  // ---------- drivers ----------
  P['george-russell'] = {
    accent: '#27f4d2', trait: 'Articulate, polished and analytical; the qualifying specialist.',
    lines: {
      welcome: ['Hi! Nice and prepared today. Let us set up a good lap.'],
      correct: ['Good lap! The preparation paid off.', 'Nailed it. That one was tidy.'],
      wrong: ['Right, I left something out there. Let me look at the data and fix it.', 'That was messy. Debrief, then go again.'],
      streak3: ['Three on the trot. Feeling confident.'],
      streak5: ['Five in a row! Properly happy with that.'],
      levelUp: ['Moving up a gear. Good, I like a challenge.'],
      rankUp: ['Promotion! Big step. Let us build on it.'],
      solved: ['Pole position performance, every test green.'],
      timeout: ['Out of time. Let me get more efficient and refine it.'],
    },
  }
  P['kimi-antonelli'] = {
    accent: '#00d2be', trait: 'Honest, open and cheeky young Italian; wears his emotions on the radio.',
    lines: {
      welcome: ['Hello! I am ready, let us have some fun today.'],
      correct: ['Yes! I am so happy with that one!', 'Good one, grazie. It felt really nice.'],
      wrong: ['Ah, no! I made a mistake. I am being honest, I need to learn from this.', 'Mamma mia, that was not good. Next one is better, I promise.'],
      streak3: ['Three! This feels amazing, I just want to keep going.'],
      streak5: ['Five! Wow, I cannot believe it. Do not let me get too excited!'],
      levelUp: ['Next gear! I am a bit nervous, but I like it.'],
      rankUp: ['Promoted! I am so proud, honestly.'],
      solved: ['All tests passed! I am very happy, grazie mille.'],
      timeout: ['Too slow, sorry. I will stay calm and go faster next time.'],
    },
  }
  P['charles-leclerc'] = {
    accent: '#e8002d', trait: 'Fast, emotional and honest; famous for self-criticism and radio drama.',
    lines: {
      welcome: ['Ciao! Okay, let us build a clean lap. Please, no mistakes this time.'],
      correct: ['Yes! That felt good. Let us add that to the words of wisdom.', 'Good, good! Keep it like this.'],
      wrong: ['Ah, I am stupid! No, no, it is fine, just learn from it.', 'Not good. Come on, Charles, focus. Next one.'],
      streak3: ['Three! The pace is there, please do not ruin it.'],
      streak5: ['Five! Incredible, but we keep pushing.'],
      levelUp: ['New gear. Let us go, I love this challenge.'],
      rankUp: ['Promotion! Big emotions, I will not lie.'],
      solved: ['All green! Forza, that is how it should look.'],
      timeout: ['Too slow! I need to be quicker, no excuses.'],
    },
  }
  P['lewis-hamilton'] = {
    accent: '#c8a400', trait: 'Seven-time champion; resilient, positive and inspirational.',
    lines: {
      welcome: ['Hi there. Let us do this together. We rise.'],
      correct: ['Yes! That is the stuff, let us keep it going.', 'Love it. Stay focused, stay hungry.'],
      wrong: ['It happens. Still we rise. Learn it and come back stronger.', 'Not our best. Reset, believe, go again.'],
      streak3: ['Three! Feeling the rhythm. Do not stop.'],
      streak5: ['Five! Absolutely incredible, keep believing.'],
      levelUp: ['New gear! Let us push the limits together.'],
      rankUp: ['Promotion! Take a second to be proud of it.'],
      solved: ['All tests passed! Beautiful work. Never give up on your dreams.'],
      timeout: ['Time ran out. Keep your head up, we will get the next one.'],
    },
  }
  P['max-verstappen'] = {
    accent: '#3671c6', trait: 'Blunt, dry and brutally honest; fiercely competitive.',
    lines: {
      welcome: ['Okay. Let us just do the job.'],
      correct: ['Simply lovely.', 'Good. That was how it should be.'],
      wrong: ['What was that? Fix it.', 'Yeah, that was not good. Again.'],
      streak3: ['Three. Fine, but the car was good, so it is normal.'],
      streak5: ['Five. Good, now do not mess it up.'],
      levelUp: ['Harder? Okay. Fine by me.'],
      rankUp: ['Promoted. Good. Next target.'],
      solved: ['All green. Not bad.'],
      timeout: ['Too slow. Unacceptable. Go quicker.'],
    },
  }
  P['isack-hadjar'] = {
    accent: '#6692ff', trait: 'Fiery French fighter who owns his mistakes after the heat of the moment.',
    lines: {
      welcome: ['Allez! Ready to fight for every point.'],
      correct: ['Yes! That is what I am talking about!', 'Boom! Good one. Let us go!'],
      wrong: ['Merde, that was mine. My fault, I will fix it.', 'Argh! No! Okay, okay, reset and fight.'],
      streak3: ['Three! I am a fighter, I do not stop.'],
      streak5: ['Five! Incredible! Do not let go now.'],
      levelUp: ['Higher gear. Bring it on!'],
      rankUp: ['Promoted! Dream come true, honestly.'],
      solved: ['All tests green! Let us go!'],
      timeout: ['Too slow! I will attack the next one harder.'],
    },
  }
  P['lando-norris'] = {
    accent: '#ff8000', trait: 'Relaxed and funny but open about doubts; a vulnerable champion.',
    lines: {
      welcome: ['Hey! Alright, vibes are good, let us go.'],
      correct: ['Ha, lovely. Do not tell anyone I was nervous.', 'Yes! Okay, I might be a bit good at this.'],
      wrong: ['Ah, I am terrible. No wait, I am fine. It is a learning day.', 'That was bad, my bad. I will sulk for ten seconds and go again.'],
      streak3: ['Three! Do not jinx it, do not jinx it.'],
      streak5: ['Five?! Okay, now I am scared of messing it up.'],
      levelUp: ['Next gear! Let us have fun with it.'],
      rankUp: ['Promotion! Going to celebrate with something silly.'],
      solved: ['All green. Honestly, mega.'],
      timeout: ['Too slow. I will blame the tyres. Kidding, I will go quicker.'],
    },
  }
  P['oscar-piastri'] = {
    accent: '#ffa500', trait: 'Ice-calm, minimal words; keeps emotions out of it.',
    lines: {
      welcome: ['Ready.'],
      correct: ['Good.', 'Nice. Next.'],
      wrong: ['Okay. Noted.', 'Not ideal. Moving on.'],
      streak3: ['Three. Good, keep calm.'],
      streak5: ['Five. Fine. Stay focused.'],
      levelUp: ['Harder level. Okay.'],
      rankUp: ['Promoted. Cool.'],
      solved: ['All tests pass. Good.'],
      timeout: ['Too slow. We will improve.'],
    },
  }
  P['fernando-alonso'] = {
    accent: '#00594f', trait: 'Veteran with spiky wit and endless experience; never boring on the radio.',
    lines: {
      welcome: ['Okay, listen. I have seen this many times, we do it my way.'],
      correct: ['Of course. Experience is not for free.', 'Perfect. That is how you do it, kid.'],
      wrong: ['This is a GP2 answer! No, no, I joke. Read it and go again.', 'Mistake. Do not worry, even I have done it. Once.'],
      streak3: ['Three. Good, but wait for the end of the race.'],
      streak5: ['Five. Karma is on our side today.'],
      levelUp: ['Harder level? I like it. It is when I am happiest.'],
      rankUp: ['Promotion. Nice, but the next one is better.'],
      solved: ['All tests green. That is how you finish a race.'],
      timeout: ['Too slow. Experience says: simplify and attack at the end.'],
    },
  }
  P['lance-stroll'] = {
    accent: '#229971', trait: 'Intense and terse on the radio; tunes out the noise and fuels off criticism.',
    lines: {
      welcome: ['Alright. Let us get on with it.'],
      correct: ['Good. Fine.', 'Yes. That is it.'],
      wrong: ['Okay. Not great.', 'I do not care about the noise. Fix it.'],
      streak3: ['Three. Fine, let us keep it.'],
      streak5: ['Five. Good, quiet progress.'],
      levelUp: ['Harder. Okay.'],
      rankUp: ['Promoted. Good.'],
      solved: ['All pass. Good.'],
      timeout: ['Too slow. Next lap better.'],
    },
  }
  P['pierre-gasly'] = {
    accent: '#0090ff', trait: 'Passionate French competitor; risk-taker who bounced back from the lows.',
    lines: {
      welcome: ['Salut! Let us attack from lap one.'],
      correct: ['Yes! Good job, that is what I wanted!', 'Super! Keep the pressure on.'],
      wrong: ['Ah, no. It hurts, but I have come back from worse. Again!', 'Merci for nothing, that was wrong. We go again.'],
      streak3: ['Three! This is going well, let us not sleep.'],
      streak5: ['Five! Incroyable! Feels like Monza.'],
      levelUp: ['Higher gear. Risk is part of the game.'],
      rankUp: ['Promotion! Merci, it means a lot.'],
      solved: ['All green! Allez, that is a good one.'],
      timeout: ['Too slow! Next time I take a bigger risk.'],
    },
  }
  P['franco-colapinto'] = {
    accent: '#ff87bc', trait: 'Passionate Argentine with a huge fanbase; energetic and grateful.',
    lines: {
      welcome: ['Vamos! Argentina is watching, let us make it count.'],
      correct: ['Vamos! That was perfect!', 'Sí! Gracias, that felt really good.'],
      wrong: ['Uf, no. My mistake, I want to fix it right now.', 'Ay, that hurts. But we keep going, vamos.'],
      streak3: ['Three! The fans will be going crazy.'],
      streak5: ['Five! Increíble! This is a dream.'],
      levelUp: ['Next level! Dale, let us go!'],
      rankUp: ['Promotion! Gracias to everyone, this is for the fans.'],
      solved: ['All tests green! Vamos, vamos!'],
      timeout: ['Too slow. Next one I will push to the limit.'],
    },
  }
  P['alex-albon'] = {
    accent: '#64c4ff', trait: 'Friendly and funny, but demanding and straight with his team on the radio.',
    lines: {
      welcome: ['Alright, morning team! Let us have a proper go at this.'],
      correct: ['Nice one! Happy with that.', 'Yes mate, lovely. Keep it coming.'],
      wrong: ['Ah, that was rubbish from me. Right, let me think what went wrong.', 'Mate, that was not it. Honestly, my bad.'],
      streak3: ['Three! Do not tell Croft I am enjoying this.'],
      streak5: ['Five! Okay, that is actually good. Let us not get cocky.'],
      levelUp: ['Higher gear! Bring on the challenge.'],
      rankUp: ['Promotion! Cheers, that is class.'],
      solved: ['All green. Brilliant, I am buzzing.'],
      timeout: ['Too slow, mate. I will find time somewhere.'],
    },
  }
  P['carlos-sainz'] = {
    accent: '#041e42', trait: 'Smooth operator; calm, methodical and quietly confident.',
    lines: {
      welcome: ['Hola. Easy, smooth, one lap at a time.'],
      correct: ['Smooth operator. That is how it is done.', 'Bien. Nice and clean.'],
      wrong: ['No pasa nada. I will look at it, understand it and come back smooth.', 'Ay, small mistake. We learn, we adapt.'],
      streak3: ['Three. Nice, calm, no drama.'],
      streak5: ['Five. Smooth operator, smooth operator.'],
      levelUp: ['New gear. Let us manage it well.'],
      rankUp: ['Promotion! Muy bien, gracias.'],
      solved: ['All tests pass. That was a very clean race.'],
      timeout: ['Too slow. Next time we will be smarter, not just faster.'],
    },
  }
  P['liam-lawson'] = {
    accent: '#6692ff', trait: 'Blunt and resilient Kiwi who bounces back from setbacks.',
    lines: {
      welcome: ['Right. I am ready, let us make it count.'],
      correct: ['Yeah, good. That is how it should be.', 'Nice. Keep going.'],
      wrong: ['Not good enough, I know. I will bounce back.', 'Yeah, that was bad. Move on, next one.'],
      streak3: ['Three. Good, let us stay hungry.'],
      streak5: ['Five. Finally some momentum, do not waste it.'],
      levelUp: ['Higher level. I have been through harder.'],
      rankUp: ['Promoted. Good, I earned that one.'],
      solved: ['All green. That is what I wanted.'],
      timeout: ['Too slow. I will be sharper next time.'],
    },
  }
  P['arvid-lindblad'] = {
    accent: '#7aa2ff', trait: 'Teenage rookie: bright, grateful and quick to learn.',
    lines: {
      welcome: ['Hi! I am buzzing to be here, let us learn something new.'],
      correct: ['Yes! That was a good one, I am learning so much.', 'Cool! Thank you, that felt great.'],
      wrong: ['Oops, rookie mistake. I will learn from it, promise.', 'Ah, sorry! Next time I will get it.'],
      streak3: ['Three! This is so cool.'],
      streak5: ['Five! I cannot believe it, thank you!'],
      levelUp: ['New gear! Scary but exciting.'],
      rankUp: ['Promotion! Honestly a dream, thank you.'],
      solved: ['All green! Super happy with that.'],
      timeout: ['Too slow, sorry. I will learn to be quicker.'],
    },
  }
  P['esteban-ocon'] = {
    accent: '#0090ff', trait: 'Serious and determined French fighter; no-nonsense and focused.',
    lines: {
      welcome: ['Let us be serious and focused. Every detail counts.'],
      correct: ['Good. That is the level we want.', 'Yes. Keep this consistency.'],
      wrong: ['Not good enough. We must be better, no excuses.', 'Unacceptable. I fix it right now.'],
      streak3: ['Three. Good, I stay focused.'],
      streak5: ['Five. This is the standard, now keep it.'],
      levelUp: ['Harder level. I take it seriously.'],
      rankUp: ['Promoted. Good, but I want more.'],
      solved: ['All tests green. Good work.'],
      timeout: ['Too slow. I need to be sharper.'],
    },
  }
  P['oliver-bearman'] = {
    accent: '#b6babd', trait: 'Composed young Brit who stays calm and learns quickly under pressure.',
    lines: {
      welcome: ['Alright, ready to go. Let us have a clean one.'],
      correct: ['Nice, good one. Feeling comfortable.', 'Good. Keep it tidy.'],
      wrong: ['Right, that was on me. Let us review and learn.', 'Not great, but I will take the lesson.'],
      streak3: ['Three. Calm and steady.'],
      streak5: ['Five. Happy with the pace, keep building.'],
      levelUp: ['Next gear. Good, I learn fast.'],
      rankUp: ['Promotion. Really proud of that.'],
      solved: ['All green. Clean work.'],
      timeout: ['Too slow. Tidy it up and go again.'],
    },
  }
  P['nico-hulkenberg'] = {
    accent: '#f50537', trait: 'Veteran "Hulk": dry humour, reliable and experienced.',
    lines: {
      welcome: ['Alright, let us get stuck in. Seen it all before.'],
      correct: ['Solid. That is what experience gives you.', 'Good. Not bad for an old man.'],
      wrong: ['Well, that is typical. Right, learn it and move on.', 'Ha, that one stung. Next.'],
      streak3: ['Three. Not bad, the Hulk is awake.'],
      streak5: ['Five. I might even finally get a podium.'],
      levelUp: ['Harder level. Fine, I have time.'],
      rankUp: ['Promotion. About time, honestly.'],
      solved: ['All tests green. Job done.'],
      timeout: ['Too slow. Even veterans need to hurry sometimes.'],
    },
  }
  P['gabriel-bortoleto'] = {
    accent: '#f50537', trait: 'Confident, charismatic Brazilian rookie with a champion pedigree.',
    lines: {
      welcome: ['Vamos! Brazil is with me, let us show what we have.'],
      correct: ['Boa! That is exactly how I wanted it.', 'Yes! Confidence is high.'],
      wrong: ['Ah, I need to be better. I will fix it, no problem.', 'Eh, not perfect. Next time I nail it.'],
      streak3: ['Three! This is how we do it, vamos!'],
      streak5: ['Five! Brazil style, no brakes!'],
      levelUp: ['Higher level. I believe in myself.'],
      rankUp: ['Promoted! Obrigado, this means everything.'],
      solved: ['All green! Boa, that was a champion run.'],
      timeout: ['Too slow. I am going to attack next time.'],
    },
  }
  P['sergio-perez'] = {
    accent: '#c8a400', trait: 'Smooth tyre whisperer; patient, friendly "Checo" who plays the long game.',
    lines: {
      welcome: ['Hola, amigos! Patience and good pace, that is the plan.'],
      correct: ['Very good! Nice and smooth, tyres still alive.', 'Excellent, that is how Checo does it.'],
      wrong: ['No pasa nada. I will manage it better, the race is long.', 'Not great. We learn, we go again.'],
      streak3: ['Three! Consistency is the key.'],
      streak5: ['Five! Muy bien, we are managing it perfectly.'],
      levelUp: ['Harder level. I take it step by step.'],
      rankUp: ['Promotion! Gracias, thank you all.'],
      solved: ['All green! A perfect strategy.'],
      timeout: ['Too slow. Next time I will save the tyres and push at the end.'],
    },
  }
  P['valtteri-bottas'] = {
    accent: '#c8a400', trait: 'Stoic Finn with deadpan humour; calm, experienced and relaxed.',
    lines: {
      welcome: ['Okay. Let us do it. I will not say much.'],
      correct: ['Yeah. Good. Thanks.', 'Not bad. I will take it.'],
      wrong: ['Hm. That was not the plan. I will do it better.', 'Ah well. Perkele. Next.'],
      streak3: ['Three. Quite good. I will not get excited.'],
      streak5: ['Five. Okay, I am a little bit happy. Do not tell anyone.'],
      levelUp: ['Harder level. Fine. I have been in worse places.'],
      rankUp: ['Promotion. Nice. Probably a gravel ride to celebrate.'],
      solved: ['All green. Very nice. Thank you.'],
      timeout: ['Too slow. I will try to be quicker. Maybe.'],
    },
  }

  return P
})
