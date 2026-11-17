---
name: lesson-audio-build
description: >-
  Use when a lesson needs teacher-made audio or video, such as a listen-and-check recording of a
  book exercise, a listening script read aloud or drill clips for a deck, and when that audio comes
  back to be checked: "audio for U39", "record the listen-and-check for U39 Ex.1", "write the Gemini
  audio brief", "the Codex prompt for the listening script", "new voice for the NASA audio", "drill
  clips for the deck", "I put the recording in Drive, check it" or "is the audio the same as the
  script". Checks the script against the key, writes the scripts plus a ready-to-paste production
  brief for the Gemini app and one for Codex (British AI voice, pace, pauses, file names, clip
  split), which Andrii runs on his Mac; then transcribes his files back against the script, writes a
  clip map with durations and words per minute, keeps the files in his private Drive, and leaves the
  room listen-through to him.
---

# Lesson audio build

Andrii's grammar packs replace the publisher's audio with teacher-made recordings: the completed
exercises, read in British English by an AI voice and played from a Listen-and-check button in the
deck (U36–U38). The class checks its answers against what the voice says, so a dropped or changed
word teaches a wrong answer. Every recording is checked against its script and key, labelled as an
AI voice, and heard by Andrii before class. A transcript proves the words, not the sound: three of
L17's correction clips put the stress on the whole date, and their cards stayed hidden until
re-recorded.

**Who makes the audio.** Andrii produces lesson audio and video himself, on his Mac, with the Gemini
app or with Codex (GPT). This skill prepares everything he pastes in and checks what comes back; it
never generates the audio. ElevenLabs is no longer used: do not reach for its connector, even when
one is attached to the session. A recording made with it earlier keeps its ElevenLabs disclosure,
because that is how it was made; its voice (the L17 guide names Alice) does not carry over.

What a slide shows while the audio plays is `celta-handout`'s call (one active moment, one focal
element). This skill makes the scripts and briefs and checks the audio.

## Where things live
- Scripts, keys, plans and decks: the lesson folder in Andrii's private Google Drive.
- Working files (downloaded audio, transcripts, a joined track): a scratch folder outside this
  repository, such as the session scratchpad or `/tmp`. Never the repository tree.
- Scripts, briefs, finished audio and the clip map: the lesson folder in Drive under a new version,
  after `account-check` has named the right Google account, or handed to Andrii. Point to them by
  title, never by link or ID.
- Recordings of MyGrammarLab exercise text are classroom material. They never go into this public
  repository or onto the site.
- The script goes to Gemini or to OpenAI through Codex, both outside services. It names no learner
  and says nothing about one: use fictional or avatar names. Anything from this work that would be
  committed here passes `learner-data-guard` first.

## What runs where
| Step | Who | Where |
| --- | --- | --- |
| 1–3 script, voice spec, the two briefs | Claude or Codex | any session; files to Drive or to Andrii |
| 4 produce the audio | Andrii | his Mac: the Gemini app, or Codex (GPT) |
| 5–7 transcribe back, clip map, disclosure | Claude or Codex | on the files he puts in Drive |
| 8 listen-through and room check | Andrii | his Mac and the classroom |

A cloud session cannot reach his Mac. Never claim a file was produced, uploaded or heard; wait for
Andrii to say it is in Drive, then read it from there. Never simulate a transcript.

## 1. Fix the script
- **Source.** The exact script version the plan names (for example "script V5"). For a
  listen-and-check, the exercise's completed sentences: the book's sentence with the key's answer in
  place. Never the publisher's audio or a transcript of it.
- **Check it against the key.** If the converted knowledge base is in the session (a folder outside
  this repository holding `BOOKS.md` and `quote_check.py`), run
  `python3 -I <KB>/quote_check.py mgl "<completed sentence>"` for every item. It needs at least four
  words, so check whole sentences. The key texts for the next two units are already there: U39
  "David has been watching TV all afternoon" (mgl line 803) and U41 "It probably won't rain this
  weekend" (line 827).
  - A NOT FOUND on an error-correction item means "check the page image", not "the key is wrong":
    the scan's text loses strikethrough and mixes the two columns.
  - The student's book is a scan with no text. Where the key gives only the answer, the rest of the
    sentence comes from the page image or from the lesson file that quotes it.
  - Fix scan artefacts ("M y" for "My") against the page image. The voice reads what it is given.
  - Without the knowledge base, Andrii confirms the script. Record which check ran.
- **Two right answers.** Where the key accepts two (a slash, or "both possible" on the slide), the
  recording can say only one. Record the one the slide shows first, and check that the slide also
  shows the other. List the choice for Andrii.
- **Versions agree.** For a listening script, the plan, the key header and the script must name the
  same script version. The L15 key once belonged to an older script (NEEMO 15). A mismatch stops the
  build until Andrii settles it.
- **Split** the script into parts: one per exercise item, numbered as on the slide, or one per
  paragraph of a listening text. Each part becomes one clip. Mark every key answer: each must be
  heard word for word.

## 2. Voice and delivery spec
One spec, shared by both briefs, so the units sound alike whichever tool Andrii uses.
- **Accent.** British English (Southern standard), as the grammar packs require (U36–U38 plans,
  line 3). A dialogue gets one voice per speaker, each named in the spec.
- **Voice.** Reuse the voice the last unit made with the same tool, as named in its clip map. If
  none is recorded for that tool, ask for a clear, neutral adult British voice and have Andrii name
  the one he kept, so the clip map can record it. A voice name comes from a clip map or from Andrii,
  never from memory.
- **Pace.** Follow the last clip map for the same kind of audio (L15's listening ran at 131.4 wpm);
  without one, aim at 120–140 wpm for a listening text and a little slower for listen-and-check
  items. Ask for natural weak forms and contractions exactly as written.
- **Stress.** For each correction or drill item, mark the word that carries the stress, so the L17
  defect (stress on the whole date) is in the brief, not discovered in class.
- **Item numbers.** Read aloud or not, following the earlier units, or ask Andrii.
- **Pauses.** The gap between parts (1 s unless the plan or Andrii sets another), and whether the
  tool adds it or Claude joins the clips afterwards (step 6).
- **Files.** One file per part, named `<lesson>-<exercise>-part<NN>.mp3` (part01, part02 …, in
  script order), plus the final title from step 7. MP3 or WAV, 44.1 kHz, mono is enough.

## 3. The two production briefs
Write both, so Andrii can use whichever tool he opens. Each is one block he pastes as it is: no
placeholders left, the script parts word for word, nothing added to the text the voice reads.

**Gemini app brief** (spoken-audio request):
```text
Read the following lines aloud as audio, in a <accent> voice: <voice description or name>.
Pace about <wpm> words per minute. Natural weak forms; keep every contraction exactly as written.
Read each part exactly as written: do not add, drop or change any word, and do not read the part
labels. <Read / Do not read> the item numbers. Stress: <part: word>, ….
Make one separate audio file per part, named as shown, with no music or sound effects.
Part 01 → <file name>: "<exact text>"
Part 02 → <file name>: "<exact text>"
…
```

**Codex brief** (a task for Codex on his Mac, which writes and runs the code):
```text
Make lesson audio on this Mac with an OpenAI text-to-speech model. Do not change the text.
Voice: <name if recorded, else a clear neutral voice; tell me which one you used>.
Speaking instructions for the model: <accent>, about <wpm> wpm, natural weak forms, contractions
as written, no added words, stress: <part: word>, ….
Output folder: ~/Desktop/<lesson>-audio/. One file per part, named as listed below.
<If one track:> Then join the parts in order with ffmpeg, <gap> s of silence between parts, into
<track file name>, and print each file's duration with ffprobe.
Never print or commit the API key. Do not put these files in any git repository.
Part 01 → <file name>: "<exact text>"
…
```
- For a **video**, the same spec and script go into the brief as the narration, with what each
  scene shows taken from the plan; step 5 checks the narration on its audio track
  (`ffmpeg -i video.mp4 -vn -ac 1 -ar 16000 narration.wav`).
- Save the script and both briefs in the lesson folder in Drive under the audio's version
  ("Brief – Audio – Unit 39 present perfect continuous – Ex.1 – V1"), or hand them to Andrii.
- Tell Andrii what to do next in one line: make the audio with either brief, put the files in the
  lesson folder in Drive, and say which tool and voice he used.

## 4. Andrii produces the audio
His step, on his Mac. Nothing in this skill runs until he says the files are in Drive. If he made
one long file instead of one per part, that is fine: step 6 times it by its pauses.

## 5. Transcribe back and compare
- Download the files from the lesson folder in Drive into the scratch folder (the Drive connector,
  after `account-check`).
- Transcribe each part with a speech-to-text tool that runs in the session, outside the repository,
  for example `pip install faster-whisper` and the `small.en` model, keeping word timestamps. If no
  such tool can be installed, the word check is NOT RUN and Andrii listens against the script, or
  he asks Codex on his Mac to transcribe the files with a local tool and puts the transcript in
  Drive. A transcript by the same tool that made the audio is not a check.
- Compare each transcript with its script part. Ignore case, punctuation, curly quotes and spacing,
  and count "3" and "three" as the same. Every other difference is listed.
- A missing or extra word is a defect, and so is any changed word in a key answer, or a part label
  or item number read when the brief said not to.
- A contraction against a full form ("won't" and "will not") is listed as "check by ear". The voice
  or the transcriber may have changed it, and in some items the contraction is the answer.
- Only Andrii can clear a difference, after hearing that part. Never edit the script or the key to
  match a transcript. A part that fails goes back to him with a one-part brief for the re-record.

## 6. Clip map
- **One track or separate clips?** Follow the deck. A Listen-and-check button or a listening player
  plays one track per exercise or text, and its replays seek to the clip map's times. Drill and
  correction clips play one file per button.
- To make one track from his separate files, join the parts in script order with a fixed gap (1 s
  unless the plan or Andrii sets another). Convert every part to one format first, so the lengths
  add up exactly:

```bash
# in the scratch folder, never inside this repository
for f in part*.mp3; do ffmpeg -y -loglevel error -i "$f" -ar 44100 -ac 1 "${f%.mp3}.wav"; done
ffmpeg -y -loglevel error -f lavfi -i anullsrc=r=44100:cl=mono -t 1 gap.wav
# list.txt holds one line per file, in order: file 'part01.wav', file 'gap.wav', file 'part02.wav' …
ffmpeg -y -loglevel error -f concat -safe 0 -i list.txt -c copy track.wav
ffmpeg -y -loglevel error -i track.wav -c:a libmp3lame -q:a 2 track.mp3
ffprobe -v error -show_entries format=duration -of csv=p=0 track.mp3
```

- Part n starts at the sum of the earlier parts and gaps, and ends at its start plus its own length
  (`ffprobe` on its WAV). The track's length must equal that sum within 0.1 s; MP3 encoding adds a
  few hundredths.
- **A single file he made**: time it by its pauses,
  `ffmpeg -i track.mp3 -af silencedetect=noise=-40dB:d=0.5 -f null - 2>&1 | grep silence_`, or by
  the transcript's word timestamps. The pauses found must number one fewer than the parts. If they
  do not, adjust `d`, or report the clip map NOT RUN.
- Words per minute: the script's words divided by the track's minutes, pauses included. L15's audio
  v7 ran 108.7 s at 131.4 wpm.
- **Fit.** The plan stage that plays the track must hold it, with the replays the plan states.
  Report the speech rate; whether it suits the class is Andrii's call.

```text
Clip map · <lesson> · <exercise or text> · audio V<n> from script V<m> (or: from the mgl key)
Made by Andrii with <Gemini app / Codex: model> · voice <name> · gap <s> s
Track <file title> · <total> s · <words> words · <wpm> wpm
| part | start (s) | end (s) | words | opens with | transcript |
Checked: script by <quote_check or Andrii> · transcripts <n clean, n listed> · ear: pending
```

## 7. Disclose and name
- The plan's materials line and the slide or audio bar that plays the recording both say:
  "Teacher-made recording · AI voice (<Gemini or OpenAI via Codex, as used>), British English · not
  the publisher's audio". If the script adapts a real person's words, add that the voice is not
  theirs, as L15 does.
- Name the audio with its script version: audio v7 goes with script V5. Titles follow the pack's
  pattern, Type – Focus – Topic – variant – Vn. The variant is the exercise for a listen-and-check
  ("Audio – Grammar – Unit 39 present perfect continuous – Ex.1 – V1.mp3") and the script version
  for a listening text ("… – script V5 – Vn.mp3"). The plan's materials line, the key header and the
  clip map name both versions.
- A new recording is a new version beside the old one. Switching the deck to it, and retiring the
  old file, is Andrii's decision after he has listened.

## 8. Andrii's ear (the human gate)
- The acoustic listen-through (joins, clicks, pace, stress, weak forms) and the room-speaker check
  are his. Until he confirms both, the plan and the key say "acoustic listen-through and
  room-speaker check pending — listen once before class", as L15 does.
- Nothing that only a transcript has checked is called verified or ready.
- A clip he rejects stays hidden on its slide until it is re-recorded, as L17's cards 2, 5 and 6
  were. A re-record goes back to step 3 with a brief for just those parts.

## 9. Pack check
Run `lesson-pack-gate` on the pack, so the audio and script versions agree across the plan, key,
deck and schedule, and the disclosure is in place.

## Report
```text
Lesson audio: <lesson> · <exercise or text> · audio V<n> from script V<m>
Script check: quote_check <n FOUND, n NOT FOUND sent to the page image>, or Andrii confirmed, or NOT RUN (<why>)
Briefs: Gemini app and Codex, saved as <titles> or handed to Andrii · audio from Andrii: waiting, or in Drive (<tool, voice>)
| part | file | transcript (clean, or the words listed) | start–end (s) |
Track: <total> s · <wpm> wpm · fits <stage, minutes>: yes or no
Two-answer items: <item: the answer recorded, the other shown on the slide>
Disclosure: plan yes or no · deck yes or no
Files: <titles> in the <lesson> folder in Drive (no links or IDs)
Pending for Andrii: produce the audio · listen-through · room-speaker check · <clips hidden>
NOT RUN: <step and why>
```

## Done when
Before the audio exists: the script matches the key, or Andrii confirmed it, and both briefs are
complete and with him. After he has put it in Drive: no transcript difference remains that he has
not cleared by ear; the clip map covers every part; the track fits the plan's timing; the
disclosure names the tool used, on the plan and the deck; the files are in Drive under new versioned
titles; the status says pending until he has listened; `lesson-pack-gate` has run on the pack; and
the routing evals pass (`SKILL_EVAL_ONLY=lesson-audio-build npm run eval:skills`).
