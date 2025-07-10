## Question 6

The family name `my custom family name` is defined by two `FontLibrary` nodes **before** the `FontStyle` that refers to it, and another `FontLibrary` **after**.

Which one should matter? The one before the `FontStyle`? The first? The last? Should we make a warning, error?

I named them `FL1`, `FL2`, and `FL3` respectively, to make it easier to talk about them.