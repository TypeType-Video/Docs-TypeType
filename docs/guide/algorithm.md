# Choosing your algorithm

::: warning Experimental
The algorithms described here are at version 0.0.1. What they show, their settings and
their names can still change. The page exists only on an instance whose operator
installed the recommender and switched it on.
:::

TypeType can build your home page with an algorithm you pick, read and tune. It says
which of your data it reads, every row on your home page says why it is there, and
what it deduced about you is shown to you and can be corrected.

Only the home page changes. Search, subscriptions and history stay the same.

## Turn it on {#turn-on}

1. Open **Algorithm** in the menu.
2. Under **Home page by algorithm**, switch on **Build my home page with an algorithm
   I choose**.
3. Under **Home page algorithm**, pick one. If you hesitate, open **Which algorithm
   suits me?**: it compares them side by side.
4. Go back to the home page.

The first page can take a few seconds to build. Meanwhile you see the usual home page
with the message "Your home page is cooking"; the new one replaces it by itself.

If **Algorithm** is not in the menu, your instance does not offer it. On some
instances the administrator turned it on for everyone: the option is then already on,
and you can turn it off.

On an empty account, the home page shows a welcome card with two buttons, **Import my
data** and **Choose my algorithm**. An algorithm has nothing to work from until you
import your data or watch a few videos.

## The algorithms {#algorithms}

There is no right answer, only different ways of watching.

| Algorithm | What you will see | Data it reads |
| --- | --- | --- |
| Subscriptions | The newest videos from the channels you follow, in upload order: today, the last seven days, earlier. Nothing is deduced about you. | Subscriptions |
| Discovery | New videos from your subscriptions, videos related to them and to your favorites from channels you do not follow, and trending videos. | Subscriptions and favorites. Never your history. |
| Signals | Videos you started, more from the creators you watched, rows by topic, and a row of creators you never watched. It reacts within minutes to what you just watched. | Video history, favorites, subscriptions |
| Signals, channels | The newest videos of the creators you watch most, and of your subscriptions. | Video history, favorites, subscriptions |
| Signals, videos | The subjects of what you watch, whoever made the video. | Video history, favorites |
| Signals, mix | The creators you watch, and videos on your subjects from any creator. | Video history, favorites, subscriptions |

In the guide, each algorithm carries three meters, from none to high:

- **Personal**: how much the home page depends on what you watch.
- **Discovery**: how much room is left for channels you do not know yet.
- **Variety**: how much the page changes from one refresh to the next.

Every algorithm also reads what you marked **Not for me**, to leave it out, and all
but Subscriptions read what was shown on your home page lately, to avoid repeating
it.

An algorithm is only ever given the data it lists under **Data used**. One that does
not read your history never receives it.

You can switch at any time. Your data and each algorithm's settings are kept.

## The Algorithm page, section by section {#page}

### Overview

Two charts: what your home page is made of (started videos, recently watched,
subscriptions, your interests, new creators, trending) and the share of each of your
interests. Each part leads to the place where it is set.

### Data used {#data}

The page lists the six data categories whose use TypeType lets you manage for
recommendations: video history, Shorts history, favorites, subscriptions, blocked
channels and videos, and videos marked Not for me. Search history is not listed here or
sent to Signals. In blue, what the current algorithm reads; in grey, what is kept
without being used for the home page.

Open a category to set:

- **Collect**: video and Shorts history share this setting. When off, no new watches
  are recorded; existing entries stay according to the retention period.
- **Use for the home page**: off, the items stay recorded but no algorithm reads
  them.
- **Read back**: how far back the algorithm reads, from a few days to no limit. Older
  items stay in your account; they only stop counting for the home page.
- **Exclude** on a single item: that item is kept and never read. **Include** puts it
  back.

None of these choices deletes anything.

### What it keeps {#profile}

What the algorithm deduced from your data. It is empty until you have watched a few
videos.

- **Interests.** Each one is named after the words its video titles share and shows
  how many items it is based on, with a few of your own videos behind it. On each:
  - **Pin**: it always gets a row on the home page;
  - **Hide**: it never comes back on the home page;
  - **Don't take into account**: it stops counting as an interest, but its videos can
    still appear.
- **Add a subject** in your own words, in any language ("astronomy", "Japanese
  cooking"). The algorithm then looks for videos about it.
- **Most watched channels.** Select one to see what it is based on, or to stop it
  counting.
- **Recently watched.** Videos watched a short while ago that still steer the home
  page, each with the minutes it still counts for. **Forget** removes its effect
  without erasing your history.

Interests are found by what titles mean, in any language: a video titled in Arabic and
one titled in English on the same subject land together.

A change applies on the next refresh of your home page.

### Details {#details}

**All settings** lists every setting of the chosen algorithm, by family:

| Family | What it sets |
| --- | --- |
| Sources | Where the algorithm looks for candidate videos |
| Weights | What matters most when ranking the candidates |
| Recent videos | How long a watched video keeps steering the home page |
| Page | The size of the page and how it is shared out |
| Discovery | The room left for what you do not watch yet |
| Randomness | Whether the home page changes on every refresh |

Each setting shows its default value and a **Restore** button, and **Restore
defaults** puts them all back. With randomness off, the same data always gives the
same page.

**How the last home page was built** shows, for the page you just saw: how many videos
were found and from which sources, how many were set aside and why (already watched,
blocked, hidden interests, too many from one channel, from excluded data, Shorts), the
rows with the reason of each, and the best scores with what made each of them. It
comes from the same run that built the page.

If it says no home page was built by an algorithm yet, open the home page first.

**Source code** links to the code of the chosen algorithm.

### My opinions {#opinions}

The opinions you gave on the home page, each with a **Take back** button. Only what
you chose to send is kept, with the algorithm and settings you had at that moment. It
leaves with your export.

## On the home page {#home}

- **Rows and reasons.** Under **Home page layout**, choose **As usual** (one grid) or
  **By category** (one titled row per reason). The videos are the same either way.
- **Not for me.** On a card, **Not for me** takes the video off at once. Under **Why?
  (if you wish)** you may answer **Already seen**, **Not this channel**, **Not this
  topic** or **Other**. **Undo** puts the card back. After **Not this topic**, the
  card offers **Hide the subject**; a hidden subject can be found again under **What
  it keeps**.
- **Does this page suit you?** Answer **Good** or **Not good**, and say what is off
  if you wish: too repetitive, nothing to do with you, too many old videos, your
  channels are missing. Nothing is sent unless you answer.

## Turn it off {#turn-off}

Switch **Build my home page with an algorithm I choose** off. You get the standard
home page back at once. Your choices, corrections and opinions are kept in case you
come back.

## Source references

- [Signals repository](https://github.com/TypeType-Video/TypeType-Signals)
- [How the algorithms are built](/project/signals)
