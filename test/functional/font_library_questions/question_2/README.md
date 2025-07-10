## Question 2

The family name `my custom family name` is defined
by `FontLibrary` in the `inline_child.x3dv`.

It *referred to* by the `FontStyle` node in the
`inline_parent.x3dv`.

Should it have an effect when rendering "Hello World from inline parent!"?

I think *no*, following how `Fog` affects inlined content. `Fog` in the parent affects the inlined content, but `Fog` in child does not affect parent. But then, `Fog` is a "bindable node" so it has its own mechanism altogether, it's not that simple analogy.

## Specification Discussion

Quoting [mail from Don Brutzman](https://web3d.org/pipermail/x3d-public_web3d.org/2025-March/021370.html) on 2025-03-07:

rephrased: does a parent scene, which includes a child Inline scene, have access to FontLibrary fonts defined in the child?

- Again a good question, the draft design prose does not yet say.
- As indicated in our response to Question 2, we think it is possible but generally not desirable.
- Important consideration for parent-child scene relationships is that the author of a child scene might have no idea that a parent scene has included it as an inline.
- We do not think that FontLibrary should be an X3DBindableNode (like Fog, Viewpoint, Background etc.)  However if an implementer wants to use a stack internally to implement such downward-looking scope, that is up to them.

## Michalis summary of above answer

OK, agreed. That is, FontLibrary in child *does not* affect the parent.

To be clear, I didn't suggest that it should be X3DBindableNode. FontLibrary is very different from X3DBindableNode. My comment in https://github.com/michaliskambi/x3d-tests/blob/master/font_library_questions/question_2/README.md merely indicates that drawing analogies (which I did myself) between "how `Fog` works" and "how `FontLibrary` should work" has limits, because `Fog` has a "bindable" mechanism (only one is active at a time), while `FontLibrary` is not (many `FontLibrary` can be top-level and affect content). We are in agreement here as I understand, i.e. FontLibrary is *not* X3DBindableNode, this would make no sense.
