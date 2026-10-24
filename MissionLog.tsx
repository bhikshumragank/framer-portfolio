import { addPropertyControls, ControlType, RenderTarget } from "framer"
import * as FramerLib from "framer"
import { useEffect, useRef, useState, type CSSProperties } from "react"

type Props = {
    heading: string
    intro: string
    allLink: string
    style?: CSSProperties
}

type Mission = {
    code: string
    kind: "Product" | "Brand"
    title: string
    objective: string
    role: string
    crew: string
    year: string
    tools: string
    result: string
    resultLabel: string
    link: string
    color: string
    // how the picture sits on the viewer: "phone" and "laptop" put the screen in a device, "art" fills it
    frame: "phone" | "laptop" | "art"
    images: string[]
}

const FU = "https://framerusercontent.com/images/"
// the product screens, drawn as SVG
const svgUri = (svg: string) => "data:image/svg+xml;utf8," + encodeURIComponent(svg)
const CONDUCTOR_SCREEN = svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 760' font-family='Arial,Helvetica,sans-serif'><rect width='360' height='760' fill='#fff'/><rect y='0' width='360' height='28' fill='#fff'/><text x='16' y='19' font-size='13' font-weight='700'>08:42</text><text x='344' y='19' font-size='13' font-weight='700' text-anchor='end'>GPS 4G 76%</text><rect y='28' width='360' height='40' fill='#fff' stroke='#0A0A0A' stroke-width='2'/><text x='16' y='54' font-size='15' font-weight='700'>Route 7</text><text x='344' y='54' font-size='14' text-anchor='end'>47 tickets</text><text x='16' y='92' font-size='12' font-weight='700' letter-spacing='1'>FROM · AUTO</text><text x='16' y='124' font-size='28' font-weight='700'>Prembazar</text><rect x='268' y='82' width='76' height='60' rx='12' fill='none' stroke='#0A0A0A' stroke-width='2'/><text x='306' y='118' font-size='13' font-weight='700' text-anchor='middle'>Change</text><line x1='0' y1='152' x2='360' y2='152' stroke='#0A0A0A' stroke-width='2'/><rect y='154' width='360' height='36' fill='#EFEFEF'/><text x='16' y='177' font-size='12' font-weight='700' letter-spacing='1'>TO · TAP DESTINATION</text>${[["Hijli More", "₹10", 0], ["Salua", "₹15", 1], ["Kalaikunda", "₹15", 0], ["Chowrangi", "₹20", 0], ["Keranitola", "₹25", 0], ["Medinipur", "₹30", 0]].map(([n, f, on], i) => `<g transform='translate(0 ${190 + i * 88})'><rect width='360' height='88' fill='${on ? "#FFD400" : "#fff"}'/><line x1='0' y1='0' x2='360' y2='0' stroke='#0A0A0A' stroke-width='2'/><text x='16' y='52' font-size='24' font-weight='700'>${n}</text><text x='344' y='54' font-size='30' font-weight='700' text-anchor='end'>${f}</text></g>`).join("")}</svg>`
)

const CHAT_SCREEN = svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 800' font-family='Arial,Helvetica,sans-serif'><rect width='1280' height='800' fill='#EEF2F7'/><rect width='1280' height='64' fill='#fff'/><text x='40' y='41' font-size='22' font-weight='700' fill='#0B2D5B'>Sonepar India</text>${["Products", "Brands", "Solutions", "Contact"].map((t, i) => `<text x='${600 + i * 130}' y='40' font-size='16' fill='#334155'>${t}</text>`).join("")}<rect x='40' y='110' width='520' height='34' rx='6' fill='#CBD5E1'/><rect x='40' y='160' width='420' height='34' rx='6' fill='#CBD5E1'/><rect x='40' y='230' width='360' height='14' rx='7' fill='#DDE3EC'/><rect x='40' y='256' width='300' height='14' rx='7' fill='#DDE3EC'/><rect x='40' y='310' width='170' height='48' rx='24' fill='#0B5CD6'/>${[0, 1, 2].map((i) => `<rect x='${40 + i * 196}' y='420' width='180' height='220' rx='14' fill='#fff'/><rect x='${56 + i * 196}' y='436' width='148' height='110' rx='10' fill='#E2E8F0'/><rect x='${56 + i * 196}' y='562' width='110' height='12' rx='6' fill='#CBD5E1'/>`).join("")}<g transform='translate(760 96)'><rect width='460' height='640' rx='22' fill='#fff' stroke='#D7DEE8' stroke-width='2'/><path d='M0 22a22 22 0 0 1 22-22h416a22 22 0 0 1 22 22v62H0z' fill='#0B5CD6'/><circle cx='44' cy='42' r='22' fill='#fff'/><text x='44' y='49' font-size='18' font-weight='700' fill='#0B5CD6' text-anchor='middle'>S</text><text x='80' y='38' font-size='19' font-weight='700' fill='#fff'>Sparky</text><text x='80' y='60' font-size='13' fill='#fff' opacity='.85'>Sonepar India assistant · online</text><rect x='24' y='110' width='330' height='64' rx='16' fill='#F1F5F9'/><text x='42' y='138' font-size='15' fill='#0F172A'>Hi! What brings you to Sonepar</text><text x='42' y='160' font-size='15' fill='#0F172A'>India today?</text>${["Sonepar Partner's Products", "Sonepar Brand Products", "Something else"].map((t, i) => `<rect x='24' y='${192 + i * 56}' width='300' height='44' rx='22' fill='${i ? "#fff" : "#0B5CD6"}' stroke='#0B5CD6' stroke-width='2'/><text x='44' y='${220 + i * 56}' font-size='15' font-weight='700' fill='${i ? "#0B5CD6" : "#fff"}'>${t}</text>`).join("")}<rect x='150' y='372' width='286' height='44' rx='16' fill='#0B5CD6'/><text x='168' y='400' font-size='15' fill='#fff'>Need a 63A MCB from Schneider</text><rect x='24' y='432' width='370' height='86' rx='16' fill='#F1F5F9'/><text x='42' y='460' font-size='15' fill='#0F172A'>Found 3 matches in the catalogue.</text><text x='42' y='482' font-size='15' fill='#0F172A'>Want a specialist to call you back</text><text x='42' y='504' font-size='15' fill='#0F172A'>within 24 hours?</text><rect x='24' y='534' width='150' height='40' rx='20' fill='#16A34A'/><text x='99' y='559' font-size='15' font-weight='700' fill='#fff' text-anchor='middle'>Yes, call me</text><rect x='24' y='590' width='412' height='34' rx='17' fill='#F8FAFC' stroke='#E2E8F0'/><text x='42' y='612' font-size='14' fill='#94A3B8'>Type your question…</text></g></svg>`
)

// three product and two brand case studies; every line here comes from the case study it links to
const MISSIONS: Mission[] = [
    {
        code: "MSN-01",
        kind: "Product",
        title: "Kshitij 2025 Website",
        objective: "A fest homepage visitors board like a spaceship: a tunnel rush on arrival, a hall with a KTJ hologram, and six stations to travel between, inspired by Raftaar's “Dehshat Ho”.",
        role: "Ideation and design",
        crew: "Kshitij, IIT Kharagpur · built by the tech team",
        year: "2025",
        tools: "Figma",
        result: "50K+",
        resultLabel: "visitors, with retention up 35%. Take the tour inside the case study",
        link: "/case-study/kshitij-2025-website",
        color: "#4FE3D0",
        frame: "laptop",
        images: [FU + "yOpm7KtRMpUn9pxZutaEMyLgSeQ.png"],
    },
    {
        code: "MSN-02",
        kind: "Product",
        title: "Sparky AI Assistant",
        objective: "Give Sonepar India's website its first way to ask a question: an assistant that answers from the real catalogue, refuses to guess, and turns a visitor into a sales lead.",
        role: "Product designer and builder",
        crew: "Sonepar India · marketing and sales",
        year: "2026",
        tools: "Figma, Python, n8n, vector search",
        result: "~92%",
        resultLabel: "answer accuracy in the pilot, with each lead routed to sales in two taps",
        link: "/case-study/sparky-ai-assistant",
        color: "#2F9BFF",
        frame: "laptop",
        images: [CHAT_SCREEN],
    },
    {
        code: "MSN-03",
        kind: "Product",
        title: "Conductor Ticketing",
        objective: "A ticketing screen a bus conductor can use with one thumb on a moving bus, readable in direct sun.",
        role: "Product designer",
        crew: "Nielsen design assignment",
        year: "2026",
        tools: "Figma",
        result: "2 taps",
        resultLabel: "to a ticket, down from four or five button presses",
        link: "/case-study/conductor-ticketing",
        color: "#8B5CF6",
        frame: "phone",
        images: [CONDUCTOR_SCREEN],
    },
    {
        code: "MSN-04",
        kind: "Brand",
        title: "Vaarahi",
        objective: "A brand identity for a jewellery house that stands apart from the usual red box: a peacock and the letter V drawn in one gold line, on deep green packaging.",
        role: "Brand designer",
        crew: "Vaarahi · via PixyGrid",
        year: "2026",
        tools: "Illustrator, Photoshop",
        result: "4",
        resultLabel: "pieces: logo, packaging, gift card and launch poster",
        link: "/case-study/vaarahi-brand-identity",
        color: "#FF8A2A",
        frame: "art",
        images: [FU + "glvAdlW9B9aO3vM0wFHzlNCXTw.png", FU + "VqZd6AFrYVbZ3geDOKGgKQ4E.png", FU + "0MPll5RdN7MYbXH7FYDa50Lhqw.png", FU + "QuVqFlcNCHc394c1k5vH5S3HSk.png"],
    },
    {
        code: "MSN-05",
        kind: "Brand",
        title: "Altura Honey",
        objective: "Name, logo and packaging for a wild Himalayan honey sold in Paris and New York: a mountain, a bee and a honey drop in one mark, on a hexagonal jar.",
        role: "Brand and packaging designer",
        crew: "General Championship (Social & Cultural), IIT Kharagpur",
        year: "2026",
        tools: "Illustrator, Photoshop",
        result: "3rd",
        resultLabel: "place in the brand design event at the 2026 General Championship",
        link: "/case-study/altura-honey",
        color: "#3BD671",
        frame: "art",
        images: [FU + "RQcO4EDf68E8uu6KCqmQbMUdaH0.png", FU + "nRZcSGns67ABwx09ZqS38w23Bc.png", FU + "Kc7JAUrYyCG3IyzS4bU4N6ymv8.png", FU + "mdjyxs2uwXJTuQzrnzxbq4y2pZ4.png"],
    },
]

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

/**
 * Mission Log: featured case studies as mission files on a ship's console. Pick a file on the left and the
 * viewer on the right scans it in: the work, the objective, the crew, and the one number that shows the result.
 * Three product missions (the Kshitij 2025 website, the Sparky AI assistant, conductor ticketing) and two brand missions
 * (Vaarahi, Altura), filterable.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 760
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function MissionLog(props: Props) {
    const {
        heading = "Mission log",
        intro: introProp = "Five projects I'd send first: three product, two brand. Pick a file to open it.",
        allLink = "/case-studies",
        style,
    } = props
    // an intro saved for an earlier set of missions describes the five it holds now
    const intro = /^(Two product case studies|Four projects)/.test(introProp) ? "Five projects I'd send first: three product, two brand. Pick a file to open it." : introProp
    const go = useGo()
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const root = useRef<HTMLDivElement>(null)
    const [filter, setFilter] = useState<"All" | "Product" | "Brand">("All")
    const [sel, setSel] = useState(0)
    const [shot, setShot] = useState(0)
    const [seen, setSeen] = useState(onCanvas)
    const [narrow, setNarrow] = useState(false)

    const list = MISSIONS.filter((x) => filter === "All" || x.kind === filter)
    const m = list[Math.min(sel, list.length - 1)]

    useEffect(() => setShot(0), [m.code])
    // missions with several pieces flick through them while the file is open
    useEffect(() => {
        if (onCanvas || m.images.length < 2) return
        const t = setInterval(() => setShot((s) => (s + 1) % m.images.length), 2600)
        return () => clearInterval(t)
    }, [m.code, onCanvas])

    useEffect(() => {
        const el = root.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 760))
        ro.observe(el)
        // the console boots up the first time it scrolls into view
        let io: IntersectionObserver | null = null
        if (typeof IntersectionObserver !== "undefined") {
            io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.25 })
            io.observe(el)
        } else setSeen(true)
        return () => {
            ro.disconnect()
            io?.disconnect()
        }
    }, [])

    const pick = (i: number) => setSel(i)

    return (
        <section ref={root} className={"ml" + (narrow ? " nr" : "") + (seen ? " on" : "")} style={{ ...style, ["--mc" as any]: m.color }} aria-label={heading}>
            <style>{CSS}</style>
            <header className="ml-head">
                <div>
                    <h2>{heading}</h2>
                    <p>{intro}</p>
                </div>
                <div className="ml-filter" role="group" aria-label="Filter missions">
                    {(["All", "Product", "Brand"] as const).map((f) => (
                        <button
                            key={f}
                            className={filter === f ? "on" : ""}
                            aria-pressed={filter === f}
                            onClick={() => {
                                setFilter(f)
                                setSel(0)
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            {narrow ? (
                <div className="ml-mlist">
                    {list.map((x) => (
                        <article key={x.code} className="ml-mcard" style={{ ["--mc" as any]: x.color }}>
                            <div className={"ml-mshot f-" + x.frame}>
                                <img src={sized(x.images[0], x.frame === "art" ? 900 : 1200)} alt={x.title} loading="lazy" draggable={false} />
                                <span className="ml-tag">
                                    {x.code} · {x.kind} design
                                </span>
                            </div>
                            <div className="ml-mbody">
                                <h3>{x.title}</h3>
                                <span className="ml-mcrew">
                                    {x.role} · {x.crew}
                                </span>
                                <p>{x.objective}</p>
                                <div className="ml-result">
                                    <b>{x.result}</b>
                                    <span>{x.resultLabel}</span>
                                </div>
                                <a
                                    className="ml-open"
                                    href={x.link}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        go(x.link)
                                    }}
                                >
                                    Open the mission file <i>→</i>
                                </a>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
            <div className="ml-console">
                <ol className="ml-files">
                    {list.map((x, i) => (
                        <li key={x.code}>
                            <button
                                className={"ml-file" + (x.code === m.code ? " sel" : "")}
                                style={{ ["--fc" as any]: x.color }}
                                onClick={() => pick(i)}
                                onMouseEnter={() => !narrow && pick(i)}
                                onFocus={() => pick(i)}
                                aria-current={x.code === m.code}
                            >
                                <span className="ml-code">
                                    {x.code} · {x.kind}
                                </span>
                                <b>{x.title}</b>
                                <span className="ml-crew">{x.crew}</span>
                                <span className="ml-led" />
                            </button>
                        </li>
                    ))}
                </ol>

                <div className="ml-viewer" key={m.code}>
                    <div className={"ml-screen f-" + m.frame}>
                        <span className="ml-scan" />
                        <div className="ml-shot">
                            {m.images.map((src, k) => (
                                <img key={src} src={sized(src, 1200)} alt={k === 0 ? m.title : ""} className={k === shot ? "on" : ""} draggable={false} />
                            ))}
                        </div>
                        {m.images.length > 1 && (
                            <div className="ml-dots" aria-hidden="true">
                                {m.images.map((_, k) => (
                                    <i key={k} className={k === shot ? "on" : ""} />
                                ))}
                            </div>
                        )}
                        <span className="ml-tag">
                            {m.code} · {m.kind} design
                        </span>
                    </div>
                    <div className="ml-data">
                        <h3>{m.title}</h3>
                        <p className="ml-obj">
                            <span>Objective</span>
                            {m.objective}
                        </p>
                        <dl>
                            {(
                                [
                                    ["Role", m.role],
                                    ["Crew", m.crew],
                                    ["Year", m.year],
                                    ["Tools", m.tools],
                                ] as [string, string][]
                            )
                                .filter(([, v]) => v)
                                .map(([k, v]) => (
                                    <div key={k}>
                                        <dt>{k}</dt>
                                        <dd>{v}</dd>
                                    </div>
                                ))}
                        </dl>
                        <div className="ml-result">
                            <b>{m.result}</b>
                            <span>{m.resultLabel}</span>
                        </div>
                        <a
                            className="ml-open"
                            href={m.link}
                            onClick={(e) => {
                                e.preventDefault()
                                go(m.link)
                            }}
                        >
                            Open the mission file <i>→</i>
                        </a>
                    </div>
                </div>
            </div>
            )}

            <a
                className="ml-all"
                href={allLink}
                onClick={(e) => {
                    e.preventDefault()
                    go(allLink)
                }}
            >
                All case studies <i>→</i>
            </a>
        </section>
    )
}

const CSS = `
.ml{--mc:#2F9BFF;box-sizing:border-box;position:relative;width:100%;max-width:1200px;margin-inline:auto;padding:90px 40px 80px;color:#E8EEF8;font-family:"Plus Jakarta Sans",Inter,system-ui,sans-serif;background:radial-gradient(70% 60% at 70% 40%,color-mix(in srgb,var(--mc) 10%,transparent),transparent 70%),#05070b;transition:background .8s}
.ml *{box-sizing:border-box}
.ml-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:34px}
.ml-head h2{margin:0;font-size:clamp(44px,6vw,84px);line-height:.95;font-weight:800;letter-spacing:-.04em;color:#3cc8ff;text-transform:uppercase}
.ml-head p{margin:12px 0 0;max-width:min(46ch,100%);font-size:16px;line-height:1.6;color:rgba(232,238,248,.7)}
.ml-filter{display:inline-flex;flex:none;padding:4px;border-radius:99px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)}
.ml-filter button{all:unset;cursor:pointer;padding:8px 16px;border-radius:99px;font-size:13.5px;font-weight:700;color:rgba(232,238,248,.65);transition:background .3s,color .3s}
.ml-filter button.on{background:#E8EEF8;color:#06090f}
.ml-filter button:focus-visible,.ml-file:focus-visible,.ml-open:focus-visible,.ml-all:focus-visible{outline:2px solid #fff;outline-offset:3px}

/* the console: files on the left, the viewer on the right, framed like the ship's panels */
.ml-console{display:grid;grid-template-columns:300px minmax(0,1fr);gap:18px;padding:18px;border-radius:24px;background:linear-gradient(180deg,#14171e,#0c0e13);border:1px solid #262a33;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 0 0 1px rgba(255,138,42,.08),0 30px 80px rgba(0,0,0,.6);opacity:0;transform:translateY(24px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.7,.2,1)}
.ml.on .ml-console{opacity:1;transform:none}
.ml-files{list-style:none;margin:0;padding:0;display:grid;gap:10px;align-content:start}
.ml-file{all:unset;position:relative;display:grid;gap:3px;width:100%;box-sizing:border-box;padding:16px 18px 16px 20px;border-radius:14px;cursor:pointer;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);transition:background .3s,border-color .3s,transform .3s}
.ml-file::before{content:"";position:absolute;left:0;top:14px;bottom:14px;width:3px;border-radius:3px;background:var(--fc);opacity:.35;transition:opacity .3s,box-shadow .3s}
.ml-file:hover{transform:translateX(3px)}
.ml-file.sel{background:color-mix(in srgb,var(--fc) 12%,rgba(255,255,255,.02));border-color:color-mix(in srgb,var(--fc) 55%,transparent)}
.ml-file.sel::before{opacity:1;box-shadow:0 0 12px var(--fc)}
.ml-code{font-size:11.5px;font-weight:700;letter-spacing:.06em;color:var(--fc)}
.ml-file b{font-size:17px;font-weight:800;color:#fff}
.ml-crew{font-size:12.5px;color:rgba(232,238,248,.55)}
.ml-led{position:absolute;right:16px;top:18px;width:7px;height:7px;border-radius:50%;background:#2a2f39}
.ml-file.sel .ml-led{background:var(--fc);box-shadow:0 0 10px var(--fc);animation:ml-blink 1.6s ease-in-out infinite}
@keyframes ml-blink{50%{opacity:.4}}

.ml-viewer{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:22px;min-height:440px;animation:ml-in .5s ease both}
@keyframes ml-in{from{opacity:0}}
.ml-screen{position:relative;overflow:hidden;border-radius:16px;background:radial-gradient(80% 80% at 50% 40%,color-mix(in srgb,var(--mc) 26%,#0a0d14),#06080d);border:1px solid color-mix(in srgb,var(--mc) 40%,#222);box-shadow:inset 0 0 40px rgba(0,0,0,.6),0 0 30px color-mix(in srgb,var(--mc) 18%,transparent);display:grid;place-items:center;padding:28px}
.ml-shot{position:relative;width:100%;height:100%;display:grid;place-items:center}
.ml-shot img{grid-area:1/1;max-width:100%;max-height:100%;object-fit:contain;opacity:0;transform:scale(.97);transition:opacity .6s ease,transform .8s cubic-bezier(.2,.7,.2,1);border-radius:8px}
.ml-shot img.on{opacity:1;transform:none}
.f-art .ml-shot img{width:100%;height:100%;object-fit:cover;border-radius:10px}
.f-art{padding:14px}
.f-phone .ml-shot img{height:340px;max-height:100%;width:auto;box-sizing:border-box;border:8px solid #15181f;border-radius:26px;box-shadow:0 20px 40px rgba(0,0,0,.5)}
.f-laptop .ml-shot img{width:100%;border:8px solid #15181f;border-radius:12px;box-shadow:0 20px 40px rgba(0,0,0,.5)}
/* a scan line runs down the screen each time a file opens */
.ml-scan{position:absolute;left:0;right:0;top:0;height:80px;z-index:2;pointer-events:none;background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--mc) 45%,transparent) 70%,#fff 100%);mix-blend-mode:screen;opacity:.0;animation:ml-scan .9s ease-out}
@keyframes ml-scan{0%{opacity:.8;transform:translateY(-80px)}100%{opacity:0;transform:translateY(520px)}}
.ml-screen::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(180deg,rgba(255,255,255,.03) 0 1px,transparent 1px 3px)}
.ml-tag{position:absolute;left:14px;top:14px;z-index:3;padding:5px 10px;border-radius:99px;font-size:11.5px;font-weight:700;color:#fff;background:rgba(6,8,13,.75);border:1px solid color-mix(in srgb,var(--mc) 55%,transparent);backdrop-filter:blur(8px)}
.ml-dots{position:absolute;left:50%;bottom:14px;z-index:3;translate:-50% 0;display:flex;gap:6px}
.ml-dots i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.3);transition:background .3s,width .3s}
.ml-dots i.on{width:18px;border-radius:3px;background:var(--mc)}

.ml-data{display:flex;flex-direction:column;gap:16px;padding:6px 4px}
.ml-data h3{margin:0;font-size:30px;line-height:1.1;font-weight:800;letter-spacing:-.02em;color:#fff}
.ml-obj{margin:0;font-size:15.5px;line-height:1.6;color:rgba(232,238,248,.82)}
.ml-obj span{display:block;margin-bottom:4px;font-size:12px;font-weight:700;color:var(--mc)}
.ml-data dl{margin:0;display:grid;grid-template-columns:1fr 1fr;gap:1px;border-radius:12px;overflow:hidden;background:rgba(255,255,255,.06)}
.ml-data dl div{padding:10px 12px;background:#0f1218}
.ml-data dt{font-size:11.5px;font-weight:600;color:rgba(232,238,248,.45)}
.ml-data dd{margin:2px 0 0;font-size:13.5px;font-weight:600;color:#fff}
.ml-result{display:flex;align-items:baseline;gap:12px;padding:14px 16px;border-radius:14px;background:color-mix(in srgb,var(--mc) 10%,transparent);border:1px solid color-mix(in srgb,var(--mc) 40%,transparent)}
.ml-result b{flex:none;font-size:34px;line-height:1;font-weight:800;letter-spacing:-.03em;color:var(--mc);font-variant-numeric:tabular-nums}
.ml-result span{font-size:13.5px;line-height:1.45;color:rgba(232,238,248,.78)}
.ml-open{align-self:flex-start;margin-top:auto;display:inline-flex;align-items:center;gap:10px;padding:12px 20px;border-radius:99px;font-size:14.5px;font-weight:700;text-decoration:none;color:#06090f;background:var(--mc);box-shadow:0 0 24px color-mix(in srgb,var(--mc) 40%,transparent);transition:transform .25s}
.ml-open i,.ml-all i{font-style:normal;transition:transform .25s}
.ml-open:hover{transform:translateY(-2px)}
.ml-open:hover i,.ml-all:hover i{transform:translateX(4px)}
.ml-all{display:inline-flex;align-items:center;gap:8px;margin-top:22px;font-size:15px;font-weight:700;color:#E8EEF8;text-decoration:none}

/* phones: each mission as a full card */
.ml.nr .ml-head h2{font-size:40px}
.ml.nr .ml-head p{font-size:15px}
.ml-mlist{display:grid;gap:16px}
.ml-mcard{overflow:hidden;border-radius:22px;background:linear-gradient(180deg,#12151c,#0b0d12);border:1px solid color-mix(in srgb,var(--mc) 40%,#232733);box-shadow:0 20px 50px rgba(0,0,0,.5),0 0 30px color-mix(in srgb,var(--mc) 12%,transparent)}
.ml-mshot{position:relative;display:grid;place-items:center;height:250px;padding:44px 18px 18px;background:radial-gradient(80% 80% at 50% 40%,color-mix(in srgb,var(--mc) 28%,#0a0d14),#06080d)}
.ml-mshot::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(180deg,rgba(255,255,255,.03) 0 1px,transparent 1px 3px)}
.ml-mshot img{max-width:100%;max-height:188px;object-fit:contain;box-sizing:border-box}
.ml-mshot.f-phone img{height:188px;width:auto;max-width:none;border:6px solid #15181f;border-radius:22px;box-shadow:0 16px 30px rgba(0,0,0,.5)}
.ml-mshot.f-art{padding:0}
.ml-mshot.f-art img{width:100%;height:100%;max-height:none;object-fit:cover}
.ml-mshot.f-laptop img{width:100%;border:6px solid #15181f;border-radius:10px;box-shadow:0 16px 30px rgba(0,0,0,.5)}
.ml-mbody{display:flex;flex-direction:column;gap:12px;padding:18px 18px 20px}
.ml-mbody h3{margin:0;font-size:24px;line-height:1.15;font-weight:800;letter-spacing:-.02em;color:#fff}
.ml-mcrew{margin-top:-6px;font-size:13px;font-weight:600;color:var(--mc)}
.ml-mbody p{margin:0;font-size:14.5px;line-height:1.6;color:rgba(232,238,248,.8)}
.ml-mbody .ml-result b{font-size:30px}
.ml-mbody .ml-open{margin-top:4px}
.ml.nr{padding:64px 16px 56px}
.ml.nr .ml-head{flex-direction:column;align-items:stretch;margin-bottom:22px}
.ml.nr .ml-filter{align-self:flex-start}
@media (prefers-reduced-motion:reduce){.ml-console,.ml-shot img{transition:none}.ml-scan,.ml-viewer,.ml-file.sel .ml-led{animation:none}}
`

addPropertyControls(MissionLog, {
    heading: { type: ControlType.String, title: "Heading", defaultValue: "Mission log" },
    intro: { type: ControlType.String, title: "Intro", displayTextArea: true, defaultValue: "Five projects I'd send first: three product, two brand. Pick a file to open it." },
    allLink: { type: ControlType.String, title: "All link", defaultValue: "/case-studies" },
})
