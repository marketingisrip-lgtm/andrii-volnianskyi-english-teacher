---
name: lesson-audio-build
description: >-
  Use when a lesson needs teacher-made audio, such as a listen-and-check recording of a book
  exercise, a listening script read aloud or drill clips for a deck: "record the listen-and-check
  for U39 Ex.1", "make the audio for the listening script", "new voice for the NASA audio", "drill
  clips for the deck" or "is the audio the same as the script". Checks the script against the key,
  generates the audio with a disclosed British AI voice only after Andrii approves the credit spend,
  transcribes it back and compares it with the script, writes a clip map with durations and words
  per minute, keeps the files in his private Drive, and leaves the room listen-through to him.
---

# Lesson audio build

Andrii's grammar packs replace the publisher's audio with teacher-made recordings: the completed
exercises, read in British English by an AI voice and played from a Listen-and-check button in the
deck (U36–U38). The class checks its answers against what the voice says, so a dropped or changed
word teaches a wrong answer. Every recording is checked against its script and key, labelled as an
AI voice, and heard by Andrii before class. A transcript proves the words, not the sound: three of
L17's correction clips put the stress on the whole date, and their cards stayed hidden until
re-recorded.

What a slide shows while the audio plays is `celta-handout`'s call (one active moment, one focal
element). This skill makes the audio and checks it.

## Where things live
- Scripts, keys, plans and decks: the lesson folder in Andrii's private Google Drive.
- Working files (downloaded takes, transcripts, the joined track): a scratch folder outside this
  repository, such as the session scratchpad or `/tmp`. Never the repository tree.
- Finished audio and its clip map: back to the lesson folder in Drive under a new version, after
  `account-check` has named the right Google account, or handed to Andrii. Point to them by title,
  never by link or ID.
- Recordings of MyGrammarLab exercise text are classroom material. They never go into this public
  repository or onto the site.
- The script is sent to ElevenLabs, an outside service. It names no learner and says nothing about
  one: use fictional or avatar names. Anything from this work that would be committed here passes
  `learner-data-guard` first.

## What runs where
Steps 2–5 need the ElevenLabs connector. Codex has none, so in Codex they are NOT RUN, and the same
holds in a Claude session without the connector. Never simulate a generation or a transcript. Do
step 1, hand Andrii the checked script split into parts, and run steps 6–9 on the audio he supplies.

## 1. Fix the script (before any credit is spent)
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
  paragraph of a listening text. Each part becomes one generation. Mark every key answer: each must
  be heard word for word.

## 2. Choose the voice
- British English, as the grammar packs require (U36–U38 plans, line 3).
- Reuse the earlier voice, so the units sound alike. The L17 guide names Alice. Find it with
  `creative_list_voices` (languages `["en"]`, the British accent filter, and the voice's name as the
  search) and take its voice_id from the result. A voice_id comes only from that tool or from
  Andrii, never from memory.
- If no earlier pack names a voice, choose a clear British voice there and name it at the owner
  gate. A dialogue gets one voice per speaker.
- Use the same voice and model for every part, and record both in the clip map so the next unit can
  reuse them.

## 3. Owner gate: the credit spend
Every speech generation and every transcription is charged, and a second call to retry is charged
again.
1. Create one flow with `creative_create_flow`, named after the recording ("U39 listen-and-check
   audio V1"), and pass its flow_id to every call that follows.
2. Price the run with `estimate_only: true` on `creative_generate_speech`. It generates nothing.
3. Tell Andrii in one message: the number of speech calls; the takes per call (the connector makes
   two by default, and the cost scales with the takes); one transcription per part, plus one for
   each second take you may need to try; the estimated credits; the voice; the script version; the
   gap between parts; and whether item numbers are read aloud (follow the earlier units, or ask).
   Offer one take per call if he wants it cheaper. Change the take count only when he asks.
4. Wait for an explicit yes. No yes, no generation. A re-record later is a new spend and needs a new
   yes.

## 4. Generate
- One `creative_generate_speech` call per part, on the one flow, with the same voice_id and model.
  The prompt is the part's exact script text, with nothing added.
- Poll `creative_get_flow_run_status` with the flow_id and session_ids, waiting the
  poll_after_seconds it gives, until all_completed or has_failures.
- A slow run is not a failed run. If a call errors or times out, read the flow with
  `creative_get_flow` before anything else: the generation may be running. On has_failures, stop and
  tell Andrii which part failed. Never call again without his yes.

## 5. Transcribe back and compare
- For each part, pin the first take on the flow with `creative_add_flow_asset_node` (modality
  `audio`, that take's generation_id). Call `creative_transcribe_audio` with connect_from set to the
  pinned node, on the same flow. Poll as above, then read `transcripts`: the text, and each word's
  start and end in seconds in `words`.
- Compare each transcript with its script part. Ignore case, punctuation, curly quotes and spacing,
  and count "3" and "three" as the same. Every other difference is listed.
- A missing or extra word is a defect, and so is any changed word in a key answer. Before asking for
  a re-record, transcribe the second take, which is already paid for.
- A contraction against a full form ("won't" and "will not") is listed as "check by ear". The voice
  or the transcriber may have changed it, and in some items the contraction is the answer.
- Only Andrii can clear a difference, after hearing that part. Never edit the script or the key to
  match a transcript.
- **Audio that already exists** (a recording from an earlier session): put it on a flow (its
  generation on the original flow, or a direct https link with `creative_attach_reference_file`),
  then compare as above. The transcription is charged, so step 3 comes first. If the file cannot be
  put on a flow, the word check is NOT RUN, and Andrii listens against the script instead.

## 6. Clip map
- Download each kept take into the scratch folder. `creative_get_generations` gives its signed
  full_res_url and spends nothing.
- **One track or separate clips?** Follow the deck. A Listen-and-check button or a listening player
  plays one track per exercise or text, and its replays seek to the clip map's times. Drill and
  correction clips play one file per button.
- To make one track, join the parts in script order with a fixed gap (1 s unless the plan or Andrii
  sets another). Convert every part to one format first, so the lengths add up exactly:

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
- Words per minute: the script's words divided by the track's minutes, pauses included. L15's audio
  v7 ran 108.7 s at 131.4 wpm.
- **Timing a track with no transcript** (Codex, or no connector):
  `ffmpeg -i track.mp3 -af silencedetect=noise=-40dB:d=0.5 -f null - 2>&1 | grep silence_`.
  The pauses found must number one fewer than the parts. If they do not, adjust `d`, or report the
  clip map NOT RUN.
- **Fit.** The plan stage that plays the track must hold it, with the replays the plan states.
  Report the speech rate; whether it suits the class is Andrii's call.

```text
Clip map · <lesson> · <exercise or text> · audio V<n> from script V<m> (or: from the mgl key)
Voice <name> (voice_id <id>) · model <model> · gap <s> s · takes kept <part: take>
Track <file title> · <total> s · <words> words · <wpm> wpm
| part | start (s) | end (s) | words | opens with | transcript |
Checked: script by <quote_check or Andrii> · transcripts <n clean, n listed> · ear: pending
```

## 7. Disclose and name
- The plan's materials line and the slide or audio bar that plays the recording both say:
  "Teacher-made recording · AI voice (ElevenLabs), British English · not the publisher's audio".
  If the script adapts a real person's words, add that the voice is not theirs, as L15 does.
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
  were. A re-record goes back to step 3.

## 9. Pack check
Run `lesson-pack-gate` on the pack, so the audio and script versions agree across the plan, key,
deck and schedule, and the disclosure is in place.

## Report
```text
Lesson audio: <lesson> · <exercise or text> · audio V<n> from script V<m>
Script check: quote_check <n FOUND, n NOT FOUND sent to the page image>, or Andrii confirmed, or NOT RUN (<why>)
Spend: approved by Andrii <date> · <n> speech calls × <takes> takes · <n> transcriptions · <estimate>
| part | take kept | transcript (clean, or the words listed) | start–end (s) |
Track: <total> s · <wpm> wpm · fits <stage, minutes>: yes or no
Two-answer items: <item: the answer recorded, the other shown on the slide>
Disclosure: plan yes or no · deck yes or no
Files: <titles> in the <lesson> folder in Drive (no links or IDs)
Pending for Andrii: listen-through · room-speaker check · <clips hidden>
NOT RUN: <step and why>
```

## Done when
The script matches the key, or Andrii confirmed it; no transcript difference remains that he has
not cleared by ear; the clip map covers every part; the track fits the plan's timing; the
disclosure is on the plan and the deck; the files are in Drive under new versioned titles, or with
Andrii; the status says pending until he has listened; `lesson-pack-gate` has run on the pack; and
the routing evals pass (`SKILL_EVAL_ONLY=lesson-audio-build npm run eval:skills`).
