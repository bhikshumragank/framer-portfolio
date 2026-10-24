import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { useEffect, useRef, useState, type CSSProperties } from "react"

type Sector = {
    title: string
    color: string
    icon: "pen" | "eye" | "cursor" | "star"
    description: string
    skills: string
    link: string
    image1: string
    image2: string
    image3: string
}

type Props = {
    background: string
    sectors: Sector[]
    studioName: string
    screenHeading: string
    hint: string
    ctaLabel: string
    accentColor: string
    style?: CSSProperties
}

// The desk photo is 1448 × 1086 (Mragank's own setup). Its ultrawide screen is the rectangle
// x 456–975, y 244–411, and the chair's headrest rises in front of the screen's lower middle.
const IMG_W = 1448
const IMG_H = 1086
const SCR = { x: 456, y: 244, w: 519, h: 167 }
// outline of the headrest where it covers the screen (photo pixels), measured from the image
const HEAD =
    "polygon(611px 422px,611px 398px,614px 390px,619px 382px,631px 374px,647px 369px,680px 364px,730px 362px,779px 364px,811px 369px,827px 374px,839px 382px,845px 390px,848px 398px,848px 422px)"
// the desktop is laid out at 1600 px wide and scaled down onto the screen
const UI_W = 1600
const UI_H = Math.round((UI_W * SCR.h) / SCR.w)
const BG_DEFAULT = ""
const HEAD_TOP = (362 - SCR.y) / SCR.h
const FU = "https://framerusercontent.com/images/"

const DEFAULT_SECTORS: Sector[] = [
    {
        title: "Graphic Design",
        color: "#FF4F8B",
        icon: "pen",
        description: "Posters, illustration and social creatives that stop the scroll, set in confident typography.",
        skills: "Poster Design, Illustration, Social Media Creatives, Editorial Layout, Typography",
        link: "/portfolio-2#poster-design",
        image1: FU + "VAC5toetwiNCNIblXrw2qZkucA.jpeg",
        image2: FU + "krXdwACCv30WTXxyr0Nrqsiyd4Y.png",
        image3: FU + "oSM6uknVe9WE7CGl1o08LkWAQ.png",
    },
    {
        title: "Visual Design",
        color: "#2F9BFF",
        icon: "eye",
        description: "Interfaces, motion and visual systems that make a product feel clear and alive.",
        skills: "UI Design, Visual Hierarchy, 2D & 3D Motion, Design Systems, Responsive Design",
        link: "/portfolio-2#2d-animation",
        image1: FU + "1bwJmBV2l0ihlb8g67drgPW1kC0.png",
        image2: FU + "yOpm7KtRMpUn9pxZutaEMyLgSeQ.png",
        image3: FU + "uJXaMPuKfQjxnOWPFflqdO8ZP44.png",
    },
    {
        title: "Product Design",
        color: "#8B5CF6",
        icon: "cursor",
        description: "From user needs and business goals to journeys, wireframes and shipped interfaces.",
        skills: "User Research, User Journeys, Information Architecture, Wireframing, Prototyping",
        link: "/portfolio-2#internship",
        image1: FU + "kW0y8iJOpCF2afPjpMWmIji6c.png",
        image2: FU + "iW2TWYG1Rv4XifmJJbqrNPxpXUY.gif",
        image3: FU + "iGFckcDf9ZXuQxiMNVCZfU.png",
    },
    {
        title: "Brand Design",
        color: "#FF8A2A",
        icon: "star",
        description: "Identities, logos, mascots and brand films built on one consistent visual system.",
        skills: "Brand Identity, Logo Design, Mascot Design, Brand Films, Event Branding",
        link: "/portfolio-2#branding",
        image1: FU + "qJkGj6zVHBeVCwZVW1EDPPGn9c.jpeg",
        image2: FU + "75Zcm9dUfl7pjlM2aroSZIenPc.png",
        image3: FU + "KannsXOlRglftS9TMNY3t9AYVY.png",
    },
]

const ICONS: Record<string, JSX.Element> = {
    pen: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="M2 2l7.6 7.6" />
            <circle cx="11" cy="11" r="2" />
        </svg>
    ),
    eye: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l9 5-9 5-9-5 9-5z" />
            <path d="M3 12l9 5 9-5" />
            <path d="M3 17l9 5 9-5" />
        </svg>
    ),
    cursor: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
            <path d="M10 8l5 2-2 1-1 2-2-5z" />
        </svg>
    ),
    star: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="9" r="6" />
            <path d="M12 6l1 2 2 .3-1.5 1.4.4 2.1L12 10.8 10.1 11.8l.4-2.1L9 8.3l2-.3 1-2z" />
            <path d="M8.5 14L7 22l5-3 5 3-1.5-8" />
        </svg>
    ),
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

/**
 * Desk Monitor: the "What I do" section. Scrolling pushes the camera from the desk to the monitor, the
 * screen powers on, and the four working areas flicker on as neon apps. Opening an app shows its skills,
 * a few pieces of work and a link to the projects.
 *
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 2600
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function DeskMonitor(props: Props) {
    const {
        background = BG_DEFAULT,
        sectors = DEFAULT_SECTORS,
        studioName = "Mragank's Studio",
        screenHeading = "What I do",
        hint = "Click an app to explore",
        ctaLabel = "View projects",
        accentColor = "#FF8A2A",
        style,
    } = props

    const isStatic = useIsStaticRenderer()
    const root = useRef<HTMLDivElement>(null)
    const cam = useRef<HTMLDivElement>(null)
    const stage = useRef<HTMLDivElement>(null)
    const [power, setPower] = useState(isStatic)
    const [close, setClose] = useState(isStatic)
    const [open, setOpen] = useState<number | null>(null)
    const [origin, setOrigin] = useState("50% 50%")
    const [time, setTime] = useState("")

    const list = (sectors && sectors.length ? sectors : DEFAULT_SECTORS).slice(0, 6)

    // scroll drives the camera: the section is tall, the browser keeps the camera box pinned (sticky) while
    // the progress runs from 0 (wide desk shot) to 1 (screen filling the view)
    useEffect(() => {
        const el = root.current,
            cm = cam.current,
            st = stage.current
        if (!el || !cm || !st) return
        let raf = 0,
            lastP = -1,
            lastW = 0,
            lastH = 0,
            sp = -1,
            last = performance.now()
        const frame = (now: number) => {
            const dt = Math.min(0.25, (now - last) / 1000)
            last = now
            const r = el.getBoundingClientRect()
            const vw = r.width
            const vh = Math.min(window.innerHeight || 800, r.height || 800)
            const run = Math.max(1, r.height - vh)
            cm.style.height = `${vh}px`
            const target = isStatic ? 1 : clamp01(-r.top / run)
            // the camera glides after the scroll instead of jumping with each wheel step (time-based, so it
            // feels the same at any frame rate)
            if (sp < 0 || isStatic) sp = target
            else {
                sp += (target - sp) * (1 - Math.exp(-dt * 4.5))
                if (Math.abs(target - sp) < 0.0004) sp = target
            }
            const p = sp
            if (p !== lastP || vw !== lastW || vh !== lastH) {
                lastP = p
                lastW = vw
                lastH = vh
                // the push-in uses the first 80 % of the scroll; the rest is time at the screen
                const t = ease(clamp01(p / 0.8))
                const s0 = Math.max(vw / IMG_W, vh / IMG_H)
                const s1 = Math.min((vw * 0.9) / SCR.w, (vh * 0.82) / SCR.h)
                const s = s0 * Math.pow(s1 / s0, t)
                // start framed on the desk, end centred on the screen
                const c0x = IMG_W / 2,
                    c0y = Math.min(IMG_H - vh / (2 * s0), Math.max(vh / (2 * s0), 560))
                const c1x = SCR.x + SCR.w / 2,
                    c1y = SCR.y + SCR.h / 2
                const cx = c0x + (c1x - c0x) * t,
                    cy = c0y + (c1y - c0y) * t
                st.style.transform = `translate(${(vw / 2 - cx * s).toFixed(2)}px, ${(vh / 2 - cy * s).toFixed(2)}px) scale(${s.toFixed(5)})`
                if (t > 0.8) setPower(true)
                setClose(t > 0.97)
                // leaning in: the headrest fades and the room dims around the screen
                st.style.setProperty("--lean", clamp01((t - 0.84) / 0.14).toFixed(3))
            }
            raf = requestAnimationFrame(frame)
        }
        raf = requestAnimationFrame(frame)
        return () => cancelAnimationFrame(raf)
    }, [isStatic])

    // menu-bar clock
    useEffect(() => {
        const f = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
        f()
        const id = window.setInterval(f, 30000)
        return () => window.clearInterval(id)
    }, [])

    useEffect(() => {
        const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null)
        window.addEventListener("keydown", k)
        return () => window.removeEventListener("keydown", k)
    }, [])

    // clicking the screen from far away scrolls the visitor in to it
    const goClose = () => {
        const el = root.current
        if (!el || close) return
        const r = el.getBoundingClientRect()
        const vh = window.innerHeight || 800
        window.scrollTo({ top: window.scrollY + r.top + (r.height - vh) * 0.66, behavior: "smooth" })
    }

    const openApp = (i: number, e: React.MouseEvent<HTMLButtonElement>) => {
        const b = e.currentTarget.getBoundingClientRect()
        const d = e.currentTarget.closest(".dm-ui")!.getBoundingClientRect()
        setOrigin(`${(((b.left + b.width / 2 - d.left) / d.width) * 100).toFixed(1)}% ${(((b.top + b.height / 2 - d.top) / d.height) * 100).toFixed(1)}%`)
        setOpen(i)
    }

    const cur = open !== null ? list[open] : null

    return (
        <div ref={root} className={`dm${power ? " is-on" : ""}${close ? " is-close" : ""}`} style={{ ...style, "--acc": accentColor } as any}>
            <style>{CSS}</style>
            <div className="dm-cam" ref={cam}>
                <div className="dm-stage" ref={stage}>
                    {background ? (
                        <img className="dm-bg" src={background} alt="" draggable={false} />
                    ) : (
                        <div className="dm-bg dm-nobg">Add the desk photo in “Background URL”</div>
                    )}
                    {/* hides the image generator's sparkle in the bottom-right corner */}
                    <span className="dm-patch" aria-hidden />

                    {/* the monitor screen, exactly over the black screen in the photo */}
                    <div className="dm-screen" onClick={goClose}>
                        <div className="dm-ui" style={{ width: UI_W, height: UI_H, transform: `scale(${SCR.w / UI_W})`, "--ht": HEAD_TOP } as any}>
                            <div className="dm-wall" />
                            <div className="dm-bar">
                                <b>{studioName}</b>
                                <span>File</span>
                                <span>Edit</span>
                                <span>View</span>
                                <span className="dm-bar-r">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0" />
                                        <circle cx="12" cy="19" r="1" fill="currentColor" />
                                    </svg>
                                    <svg viewBox="0 0 28 14" width="24" height="12" fill="none" stroke="currentColor" strokeWidth="1.6">
                                        <rect x="1" y="1" width="22" height="12" rx="3" />
                                        <rect x="3.5" y="3.5" width="15" height="7" rx="1.5" fill="currentColor" stroke="none" />
                                        <path d="M25 5v4" />
                                    </svg>
                                    {time}
                                </span>
                            </div>
                            <div className="dm-home">
                                <p className="dm-kicker">{screenHeading}</p>
                                <div className="dm-apps" style={{ "--n": list.length } as any}>
                                    {list.map((s, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            className="dm-app"
                                            style={{ "--c": s.color, "--i": i } as any}
                                            onClick={(e) => openApp(i, e)}
                                            tabIndex={close ? 0 : -1}
                                            aria-label={`Open ${s.title}`}
                                        >
                                            <span className="dm-tile">{ICONS[s.icon] || ICONS.pen}</span>
                                            <span className="dm-name">{s.title}</span>
                                            {s.description && <span className="dm-desc">{s.description}</span>}
                                            <span className="dm-open">
                                                Open <i>→</i>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <p className={`dm-hint${cur ? " is-hidden" : ""}`}>
                                    <i>↖</i>
                                    {hint}
                                </p>
                            </div>
                            {cur && (
                                <div className="dm-win" key={open} style={{ "--c": cur.color, transformOrigin: origin } as any} role="dialog" aria-label={cur.title}>
                                    <div className="dm-tb">
                                        <span className="dm-dots">
                                            <button type="button" className="r" aria-label="Close" onClick={() => setOpen(null)} />
                                            <i className="y" />
                                            <i className="g" />
                                        </span>
                                        <b>{cur.title}</b>
                                    </div>
                                    <div className="dm-body">
                                        <div className="dm-info">
                                            <span className="dm-wicon">{ICONS[cur.icon] || ICONS.pen}</span>
                                            <h3>{cur.title}</h3>
                                            <p>{cur.description}</p>
                                            <div className="dm-tags">
                                                {String(cur.skills || "")
                                                    .split(",")
                                                    .map((x) => x.trim())
                                                    .filter(Boolean)
                                                    .map((x, i) => (
                                                        <span key={i}>{x}</span>
                                                    ))}
                                            </div>
                                            {cur.link && (
                                                <a className="dm-cta" href={cur.link}>
                                                    {ctaLabel} <span>→</span>
                                                </a>
                                            )}
                                        </div>
                                        <div className="dm-thumbs">
                                            {[cur.image1, cur.image2, cur.image3].filter(Boolean).map((src, i) => (
                                                <div key={i} className="dm-thumb">
                                                    <img src={src} alt="" loading="lazy" draggable={false} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="dm-scan" aria-hidden />
                        </div>
                        <div className="dm-off" aria-hidden />
                    </div>
                    {/* the chair's headrest, cut from the photo, stays in front of the screen */}
                    {background && <img className="dm-head" src={background} alt="" draggable={false} style={{ clipPath: HEAD }} />}
                    <span className="dm-focus" aria-hidden />
                </div>
                <div className="dm-scrollhint" aria-hidden>
                    Scroll to sit at the desk
                    <i />
                </div>
            </div>
        </div>
    )
}

const CSS = `
.dm{position:relative;width:100%;height:100%;background:#0d0d10;font-family:Inter,system-ui,-apple-system,sans-serif;overflow:clip}
.dm-cam{position:sticky;top:0;width:100%;height:100vh;overflow:hidden}
.dm-stage{position:absolute;left:0;top:0;width:${IMG_W}px;height:${IMG_H}px;transform-origin:0 0}
.dm-bg{position:absolute;inset:0;width:100%;height:100%;display:block;user-select:none;pointer-events:none}
.dm-nobg{display:grid;place-items:center;background:#1a1a1f;color:#777;font-size:28px}
.dm-patch{display:none;position:absolute;left:1730px;top:1220px;width:150px;height:150px;border-radius:50%;background:radial-gradient(closest-side,rgba(26,27,31,.97),rgba(26,27,31,.85) 55%,rgba(26,27,31,0));pointer-events:none}
.dm-screen{position:absolute;left:${SCR.x}px;top:${SCR.y}px;width:${SCR.w}px;height:${SCR.h}px;overflow:hidden;background:#000;cursor:zoom-in}
.dm.is-close .dm-screen{cursor:default}
.dm-head{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;user-select:none;opacity:calc(1 - var(--lean,0))}
.dm-focus{position:absolute;left:${SCR.x}px;top:${SCR.y}px;width:${SCR.w}px;height:${SCR.h}px;pointer-events:none;box-shadow:0 0 0 3000px rgba(0,0,0,calc(var(--lean,0) * .55)),0 0 40px rgba(255,138,42,calc(var(--lean,0) * .35))}
.dm-ui{position:absolute;left:0;top:0;transform-origin:0 0;overflow:hidden;color:#fff;pointer-events:none}
.dm.is-close .dm-ui{pointer-events:auto}
/* power on: a bright line that opens into the picture */
.dm-off{position:absolute;inset:0;background:#000;pointer-events:none}
.dm.is-on .dm-off{animation:dm-power .9s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes dm-power{0%{clip-path:inset(0 0 0 0);background:#000}18%{clip-path:inset(49.5% 0 49.5% 0);background:#dfefff;box-shadow:0 0 30px #9cf}40%{clip-path:inset(49.5% 0 49.5% 0);background:#dfefff}100%{clip-path:inset(50% 50% 50% 50%);background:#dfefff}}
.dm-ui>*:not(.dm-win){opacity:0} .dm.is-on .dm-ui>*:not(.dm-win){opacity:1;transition:opacity .4s ease .35s}
.dm-wall{position:absolute;inset:0;background:radial-gradient(60% 70% at 30% 20%,rgba(47,155,255,.35),transparent 60%),radial-gradient(50% 60% at 85% 90%,rgba(255,138,42,.22),transparent 60%),linear-gradient(160deg,#0b1430,#060914 60%,#0a0612)}
.dm-wall::after{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:48px 48px}
.dm-bar{position:absolute;left:0;right:0;top:0;height:34px;display:flex;align-items:center;gap:22px;padding:0 18px;font-size:14px;color:rgba(255,255,255,.85);background:rgba(10,12,20,.55);backdrop-filter:blur(10px)}
.dm-bar b{font-weight:700;color:#fff} .dm-bar-r{margin-left:auto;display:inline-flex;align-items:center;gap:14px;font-variant-numeric:tabular-nums}
.dm-home{position:absolute;left:0;right:0;top:34px;bottom:0;display:flex;flex-direction:column;align-items:stretch;justify-content:center;gap:16px;padding:18px 40px 22px;box-sizing:border-box}
.dm-kicker{margin:0;text-align:center;font-size:16px;letter-spacing:.32em;text-transform:uppercase;color:rgba(255,255,255,.6)}
.dm-apps{display:grid;grid-template-columns:repeat(var(--n,4),minmax(0,1fr));gap:24px;flex:1;min-height:0}
.dm-app{all:unset;box-sizing:border-box;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:18px 18px 16px;border-radius:26px;text-align:center;cursor:pointer;opacity:0;background:linear-gradient(165deg,color-mix(in srgb,var(--c) 16%,rgba(10,12,22,.78)),rgba(6,7,14,.88));box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--c) 75%,transparent),0 0 26px color-mix(in srgb,var(--c) 30%,transparent),inset 0 0 40px color-mix(in srgb,var(--c) 10%,transparent);transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .3s}
.dm.is-on .dm-app{animation:dm-neon 1.3s steps(1,end) calc(.7s + var(--i)*.25s) forwards}
@keyframes dm-neon{0%{opacity:0}10%{opacity:1}16%{opacity:.15}24%{opacity:1}30%{opacity:.35}38%{opacity:1}100%{opacity:1}}
.dm-tile{width:116px;height:116px;flex:none;border-radius:30px;display:grid;place-items:center;color:var(--c);background:linear-gradient(160deg,color-mix(in srgb,var(--c) 22%,#0c0f1a),#07080f);box-shadow:inset 0 0 0 2px var(--c),0 0 22px color-mix(in srgb,var(--c) 70%,transparent),0 0 60px color-mix(in srgb,var(--c) 35%,transparent),inset 0 0 30px color-mix(in srgb,var(--c) 30%,transparent);transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .3s}
.dm-tile svg{width:60px;height:60px;filter:drop-shadow(0 0 8px var(--c))}
.dm-name{font-size:26px;font-weight:800;letter-spacing:-.01em;line-height:1.1;color:#fff;text-shadow:0 0 14px color-mix(in srgb,var(--c) 80%,transparent)}
.dm-desc{font-size:14px;line-height:1.4;color:rgba(255,255,255,.66);max-width:280px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dm-open{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--c)} .dm-open i{font-style:normal;transition:transform .25s}
.dm-app:hover,.dm-app:focus-visible{transform:translateY(-6px);box-shadow:inset 0 0 0 2px var(--c),0 0 40px color-mix(in srgb,var(--c) 55%,transparent),inset 0 0 50px color-mix(in srgb,var(--c) 18%,transparent)}
.dm-app:hover .dm-open i{transform:translateX(4px)}
.dm-app:hover .dm-tile,.dm-app:focus-visible .dm-tile{transform:scale(1.05);box-shadow:inset 0 0 0 2px var(--c),0 0 30px var(--c),0 0 90px color-mix(in srgb,var(--c) 55%,transparent),inset 0 0 40px color-mix(in srgb,var(--c) 40%,transparent)}
.dm-app:focus-visible{outline:3px solid #fff;outline-offset:4px}
.dm-hint{margin:0;align-self:center;display:inline-flex;align-items:center;gap:12px;padding:12px 22px 12px 14px;border-radius:999px;font-size:15px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:color-mix(in srgb,var(--acc) 12%,transparent);box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--acc) 70%,transparent),0 0 26px color-mix(in srgb,var(--acc) 40%,transparent);text-shadow:0 0 10px var(--acc);transition:opacity .3s}
.dm-hint i{font-style:normal;display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--acc);color:#160a02;font-weight:800;text-shadow:none}
.dm.is-on .dm-hint{animation:dm-pulse 1.8s ease-in-out 2.2s infinite}
@keyframes dm-pulse{50%{box-shadow:inset 0 0 0 1.5px var(--acc),0 0 40px color-mix(in srgb,var(--acc) 60%,transparent)}}
.dm-hint.is-hidden{opacity:0}
/* app window */
.dm-win{position:absolute;left:50%;top:44px;bottom:10px;width:1060px;margin-left:-530px;border-radius:18px;overflow:hidden;background:rgba(12,14,24,.92);backdrop-filter:blur(18px);box-shadow:0 0 0 1px color-mix(in srgb,var(--c) 55%,transparent),0 30px 80px rgba(0,0,0,.6),0 0 60px color-mix(in srgb,var(--c) 25%,transparent);animation:dm-open .38s cubic-bezier(.2,.9,.25,1.05) both}
@keyframes dm-open{from{opacity:0;transform:scale(.15)}to{opacity:1;transform:scale(1)}}
.dm-tb{height:42px;display:flex;align-items:center;justify-content:center;position:relative;font-size:14px;color:rgba(255,255,255,.8);border-bottom:1px solid rgba(255,255,255,.08)}
.dm-dots{position:absolute;left:16px;top:50%;translate:0 -50%;display:flex;gap:8px}
.dm-dots>*{width:13px;height:13px;border-radius:50%;display:block}
.dm-dots .r{all:unset;width:13px;height:13px;border-radius:50%;background:#ff5f57;cursor:pointer} .dm-dots .r:focus-visible{outline:2px solid #fff;outline-offset:2px}
.dm-dots .y{background:#febc2e} .dm-dots .g{background:#28c840}
.dm-body{display:grid;grid-template-columns:1fr 1.15fr;gap:28px;padding:22px 28px;height:calc(100% - 42px);box-sizing:border-box}
.dm-info{display:flex;flex-direction:column;gap:11px;min-width:0}
.dm-wicon{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;color:var(--c);box-shadow:inset 0 0 0 1.5px var(--c),0 0 18px color-mix(in srgb,var(--c) 50%,transparent)} .dm-wicon svg{width:28px;height:28px}
.dm-info h3{margin:0;font-size:30px;line-height:1.05;letter-spacing:-.02em}
.dm-info p{margin:0;font-size:15.5px;line-height:1.45;color:rgba(255,255,255,.72)}
.dm-tags{display:flex;flex-wrap:wrap;gap:8px}
.dm-tags span{padding:7px 12px;border-radius:999px;font-size:13.5px;font-weight:600;color:#fff;background:color-mix(in srgb,var(--c) 16%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--c) 50%,transparent)}
.dm-cta{margin-top:auto;align-self:flex-start;display:inline-flex;align-items:center;gap:10px;padding:13px 22px;border-radius:999px;font-size:16px;font-weight:700;color:#fff;text-decoration:none;background:#006ECE;box-shadow:0 0 24px rgba(0,110,206,.55);transition:transform .25s,box-shadow .25s} .dm-cta span{transition:transform .25s}
.dm-cta:hover{transform:translateY(-2px);box-shadow:0 0 36px rgba(0,110,206,.75)} .dm-cta:hover span{transform:translateX(4px)}
.dm-cta:focus-visible{outline:3px solid #fff;outline-offset:3px}
.dm-thumbs{display:grid;grid-template-columns:1.2fr 1fr 1fr;grid-template-rows:1fr;gap:12px;min-height:0}
.dm-thumb{border-radius:12px;overflow:hidden;background:#151826;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)} 
.dm-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.dm-scan{position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 1px,transparent 1px 3px);mix-blend-mode:overlay}
.dm-scrollhint{position:absolute;left:50%;bottom:28px;translate:-50% 0;display:flex;flex-direction:column;align-items:center;gap:10px;font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:rgba(255,255,255,.7);transition:opacity .4s;pointer-events:none}
.dm-scrollhint i{width:1px;height:34px;background:linear-gradient(var(--acc),transparent);animation:dm-drop 1.6s ease-in-out infinite}
@keyframes dm-drop{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}51%{transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
.dm.is-on .dm-scrollhint{opacity:0}
@media (prefers-reduced-motion:reduce){.dm.is-on .dm-off{animation:none;opacity:0}.dm.is-on .dm-app{animation:none;opacity:1}.dm-win{animation:none}.dm-hint,.dm-scrollhint i{animation:none!important}}
`

addPropertyControls(DeskMonitor, {
    background: { type: ControlType.String, title: "Background URL", defaultValue: BG_DEFAULT, description: "The desk photo (1448 × 1086)" },
    studioName: { type: ControlType.String, title: "Menu Bar Name", defaultValue: "Mragank's Studio" },
    screenHeading: { type: ControlType.String, title: "Screen Heading", defaultValue: "What I do" },
    hint: { type: ControlType.String, title: "Hint", defaultValue: "Click an app to explore" },
    ctaLabel: { type: ControlType.String, title: "Button Label", defaultValue: "View projects" },
    accentColor: { type: ControlType.Color, title: "Neon Accent", defaultValue: "#FF8A2A" },
    sectors: {
        type: ControlType.Array,
        title: "Working Areas",
        maxCount: 6,
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title", defaultValue: "Graphic Design" },
                color: { type: ControlType.Color, title: "Neon Color", defaultValue: "#FF4F8B" },
                icon: { type: ControlType.Enum, title: "Icon", options: ["pen", "eye", "cursor", "star"], optionTitles: ["Pen", "Layers", "Screen", "Badge"], defaultValue: "pen" },
                description: { type: ControlType.String, title: "Description", defaultValue: "", displayTextArea: true },
                skills: { type: ControlType.String, title: "Skills", defaultValue: "", description: "Comma separated" },
                link: { type: ControlType.Link, title: "Projects Link" },
                image1: { type: ControlType.Image, title: "Image 1" },
                image2: { type: ControlType.Image, title: "Image 2" },
                image3: { type: ControlType.Image, title: "Image 3" },
            },
        },
        defaultValue: DEFAULT_SECTORS,
    },
})
