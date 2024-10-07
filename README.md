thimbleful (Noun, ˈθɪmbəlˌfʊl) ⸺

1. As much as a timble will hold
2. A very small quantity, specifically of alcoholic beverages
3. Just enough Javascript to make your single page app come to life

## Welcome!

Most websites I build aren't really that complicated, and do not warrant big
build systems or thick frameworks and libraries.

However, I did find myself rewriting these few bits of Javascript in some form
or another time and time again. Which started to get annoying.

So, in the spirit of [Vanilla JS](http://vanilla-js.com/), I guess this
collection of snippets is my attempt at a non-framework framework 🎈

Automatically generated documentation for these scripts [can be browsed
here](https://timendus.github.io/thimbleful/jsdoc/).

## How to use

Copy whatever looks interesting from this repository into your own project.
Modify it to fit your needs where needed. The documentation is in the comments.

**Note that it is GPL v3 licensed**, so make sure you release your changes to
the files under the GPL too. The easiest way to do that is probably to make a
pull request on this repository. I may or may not merge it, but at least it's
been published then. If you need a more permissive license for some reason,
contact me.

## Looking for the old version?

It's still here, in the
[`old-version`](https://github.com/Timendus/thimbleful/tree/old-version) branch.
The old version is also still available on NPM, and still hosted at the old URL
https://timendus.github.io/thimbleful/thimbleful.min.js.

However, I would suggest you migrate away from it.

I've refactored this codebase in 2024, because I thought that even my
non-framework code had gotten a bit too convoluted. Using singletons on classes
was too enterprisey for me in a world of first class module support. And having
a build step and a package just seemed complete overkill now.

I've come to believe that in 99% of cases it's better and easier to just do a
little copying and pasting than to have a little dependency. Both for me (having
to maintain stuff, keeping it backwards compatible, etc) and for you (having the
risk of me breaking your stuff or injecting malware).

## Contributing

Found a bug? Added a feature that everyone needs? Feel free to make a pull
request.
