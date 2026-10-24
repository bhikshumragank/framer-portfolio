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
    tools: Tool[]
    shelfColor: string
    accentColor: string
    glowColor: string
    labelColor: string
    tilt: number
    style?: CSSProperties
}

// Official logos from the open-source devicon set (pinned). Framer's mark is inlined in white so it reads on a dark box.
const DEV = "https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons"
const FRAMER_WHITE =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        "<svg viewBox='0 0 128 128' xmlns='http://www.w3.org/2000/svg'><path fill='#ffffff' d='M22.684 0h84.253v42.667H64.81L22.684 0Zm0 42.667H64.81l42.127 42.666H64.81V128L22.684 85.333V42.667Z'/></svg>"
    )

// Adobe-style tile for apps devicon doesn't carry (InDesign)
const adobeTile = (txt: string, fg: string, bg: string) =>
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg viewBox='0 0 128 128' xmlns='http://www.w3.org/2000/svg'><rect x='4' y='4' width='120' height='120' rx='26' fill='${bg}'/><text x='64' y='84' text-anchor='middle' font-family='Arial,Helvetica,sans-serif' font-weight='700' font-size='58' fill='${fg}'>${txt}</text></svg>`
    )

// Everything a box needs, looked up by the tool's name. A tool list saved by an older version of this
// component only stored names, so each box falls back to this table for its logo, tint, category and shape.
const KNOWN: Record<string, Omit<Tool, "name" | "icon">> = {
    photoshop: { category: "Photo editing", iconUrl: `${DEV}/photoshop/photoshop-original.svg`, color: "#31A8FF", shape: "book" },
    illustrator: { category: "Vector & illustration", iconUrl: `${DEV}/illustrator/illustrator-plain.svg`, color: "#FF9A00", shape: "box" },
    "after effects": { category: "Motion graphics", iconUrl: `${DEV}/aftereffects/aftereffects-original.svg`, color: "#9999FF", shape: "book" },
    figma: { category: "UI & prototyping", iconUrl: `${DEV}/figma/figma-original.svg`, color: "#A259FF", shape: "tin" },
    framer: { category: "Web & interaction", iconUrl: FRAMER_WHITE, color: "#0099FF", shape: "book" },
    "premiere pro": { category: "Video editing", iconUrl: `${DEV}/premierepro/premierepro-original.svg`, color: "#9999FF", shape: "box" },
    blender: { category: "3D modelling", iconUrl: `${DEV}/blender/blender-original.svg`, color: "#F5792A", shape: "tin" },
    "adobe xd": { category: "UI design", iconUrl: `${DEV}/xd/xd-original.svg`, color: "#FF61F6", shape: "book" },
    xd: { category: "UI design", iconUrl: `${DEV}/xd/xd-original.svg`, color: "#FF61F6", shape: "book" },
    canva: { category: "Social creatives", iconUrl: `${DEV}/canva/canva-original.svg`, color: "#00C4CC", shape: "box" },
    indesign: { category: "Editorial & print", iconUrl: adobeTile("Id", "#FF3366", "#49021F"), color: "#FF3366", shape: "box" },
    "adobe indesign": { category: "Editorial & print", iconUrl: adobeTile("Id", "#FF3366", "#49021F"), color: "#FF3366", shape: "box" },
}
// the values Framer fills in for an empty field; treated as "not set" so the name lookup wins
const CTRL_DEFAULTS = { category: "Photo editing", iconUrl: `${DEV}/photoshop/photoshop-original.svg`, color: "#31A8FF", shape: "book" }
// lower-case, no spaces, and #RRGGBB written as rgb(r,g,b): Framer may hand a colour back in either form
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
        shape: (setOr(t && t.shape, CTRL_DEFAULTS.shape, k && k.shape, "book") as Tool["shape"]),
    }
}

const DEFAULT_TOOLS: Tool[] = [
    { name: "Photoshop", category: "Photo editing", iconUrl: `${DEV}/photoshop/photoshop-original.svg`, color: "#31A8FF", shape: "book" },
    { name: "Illustrator", category: "Vector & illustration", iconUrl: `${DEV}/illustrator/illustrator-plain.svg`, color: "#FF9A00", shape: "box" },
    { name: "After Effects", category: "Motion graphics", iconUrl: `${DEV}/aftereffects/aftereffects-original.svg`, color: "#9999FF", shape: "book" },
    { name: "Figma", category: "UI & prototyping", iconUrl: `${DEV}/figma/figma-original.svg`, color: "#A259FF", shape: "tin" },
    { name: "Framer", category: "Web & interaction", iconUrl: FRAMER_WHITE, color: "#0099FF", shape: "book" },
    { name: "Premiere Pro", category: "Video editing", iconUrl: `${DEV}/premierepro/premierepro-original.svg`, color: "#9999FF", shape: "box" },
    { name: "Blender", category: "3D modelling", iconUrl: `${DEV}/blender/blender-original.svg`, color: "#F5792A", shape: "tin" },
    { name: "Adobe XD", category: "UI design", iconUrl: `${DEV}/xd/xd-original.svg`, color: "#FF61F6", shape: "book" },
    { name: "Canva", category: "Social creatives", iconUrl: `${DEV}/canva/canva-original.svg`, color: "#00C4CC", shape: "box" },
]

// front face w × h, depth d (px) per shape
const GEO: Record<string, [number, number, number]> = {
    book: [116, 162, 24],
    box: [126, 146, 42],
    tin: [112, 112, 62],
}

const Barcode = () => (
    <span className="tsx-bc" aria-hidden>
        {[3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2].map((w, i) => (
            <i key={i} style={{ width: w }} />
        ))}
    </span>
)

/**
 * Tool Shelf: the tools you work with, standing on a 3D bookcase. The mouse turns the case and moves the
 * spotlight; hovering a tool lifts it off the plank and slides out a label beside it.
 *
 * @framerIntrinsicWidth 620
 * @framerIntrinsicHeight 720
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function ToolShelf(props: Props) {
    const {
        tools = DEFAULT_TOOLS,
        shelfColor = "#01539D",
        accentColor = "#006ECE",
        glowColor = "#2681D0",
        labelColor = "#FFFFFF",
        tilt = 1,
        style,
    } = props

    const isStatic = useIsStaticRenderer()
    const root = useRef<HTMLDivElement>(null)
    const unit = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)
    const [inView, setInView] = useState(false)
    const on = inView || isStatic

    // fit the 620 × 720 case into whatever box Framer gives it
    useEffect(() => {
        const el = root.current
        if (!el) return
        const ro = new ResizeObserver(([e]) => {
            const { width, height } = e.contentRect
            const s = Math.min(width / 640, height > 0 ? height / 740 : 9)
            if (s > 0) setScale(Math.min(1.3, s))
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // drop the tools in once the shelf scrolls into view
    useEffect(() => {
        if (isStatic || !root.current) return
        const io = new IntersectionObserver(
            (es) => {
                if (es[0].isIntersecting) {
                    setInView(true)
                    io.disconnect()
                }
            },
            { threshold: 0.25 }
        )
        io.observe(root.current)
        return () => io.disconnect()
    }, [isStatic])

    // mouse turns the case and moves the spotlight (eased, written straight to the DOM)
    useEffect(() => {
        if (isStatic || !root.current || !unit.current) return
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        const sc = root.current,
            un = unit.current
        let tx = 0,
            ty = 0,
            mx = 0,
            my = 0,
            raf = 0
        const mv = (e: PointerEvent) => {
            const r = sc.getBoundingClientRect()
            tx = Math.max(-0.8, Math.min(0.8, (e.clientX - r.left) / r.width - 0.5))
            ty = Math.max(-0.8, Math.min(0.8, (e.clientY - r.top) / r.height - 0.5))
        }
        const loop = () => {
            mx += (tx - mx) * 0.07
            my += (ty - my) * 0.07
            const k = reduce ? 0 : tilt
            un.style.transform = `rotateX(${(7 - my * 6 * k).toFixed(2)}deg) rotateY(${(-16 + mx * 14 * k).toFixed(2)}deg)`
            // the spotlight stays well inside the component so its glow never meets an edge
            sc.style.setProperty("--sx", `${(50 + mx * 30).toFixed(1)}%`)
            sc.style.setProperty("--sy", `${(42 + my * 24).toFixed(1)}%`)
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

    const obj = (t: Tool, i: number, col: number, rowLen: number) => {
        const [w, h, d] = GEO[t.shape] || GEO.book
        const src = (t.icon && t.icon.src) || t.iconUrl
        const flip = col === rowLen - 1 && rowLen > 1
        return (
            <div
                key={t.name + i}
                className={`tsx-obj is-${t.shape}${flip ? " is-flip" : ""}`}
                tabIndex={0}
                aria-label={`${t.name}, ${t.category}`}
                style={
                    {
                        "--w": `${w}px`,
                        "--h": `${h}px`,
                        "--d": `${d}px`,
                        "--tc": t.color,
                        "--i": i,
                    } as any
                }
            >
                <span className="tsx-box" aria-hidden>
                    <span className="tsx-face f">
                        <span className="tsx-logo">
                            {src && <img src={src} alt="" draggable={false} loading="eager" />}
                        </span>
                        <span className="tsx-print">
                            <b>{t.name}</b>
                            <i>{t.category}</i>
                        </span>
                        <Barcode />
                    </span>
                    <span className="tsx-face l">
                        <b>{t.name}</b>
                    </span>
                    <span className="tsx-face r" />
                    <span className="tsx-face t" />
                    <span className="tsx-face b" />
                    <span className="tsx-face k" />
                    <span className="tsx-shadow" />
                </span>
                <span className="tsx-tag" aria-hidden>
                    <span className="tsx-hole" />
                    <b>{t.name}</b>
                    <i>{t.category}</i>
                </span>
            </div>
        )
    }

    return (
        <div
            ref={root}
            className={`tsx${on ? " is-in" : ""}${isStatic ? " is-still" : ""}`}
            style={
                {
                    ...style,
                    "--shelf": shelfColor,
                    "--acc": accentColor,
                    "--glow": glowColor,
                    "--lbl": labelColor,
                } as any
            }
        >
            <style>{CSS}</style>
            <i className="tsx-spot" aria-hidden />
            <div className="tsx-fit" style={{ transform: `scale(${scale})` }}>
                <div className="tsx-unit" ref={unit}>
                    <div className="tsx-back" aria-hidden />
                    <div className="tsx-post is-l" aria-hidden>
                        <i className="pf" />
                        <i className="pl" />
                    </div>
                    <div className="tsx-post is-r" aria-hidden>
                        <i className="pf" />
                        <i className="pl" />
                    </div>
                    <div className="tsx-row is-cap" style={{ "--p": 0 } as any}>
                        <div className="tsx-plank" aria-hidden>
                            <i className="pt" />
                            <i className="pf" />
                            <i className="pl" />
                        </div>
                    </div>
                    {rows.map((row, ri) => (
                        <div key={ri} className="tsx-row" style={{ "--p": ri + 1 } as any}>
                            <div className="tsx-objs">
                                {row.map((t, ci) => obj(t, ri * 3 + ci, ci, row.length))}
                            </div>
                            <div className="tsx-plank" aria-hidden>
                                <i className="pt" />
                                <i className="pf" />
                                <i className="pl" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const CSS = `
.tsx{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;perspective:1500px;perspective-origin:50% 8%;font-family:Inter,system-ui,-apple-system,sans-serif;isolation:isolate}
.tsx-spot{position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(24% 22% at var(--sx,50%) var(--sy,42%),color-mix(in srgb,var(--glow) 22%,transparent),transparent 100%);opacity:0;transition:opacity 1.2s}
.tsx.is-in .tsx-spot{opacity:1}
.tsx-fit{position:relative;z-index:1;transform-style:preserve-3d;transform-origin:50% 50%}
.tsx-unit{position:relative;width:620px;transform-style:preserve-3d;transform:rotateX(7deg) rotateY(-16deg);display:flex;flex-direction:column;gap:30px;padding:0 0 20px}
/* case: back panel + two uprights, 150px deep like the planks */
.tsx-back{position:absolute;left:-14px;right:-14px;top:-14px;bottom:20px;transform:translateZ(-75px);background:linear-gradient(180deg,color-mix(in srgb,var(--shelf) 22%,#03060b),color-mix(in srgb,var(--shelf) 8%,#010204));box-shadow:inset 0 0 60px rgba(0,0,0,.7)}
.tsx-post{position:absolute;top:-14px;bottom:20px;width:14px;transform-style:preserve-3d} .tsx-post.is-l{left:-14px} .tsx-post.is-r{right:-14px}
.tsx-post i{position:absolute;display:block}
.tsx-post .pf{inset:0;transform:translateZ(75px);background:linear-gradient(90deg,color-mix(in srgb,var(--shelf) 85%,#fff),var(--shelf) 40%,color-mix(in srgb,var(--shelf) 55%,#000))}
.tsx-post .pl{left:0;top:0;bottom:0;width:150px;transform-origin:0 50%;transform:translateZ(75px) rotateY(90deg);background:linear-gradient(90deg,color-mix(in srgb,var(--shelf) 55%,#000),color-mix(in srgb,var(--shelf) 25%,#000))}
.tsx-row{position:relative;transform-style:preserve-3d;height:196px} .tsx-row.is-cap{height:0;margin-bottom:-16px}
.tsx-objs{position:absolute;left:7%;right:7%;bottom:14px;display:flex;align-items:flex-end;justify-content:space-between;transform-style:preserve-3d}
/* plank: top face lies flat, front face hangs below it */
.tsx-plank{position:absolute;left:0;right:0;bottom:0;height:14px;transform-style:preserve-3d;opacity:0;translate:60px 0;transition:opacity .9s ease calc(var(--p)*150ms),translate 1.1s cubic-bezier(.2,.8,.2,1) calc(var(--p)*150ms)}
.tsx.is-in .tsx-plank{opacity:1;translate:0 0}
.tsx-plank i{position:absolute;display:block}
.tsx-plank .pt{left:0;right:0;top:0;height:150px;transform-origin:50% 0;transform:translateZ(75px) rotateX(-90deg);background:linear-gradient(180deg,color-mix(in srgb,var(--shelf) 80%,#fff),color-mix(in srgb,var(--shelf) 60%,#000))}
.tsx-plank .pf{inset:0;transform:translateZ(75px);background:linear-gradient(180deg,color-mix(in srgb,var(--shelf) 92%,#fff),color-mix(in srgb,var(--shelf) 55%,#000));border-top:1px solid color-mix(in srgb,var(--glow) 70%,#fff);box-shadow:0 22px 40px -10px rgba(0,0,0,.75)}
.tsx-plank .pl{left:0;top:0;width:150px;height:14px;transform-origin:0 50%;transform:translateZ(75px) rotateY(90deg);background:color-mix(in srgb,var(--shelf) 35%,#000)}
/* tools: 3D boxes from --w --h --d */
.tsx-obj{position:relative;display:block;width:var(--w);height:var(--h);outline:none;cursor:pointer;transform-style:preserve-3d;opacity:0;translate:0 -46px;transition:transform .6s cubic-bezier(.34,1.56,.64,1),translate 1s cubic-bezier(.34,1.4,.64,1) calc(var(--i)*90ms + 350ms),opacity .5s ease calc(var(--i)*90ms + 350ms)}
.tsx.is-in .tsx-obj{opacity:1;translate:0 0}
.tsx.is-still .tsx-obj,.tsx.is-still .tsx-plank{transition:none}
.tsx-obj:hover,.tsx-obj:focus-visible{transform:translate3d(0,-18px,70px) rotateY(-10deg)}
.tsx-box{position:absolute;inset:0;transform-style:preserve-3d}
.tsx-face{--col:color-mix(in srgb,var(--tc) 20%,#0b0e14);position:absolute;left:50%;top:50%;translate:-50% -50%;width:var(--w);height:var(--h);background:var(--col);backface-visibility:hidden}
.tsx-face.f{transform:translateZ(calc(var(--d)/2));overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:12px 10px;border-radius:2px 6px 6px 2px;background:radial-gradient(120% 80% at 30% 10%,color-mix(in srgb,var(--tc) 38%,#0b0e14),var(--col) 65%);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--tc) 35%,transparent)}
.tsx-face.f::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.16),rgba(255,255,255,0) 38%);pointer-events:none}
.tsx-face.k{transform:rotateY(180deg) translateZ(calc(var(--d)/2));background:color-mix(in srgb,var(--col) 70%,#000)}
.tsx-face.l{width:var(--d);transform:rotateY(-90deg) translateZ(calc(var(--w)/2));background:color-mix(in srgb,var(--tc) 30%,#05070a);display:flex;align-items:center;justify-content:center;overflow:hidden}
.tsx-face.l b{writing-mode:vertical-rl;transform:rotate(180deg);font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;color:var(--lbl);opacity:.85;max-height:90%;overflow:hidden}
.tsx-face.r{width:var(--d);transform:rotateY(90deg) translateZ(calc(var(--w)/2));background:color-mix(in srgb,var(--col) 70%,#000)}
.tsx-face.t{height:var(--d);transform:rotateX(90deg) translateZ(calc(var(--h)/2));background:color-mix(in srgb,var(--tc) 28%,#1a1f28)}
.tsx-face.b{height:var(--d);transform:rotateX(-90deg) translateZ(calc(var(--h)/2));background:#000}
.tsx-logo{position:relative;z-index:1;width:54px;height:54px;display:grid;place-items:center;filter:drop-shadow(0 6px 10px rgba(0,0,0,.45))}
.tsx-logo img{width:100%;height:100%;object-fit:contain;display:block;user-select:none}
.tsx-print{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center}
.tsx-print b{font-size:12.5px;line-height:1.1;font-weight:700;letter-spacing:-.01em;color:var(--lbl)}
.tsx-print i{font-style:normal;font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:color-mix(in srgb,var(--lbl) 62%,transparent)}
.tsx-bc{position:absolute;right:8px;top:8px;display:flex;gap:1px;height:9px;opacity:.45} .tsx-bc i{display:block;height:100%;background:var(--lbl)}
.tsx-shadow{position:absolute;left:-6%;right:-6%;bottom:-2px;height:14px;background:radial-gradient(50% 50% at 50% 50%,rgba(0,0,0,.6),transparent 70%);transform:rotateX(90deg) translateZ(-4px);transform-origin:50% 100%;pointer-events:none}
/* shape flavours */
.is-book .tsx-face.f{border-left:3px solid color-mix(in srgb,var(--tc) 45%,#000)}
.is-box .tsx-face.f::before{content:"";position:absolute;left:0;right:0;top:30%;height:1px;background:rgba(0,0,0,.4)}
.is-tin .tsx-face.f,.is-tin .tsx-face.k{border-radius:50% 50% 8px 8px/18% 18% 8px 8px}
.is-tin .tsx-face.f{gap:8px;border:3px solid color-mix(in srgb,var(--tc) 30%,#3a4150)} .is-tin .tsx-logo{width:44px;height:44px} .is-tin .tsx-print i{display:none}
.is-tin .tsx-face.t{background:linear-gradient(90deg,#5a6170,#c9ced8 50%,#5a6170)}
/* label slides out beside the tool, never above it, so it never covers the shelf or text overhead */
.tsx-tag{position:absolute;left:calc(100% - 6px);top:26%;z-index:6;width:150px;padding:10px 12px 10px 20px;display:flex;flex-direction:column;gap:3px;background:var(--acc);color:#fff;clip-path:polygon(12px 0,100% 0,100% 100%,12px 100%,0 50%);opacity:0;transform:translateZ(calc(var(--d)/2 + 4px)) translateX(-10px) scale(.94);transform-origin:0 50%;transition:opacity .22s,transform .45s cubic-bezier(.34,1.56,.64,1);pointer-events:none;box-shadow:0 14px 30px -10px rgba(0,0,0,.6)}
.tsx-obj.is-flip .tsx-tag{left:auto;right:calc(100% - 6px);padding:10px 20px 10px 12px;clip-path:polygon(0 0,calc(100% - 12px) 0,100% 50%,calc(100% - 12px) 100%,0 100%);transform-origin:100% 50%;transform:translateZ(calc(var(--d)/2 + 4px)) translateX(10px) scale(.94);text-align:right;align-items:flex-end}
.tsx-obj:hover .tsx-tag,.tsx-obj:focus-visible .tsx-tag{opacity:1;transform:translateZ(calc(var(--d)/2 + 4px)) translateX(0) scale(1)}
.tsx-hole{position:absolute;left:7px;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:50%;background:#020305;box-shadow:0 0 0 1.5px rgba(255,255,255,.35)}
.tsx-obj.is-flip .tsx-hole{left:auto;right:7px}
.tsx-tag b{font-size:13px;line-height:1.1;font-weight:700;letter-spacing:-.01em}
.tsx-tag i{font-style:normal;font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.78)}
.tsx-obj:focus-visible .tsx-face.f{box-shadow:inset 0 0 0 2px var(--glow)}
/* only the tools take the pointer; the case, planks and wrappers never block a hover */
.tsx-fit,.tsx-unit,.tsx-back,.tsx-post,.tsx-row,.tsx-objs,.tsx-plank{pointer-events:none} .tsx-obj{pointer-events:auto} .tsx-obj *{pointer-events:none}
@media (prefers-reduced-motion:reduce){.tsx-obj,.tsx-plank{transition:none!important;translate:0 0!important;opacity:1!important}}
`

addPropertyControls(ToolShelf, {
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
                iconUrl: {
                    type: ControlType.String,
                    title: "Logo URL",
                    defaultValue: `${DEV}/photoshop/photoshop-original.svg`,
                    description: "Used when no logo is uploaded",
                },
                color: { type: ControlType.Color, title: "Brand Tint", defaultValue: "#31A8FF" },
                shape: {
                    type: ControlType.Enum,
                    title: "Shape",
                    options: ["book", "box", "tin"],
                    optionTitles: ["Book", "Box", "Tin"],
                    defaultValue: "book",
                },
            },
        },
        defaultValue: DEFAULT_TOOLS,
    },
    shelfColor: { type: ControlType.Color, title: "Shelf", defaultValue: "#01539D" },
    accentColor: { type: ControlType.Color, title: "Label", defaultValue: "#006ECE" },
    glowColor: { type: ControlType.Color, title: "Glow", defaultValue: "#2681D0" },
    labelColor: { type: ControlType.Color, title: "Text", defaultValue: "#FFFFFF" },
    tilt: { type: ControlType.Number, title: "Turn", min: 0, max: 2, step: 0.1, defaultValue: 1 },
})
