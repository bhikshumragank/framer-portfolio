import { addPropertyControls, ControlType, RenderTarget, useIsStaticRenderer } from "framer"
import * as FramerLib from "framer"
import { useEffect, useRef, useState, type CSSProperties } from "react"

type Gate = { name: string; label: string; line: string; link: string }

type Props = {
    title: string
    botName: string
    idleLine: string
    zapLine: string
    scrollHint: string
    gates: Gate[]
    bridge: string
    doorsOpen: string
    padOpen: string
    buttonsOn: string
    corridor: string
    panel: string
    playIntro: boolean
    headingFont: string
    hideSiteNav: boolean
    siteNavName: string
    floorName: string
    floorLine: string
    style?: CSSProperties
}

const DEFAULT_GATES: Gate[] = [
    { name: "Mind Zone", label: "About me", line: "This is where he thinks. Press the button to step inside.", link: "/about-me" },
    { name: "Work Galaxy", label: "Portfolio", line: "All his work lives behind this door. Press to open.", link: "/portfolio-2" },
    { name: "Story Vault", label: "Case Studies", line: "Seven case studies, product and brand. Press to open.", link: "/case-studies" },
    { name: "Signal", label: "Contact", line: "Want to talk? Press and send a signal.", link: "/contact-us" },
]

const IDLE_LINE = "Hi, I'm Jenny, Mragank's partner and his co-pilot on this ship. Press a door's button and I'll take you there."
const ZAP_LINE = "Easy there, my circuits tickle."

const FU = "https://framerusercontent.com/images/"
const IMG = {
    bridge: FU + "5wFph0qFFgt1NAJMQcGzzKltGwY.png",
    doorsOpen: FU + "TKs4ykqAdniEKoxwrRW9AJ30rTU.png",
    padOpen: FU + "qPtqsrFBsdHWo1wKGxAkhvtOJo.png",
    buttonsOn: FU + "32io0DC1iH5DvwUcbt5DUF1hcUw.png",
    corridor: FU + "89m3eOp9YJtY1a8MYeagVtssMkM.png",
    panel: FU + "rFPqDOszHLDl8vR4CkDgw9WMrdE.png",
}

const MENU = [
    ["Home", "/"],
    ["About me", "/about-me"],
    ["Portfolio", "/portfolio-2"],
    ["Case studies", "/case-studies"],
    ["Contact", "/contact-us"],
]

// where things sit in the bridge picture, measured on a 1024 x 768 copy of it (the picture is 4:3):
// each door's two panels (left, right, top, bottom and the seam between them) and its wall button
const PW = 1024
const PH = 768
const DOORS = [
    { l: 32, r: 114, t: 266, b: 440, seam: 73, bx: 146, by: 349 },
    { l: 184, r: 262, t: 270, b: 436, seam: 221, bx: 284, by: 349 },
    { l: 766, r: 844, t: 270, b: 436, seam: 805, bx: 741, by: 349 },
    { l: 912, r: 994, t: 266, b: 440, seam: 953, bx: 878, by: 349 },
]
// the round projector pad Jenny rises from
const PAD = { x: 512, y: 532 }

const pct = (v: number, of: number) => (v / of) * 100 + "%"
// a piece of a full-size picture shown inside a smaller box that sits at (l, t, w, h) of it, all as fractions
const crop = (src: string, l: number, t: number, w: number, h: number): CSSProperties => ({
    backgroundImage: `url("${src}")`,
    backgroundSize: `${100 / w}% ${100 / h}%`,
    backgroundPosition: `${(l / (1 - w)) * 100}% ${(t / (1 - h)) * 100}%`,
})

// the floor engraving types in one letter at a time: the name slowly, the line under it quickly
const NAME_MS = 85
const LINE_MS = 26
const typeTime = (name: string, line: string) => name.length * NAME_MS + 250 + line.length * LINE_MS + 450
const letters = (text: string, start: number, step: number) =>
    Array.from(text).map((ch, i) => (
        <i key={i} style={{ ["--d" as any]: `${start + i * step}ms` }}>
            {ch === " " ? "\u00a0" : ch}
        </i>
    ))

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// Jenny: a hovering AI co-pilot drawn in SVG; the pose class moves its hands, eyes and head
function Bot({ pose, onClick }: { pose: string; onClick: () => void }) {
    const hand = (
        <>
            <rect x="-17" y="-8" width="34" height="13" rx="6" fill="#131a26" />
            <rect x="-15" y="-3" width="30" height="2.4" rx="1.2" fill="#6FE0FF" />
            <path d="M-22 -14 Q-24 -40 -18 -54 Q-12 -66 0 -66 Q12 -66 18 -54 Q24 -40 22 -14 Q20 -7 0 -7 Q-20 -7 -22 -14Z" fill="url(#bShell)" />
            <path d="M-7 -62V-42M7 -62V-42" stroke="#98A3B5" strokeWidth="2.2" strokeLinecap="round" />
            <ellipse cx="25" cy="-28" rx="7.5" ry="14" transform="rotate(22 25 -28)" fill="url(#bShell)" />
        </>
    )
    return (
        <svg className={"ul-bot pose-" + pose} viewBox="0 0 400 640" onClick={onClick} role="img" aria-label="Jenny, Mragank's partner and AI co-pilot">
            <defs>
                <linearGradient id="bShell" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FAFCFF" />
                    <stop offset=".55" stopColor="#D5DCE6" />
                    <stop offset="1" stopColor="#9AA5B6" />
                </linearGradient>
                <linearGradient id="bVisor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#141c2b" />
                    <stop offset="1" stopColor="#04070d" />
                </linearGradient>
                <radialGradient id="bCore">
                    <stop offset="0" stopColor="#F2FDFF" />
                    <stop offset=".45" stopColor="#7FE6FF" />
                    <stop offset="1" stopColor="#1B6FE8" />
                </radialGradient>
                <linearGradient id="bBeam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#7FE6FF" stopOpacity=".45" />
                    <stop offset="1" stopColor="#7FE6FF" stopOpacity="0" />
                </linearGradient>
                <filter id="bGlow" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="4" result="b" />
                    <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* the light Jenny hovers on, down to the pad in the floor */}
            <polygon className="b-beam" points="178,430 222,430 270,606 130,606" fill="url(#bBeam)" />

            <g className="b-rise">
                <g className="b-float">
                    <path className="b-orbit" d="M48 318 A152 34 0 0 1 352 318" />

                    {/* body */}
                    <path d="M150 238 Q200 226 250 238 Q272 245 269 272 L253 380 Q246 412 200 420 Q154 412 147 380 L131 272 Q128 245 150 238Z" fill="url(#bShell)" />
                    <path d="M146 268 L158 372 Q162 394 180 404M254 268 L242 372 Q238 394 220 404" fill="none" stroke="#8792A5" strokeWidth="3" strokeLinecap="round" />
                    <path d="M178 420 Q200 446 222 420Z" fill="#131a26" />
                    <ellipse className="b-thrust" cx="200" cy="434" rx="16" ry="5" fill="#7FE6FF" filter="url(#bGlow)" />
                    <g className="b-core">
                        <circle cx="200" cy="304" r="38" fill="#0c121d" />
                        <circle className="b-ring" cx="200" cy="304" r="32" fill="none" stroke="#6FE0FF" strokeWidth="2.5" strokeDasharray="7 7" />
                        <polygon points="200,280 220.8,292 220.8,316 200,328 179.2,316 179.2,292" fill="url(#bCore)" filter="url(#bGlow)" />
                    </g>

                    {/* head */}
                    <g className="b-head">
                        <ellipse cx="200" cy="223" rx="30" ry="6.5" fill="#7FE6FF" filter="url(#bGlow)" />
                        <circle cx="103" cy="132" r="18" fill="#131a26" stroke="#C9D1DC" strokeWidth="4" />
                        <circle cx="103" cy="132" r="7" fill="#FF8A2A" filter="url(#bGlow)" />
                        <circle cx="297" cy="132" r="18" fill="#131a26" stroke="#C9D1DC" strokeWidth="4" />
                        <circle cx="297" cy="132" r="7" fill="#FF8A2A" filter="url(#bGlow)" />
                        <rect x="105" y="52" width="190" height="158" rx="74" fill="url(#bShell)" />
                        <path d="M140 70 Q200 50 260 70" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="5" strokeLinecap="round" />
                        <rect x="192" y="64" width="16" height="5" rx="2.5" fill="#6FE0FF" filter="url(#bGlow)" />
                        <rect x="123" y="90" width="154" height="86" rx="43" fill="url(#bVisor)" />
                        <path d="M142 104 Q160 94 184 96" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="4" strokeLinecap="round" />
                        <g className="b-eyes">
                            <g className="b-eye-o" filter="url(#bGlow)">
                                <rect x="158" y="114" width="20" height="36" rx="10" fill="#8EEBFF" />
                                <rect x="222" y="114" width="20" height="36" rx="10" fill="#8EEBFF" />
                            </g>
                            <g className="b-eye-h" filter="url(#bGlow)" fill="none" stroke="#8EEBFF" strokeWidth="7" strokeLinecap="round">
                                <path d="M154 140 Q168 118 182 140" />
                                <path d="M218 140 Q232 118 246 140" />
                            </g>
                            <g className="b-eye-x" filter="url(#bGlow)" fill="none" stroke="#FFB36B" strokeWidth="6" strokeLinecap="round">
                                <path d="M158 120 L178 144 M178 120 L158 144" />
                                <path d="M222 120 L242 144 M242 120 L222 144" />
                            </g>
                        </g>
                    </g>

                    <g className="b-hand l">{hand}</g>
                    <g className="b-hand r">{hand}</g>
                    <path className="b-orbit front" d="M48 318 A152 34 0 0 0 352 318" />
                </g>
            </g>
        </svg>
    )
}

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

// tiny synthesised sounds, so no audio files are needed
function useSfx(enabled: boolean) {
    const ctx = useRef<AudioContext | null>(null)
    const get = () => {
        if (!enabled || typeof window === "undefined") return null
        if (!ctx.current) {
            const AC = (window as any).AudioContext || (window as any).webkitAudioContext
            if (!AC) return null
            ctx.current = new AC()
        }
        const c = ctx.current!
        if (c.state === "suspended") c.resume()
        return c
    }
    const noise = (c: AudioContext, dur: number) => {
        const b = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate)
        const d = b.getChannelData(0)
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
        const s = c.createBufferSource()
        s.buffer = b
        return s
    }
    const tone = (c: AudioContext, f: number, at: number, dur: number, vol: number, type: OscillatorType = "sine") => {
        const o = c.createOscillator()
        const g = c.createGain()
        o.type = type
        o.frequency.setValueAtTime(f, at)
        g.gain.setValueAtTime(vol, at)
        g.gain.exponentialRampToValueAtTime(0.001, at + dur)
        o.connect(g).connect(c.destination)
        o.start(at)
        o.stop(at + dur + 0.02)
    }
    return {
        // the button: a soft click and a rising two-note confirm
        press() {
            const c = get()
            if (!c) return
            const t = c.currentTime
            const n = noise(c, 0.03)
            const ng = c.createGain()
            ng.gain.value = 0.3
            n.connect(ng).connect(c.destination)
            n.start(t)
            tone(c, 880, t + 0.03, 0.12, 0.12)
            tone(c, 1320, t + 0.13, 0.18, 0.12)
        },
        // the doors: a low pneumatic hiss
        doors() {
            const c = get()
            if (!c) return
            const t = c.currentTime
            const n = noise(c, 1)
            const f = c.createBiquadFilter()
            f.type = "bandpass"
            f.Q.value = 0.8
            f.frequency.setValueAtTime(500, t)
            f.frequency.exponentialRampToValueAtTime(1800, t + 0.9)
            const g = c.createGain()
            g.gain.setValueAtTime(0.0001, t)
            g.gain.exponentialRampToValueAtTime(0.35, t + 0.15)
            g.gain.exponentialRampToValueAtTime(0.001, t + 1)
            n.connect(f).connect(g).connect(c.destination)
            n.start(t)
        },
        // Jenny rising from the floor
        rise() {
            const c = get()
            if (!c) return
            const t = c.currentTime
            const o = c.createOscillator()
            const g = c.createGain()
            o.frequency.setValueAtTime(140, t)
            o.frequency.exponentialRampToValueAtTime(520, t + 1.3)
            g.gain.setValueAtTime(0.0001, t)
            g.gain.exponentialRampToValueAtTime(0.08, t + 0.3)
            g.gain.exponentialRampToValueAtTime(0.001, t + 1.4)
            o.connect(g).connect(c.destination)
            o.start(t)
            o.stop(t + 1.5)
        },
        zap() {
            const c = get()
            if (!c) return
            const t = c.currentTime
            for (let i = 0; i < 6; i++) tone(c, 600 + Math.random() * 900, t + i * 0.05, 0.05, 0.05, "square")
        },
    }
}

/**
 * Universe Landing: the bridge of a spaceship. Four doors line the bridge, each with a button beside it; Jenny, an
 * AI co-pilot, rises out of the pad in the middle of the floor. The bridge opens dark: Jenny rises, the name engraved
 * in the floor types itself out in light, then the lights come on. Pressing a door's button slides it open and the
 * camera flies down the corridor behind it. Scrolling makes Jenny open a portal into the rest of the home page.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 2400
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function UniverseLanding(props: Props) {
    const {
        title = "Mragank Bhikshu · Product & Brand Designer",
        botName = "Jenny",
        idleLine: idleProp = IDLE_LINE,
        zapLine: zapProp = ZAP_LINE,
        scrollHint = "Scroll to enter",
        gates: gatesProp = DEFAULT_GATES,
        bridge = IMG.bridge,
        doorsOpen = IMG.doorsOpen,
        padOpen = IMG.padOpen,
        buttonsOn = IMG.buttonsOn,
        corridor = IMG.corridor,
        panel = IMG.panel,
        playIntro = true,
        headingFont = "Inter",
        hideSiteNav = true,
        siteNavName = "Navbar",
        floorName = "MRAGANK BHIKSHU",
        floorLine = "Product & brand designer · IIT Kharagpur",
        style,
    } = props

    // lines saved from the old landing (Sparky, or knocking on gates) fall back to Jenny's own
    const idleLine = !idleProp || /sparky|knock|mira/i.test(idleProp) ? IDLE_LINE : idleProp
    // the bot was called Mira before it was named after Jenny; a saved old name shows the new one
    const name = !botName || /^\s*mira\s*$/i.test(botName) ? "Jenny" : botName
    const zapLine = !zapProp || /sparky|zzzap|charged/i.test(zapProp) ? ZAP_LINE : zapProp
    const gates = (gatesProp && gatesProp.length ? gatesProp : DEFAULT_GATES).slice(0, 4).map((g, i) => {
        const d = DEFAULT_GATES[i]
        // a saved Case Studies gate that still points at the old single case study opens the full collection
        const link = /case stud/i.test(g.label || "") && (g.link || "").startsWith("/case-study/") ? d.link : g.link || d.link
        return { ...g, link, line: !g.line || /knock|sparky/i.test(g.line) ? d.line : g.line }
    })
    const isStatic = useIsStaticRenderer()
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const go = useGo()
    const root = useRef<HTMLDivElement>(null)
    const stage = useRef<HTMLDivElement>(null)
    const world = useRef<HTMLDivElement>(null)
    const portalCv = useRef<HTMLCanvasElement>(null)
    const botEl = useRef<HTMLDivElement>(null)
    const leafEls = useRef<(HTMLButtonElement | null)[]>([])

    const [narrow, setNarrow] = useState(false)
    // the 4:3 bridge picture: fitted inside the screen, with a blurred copy of it filling any space around it
    const [box, setBox] = useState<{ w: number; h: number } | null>(null)
    const [hover, setHover] = useState<number | null>(null)
    // pressing a door: 1 button lit, 2 doors open, 3 flying through
    const [press, setPress] = useState<{ i: number; step: number } | null>(null)
    const [zoomAt, setZoomAt] = useState<string | null>(null)
    const [zapped, setZapped] = useState(false)
    const [phase, setPhase] = useState(0) // 0 idle, 1 portal, 2 through
    const [sound, setSound] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [ready, setReady] = useState(isStatic)
    // Jenny's entrance: "wait" until the pictures load, "pad" the hatch opens, "rise" Jenny comes up, "done"
    // the opening: "wait" for the pictures, "dark" the hatch opens in the dark, "rise" Jenny comes up, "type" the
    // name lights up letter by letter on the floor, "lights" the bridge lights flicker on, "done"
    const [intro, setIntro] = useState<"wait" | "dark" | "rise" | "type" | "lights" | "done">(isStatic || onCanvas || !playIntro ? "done" : "wait")
    const sfx = useSfx(sound)

    useEffect(() => {
        const srcs = [bridge, doorsOpen, padOpen, buttonsOn].filter(Boolean)
        let left = srcs.length
        if (!left) return setReady(true)
        const done = () => --left <= 0 && setReady(true)
        srcs.forEach((s) => {
            const im = new Image()
            im.onload = im.onerror = done
            im.src = s
        })
        const t = setTimeout(() => setReady(true), 3000)
        return () => clearTimeout(t)
    }, [bridge, doorsOpen, padOpen, buttonsOn])

    useEffect(() => {
        if (!ready || intro !== "wait") return
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return setIntro("done")
        let ts: ReturnType<typeof setTimeout>[] = []
        let started = false
        const start = () => {
            if (started) return
            started = true
            const typed = 2400 + typeTime(floorName, floorLine)
            ts = [
                setTimeout(() => setIntro("dark"), 50),
                setTimeout(() => {
                    setIntro("rise")
                    sfx.rise()
                }, 700),
                setTimeout(() => setIntro("type"), 2400),
                setTimeout(() => setIntro("lights"), typed),
                setTimeout(() => setIntro("done"), typed + 1400),
            ]
        }
        // while the ship loader is still on screen, Jenny waits to be beamed down before rising
        if ((window as any).__mbLoader === "active") {
            window.addEventListener("mb-loader-done", start)
            ts.push(setTimeout(start, 9000))
        } else start()
        return () => {
            window.removeEventListener("mb-loader-done", start)
            ts.forEach(clearTimeout)
        }
    }, [ready])

    useEffect(() => {
        const el = stage.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(() => {
            const r = el.getBoundingClientRect()
            if (!r.width || !r.height) return
            const nr = r.width < 760
            setNarrow(nr)
            // on phones the whole bridge stays in view across the width, with the door buttons underneath
            const w = nr ? r.width : Math.min(r.width, (r.height * 4) / 3)
            setBox({ w, h: (w * 3) / 4 })
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // one loop: read scroll progress and draw the portal that opens at Jenny's core
    useEffect(() => {
        if (isStatic) return
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        const pc = portalCv.current!
        const px = pc.getContext("2d")!
        let W = 0,
            H = 0,
            dpr = 1
        const sparks = Array.from({ length: 260 }, () => ({
            a: Math.random() * Math.PI * 2,
            v: 0.6 + Math.random() * 1.6,
            j: Math.random(),
            l: 0.04 + Math.random() * 0.12,
        }))
        const resize = () => {
            const r = stage.current!.getBoundingClientRect()
            dpr = Math.min(2, window.devicePixelRatio || 1)
            W = r.width
            H = r.height
            pc.width = Math.round(W * dpr)
            pc.height = Math.round(H * dpr)
        }
        resize()
        window.addEventListener("resize", resize)
        const pointer = { x: 0, y: 0, sx: 0, sy: 0 }
        const onMove = (e: PointerEvent) => {
            pointer.x = (e.clientX / window.innerWidth) * 2 - 1
            pointer.y = (e.clientY / window.innerHeight) * 2 - 1
        }
        window.addEventListener("pointermove", onMove)

        let raf = 0
        let sp = 0
        let lastPhase = -1
        let last = performance.now()
        const tick = (now: number) => {
            // time-based smoothing, so a slow or throttled frame rate still catches up with the scroll
            const dt = Math.min(0.25, (now - last) / 1000)
            last = now
            const el = root.current!
            const r = el.getBoundingClientRect()
            const vh = window.innerHeight
            const travel = Math.max(1, r.height - vh)
            const target = clamp01(-r.top / travel)
            sp = reduce ? target : sp + (target - sp) * (1 - Math.exp(-dt * 9))
            const ph = sp < 0.1 ? 0 : sp < 0.86 ? 1 : 2
            if (ph !== lastPhase) {
                lastPhase = ph
                setPhase(ph)
            }

            // Jenny's eyes follow the pointer
            pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt * 3))
            pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt * 3))
            const w = world.current!
            w.style.setProperty("--mx", pointer.sx.toFixed(3))
            w.style.setProperty("--my", pointer.sy.toFixed(3))

            // scroll story: 0.1–0.5 a portal opens at Jenny's core, 0.5–0.86 it swallows the screen, then a flash
            const open = ease(clamp01((sp - 0.1) / 0.4))
            const swallow = ease(clamp01((sp - 0.5) / 0.36))
            const flash = sp < 0.86 ? 0 : Math.sin(clamp01((sp - 0.86) / 0.14) * Math.PI)
            const out = clamp01((sp - 0.93) / 0.07)
            w.style.setProperty("--open", open.toFixed(3))
            w.style.setProperty("--swallow", swallow.toFixed(3))
            w.style.transform = reduce ? "" : `scale(${1 + swallow * 0.9})`
            el.style.setProperty("--open", open.toFixed(3))
            el.style.setProperty("--flash", flash.toFixed(3))
            el.style.setProperty("--out", out.toFixed(3))

            px.setTransform(dpr, 0, 0, dpr, 0, 0)
            px.clearRect(0, 0, W, H)
            if (open > 0.001) {
                const t = now / 1000
                const br = botEl.current?.getBoundingClientRect()
                const st = stage.current!.getBoundingClientRect()
                const cx0 = br ? br.left - st.left + br.width / 2 : W / 2
                const cy0 = br ? br.top - st.top + br.height * 0.475 : H * 0.55
                const cx = lerp(cx0, W / 2, swallow)
                const cy = lerp(cy0, H / 2, swallow)
                const base = Math.min(W, H) * 0.2 * open
                const R = lerp(base, Math.hypot(W, H) * 0.75, swallow)
                // tunnel inside the ring
                if (swallow > 0) {
                    px.save()
                    px.beginPath()
                    px.arc(cx, cy, R * 0.96, 0, 6.283)
                    px.clip()
                    const bg = px.createRadialGradient(cx, cy, 0, cx, cy, R)
                    bg.addColorStop(0, `rgba(255,240,220,${0.9 * swallow})`)
                    bg.addColorStop(0.25, `rgba(40,90,200,${0.8 * swallow})`)
                    bg.addColorStop(1, `rgba(3,6,18,${0.95 * swallow})`)
                    px.fillStyle = bg
                    px.fillRect(0, 0, W, H)
                    px.lineCap = "round"
                    for (let i = 0; i < 90; i++) {
                        const a = i * 2.39996 + t * 0.4
                        const k = (t * 0.9 + i * 0.137) % 1
                        const r1 = R * k * k
                        const r2 = R * Math.min(1, k * k + 0.12)
                        px.strokeStyle = i % 5 === 0 ? `rgba(255,170,90,${0.7 * k})` : `rgba(170,215,255,${0.6 * k})`
                        px.lineWidth = 1 + k * 3
                        px.beginPath()
                        px.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1)
                        px.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2)
                        px.stroke()
                    }
                    px.restore()
                }
                // the spark ring
                px.globalCompositeOperation = "lighter"
                for (const s of sparks) {
                    s.a += (s.v * 0.035) / Math.max(0.4, open)
                    const rr = R * (0.94 + s.j * 0.12)
                    px.strokeStyle = s.j > 0.8 ? "rgba(255,240,200,0.95)" : s.j > 0.4 ? "rgba(255,170,60,0.9)" : "rgba(255,120,30,0.75)"
                    px.lineWidth = 1 + s.j * 2.2
                    px.beginPath()
                    px.arc(cx, cy, rr, s.a - s.l, s.a)
                    px.stroke()
                }
                const glow = px.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.25)
                glow.addColorStop(0, "rgba(255,140,40,0)")
                glow.addColorStop(0.35, `rgba(255,140,40,${0.35 * open})`)
                glow.addColorStop(1, "rgba(255,140,40,0)")
                px.fillStyle = glow
                px.fillRect(cx - R * 1.3, cy - R * 1.3, R * 2.6, R * 2.6)
                px.globalCompositeOperation = "source-over"
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener("resize", resize)
            window.removeEventListener("pointermove", onMove)
        }
    }, [isStatic])

    // press a door's button: it lights up, the doors slide apart, the camera flies down the corridor, then go
    const open = (i: number) => {
        if (press || phase > 0) return
        const g = gates[i]
        sfx.press()
        setHover(i)
        setPress({ i, step: 1 })
        setTimeout(() => {
            sfx.doors()
            setPress({ i, step: 2 })
        }, 550)
        setTimeout(() => {
            const lr = leafEls.current[i]?.getBoundingClientRect()
            const st = stage.current?.getBoundingClientRect()
            if (lr && st) setZoomAt(`${(((lr.left + lr.width / 2 - st.left) / st.width) * 100).toFixed(2)}% ${(((lr.top + lr.height * 0.5 - st.top) / st.height) * 100).toFixed(2)}%`)
            setPress({ i, step: 3 })
        }, 1550)
        setTimeout(() => go(g.link), 2450)
    }

    const active = press ? press.i : hover
    const pose =
        phase > 0 ? "portal" : zapped ? "zap" : press && press.step >= 2 ? "happy" : active !== null ? (DOORS[active].seam < PW / 2 ? "look-l" : "look-r") : "idle"
    const bubble =
        intro !== "done" || phase > 0
            ? ""
            : zapped
              ? zapLine
              : press && press.step >= 2
                ? `Opening ${gates[press.i].name}…`
                : active !== null
                  ? gates[active].line
                  : idleLine

    const flying = press?.step === 3
    // the name and line engraved in the floor, sized to the picture
    const floor = (size: number) => (
        <div className="ul-floor" aria-hidden="true" style={{ fontSize: size }}>
            <b>{letters(floorName, 0, NAME_MS)}</b>
            {floorLine && <span>{letters(floorLine, floorName.length * NAME_MS + 250, LINE_MS)}</span>}
        </div>
    )
    const dark = intro === "wait" || intro === "dark" || intro === "rise" || intro === "type"
    const boxStyle: CSSProperties | undefined = box ? { width: box.w, height: box.h } : undefined

    return (
        <div
            ref={root}
            className={"ul" + (narrow ? " nr" : "") + (ready ? " ready" : "") + " intro-" + intro + (dark ? " is-dark" : "")}
            style={{ ...style, ["--hf" as any]: `"${headingFont}", Inter, system-ui, sans-serif` }}
        >
            <style>{CSS}</style>
            {/* the site's shared navigation bar stays hidden while the bridge is on screen; it returns after the portal */}
            {hideSiteNav && phase < 2 && !onCanvas && (
                <style>{`[data-framer-name="${siteNavName}"]{opacity:0!important;pointer-events:none!important;transition:opacity .4s}`}</style>
            )}
            <div className="ul-stage" ref={stage}>
                <div className="ul-backdrop" style={{ backgroundImage: `url("${bridge}")` }} />
                <div className="ul-world" ref={world} style={flying && zoomAt ? { transformOrigin: zoomAt } : undefined}>
                    <div className={"ul-zoom" + (flying ? " on" : "")}>
                        {!narrow && (
                        <div className="ul-box" style={boxStyle}>
                            <div className="ul-pic" style={{ backgroundImage: `url("${bridge}")` }} />
                            {/* the hatch in the floor, opened, while Jenny comes up */}
                            <div className="ul-pic ul-padopen" style={{ backgroundImage: `url("${padOpen}")` }} />
                            <div className="ul-darkness" />
                            {box && floor(box.w * 0.04)}

                            {DOORS.map((d, i) => {
                                const g = gates[i]
                                const l = d.l / PW,
                                    t = d.t / PH,
                                    w = (d.r - d.l) / PW,
                                    h = (d.b - d.t) / PH
                                const s = (d.seam - d.l) / (d.r - d.l)
                                const lit = (press?.i === i && press.step >= 1) || (!press && hover === i)
                                const opened = press?.i === i && press.step >= 2
                                // the lit button: a patch of the buttons-on picture around this door's button
                                const bw = 64 / PW,
                                    bh = 86 / PH
                                const bl = d.bx / PW - bw / 2,
                                    bt = d.by / PH - bh / 2
                                return (
                                    <div key={i} className={"ul-door" + (lit ? " lit" : "") + (opened ? " opened" : "") + (press?.i === i && press.step >= 1 ? " pressed" : "")}>
                                        <button
                                            ref={(el) => {
                                                leafEls.current[i] = el
                                            }}
                                            className="ul-leaf"
                                            style={{ left: pct(l, 1), top: pct(t, 1), width: pct(w, 1), height: pct(h, 1) }}
                                            onPointerEnter={() => setHover(i)}
                                            onPointerLeave={() => setHover((x) => (x === i ? null : x))}
                                            onFocus={() => setHover(i)}
                                            onBlur={() => setHover((x) => (x === i ? null : x))}
                                            onClick={() => open(i)}
                                            aria-label={`Open ${g.name}: ${g.label}`}
                                        >
                                            <span className="ul-beyond" style={crop(doorsOpen, l, t, w, h)} />
                                            <span className="ul-half l" style={{ width: s * 100 + "%" }}>
                                                <span style={{ ...crop(bridge, l, t, w, h), width: 100 / s + "%" }} />
                                            </span>
                                            <span className="ul-half r" style={{ width: (1 - s) * 100 + "%" }}>
                                                <span style={{ ...crop(bridge, l, t, w, h), width: 100 / (1 - s) + "%", left: (-s / (1 - s)) * 100 + "%" }} />
                                            </span>
                                            <span className="ul-seam" style={{ left: s * 100 + "%" }} />
                                        </button>
                                        <button
                                            className="ul-btn"
                                            style={{ left: pct(bl, 1), top: pct(bt, 1), width: pct(bw, 1), height: pct(bh, 1) }}
                                            onPointerEnter={() => setHover(i)}
                                            onPointerLeave={() => setHover((x) => (x === i ? null : x))}
                                            onClick={() => open(i)}
                                            tabIndex={-1}
                                            aria-hidden="true"
                                        >
                                            <span className="ul-btn-on" style={crop(buttonsOn, bl, bt, bw, bh)} />
                                            <span className="ul-ring" />
                                        </button>
                                        <span className="ul-plate" style={{ left: pct((d.l + d.r) / 2, PW), top: pct(d.b + 12, PH) }}>
                                            <b>{g.name}</b>
                                            <span>{g.label}</span>
                                        </span>
                                    </div>
                                )
                            })}

                            <div className="ul-bot-wrap" ref={botEl} style={{ left: pct(PAD.x, PW), top: `calc(${pct(PAD.y, PH)} - 42.6%)` }}>
                                <Bot
                                    pose={pose}
                                    onClick={() => {
                                        if (phase > 0 || press || intro !== "done") return
                                        sfx.zap()
                                        setZapped(true)
                                        setTimeout(() => setZapped(false), 1500)
                                    }}
                                />
                                {bubble && (
                                    <div className="ul-bubble" key={bubble} role="status">
                                        <b>{name}</b>
                                        {bubble}
                                    </div>
                                )}
                            </div>
                        </div>
                        )}

                        {/* phones get their own screen: the middle of the bridge with Jenny on her pad, her line,
                            and the four doors as big rows to tap */}
                        {narrow && (
                            <div className="ul-m">
                                <div className="ul-mscene">
                                    <div className="ul-pic" style={{ backgroundImage: `url("${bridge}")` }} />
                                    <div className="ul-pic ul-padopen" style={{ backgroundImage: `url("${padOpen}")` }} />
                                    <div className="ul-darkness" />
                                    {box && floor(box.w * 0.05)}
                                    <div className="ul-bot-wrap" ref={botEl} style={{ left: "50%", top: `calc(${pct(PAD.y, PH)} - 42.6%)` }}>
                                        <Bot
                                            pose={pose}
                                            onClick={() => {
                                                if (phase > 0 || press || intro !== "done") return
                                                sfx.zap()
                                                setZapped(true)
                                                setTimeout(() => setZapped(false), 1500)
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="ul-mline" role="status">
                                    {bubble && (
                                        <p key={bubble}>
                                            <b>{name}</b>
                                            {bubble}
                                        </p>
                                    )}
                                </div>
                                <div className="ul-mdoors">
                                    {gates.map((g, i) => {
                                        const d = DOORS[i]
                                        const l = d.l / PW,
                                            t = d.t / PH,
                                            w = (d.r - d.l) / PW,
                                            h = (d.b - d.t) / PH
                                        const on = press?.i === i
                                        return (
                                            <button key={i} className={"ul-mdoor" + (on ? " on" : "") + (on && press!.step >= 2 ? " opened" : "")} onClick={() => open(i)} aria-label={`Open ${g.name}: ${g.label}`}>
                                                <span
                                                    className="ul-mthumb"
                                                    ref={(el) => {
                                                        leafEls.current[i] = el as any
                                                    }}
                                                >
                                                    <span style={crop(doorsOpen, l, t, w, h)} />
                                                    <span className="ul-mshut" style={crop(bridge, l, t, w, h)} />
                                                </span>
                                                <span className="ul-mtext">
                                                    <b>{g.name}</b>
                                                    <small>{g.label}</small>
                                                </span>
                                                <i aria-hidden="true">→</i>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* the corridor behind the door, flown down at the end of a press */}
                <div className={"ul-corridor" + (flying ? " on" : "")} style={{ backgroundImage: `url("${corridor}")` }} />
                <canvas className="ul-portal" ref={portalCv} />
                <div className="ul-flash" />

                <header className="ul-top">
                    <div className="ul-title">
                        <span className="ul-dot" />
                        {title}
                    </div>
                    <div className="ul-tools">
                        <button className="ul-icon" onClick={() => setSound((s) => !s)} aria-label={sound ? "Mute sounds" : "Turn sounds on"}>
                            {sound ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 9v6h4l5 4V5L8 9H4z" />
                                    <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 9v6h4l5 4V5L8 9H4z" />
                                    <path d="M17 9l5 6M22 9l-5 6" />
                                </svg>
                            )}
                        </button>
                        <nav className={"ul-menu" + (menuOpen ? " open" : "")}>
                            <button className="ul-menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen}>
                                Menu
                                <span />
                            </button>
                            <div className="ul-menu-list">
                                {MENU.map(([l, h]) => (
                                    <a
                                        key={h}
                                        href={h}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setMenuOpen(false)
                                            if (h === "/") window.scrollTo({ top: 0, behavior: "smooth" })
                                            else go(h)
                                        }}
                                    >
                                        {l}
                                    </a>
                                ))}
                            </div>
                        </nav>
                    </div>
                </header>

                <div className="ul-hint" aria-hidden={phase > 0}>
                    <span className="ul-mouse">
                        <i />
                    </span>
                    {scrollHint}
                </div>
                <h1 className="ul-sr">{title}</h1>
            </div>
        </div>
    )
}

const CSS = `
.ul{position:relative;width:100%;max-width:1200px;margin-inline:auto;height:100%;background:#050608;color:#E8EEF8;font-family:Inter,system-ui,sans-serif;--flash:0;--out:0;--open:0}
.ul *{box-sizing:border-box}
.ul-stage{position:sticky;top:0;width:100%;height:100vh;overflow:hidden;opacity:0;transition:opacity .8s ease;background:#07080a}
.ul.ready .ul-stage{opacity:1}
.ul-backdrop{position:absolute;inset:-40px;background-size:cover;background-position:50% 50%;filter:blur(28px) brightness(.35) saturate(1.1)}
.ul-world{position:absolute;inset:0;--mx:0;--my:0;--open:0;--swallow:0;transform-origin:50% 55%}
.ul-zoom{position:absolute;inset:0;transition:transform 1s cubic-bezier(.6,0,.35,1),filter 1s;transform-origin:inherit}
.ul-zoom.on{transform:scale(5);filter:brightness(1.8)}

/* the bridge picture, centred and kept at 4:3 */
.ul-box{position:absolute;left:50%;top:50%;width:100%;height:100%;translate:-50% -50%;box-shadow:0 0 80px 30px #07080a}
.ul-pic{position:absolute;inset:0;background-size:100% 100%}
.ul-padopen{opacity:0;transition:opacity .8s ease}
.intro-dark .ul-padopen,.intro-rise .ul-padopen,.intro-type .ul-padopen{opacity:1}
/* the opening in the dark: everything but Jenny and the floor engraving sits under a dark layer until the lights come on */
.ul-darkness{position:absolute;inset:0;z-index:2;background:#010205;opacity:0;pointer-events:none}
.is-dark .ul-darkness{opacity:.94}
.intro-lights .ul-darkness{animation:ul-lightson 1.3s linear forwards}
@keyframes ul-lightson{0%{opacity:.94}12%{opacity:.35}20%{opacity:.88}34%{opacity:.18}42%{opacity:.7}58%{opacity:.05}66%{opacity:.4}100%{opacity:0}}
.ul-backdrop{transition:filter 1.2s ease}
.is-dark .ul-backdrop{filter:blur(28px) brightness(.04)}
.is-dark .ul-hint,.is-dark .ul-mdoors,.is-dark .ul-mline{opacity:0!important}
.ul-hint,.ul-mdoors,.ul-mline{transition:opacity .8s ease}
/* the name engraved in the floor, lying flat in perspective and lit from inside */
.ul-floor{position:absolute;left:50%;top:84%;z-index:3;display:grid;justify-items:center;gap:.35em;white-space:nowrap;pointer-events:none;translate:-50% -50%;transform:perspective(9em) rotateX(56deg);font-family:var(--hf);opacity:calc(1 - var(--open) * 1.4)}
.ul-floor b{font-size:1em;font-weight:900;letter-spacing:.32em;margin-right:-.32em}
.ul-floor span{font-size:.34em;font-weight:700;letter-spacing:.42em;text-transform:uppercase;margin-right:-.42em}
.ul-floor i{display:inline-block;font-style:normal;opacity:0;color:#E9FAFF;-webkit-text-stroke:.02em rgba(140,225,255,.6);text-shadow:0 0 .08em #fff,0 0 .2em #6FE0FF,0 0 .5em rgba(47,155,255,.75),0 .1em .9em rgba(255,138,42,.35)}
.ul-floor span i{color:#BFEFFF;text-shadow:0 0 .2em #6FE0FF,0 0 .6em rgba(47,155,255,.6)}
.intro-type .ul-floor i,.intro-lights .ul-floor i{animation:ul-type .45s ease-out forwards;animation-delay:var(--d)}
.intro-done .ul-floor i{opacity:1}
@keyframes ul-type{0%{opacity:0;filter:brightness(3) blur(2px)}30%{opacity:1;filter:brightness(2.2)}100%{opacity:1;filter:none}}
/* once the lights are on the engraving settles into the floor, still glowing */
.intro-done .ul-floor{animation:ul-hum 4s ease-in-out infinite}
@keyframes ul-hum{50%{filter:brightness(.82)}}

/* a door: the corridor light behind, two panels that slide apart, its button and its name plate */
.ul-leaf{all:unset;position:absolute;overflow:hidden;cursor:pointer;opacity:calc(1 - var(--open) * 1.4)}
.ul-beyond{position:absolute;inset:0;transition:filter .4s}
.ul-half{position:absolute;top:0;bottom:0;overflow:hidden;transition:transform .95s cubic-bezier(.65,0,.3,1)}
.ul-half.l{left:0}
.ul-half.r{right:0}
.ul-half > span{position:absolute;top:0;bottom:0;left:0}
.ul-door.opened .ul-half.l{transform:translateX(-101%)}
.ul-door.opened .ul-half.r{transform:translateX(101%)}
.ul-door.opened .ul-beyond{filter:brightness(1.35)}
.ul-seam{position:absolute;top:4%;bottom:4%;width:2px;margin-left:-1px;background:#9fe8ff;box-shadow:0 0 10px 3px rgba(111,224,255,.8);opacity:0;transition:opacity .3s}
.ul-door.lit .ul-seam{opacity:.85}
.ul-door.opened .ul-seam{opacity:0}
.ul-leaf:focus-visible{outline:2px solid #fff;outline-offset:3px}
.ul-btn{all:unset;position:absolute;cursor:pointer;opacity:calc(1 - var(--open) * 1.4)}
.ul-btn-on{position:absolute;inset:0;opacity:0;transition:opacity .2s;-webkit-mask-image:radial-gradient(closest-side,#000 55%,transparent);mask-image:radial-gradient(closest-side,#000 55%,transparent)}
.ul-door.lit .ul-btn-on{opacity:.65}
.ul-door.pressed .ul-btn-on{opacity:1}
.ul-ring{position:absolute;left:50%;top:50%;width:30%;aspect-ratio:1;translate:-50% -50%;border-radius:50%;border:2px solid #9fe8ff;opacity:0;pointer-events:none}
.ul-door.lit:not(.pressed) .ul-ring{animation:ul-ping 1.6s ease-out infinite}
.ul-door.pressed .ul-ring{animation:ul-ping .7s ease-out 2}
@keyframes ul-ping{0%{opacity:.9;scale:1}100%{opacity:0;scale:4.5}}
.ul-plate{position:absolute;translate:-50% 0;display:grid;justify-items:center;gap:1px;padding:5px 11px 6px;border-radius:9px;white-space:nowrap;background:rgba(8,10,14,.78);border:1px solid rgba(111,224,255,.28);backdrop-filter:blur(6px);pointer-events:none;opacity:calc(1 - var(--open) * 1.4);transition:border-color .3s,box-shadow .3s}
.ul-plate b{font-family:var(--hf);font-size:clamp(9px,1.05vw,13px);font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#E8F6FF;text-shadow:0 0 8px rgba(47,155,255,.8)}
.ul-plate span{font-size:clamp(9px,.95vw,12px);font-weight:600;color:rgba(232,238,248,.7)}
.ul-door.lit .ul-plate{border-color:rgba(255,138,42,.7);box-shadow:0 0 18px rgba(255,138,42,.35)}
.ul-door.lit .ul-plate span{color:#FFB36B}

/* Jenny, standing on the pad in the picture */
.ul-bot-wrap{position:absolute;height:45%;aspect-ratio:400/640;translate:-50% 0;z-index:3;opacity:calc(1 - var(--swallow) * 1.6)}
.ul-bot{position:absolute;inset:0;width:100%;height:100%;overflow:visible;cursor:pointer;clip-path:polygon(-60% -60%,160% -60%,160% 94.7%,-60% 94.7%)}
.b-rise{transition:translate 1.6s cubic-bezier(.2,.75,.25,1)}
.intro-wait .b-rise,.intro-dark .b-rise{translate:0 640px}
.intro-wait .b-beam,.intro-dark .b-beam{opacity:0}
.b-float{animation:b-float 4.6s ease-in-out infinite}
@keyframes b-float{50%{translate:0 -12px}}
.b-beam{transition:opacity .6s;animation:b-beam 2.4s ease-in-out infinite}
@keyframes b-beam{50%{opacity:.6}}
.b-thrust{animation:b-beam 1.2s ease-in-out infinite}
.b-orbit{fill:none;stroke:#6FE0FF;stroke-width:2;stroke-dasharray:3 10;stroke-linecap:round;opacity:.45;animation:b-orbit 6s linear infinite}
.b-orbit.front{opacity:.75}
@keyframes b-orbit{to{stroke-dashoffset:-260}}
.b-ring{transform-box:fill-box;transform-origin:center;animation:b-spin 9s linear infinite}
@keyframes b-spin{to{rotate:360deg}}
.b-core polygon{transition:filter .3s}
.b-head{transform-box:fill-box;transform-origin:50% 100%;transition:rotate .5s cubic-bezier(.3,1.3,.5,1)}
.b-eyes{transition:translate .35s ease;translate:calc(var(--mx) * 7px) calc(var(--my) * 4px)}
.b-eye-o{transform-box:fill-box;transform-origin:center;animation:b-blink 5s infinite}
@keyframes b-blink{0%,93%,100%{scale:1 1}95.5%{scale:1 .1}}
.b-eye-h,.b-eye-x{opacity:0;transition:opacity .2s}
.b-hand{transition:translate .5s cubic-bezier(.3,1.25,.5,1),rotate .5s cubic-bezier(.3,1.25,.5,1)}
.b-hand.l{translate:96px 340px;rotate:-196deg;scale:-1 1}
.b-hand.r{translate:308px 238px;rotate:16deg;animation:b-wave 2.6s ease-in-out infinite}
@keyframes b-wave{0%,55%,100%{rotate:16deg}62%{rotate:36deg}69%{rotate:4deg}76%{rotate:36deg}83%{rotate:4deg}90%{rotate:20deg}}
.intro-wait .b-hand.r,.intro-dark .b-hand.r,.intro-rise .b-hand.r{animation:none;translate:300px 340px;rotate:196deg}
.pose-look-l .b-hand.l{translate:52px 268px;rotate:-78deg}
.pose-look-l .b-hand.r{translate:300px 340px;rotate:196deg;animation:none}
.pose-look-l .b-head{rotate:-7deg}
.pose-look-l .b-eyes{translate:-12px 2px}
.pose-look-r .b-hand.r{translate:348px 268px;rotate:78deg;animation:none}
.pose-look-r .b-head{rotate:7deg}
.pose-look-r .b-eyes{translate:12px 2px}
.pose-happy .b-hand.l{translate:86px 214px;rotate:-24deg}
.pose-happy .b-hand.r{translate:314px 214px;rotate:24deg;animation:none}
.pose-happy .b-eye-o,.pose-zap .b-eye-o{opacity:0}
.pose-happy .b-eye-h{opacity:1}
.pose-happy .b-float{animation-duration:1.1s}
.pose-zap .b-eye-x{opacity:1}
.pose-zap .b-float{animation:b-jit .12s steps(2) infinite}
.pose-zap .b-core polygon{filter:url(#bGlow) brightness(1.8)}
@keyframes b-jit{0%{translate:-3px 0}50%{translate:3px -2px}100%{translate:-2px 1px}}
.pose-portal .b-hand.l{translate:136px 318px;rotate:-58deg}
.pose-portal .b-hand.r{translate:264px 318px;rotate:58deg;animation:none}
.pose-portal .b-core polygon{filter:url(#bGlow) brightness(1.6)}
.ul-bubble{position:absolute;left:66%;top:-14%;width:max-content;max-width:min(280px,26vw);display:grid;gap:4px;padding:12px 16px 13px;border-radius:16px 16px 16px 4px;font-size:15px;line-height:1.45;font-weight:500;color:#EAF4FF;background:rgba(10,14,22,.88);border:1px solid rgba(111,224,255,.4);box-shadow:0 14px 40px rgba(0,0,0,.5),0 0 24px rgba(47,155,255,.18);backdrop-filter:blur(10px);animation:ul-pop .35s cubic-bezier(.3,1.6,.5,1) both;pointer-events:none}
.ul-bubble b{font-size:12.5px;font-weight:800;color:#7FE6FF}
@keyframes ul-pop{from{opacity:0;transform:translateY(8px) scale(.9)}}

.ul-corridor{position:absolute;inset:0;z-index:5;background-size:cover;background-position:50% 50%;opacity:0;transform:scale(1.25);pointer-events:none;transition:opacity .45s ease .45s,transform 1.4s cubic-bezier(.2,.6,.3,1) .45s}
.ul-corridor.on{opacity:1;transform:scale(1.9)}
.ul-portal{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:6}
.ul-flash{position:absolute;inset:0;z-index:7;pointer-events:none;background:#fff;opacity:var(--flash)}
.ul-stage::after{content:"";position:absolute;inset:0;z-index:8;background:#000;opacity:var(--out);pointer-events:none}

.ul-top{position:absolute;left:0;right:0;top:0;z-index:9;display:flex;justify-content:space-between;align-items:center;padding:26px 36px;pointer-events:none}
.ul-top > *{pointer-events:auto}
.ul-title{display:flex;align-items:center;gap:10px;font-family:var(--hf);font-size:15px;font-weight:700;letter-spacing:.01em;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.6)}
.ul-dot{width:9px;height:9px;border-radius:50%;background:#3BD671;box-shadow:0 0 10px #3BD671}
.ul-tools{display:flex;align-items:center;gap:10px}
.ul-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:rgba(10,11,14,.6);backdrop-filter:blur(8px);color:#fff;cursor:pointer}
.ul-icon svg{width:18px;height:18px}
.ul-menu{position:relative}
.ul-menu-btn{display:flex;align-items:center;gap:10px;height:40px;padding:0 16px;border-radius:99px;border:1px solid rgba(255,255,255,.18);background:rgba(10,11,14,.6);backdrop-filter:blur(8px);color:#fff;font:600 14px Inter,system-ui,sans-serif;cursor:pointer}
.ul-menu-btn span{width:14px;height:8px;border-top:2px solid #fff;border-bottom:2px solid #fff}
.ul-menu-list{position:absolute;right:0;top:48px;display:flex;flex-direction:column;min-width:180px;padding:8px;border-radius:16px;background:rgba(12,13,17,.94);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(12px);opacity:0;transform:translateY(-6px);pointer-events:none;transition:all .2s}
.ul-menu.open .ul-menu-list{opacity:1;transform:none;pointer-events:auto}
.ul-menu-list a{padding:10px 12px;border-radius:10px;color:#E8EEF8;text-decoration:none;font-size:14.5px;font-weight:600}
.ul-menu-list a:hover{background:rgba(255,138,42,.16)}

.ul-hint{position:absolute;left:50%;bottom:2.2%;z-index:9;transform:translateX(-50%);display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:rgba(232,238,248,.75);opacity:calc(1 - var(--open) * 3);pointer-events:none}
.ul-mouse{width:20px;height:30px;border-radius:12px;border:2px solid rgba(232,238,248,.6);position:relative}
.ul-mouse i{position:absolute;left:50%;top:6px;width:3px;height:6px;margin-left:-1.5px;border-radius:2px;background:#fff;animation:ul-wheel 1.6s ease-in-out infinite}
@keyframes ul-wheel{60%{transform:translateY(7px);opacity:0}}
.ul-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

/* phones: a screen of its own. The middle of the bridge fills the top (never wider than 4:3, so the picture is
   always fitted by its height and the pad stays at the same spot), Jenny's line sits under it, then the doors */
.ul.nr .ul-top{padding:16px 16px}
.ul.nr .ul-title{font-size:12.5px;max-width:58vw}
.ul.nr .ul-hint{display:none}
.ul-m{position:absolute;inset:0;display:flex;flex-direction:column;background:#06070a}
.ul-mscene{position:relative;flex:none;width:100%;height:max(75vw,min(112vw,calc(100svh - 400px)));overflow:hidden}
.ul-mscene .ul-pic{background-size:cover;background-position:50% 50%}
.ul-mscene::after{content:"";position:absolute;left:0;right:0;bottom:0;height:34%;background:linear-gradient(transparent,#06070a);pointer-events:none}
.ul-mscene .ul-bot-wrap{height:45%}
.ul-mscene .ul-floor{top:86%}
.ul-mline{flex:none;min-height:76px;padding:4px 18px 0;opacity:calc(1 - var(--open) * 2)}
.ul-mline p{margin:0;display:grid;gap:3px;font-size:14.5px;line-height:1.45;color:#EAF4FF;animation:ul-pop .35s cubic-bezier(.3,1.6,.5,1) both}
.ul-mline b{font-size:12px;font-weight:800;letter-spacing:.04em;color:#7FE6FF}
.ul-mdoors{flex:1;display:flex;flex-direction:column;justify-content:flex-start;gap:8px;padding:6px 16px calc(18px + env(safe-area-inset-bottom,0px));opacity:calc(1 - var(--open) * 2)}
.ul-mdoor{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:14px;min-height:56px;padding:6px 16px 6px 8px;border-radius:16px;cursor:pointer;background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.02));border:1px solid rgba(111,224,255,.18);transition:border-color .25s,box-shadow .25s,background .25s;-webkit-tap-highlight-color:transparent}
.ul-mdoor:active{background:rgba(255,138,42,.1)}
.ul-mdoor.on{border-color:#FF8A2A;box-shadow:0 0 22px rgba(255,138,42,.35);background:rgba(255,138,42,.1)}
.ul-mdoor:focus-visible{outline:2px solid #fff;outline-offset:3px}
.ul-mthumb{position:relative;flex:none;width:30px;height:44px;border-radius:6px;overflow:hidden;box-shadow:0 0 0 1px rgba(111,224,255,.3),0 0 12px rgba(47,155,255,.25)}
.ul-mthumb > span{position:absolute;inset:0}
.ul-mshut{transition:opacity .6s ease}
.ul-mdoor.opened .ul-mshut{opacity:0}
.ul-mtext{flex:1;display:grid;gap:1px;min-width:0}
.ul-mtext b{font-family:var(--hf);font-size:15px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#E8F6FF}
.ul-mtext small{font-size:13px;color:rgba(232,238,248,.62)}
.ul-mdoor.on .ul-mtext small{color:#FFB36B}
.ul-mdoor i{font-style:normal;font-size:18px;color:rgba(232,238,248,.55);transition:transform .25s,color .25s}
.ul-mdoor.on i{color:#FF8A2A;transform:translateX(4px)}
@media (prefers-reduced-motion:reduce){.ul-floor i{animation:none!important;opacity:1}.intro-done .ul-floor{animation:none}.b-float,.b-beam,.b-thrust,.b-orbit,.b-ring,.b-eye-o,.b-hand.r,.ul-ring,.ul-mouse i{animation:none!important}.ul-zoom,.ul-half,.ul-corridor{transition:none}}
`

addPropertyControls(UniverseLanding, {
    title: { type: ControlType.String, title: "Title", defaultValue: "Mragank Bhikshu · Product & Brand Designer" },
    botName: { type: ControlType.String, title: "Bot name", defaultValue: "Jenny" },
    idleLine: { type: ControlType.String, title: "Bot idle", displayTextArea: true, defaultValue: IDLE_LINE },
    zapLine: { type: ControlType.String, title: "Bot tapped", defaultValue: ZAP_LINE },
    scrollHint: { type: ControlType.String, title: "Scroll hint", defaultValue: "Scroll to enter" },
    playIntro: { type: ControlType.Boolean, title: "Jenny entrance", defaultValue: true },
    gates: {
        type: ControlType.Array,
        title: "Doors",
        maxCount: 4,
        defaultValue: DEFAULT_GATES,
        control: {
            type: ControlType.Object,
            controls: {
                name: { type: ControlType.String, title: "Name" },
                label: { type: ControlType.String, title: "Label" },
                line: { type: ControlType.String, title: "Bot line" },
                link: { type: ControlType.String, title: "Link" },
            },
        },
    },
    bridge: { type: ControlType.String, title: "Bridge", defaultValue: IMG.bridge },
    doorsOpen: { type: ControlType.String, title: "Doors open", defaultValue: IMG.doorsOpen },
    padOpen: { type: ControlType.String, title: "Pad open", defaultValue: IMG.padOpen },
    buttonsOn: { type: ControlType.String, title: "Buttons on", defaultValue: IMG.buttonsOn },
    corridor: { type: ControlType.String, title: "Corridor", defaultValue: IMG.corridor },
    panel: { type: ControlType.String, title: "Button panel", defaultValue: IMG.panel },
    headingFont: { type: ControlType.String, title: "Heading font", defaultValue: "Inter" },
    hideSiteNav: { type: ControlType.Boolean, title: "Hide site nav", defaultValue: true },
    siteNavName: { type: ControlType.String, title: "Site nav layer", defaultValue: "Navbar", hidden: (p: any) => !p.hideSiteNav },
    floorName: { type: ControlType.String, title: "Floor name", defaultValue: "MRAGANK BHIKSHU" },
    floorLine: { type: ControlType.String, title: "Floor line", defaultValue: "Product & brand designer · IIT Kharagpur" },
})
