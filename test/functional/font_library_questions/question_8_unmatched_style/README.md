## Question 8

Font family is found within some `FontLibrary`, but not with a matching style.

What should we do?
- Remember that browsers in general cannot "synthesize the missing style", so this is not a good answer, not implementable.
- Should we fallback on another style from the same family?
- Or should it fallback on the browser default font?
