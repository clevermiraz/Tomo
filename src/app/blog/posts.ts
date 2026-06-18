export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readMins: number;
  emoji: string;
  body: Block[];
}

export const POSTS: Post[] = [
  {
    slug: "getting-started-with-tomo",
    title: "Getting Started with Tomo: Your First Focus Session",
    excerpt:
      "A two-minute guide to your first focused sprint with Tomo — from pressing Start to your first well-earned break.",
    category: "Guide",
    readMins: 3,
    emoji: "🍅",
    body: [
      { type: "p", text: "Tomo is your focus friend. It turns the proven Pomodoro Technique into a calm, beautiful timer you can install on any device and use offline. Here is everything you need to start your first session." },
      { type: "h2", text: "1. Pick one thing to focus on" },
      { type: "p", text: "Before you press Start, decide on a single task. Not your whole to-do list — one concrete thing you can make progress on in 25 minutes. Clarity is half the battle; a focused timer can only protect a focused intention." },
      { type: "h2", text: "2. Press Start and protect the 25 minutes" },
      { type: "p", text: "Hit Start and commit. For the next 25 minutes, that one task is the only thing that exists. If a distraction pops into your head, jot it on a notepad and return to the work — don't act on it. The ring around the timer fills as you go so you always know where you stand." },
      { type: "h2", text: "3. Set your vibe with Focus Sounds" },
      { type: "p", text: "Open the sound panel and choose what helps you concentrate: rain on the roof, dreamy lofi beats, calm piano, or warm ambient tracks. Turn on \"Auto-play during focus\" and Tomo starts your sounds when you focus and pauses them on breaks." },
      { type: "h2", text: "4. Take the break — really" },
      { type: "p", text: "When the chime sounds, your focus block is done. Tomo automatically switches you to a 5-minute break. Stand up, stretch, look out a window, breathe. The break isn't a reward you can skip — it's what makes the next sprint possible." },
      { type: "h2", text: "5. Make it yours" },
      { type: "p", text: "Open Settings to tune the focus and break lengths, choose how often a long break appears, enable auto-start to flow between sessions, or switch on the ticking clock for that classic Pomodoro feel. Then install Tomo to your home screen and it's always one tap away." },
      { type: "quote", text: "Four focused sprints with real breaks will out-produce a whole afternoon of half-attention. Start with one.", cite: "The Tomo team" },
    ],
  },
  {
    slug: "why-the-pomodoro-technique-works",
    title: "The Pomodoro Technique: Why 25 Minutes Changes Everything",
    excerpt:
      "The simple time-management method invented in the 1980s — and the psychology that makes a kitchen timer so powerful.",
    category: "Productivity",
    readMins: 5,
    emoji: "⏱️",
    body: [
      { type: "p", text: "In the late 1980s, a university student named Francesco Cirillo was struggling to concentrate. He grabbed a tomato-shaped kitchen timer, set it for a few minutes, and challenged himself to focus until it rang. That tomato — pomodoro in Italian — gave the technique its name and started a productivity movement." },
      { type: "h2", text: "The method in one breath" },
      { type: "ol", items: [
        "Choose a task.",
        "Set a timer for 25 minutes and work with full focus.",
        "When it rings, take a 5-minute break.",
        "After four \"pomodoros,\" take a longer 15–30 minute break.",
      ] },
      { type: "p", text: "That's it. No app required, no system to learn. Yet this tiny structure quietly rewires how you relate to work." },
      { type: "h2", text: "Why a timer beats willpower" },
      { type: "p", text: "Focus fails not because we're lazy but because starting feels heavy and distraction feels light. A 25-minute box shrinks the commitment: you're not promising to write the report, just to work on it until the timer rings. That lowered barrier is often all it takes to begin — and beginning is the hardest part." },
      { type: "h2", text: "It tames the planning fallacy" },
      { type: "p", text: "We're terrible at estimating time. Working in fixed units makes effort visible: \"this will take about three pomodoros\" is far more honest than \"I'll do it later.\" Over a week you learn your real pace, and your plans stop lying to you." },
      { type: "h2", text: "Breaks are a feature, not a weakness" },
      { type: "p", text: "Attention is a renewable resource that depletes with use. Short, regular breaks let the brain consolidate what it just learned and return refreshed. Skipping breaks to \"push through\" usually trades a sharp 25 minutes for a foggy hour." },
      { type: "h2", text: "Single-tasking, enforced" },
      { type: "p", text: "Every time you switch tasks, you pay a hidden tax to reload context. The Pomodoro Technique makes single-tasking the default and turns interruptions into a deliberate choice: capture the thought, finish the sprint, decide later. Distraction loses its automatic power." },
      { type: "quote", text: "The pomodoro is not about working more. It's about working with the grain of your attention instead of against it." },
    ],
  },
  {
    slug: "japanese-way-of-focus",
    title: "The Japanese Way of Focus: Kaizen, Ikigai & Deep Work",
    excerpt:
      "Japan has a deep cultural relationship with focused, intentional work. Here's how ideas like kaizen and ikigai pair perfectly with the Pomodoro Technique.",
    category: "Philosophy",
    readMins: 6,
    emoji: "🌸",
    body: [
      { type: "p", text: "Japanese work culture has long prized concentration, craft, and steady improvement. Several of its most famous ideas map beautifully onto a timer-based focus practice — and explain why working in small, deliberate blocks feels so natural." },
      { type: "h2", text: "Kaizen — improvement, one small step at a time" },
      { type: "p", text: "Kaizen (改善) means \"continuous improvement.\" Rather than dramatic overhauls, it favours tiny, consistent gains that compound over time. A single pomodoro is kaizen in action: you're not trying to finish everything today, only to move one step forward, again and again. Small sprints, repeated daily, quietly build mastery." },
      { type: "h2", text: "Ikigai — a reason to focus" },
      { type: "p", text: "Ikigai (生き甲斐) is your \"reason for being\" — the intersection of what you love, what you're good at, and what matters. Focus is far easier to summon when the work connects to something meaningful. Before a session, ask how this task ladders up to something you actually care about. Purpose turns discipline from a chore into a pull." },
      { type: "h2", text: "Shokunin — the spirit of the craftsperson" },
      { type: "p", text: "The shokunin (職人) is a master artisan devoted to their craft, perfecting the same skill for decades. Their secret isn't intensity but presence: complete attention to the task at hand. A pomodoro is a small container for that same spirit — twenty-five minutes given fully to one thing, done well." },
      { type: "h2", text: "Mono no aware — the value of the moment" },
      { type: "p", text: "This gentle awareness of the fleeting nature of things reminds us that attention is finite and precious. Spending it deliberately — rather than scattering it across a dozen browser tabs — is its own kind of respect for your own time." },
      { type: "h2", text: "Putting it together" },
      { type: "ul", items: [
        "Connect the task to your ikigai so focus has a reason.",
        "Work in kaizen-sized steps: one honest pomodoro at a time.",
        "Bring the shokunin's full presence to each block.",
        "Honour your attention as the limited, valuable thing it is.",
      ] },
      { type: "quote", text: "Continuous improvement is better than delayed perfection.", cite: "A kaizen proverb" },
    ],
  },
  {
    slug: "famous-minds-who-use-focus-sprints",
    title: "Famous Minds Who Swear by Focused Sprints",
    excerpt:
      "From novelists to engineers, history's most productive people protected their attention fiercely. Here's how, and what we can borrow.",
    category: "Inspiration",
    readMins: 5,
    emoji: "💡",
    body: [
      { type: "p", text: "The Pomodoro Technique is young, but the principle behind it — intense, time-boxed focus followed by real rest — shows up again and again in the routines of remarkably productive people." },
      { type: "h2", text: "Cal Newport and \"Deep Work\"" },
      { type: "p", text: "The computer scientist and author popularised the term deep work: long, undistracted stretches on cognitively demanding tasks. Newport schedules focus in fixed blocks and guards them ruthlessly, arguing that the ability to concentrate is becoming both rarer and more valuable. A pomodoro is deep work in miniature." },
      { type: "h2", text: "Ernest Hemingway's measured days" },
      { type: "p", text: "Hemingway worked in the morning, tracked his daily word count, and famously stopped while he still knew what came next — so beginning the following day was easy. The lesson echoes the Pomodoro Technique: bound your effort, and leave a clear on-ramp for tomorrow." },
      { type: "h2", text: "The Draugiem Group productivity study" },
      { type: "p", text: "A widely-cited workplace study found that the most productive people weren't those who worked the longest hours — they were the ones who took regular breaks, working in focused bursts of roughly an hour and resting in between. Rhythm beat raw endurance." },
      { type: "h2", text: "Athletes and the power of intervals" },
      { type: "p", text: "Elite performers train in intervals, not endless grinds — pushing hard, then recovering, because that's how capacity actually grows. Knowledge work is no different. Sprints with deliberate recovery build a sharper, more durable kind of focus than marathon sessions ever could." },
      { type: "h2", text: "What they share" },
      { type: "ul", items: [
        "They treat attention as their scarcest resource.",
        "They bound work into focused, finite blocks.",
        "They rest on purpose — recovery is part of the work.",
        "They protect their focus time from interruption.",
      ] },
      { type: "quote", text: "Clarity about what matters provides clarity about what does not.", cite: "Cal Newport" },
    ],
  },
  {
    slug: "discipline-over-motivation",
    title: "Discipline Over Motivation: Building an Unbreakable Focus Habit",
    excerpt:
      "Motivation is a mood; discipline is a system. Here's how to make focus automatic, so you don't have to feel like it.",
    category: "Habits",
    readMins: 5,
    emoji: "🎯",
    body: [
      { type: "p", text: "Most people wait to feel motivated before they start. The trouble is, motivation is weather — it comes and goes. Discipline is climate: a stable system that produces results regardless of how you feel on a given day. The good news is that a system is far easier to build than a feeling is to summon." },
      { type: "h2", text: "Lower the activation energy" },
      { type: "p", text: "The hardest moment is the first one. A pomodoro shrinks that moment: you only have to start, and only for 25 minutes. Make starting trivially easy — open Tomo, pick one task, press Start — and motivation becomes optional." },
      { type: "h2", text: "Anchor focus to a cue" },
      { type: "p", text: "Habits attach to triggers. Tie your first pomodoro to an existing routine: after your morning coffee, after you sit down, after lunch. The cue does the remembering so your willpower doesn't have to." },
      { type: "h2", text: "Make progress visible" },
      { type: "p", text: "What gets measured gets repeated. Tomo counts your completed focus sessions; watching that number climb turns discipline into a small daily game. A visible streak is a surprisingly strong reason not to break the chain." },
      { type: "h2", text: "Forgive the missed day, never the second" },
      { type: "p", text: "Discipline isn't perfection. Miss a day and the habit survives; miss two and it starts to dissolve. The rule that keeps habits alive is simple: never miss twice. One bad day is noise — get straight back to a single pomodoro the next." },
      { type: "h2", text: "Trust the system on bad days" },
      { type: "p", text: "On low-energy days, don't negotiate. Lower the bar — promise yourself just one block — and let the system carry you. More often than not, starting is enough, and the rest follows." },
      { type: "quote", text: "You do not rise to the level of your goals. You fall to the level of your systems.", cite: "James Clear" },
    ],
  },
  {
    slug: "beating-procrastination",
    title: "Beating Procrastination: The Science of Small Sprints",
    excerpt:
      "Procrastination isn't a character flaw — it's how the brain avoids discomfort. Here's how short timed sprints disarm it.",
    category: "Psychology",
    readMins: 5,
    emoji: "🧠",
    body: [
      { type: "p", text: "We tend to blame procrastination on laziness. But research suggests it's really about emotion: we put off tasks that trigger discomfort — boredom, anxiety, uncertainty — and reach for something soothing instead. Understand that, and you can outsmart it." },
      { type: "h2", text: "The brain prefers the immediate" },
      { type: "p", text: "Faced with a hard task, the brain weighs a vague future reward against the instant relief of a distraction — and instant usually wins. This is sometimes called present bias. A pomodoro tips the scales by attaching an immediate, concrete goal to the work: just reach the ring." },
      { type: "h2", text: "Shrink the task until it's not scary" },
      { type: "p", text: "Big tasks feel threatening, and threat triggers avoidance. \"Write the report\" is intimidating; \"work on the report for 25 minutes\" is not. By shrinking the commitment to a single block, the Pomodoro Technique removes the emotional spike that makes you flee." },
      { type: "h2", text: "Use the Zeigarnik effect" },
      { type: "p", text: "Psychologist Bluma Zeigarnik found that unfinished tasks linger in the mind more than completed ones. Starting — even for a few minutes — opens a loop your brain wants to close. Often the hardest task becomes strangely hard to stop once you've simply begun." },
      { type: "h2", text: "A practical anti-procrastination routine" },
      { type: "ol", items: [
        "Name the very next physical action, not the whole project.",
        "Set a single 25-minute timer for just that action.",
        "Promise yourself you can quit when it rings — and mean it.",
        "Capture any distraction on paper instead of chasing it.",
        "When the timer ends, take your break, then decide on the next sprint.",
      ] },
      { type: "quote", text: "You don't have to finish. You just have to start — the timer takes care of the rest." },
    ],
  },
  {
    slug: "designing-your-focus-environment",
    title: "Designing Your Perfect Focus Environment",
    excerpt:
      "Willpower is fragile; environment is reliable. Tune your space, sound, and light so focus becomes the path of least resistance.",
    category: "Environment",
    readMins: 4,
    emoji: "🌿",
    body: [
      { type: "p", text: "The easiest way to focus more is to make distraction harder and focus easier. Instead of fighting your environment with willpower, design it so the right thing happens by default." },
      { type: "h2", text: "Sound: mask, don't silence" },
      { type: "p", text: "Total silence makes every small noise jarring, while a steady ambient layer smooths the soundscape so your brain stops reacting to interruptions. That's why rainfall, ocean waves, and brown noise work so well. Tomo's Focus Sounds give you all three, plus gentle lofi for when you want a little rhythm." },
      { type: "h2", text: "Put your phone in another room" },
      { type: "p", text: "A phone within reach fragments attention even when it's face-down and silent — the mere possibility of a notification costs focus. During a pomodoro, place it out of sight, ideally in another room. The break is your time to check it." },
      { type: "h2", text: "Clear the visual field" },
      { type: "p", text: "Every open tab and stray object is a tiny invitation to switch. Before a session, close what you don't need and clear your desk to just the task at hand. A calm field of view makes a calm mind easier to keep." },
      { type: "h2", text: "Mind the light and the body" },
      { type: "p", text: "Bright, cool light during the day supports alertness; a glass of water and good posture keep the body from quietly sabotaging the mind. Use your breaks to stand, stretch, and look at something far away to rest your eyes." },
      { type: "h2", text: "Make Tomo part of the ritual" },
      { type: "p", text: "Install Tomo to your home screen so starting a session is a single tap. The smaller the friction to begin, the more often you will — and consistency, not intensity, is what builds a focused life." },
      { type: "quote", text: "Environment is the invisible hand that shapes human behavior.", cite: "James Clear" },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
