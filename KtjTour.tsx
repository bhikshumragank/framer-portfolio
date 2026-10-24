import { addPropertyControls, ControlType, RenderTarget } from "framer"
import * as FramerLib from "framer"
import { useEffect, useRef, useState, type CSSProperties } from "react"

type Props = {
    tourUrl: string
    style?: CSSProperties
}

const FU = "https://framerusercontent.com/images/"
// a still of the site's corridor already in Framer, used until the hosted tour (with its own stills) is set
const FALLBACK = FU + "yOpm7KtRMpUn9pxZutaEMyLgSeQ.png?scale-down-to=1600"

const STORY = [
    {
        t: "The spark",
        d: "The idea came from a song: Raftaar's “Dehshat Ho”. Its rush, a beat that never lets you settle, was the arrival I wanted. You don't open this website; you get pulled into it at speed.",
    },
    {
        t: "The theme",
        d: "Kshitij 2025 was built around the tensorial tesseract, a journey through dimensions where mathematics and innovation collide. So the site became a ship crossing those dimensions, and the visitor its passenger.",
    },
    {
        t: "Boarding",
        d: "A tunnel rush plays while the ship loads, then you stand in a corridor facing the central hall and its KTJ hologram. Six glowing stations ring the hall: Events, Workshops, Guest Lectures, Theme, Sponsors and Contact. Arrows or a swipe glide the camera from one to the next, with a soft slide sound on every move.",
    },
    {
        t: "In your pocket",
        d: "Phones get their own camera framing so every station still fits the screen, and a VR mode lets you look around the ship just by moving the phone.",
    },
]

const SHOTS = [
    { f: "corridor.jpg", c: "The corridor you arrive in, with the hall ahead" },
    { f: "hall.jpg", c: "The central hall: the KTJ hologram and the stations around it" },
    { f: "events.jpg", c: "A station up close: Events, with links into competitions and GameFest" },
    { f: "theme.jpg", c: "The Theme station: the tensorial tesseract" },
]

// Framer switches pages through its router (in preview and on the live site); a plain URL change breaks in preview
function useGo() {
    // useRouter isn't in Framer's published types, so it is looked up at runtime; links still work without it
    const router = ((FramerLib as any).useRouter?.() ?? null) as any
    return (path: string) => {
        if (/^https?:/.test(path)) return void window.open(path, "_blank", "noopener")
        const routes = router?.routes || {}
        const id = Object.keys(routes).find((k) => routes[k]?.path === path)
        if (id && typeof router?.navigate === "function") router.navigate(id, "")
        else if (typeof window !== "undefined") window.location.href = path
    }
}

/**
 * Kshitij 2025 website tour: a short story of the fest website that visitors board like a spaceship, with the real
 * 3D homepage playable inside the page. The tour loads only when the visitor starts it, because it is heavy.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 2600
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function KtjTour(props: Props) {
    const { tourUrl = "", style } = props
    const go = useGo()
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const root = useRef<HTMLElement>(null)
    const frame = useRef<HTMLDivElement>(null)
    const [narrow, setNarrow] = useState(false)
    const [playing, setPlaying] = useState(false)
    const base = (tourUrl || "").replace(/\/+$/, "")
    const shot = (f: string) => (base ? `${base}/shots/${f}` : FALLBACK)

    useEffect(() => {
        const el = root.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 820))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const start = () => {
        frame.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        if (base) setPlaying(true)
    }

    return (
        <section ref={root} className={"kt" + (narrow ? " nr" : "")} style={style} aria-label="Kshitij 2025 website tour">
            <style>{CSS}</style>

            <header className="kt-hero">
                <span className="kt-kicker">Website tour · Kshitij 2025, IIT Kharagpur</span>
                <h1>A fest website you board like a spaceship</h1>
                <p className="kt-lede">The homepage of Kshitij 2025 wasn't a page to scroll. It was a ship: you arrive at speed, step into its hall and travel between six stations to find the fest. The idea and the design were mine; the Kshitij tech team built it.</p>
                <div className="kt-ctas">
                    <button type="button" className="kt-btn" onClick={start}>
                        {base ? "Start the tour" : "See the tour"} <em>↓</em>
                    </button>
                    {base && (
                        <a className="kt-btn ghost" href={base} target="_blank" rel="noopener">
                            Open full screen ↗
                        </a>
                    )}
                </div>
                <dl className="kt-meta">
                    <div>
                        <dt>My role</dt>
                        <dd>Ideation and design</dd>
                    </div>
                    <div>
                        <dt>Built by</dt>
                        <dd>Kshitij 2025 tech team</dd>
                    </div>
                    <div>
                        <dt>Year</dt>
                        <dd>2025</dd>
                    </div>
                    <div>
                        <dt>Reach</dt>
                        <dd>50K+ users, retention up 35%</dd>
                    </div>
                </dl>
            </header>

            {/* the playable homepage */}
            <div className="kt-stage" ref={frame}>
                <div className="kt-screen">
                    {playing && base && !onCanvas ? (
                        <iframe src={base} title="Kshitij 2025 homepage, playable" allow="fullscreen; accelerometer; gyroscope; xr-spatial-tracking" />
                    ) : (
                        <button type="button" className="kt-poster" onClick={() => base && setPlaying(true)} aria-label={base ? "Start the Kshitij 2025 tour" : "Kshitij 2025 homepage"} style={{ backgroundImage: `url("${shot("hall.jpg")}")` }}>
                            <span className="kt-play">
                                {base ? (
                                    <>
                                        <i aria-hidden="true">▶</i>
                                        <b>Board the ship</b>
                                        <small>Loads the real 3D homepage, about 5 MB</small>
                                    </>
                                ) : (
                                    <>
                                        <b>The live tour is being set up</b>
                                        <small>Until then, the stills below show the ship</small>
                                    </>
                                )}
                            </span>
                        </button>
                    )}
                </div>
                <p className="kt-tip">{base ? "Press the arrow to start, then use the side arrows or swipe to move between stations. Sound on for the slide effects." : "The playable homepage appears here once it's online."}</p>
            </div>

            {/* the story, in order */}
            <ol className="kt-story">
                {STORY.map((s, i) => (
                    <li key={s.t}>
                        <span className="kt-n">{String(i + 1).padStart(2, "0")}</span>
                        <div>
                            <h2>{s.t}</h2>
                            <p>{s.d}</p>
                        </div>
                    </li>
                ))}
            </ol>

            <div className="kt-shots">
                {SHOTS.map((s) => (
                    <figure key={s.f}>
                        <img src={shot(s.f)} alt={s.c} loading="lazy" draggable={false} />
                        <figcaption>{s.c}</figcaption>
                    </figure>
                ))}
            </div>

            <div className="kt-credits">
                <div className="kt-who">
                    <div>
                        <span>Ideation and design</span>
                        <b>Mragank Bhikshu</b>
                    </div>
                    <div>
                        <span>Development</span>
                        <b>Kshitij 2025 tech team</b>
                    </div>
                    <div>
                        <span>Inspired by</span>
                        <b>“Dehshat Ho”, Raftaar</b>
                    </div>
                </div>
                <ul className="kt-stats">
                    <li>
                        <b>50K+</b>
                        <span>people visited the site</span>
                    </li>
                    <li>
                        <b>+35%</b>
                        <span>retention</span>
                    </li>
                    <li>
                        <b>6</b>
                        <span>stations in one 3D hall</span>
                    </li>
                </ul>
            </div>

            <a
                className="kt-back"
                href="/case-studies"
                onClick={(e) => {
                    e.preventDefault()
                    go("/case-studies")
                }}
            >
                All case studies <i>→</i>
            </a>
        </section>
    )
}

const CSS = `
.kt{--kt:#4FE3D0;box-sizing:border-box;position:relative;width:100%;max-width:1200px;margin-inline:auto;padding:56px 40px 90px;color:#E8EEF8;font-family:"Plus Jakarta Sans",Inter,system-ui,sans-serif;background:radial-gradient(60% 35% at 70% 0%,rgba(79,227,208,.12),transparent 70%),radial-gradient(1px 1px at 14% 20%,#fff6,transparent),radial-gradient(1px 1px at 82% 12%,#fff5,transparent),#05070b}
.kt *{box-sizing:border-box}
.kt-hero{max-width:820px}
.kt-kicker{font-size:13px;font-weight:700;color:var(--kt)}
.kt-hero h1{margin:12px 0 16px;font-size:clamp(40px,5.6vw,72px);line-height:1;font-weight:800;letter-spacing:-.035em;color:#fff}
.kt-lede{margin:0;max-width:62ch;font-size:18px;line-height:1.6;color:rgba(232,238,248,.78)}
.kt-ctas{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
.kt-btn{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:10px;padding:14px 22px;border-radius:99px;font-size:15px;font-weight:700;color:#04110f;background:var(--kt);box-shadow:0 0 28px rgba(79,227,208,.35);transition:transform .25s,box-shadow .25s}
.kt-btn em{font-style:normal}
.kt-btn:hover{transform:translateY(-2px);box-shadow:0 0 36px rgba(79,227,208,.5)}
.kt-btn.ghost{color:#E8EEF8;background:transparent;box-shadow:inset 0 0 0 1px rgba(232,238,248,.3)}
.kt-btn.ghost:hover{box-shadow:inset 0 0 0 1px #FF9A40,0 0 22px rgba(255,138,42,.25)}
.kt button:focus-visible,.kt a:focus-visible{outline:2px solid #fff;outline-offset:3px}
.kt-meta{margin:30px 0 0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;border-radius:16px;overflow:hidden;background:#232731;border:1px solid #232731}
.kt-meta div{padding:14px 16px;background:#0c0f15}
.kt-meta dt{font-size:12px;font-weight:700;color:#FF9A40}
.kt-meta dd{margin:4px 0 0;font-size:14.5px;font-weight:700;color:#fff;line-height:1.35}

/* the playable homepage in a framed screen */
.kt-stage{margin-top:48px}
.kt-screen{position:relative;width:100%;aspect-ratio:16/9;border-radius:18px;overflow:hidden;background:#000;border:1px solid rgba(79,227,208,.35);box-shadow:0 0 0 8px #0d1016,0 0 0 9px #262a33,0 40px 90px rgba(0,0,0,.65),0 0 60px rgba(79,227,208,.12)}
.kt-screen iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.kt-poster{all:unset;cursor:pointer;position:absolute;inset:0;display:grid;place-items:center;background-size:cover;background-position:center}
.kt-poster::before{content:"";position:absolute;inset:0;background:radial-gradient(60% 60% at 50% 50%,rgba(3,6,10,.35),rgba(3,6,10,.8))}
.kt-play{position:relative;display:grid;justify-items:center;gap:8px;text-align:center;padding:0 20px}
.kt-play i{display:grid;place-items:center;width:76px;height:76px;border-radius:50%;font-style:normal;font-size:26px;color:#04110f;background:var(--kt);box-shadow:0 0 0 10px rgba(79,227,208,.18),0 0 40px rgba(79,227,208,.5);transition:transform .25s}
.kt-poster:hover .kt-play i{transform:scale(1.06)}
.kt-play b{font-size:22px;font-weight:800;color:#fff}
.kt-play small{font-size:13.5px;color:rgba(232,238,248,.7)}
.kt-tip{margin:16px 0 0;font-size:14px;color:rgba(232,238,248,.6);text-align:center}

/* the story */
.kt-story{list-style:none;margin:64px 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.kt-story li{display:grid;grid-template-columns:44px minmax(0,1fr);gap:8px;padding:22px 22px 24px;border-radius:20px;background:linear-gradient(160deg,rgba(79,227,208,.07),rgba(255,255,255,.015) 60%);border:1px solid rgba(79,227,208,.18)}
.kt-n{font-size:13px;font-weight:800;color:var(--kt);padding-top:5px;font-variant-numeric:tabular-nums}
.kt-story h2{margin:0 0 8px;font-size:22px;font-weight:800;letter-spacing:-.01em;color:#fff}
.kt-story p{margin:0;font-size:15.5px;line-height:1.65;color:rgba(232,238,248,.8)}

.kt-shots{margin-top:28px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.kt-shots figure{margin:0;border-radius:16px;overflow:hidden;background:#0c0f15;border:1px solid #232731}
.kt-shots img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}
.kt-shots figcaption{padding:12px 14px;font-size:13.5px;color:rgba(232,238,248,.7)}

.kt-credits{margin-top:40px;display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:14px}
.kt-who{display:grid;gap:1px;border-radius:18px;overflow:hidden;background:#232731;border:1px solid #232731}
.kt-who div{display:flex;justify-content:space-between;gap:12px;padding:16px 18px;background:#0c0f15}
.kt-who span{font-size:13px;font-weight:700;color:#FF9A40}
.kt-who b{font-size:15px;font-weight:700;color:#fff;text-align:right}
.kt-stats{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.kt-stats li{display:grid;align-content:center;gap:4px;padding:16px;border-radius:18px;background:rgba(79,227,208,.07);border:1px solid rgba(79,227,208,.25)}
.kt-stats b{font-size:30px;font-weight:800;letter-spacing:-.02em;color:var(--kt);font-variant-numeric:tabular-nums}
.kt-stats span{font-size:13px;line-height:1.4;color:rgba(232,238,248,.7)}
.kt-back{display:inline-flex;align-items:center;gap:8px;margin-top:36px;font-size:15px;font-weight:700;color:#E8EEF8;text-decoration:none}
.kt-back i{font-style:normal;transition:transform .25s}
.kt-back:hover i{transform:translateX(4px)}

/* phones */
.kt.nr{padding:28px 16px 64px}
.kt.nr .kt-hero h1{font-size:38px}
.kt.nr .kt-lede{font-size:16px}
.kt.nr .kt-meta{grid-template-columns:repeat(2,minmax(0,1fr))}
.kt.nr .kt-stage{margin-top:32px}
.kt.nr .kt-screen{aspect-ratio:9/14;box-shadow:0 0 0 5px #0d1016,0 0 0 6px #262a33,0 24px 60px rgba(0,0,0,.6)}
.kt.nr .kt-story,.kt.nr .kt-shots,.kt.nr .kt-credits{grid-template-columns:minmax(0,1fr)}
.kt.nr .kt-story{margin-top:40px}
.kt.nr .kt-story li{grid-template-columns:30px minmax(0,1fr);padding:18px}
.kt.nr .kt-ctas{display:grid;grid-template-columns:minmax(0,1fr)}
.kt.nr .kt-btn{justify-content:center}
@media (prefers-reduced-motion:reduce){.kt-btn,.kt-play i{transition:none}}
`

addPropertyControls(KtjTour, {
    tourUrl: { type: ControlType.String, title: "Tour URL", description: "Where the Kshitij 2025 homepage is hosted, e.g. https://ktj2025-tour.netlify.app", defaultValue: "" },
})
