import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { useEffect, useRef, useState, type CSSProperties } from "react"

type Tool = {
    name: string
    category: string
    iconUrl: string
    icon?: { src: string }
    color: string
    shape: "book" | "box" | "tin"
}

type Props = {
    heading: string
    paragraph: string
    headingFont: string
    headingSize: number
    headingColor: string
    extrudeColor: string
    textColor: string
    tools: Tool[]
    ledColor: string
    shelfLed: string
    shelfColor: string
    accentColor: string
    tilt: number
    showPlant: boolean
    showLamps: boolean
    style?: CSSProperties
}

// ---- tools (same lookup as Tool Shelf: a saved list that only holds names still gets the right logo) ----
const DEV = "https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons"
const FRAMER_WHITE =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        "<svg viewBox='0 0 128 128' xmlns='http://www.w3.org/2000/svg'><path fill='#ffffff' d='M22.684 0h84.253v42.667H64.81L22.684 0Zm0 42.667H64.81l42.127 42.666H64.81V128L22.684 85.333V42.667Z'/></svg>"
    )
const adobeTile = (txt: string, fg: string, bg: string) =>
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg viewBox='0 0 128 128' xmlns='http://www.w3.org/2000/svg'><rect x='4' y='4' width='120' height='120' rx='26' fill='${bg}'/><text x='64' y='84' text-anchor='middle' font-family='Arial,Helvetica,sans-serif' font-weight='700' font-size='58' fill='${fg}'>${txt}</text></svg>`
    )
const KNOWN: Record<string, Omit<Tool, "name" | "icon">> = {
    photoshop: { category: "Photo editing", iconUrl: `${DEV}/photoshop/photoshop-original.svg`, color: "#1E6FD9", shape: "book" },
    illustrator: { category: "Vector & illustration", iconUrl: `${DEV}/illustrator/illustrator-plain.svg`, color: "#C98A12", shape: "box" },
    "after effects": { category: "Motion graphics", iconUrl: `${DEV}/aftereffects/aftereffects-original.svg`, color: "#7B4DFF", shape: "box" },
    figma: { category: "UI & prototyping", iconUrl: `${DEV}/figma/figma-original.svg`, color: "#8B3DFF", shape: "tin" },
    framer: { category: "Web & interaction", iconUrl: FRAMER_WHITE, color: "#1F5FA8", shape: "book" },
    "premiere pro": { category: "Video editing", iconUrl: `${DEV}/premierepro/premierepro-original.svg`, color: "#8A3DFF", shape: "box" },
    blender: { category: "3D modelling", iconUrl: `${DEV}/blender/blender-original.svg`, color: "#D2691E", shape: "box" },
    "adobe xd": { category: "UI design", iconUrl: `${DEV}/xd/xd-original.svg`, color: "#D433C8", shape: "box" },
    xd: { category: "UI design", iconUrl: `${DEV}/xd/xd-original.svg`, color: "#D433C8", shape: "box" },
    canva: { category: "Social creatives", iconUrl: `${DEV}/canva/canva-original.svg`, color: "#00A8B5", shape: "box" },
    indesign: { category: "Editorial & print", iconUrl: adobeTile("Id", "#FF3366", "#49021F"), color: "#E0284F", shape: "box" },
    "adobe indesign": { category: "Editorial & print", iconUrl: adobeTile("Id", "#FF3366", "#49021F"), color: "#E0284F", shape: "box" },
}
const CTRL_DEFAULTS = { category: "Photo editing", iconUrl: `${DEV}/photoshop/photoshop-original.svg`, color: "#1E6FD9", shape: "book" }
const norm = (s: any) => {
    const v = String(s || "").trim().toLowerCase().replace(/\s+/g, "")
    const m = v.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/)
    return m ? `rgb(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)})` : v.replace(/^rgba\((\d+,\d+,\d+),1\)$/, "rgb($1)")
}
const setOr = (v: any, ctrlDefault: string, known?: string, fallback = "") => {
    const val = String(v || "").trim()
    if (val && norm(val) !== norm(ctrlDefault)) return val
    return known || val || fallback
}
const resolve = (t: any): Tool => {
    const k = KNOWN[String((t && t.name) || "").trim().toLowerCase().replace(/\s+/g, " ")]
    return {
        name: String((t && t.name) || "Tool"),
        icon: t && t.icon && t.icon.src ? t.icon : undefined,
        category: setOr(t && (t.category || t.tag), CTRL_DEFAULTS.category, k && k.category),
        iconUrl: setOr(t && t.iconUrl, CTRL_DEFAULTS.iconUrl, k && k.iconUrl),
        color: setOr(t && t.color, CTRL_DEFAULTS.color, k && k.color, "#2681D0"),
        shape: setOr(t && t.shape, CTRL_DEFAULTS.shape, k && k.shape, "box") as Tool["shape"],
    }
}
const DEFAULT_TOOLS: Tool[] = ["Photoshop", "Illustrator", "After Effects", "Figma", "Framer", "Premiere Pro", "Blender", "Adobe XD", "InDesign"].map(
    (name) => ({ name, ...KNOWN[name.toLowerCase()] })
)
const GEO: Record<string, [number, number, number]> = {
    book: [112, 150, 30],
    box: [122, 150, 44],
    tin: [108, 112, 60],
}
const Barcode = () => (
    <span className="sr-bc" aria-hidden>
        {[3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2].map((w, i) => (
            <i key={i} style={{ width: w }} />
        ))}
    </span>
)

// Monstera-style plant, drawn once (leaf: pointed ellipse, rotated around the stem base)
const LEAVES: [number, number, number, number][] = [
    // [angle, length, width, stem height]
    [-58, 230, 92, 300], [-34, 260, 104, 380], [-12, 250, 98, 460], [10, 240, 96, 420], [32, 220, 88, 330],
    [-46, 200, 80, 220], [22, 190, 78, 250], [-4, 180, 74, 300],
]
const Plant = () => (
    <svg className="sr-plant" viewBox="0 0 320 720" aria-hidden>
        <defs>
            <linearGradient id="srLeaf" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#3f6b2a" />
                <stop offset="0.55" stopColor="#1f3d17" />
                <stop offset="1" stopColor="#0d1d0b" />
            </linearGradient>
            <linearGradient id="srPot" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#0c0c0e" />
                <stop offset="0.45" stopColor="#2b2a2e" />
                <stop offset="1" stopColor="#09090a" />
            </linearGradient>
        </defs>
        {LEAVES.map(([a, len, w, sh], i) => (
            <g key={i} transform={`translate(150 ${600 - sh * 0.15}) rotate(${a})`}>
                <path d={`M0 0 L0 ${-sh * 0.55}`} stroke="#1b2f12" strokeWidth="5" />
                <path
                    d={`M0 ${-sh * 0.5} C ${w} ${-sh * 0.5 - len * 0.25}, ${w * 0.7} ${-sh * 0.5 - len * 0.85}, 0 ${-sh * 0.5 - len} C ${-w * 0.7} ${-sh * 0.5 - len * 0.85}, ${-w} ${-sh * 0.5 - len * 0.25}, 0 ${-sh * 0.5} Z`}
                    fill="url(#srLeaf)"
                />
                <path d={`M0 ${-sh * 0.5} L0 ${-sh * 0.5 - len * 0.95}`} stroke="#4d7a33" strokeWidth="2" opacity="0.6" />
            </g>
        ))}
        <path d="M70 590 h160 l-14 130 h-132 z" fill="url(#srPot)" />
        <ellipse cx="150" cy="590" rx="80" ry="12" fill="#151517" />
    </svg>
)

/**
 * Showroom Hero: a lit room. The left wall carries the heading in 3D letters, the right wall carries a
 * lit shelf of tools. LEDs flicker on, the heading rises, the tools drop onto the shelf, the mouse turns
 * the shelf, and hovering a tool lifts it and slides out its label.
 *
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 900
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function ShowroomHero(props: Props) {
    const {
        heading = "Designing|Products,|Brands and|Visuals",
        paragraph = "",
        headingFont = "Inter",
        headingSize = 86,
        headingColor = "#2F9BFF",
        extrudeColor = "#0A3D7A",
        textColor = "#E9E6E1",
        tools = DEFAULT_TOOLS,
        ledColor = "#FF8A2A",
        shelfLed = "#2A7BFF",
        shelfColor = "#141A29",
        accentColor = "#006ECE",
        tilt = 1,
        showPlant = true,
        showLamps = true,
        style,
    } = props

    const isStatic = useIsStaticRenderer()
    const root = useRef<HTMLDivElement>(null)
    const unit = useRef<HTMLDivElement>(null)
    const panel = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)
    const [inView, setInView] = useState(false)
    const on = inView || isStatic

    // load the heading face from Google Fonts (a family name typed in the panel)
    useEffect(() => {
        const fam = String(headingFont || "").trim()
        if (!fam || typeof document === "undefined") return
        const id = "sr-font-" + fam.replace(/\W+/g, "-")
        if (document.getElementById(id)) return
        const l = document.createElement("link")
        l.id = id
        l.rel = "stylesheet"
        l.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fam)}:wght@700;800;900&display=swap`
        document.head.appendChild(l)
    }, [headingFont])

    // the room is drawn on a 1440 × 900 stage: it covers wide boxes and fits whole on narrow ones
    useEffect(() => {
        const el = root.current
        if (!el) return
        const ro = new ResizeObserver(([e]) => {
            const { width: w, height: h } = e.contentRect
            if (!w) return
            // fill the width; a tall box may crop a little off the sides rather than show empty bands
            setScale(!h || w < 760 ? w / 1440 : Math.max(w / 1440, h / 1000))
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    useEffect(() => {
        if (isStatic || !root.current) return
        const io = new IntersectionObserver(
            (es) => {
                if (es[0].isIntersecting) {
                    setInView(true)
                    io.disconnect()
                }
            },
            { threshold: 0.2 }
        )
        io.observe(root.current)
        return () => io.disconnect()
    }, [isStatic])

    // mouse: the shelf turns, the wall panel and lamps drift a little
    useEffect(() => {
        if (isStatic || !root.current || !unit.current) return
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        const sc = root.current,
            un = unit.current,
            pn = panel.current
        let tx = 0,
            ty = 0,
            mx = 0,
            my = 0,
            raf = 0
        const mv = (e: PointerEvent) => {
            const r = sc.getBoundingClientRect()
            tx = Math.max(-0.6, Math.min(0.6, (e.clientX - r.left) / r.width - 0.5))
            ty = Math.max(-0.6, Math.min(0.6, (e.clientY - r.top) / r.height - 0.5))
        }
        const loop = () => {
            mx += (tx - mx) * 0.06
            my += (ty - my) * 0.06
            const k = reduce ? 0 : tilt
            un.style.transform = `rotateX(${(5 - my * 5 * k).toFixed(2)}deg) rotateY(${(-10 + mx * 12 * k).toFixed(2)}deg)`
            if (pn) pn.style.transform = `rotateY(${(20 + mx * 4 * k).toFixed(2)}deg)`
            sc.style.setProperty("--mx", (mx * k).toFixed(3))
            raf = requestAnimationFrame(loop)
        }
        window.addEventListener("pointermove", mv)
        raf = requestAnimationFrame(loop)
        return () => {
            window.removeEventListener("pointermove", mv)
            cancelAnimationFrame(raf)
        }
    }, [isStatic, tilt])

    const list = (tools && tools.length ? tools : DEFAULT_TOOLS).slice(0, 12).map(resolve)
    const rows: Tool[][] = []
    for (let i = 0; i < list.length; i += 3) rows.push(list.slice(i, i + 3))
    const lines = String(heading || "").split("|").map((s) => s.trim()).filter(Boolean)

    const ext = Array.from({ length: 11 }, (_, i) => `${(i + 1) * 0.55}px ${i + 1}px 0 ${extrudeColor}`).join(",")

    const obj = (t: Tool, i: number, col: number, rowLen: number) => {
        const [w, h, d] = GEO[t.shape] || GEO.box
        const src = (t.icon && t.icon.src) || t.iconUrl
        const flip = col === rowLen - 1 && rowLen > 1
        return (
            <div
                key={t.name + i}
                className={`sr-obj is-${t.shape}${flip ? " is-flip" : ""}`}
                tabIndex={0}
                aria-label={`${t.name}, ${t.category}`}
                style={{ "--w": `${w}px`, "--h": `${h}px`, "--d": `${d}px`, "--tc": t.color, "--i": i } as any}
            >
                <span className="sr-box" aria-hidden>
                    <span className="sr-face f">
                        <span className="sr-logo">{src && <img src={src} alt="" draggable={false} loading="eager" />}</span>
                        <span className="sr-print">
                            <b>{t.name}</b>
                            <i>{t.category}</i>
                        </span>
                        <Barcode />
                    </span>
                    <span className="sr-face l">
                        <b>{t.name}</b>
                    </span>
                    <span className="sr-face r" />
                    <span className="sr-face t" />
                    <span className="sr-face k" />
                    <span className="sr-shadow" />
                </span>
                <span className="sr-tag" aria-hidden>
                    <span className="sr-hole" />
                    <b>{t.name}</b>
                    <i>{t.category}</i>
                </span>
            </div>
        )
    }

    return (
        <div
            ref={root}
            className={`sr${on ? " is-in" : ""}${isStatic ? " is-still" : ""}`}
            style={
                {
                    ...style,
                    "--led": ledColor,
                    "--sled": shelfLed,
                    "--shelf": shelfColor,
                    "--acc": accentColor,
                    "--hc": headingColor,
                    "--tx": textColor,
                } as any
            }
        >
            <style>{CSS}</style>
            <div className="sr-stage" style={{ transform: `translate(-50%,-50%) scale(${scale})` }}>
                {/* room: ceiling, walls, floor and the warm LED coves */}
                <svg className="sr-room" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden>
                    <defs>
                        <linearGradient id="srCeil" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#1a1411" />
                            <stop offset="1" stopColor="#3a2a20" />
                        </linearGradient>
                        <linearGradient id="srWallL" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0" stopColor="#2c2622" />
                            <stop offset="1" stopColor="#3a3029" />
                        </linearGradient>
                        <linearGradient id="srWallR" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0" stopColor="#2a2421" />
                            <stop offset="1" stopColor="#1e1a18" />
                        </linearGradient>
                        <linearGradient id="srFloor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#2a2524" />
                            <stop offset="1" stopColor="#121012" />
                        </linearGradient>
                        <linearGradient id="srCone" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#ffd7a8" stopOpacity="0.32" />
                            <stop offset="1" stopColor="#ffd7a8" stopOpacity="0" />
                        </linearGradient>
                        <filter id="srBlur8" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="8" />
                        </filter>
                        <filter id="srBlur24" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="24" />
                        </filter>
                        <filter id="srBlur50" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="50" />
                        </filter>
                    </defs>
                    <polygon points="0,0 1440,0 1440,30 730,140" fill="url(#srCeil)" />
                    <polygon points="0,0 730,140 730,700 0,790" fill="url(#srWallL)" />
                    <polygon points="730,140 1440,30 1440,790 730,700" fill="url(#srWallR)" />
                    <polygon points="0,790 730,700 1440,790 1440,900 0,900" fill="url(#srFloor)" />
                    {/* warm wash on the walls under the coves */}
                    <polygon className="sr-led" style={{ "--d": "0ms" } as any} points="0,0 730,140 730,320 0,240" fill="var(--led)" opacity="0.10" filter="url(#srBlur50)" />
                    <polygon className="sr-led" style={{ "--d": "120ms" } as any} points="730,140 1440,30 1440,220 730,300" fill="var(--led)" opacity="0.08" filter="url(#srBlur50)" />
                    {/* floor reflections */}
                    <ellipse className="sr-led" style={{ "--d": "400ms" } as any} cx="380" cy="820" rx="360" ry="34" fill="var(--led)" opacity="0.22" filter="url(#srBlur24)" />
                    <ellipse className="sr-led" style={{ "--d": "700ms" } as any} cx="1080" cy="850" rx="300" ry="40" fill="var(--sled)" opacity="0.22" filter="url(#srBlur24)" />
                    <ellipse className="sr-led" style={{ "--d": "800ms" } as any} cx="1210" cy="870" rx="130" ry="30" fill="#ff2f8a" opacity="0.18" filter="url(#srBlur24)" />
                    {/* LED coves: a wide glow, a tight glow and the hot core for each strip */}
                    {[
                        ["240,0 728,138", 0],
                        ["732,138 1440,28", 150],
                        ["730,144 730,698", 300],
                        ["0,786 728,698", 450],
                        ["732,698 1440,786", 600],
                    ].map(([pts, d], i) => (
                        <g key={i} className="sr-led" style={{ "--d": `${d}ms` } as any}>
                            <polyline points={pts as string} fill="none" stroke="var(--led)" strokeWidth="26" opacity="0.35" filter="url(#srBlur24)" />
                            <polyline points={pts as string} fill="none" stroke="var(--led)" strokeWidth="8" opacity="0.75" filter="url(#srBlur8)" />
                            <polyline points={pts as string} fill="none" stroke="#ffe2c0" strokeWidth="2.5" />
                        </g>
                    ))}
                    {/* ceiling spotlights with their cones */}
                    {showLamps &&
                        [
                            [320, 0, 160],
                            [1270, 40, 200],
                        ].map(([x, y, w], i) => (
                            <g key={i}>
                                <polygon className="sr-cone" points={`${x - 12},${y + 46} ${x + 12},${y + 46} ${x + w},${y + 560} ${x - w},${y + 560}`} fill="url(#srCone)" />
                                <rect x={x - 18} y={y} width="36" height="46" rx="6" fill="#0b0b0c" />
                                <rect x={x - 18} y={y} width="36" height="46" rx="6" fill="none" stroke="#2a2a2c" />
                                <ellipse className="sr-led" style={{ "--d": `${200 + i * 200}ms` } as any} cx={x} cy={y + 46} rx="14" ry="5" fill="#fff4e0" />
                                <ellipse className="sr-led" style={{ "--d": `${200 + i * 200}ms` } as any} cx={x} cy={y + 52} rx="40" ry="14" fill="#ffd7a8" opacity="0.6" filter="url(#srBlur8)" />
                            </g>
                        ))}
                </svg>

                {/* left wall: the lit panel with the 3D heading */}
                <div className="sr-panelwrap">
                    <div className="sr-panel" ref={panel}>
                        <h1 className="sr-h" style={{ fontFamily: `'${headingFont}', Inter, 'Arial Black', sans-serif`, fontSize: headingSize, textShadow: `${ext},0 0 40px color-mix(in srgb, ${headingColor} 45%, transparent)` }}>
                            {lines.map((ln, i) => (
                                <span key={i} className="sr-hl">
                                    <span style={{ transitionDelay: `${700 + i * 120}ms` }}>{ln}</span>
                                </span>
                            ))}
                        </h1>
                        {paragraph && paragraph.trim() && (
                            <p className="sr-p" style={{ transitionDelay: `${700 + lines.length * 120 + 100}ms` }}>
                                {paragraph}
                            </p>
                        )}
                    </div>
                </div>

                {/* right wall: the lit shelf */}
                <div className="sr-shelfwrap">
                    <div className="sr-unit" ref={unit}>
                        <div className="sr-back" aria-hidden>
                            {rows.map((_, ri) => (
                                <span key={ri} className="sr-downs" style={{ top: `${ri * 226 + 4}px` }}>
                                    <i /><i /><i />
                                </span>
                            ))}
                        </div>
                        <div className="sr-post is-l" aria-hidden><i className="pf" /><i className="pl" /><i className="led" /></div>
                        <div className="sr-post is-r" aria-hidden><i className="pf" /><i className="pl" /><i className="led" /></div>
                        <div className="sr-row is-cap" style={{ "--p": 0 } as any}>
                            <div className="sr-plank" aria-hidden><i className="pt" /><i className="pf" /><i className="pl" /></div>
                        </div>
                        {rows.map((row, ri) => (
                            <div key={ri} className="sr-row" style={{ "--p": ri + 1 } as any}>
                                <div className="sr-objs">{row.map((t, ci) => obj(t, ri * 3 + ci, ci, row.length))}</div>
                                <div className="sr-plank" aria-hidden><i className="pt" /><i className="pf" /><i className="pl" /></div>
                            </div>
                        ))}
                    </div>
                </div>

                {showPlant && <Plant />}
            </div>
        </div>
    )
}

const CSS = `
.sr{position:relative;width:100%;height:100%;overflow:hidden;background:linear-gradient(180deg,#1a1411 0%,#2a2420 50%,#121012 100%);isolation:isolate;font-family:Inter,system-ui,-apple-system,sans-serif}
.sr-stage{position:absolute;left:50%;top:50%;width:1440px;height:900px;transform-origin:50% 50%}
.sr-room{position:absolute;inset:0;width:100%;height:100%;display:block}
/* lights flicker on, one strip after another */
.sr-led{opacity:0} .sr.is-in .sr-led{animation:sr-on 1.3s linear var(--d,0ms) forwards} .sr.is-still .sr-led{animation:none;opacity:1}
@keyframes sr-on{0%{opacity:0}8%{opacity:.85}12%{opacity:.1}20%{opacity:1}26%{opacity:.35}34%{opacity:1}100%{opacity:1}}
.sr-cone{opacity:0;transition:opacity 1.6s ease .9s} .sr.is-in .sr-cone{opacity:1} .sr.is-still .sr-cone{opacity:1;transition:none}
/* left wall panel */
.sr-panelwrap{position:absolute;left:150px;top:110px;width:580px;height:600px;perspective:1300px;perspective-origin:100% 40%}
.sr-panel{position:absolute;inset:0;transform-origin:100% 50%;transform:rotateY(20deg);background:linear-gradient(180deg,#1f1d21,#18171a);border-radius:4px;padding:52px 52px;display:flex;flex-direction:column;justify-content:center;gap:28px;box-shadow:0 -6px 22px -6px var(--led),6px 0 26px -8px var(--led),0 8px 30px -8px var(--led),0 30px 60px rgba(0,0,0,.55);outline:1px solid color-mix(in srgb,var(--led) 55%,transparent)}
.sr-panel::after{content:"";position:absolute;left:0;right:0;top:62%;height:1px;background:rgba(255,255,255,.06)}
.sr-h{margin:0;width:max-content;max-width:none;color:var(--hc);font-weight:900;line-height:.94;letter-spacing:-.045em;display:flex;flex-direction:column}
.sr-hl{display:block;overflow:hidden;white-space:nowrap;padding:0 .08em .16em 0;margin-bottom:-.16em}
.sr-hl>span{display:inline-block;translate:0 110%;transition:translate 1.1s cubic-bezier(.2,.75,.2,1)}
.sr.is-in .sr-hl>span{translate:0 0} .sr.is-still .sr-hl>span{translate:0 0;transition:none}
.sr-p{position:relative;z-index:1;margin:0;max-width:520px;color:var(--tx);font-size:21px;line-height:1.45;letter-spacing:-.005em;opacity:0;translate:0 14px;transition:opacity .9s ease,translate 1s cubic-bezier(.2,.8,.2,1)}
.sr.is-in .sr-p{opacity:.92;translate:0 0} .sr.is-still .sr-p{opacity:.92;translate:0 0;transition:none}
/* plant */
.sr-plant{position:absolute;left:-110px;top:380px;width:240px;height:540px;pointer-events:none;filter:drop-shadow(10px 14px 18px rgba(0,0,0,.6))}
/* right wall shelf */
.sr-shelfwrap{position:absolute;left:770px;top:120px;width:620px;height:760px;perspective:1600px;perspective-origin:40% 20%;display:flex;justify-content:center}
.sr-unit{position:relative;width:560px;transform-style:preserve-3d;transform:rotateX(5deg) rotateY(-10deg);display:flex;flex-direction:column;gap:46px;padding:0 0 18px}
.sr-back{position:absolute;left:-16px;right:-16px;top:-16px;bottom:18px;transform:translateZ(-70px);background:linear-gradient(180deg,#1b2233,#0f141f);box-shadow:inset 0 0 70px rgba(0,0,0,.75)}
.sr-downs{position:absolute;left:0;right:0;height:200px;display:flex;justify-content:space-around;padding:0 40px}
.sr-downs i{width:150px;height:200px;background:radial-gradient(46% 70% at 50% 0%,rgba(255,226,190,.32),rgba(255,226,190,0) 70%)}
.sr-downs i::before{content:"";display:block;margin:0 auto;width:26px;height:5px;border-radius:3px;background:#fff6e6;box-shadow:0 0 12px 4px rgba(255,230,190,.8)}
.sr-post{position:absolute;top:-16px;bottom:18px;width:16px;transform-style:preserve-3d} .sr-post.is-l{left:-16px} .sr-post.is-r{right:-16px}
.sr-post i{position:absolute;display:block}
.sr-post .pf{inset:0;transform:translateZ(70px);background:linear-gradient(90deg,color-mix(in srgb,var(--shelf) 70%,#3a4660),var(--shelf))}
.sr-post .pl{left:0;top:0;bottom:0;width:140px;transform-origin:0 50%;transform:translateZ(70px) rotateY(90deg);background:linear-gradient(90deg,color-mix(in srgb,var(--shelf) 80%,#000),#06080d)}
.sr-post.is-l .led{right:-3px;top:8px;bottom:8px;width:3px;transform:translateZ(66px);background:color-mix(in srgb,var(--sled) 70%,#fff);box-shadow:0 0 10px 3px var(--sled),0 0 34px 8px color-mix(in srgb,var(--sled) 60%,transparent);opacity:0;transition:opacity .6s ease .5s}
.sr-post.is-r .led{display:none}
.sr.is-in .sr-post .led{opacity:1} .sr.is-still .sr-post .led{opacity:1;transition:none}
.sr-row{position:relative;transform-style:preserve-3d;height:180px} .sr-row.is-cap{height:0;margin-bottom:-30px}
.sr-objs{position:absolute;left:6%;right:6%;bottom:14px;display:flex;align-items:flex-end;justify-content:space-between;transform-style:preserve-3d}
.sr-plank{position:absolute;left:0;right:0;bottom:0;height:14px;transform-style:preserve-3d;opacity:0;translate:60px 0;transition:opacity .9s ease calc(var(--p)*150ms + 300ms),translate 1.1s cubic-bezier(.2,.8,.2,1) calc(var(--p)*150ms + 300ms)}
.sr.is-in .sr-plank{opacity:1;translate:0 0}
.sr-plank i{position:absolute;display:block}
.sr-plank .pt{left:0;right:0;top:0;height:140px;transform-origin:50% 0;transform:translateZ(70px) rotateX(-90deg);background:linear-gradient(180deg,color-mix(in srgb,var(--shelf) 70%,#3a4660),var(--shelf))}
.sr-plank .pf{inset:0;transform:translateZ(70px);background:linear-gradient(180deg,color-mix(in srgb,var(--shelf) 80%,#4a5670),color-mix(in srgb,var(--shelf) 70%,#000));border-top:2px solid color-mix(in srgb,var(--sled) 55%,#fff);box-shadow:0 -2px 14px 1px var(--sled),0 22px 40px -10px rgba(0,0,0,.8)}
.sr-plank .pl{left:0;top:0;width:140px;height:14px;transform-origin:0 50%;transform:translateZ(70px) rotateY(90deg);background:#06080d}
/* tools */
.sr-obj{position:relative;display:block;width:var(--w);height:var(--h);outline:none;cursor:pointer;transform-style:preserve-3d;opacity:0;translate:0 -46px;transition:transform .6s cubic-bezier(.34,1.56,.64,1),translate 1s cubic-bezier(.34,1.4,.64,1) calc(var(--i)*90ms + 700ms),opacity .5s ease calc(var(--i)*90ms + 700ms)}
.sr.is-in .sr-obj{opacity:1;translate:0 0}
.sr.is-still .sr-obj,.sr.is-still .sr-plank{transition:none}
.sr-obj:hover,.sr-obj:focus-visible{transform:translate3d(0,-16px,60px) rotateY(-8deg)}
.sr-box{position:absolute;inset:0;transform-style:preserve-3d}
.sr-face{position:absolute;left:50%;top:50%;translate:-50% -50%;width:var(--w);height:var(--h);backface-visibility:hidden;background:color-mix(in srgb,var(--tc) 45%,#07080d)}
.sr-face.f{transform:translateZ(calc(var(--d)/2));overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:14px 10px;border-radius:3px;background:linear-gradient(160deg,color-mix(in srgb,var(--tc) 72%,#0a0a12),color-mix(in srgb,var(--tc) 38%,#05060b));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--tc) 60%,#fff 10%)}
.sr-face.f::after{content:"";position:absolute;inset:0;background:linear-gradient(118deg,rgba(255,255,255,.22),rgba(255,255,255,0) 40%);pointer-events:none}
.sr-face.k{transform:rotateY(180deg) translateZ(calc(var(--d)/2));background:color-mix(in srgb,var(--tc) 25%,#000)}
.sr-face.l{width:var(--d);transform:rotateY(-90deg) translateZ(calc(var(--w)/2));background:color-mix(in srgb,var(--tc) 40%,#04050a);display:flex;align-items:center;justify-content:center;overflow:hidden}
.sr-face.l b{writing-mode:vertical-rl;transform:rotate(180deg);font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;color:#fff;opacity:.8}
.sr-face.r{width:var(--d);transform:rotateY(90deg) translateZ(calc(var(--w)/2));background:color-mix(in srgb,var(--tc) 32%,#000)}
.sr-face.t{height:var(--d);transform:rotateX(90deg) translateZ(calc(var(--h)/2));background:color-mix(in srgb,var(--tc) 60%,#3a3a44)}
.sr-logo{position:relative;z-index:1;width:56px;height:56px;display:grid;place-items:center;filter:drop-shadow(0 6px 10px rgba(0,0,0,.45))}
.sr-logo img{width:100%;height:100%;object-fit:contain;display:block;user-select:none}
.sr-print{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center}
.sr-print b{font-size:13px;line-height:1.1;font-weight:800;letter-spacing:-.01em;color:#fff}
.sr-print i{font-style:normal;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.72)}
.sr-bc{position:absolute;right:9px;top:9px;display:flex;gap:1px;height:10px;opacity:.6} .sr-bc i{display:block;height:100%;background:#fff}
.sr-shadow{position:absolute;left:-8%;right:-8%;bottom:-2px;height:14px;background:radial-gradient(50% 50% at 50% 50%,rgba(0,0,0,.65),transparent 70%);transform:rotateX(90deg) translateZ(-4px);transform-origin:50% 100%;pointer-events:none}
.is-tin .sr-face.f,.is-tin .sr-face.k{border-radius:46% 46% 6px 6px/16% 16% 6px 6px}
.is-tin .sr-logo{width:46px;height:46px} .is-tin .sr-print i{display:none}
.is-tin .sr-face.t{background:linear-gradient(90deg,#5a6170,#c9ced8 50%,#5a6170)}
.is-book .sr-face.f{border-left:3px solid color-mix(in srgb,var(--tc) 40%,#000)}
/* label beside the lifted tool */
.sr-tag{position:absolute;left:calc(100% - 6px);top:26%;width:150px;padding:10px 12px 10px 20px;display:flex;flex-direction:column;gap:3px;background:var(--acc);color:#fff;clip-path:polygon(12px 0,100% 0,100% 100%,12px 100%,0 50%);opacity:0;transform:translateZ(calc(var(--d)/2 + 4px)) translateX(-10px) scale(.94);transform-origin:0 50%;transition:opacity .22s,transform .45s cubic-bezier(.34,1.56,.64,1);pointer-events:none;box-shadow:0 14px 30px -10px rgba(0,0,0,.6)}
.sr-obj.is-flip .sr-tag{left:auto;right:calc(100% - 6px);padding:10px 20px 10px 12px;clip-path:polygon(0 0,calc(100% - 12px) 0,100% 50%,calc(100% - 12px) 100%,0 100%);transform-origin:100% 50%;transform:translateZ(calc(var(--d)/2 + 4px)) translateX(10px) scale(.94);text-align:right;align-items:flex-end}
.sr-obj:hover .sr-tag,.sr-obj:focus-visible .sr-tag{opacity:1;transform:translateZ(calc(var(--d)/2 + 4px)) translateX(0) scale(1)}
.sr-hole{position:absolute;left:7px;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:50%;background:#020305;box-shadow:0 0 0 1.5px rgba(255,255,255,.35)}
.sr-obj.is-flip .sr-hole{left:auto;right:7px}
.sr-tag b{font-size:13px;line-height:1.1;font-weight:700} .sr-tag i{font-style:normal;font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.8)}
/* only the tools take the pointer */
.sr-stage,.sr-room,.sr-panelwrap,.sr-shelfwrap,.sr-unit,.sr-back,.sr-post,.sr-row,.sr-objs,.sr-plank{pointer-events:none} .sr-obj{pointer-events:auto} .sr-obj *{pointer-events:none}
@media (prefers-reduced-motion:reduce){.sr-led,.sr-cone,.sr-obj,.sr-plank,.sr-hl>span,.sr-p{animation:none!important;transition:none!important;opacity:1!important;translate:0 0!important}}
`

addPropertyControls(ShowroomHero, {
    heading: {
        type: ControlType.String,
        title: "Wall Heading",
        defaultValue: "Designing|Products,|Brands and|Visuals",
        description: "Use | to start a new line",
        displayTextArea: true,
    },
    paragraph: {
        type: ControlType.String,
        title: "Wall Text",
        defaultValue: "",
        placeholder: "Optional line under the heading",
        displayTextArea: true,
    },
    headingFont: { type: ControlType.String, title: "Heading Font", defaultValue: "Inter", description: "Any Google Fonts family name" },
    headingSize: { type: ControlType.Number, title: "Heading Size", min: 48, max: 160, step: 1, unit: "px", defaultValue: 86 },
    headingColor: { type: ControlType.Color, title: "Heading", defaultValue: "#2F9BFF" },
    extrudeColor: { type: ControlType.Color, title: "3D Depth", defaultValue: "#0A3D7A" },
    textColor: { type: ControlType.Color, title: "Wall Text Color", defaultValue: "#E9E6E1" },
    tools: {
        type: ControlType.Array,
        title: "Tools",
        maxCount: 12,
        control: {
            type: ControlType.Object,
            controls: {
                name: { type: ControlType.String, title: "Name", defaultValue: "Photoshop" },
                category: { type: ControlType.String, title: "Category", defaultValue: "Photo editing" },
                icon: { type: ControlType.ResponsiveImage, title: "Logo Upload" },
                iconUrl: { type: ControlType.String, title: "Logo URL", defaultValue: `${DEV}/photoshop/photoshop-original.svg` },
                color: { type: ControlType.Color, title: "Box Color", defaultValue: "#1E6FD9" },
                shape: { type: ControlType.Enum, title: "Shape", options: ["book", "box", "tin"], optionTitles: ["Book", "Box", "Tin"], defaultValue: "book" },
            },
        },
        defaultValue: DEFAULT_TOOLS,
    },
    ledColor: { type: ControlType.Color, title: "Room LEDs", defaultValue: "#FF8A2A" },
    shelfLed: { type: ControlType.Color, title: "Shelf LEDs", defaultValue: "#2A7BFF" },
    shelfColor: { type: ControlType.Color, title: "Shelf", defaultValue: "#141A29" },
    accentColor: { type: ControlType.Color, title: "Hover Label", defaultValue: "#006ECE" },
    tilt: { type: ControlType.Number, title: "Shelf Turn", min: 0, max: 2, step: 0.1, defaultValue: 1 },
    showPlant: { type: ControlType.Boolean, title: "Plant", defaultValue: true },
    showLamps: { type: ControlType.Boolean, title: "Ceiling Lamps", defaultValue: true },
})
