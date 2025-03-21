## Question 4

The family name `my custom family name` is defined
by `FontLibrary` in the `inline_child.x3dv`.

It *referred to* by the `FontStyle` node in the
`inline_parent.x3dv`.

Should it have an effect when rendering "Hello World from inline parent!"?

I think *no*, following how `Fog` affects inlined content. `Fog` in the parent affects the inlined content, but `Fog` in child does not affect parent. But then, `Fog` is a "bindable node" so it has its own mechanism altogether, it's not that simple analogy.

## Specification Discussion

Quoting [mail from Don Brutzman](https://web3d.org/pipermail/x3d-public_web3d.org/2025-March/021370.html) on 2025-03-07:

Looks similar to question 2, using ExternProtoDeclare/ProtoInstance rather than Inline.  (But very tricky!  thanks!)

- Again a good question, the draft design prose does not yet say.
- We note that FontLibrary is defined as an X3DNode, not an X3DChildNode, and so it might only appear at the root of the scene (or within FontStyle as a fontLibrary field, if that approach is also allowed).
- We would expect that
    - FontLibrary fonts are available for reference and retrieval in the scene where the ProtoInstance is created at run-time.
    - If that ProtoInstance loads FontLibrary fonts at run time, they are also visible throughout the scene.
    - Curiously: if the ProtoInstance has a FontLibrary as one of its root nodes, then specifying that FontLibrary is an X3DChildNode may be advisable... But it might simply work best if we keep semantics the same as other root-node roles.  Note that a ProtoInstance can contain multiple root nodes - only the first might be rendered, but other nodes can also be included at that level, and FontLibrary does not require rendering anyway.
    - This approach thus seems to allow a ProtoInstance to contain multiple root FontLibrary nodes.  This would effectively be a ProtoInstance with a collection of multiple fonts - which is an important use case.
    - Conceptually, keeping FontLibrary as a root node reinforces the nature of font sharing throughout the scene.
- If the ProtoInstance itself has Inline nodes, then fonts are handled as defined in questions 1 and 2.
