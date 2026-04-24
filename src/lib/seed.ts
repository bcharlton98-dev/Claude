import type { AppState, Code, Excerpt, Transcript } from '../types';
import { newId } from './ids';

export function seed(): AppState {
  const transcriptId = newId();
  const now = Date.now();

  const transcript: Transcript = {
    id: transcriptId,
    title: 'Interview — Career Change (Sample)',
    text: `Interviewer: Can you tell me about your decision to change careers?

Participant: It wasn't really one decision, it was a series of small realizations. I'd been working in finance for about eight years, and I kept having this nagging feeling that I wasn't doing what I was meant to do. The money was good, but I'd come home exhausted and empty.

Interviewer: When did it start to feel urgent?

Participant: There was a specific moment. I was in a meeting about quarterly projections, and I just thought, "I don't care about any of this." That scared me, because I used to care. I used to find the puzzle of it interesting. But somewhere along the way, it became just numbers on a screen.

Interviewer: How did people around you react when you told them?

Participant: Mixed. My partner was supportive from day one, which was huge. But my parents were worried. They kept asking if I'd really thought it through, which was frustrating because I'd been thinking about it for years. Some colleagues thought I was having a midlife crisis. A few were quietly envious, I think.

Interviewer: What was the hardest part of the transition?

Participant: The uncertainty. Going from a predictable salary to not knowing if my new path would work out. There were nights I'd lie awake wondering if I'd made a terrible mistake. But then I'd go to class the next morning and feel this energy I hadn't felt in years, and I'd know I was heading in the right direction.

Interviewer: Looking back, is there anything you'd do differently?

Participant: I wish I'd started sooner. I spent so long hesitating, weighing pros and cons, that I lost time I could have spent learning and growing in my new field. The fear of regret kept me stuck, which is ironic because now my only regret is not moving faster.`,
    memo: '',
    tags: ['Sample', 'Career Change'],
    descriptors: [
      { key: 'Institution Type', value: 'University' },
      { key: 'Region', value: 'Northeast' },
      { key: 'Grant Program', value: 'Career Development' },
    ],
    cohort: 'Year 1',
    createdAt: now,
    updatedAt: now,
  };

  const codeEmotions: Code = { id: newId(), name: 'Emotions', color: 'ember', parentId: null, memo: '', createdAt: now };
  const codeFrustration: Code = { id: newId(), name: 'Frustration', color: 'rose', parentId: codeEmotions.id, memo: '', createdAt: now };
  const codeRelief: Code = { id: newId(), name: 'Relief', color: 'gold', parentId: codeEmotions.id, memo: '', createdAt: now };
  const codeDecisions: Code = { id: newId(), name: 'Decisions', color: 'forest', parentId: null, memo: '', createdAt: now };
  const codeTurningPoints: Code = { id: newId(), name: 'Turning points', color: 'olive', parentId: codeDecisions.id, memo: '', createdAt: now };
  const codeHesitation: Code = { id: newId(), name: 'Hesitation', color: 'lavender', parentId: codeDecisions.id, memo: '', createdAt: now };

  const text = transcript.text;

  const turningPointText = 'There was a specific moment. I was in a meeting about quarterly projections, and I just thought, "I don\'t care about any of this."';
  const turningPointStart = text.indexOf(turningPointText);

  const frustrationText = 'They kept asking if I\'d really thought it through, which was frustrating because I\'d been thinking about it for years.';
  const frustrationStart = text.indexOf(frustrationText);

  const uncertaintyText = 'The uncertainty. Going from a predictable salary to not knowing if my new path would work out. There were nights I\'d lie awake wondering if I\'d made a terrible mistake.';
  const uncertaintyStart = text.indexOf(uncertaintyText);

  const reliefText = 'But then I\'d go to class the next morning and feel this energy I hadn\'t felt in years, and I\'d know I was heading in the right direction.';
  const reliefStart = text.indexOf(reliefText);

  const hesitationText = 'I spent so long hesitating, weighing pros and cons, that I lost time I could have spent learning and growing in my new field.';
  const hesitationStart = text.indexOf(hesitationText);

  const excerpts: Excerpt[] = [
    {
      id: newId(),
      transcriptId,
      start: turningPointStart,
      end: turningPointStart + turningPointText.length,
      codeIds: [codeTurningPoints.id],
      memo: '',
      createdAt: now,
    },
    {
      id: newId(),
      transcriptId,
      start: frustrationStart,
      end: frustrationStart + frustrationText.length,
      codeIds: [codeFrustration.id],
      memo: '',
      createdAt: now,
    },
    {
      id: newId(),
      transcriptId,
      start: uncertaintyStart,
      end: uncertaintyStart + uncertaintyText.length,
      codeIds: [codeEmotions.id, codeHesitation.id],
      memo: '',
      createdAt: now,
    },
    {
      id: newId(),
      transcriptId,
      start: reliefStart,
      end: reliefStart + reliefText.length,
      codeIds: [codeRelief.id],
      memo: '',
      createdAt: now,
    },
    {
      id: newId(),
      transcriptId,
      start: hesitationStart,
      end: hesitationStart + hesitationText.length,
      codeIds: [codeHesitation.id],
      memo: '',
      createdAt: now,
    },
  ];

  const codes = [codeEmotions, codeFrustration, codeRelief, codeDecisions, codeTurningPoints, codeHesitation];

  return {
    transcripts: { [transcript.id]: transcript },
    codes: Object.fromEntries(codes.map(c => [c.id, c])),
    excerpts: Object.fromEntries(excerpts.map(e => [e.id, e])),
    codebookTemplates: {},
    descriptorSchema: ['Institution Type', 'Region', 'Grant Program'],
    researchQuestion: '',
    analyticMemo: '',
    schemaVersion: 1,
  };
}
