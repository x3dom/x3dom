Welcome to X3DOM 
================
X3DOM is a framework for integrating and manipulating (X)3D scenes as HTML5
DOM elements, which are rendered via an X3D plugin, Flash/Stage3D or WebGL.
The open-source system allows defining 3D scene description and runtime
behavior declaratively, without any low-level JavaScript or GLSL coding.


Getting started
---------------
Please have a look at the official documentation in order to get started:

http://doc.x3dom.org


Need help?
----------
If you want to use X3DOM and seek help and exchange of knowledge, please use
the x3dom-users mailing list or the forums. Beginner questions usually have
been asked already and in many cases the mailinglist or forum archives provide
quick answers to many questions.

If you decide to post to the mailing list or forum, please include as much
info as possible and describe your problem and what you tried already
succinctly.


Mailing List
-------------
Please use the mailinglists as much as you can. The 
[x3dom-users][] list is the one you are most likely interested in 
and the first address for help or questions.


Issue Tracker
-------------
Please report issues and attach patches here. For general help and questions
direct your inquiry to the x3dom-users mailing list or one of the forums.

https://github.com/x3dom/x3dom/issues


**Uploading Files to the Issue Tracker**   
The GitHub issue tracker does not allow to upload files. However, there is a
service that helps you with sharing files: https://gist.github.com. Just copy
and paste your file contents there and then copy the Gist URL into the
issues form.

It immensely helps us if you can provide a live web page illustrating your
problem. So if you have webspace and can upload and post the URL with your
issue, the chances we will have a look at it increase.


Contributing
------------
We encourage you to contribute to X3DOM! If you would like to contribute to
X3DOM, you should subscribe to the developers mailing list ([x3dom-dev][]), 
where the developers of X3DOM discuss the development of the library itself.

You can send pull requests via GitHub. Patches should:

  1. Follow the style of the existing code.
  2. One commit should do exactly one thing.
  3. Commit messages should start with a summary line below 80 characters 
     followed by a blank line, and then the reasoning/analysis for why the 
     change was made (if appropriate).
  4. Commits that fix a bug in a previous commit (which has already been 
     merged) should start with `fixup!` and then the summary line of the 
     commit it fixes.
  5. Rebase your branch against the upstream’s master. We don’t want to pull 
     redundant merge commits.
  6. **Be clear about what license applies to your patch:** The files within 
     this repository are under the GPL3 (or later) but, as the original 
     creators, we are still allowed to create non-free derivatives. However, 
     if patches are given to us under GPL then those cannot make it into any 
     non-free derivatives we may later wish to create. So to make it easier 
     for us (and avoid any legal issues) we prefer if patches are released as 
     public domain.


### GitHub Workflow

Developing patches should follow this workflow:

  1.  Fork on GitHub (click Fork button)
  2.  Clone to computer: `git clone git@github.com:«github account»/x3dom.git`
  3.  cd into your repo: `cd x3dom`
  4.  Set up remote upstream: `git remote add -f upstream git://github.com/x3dom/x3dom.git`
  5.  Create a branch for the new feature: `git checkout -b my_new_feature`
  6.  Work on your feature, add and commit as usual

Creating a branch is not strictly necessary, but it makes it easy to delete 
your branch when the feature has been merged into upstream, diff your branch 
with the version that actually ended in upstream, and to submit pull requests 
for multiple features (branches).

  7.  Push branch to GitHub: `git push origin my_new_feature`
  8.  Issue pull request: Click Pull Request button on GitHub

#### Useful Commands

If a lot of changes have happened upstream you can replay your local changes 
on top of these, this is done with `rebase`, e.g.:

    git fetch upstream
    git rebase upstream/master

This will fetch changes and re-apply your commits on top of these.

This is generally better than merge, as it will give a clear picture of which 
commits are local to your branch. It will also “prune” any of your local 
commits if the same changes have been applied upstream.

You can use `-i` with `rebase` for an “interactive” rebase. This allows you 
to drop, re-arrange, merge, and reword commits, e.g.:

	git rebase -i upstream/master

There's always the [x3dom-dev][] mailinglist.


[x3dom-users]:   https://lists.sourceforge.net/lists/listinfo/x3dom-users
[x3dom-dev]:     https://lists.sourceforge.net/lists/listinfo/x3dom-developers
[GPL 3]:         http://www.gnu.org/copyleft/gpl.html
