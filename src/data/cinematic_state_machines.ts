export interface CinematicStateMachine {
  id: string;
  name: string;
  summary: string;
  creativeDNA: string;
  guidance: string;
}

export const CINEMATIC_STATE_MACHINES: CinematicStateMachine[] = [
  {
    id: 'product-proof-state-machine',
    name: 'Product Proof State Machine',
    summary: 'Answer distinct product questions using a reorderable proof state machine, maintaining continuity with uniform materials, lighting, and typography behavior.',
    creativeDNA: `Reusable Creative DNA (mechanism and production grammar only):
A compressed launch film behaves as a flexible proof state machine rather than a fixed storyboard: an outcome, operation, internal mechanism, maximum contrast event, breadth proof and final action may be merged or reordered as long as each state answers a new product question. A strict material, light and typography system maintains coherence while shot count, information order, camera carrier and breadth device change across instances.
Invariants:
- inv-01: Within the first third, establish one emotionally legible outcome and its causal relationship to the product; outcome-first and proof-first openings are both valid.
- inv-02: Make each information state answer a different product question, but merge related questions and vary their order according to the new product's strongest causal proof.
- inv-03: Concentrate one maximum contrast event after enough setup to make it legible; the peak may be physical, spatial, typographic or human, and its position is variable.
- inv-04: Bind different modules with one strict contrast system, typography behavior and recurring assembly physics.
- inv-05: Prove breadth once before the final action using a device native to the concept—continuous space, physical transformation, one montage, radial staging or audience behavior.
- inv-06: Keep all visible copy short, complete and motion-safe: text lands at final size on a cut or via a hard mask and remains sharp long enough to read.`,
    guidance: 'Apply the selected Creative DNA as a lower-priority composition mechanism. Translate compatible invariants and slots into required MiniMax H3 top-level fields, [Shot N] timeline, camera continuity, soundscape, and music rules.',
  },
  {
    id: 'fixed-composition-medium-ladder',
    name: 'Fixed Composition Medium Ladder',
    summary: 'Lock composition while guides, structure, materials, context, and restrained in-medium motion complete layer by layer.',
    creativeDNA: `Reusable Creative DNA (mechanism and production grammar only):
A fixed composition turns creation into a readable causal ladder: low-commitment guides establish geometry, committed structure locks it, material finish adds specificity, contextual details certify completion, and one restrained in-medium motion supplies the final surprise.
Invariants:
- inv-01: Lock the camera and reserve stable spatial zones before any marks appear.
- inv-02: Progress from low-commitment guides to committed structure to material colour or finish.
- inv-03: Delay secondary labels, studies or context until the hero form is already readable.
- inv-04: End with one subtle motion that remains faithful to the finished medium while the support stays inert.`,
    guidance: 'Apply the selected Creative DNA as a lower-priority composition mechanism. Translate compatible invariants and slots into required MiniMax H3 top-level fields, [Shot N] timeline, camera continuity, soundscape, and music rules.',
  },
  {
    id: 'dimensional-carrier-loop',
    name: 'Dimensional Carrier Loop',
    summary: 'Continuously track a carrier as it upgrades from flat trace to environmental rewrite, then contracts back to an opening-equivalent location.',
    creativeDNA: `Reusable Creative DNA (mechanism and production grammar only):
A small anomaly leaves a low-information real anchor as one continuously tracked carrier, escalates from flat trace to spatial figure to volumetric material, uses a contact peak to distribute its visual grammar across ordinary environmental anchors, then contracts into a reduced residue that returns to an opening-equivalent location.
Invariants:
- inv-01: Introduce one legible impossible seed on a stable ordinary anchor before explaining it.
- inv-02: Keep one identifiable carrier or trajectory visible across every handoff, and motivate camera attention with that carrier.
- inv-03: Escalate through at least three materially different representation regimes before the environmental peak.
- inv-04: Use recurring practical anchors first as ordinary objects and later as hosts for the transformed visual grammar.
- inv-05: After the maximum-scale state, reduce the effect to one small residue and return it to the origin or a clear opening analogue.`,
    guidance: 'Apply the selected Creative DNA as a lower-priority composition mechanism. Translate compatible invariants and slots into required MiniMax H3 top-level fields, [Shot N] timeline, camera continuity, soundscape, and music rules.',
  },
  {
    id: 'pressure-to-goal-journey',
    name: 'Person-Anchored Goal Journey',
    summary: 'Use a stable person as an emotional coordinate, completing arrival from constrained work pressure into an expanded goal space via physical interaction, parallax, scale, and lighting.',
    creativeDNA: `Reusable Creative DNA (mechanism and production grammar only):
A recognizable person remains the emotional coordinate while an externally observed journey moves from constrained work pressure into an expanded goal space. Context is revealed through material interactions and camera parallax rather than direct exposition; scale and light increase toward the transition, and a final task-completing interaction—not a gesture to the lens—turns anticipation into earned arrival.
Invariants:
- inv-01: Keep one recognizable person emotionally legible across changing spaces, using face, posture or task behavior as the recurring anchor.
- inv-02: Make every contextual reveal originate from a physical interaction—moving a cart, opening geometry, passing an obstacle or handing off an object—and let the camera discover it through parallax, reframing or occlusion.
- inv-03: Create one legible transition from compressed effort to expanded possibility using at least two of scale, light, depth, sound or traffic flow.
- inv-04: Choose a capture grammar appropriate to each new world and keep its rules consistent.
- inv-05: Resolve arrival through one task-completing physical interaction between the person and the goal environment.`,
    guidance: 'Apply the selected Creative DNA as a lower-priority composition mechanism. Translate compatible invariants and slots into required MiniMax H3 top-level fields, [Shot N] timeline, camera continuity, soundscape, and music rules.',
  },
  {
    id: 'cross-medium-contact-reaction',
    name: 'Cross-Medium Contact Reaction',
    summary: 'A single contact between live-action and 2D elements triggers a clear three-stage reaction, resolving with a medium-specific impossible effect.',
    creativeDNA: `Reusable Creative DNA (mechanism and production grammar only):
A single flat 2D character shares a locked photoreal environment with a real hand; one small cross-medium contact causes a three-stage readable reaction that ends in a medium-specific impossible effect.
Invariants:
- inv-01: Keep exactly one flat animated character inside an otherwise photoreal, stable environment.
- inv-02: Show real-to-animated contact before the reaction begins.
- inv-03: Escalate in three readable states: neutral, discomfort, impossible payoff.
- inv-04: Keep the camera locked and let contact, expression, and effects move attention.`,
    guidance: 'Apply the selected Creative DNA as a lower-priority composition mechanism. Translate compatible invariants and slots into required MiniMax H3 top-level fields, [Shot N] timeline, camera continuity, soundscape, and music rules.',
  },
  {
    id: 'clarity-over-quantity-reversal',
    name: 'Clarity Over Quantity Reversal',
    summary: 'Allow quantity and noise to dominate initially, then execute a reversal and physical proof using one restrained, legible corrective signal.',
    creativeDNA: `Reusable Creative DNA (mechanism and production grammar only):
A noisy system makes quantity look powerful, one restrained corrective signal interrupts it, and a physical consequence proves that calibrated clarity beats accumulation.
Invariants:
- inv-01: Show the asymmetric one-versus-many matchup before either side explains it.
- inv-02: Let the many-item side perform longer and occupy more space before the concise answer.
- inv-03: Give the single corrective signal a dedicated sensory close-up.
- inv-04: End with calm control versus noisy consequence, not another explanation.`,
    guidance: 'Apply the selected Creative DNA as a lower-priority composition mechanism. Translate compatible invariants and slots into required MiniMax H3 top-level fields, [Shot N] timeline, camera continuity, soundscape, and music rules.',
  },
  {
    id: 'proof-object-reaction-handoff',
    name: 'Proof Object Reaction Handoff',
    summary: 'An urgent intervention creates conflict, a controlled visual proof reveals hidden risks, and a motivated camera handoff lands on the recipient reaction.',
    creativeDNA: `Reusable Creative DNA (mechanism and production grammar only):
An urgent intervention creates conflict, a controlled visual proof makes the hidden risk undeniable, and one motivated camera handoff transfers that proof to the recipient's compact reaction.
Invariants:
- inv-01: Establish an urgent conflict through action before revealing the proof state.
- inv-02: Hold the proof state visually stable long enough to be understood before the camera hands off.
- inv-03: Use one motivated reframe to hand the last line to a contrasting second speaker.`,
    guidance: 'Apply the selected Creative DNA as a lower-priority composition mechanism. Translate compatible invariants and slots into required MiniMax H3 top-level fields, [Shot N] timeline, camera continuity, soundscape, and music rules.',
  },
];
