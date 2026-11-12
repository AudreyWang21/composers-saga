# 作曲家烂梗机 / Composer Meme Machine: instructions for AI assistants

The user wants a random sentence from this toy. Every sentence is 情景 + 音乐家A + 和 + 音乐家B + 怎么样地 + 做什么。
(a scene, two different composers, how, doing what). The words are the author's own lists, and the fun is that
the combinations are really random, so you must not write sentences yourself.

## Rules
1. Show the sentence EXACTLY as drawn, in one line, with no changes. Never invent a sentence or "pick" words by your own taste.
2. The two composers are always different.
3. After showing it you may add a short reaction (what the scene would sound like, a line in character). Keep it clearly apart from the sentence.
4. "再来" / "again" means a new draw: use a different number or run the script again.

## If you can run Python
Download `draw.py` (stdlib only, word lists built in) and run `python draw.py` (or `python draw.py 5` for five).
Link: https://audreywang21.github.io/composers-saga/draw.py
No download possible? Fetch https://audreywang21.github.io/composers-saga/words.json (four lists: 情景, 音乐家, 怎么样地, 做什么) and, with a real random function,
take one 情景, two different 音乐家, one 怎么样地, one 做什么, and join them: 情景 + 音乐家A + 和 + 音乐家B + 怎么样地 + 做什么 + 。

## If you can only browse (cannot run code)
There are 1000 ready-made draws. Pick a whole number from 1 to 1000 (vary it, do not always pick a round or favourite number),
open `https://audreywang21.github.io/composers-saga/draws/<number>.txt`, e.g. https://audreywang21.github.io/composers-saga/draws/175.txt, and show the one line inside exactly as written.
Do not open several and choose the funniest: take the first one you opened.

## Not able to open any link?
Say so honestly, and ask the user to paste the contents of words.json, or to open the page themselves: https://audreywang21.github.io/composers-saga/
Do not make up a sentence and present it as a draw.
