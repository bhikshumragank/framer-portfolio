import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import * as FramerLib from "framer"
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

type Props = {
    sparkyNew: string
    sparkyOld: string
    avatar: string
    sidePanel: string
    booth: string
    videoRelaunch: string
    videoSustain: string
    videoIntern: string
    videoEmployer: string
    videoExpo1: string
    videoExpo2: string
    backLink: string
    nextLink: string
    style?: CSSProperties
}

// images are uploaded to Framer; the films stream from the original case study site
const FU = "https://framerusercontent.com/images/"
const NET = "https://sparkythemascot.netlify.app/"

const CHAPTERS = [
    { id: "wrong", n: "01", label: "Background" },
    { id: "day1", n: "02", label: "First impression" },
    { id: "teardown", n: "03", label: "Problem audit" },
    { id: "brief", n: "04", label: "Constraints" },
    { id: "redesign", n: "05", label: "Redesign" },
    { id: "film", n: "06", label: "Launch film" },
    { id: "approval", n: "07", label: "Approval" },
    { id: "pune", n: "08", label: "Rollout" },
    { id: "env", n: "09", label: "Brand campaign" },
    { id: "engine", n: "10", label: "Brand in use" },
    { id: "outcome", n: "11", label: "Impact" },
]

// flaw hotspots sit on the old mascot image (percent of its box)
const FLAWS = [
    { t: "Silhouette", x: 50, y: 42, d: "At post size, thumbnail size, or across a three-metre backdrop, a fuzzy sphere collapses into a blue blob. It fails the squint test, the single test a mascot has to pass." },
    { t: "Body language", x: 22, y: 62, d: "A ball with limbs cannot act. It can stand, and that's the entire range. A character that can't take a pose can't carry a campaign, a stage, or a year of content." },
    { t: "The energy read", x: 64, y: 9, d: "The halo was meant to say “electricity.” At any real size it just reads as blur: noise around the head instead of energy coming from it." },
    { t: "Proportion", x: 72, y: 64, d: "Head-to-body ratio, glove scale, shoe scale and the tool pouch all come from different visual languages. Nothing agrees with anything else." },
    { t: "Palette drift", x: 36, y: 28, d: "The cyan-to-blue gradient sits outside the Sonepar navy-and-blue relationship. It was near the brand without being of it." },
    { t: "No system", x: 50, y: 90, d: "One pose. One angle. No expression range, no turnaround, no rules. There was nothing to build on, only something to paste." },
]

const COMPARE = [
    ["Silhouette", "Undefined sphere", "Readable at 32px and at 3 metres"],
    ["Posing", "Locked to one stance", "Articulated: points, holds, walks, presents"],
    ["Energy", "Static fuzz around the head", "Directed hair-flare and circuit lines that follow the body"],
    ["Palette", "Drifting cyan gradient", "Sonepar navy base, electric blue as light source"],
    ["Tooling", "Pouch pasted on the hip", "Integrated utility belt that reads as a working engineer"],
    ["Face", "Flat sticker features", "Camera-aware, expressive, animation-ready"],
    ["Role", "Decoration", "A character with a job"],
]

const PIPELINE = [
    ["Script", "Written first, by hand, before any tool was opened. What Sparky is, what he's for, what he says about the company."],
    ["Split", "The script was cut into two parts so each half could be generated cleanly and controlled independently."],
    ["Prompts", "ChatGPT translated the written script into precise, generation-ready prompts. The intent stayed mine; the translation was assisted."],
    ["Generation", "Google Gemini for the visual generation, run per half against those prompts."],
    ["Assembly", "The two halves cut together into a single relaunch film."],
]

const BRAND_SKILLS = ["Brand identity", "Mascot design", "Character design", "Visual identity", "Brand system", "Brand guidelines", "Brand storytelling", "Art direction", "Motion design", "Event branding"]

const SKILL_GROUPS = [
    ["Brand identity", "Mascot redesign inside the existing palette, brand consistency, visual identity"],
    ["Character design", "Silhouette, proportion, posing range, expression, animation-ready build"],
    ["Brand storytelling", "Scripts, brand voice, a mascot with a purpose and a point of view"],
    ["Brand system", "One character, palette and voice reused across films, posts and events"],
    ["Motion and film", "Relaunch film, animated openings, voiceover, campaign films"],
    ["Event branding", "Backdrops, side panels, roll-ups, table covers and photo frames"],
]

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

// Framer switches pages through its router (in preview and on the live site); a plain URL change breaks in preview
function useGo() {
    // useRouter isn't in Framer's published types, so it is looked up at runtime; links still work without it
    const router = ((FramerLib as any).useRouter?.() ?? null) as any
    return (path: string) => {
        const routes = router?.routes || {}
        const id = Object.keys(routes).find((k) => routes[k]?.path === path)
        if (id && typeof router?.navigate === "function") router.navigate(id, "")
        else if (typeof window !== "undefined") window.location.href = path
    }
}

const Film = ({ src, title, meta, note, big, onPlay }: { src: string; title: string; meta: string; note?: string; big?: boolean; onPlay: (f: { src: string; title: string }) => void }) => (
        <figure className={"sp-film" + (big ? " big" : "")}>
            <button className="sp-film-btn" onClick={() => onPlay({ src, title })} aria-label={"Play " + title}>
                <video src={src + "#t=1.2"} preload="metadata" muted playsInline />
                <span className="sp-play">
                    <svg viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" fill="currentColor" />
                    </svg>
                </span>
            </button>
            <figcaption>
                <b>{title}</b>
                <span>{meta}</span>
                {note && <p>{note}</p>}
            </figcaption>
        </figure>
    )

const Chat = ({ who, children, tag, avatar }: { who: "me" | "rm"; children: ReactNode; tag?: string; avatar?: string }) => (
        <div className={"sp-msg " + who}>
            {who === "me" ? <img src={avatar} alt="Mragank" /> : <span className="sp-rm">RM</span>}
            <div>
                <div className="sp-bub">{children}</div>
                {tag && <div className="sp-tag">{tag}</div>}
            </div>
        </div>
    )

const Head = ({ id, n, k, t }: { id: string; n: string; k: string; t: string }) => (
        <header className="sp-h" data-ch={id}>
            <div className="sp-k">
                <span>{n}</span>
                {k}
            </div>
            <h2>{t}</h2>
        </header>
    )


/**
 * Sparky case study: the mascot redesign at Sonepar India, told in eleven chapters. A battery in the
 * chapter rail charges as you read.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 9000
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function SparkyCaseStudy(props: Props) {
    const {
        sparkyNew = FU + "M1jzH6SoYpgOnN3D60t88vJ3w0.png",
        sparkyOld = FU + "2snXp7R4V5mUGxgmWzfUapNhS0.png",
        avatar = FU + "iO4zSIEQhc40my6Eykj4kWpGS0.jpg",
        sidePanel = FU + "iSXezSeOzlyyY0bYfx5i5cKuuRs.jpg",
        booth = FU + "R3hsi0WMBOfmpWrQtT1mYUagp5U.jpg",
        videoRelaunch = NET + "videos/relaunch.mp4",
        videoSustain = NET + "videos/sustainability.mp4",
        videoIntern = NET + "videos/intern-01.mp4",
        videoEmployer = NET + "videos/top-employer.mp4",
        videoExpo1 = NET + "videos/automation-expo-01.mp4",
        videoExpo2 = NET + "videos/automation-expo-02.mp4",
        backLink = "/about-me",
        nextLink = "",
        style,
    } = props

    const isStatic = useIsStaticRenderer()
    const goPage = useGo()
    const root = useRef<HTMLDivElement>(null)
    const [narrow, setNarrow] = useState(false)
    const [charge, setCharge] = useState(isStatic ? 1 : 0)
    const [active, setActive] = useState(0)
    const [flaw, setFlaw] = useState(0)
    const [split, setSplit] = useState(50)
    const [film, setFilm] = useState<{ src: string; title: string } | null>(null)
    const [seen, setSeen] = useState<Record<string, boolean>>({})
    const dragging = useRef(false)

    useEffect(() => {
        const el = root.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 820))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // reading progress charges the battery; the chapter nearest the top of the screen is active
    useEffect(() => {
        if (isStatic) return
        let raf = 0
        let lastC = -1
        let lastA = -1
        const tick = () => {
            const el = root.current
            if (el) {
                const r = el.getBoundingClientRect()
                const vh = window.innerHeight
                const c = Math.round(clamp01(-r.top / Math.max(1, r.height - vh)) * 100) / 100
                if (c !== lastC) setCharge((lastC = c))
                let a = 0
                CHAPTERS.forEach((ch, i) => {
                    const s = el.querySelector<HTMLElement>(`[data-ch="${ch.id}"]`)
                    if (s && s.getBoundingClientRect().top < vh * 0.4) a = i
                })
                if (a !== lastA) setActive((lastA = a))
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [isStatic])

    // reveal-on-scroll
    useEffect(() => {
        if (isStatic) return
        const el = root.current
        if (!el || typeof IntersectionObserver === "undefined") return
        const io = new IntersectionObserver(
            (es) =>
                es.forEach((e) => {
                    if (e.isIntersecting) {
                        const k = (e.target as HTMLElement).dataset.rv!
                        setSeen((s) => (s[k] ? s : { ...s, [k]: true }))
                        io.unobserve(e.target)
                    }
                }),
            { rootMargin: "0px 0px -12% 0px" }
        )
        el.querySelectorAll("[data-rv]").forEach((n) => io.observe(n))
        return () => io.disconnect()
    }, [isStatic])

    // lightbox: escape closes, page doesn't scroll behind
    useEffect(() => {
        if (!film) return
        const k = (e: KeyboardEvent) => e.key === "Escape" && setFilm(null)
        window.addEventListener("keydown", k)
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            window.removeEventListener("keydown", k)
            document.body.style.overflow = prev
        }
    }, [film])

    const rv = (k: string, cls = "") => ({ "data-rv": k, className: (cls ? cls + " " : "") + "sp-rv" + (isStatic || seen[k] ? " in" : "") })
    const go = (id: string) => {
        const s = root.current?.querySelector<HTMLElement>(`[data-ch="${id}"]`)
        if (s) window.scrollTo({ top: s.getBoundingClientRect().top + window.scrollY - 40, behavior: "smooth" })
    }
    const slide = (clientX: number, box: HTMLElement) => {
        const r = box.getBoundingClientRect()
        setSplit(Math.round(clamp01((clientX - r.left) / r.width) * 100))
    }

    const pct = Math.round(charge * 100)

    return (
        <div ref={root} className={"sp" + (narrow ? " nr" : "")} style={style}>
            <style>{CSS}</style>

            {/* ---------- hero ---------- */}
            <section className="sp-hero">
                <div className="sp-hero-txt">
                    <a
                        className="sp-back"
                        href={backLink}
                        onClick={(e) => {
                            e.preventDefault()
                            goPage(backLink)
                        }}
                    >
                        ← Back to portfolio
                    </a>
                    <div className="sp-eyebrow">Case study 01 · Brand identity and mascot design · Sonepar India</div>
                    <h1>
                        Sparky<span>.</span>
                    </h1>
                    <p className="sp-lede">The mascot redesign nobody asked for, which became Sonepar India's brand voice.</p>
                    <dl className="sp-meta">
                        {[
                            ["Role", "Marketing & Communication Intern"],
                            ["Company", "Sonepar India, Gurugram HQ"],
                            ["Scope", "Brand identity · Character design · Brand films · Event branding"],
                            ["Status", "Adopted company-wide"],
                        ].map(([a, b]) => (
                            <div key={a}>
                                <dt>{a}</dt>
                                <dd>{b}</dd>
                            </div>
                        ))}
                    </dl>
                    <ul className="sp-tags" aria-label="Brand design skills">
                        {BRAND_SKILLS.map((t) => (
                            <li key={t}>{t}</li>
                        ))}
                    </ul>
                </div>
                <div className="sp-hero-art">
                    <div className="sp-ring" />
                    <div className="sp-ring r2" />
                    <img src={sparkyNew} alt="Sparky, the redesigned Sonepar India mascot, holding a power plug" />
                    <div className="sp-chip c1">⚡ Adopted as an official brand element</div>
                    <div className="sp-chip c2">6 films · 2 live events</div>
                </div>
            </section>

            <div className="sp-body">
                {/* ---------- chapter rail with the charging battery ---------- */}
                <aside className="sp-rail" aria-label="Chapters">
                    <div className="sp-bat" aria-label={`Read ${pct}%`}>
                        <div className="sp-bat-cell">
                            <div className="sp-bat-fill" style={{ height: pct + "%" }} />
                            <span>{pct}%</span>
                        </div>
                        <div className="sp-bat-cap" />
                        <small>{pct >= 100 ? "Fully charged" : "Charging Sparky"}</small>
                    </div>
                    <ol>
                        {CHAPTERS.map((c, i) => (
                            <li key={c.id} className={i === active ? "on" : i < active ? "done" : ""}>
                                <button onClick={() => go(c.id)}>
                                    <span>{c.n}</span>
                                    {c.label}
                                </button>
                            </li>
                        ))}
                    </ol>
                </aside>
                <div className="sp-mbar" aria-hidden="true">
                    <div style={{ transform: `scaleX(${charge})` }} />
                </div>

                <main className="sp-main">
                    {/* 01 */}
                    <section className="sp-sec">
                        <Head id="wrong" n="01" k="Background" t="I joined a marketing team with a designer's brain." />
                        <div {...rv("w1")}>
                            <p>
                                Sonepar India, Gurugram head office. Marketing and Communication intern. Every hour of my training up to that point had been
                                spent in design: layout, type, motion, 3D.
                            </p>
                            <p>So I walked in with one honest, unglamorous worry, and it had nothing to do with the work itself.</p>
                            <div className="sp-thought">
                                <div className="sp-thought-k">Day 00 · Nervous · Before day one</div>
                                I'm from the design field, but my intern role is marketing and communication. So I was in doubt. Does this internship
                                support my career, or not?
                            </div>
                        </div>
                    </section>

                    {/* 02 */}
                    <section className="sp-sec">
                        <Head id="day1" n="02" k="First impression" t="Then a character appeared on the screen." />
                        <div {...rv("d1")}>
                            <p>
                                Onboarding finished. My reporting manager walked me through everything: how the marketing and communication team runs, what
                                it owns, and then the full brand system. Logos, palette, layouts, every element in the kit.
                            </p>
                            <p>And somewhere in that deck, this was waiting.</p>
                        </div>
                        <div className="sp-two">
                            <figure {...rv("d2", "sp-exhibit")}>
                                <div className="sp-exhibit-k">Exhibit A</div>
                                <img src={sparkyOld} alt="The original Sonepar India mascot, a fuzzy blue sphere with limbs, holding a plug" />
                                <figcaption>The mascot as it existed. Approved by senior management, in active use.</figcaption>
                            </figure>
                            <div {...rv("d3", "sp-chat")}>
                                <div className="sp-chat-top">
                                    <span className="sp-dot" /> Day 01 · I did not have the sense to be diplomatic about it.
                                </div>
                                <Chat avatar={avatar} who="me" tag="Said out loud, on day one">
                                    Sir, this is really very old, and not looking good.
                                </Chat>
                                <Chat who="rm" tag="Reporting manager · end of discussion">
                                    This was selected by the higher management.
                                </Chat>
                                <Chat avatar={avatar} who="me">Okay, sir.</Chat>
                                <div className="sp-inner">
                                    I said okay.
                                    <br />
                                    <b>I did not think okay.</b>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 03 */}
                    <section className="sp-sec">
                        <Head id="teardown" n="03" k="Problem audit" t="What was actually wrong with it." />
                        <p {...rv("t1")}>
                            “It looks old” is a reaction, not an argument. If I was going to touch something senior management had already signed off on, I
                            needed to know precisely what was failing, and be able to name it.
                        </p>
                        <div {...rv("t2", "sp-tear")}>
                            <div className="sp-tear-img">
                                <div className="sp-tear-box">
                                <img src={sparkyOld} alt="" />
                                {FLAWS.map((f, i) => (
                                    <button
                                        key={f.t}
                                        className={"sp-pin" + (flaw === i ? " on" : "")}
                                        style={{ left: f.x + "%", top: f.y + "%" }}
                                        onClick={() => setFlaw(i)}
                                        onMouseEnter={() => setFlaw(i)}
                                        aria-label={f.t}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                </div>
                            </div>
                            <div className="sp-flaws">
                                {FLAWS.map((f, i) => (
                                    <button
                                        key={f.t}
                                        className={"sp-flaw" + (flaw === i ? " on" : "")}
                                        onClick={() => setFlaw(i)}
                                        onMouseEnter={() => setFlaw(i)}
                                    >
                                        <span>{i + 1}</span>
                                        <div>
                                            <b>{f.t}</b>
                                            <p>{f.d}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div {...rv("t3", "sp-callout")}>
                            <b>The credibility cost, the biggest one.</b> Sonepar sells engineering trust. A mascot that reads as clip art quietly argues
                            against that on every asset it appears on.
                        </div>
                    </section>

                    {/* 04 */}
                    <section className="sp-sec">
                        <Head id="brief" n="04" k="Constraints" t="Nobody asked for this. That was the whole problem to solve." />
                        <p {...rv("b1")}>
                            There was no request, no budget line and no meeting invite. Which meant the constraints weren't creative. They were political. I
                            wrote them down before I opened a single file.
                        </p>
                        <div {...rv("b2", "sp-cons")}>
                            {[
                                ["Same colour palette", "Non-negotiable. If it stopped looking like Sonepar, it was dead before anyone saw it."],
                                ["Win in one look", "No deck, no rationale, no meeting to soften it. Only the image, on its own."],
                                ["Obviously better", "It had to overturn a decision management had already made, so “different” wasn't enough."],
                                ["On my own time", "This wasn't my job. Nothing I was actually assigned could slip because of it."],
                            ].map(([a, b], i) => (
                                <div className="sp-con" key={a}>
                                    <span>0{i + 1}</span>
                                    <b>{a}</b>
                                    <p>{b}</p>
                                </div>
                            ))}
                        </div>
                        <div {...rv("b3", "sp-decide")}>
                            <small>The decision · not said to anyone, yet</small>
                            I thought: <em>I will change this mascot.</em>
                        </div>
                    </section>

                    {/* 05 */}
                    <section className="sp-sec">
                        <Head id="redesign" n="05" k="Redesign" t="Same colours. Same job. New build." />
                        <p {...rv("r1")}>
                            I rebuilt him inside the existing palette, so nothing about him could be argued as off-brand. Everything else (proportion,
                            silhouette, posing, the way the energy behaves) was rebuilt from zero.
                        </p>
                        <div
                            {...rv("r2", "sp-cmp")}
                            onPointerDown={(e) => {
                                dragging.current = true
                                ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
                                slide(e.clientX, e.currentTarget)
                            }}
                            onPointerMove={(e) => dragging.current && slide(e.clientX, e.currentTarget)}
                            onPointerUp={() => (dragging.current = false)}
                        >
                            <div className="sp-cmp-side after">
                                <img src={sparkyNew} alt="Sparky, redesigned" draggable={false} />
                                <span className="sp-cmp-l r">After · Sparky</span>
                            </div>
                            <div className="sp-cmp-side before" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
                                <img src={sparkyOld} alt="The original mascot" draggable={false} />
                                <span className="sp-cmp-l">Before · inherited</span>
                            </div>
                            <div className="sp-cmp-bar" style={{ left: split + "%" }}>
                                <button
                                    aria-label="Drag to compare before and after"
                                    onKeyDown={(e) => {
                                        if (e.key === "ArrowLeft") setSplit((s) => Math.max(0, s - 5))
                                        if (e.key === "ArrowRight") setSplit((s) => Math.min(100, s + 5))
                                    }}
                                >
                                    ‹ ›
                                </button>
                            </div>
                        </div>
                        <div {...rv("r3", "sp-table")}>
                            <div className="sp-tr th">
                                <span>Attribute</span>
                                <span>Before</span>
                                <span>After</span>
                            </div>
                            {COMPARE.map(([a, b, c]) => (
                                <div className="sp-tr" key={a}>
                                    <span>{a}</span>
                                    <span className="old">{b}</span>
                                    <span className="new">{c}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 06 */}
                    <section className="sp-sec">
                        <Head id="film" n="06" k="Launch film" t="A still image can be ignored. A film can't." />
                        <div {...rv("f1")}>
                            <p>
                                A new character sitting in a folder is an opinion. I wanted to hand over something that already looked like a decision, so I
                                built the relaunch film before showing anyone the design.
                            </p>
                            <p>
                                The script came first, and it was mine. AI handled generation, not authorship. That distinction mattered to me, and it's the
                                reason the film says something instead of just moving.
                            </p>
                        </div>
                        <ol {...rv("f2", "sp-pipe")}>
                            {PIPELINE.map(([a, b], i) => (
                                <li key={a}>
                                    <span>{i + 1}</span>
                                    <b>{a}</b>
                                    <p>{b}</p>
                                </li>
                            ))}
                        </ol>
                        <div {...rv("f3")}>
                            <Film
                                onPlay={setFilm}
                                big
                                src={videoRelaunch}
                                title="Sparky: Relaunch Film"
                                meta="Script · direction · assembly by Mragank Bhikshu"
                                note="The only thing that went to management. No deck, no rationale slides."
                            />
                        </div>
                    </section>

                    {/* 07 */}
                    <section className="sp-sec">
                        <Head id="approval" n="07" k="Approval" t="I didn't ask for permission to try. I asked for a decision on something that already existed." />
                        <div {...rv("a1", "sp-chat solo")}>
                            <Chat avatar={avatar} who="me">Sir, I have created a video.</Chat>
                            <Chat who="rm" tag="Reporting manager · genuinely not expecting it">
                                What have you made?
                            </Chat>
                            <div className="sp-sys">
                                <span>✓</span> Forwarded to the management team · Approved
                            </div>
                        </div>
                        <div {...rv("a2")}>
                            <p>
                                He took it to the management team. The management team agreed with him. Sparky was approved and moved from an unsolicited
                                side project into an active brand element for Sonepar India.
                            </p>
                            <blockquote className="sp-quote">
                                An unrequested idea has to arrive finished. Nobody has time to imagine your work for you.
                            </blockquote>
                        </div>
                    </section>

                    {/* 08 */}
                    <section className="sp-sec">
                        <Head id="pune" n="08" k="Rollout · Pune" t="Sparky's first day in public." />
                        <div {...rv("p1")}>
                            <p>
                                Smart Manufacturing &amp; Digitalization Forum, Sonepar with the AVEVA Partner Ecosystem. Sparky ran on the side panel of the
                                event backdrop: the first time the redesign existed at physical scale, in front of customers, rather than on a screen.
                            </p>
                            <p>Printed large is where the old mascot would have fallen apart, and it's exactly where the new silhouette had to hold. It held.</p>
                        </div>
                        <div {...rv("p2", "sp-gal")}>
                            <figure className="tall">
                                <img src={sidePanel} alt="Event side panel featuring Sparky for the Smart Manufacturing and Digitalization Forum" loading="lazy" />
                                <figcaption>Side panel · Smart Manufacturing &amp; Digitalization Forum, Pune · AVEVA Partner Ecosystem × Sonepar</figcaption>
                            </figure>
                            <figure>
                                <img src={booth} alt="Sonepar exhibition booth with backdrop, banners and a photo frame featuring Sparky" loading="lazy" />
                                <figcaption>Booth system: backdrop, roll-ups, table cover and photo frame. Sparky carried across every touchpoint.</figcaption>
                            </figure>
                        </div>
                    </section>

                    {/* 09 */}
                    <section className="sp-sec">
                        <Head id="env" n="09" k="Brand campaign · World Environment Day" t="“Do something different.”" />
                        <div {...rv("e1", "sp-two wide")}>
                            <div>
                                <p>
                                    That was the whole brief from my manager. So instead of making an environment-day post, I gave Sparky a position: I tied
                                    him to one of Sonepar's six purposes: sustainable growth.
                                </p>
                                <p>
                                    Script, animated opening, and a voice for Sparky. He was introduced as <b>Sustainability Ambassador, Sonepar India</b>,
                                    which turned a mascot into someone who can hold a point of view, and gave the company a reusable spokesperson instead of
                                    a one-day asset.
                                </p>
                            </div>
                            <Film
                                onPlay={setFilm}
                                src={videoSustain}
                                title="Sparky: Sustainability Ambassador"
                                meta="World Environment Day · script · animation · voiceover"
                                note="Linked to Sonepar's sustainable-growth purpose rather than to the calendar date."
                            />
                        </div>
                    </section>

                    {/* 10 */}
                    <section className="sp-sec">
                        <Head id="engine" n="10" k="Brand in use" t="Once he existed, everything else got easier to make." />
                        <p {...rv("g1")}>
                            This is the part a mascot is actually for. With one approved character, a palette and a voice, every piece of communication
                            after this started from somewhere instead of from nothing. Four more films across recruitment, employer brand and trade
                            marketing.
                        </p>
                        <div {...rv("g2", "sp-films")}>
                            <Film onPlay={setFilm} src={videoIntern} title="Intern Introduction" meta="Internal · onboarding" note="Introducing the incoming intern cohort, hosted by Sparky." />
                            <Film
                                onPlay={setFilm}
                                src={videoEmployer}
                                title="Top Employer Announcement"
                                meta="Employer brand · Top Employers Institute"
                                note="Sonepar's Top Employer certification, announced through Sparky."
                            />
                            <Film
                                onPlay={setFilm}
                                src={videoExpo1}
                                title="Automation Expo 2026 · 01"
                                meta="Bombay Exhibition Centre · trade marketing"
                                note="Pre-event marketing for Sonepar at Automation Expo 2026, BEC Mumbai."
                            />
                            <Film onPlay={setFilm} src={videoExpo2} title="Automation Expo 2026 · 02" meta="Bombay Exhibition Centre · trade marketing" note="Second film in the Automation Expo campaign." />
                        </div>
                    </section>

                    {/* 11 */}
                    <section className="sp-sec">
                        <Head id="outcome" n="11" k="Impact" t="The internship I was worried about handed me a brand." />
                        <div {...rv("o1", "sp-stats")}>
                            {[
                                ["1", "Mascot redesigned and adopted as an official brand element"],
                                ["6", "Films scripted and directed across launch, sustainability, employer brand and trade"],
                                ["2", "Live events carrying Sparky: Pune forum and Automation Expo 2026"],
                                ["0", "Briefs, budgets or requests behind the original redesign"],
                            ].map(([a, b]) => (
                                <div key={b}>
                                    <b>{a}</b>
                                    <span>{b}</span>
                                </div>
                            ))}
                        </div>
                        <div {...rv("o2", "sp-loop")}>
                            <div className="sp-loop-k">Looking back · same question as day zero, different answer</div>
                            I walked in worried that a marketing role would cost me my design career. It gave me a character, a voice and a brand to run,
                            end to end.
                        </div>
                        <div {...rv("o4", "sp-skills")}>
                            <div className="sp-k">
                                <span>✦</span>Brand design skills in this project
                            </div>
                            <div className="sp-skill-grid">
                                {SKILL_GROUPS.map(([g, items]) => (
                                    <div key={g}>
                                        <b>{g}</b>
                                        <span>{items}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div {...rv("o3", "sp-lessons")}>
                            <div className="sp-k">
                                <span>→</span>Three things I'd take into any job
                            </div>
                            <ol>
                                <li>A redesign nobody requested only survives if it arrives finished.</li>
                                <li>Craft is an argument you can win without a meeting.</li>
                                <li>
                                    The fastest way to be useful in a department that isn't yours is to solve something everyone had already agreed to live
                                    with.
                                </li>
                            </ol>
                        </div>
                    </section>

                    {/* next */}
                    <a
                        className="sp-next"
                        href={nextLink || undefined}
                        {...(nextLink ? {} : { "aria-disabled": true })}
                        onClick={(e) => {
                            if (!nextLink) return
                            e.preventDefault()
                            goPage(nextLink)
                        }}
                    >
                        <div>
                            <div className="sp-next-k">Case study 02 · {nextLink ? "Read next" : "In progress"}</div>
                            <h3>Then they asked him to talk.</h3>
                            <p>
                                I was in a meeting with my manager when the HR Head of India called. They wanted a chatbot for the website. I named it in
                                seconds: Sparky. A character built for posters and films had to become an interface: conversation design, tone rules,
                                fallback states, and a personality that survives being typed at.
                            </p>
                        </div>
                        <img src={sparkyNew} alt="" />
                    </a>

                    <footer className="sp-foot">
                        <span>Character design, scripting, film direction and event branding by Mragank Bhikshu</span>
                        <span>Sonepar brand assets © Sonepar India</span>
                    </footer>
                </main>
            </div>

            {film && (
                <div className="sp-lb" role="dialog" aria-modal="true" aria-label={film.title} onClick={() => setFilm(null)}>
                    <div className="sp-lb-in" onClick={(e) => e.stopPropagation()}>
                        <div className="sp-lb-top">
                            <b>{film.title}</b>
                            <button onClick={() => setFilm(null)} aria-label="Close">
                                ✕
                            </button>
                        </div>
                        <video src={film.src} controls autoPlay playsInline />
                    </div>
                </div>
            )}
        </div>
    )
}

const CSS = `
.sp{max-width:1200px;margin:0 auto;--bg:#05080F;--ink:#E8EEF8;--mute:#93A1B8;--blue:#2F9BFF;--deep:#0A3D7A;--neon:#FF8A2A;--line:rgba(255,255,255,.08);box-sizing:border-box;position:relative;width:100%;background:var(--bg);color:var(--ink);font-family:Inter,"Inter Display",system-ui,sans-serif;overflow:clip}
.sp *{box-sizing:border-box}
.sp img{max-width:100%;display:block}
.sp p{font-size:18px;line-height:1.7;color:#B9C5D8;margin:0 0 18px;max-width:720px}
.sp b{color:#fff}
.sp button{font:inherit;color:inherit;cursor:pointer}
.sp-rv{opacity:0;transform:translateY(28px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.7,.2,1)}
.sp-rv.in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.sp-rv{opacity:1;transform:none;transition:none}}

.sp-hero{position:relative;display:grid;grid-template-columns:1.1fr .9fr;align-items:center;gap:40px;min-height:min(92vh,860px);padding:110px 64px 80px;background:
 radial-gradient(700px 500px at 75% 45%,rgba(47,155,255,.22),transparent 60%),
 linear-gradient(rgba(47,155,255,.06) 1px,transparent 1px) 0 0/56px 56px,
 linear-gradient(90deg,rgba(47,155,255,.06) 1px,transparent 1px) 0 0/56px 56px}
.sp-hero::after{content:"";position:absolute;left:0;right:0;bottom:0;height:160px;background:linear-gradient(transparent,var(--bg));pointer-events:none}
.sp-back{position:absolute;top:36px;left:64px;color:var(--mute);text-decoration:none;font-size:14px;font-weight:600;z-index:2}
.sp-back:hover{color:#fff}
.sp-eyebrow{font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--blue);font-weight:700}
.sp-hero h1{margin:18px 0 0;font-size:clamp(84px,13vw,176px);line-height:.9;padding-bottom:.1em;letter-spacing:-.05em;font-weight:900;background:linear-gradient(180deg,#fff 20%,#9CCBFF 70%,#2F9BFF);-webkit-background-clip:text;background-clip:text;color:transparent}
.sp-hero h1 span{color:var(--neon);-webkit-text-fill-color:var(--neon);text-shadow:0 0 24px rgba(255,138,42,.6)}
.sp-lede{margin-top:22px!important;font-size:24px!important;line-height:1.45!important;color:#D7E0EE!important;max-width:520px!important}
.sp-meta{margin:34px 0 0;display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:560px}
.sp-meta div{padding:14px 16px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.03)}
.sp-meta dt{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--mute)}
.sp-meta dd{margin:4px 0 0;font-size:15px;font-weight:600;color:#fff}
.sp-hero-art{position:relative;display:grid;place-items:center;aspect-ratio:1/1.05;z-index:1}
.sp-hero-art img{position:relative;width:82%;filter:drop-shadow(0 30px 60px rgba(47,155,255,.45));animation:sp-float 6s ease-in-out infinite}
@keyframes sp-float{50%{transform:translateY(-14px) rotate(-1deg)}}
.sp-ring{position:absolute;inset:6%;border-radius:50%;border:1px dashed rgba(47,155,255,.35);animation:sp-spin 40s linear infinite}
.sp-ring.r2{inset:16%;border:1px solid rgba(47,155,255,.18);animation-duration:26s;animation-direction:reverse}
.sp-ring::before{content:"";position:absolute;top:-5px;left:50%;width:10px;height:10px;border-radius:50%;background:var(--blue);box-shadow:0 0 12px var(--blue),0 0 30px var(--blue)}
@keyframes sp-spin{to{transform:rotate(360deg)}}
.sp-chip{position:absolute;padding:10px 14px;border-radius:12px;font-size:13.5px;font-weight:600;background:rgba(10,16,30,.8);border:1px solid var(--line);backdrop-filter:blur(10px);box-shadow:0 10px 30px rgba(0,0,0,.4)}
.sp-chip.c1{left:-4%;bottom:18%;color:var(--neon);border-color:rgba(255,138,42,.4)}
.sp-chip.c2{right:0;top:14%;color:#9CCBFF}

.sp-body{position:relative;display:grid;grid-template-columns:240px 1fr;gap:56px;padding:40px 64px 100px}
.sp-rail{position:sticky;top:32px;align-self:start;max-height:calc(100vh - 64px);overflow:auto}
.sp-bat{display:flex;flex-direction:column;align-items:flex-start;margin-bottom:26px}
.sp-bat-cell{position:relative;width:76px;height:116px;border-radius:14px;border:2px solid rgba(255,255,255,.18);padding:5px;display:flex;align-items:flex-end;overflow:hidden}
.sp-bat-fill{width:100%;border-radius:8px;background:linear-gradient(0deg,#0A5BD8,#2F9BFF 60%,#9CCBFF);box-shadow:0 0 18px rgba(47,155,255,.7);transition:height .25s linear}
.sp-bat-cell span{position:absolute;inset:0;display:grid;place-items:center;font-weight:800;font-size:18px;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.6)}
.sp-bat-cap{order:-1;width:26px;height:7px;margin:0 0 -2px 25px;border-radius:4px 4px 0 0;background:rgba(255,255,255,.18)}
.sp-bat small{margin-top:10px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--blue);font-weight:700}
.sp-rail ol{list-style:none;margin:0;padding:0;border-left:1px solid var(--line)}
.sp-rail li button{display:flex;gap:10px;width:100%;text-align:left;padding:8px 0 8px 16px;margin-left:-1px;border:0;border-left:2px solid transparent;background:none;font-size:14px;color:#66748C;transition:color .3s,border-color .3s}
.sp-rail li button span{font-variant-numeric:tabular-nums;color:#45526A}
.sp-rail li.done button{color:#93A1B8}
.sp-rail li.on button{color:#fff;border-left-color:var(--blue)}
.sp-rail li.on button span{color:var(--blue)}
.sp-mbar{display:none}
.sp-tags{list-style:none;margin:22px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:8px;max-width:580px}
.sp-tags li{padding:6px 12px;border-radius:99px;font-size:13px;font-weight:600;color:#9CCBFF;background:rgba(47,155,255,.1);border:1px solid rgba(47,155,255,.25)}
.sp-skills{margin-top:30px}
.sp-skill-grid{margin-top:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.sp-skill-grid div{padding:18px;border-radius:16px;border:1px solid var(--line);background:rgba(255,255,255,.03)}
.sp-skill-grid b{display:block;font-size:16px;color:#fff}
.sp-skill-grid span{display:block;margin-top:6px;font-size:14px;line-height:1.5;color:#9AA7BC}

.sp-main{min-width:0;max-width:840px}
.sp-sec{padding:70px 0;border-top:1px solid var(--line)}
.sp-sec:first-child{border-top:0;padding-top:20px}
.sp-h{margin-bottom:28px;scroll-margin-top:40px}
.sp-k{display:flex;align-items:center;gap:12px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--mute);font-weight:700}
.sp-k span{display:inline-grid;place-items:center;min-width:34px;height:26px;padding:0 8px;border-radius:8px;background:rgba(47,155,255,.12);color:var(--blue);letter-spacing:0}
.sp-h h2{margin:16px 0 0;font-size:clamp(32px,4.2vw,50px);line-height:1.1;letter-spacing:-.035em;font-weight:800;color:#fff;max-width:780px}

.sp-thought{position:relative;margin-top:28px;padding:24px 26px;border-radius:20px;background:linear-gradient(135deg,rgba(255,138,42,.1),rgba(255,138,42,.02));border:1px solid rgba(255,138,42,.28);font-size:21px;line-height:1.5;color:#FFE9D6;max-width:680px}
.sp-thought-k{margin-bottom:10px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--neon);font-weight:700}

.sp-two{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:30px;align-items:start}
.sp-two.wide{grid-template-columns:1fr 1.1fr;align-items:center}
.sp-exhibit{margin:0;position:relative;padding:26px;border-radius:22px;background:#E9EDF3;border:1px solid var(--line)}
.sp-exhibit img{margin:10px auto;max-height:330px;width:auto}
.sp-exhibit-k{position:absolute;top:16px;left:16px;padding:5px 10px;border-radius:8px;background:#05080F;color:#fff;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
.sp-exhibit figcaption{font-size:14px;color:#4B5568;text-align:center}
.sp-chat{padding:22px;border-radius:22px;background:rgba(255,255,255,.03);border:1px solid var(--line);display:flex;flex-direction:column;gap:14px}
.sp-chat.solo{max-width:560px}
.sp-chat-top{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--mute);padding-bottom:12px;border-bottom:1px solid var(--line)}
.sp-dot{width:8px;height:8px;border-radius:50%;background:#3BD671;box-shadow:0 0 8px #3BD671}
.sp-msg{display:flex;gap:10px;align-items:flex-end}
.sp-msg img,.sp-rm{flex:none;width:34px;height:34px;border-radius:50%;object-fit:cover}
.sp-rm{display:grid;place-items:center;background:#1B2638;color:#9CCBFF;font-size:12px;font-weight:800}
.sp-msg.me{flex-direction:row-reverse}
.sp-msg.me > div{display:flex;flex-direction:column;align-items:flex-end}
.sp-bub{padding:12px 16px;border-radius:18px;font-size:16.5px;line-height:1.45;max-width:340px}
.sp-msg.me .sp-bub{background:linear-gradient(135deg,#2F9BFF,#0A6FE0);color:#fff;border-bottom-right-radius:6px}
.sp-msg.rm .sp-bub{background:#1A2333;color:#E8EEF8;border-bottom-left-radius:6px}
.sp-tag{margin-top:5px;font-size:11.5px;color:#66748C}
.sp-inner{margin-top:6px;padding:16px;border-radius:14px;border:1px dashed rgba(255,255,255,.14);font-size:17px;line-height:1.5;color:var(--mute);text-align:center}
.sp-inner b{color:var(--neon)}
.sp-sys{align-self:center;display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:99px;font-size:13px;font-weight:600;color:#3BD671;background:rgba(59,214,113,.1);border:1px solid rgba(59,214,113,.3)}

.sp-tear{display:grid;grid-template-columns:.9fr 1.1fr;gap:24px;margin-top:30px;align-items:start}
.sp-tear-img{position:sticky;top:40px;padding:24px;border-radius:22px;background:#E9EDF3}
.sp-tear-box{position:relative;max-width:420px;margin:0 auto}
.sp-tear-box img{width:100%}
.sp-pin{position:absolute;transform:translate(-50%,-50%);width:30px;height:30px;border-radius:50%;border:2px solid #fff;background:#05080F;color:#fff!important;font-size:13px;font-weight:800;box-shadow:0 4px 12px rgba(0,0,0,.35);transition:transform .25s,background .25s}
.sp-pin.on{background:var(--neon);transform:translate(-50%,-50%) scale(1.2);box-shadow:0 0 0 6px rgba(255,138,42,.3)}
.sp-flaws{display:flex;flex-direction:column;gap:10px}
.sp-flaw{display:flex;gap:14px;text-align:left;padding:16px 18px;border-radius:16px;border:1px solid var(--line);background:rgba(255,255,255,.02);transition:border-color .25s,background .25s}
.sp-flaw > span{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#1A2333;font-size:13px;font-weight:800;color:var(--mute)}
.sp-flaw b{font-size:17px}
.sp-flaw p{margin:6px 0 0!important;font-size:15px!important;line-height:1.55!important;max-height:0;overflow:hidden;opacity:0;transition:max-height .4s,opacity .3s}
.sp-flaw.on{border-color:rgba(255,138,42,.45);background:rgba(255,138,42,.06)}
.sp-flaw.on > span{background:var(--neon);color:#1A0E04}
.sp-flaw.on p{max-height:200px;opacity:1}
.sp-callout{margin-top:24px;padding:22px 24px;border-radius:18px;border-left:3px solid var(--neon);background:rgba(255,138,42,.06);font-size:18px;line-height:1.6;color:#D7E0EE}

.sp-cons{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:28px}
.sp-con{padding:20px;border-radius:18px;background:rgba(255,255,255,.03);border:1px solid var(--line)}
.sp-con span{font-size:13px;font-weight:800;color:var(--blue)}
.sp-con b{display:block;margin-top:10px;font-size:17px;line-height:1.3}
.sp-con p{margin:8px 0 0!important;font-size:14.5px!important;line-height:1.55!important}
.sp-decide{margin-top:30px;padding:30px;border-radius:22px;text-align:center;font-size:clamp(24px,3vw,34px);font-weight:700;letter-spacing:-.02em;color:#fff;background:radial-gradient(100% 140% at 50% 120%,rgba(47,155,255,.25),transparent 70%),rgba(255,255,255,.02);border:1px solid rgba(47,155,255,.3)}
.sp-decide small{display:block;margin-bottom:10px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--blue)}
.sp-decide em{font-style:normal;color:#9CCBFF;text-shadow:0 0 22px rgba(47,155,255,.6)}

.sp-cmp{position:relative;margin-top:30px;height:520px;border-radius:24px;overflow:hidden;user-select:none;touch-action:pan-y;cursor:ew-resize;border:1px solid var(--line)}
.sp-cmp-side{position:absolute;inset:0;display:grid;place-items:center;padding:40px}
.sp-cmp-side img{position:absolute;inset:48px 40px 40px;width:calc(100% - 80px);height:calc(100% - 88px);max-width:none;object-fit:contain;pointer-events:none}
.sp-cmp-side.after{background:radial-gradient(60% 70% at 50% 60%,rgba(47,155,255,.3),transparent 70%),#0B1424}
.sp-cmp-side.before{background:#E9EDF3}
.sp-cmp-l{position:absolute;top:18px;left:18px;padding:6px 12px;border-radius:99px;font-size:12.5px;font-weight:700;background:#05080F;color:#fff}
.sp-cmp-l.r{left:auto;right:18px;background:var(--blue)}
.sp-cmp-bar{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:#fff;box-shadow:0 0 12px rgba(255,255,255,.6)}
.sp-cmp-bar button{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:48px;height:48px;border-radius:50%;border:0;background:#fff;color:#05080F!important;font-weight:800;font-size:16px;box-shadow:0 6px 20px rgba(0,0,0,.4)}
.sp-table{margin-top:22px;border-radius:18px;border:1px solid var(--line);overflow:hidden}
.sp-tr{display:grid;grid-template-columns:.7fr 1fr 1.4fr;gap:16px;padding:14px 20px;border-top:1px solid var(--line);font-size:15px;line-height:1.45}
.sp-tr:first-child{border-top:0}
.sp-tr.th{background:rgba(255,255,255,.04);font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--mute);font-weight:700}
.sp-tr span:first-child{font-weight:700;color:#fff}
.sp-tr .old{color:#7D889B;text-decoration:line-through;text-decoration-color:rgba(255,90,90,.5)}
.sp-tr .new{color:#9CCBFF}
.sp-tr.th span{color:var(--mute)!important;text-decoration:none!important}

.sp-pipe{list-style:none;padding:0;margin:28px 0;display:grid;grid-template-columns:repeat(5,1fr);gap:10px;counter-reset:s}
.sp-pipe li{position:relative;padding:18px 16px;border-radius:16px;background:rgba(255,255,255,.03);border:1px solid var(--line)}
.sp-pipe li:not(:last-child)::after{content:"";position:absolute;top:30px;right:-10px;width:10px;height:2px;background:var(--blue);box-shadow:0 0 8px var(--blue)}
.sp-pipe span{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--blue);color:#fff;font-size:13px;font-weight:800}
.sp-pipe b{display:block;margin-top:12px;font-size:16px}
.sp-pipe p{margin:6px 0 0!important;font-size:13.5px!important;line-height:1.5!important}

.sp-film{margin:0}
.sp-film-btn{position:relative;display:block;width:100%;aspect-ratio:16/9;padding:0;border:1px solid var(--line);border-radius:18px;overflow:hidden;background:#0B1424}
.sp-film-btn video{width:100%;height:100%;object-fit:cover;pointer-events:none;transition:transform .5s}
.sp-film-btn:hover video{transform:scale(1.04)}
.sp-play{position:absolute;inset:0;display:grid;place-items:center;background:linear-gradient(transparent 40%,rgba(5,8,15,.6))}
.sp-play svg{width:62px;height:62px;padding:18px;border-radius:50%;background:rgba(255,255,255,.95);color:#05080F;box-shadow:0 0 0 8px rgba(255,255,255,.18);transition:transform .3s}
.sp-film-btn:hover .sp-play svg{transform:scale(1.1)}
.sp-film.big .sp-play svg{width:84px;height:84px;padding:24px}
.sp-film figcaption{margin-top:12px}
.sp-film figcaption b{display:block;font-size:17px}
.sp-film figcaption span{display:block;margin-top:2px;font-size:13.5px;color:var(--blue)}
.sp-film figcaption p{margin:6px 0 0!important;font-size:14.5px!important;line-height:1.5!important}
.sp-films{display:grid;grid-template-columns:1fr 1fr;gap:26px 20px;margin-top:28px}

.sp-quote{margin:26px 0 0;padding:0 0 0 22px;border-left:3px solid var(--blue);font-size:26px;line-height:1.35;font-weight:700;letter-spacing:-.02em;color:#fff;max-width:680px}

.sp-gal{display:grid;grid-template-columns:.8fr 1.2fr;gap:16px;margin-top:28px;align-items:start}
.sp-gal figure{margin:0}
.sp-gal img{width:100%;border-radius:18px;border:1px solid var(--line)}
.sp-gal figcaption{margin-top:10px;font-size:13.5px;line-height:1.5;color:var(--mute)}

.sp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:10px}
.sp-stats div{padding:22px;border-radius:18px;background:rgba(255,255,255,.03);border:1px solid var(--line)}
.sp-stats b{display:block;font-size:56px;line-height:1;font-weight:900;letter-spacing:-.04em;color:var(--blue);text-shadow:0 0 24px rgba(47,155,255,.45)}
.sp-stats span{display:block;margin-top:10px;font-size:14.5px;line-height:1.5;color:#B9C5D8}
.sp-loop{margin-top:24px;padding:28px;border-radius:22px;font-size:22px;line-height:1.5;font-weight:600;color:#fff;background:linear-gradient(135deg,rgba(47,155,255,.14),rgba(255,138,42,.08));border:1px solid var(--line)}
.sp-loop-k{margin-bottom:10px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--neon);font-weight:700}
.sp-lessons{margin-top:30px}
.sp-lessons ol{margin:16px 0 0;padding:0;list-style:none;display:grid;gap:10px;counter-reset:l}
.sp-lessons li{counter-increment:l;display:flex;gap:14px;padding:16px 18px;border-radius:14px;border:1px solid var(--line);font-size:17px;line-height:1.5;color:#D7E0EE}
.sp-lessons li::before{content:counter(l);flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--blue);color:#fff;font-weight:800;font-size:13px}

.sp-next{position:relative;display:grid;grid-template-columns:1fr 200px;gap:20px;align-items:center;margin-top:40px;padding:34px;border-radius:26px;text-decoration:none;color:inherit;background:radial-gradient(80% 140% at 100% 50%,rgba(47,155,255,.22),transparent 70%),rgba(255,255,255,.03);border:1px solid rgba(47,155,255,.3);overflow:hidden;transition:transform .3s,border-color .3s}
.sp-next[href]:hover{transform:translateY(-3px);border-color:var(--blue)}
.sp-next-k{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--blue);font-weight:700}
.sp-next h3{margin:10px 0 12px;font-size:32px;line-height:1.15;letter-spacing:-.03em;color:#fff}
.sp-next p{font-size:15.5px!important;line-height:1.6!important;margin:0!important}
.sp-next img{width:100%;filter:drop-shadow(0 20px 40px rgba(47,155,255,.4))}
.sp-foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;margin-top:40px;padding-top:24px;border-top:1px solid var(--line);font-size:13px;color:#66748C}

.sp-lb{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:24px;background:rgba(2,4,8,.88);backdrop-filter:blur(8px)}
.sp-lb-in{width:min(1100px,100%)}
.sp-lb-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;color:#fff}
.sp-lb-top button{width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06)}
.sp-lb video{width:100%;max-height:78vh;border-radius:16px;background:#000}

.sp.nr p{font-size:16.5px}
.sp.nr .sp-hero{grid-template-columns:1fr;padding:90px 20px 40px;min-height:0;gap:10px}
.sp.nr .sp-back{left:20px;top:28px}
.sp.nr .sp-hero-art{order:-1;width:min(360px,100%);margin:0 auto}
.sp.nr .sp-chip.c1{left:0}
.sp.nr .sp-lede{font-size:19px!important}
.sp.nr .sp-meta{grid-template-columns:1fr}
.sp.nr .sp-body{grid-template-columns:1fr;padding:0 20px 70px;gap:0}
.sp.nr .sp-rail{display:none}
.sp.nr .sp-mbar{display:block;position:sticky;top:0;z-index:5;height:4px;margin:0 -20px;background:rgba(255,255,255,.06)}
.sp.nr .sp-mbar div{height:100%;transform-origin:0 50%;background:var(--blue);box-shadow:0 0 10px var(--blue)}
.sp.nr .sp-sec{padding:50px 0}
.sp.nr .sp-two,.sp.nr .sp-two.wide,.sp.nr .sp-tear,.sp.nr .sp-gal,.sp.nr .sp-films{grid-template-columns:1fr}
.sp.nr .sp-tear-img{position:relative;top:0;padding:16px}
.sp.nr .sp-tear-box{max-width:300px}
.sp.nr .sp-cons,.sp.nr .sp-stats{grid-template-columns:1fr 1fr}
.sp.nr .sp-pipe{grid-template-columns:1fr}
.sp.nr .sp-pipe li::after{display:none}
.sp.nr .sp-cmp{height:380px}
.sp.nr .sp-cmp-side img{inset:52px 16px 16px;width:calc(100% - 32px);height:calc(100% - 68px)}
.sp.nr .sp-tr{grid-template-columns:1fr;gap:4px}
.sp.nr .sp-tr.th{display:none}
.sp.nr .sp-stats b{font-size:42px}
.sp.nr .sp-next{grid-template-columns:1fr;padding:24px}
.sp.nr .sp-next img{display:none}
.sp.nr .sp-quote{font-size:21px}
.sp.nr .sp-skill-grid{grid-template-columns:1fr}
`

addPropertyControls(SparkyCaseStudy, {
    sparkyNew: { type: ControlType.String, title: "Sparky (new)", defaultValue: "https://framerusercontent.com/images/M1jzH6SoYpgOnN3D60t88vJ3w0.png" },
    sparkyOld: { type: ControlType.String, title: "Mascot (old)", defaultValue: "https://framerusercontent.com/images/2snXp7R4V5mUGxgmWzfUapNhS0.png" },
    avatar: { type: ControlType.String, title: "Your avatar", defaultValue: "https://framerusercontent.com/images/iO4zSIEQhc40my6Eykj4kWpGS0.jpg" },
    sidePanel: { type: ControlType.String, title: "Side panel", defaultValue: "https://framerusercontent.com/images/iSXezSeOzlyyY0bYfx5i5cKuuRs.jpg" },
    booth: { type: ControlType.String, title: "Booth", defaultValue: "https://framerusercontent.com/images/R3hsi0WMBOfmpWrQtT1mYUagp5U.jpg" },
    videoRelaunch: { type: ControlType.String, title: "Relaunch film", defaultValue: "https://sparkythemascot.netlify.app/videos/relaunch.mp4" },
    videoSustain: { type: ControlType.String, title: "Sustainability", defaultValue: "https://sparkythemascot.netlify.app/videos/sustainability.mp4" },
    videoIntern: { type: ControlType.String, title: "Intern intro", defaultValue: "https://sparkythemascot.netlify.app/videos/intern-01.mp4" },
    videoEmployer: { type: ControlType.String, title: "Top Employer", defaultValue: "https://sparkythemascot.netlify.app/videos/top-employer.mp4" },
    videoExpo1: { type: ControlType.String, title: "Expo film 1", defaultValue: "https://sparkythemascot.netlify.app/videos/automation-expo-01.mp4" },
    videoExpo2: { type: ControlType.String, title: "Expo film 2", defaultValue: "https://sparkythemascot.netlify.app/videos/automation-expo-02.mp4" },
    backLink: { type: ControlType.String, title: "Back link", defaultValue: "/about-me" },
    nextLink: { type: ControlType.String, title: "Next case study", defaultValue: "" },
})
