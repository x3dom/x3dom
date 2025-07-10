## Question 1

The family name `my custom family name in parent` is defined
by `FontLibrary` in the `inline_parent.x3dv`.

It *referred to* by the `FontStyle` node in the
`inline_child.x3dv`.

Should it have an effect when rendering `inline_child.x3dv`?
That is, should `inline_child.x3dv` display "my custom family name in parent"
with `DejaVuSans-BoldOblique.ttf`?

Note that answering yes, while it may seem expected, means:

- it means that rendering of `inline_child.x3dv` when it is standalone, opened directly, is different. Maybe that's OK (one can argue it's similar to how `Fog` affects inlined content), but this needs to be clearly documented in spec.

- and if the answer is yes, what is the order when multiple `FontLibrary` nodes define the same family name?

## Specification Discussion

Quoting [mail from Don Brutzman](https://web3d.org/pipermail/x3d-public_web3d.org/2025-March/021370.html) on 2025-03-07:

rephrased: does a child scene, Inlined by a parent scene, have access to FontLibrary fonts defined in the parent?

- Good question, the draft design prose does not yet say.
- In our opinion, font capabilities seem most usable if each font is visible throughout the shared space defined by the topmost scene.
- Since anything other than shared access might be extremely difficult to debug, this should be the same for any parent and descendant scenes.
- Since an author might want to override fonts in contained scenes that they retrieve via Inline, the FontLibrary fonts in child Inline scenes should not be visible upwards.
  - Escape hatch: if someone is really keen to share fonts upwards out of the Inline scene, it is likely possible to do so via EXPORT/IMPORT mechanisms.
- Summary:  downward scope to descendant models.

## Michalis summary of above answer

FontLibrary in parent affects the child.