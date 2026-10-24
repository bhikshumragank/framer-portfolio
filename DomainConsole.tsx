import { addPropertyControls, ControlType, RenderTarget } from "framer"
import * as FramerLib from "framer"
import { useEffect, useRef, useState, type CSSProperties } from "react"

type Props = {
    heading: string
    intro: string
    consoleOff: string
    consoleOn: string
    style?: CSSProperties
}

type Domain = {
    name: string
    color: string
    line: string
    skills: string[]
    tools: string[]
    proof: string
    proofLabel: string
    work: { title: string; link: string }[]
    thumbs: string[]
    link: string
    linkLabel: string
}

const FU = "https://framerusercontent.com/images/"
const IMG = {
    off: FU + "tV1Z5JIzcU1LKOcX8pOMxiqw.png",
    on: FU + "GDfoPyrODfdmsN7YmKzyG0euA.png",
}

// where things sit in the console picture, measured on a 1024 x 576 copy of it (the picture is 16:9):
// the blank screen, and each lever's panel (with its status light and the line up to the screen)
const PW = 1024
const PH = 576
const SCREEN = { l: 166, t: 60, r: 858, b: 262 }
const LEVERS = [
    { l: 76, r: 286, t: 272, b: 502 },
    { l: 300, r: 490, t: 272, b: 502 },
    { l: 534, r: 724, t: 272, b: 502 },
    { l: 738, r: 952, t: 272, b: 502 },
]
// the blank plate under each lever, where its name goes
const PLATE_Y = 487

// the counts are the pieces in each wing of the Work Gallery
const DOMAINS: Domain[] = [
    {
        name: "Product",
        color: "#8B5CF6",
        line: "Features taken end to end: from user needs to flows, prototypes and shipped screens.",
        skills: ["User research", "User flows", "Wireframes", "Prototyping", "Usability testing", "Design systems"],
        tools: ["Figma", "Framer", "Python", "n8n"],
        proof: "4",
        proofLabel: "full product case studies",
        work: [
            { title: "Kshitij 2025 Website", link: "/case-study/kshitij-2025-website" },
            { title: "HR Hiring Portal", link: "/case-study/hr-hiring-portal" },
            { title: "Conductor Ticketing", link: "/case-study/conductor-ticketing" },
            { title: "AI Assistant", link: "/case-study/sparky-ai-assistant" },
        ],
        thumbs: [FU + "yOpm7KtRMpUn9pxZutaEMyLgSeQ.png"],
        link: "/portfolio-2#product",
        linkLabel: "Open the Product Lab",
    },
    {
        name: "Brand",
        color: "#FF8A2A",
        line: "Identities people remember: logos, mascots, packaging and the systems around them.",
        skills: ["Brand identity", "Logo design", "Mascots", "Packaging", "Print collateral"],
        tools: ["Illustrator", "Photoshop", "InDesign"],
        proof: "12",
        proofLabel: "brand pieces, including a 3rd place at GC 2026",
        work: [
            { title: "Vaarahi", link: "/case-study/vaarahi-brand-identity" },
            { title: "Altura Honey", link: "/case-study/altura-honey" },
        ],
        thumbs: [FU + "glvAdlW9B9aO3vM0wFHzlNCXTw.png", FU + "RQcO4EDf68E8uu6KCqmQbMUdaH0.png", FU + "oDeksNAA3auNn4srcEyOVdYwfmc.png", FU + "FGoxUDjCy3edKDrvO1uRWO9Vo.png"],
        link: "/portfolio-2#brand",
        linkLabel: "Open the Brand Studio",
    },
    {
        name: "Motion",
        color: "#2F9BFF",
        line: "Countdown films, mascot reveals and ad films, animated and edited start to finish.",
        skills: ["2D animation", "Motion graphics", "Ad films", "Editing", "AI video"],
        tools: ["After Effects", "Premiere Pro", "Blender"],
        proof: "14",
        proofLabel: "films in the gallery's cinema",
        work: [{ title: "Kshitij countdown series", link: "/portfolio-2#animation" }],
        thumbs: [FU + "1bwJmBV2l0ihlb8g67drgPW1kC0.png", FU + "uJXaMPuKfQjxnOWPFflqdO8ZP44.png", FU + "ux8HVoknjcfeSjMfaWzvMaqNgE.png", FU + "qmhl9oytcC6TFDgvmQBiZ79BssM.png"],
        link: "/portfolio-2#animation",
        linkLabel: "Open the cinema",
    },
    {
        name: "Visual",
        color: "#FF4F8B",
        line: "Posters, campaigns and social creatives for fests, fintech brands and a B2B distributor.",
        skills: ["Posters", "Social campaigns", "Infographics", "Editorial layout", "Illustration"],
        tools: ["Photoshop", "Illustrator", "Canva"],
        proof: "72",
        proofLabel: "posters across 8 client folders",
        work: [{ title: "Poster Wing", link: "/portfolio-2#poster" }],
        thumbs: [FU + "VAC5toetwiNCNIblXrw2qZkucA.jpeg", FU + "DOSbPAf4FpOHG84eHsLKIxAiqL0.png", FU + "Le33vs6QJwrzV0a4AyPfgiLmdm8.png", FU + "KUTLBN0aoxTROG0xNqO39gEZU.jpg"],
        link: "/portfolio-2#poster",
        linkLabel: "Open the Poster Wing",
    },
]

// the proof line on each phone lever button
const SHORT_PROOF = ["4 case studies", "12 brand pieces", "14 films", "72 posters"]
const pct = (v: number, of: number) => (v / of) * 100 + "%"
const box = (r: { l: number; t: number; r: number; b: number }): CSSProperties => ({
    left: pct(r.l, PW),
    top: pct(r.t, PH),
    width: pct(r.r - r.l, PW),
    height: pct(r.b - r.t, PH),
})
// a piece of the full picture shown inside a smaller box at the same spot
const crop = (src: string, r: { l: number; t: number; r: number; b: number }): CSSProperties => {
    const l = r.l / PW,
        t = r.t / PH,
        w = (r.r - r.l) / PW,
        h = (r.b - r.t) / PH
    return { backgroundImage: `url("${src}")`, backgroundSize: `${100 / w}% ${100 / h}%`, backgroundPosition: `${(l / (1 - w)) * 100}% ${(t / (1 - h)) * 100}%` }
}
const sized = (src: string, w: number) => (src.startsWith(FU) && !src.includes("?") ? `${src}?scale-down-to=${w}` : src)

// Framer switches pages through its router (in preview and on the live site); a plain URL change breaks in preview
function useGo() {
    // useRouter isn't in Framer's published types, so it is looked up at runtime; links still work without it
    const router = ((FramerLib as any).useRouter?.() ?? null) as any
    return (path: string) => {
        const [p, hash] = path.split("#")
        const routes = router?.routes || {}
        const id = Object.keys(routes).find((k) => routes[k]?.path === p)
        if (id && typeof router?.navigate === "function") router.navigate(id, hash || "")
        else if (typeof window !== "undefined") window.location.href = path
    }
}

// a short mechanical clunk and a power-up hum, made with Web Audio
function clunk() {
    try {
        const AC = (window as any).AudioContext || (window as any).webkitAudioContext
        if (!AC) return
        const c = new AC()
        const t = c.currentTime
        const o = c.createOscillator()
        const g = c.createGain()
        o.frequency.setValueAtTime(120, t)
        o.frequency.exponentialRampToValueAtTime(50, t + 0.12)
        g.gain.setValueAtTime(0.35, t)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
        o.connect(g).connect(c.destination)
        o.start(t)
        o.stop(t + 0.16)
        const h = c.createOscillator()
        const hg = c.createGain()
        h.type = "sawtooth"
        h.frequency.setValueAtTime(90, t + 0.08)
        h.frequency.exponentialRampToValueAtTime(320, t + 0.5)
        hg.gain.setValueAtTime(0.0001, t + 0.08)
        hg.gain.exponentialRampToValueAtTime(0.04, t + 0.2)
        hg.gain.exponentialRampToValueAtTime(0.001, t + 0.55)
        h.connect(hg).connect(c.destination)
        h.start(t + 0.08)
        h.stop(t + 0.6)
        setTimeout(() => c.close(), 900)
    } catch (e) {}
}

/**
 * Domain Console: the four design domains as levers on a ship's console. Pull one and it snaps up and lights,
 * and the screen above powers on with that domain's skills, tools, proof and a way into the gallery.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 860
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function DomainConsole(props: Props) {
    const {
        heading = "Domains & skills",
        intro = "Four domains, one console. Pull a lever to power one up.",
        consoleOff = IMG.off,
        consoleOn = IMG.on,
        style,
    } = props
    const go = useGo()
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const root = useRef<HTMLDivElement>(null)
    const touched = useRef(false)
    const [on, setOn] = useState<number | null>(onCanvas ? 0 : null)
    const [hover, setHover] = useState<number | null>(null)
    const [narrow, setNarrow] = useState(false)

    useEffect(() => {
        const el = root.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 760))
        ro.observe(el)
        // the first time the console comes into view it pulls the first lever by itself, to show how it works
        let io: IntersectionObserver | null = null
        let t: ReturnType<typeof setTimeout> | undefined
        if (typeof IntersectionObserver !== "undefined" && !onCanvas) {
            io = new IntersectionObserver(
                ([e]) => {
                    if (!e.isIntersecting) return
                    io?.disconnect()
                    t = setTimeout(() => !touched.current && setOn(0), 900)
                },
                { threshold: 0.5 }
            )
            io.observe(el)
        }
        return () => {
            ro.disconnect()
            io?.disconnect()
            clearTimeout(t)
        }
    }, [])

    const pull = (i: number) => {
        touched.current = true
        if (i === on) return
        clunk()
        setOn(i)
    }

    const d = on === null ? null : DOMAINS[on]

    const screen = (
        <div className={"dc-screen" + (d ? " lit" : "")} key={d ? d.name : "idle"} style={narrow ? undefined : box(SCREEN)}>
            <span className="dc-boot" />
            {d ? (
                <div className="dc-panel">
                    <div className="dc-main">
                        <span className="dc-kicker">Domain {String((on as number) + 1).padStart(2, "0")} · online</span>
                        <h3>{d.name} design</h3>
                        <p>{d.line}</p>
                        <div className="dc-chips">
                            {d.skills.map((s) => (
                                <span key={s}>{s}</span>
                            ))}
                        </div>
                    </div>
                    <div className="dc-side">
                        <div className="dc-proof">
                            <b>{d.proof}</b>
                            <span>{d.proofLabel}</span>
                        </div>
                        <div className="dc-tools">
                            {d.tools.map((s) => (
                                <i key={s}>{s}</i>
                            ))}
                        </div>
                        <div className="dc-thumbs">
                            {d.thumbs.slice(0, 4).map((src) => (
                                <img key={src} src={sized(src, 300)} alt="" loading="lazy" draggable={false} />
                            ))}
                        </div>
                        <div className="dc-links">
                            {d.work.map((w) => (
                                <a
                                    key={w.title}
                                    href={w.link}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        go(w.link)
                                    }}
                                >
                                    {w.title}
                                </a>
                            ))}
                            <a
                                className="dc-go"
                                href={d.link}
                                onClick={(e) => {
                                    e.preventDefault()
                                    go(d.link)
                                }}
                            >
                                {d.linkLabel} <em>→</em>
                            </a>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="dc-idle">
                    <b>Standing by</b>
                    <span>Pull a lever below to power up a domain</span>
                </div>
            )}
        </div>
    )

    return (
        <section ref={root} className={"dc" + (narrow ? " nr" : "")} style={{ ...style, ["--dc" as any]: d ? d.color : "#2F9BFF" }} aria-label={heading}>
            <style>{CSS}</style>
            <header className="dc-head">
                <h2>{heading}</h2>
                <p>{intro}</p>
            </header>
            {/* phones: the screen first, then each lever as a big button carrying its own lever from the picture */}
            {narrow && screen}
            {narrow && (
                <div className="dc-mlevers" role="group" aria-label="Domains">
                    {LEVERS.map((r, i) => (
                        <button key={i} className={"dc-mlever" + (on === i ? " on" : "")} style={{ ["--lc" as any]: DOMAINS[i].color }} onClick={() => pull(i)} aria-pressed={on === i}>
                            <span className="dc-mpic">
                                <span style={crop(consoleOff, r)} />
                                <span className="dc-mon" style={crop(consoleOn, r)} />
                            </span>
                            <span className="dc-mtext">
                                <b>{DOMAINS[i].name}</b>
                                <small>{SHORT_PROOF[i]}</small>
                            </span>
                        </button>
                    ))}
                </div>
            )}
            {!narrow && (
            <div className="dc-console">
                <div className="dc-pic" style={{ backgroundImage: `url("${consoleOff}")` }} />
                {LEVERS.map((r, i) => (
                    <button
                        key={i}
                        className={"dc-lever" + (on === i ? " on" : "") + (hover === i && on !== i ? " hot" : "")}
                        style={{ ...box(r), ["--lc" as any]: DOMAINS[i].color }}
                        onClick={() => pull(i)}
                        onPointerEnter={() => setHover(i)}
                        onPointerLeave={() => setHover((h) => (h === i ? null : h))}
                        aria-pressed={on === i}
                        aria-label={`${DOMAINS[i].name} design`}
                    >
                        <span className="dc-onimg" style={crop(consoleOn, r)} />
                        <span className="dc-plate" style={{ top: pct(PLATE_Y - r.t, r.b - r.t) }}>
                            {DOMAINS[i].name}
                        </span>
                    </button>
                ))}
                {screen}
            </div>
            )}
        </section>
    )
}

const CSS = `
.dc{--dc:#2F9BFF;box-sizing:border-box;position:relative;width:100%;max-width:1200px;margin-inline:auto;padding:90px 0 70px;color:#E8EEF8;font-family:"Plus Jakarta Sans",Inter,system-ui,sans-serif;background:#05070b}
.dc *{box-sizing:border-box}
.dc-head{padding:0 40px;margin-bottom:26px}
.dc-head h2{margin:0;font-size:clamp(44px,6vw,84px);line-height:.95;font-weight:800;letter-spacing:-.04em;color:#3cc8ff;text-transform:uppercase}
.dc-head p{margin:12px 0 0;max-width:min(52ch,100%);font-size:16px;line-height:1.6;color:rgba(232,238,248,.7)}

/* the console picture at 16:9, with the levers and the screen laid over it */
.dc-console{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden}
.dc-pic{position:absolute;inset:0;background-size:100% 100%}
.dc-lever{all:unset;position:absolute;cursor:pointer;border-radius:10px}
.dc-onimg{position:absolute;inset:0;opacity:0;transition:opacity .18s ease;-webkit-mask-image:radial-gradient(75% 75% at 50% 50%,#000 70%,transparent);mask-image:radial-gradient(75% 75% at 50% 50%,#000 70%,transparent)}
.dc-lever.on .dc-onimg{opacity:1;animation:dc-snap .35s cubic-bezier(.3,1.6,.5,1)}
@keyframes dc-snap{0%{transform:translateY(6px)}60%{transform:translateY(-2px)}100%{transform:none}}
.dc-lever.hot{box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--lc) 70%,transparent),0 0 24px color-mix(in srgb,var(--lc) 35%,transparent)}

.dc-lever:focus-visible{outline:2px solid #fff;outline-offset:2px}
.dc-plate{position:absolute;left:50%;translate:-50% -50%;padding:2px 8px;font-size:clamp(9px,1vw,12.5px);font-weight:800;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;color:#1a1d24;text-shadow:0 1px 0 rgba(255,255,255,.35);pointer-events:none;transition:color .3s,text-shadow .3s}
.dc-lever.on .dc-plate{color:var(--lc);text-shadow:0 0 8px color-mix(in srgb,var(--lc) 70%,transparent)}

/* the screen: boots with a flash line, then shows the domain */
.dc-screen{position:absolute;overflow:hidden;border-radius:6px;padding:clamp(10px,1.4vw,18px) clamp(12px,1.8vw,24px);background:radial-gradient(90% 120% at 30% 0%,color-mix(in srgb,var(--dc) 18%,transparent),transparent 70%);display:flex;align-items:center}
.dc-screen::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(180deg,rgba(255,255,255,.035) 0 1px,transparent 1px 3px)}
.dc-boot{position:absolute;left:0;right:0;top:50%;height:2px;background:#fff;box-shadow:0 0 18px 4px var(--dc);opacity:0;pointer-events:none}
.dc-screen.lit .dc-boot{animation:dc-boot .5s ease-out}
@keyframes dc-boot{0%{opacity:1;transform:scaleX(.05)}50%{opacity:1;transform:scaleX(1)}100%{opacity:0;transform:scaleX(1) scaleY(40)}}
.dc-panel{position:relative;width:100%;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:clamp(12px,2vw,26px);animation:dc-in .5s ease .15s both}
@keyframes dc-in{from{opacity:0;filter:blur(4px)}}
.dc-kicker{font-size:clamp(9px,.9vw,11.5px);font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--dc)}
.dc-main h3{margin:4px 0 6px;font-size:clamp(18px,2.4vw,30px);line-height:1.05;font-weight:800;letter-spacing:-.02em;color:#fff}
.dc-main p{margin:0 0 10px;font-size:clamp(11px,1.1vw,14px);line-height:1.5;color:rgba(232,238,248,.8)}
.dc-chips{display:flex;flex-wrap:wrap;gap:5px}
.dc-chips span{padding:3px 8px;border-radius:99px;font-size:clamp(9.5px,.95vw,12px);font-weight:600;color:#fff;background:color-mix(in srgb,var(--dc) 18%,transparent);border:1px solid color-mix(in srgb,var(--dc) 50%,transparent)}
.dc-side{display:flex;flex-direction:column;gap:8px;min-width:0}
.dc-proof{display:flex;align-items:baseline;gap:8px}
.dc-proof b{font-size:clamp(22px,2.8vw,36px);line-height:1;font-weight:800;color:var(--dc);font-variant-numeric:tabular-nums}
.dc-proof span{font-size:clamp(10px,1vw,12.5px);line-height:1.35;color:rgba(232,238,248,.75)}
.dc-tools{display:flex;flex-wrap:wrap;gap:4px}
.dc-tools i{font-style:normal;padding:2px 7px;border-radius:5px;font-size:clamp(9px,.9vw,11.5px);font-weight:700;color:rgba(232,238,248,.85);background:rgba(255,255,255,.07)}
.dc-thumbs{display:flex;gap:5px}
.dc-thumbs img{width:clamp(34px,4.2vw,56px);aspect-ratio:1;object-fit:cover;border-radius:6px;box-shadow:0 0 0 1px rgba(255,255,255,.12)}
.dc-links{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px}
.dc-links a{font-size:clamp(10px,1vw,12.5px);font-weight:700;color:rgba(232,238,248,.85);text-decoration:underline;text-decoration-color:color-mix(in srgb,var(--dc) 60%,transparent);text-underline-offset:3px}
.dc-links a.dc-go{color:var(--dc);text-decoration:none}
.dc-links em{font-style:normal}
.dc-links a:focus-visible{outline:2px solid #fff;outline-offset:2px}
.dc-idle{width:100%;display:grid;justify-items:center;gap:6px;text-align:center}
.dc-idle b{font-size:clamp(16px,2vw,24px);font-weight:800;color:#9fd8ff;animation:dc-pulse 1.8s ease-in-out infinite}
.dc-idle span{font-size:clamp(11px,1.1vw,14px);color:rgba(232,238,248,.6)}
@keyframes dc-pulse{50%{opacity:.45}}

/* phones: the screen as a card, then a 2 x 2 grid of lever buttons */
.dc.nr{padding:64px 0 44px}
.dc.nr .dc-head{padding:0 16px;margin-bottom:18px}
.dc.nr .dc-head h2{font-size:40px}
.dc.nr .dc-head p{font-size:15px}
.dc.nr .dc-screen{position:relative;margin:0 16px;padding:18px 16px;border-radius:18px;border:1px solid color-mix(in srgb,var(--dc) 45%,#222);background:radial-gradient(90% 120% at 30% 0%,color-mix(in srgb,var(--dc) 18%,transparent),transparent 70%),#0a0d13;min-height:200px;box-shadow:0 0 30px color-mix(in srgb,var(--dc) 15%,transparent);transition:border-color .4s,box-shadow .4s}
.dc.nr .dc-panel{grid-template-columns:minmax(0,1fr);gap:14px}
.dc.nr .dc-kicker{font-size:11px}
.dc.nr .dc-main h3{font-size:24px}
.dc.nr .dc-main p,.dc.nr .dc-proof span,.dc.nr .dc-links a{font-size:13.5px}
.dc.nr .dc-chips span{font-size:12px;padding:4px 9px}
.dc.nr .dc-tools i{font-size:11.5px}
.dc.nr .dc-proof b{font-size:30px}
.dc.nr .dc-thumbs img{width:60px}
.dc.nr .dc-idle b{font-size:20px}
.dc.nr .dc-idle span{font-size:13.5px}
.dc-mlevers{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 16px 0}
.dc-mlever{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:10px;min-height:64px;padding:6px 12px 6px 6px;border-radius:16px;cursor:pointer;background:linear-gradient(180deg,#151922,#0c0f15);border:1px solid #262b35;transition:border-color .3s,box-shadow .3s;-webkit-tap-highlight-color:transparent}
.dc-mlever.on{border-color:var(--lc);box-shadow:0 0 20px color-mix(in srgb,var(--lc) 35%,transparent)}
.dc-mlever:focus-visible{outline:2px solid #fff;outline-offset:3px}
.dc-mpic{position:relative;flex:none;width:44px;height:50px;border-radius:10px;overflow:hidden}
.dc-mpic > span{position:absolute;inset:0}
.dc-mon{opacity:0;transition:opacity .2s}
.dc-mlever.on .dc-mon{opacity:1}
.dc-mtext{display:grid;gap:1px;min-width:0}
.dc-mtext b{font-size:14px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#E8EEF8;transition:color .3s}
.dc-mlever.on .dc-mtext b{color:var(--lc)}
.dc-mtext small{font-size:12px;color:rgba(232,238,248,.55);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media (prefers-reduced-motion:reduce){.dc-onimg,.dc-lever.on .dc-onimg,.dc-boot,.dc-panel,.dc-idle b{animation:none!important;transition:none}}
`

addPropertyControls(DomainConsole, {
    heading: { type: ControlType.String, title: "Heading", defaultValue: "Domains & skills" },
    intro: { type: ControlType.String, title: "Intro", displayTextArea: true, defaultValue: "Four domains, one console. Pull a lever to power one up." },
    consoleOff: { type: ControlType.String, title: "Console off", defaultValue: IMG.off },
    consoleOn: { type: ControlType.String, title: "Console on", defaultValue: IMG.on },
})
