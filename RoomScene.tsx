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
    background: string
    heading: string
    headingFont: string
    headingSize: number
    headingColor: string
    extrudeColor: string
    tools: Tool[]
    shelfLed: string
    shelfColor: string
    accentColor: string
    pullToStart: boolean
    ctaText: string
    ropeX: number
    sound: boolean
    lockScroll: boolean
    style?: CSSProperties
}

// ---- tools: a saved list that only holds names still gets the right logo, tint and shape ----
// tool logos (Devicon, MIT licence), stored in Framer so the page loads nothing from outside
const LOGO = "https://framerusercontent.com/images"
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
    photoshop: { category: "Photo editing", iconUrl: `${LOGO}/yMnuqn2Jbl8oikmX4FYFv7BZI.svg`, color: "#1E6FD9", shape: "book" },
    illustrator: { category: "Vector & illustration", iconUrl: `${LOGO}/R8wPI5KzKVxthCO35Twkbe4rFnc.svg`, color: "#C98A12", shape: "box" },
    "after effects": { category: "Motion graphics", iconUrl: `${LOGO}/cAYFF8oleNuWMBPMjqc4PfnYXg.svg`, color: "#7B4DFF", shape: "box" },
    figma: { category: "UI & prototyping", iconUrl: `${LOGO}/ndJdbHWUXq09pSz8dDyf9tbZjg.svg`, color: "#8B3DFF", shape: "tin" },
    framer: { category: "Web & interaction", iconUrl: FRAMER_WHITE, color: "#1F5FA8", shape: "book" },
    "premiere pro": { category: "Video editing", iconUrl: `${LOGO}/EUijfeXlQxRaezmXwyFLZT8saYM.svg`, color: "#8A3DFF", shape: "box" },
    blender: { category: "3D modelling", iconUrl: `${LOGO}/XkIAV6qQg0wVG3BYenOzBGOFMI.svg`, color: "#D2691E", shape: "box" },
    "adobe xd": { category: "UI design", iconUrl: `${LOGO}/eaFfwxnwKbL90wBbIDRS36sfbw.svg`, color: "#D433C8", shape: "box" },
    xd: { category: "UI design", iconUrl: `${LOGO}/eaFfwxnwKbL90wBbIDRS36sfbw.svg`, color: "#D433C8", shape: "box" },
    canva: { category: "Social creatives", iconUrl: `${LOGO}/c6tKhD0njTPOmDEjrzYSodTkYlg.svg`, color: "#00A8B5", shape: "box" },
    indesign: { category: "Editorial & print", iconUrl: adobeTile("Id", "#FF3366", "#49021F"), color: "#E0284F", shape: "box" },
    "adobe indesign": { category: "Editorial & print", iconUrl: adobeTile("Id", "#FF3366", "#49021F"), color: "#E0284F", shape: "box" },
}
const CTRL_DEFAULTS = { category: "Photo editing", iconUrl: `${LOGO}/yMnuqn2Jbl8oikmX4FYFv7BZI.svg`, color: "#1E6FD9", shape: "book" }
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
        // a logo saved from the old outside CDN falls back to the copy stored in Framer
        iconUrl: setOr(t && t.iconUrl && !/cdn\.jsdelivr\.net\/gh\/devicons/.test(t.iconUrl) ? t.iconUrl : "", CTRL_DEFAULTS.iconUrl, k && k.iconUrl),
        color: setOr(t && t.color, CTRL_DEFAULTS.color, k && k.color, "#2681D0"),
        shape: setOr(t && t.shape, CTRL_DEFAULTS.shape, k && k.shape, "box") as Tool["shape"],
    }
}
const DEFAULT_TOOLS: Tool[] = ["Photoshop", "Illustrator", "After Effects", "Figma", "Framer", "Premiere Pro", "Blender", "Adobe XD", "InDesign"].map(
    (name) => ({ name, ...KNOWN[name.toLowerCase()] })
)
const GEO: Record<string, [number, number, number]> = {
    book: [104, 140, 28],
    box: [112, 140, 40],
    tin: [100, 104, 56],
}
const Barcode = () => (
    <span className="rs-bc" aria-hidden>
        {[3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2].map((w, i) => (
            <i key={i} style={{ width: w }} />
        ))}
    </span>
)

// The background photo is 1448 × 1086. Its camera, worked out from the LED lines: the two walls meet the
// picture at 45°, eye level sits at y 530 and the focal length is about 1803 px. The CSS camera below uses
// the same numbers, so anything placed on a wall plane lands in the photo's own perspective.
const IMG_W = 1448
const IMG_H = 1086
const BG_DEFAULT = "https://framerusercontent.com/images/EQ0QKErEj9gsjFUoTgymnoPgc0.png"

/**
 * Room Scene: the photographed corner room with a lit tool shelf mounted on the right wall and the heading
 * on the left wall, both drawn in the photo's perspective. The heading rises, the planks slide in, the tools
 * drop onto them, and hovering a tool lifts it and slides out its label.
 *
 * @framerIntrinsicWidth 1448
 * @framerIntrinsicHeight 1086
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function RoomScene(props: Props) {
    const {
        background = BG_DEFAULT,
        heading = "Designing|Products,|Brands and|Visuals",
        headingFont = "Inter",
        headingSize = 96,
        headingColor = "#2F9BFF",
        extrudeColor = "#0A3D7A",
        tools = DEFAULT_TOOLS,
        shelfLed = "#2A7BFF",
        shelfColor = "#141A29",
        accentColor = "#006ECE",
        pullToStart = true,
        ctaText = "Pull to turn on the lights",
        ropeX = 57,
        sound = true,
        lockScroll = true,
        style,
    } = props

    const isStatic = useIsStaticRenderer()
    const root = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)
    const [size, setSize] = useState({ w: 0, h: 0 })
    const [inView, setInView] = useState(false)
    // the room starts dark until the cord is pulled (always lit on the Framer canvas)
    const dark0 = pullToStart && !isStatic
    const [lit, setLit] = useState(!dark0)
    const [ropeOn, setRopeOn] = useState(dark0)
    const [ready, setReady] = useState(!dark0)
    const on = (inView && ready) || isStatic
    const ropeEl = useRef<SVGPathElement>(null)
    const ropeHi = useRef<SVGPathElement>(null)
    const knobEl = useRef<HTMLButtonElement>(null)
    const ctaEl = useRef<HTMLDivElement>(null)
    const phys = useRef({ y: 0, v: 0, sway: 0, sv: 0, drag: false, px: 0, py: 0, retract: false, moved: false })

    useEffect(() => {
        const fam = String(headingFont || "").trim()
        if (!fam || typeof document === "undefined") return
        const id = "rs-font-" + fam.replace(/\W+/g, "-")
        if (document.getElementById(id)) return
        const l = document.createElement("link")
        l.id = id
        l.rel = "stylesheet"
        l.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fam)}:wght@700;800;900&display=swap`
        document.head.appendChild(l)
    }, [headingFont])

    // same maths as a background set to Fill: cover the box, centred
    useEffect(() => {
        const el = root.current
        if (!el) return
        const ro = new ResizeObserver(([e]) => {
            const { width: w, height: h } = e.contentRect
            if (!w) return
            setScale(h ? Math.max(w / IMG_W, h / IMG_H) : w / IMG_W)
            setSize({ w, h })
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

    // lights on: give the flicker a moment before the heading and the shelf start
    useEffect(() => {
        if (!lit || ready) return
        const t = window.setTimeout(() => setReady(true), 700)
        return () => window.clearTimeout(t)
    }, [lit, ready])

    // no scrolling past a dark room
    useEffect(() => {
        if (isStatic || lit || !lockScroll || typeof document === "undefined") return
        const h = document.documentElement,
            b = document.body
        const ho = h.style.overflow,
            bo = b.style.overflow
        h.style.overflow = "hidden"
        b.style.overflow = "hidden"
        return () => {
            h.style.overflow = ho
            b.style.overflow = bo
        }
    }, [isStatic, lit, lockScroll])

    const click = () => {
        if (!sound) return
        try {
            const AC = (window as any).AudioContext || (window as any).webkitAudioContext
            const ac = new AC()
            const t = ac.currentTime
            // the switch: a short falling square-wave tick
            const o = ac.createOscillator(),
                g = ac.createGain()
            o.type = "square"
            o.frequency.setValueAtTime(1700, t)
            o.frequency.exponentialRampToValueAtTime(260, t + 0.04)
            g.gain.setValueAtTime(0.18, t)
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
            o.connect(g).connect(ac.destination)
            o.start(t)
            o.stop(t + 0.07)
            // the neon: a low hum that fades with the flicker
            const o2 = ac.createOscillator(),
                g2 = ac.createGain()
            o2.type = "sawtooth"
            o2.frequency.value = 100
            g2.gain.setValueAtTime(0.0001, t + 0.05)
            g2.gain.linearRampToValueAtTime(0.035, t + 0.12)
            g2.gain.exponentialRampToValueAtTime(0.0001, t + 1.1)
            o2.connect(g2).connect(ac.destination)
            o2.start(t + 0.05)
            o2.stop(t + 1.2)
            window.setTimeout(() => ac.close(), 1600)
        } catch (e) {}
    }

    const litRef = useRef(lit)
    litRef.current = lit
    const switchOn = () => {
        if (litRef.current) return
        litRef.current = true
        setLit(true)
        click()
        window.setTimeout(() => (phys.current.retract = true), 650)
    }

    // nobody stays stuck: the lights come on by themselves after 8 s in view
    useEffect(() => {
        if (!dark0 || lit || !inView) return
        const t = window.setTimeout(switchOn, 8000)
        return () => window.clearTimeout(t)
    }, [dark0, lit, inView])

    // the cord: dragged by the pointer, sprung back when released, swaying a little at rest
    useEffect(() => {
        if (!ropeOn || !size.h) return
        const P = phys.current
        let raf = 0,
            last = performance.now()
        const rest = () => Math.max(120, size.h * 0.36)
        const loop = (now: number) => {
            const dt = Math.min(0.033, (now - last) / 1000)
            last = now
            if (!P.drag) {
                const target = P.retract ? -rest() - 160 : 0
                const k = P.retract ? 30 : 150
                P.v += (-k * (P.y - target) - 14 * P.v) * dt
                P.y += P.v * dt
                const idle = P.retract ? 0 : Math.sin(now / 900) * 6
                P.sv += (-50 * (P.sway - idle) - 5 * P.sv) * dt
                P.sway += P.sv * dt
                if (P.retract && P.y < -rest() - 120) {
                    setRopeOn(false)
                    return
                }
            }
            const x0 = (size.w * ropeX) / 100
            const L = rest() + P.y
            const bx = x0 + P.sway
            const d = `M ${x0} -10 Q ${x0 + P.sway * 0.35} ${L * 0.55} ${bx} ${L}`
            ropeEl.current?.setAttribute("d", d)
            ropeHi.current?.setAttribute("d", d)
            const ang = Math.atan2(P.sway, Math.max(40, L)) * (-180 / Math.PI)
            if (knobEl.current) knobEl.current.style.transform = `translate(${bx}px, ${L}px) translate(-50%, -6px) rotate(${ang}deg)`
            if (ctaEl.current) {
                const cw = ctaEl.current.offsetWidth
                const cx = bx + 34 + cw > size.w - 8 ? Math.max(8, bx - 34 - cw) : bx + 34
                ctaEl.current.style.transform = `translate(${cx}px, ${L + 14}px)`
                ctaEl.current.style.opacity = P.drag || litRef.current ? "0" : "1"
            }
            raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)

        const move = (e: PointerEvent) => {
            if (!P.drag) return
            const dy = e.clientY - P.py,
                dx = e.clientX - P.px
            if (Math.abs(dy - P.y) > 4 || Math.abs(dx) > 4) P.moved = true
            // stretches freely to 100 px, then resists
            P.y = dy < 100 ? Math.max(-12, dy) : 100 + (dy - 100) * 0.3
            P.sway = Math.max(-60, Math.min(60, dx * 0.4))
        }
        const up = () => {
            if (!P.drag) return
            P.drag = false
            if (!P.moved) {
                // a click is a quick tug
                P.v = 520
                window.setTimeout(switchOn, 140)
            } else if (P.y > 70) switchOn()
            P.v = Math.max(P.v, 0)
        }
        window.addEventListener("pointermove", move)
        window.addEventListener("pointerup", up)
        window.addEventListener("pointercancel", up)
        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener("pointermove", move)
            window.removeEventListener("pointerup", up)
            window.removeEventListener("pointercancel", up)
        }
    }, [ropeOn, size.w, size.h, ropeX])

    const grab = (e: React.PointerEvent) => {
        e.preventDefault()
        const P = phys.current
        P.drag = true
        P.moved = false
        P.px = e.clientX
        P.py = e.clientY - P.y
        P.v = 0
    }

    const list = (tools && tools.length ? tools : DEFAULT_TOOLS).slice(0, 12).map(resolve)
    const rows: Tool[][] = []
    for (let i = 0; i < list.length; i += 3) rows.push(list.slice(i, i + 3))
    const lines = String(heading || "").split("|").map((s) => s.trim()).filter(Boolean)
    const ext = Array.from({ length: 10 }, (_, i) => `${-(i + 1) * 0.5}px ${i + 1}px 0 ${extrudeColor}`).join(",")

    const obj = (t: Tool, i: number, col: number, rowLen: number) => {
        const [w, h, d] = GEO[t.shape] || GEO.box
        const src = (t.icon && t.icon.src) || t.iconUrl
        const flip = col === rowLen - 1 && rowLen > 1
        return (
            <div
                key={t.name + i}
                className={`rs-obj is-${t.shape}${flip ? " is-flip" : ""}`}
                tabIndex={0}
                aria-label={`${t.name}, ${t.category}`}
                style={{ "--w": `${w}px`, "--h": `${h}px`, "--d": `${d}px`, "--tc": t.color, "--i": i } as any}
            >
                <span className="rs-box" aria-hidden data-nosnippet>
                    <span className="rs-face f">
                        <span className="rs-logo">{src && <img src={src} alt="" draggable={false} loading="eager" />}</span>
                        <span className="rs-print">
                            <b>{t.name}</b>
                            <i>{t.category}</i>
                        </span>
                        <Barcode />
                    </span>
                    <span className="rs-face l">
                        <b>{t.name}</b>
                    </span>
                    <span className="rs-face r" />
                    <span className="rs-face t" />
                    <span className="rs-face k" />
                    <span className="rs-shadow" />
                </span>
                <span className="rs-tag" aria-hidden data-nosnippet>
                    <span className="rs-hole" />
                    <b>{t.name}</b>
                    <i>{t.category}</i>
                </span>
            </div>
        )
    }

    return (
        <div
            ref={root}
            className={`rs${on ? " is-in" : ""}${isStatic ? " is-still" : ""}${lit ? " is-lit" : " is-dark"}`}
            style={{ ...style, "--sled": shelfLed, "--shelf": shelfColor, "--acc": accentColor, "--hc": headingColor } as any}
        >
            <style>{CSS}</style>
            <div className="rs-stage" style={{ transform: `translate(-50%,-50%) scale(${scale})` }}>
                {background && <img className="rs-bg" src={background} alt="" draggable={false} />}

                {/* left wall plane: the heading on the lit board */}
                <div className="rs-wall is-l">
                    <h1
                        className="rs-h"
                        style={{
                            fontFamily: `'${headingFont}', Inter, 'Arial Black', sans-serif`,
                            fontSize: headingSize,
                            textShadow: `${ext},0 0 36px color-mix(in srgb, ${headingColor} 50%, transparent)`,
                        }}
                    >
                        {lines.map((ln, i) => (
                            <span key={i} className="rs-hl">
                                <span style={{ transitionDelay: `${300 + i * 130}ms` }}>{ln}</span>
                            </span>
                        ))}
                    </h1>
                </div>

                {/* right wall plane: the shelf, its back against the wall */}
                <div className="rs-wall is-r">
                    <span className="rs-wallshadow" aria-hidden />
                    <div className="rs-mount">
                        <div className="rs-unit">
                            <div className="rs-back" aria-hidden>
                                {rows.map((_, ri) => (
                                    <span key={ri} className="rs-downs" style={{ top: `${ri * 198 + 6}px` }}>
                                        <i />
                                        <i />
                                        <i />
                                    </span>
                                ))}
                            </div>
                            <div className="rs-post is-l" aria-hidden>
                                <i className="pf" />
                                <i className="pl" />
                                <i className="led" />
                            </div>
                            <div className="rs-post is-r" aria-hidden>
                                <i className="pf" />
                                <i className="pl" />
                            </div>
                            <div className="rs-row is-cap" style={{ "--p": 0 } as any}>
                                <div className="rs-plank" aria-hidden>
                                    <i className="pt" />
                                    <i className="pf" />
                                    <i className="pl" />
                                </div>
                            </div>
                            {rows.map((row, ri) => (
                                <div key={ri} className="rs-row" style={{ "--p": ri + 1 } as any}>
                                    <div className="rs-objs">{row.map((t, ci) => obj(t, ri * 3 + ci, ci, row.length))}</div>
                                    <div className="rs-plank" aria-hidden>
                                        <i className="pt" />
                                        <i className="pf" />
                                        <i className="pl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* the shelf LEDs reflected on the polished floor */}
                <span className="rs-floorglow" aria-hidden />
            </div>

            {/* lights off: the room waits in the dark until the cord is pulled */}
            {dark0 && <div className="rs-dark" style={{ "--rx": `${ropeX}%` } as any} aria-hidden />}
            {ropeOn && (
                <div className="rs-cord">
                    <svg className="rs-rope" width="100%" height="100%" aria-hidden>
                        <path ref={ropeEl} className="a" d="M0 0" />
                        <path ref={ropeHi} className="b" d="M0 0" />
                    </svg>
                    <button
                        ref={knobEl}
                        type="button"
                        className="rs-knob"
                        aria-label={ctaText}
                        onPointerDown={grab}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                phys.current.v = 520
                                window.setTimeout(switchOn, 140)
                            }
                        }}
                    >
                        <span className="rs-ring" />
                    </button>
                    <div ref={ctaEl} className="rs-cta" aria-hidden>
                        <i>↓</i>
                        {ctaText}
                    </div>
                    <button type="button" className="rs-skip" onClick={switchOn}>
                        Skip, turn the lights on
                    </button>
                </div>
            )}
        </div>
    )
}

const CSS = `
.rs{position:relative;width:100%;height:100%;overflow:hidden;background:#141418;isolation:isolate;font-family:Inter,system-ui,-apple-system,sans-serif}
.rs-stage{position:absolute;left:50%;top:50%;width:${IMG_W}px;height:${IMG_H}px;transform-origin:50% 50%;perspective:1803px;perspective-origin:724px 530px}
.rs-bg{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;user-select:none}
/* wall planes: 760 × 655 at the corner line (x 720, y 135 to 790), each turned 45° out of the picture */
.rs-wall{position:absolute;top:135px;width:760px;height:655px;transform-style:preserve-3d;pointer-events:none}
.rs-wall.is-r{left:720px;transform-origin:0 50%;transform:rotateY(-45deg)}
.rs-wall.is-l{left:-40px;transform-origin:100% 50%;transform:rotateY(45deg)}
/* heading on the lit board (board spans x 120 to 760, y 30 to 650 of the left plane) */
.rs-h{position:absolute;left:170px;top:50%;translate:0 -50%;margin:0;width:max-content;color:var(--hc);font-weight:900;line-height:.92;letter-spacing:-.045em;display:flex;flex-direction:column}
.rs-hl{display:block;overflow:hidden;white-space:nowrap;padding:0 .1em .18em .1em;margin:0 -.1em -.18em}
.rs-hl>span{display:inline-block;translate:0 110%;transition:translate 1.1s cubic-bezier(.2,.75,.2,1)}
.rs.is-in .rs-hl>span{translate:0 0} .rs.is-still .rs-hl>span{translate:0 0;transition:none}
/* shelf: 560 wide, standing on the floor, its back flat on the right wall */
.rs-wallshadow{position:absolute;left:80px;top:96px;width:600px;height:570px;background:rgba(0,0,0,.55);filter:blur(28px);border-radius:12px}
.rs-mount{position:absolute;left:100px;top:96px;width:560px;height:559px;transform-style:preserve-3d;transform:translateZ(64px)}
.rs-unit{position:absolute;left:0;bottom:0;width:560px;transform-style:preserve-3d;transform-origin:50% 100%;transform:scale(.86);display:flex;flex-direction:column;gap:42px;padding:0 0 16px}
.rs-back{position:absolute;left:-16px;right:-16px;top:-16px;bottom:16px;transform:translateZ(-64px);background:linear-gradient(180deg,#1b2233,#0f141f);box-shadow:inset 0 0 70px rgba(0,0,0,.75)}
.rs-downs{position:absolute;left:0;right:0;height:180px;display:flex;justify-content:space-around;padding:0 40px}
.rs-downs i{width:150px;height:180px;background:radial-gradient(46% 70% at 50% 0%,rgba(255,226,190,.3),rgba(255,226,190,0) 70%);opacity:0;transition:opacity .8s ease .4s}
.rs-downs i::before{content:"";display:block;margin:0 auto;width:26px;height:5px;border-radius:3px;background:#fff6e6;box-shadow:0 0 12px 4px rgba(255,230,190,.8)}
.rs.is-in .rs-downs i{opacity:1} .rs.is-still .rs-downs i{opacity:1;transition:none}
.rs-post{position:absolute;top:-16px;bottom:16px;width:16px;transform-style:preserve-3d} .rs-post.is-l{left:-16px} .rs-post.is-r{right:-16px}
.rs-post i{position:absolute;display:block}
.rs-post .pf{inset:0;transform:translateZ(64px);background:linear-gradient(90deg,color-mix(in srgb,var(--shelf) 70%,#3a4660),var(--shelf))}
.rs-post .pl{left:0;top:0;bottom:0;width:128px;transform-origin:0 50%;transform:translateZ(64px) rotateY(90deg);background:linear-gradient(90deg,color-mix(in srgb,var(--shelf) 80%,#000),#06080d)}
.rs-post.is-l .led{right:-3px;top:8px;bottom:8px;width:3px;transform:translateZ(60px);background:color-mix(in srgb,var(--sled) 70%,#fff);box-shadow:0 0 10px 3px var(--sled),0 0 34px 8px color-mix(in srgb,var(--sled) 60%,transparent);opacity:0;transition:opacity .6s ease .4s}
.rs.is-in .rs-post .led{opacity:1} .rs.is-still .rs-post .led{opacity:1;transition:none}
.rs-row{position:relative;transform-style:preserve-3d;height:160px} .rs-row.is-cap{height:0;margin-bottom:-28px}
.rs-objs{position:absolute;left:6%;right:6%;bottom:14px;display:flex;align-items:flex-end;justify-content:space-between;transform-style:preserve-3d}
.rs-plank{position:absolute;left:0;right:0;bottom:0;height:14px;transform-style:preserve-3d;opacity:0;translate:50px 0;transition:opacity .9s ease calc(var(--p)*140ms + 200ms),translate 1.1s cubic-bezier(.2,.8,.2,1) calc(var(--p)*140ms + 200ms)}
.rs.is-in .rs-plank{opacity:1;translate:0 0}
.rs-plank i{position:absolute;display:block}
.rs-plank .pt{left:0;right:0;top:0;height:128px;transform-origin:50% 0;transform:translateZ(64px) rotateX(-90deg);background:linear-gradient(180deg,color-mix(in srgb,var(--shelf) 70%,#3a4660),var(--shelf))}
.rs-plank .pf{inset:0;transform:translateZ(64px);background:linear-gradient(180deg,color-mix(in srgb,var(--shelf) 80%,#4a5670),color-mix(in srgb,var(--shelf) 70%,#000));border-top:2px solid color-mix(in srgb,var(--sled) 55%,#fff);box-shadow:0 -2px 14px 1px var(--sled),0 22px 40px -10px rgba(0,0,0,.8)}
.rs-plank .pl{left:0;top:0;width:128px;height:14px;transform-origin:0 50%;transform:translateZ(64px) rotateY(90deg);background:#06080d}
/* tools */
.rs-obj{position:relative;display:block;width:var(--w);height:var(--h);outline:none;cursor:pointer;pointer-events:auto;transform-style:preserve-3d;opacity:0;translate:0 -46px;transition:transform .6s cubic-bezier(.34,1.56,.64,1),translate 1s cubic-bezier(.34,1.4,.64,1) calc(var(--i)*90ms + 600ms),opacity .5s ease calc(var(--i)*90ms + 600ms)}
.rs.is-in .rs-obj{opacity:1;translate:0 0}
.rs.is-still .rs-obj,.rs.is-still .rs-plank{transition:none}
.rs-obj:hover,.rs-obj:focus-visible{transform:translate3d(0,-14px,50px)}
.rs-obj *{pointer-events:none}
.rs-box{position:absolute;inset:0;transform-style:preserve-3d}
.rs-face{position:absolute;left:50%;top:50%;translate:-50% -50%;width:var(--w);height:var(--h);backface-visibility:hidden;background:color-mix(in srgb,var(--tc) 45%,#07080d)}
.rs-face.f{transform:translateZ(calc(var(--d)/2));overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:11px;padding:12px 9px;border-radius:3px;background:linear-gradient(160deg,color-mix(in srgb,var(--tc) 72%,#0a0a12),color-mix(in srgb,var(--tc) 38%,#05060b));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--tc) 60%,#fff 10%)}
.rs-face.f::after{content:"";position:absolute;inset:0;background:linear-gradient(118deg,rgba(255,255,255,.22),rgba(255,255,255,0) 40%)}
.rs-face.k{transform:rotateY(180deg) translateZ(calc(var(--d)/2));background:color-mix(in srgb,var(--tc) 25%,#000)}
.rs-face.l{width:var(--d);transform:rotateY(-90deg) translateZ(calc(var(--w)/2));background:color-mix(in srgb,var(--tc) 40%,#04050a);display:flex;align-items:center;justify-content:center;overflow:hidden}
.rs-face.l b{writing-mode:vertical-rl;transform:rotate(180deg);font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;color:#fff;opacity:.8}
.rs-face.r{width:var(--d);transform:rotateY(90deg) translateZ(calc(var(--w)/2));background:color-mix(in srgb,var(--tc) 32%,#000)}
.rs-face.t{height:var(--d);transform:rotateX(90deg) translateZ(calc(var(--h)/2));background:color-mix(in srgb,var(--tc) 60%,#3a3a44)}
.rs-logo{position:relative;z-index:1;width:50px;height:50px;display:grid;place-items:center;filter:drop-shadow(0 6px 10px rgba(0,0,0,.45))}
.rs-logo img{width:100%;height:100%;object-fit:contain;display:block;user-select:none}
.rs-print{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center}
.rs-print b{font-size:12px;line-height:1.1;font-weight:800;letter-spacing:-.01em;color:#fff}
.rs-print i{font-style:normal;font-size:7.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.72)}
.rs-bc{position:absolute;right:8px;top:8px;display:flex;gap:1px;height:9px;opacity:.6} .rs-bc i{display:block;height:100%;background:#fff}
.rs-shadow{position:absolute;left:-8%;right:-8%;bottom:-2px;height:14px;background:radial-gradient(50% 50% at 50% 50%,rgba(0,0,0,.65),transparent 70%);transform:rotateX(90deg) translateZ(-4px);transform-origin:50% 100%}
.is-tin .rs-face.f,.is-tin .rs-face.k{border-radius:46% 46% 6px 6px/16% 16% 6px 6px}
.is-tin .rs-logo{width:42px;height:42px} .is-tin .rs-print i{display:none}
.is-tin .rs-face.t{background:linear-gradient(90deg,#5a6170,#c9ced8 50%,#5a6170)}
.is-book .rs-face.f{border-left:3px solid color-mix(in srgb,var(--tc) 40%,#000)}
/* label beside the lifted tool */
.rs-tag{position:absolute;left:calc(100% - 6px);top:26%;width:144px;padding:9px 12px 9px 20px;display:flex;flex-direction:column;gap:3px;background:var(--acc);color:#fff;clip-path:polygon(12px 0,100% 0,100% 100%,12px 100%,0 50%);opacity:0;transform:translateZ(calc(var(--d)/2 + 4px)) translateX(-10px) scale(.94);transform-origin:0 50%;transition:opacity .22s,transform .45s cubic-bezier(.34,1.56,.64,1);box-shadow:0 14px 30px -10px rgba(0,0,0,.6)}
.rs-obj.is-flip .rs-tag{left:auto;right:calc(100% - 6px);padding:9px 20px 9px 12px;clip-path:polygon(0 0,calc(100% - 12px) 0,100% 50%,calc(100% - 12px) 100%,0 100%);transform-origin:100% 50%;transform:translateZ(calc(var(--d)/2 + 4px)) translateX(10px) scale(.94);text-align:right;align-items:flex-end}
.rs-obj:hover .rs-tag,.rs-obj:focus-visible .rs-tag{opacity:1;transform:translateZ(calc(var(--d)/2 + 4px)) translateX(0) scale(1)}
.rs-hole{position:absolute;left:7px;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:50%;background:#020305;box-shadow:0 0 0 1.5px rgba(255,255,255,.35)}
.rs-obj.is-flip .rs-hole{left:auto;right:7px}
.rs-tag b{font-size:12.5px;line-height:1.1;font-weight:700} .rs-tag i{font-style:normal;font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.8)}
.rs-floorglow{position:absolute;left:880px;top:880px;width:520px;height:90px;border-radius:50%;background:radial-gradient(closest-side,color-mix(in srgb,var(--sled) 45%,transparent),transparent);filter:blur(18px);opacity:0;transition:opacity 1s ease .8s;pointer-events:none}
.rs.is-in .rs-floorglow{opacity:1} .rs.is-still .rs-floorglow{opacity:1;transition:none}
/* lights off, pull cord and its call to action */
.rs-dark{position:absolute;inset:0;z-index:5;pointer-events:none;background:radial-gradient(28% 40% at var(--rx,57%) 38%,rgba(255,150,70,.07),rgba(2,2,4,.965) 70%)}
.rs.is-dark .rs-dark{pointer-events:auto}
.rs.is-lit .rs-dark{animation:rs-flick 1.15s linear forwards}
@keyframes rs-flick{0%{opacity:1}9%{opacity:.25}15%{opacity:.92}26%{opacity:.12}34%{opacity:.8}46%{opacity:.05}54%{opacity:.4}66%{opacity:0}100%{opacity:0}}
.rs-cord{position:absolute;inset:0;z-index:6;pointer-events:none}
.rs-rope{position:absolute;inset:0;overflow:visible}
.rs-rope path{fill:none;stroke-linecap:round}
.rs-rope .a{stroke:#a9865a;stroke-width:6}
.rs-rope .b{stroke:#e2c897;stroke-width:6;stroke-dasharray:3 5;opacity:.7}
.rs-knob{position:absolute;left:0;top:0;width:30px;height:62px;padding:0;border:0;border-radius:15px 15px 13px 13px;cursor:grab;pointer-events:auto;touch-action:none;transform-origin:50% 0;background:linear-gradient(90deg,#7a5530,#e7cc9b 40%,#c39b66 65%,#6d4b29);box-shadow:inset 0 -6px 10px rgba(0,0,0,.35),0 10px 24px rgba(0,0,0,.6)}
.rs-knob:active{cursor:grabbing}
.rs-knob::before{content:"";position:absolute;left:50%;top:-6px;width:12px;height:10px;margin-left:-6px;border-radius:3px;background:#3a2a1a}
.rs-knob:focus-visible{outline:2px solid #FF8A2A;outline-offset:6px}
.rs-ring{position:absolute;left:50%;top:50%;width:74px;height:74px;margin:-37px 0 0 -37px;border-radius:50%;border:1.5px solid rgba(255,138,42,.85);box-shadow:0 0 18px rgba(255,138,42,.55),inset 0 0 12px rgba(255,138,42,.35);animation:rs-ring 1.8s ease-out infinite;pointer-events:none}
@keyframes rs-ring{0%{transform:scale(.6);opacity:.95}100%{transform:scale(1.5);opacity:0}}
.rs-cta{position:absolute;left:0;top:0;display:inline-flex;align-items:center;gap:10px;padding:10px 16px 10px 12px;border-radius:999px;white-space:nowrap;font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:rgba(255,138,42,.12);box-shadow:inset 0 0 0 1px rgba(255,138,42,.6),0 0 24px rgba(255,138,42,.35);text-shadow:0 0 10px rgba(255,138,42,.8);transition:opacity .25s;pointer-events:none;animation:rs-cta 1.6s ease-in-out infinite}
.rs-cta i{font-style:normal;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#FF8A2A;color:#140a02;font-weight:800;text-shadow:none;animation:rs-down 1.6s ease-in-out infinite}
@keyframes rs-cta{50%{box-shadow:inset 0 0 0 1px rgba(255,138,42,.9),0 0 36px rgba(255,138,42,.55)}}
@keyframes rs-down{50%{transform:translateY(4px)}}
.rs-skip{position:absolute;left:50%;bottom:28px;translate:-50% 0;pointer-events:auto;padding:9px 16px;border:0;border-radius:999px;font:600 13px/1 Inter,system-ui,sans-serif;color:rgba(255,255,255,.75);background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18);cursor:pointer}
.rs-skip:hover{color:#fff;background:rgba(255,255,255,.14)}
.rs-skip:focus-visible{outline:2px solid #FF8A2A;outline-offset:3px}
@media (max-width:600px){.rs-cta{font-size:11px;padding:8px 12px 8px 10px}}
@media (prefers-reduced-motion:reduce){.rs-ring,.rs-cta,.rs-cta i{animation:none}.rs.is-lit .rs-dark{animation:none;opacity:0}}
@media (prefers-reduced-motion:reduce){.rs-obj,.rs-plank,.rs-hl>span,.rs-downs i,.rs-floorglow,.rs-post .led{transition:none!important;opacity:1!important;translate:0 0!important}}
`

addPropertyControls(RoomScene, {
    background: { type: ControlType.String, title: "Background URL", defaultValue: BG_DEFAULT, description: "The room photo (1448 × 1086)" },
    heading: { type: ControlType.String, title: "Wall Heading", defaultValue: "Designing|Products,|Brands and|Visuals", description: "Use | to start a new line", displayTextArea: true },
    headingFont: { type: ControlType.String, title: "Heading Font", defaultValue: "Inter", description: "Any Google Fonts family name" },
    headingSize: { type: ControlType.Number, title: "Heading Size", min: 48, max: 160, step: 1, unit: "px", defaultValue: 96 },
    headingColor: { type: ControlType.Color, title: "Heading", defaultValue: "#2F9BFF" },
    extrudeColor: { type: ControlType.Color, title: "3D Depth", defaultValue: "#0A3D7A" },
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
                iconUrl: { type: ControlType.String, title: "Logo URL", defaultValue: `${LOGO}/yMnuqn2Jbl8oikmX4FYFv7BZI.svg` },
                color: { type: ControlType.Color, title: "Box Color", defaultValue: "#1E6FD9" },
                shape: { type: ControlType.Enum, title: "Shape", options: ["book", "box", "tin"], optionTitles: ["Book", "Box", "Tin"], defaultValue: "book" },
            },
        },
        defaultValue: DEFAULT_TOOLS,
    },
    shelfLed: { type: ControlType.Color, title: "Shelf LEDs", defaultValue: "#2A7BFF" },
    shelfColor: { type: ControlType.Color, title: "Shelf", defaultValue: "#141A29" },
    accentColor: { type: ControlType.Color, title: "Hover Label", defaultValue: "#006ECE" },
    pullToStart: { type: ControlType.Boolean, title: "Pull Cord", defaultValue: true, description: "Room starts dark until the cord is pulled" },
    ctaText: { type: ControlType.String, title: "Cord Label", defaultValue: "Pull to turn on the lights", hidden: (p: any) => !p.pullToStart },
    ropeX: { type: ControlType.Number, title: "Cord Position", min: 10, max: 90, step: 1, unit: "%", defaultValue: 57, hidden: (p: any) => !p.pullToStart },
    sound: { type: ControlType.Boolean, title: "Switch Sound", defaultValue: true, hidden: (p: any) => !p.pullToStart },
    lockScroll: { type: ControlType.Boolean, title: "Lock Scroll Until Lit", defaultValue: true, hidden: (p: any) => !p.pullToStart },
})
