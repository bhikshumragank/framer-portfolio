import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useEffect, useRef, useState, type CSSProperties } from "react"

type Props = {
    line: string
    minDuration: number
    oncePerVisit: boolean
    style?: CSSProperties
}

const KEY = "mira-ship-docked"
// how long the ship takes to fly in and brake (ms)
const ARRIVE = 1150

// fast in, a hard stop that rocks a little past the mark, then settles
const brake = (t: number) => {
    const s = 2.1
    const u = t - 1
    return 1 + (s + 1) * u * u * u + s * u * u
}

/**
 * Ship Loader: a spaceship streaks in at warp speed with Jenny in the cockpit, brakes hard in the middle of the
 * screen and waits while the page loads, then beams Jenny down; the landing below picks up with Jenny rising
 * out of the floor. Shown once per visit.
 *
 * @framerIntrinsicWidth 400
 * @framerIntrinsicHeight 120
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function ShipLoader(props: Props) {
    const { line: lineProp = "Jenny is docking…", minDuration = 2.6, oncePerVisit = true, style } = props
    // a line saved from the old Sparky loader falls back to the ship's own
    const line = !lineProp || /charging|sparky|mira/i.test(lineProp) ? "Jenny is docking…" : lineProp
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const [show, setShow] = useState(() => {
        if (onCanvas || typeof window === "undefined") return false
        try {
            if (oncePerVisit && sessionStorage.getItem(KEY)) return false
        } catch (e) {}
        // the landing waits for this before Jenny rises
        ;(window as any).__mbLoader = "active"
        return true
    })
    const [stage, setStage] = useState<"fly" | "docked" | "beam" | "done">("fly")
    const [pct, setPct] = useState(0)
    const root = useRef<HTMLDivElement>(null)
    const ship = useRef<HTMLDivElement>(null)
    const cv = useRef<HTMLCanvasElement>(null)

    const release = () => {
        ;(window as any).__mbLoader = "done"
        window.dispatchEvent(new Event("mb-loader-done"))
        try {
            sessionStorage.setItem(KEY, "1")
        } catch (e) {}
    }

    useEffect(() => {
        if (!show) return
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        const html = document.documentElement
        const prevOverflow = html.style.overflow
        html.style.overflow = "hidden"
        let loaded = document.readyState === "complete"
        const onLoad = () => (loaded = true)
        window.addEventListener("load", onLoad)

        const c = cv.current!
        const x = c.getContext("2d")!
        let W = 0,
            H = 0,
            dpr = 1
        type Star = { x: number; y: number; z: number }
        let stars: Star[] = []
        const resize = () => {
            dpr = Math.min(2, window.devicePixelRatio || 1)
            W = window.innerWidth
            H = window.innerHeight
            c.width = Math.round(W * dpr)
            c.height = Math.round(H * dpr)
            stars = Array.from({ length: Math.min(260, Math.round((W * H) / 5000)) }, () => ({ x: Math.random() * W, y: Math.random() * H, z: 0.2 + Math.random() * 0.8 }))
        }
        resize()
        window.addEventListener("resize", resize)

        const t0 = performance.now()
        const minMs = (reduce ? 0.8 : minDuration) * 1000
        let raf = 0
        let last = t0
        let lastX = -1
        let docked = false
        let finished = false
        const finish = () => {
            if (finished) return
            finished = true
            setPct(100)
            setStage("beam")
            setTimeout(() => {
                setStage("done")
                html.style.overflow = prevOverflow
                release()
            }, reduce ? 200 : 750)
            setTimeout(() => setShow(false), reduce ? 600 : 1500)
        }
        const tick = (now: number) => {
            const el = now - t0
            const dt = Math.min(0.05, (now - last) / 1000)
            last = now
            // the ship: from well off the left edge to the middle
            const k = reduce ? 1 : Math.min(1, el / ARRIVE)
            const pos = brake(k)
            const off = (1 - pos) * -(W * 0.5 + 420)
            if (ship.current) ship.current.style.transform = `translateX(${off.toFixed(1)}px)`
            // speed of travel drives the star streaks and the engine flame
            const v = lastX < 0 ? 1 : Math.abs(off - lastX) / Math.max(0.001, dt) / (W * 1.4)
            lastX = off
            const speed = Math.min(1, v) * (k < 1 ? 1 : 0) + 0.025
            root.current?.style.setProperty("--thrust", Math.min(1, speed * 1.2).toFixed(3))
            if (!docked && k >= 1) {
                docked = true
                setStage("docked")
            }
            x.setTransform(dpr, 0, 0, dpr, 0, 0)
            x.clearRect(0, 0, W, H)
            x.lineCap = "round"
            for (const s of stars) {
                s.x -= speed * s.z * 2600 * dt
                if (s.x < -60) {
                    s.x = W + Math.random() * 60
                    s.y = Math.random() * H
                }
                const len = 2 + speed * s.z * 220
                x.globalAlpha = 0.35 + s.z * 0.6
                x.strokeStyle = s.z > 0.85 ? "#FFD9B0" : "#DCEBFF"
                x.lineWidth = 0.6 + s.z * 1.2
                x.beginPath()
                x.moveTo(s.x, s.y)
                x.lineTo(s.x + len, s.y)
                x.stroke()
            }
            const ready = loaded && document.fonts?.status !== "loading"
            setPct(Math.round(Math.min(ready ? 1 : 0.92, el / minMs) * 100))
            if ((ready && el >= minMs && docked) || el >= 7000) finish()
            if (!finished || el < minMs + 2000) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener("load", onLoad)
            window.removeEventListener("resize", resize)
            html.style.overflow = prevOverflow
        }
    }, [show])

    if (onCanvas)
        return (
            <div style={{ ...style, display: "grid", placeItems: "center", background: "#05080F", color: "#9CCBFF", font: "600 13px Inter, sans-serif", borderRadius: 12, border: "1px dashed #2F9BFF" }}>
                Ship loader (shows on page load)
            </div>
        )
    if (!show) return null

    const skip = () => {
        setStage("done")
        document.documentElement.style.overflow = ""
        release()
        setTimeout(() => setShow(false), 500)
    }

    return (
        <div className={"sl sl-" + stage} ref={root} role="status" aria-live="polite" aria-label={`${line} ${pct}%`}>
            <style>{CSS}</style>
            <canvas className="sl-warp" ref={cv} />
            <div className="sl-glow" />
            <div className="sl-shiprow">
                <div className="sl-ship" ref={ship}>
                    <span className="sl-shock" />
                    <div className="sl-rock">
                        <div className="sl-hover">
                            <Ship />
                        </div>
                    </div>
                    <span className="sl-ray" />
                </div>
            </div>
            <div className="sl-text">
                <span>{line}</span>
                <b>{pct}%</b>
            </div>
            <button className="sl-skip" onClick={skip}>
                Skip
            </button>
        </div>
    )
}

// the shuttle, side on, nose to the right, with Jenny's head in the glass canopy
function Ship() {
    return (
        <svg className="sl-svg" viewBox="0 0 640 260" aria-hidden="true">
            <defs>
                <linearGradient id="slHull" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#F4F7FB" />
                    <stop offset=".5" stopColor="#C9D1DC" />
                    <stop offset="1" stopColor="#7C8798" />
                </linearGradient>
                <linearGradient id="slDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#2A303B" />
                    <stop offset="1" stopColor="#12161D" />
                </linearGradient>
                <linearGradient id="slGlass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#7FC4FF" stopOpacity=".35" />
                    <stop offset="1" stopColor="#0A1A33" stopOpacity=".55" />
                </linearGradient>
                <linearGradient id="slFlame" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0" stopColor="#E8FBFF" />
                    <stop offset=".25" stopColor="#7FE6FF" />
                    <stop offset="1" stopColor="#2F9BFF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="slShell" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FAFCFF" />
                    <stop offset="1" stopColor="#AEB8C7" />
                </linearGradient>
                <clipPath id="slCanopy">
                    <path d="M282 112 C292 50 408 44 430 108 Z" />
                </clipPath>
                <filter id="slBlur" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" />
                </filter>
            </defs>

            {/* engine flames, longer the faster the ship is going */}
            <g className="sl-flames">
                <polygon points="58,120 -200,136 58,152" fill="url(#slFlame)" filter="url(#slBlur)" />
                <polygon points="58,124 -120,136 58,148" fill="url(#slFlame)" />
                <polygon points="62,156 -140,166 62,176" fill="url(#slFlame)" opacity=".8" />
            </g>

            {/* tail fin and lower wing */}
            <path d="M128 100 L92 34 L124 34 L188 102 Z" fill="url(#slDark)" />
            <path d="M96 36 L120 36" stroke="#FF8A2A" strokeWidth="3" strokeLinecap="round" />
            <path d="M300 160 L176 238 L128 238 L206 166 Z" fill="url(#slDark)" />
            <path d="M176 238 L300 160" stroke="#FF8A2A" strokeWidth="3" strokeLinecap="round" />

            {/* nozzles */}
            <rect x="44" y="114" width="22" height="44" rx="6" fill="#1a1f28" />
            <rect x="48" y="152" width="20" height="28" rx="6" fill="#1a1f28" />

            {/* hull */}
            <path d="M612 140 C584 112 494 100 420 104 C340 108 260 104 180 100 L82 96 Q60 98 58 118 L58 162 Q60 182 82 184 L190 188 C320 194 494 186 562 168 C592 160 610 150 612 140 Z" fill="url(#slHull)" />
            <path d="M82 184 L190 188 C320 194 494 186 562 168 C592 160 610 150 612 140 C540 168 330 176 82 168 Z" fill="#8792A5" opacity=".55" />
            <path d="M120 148 L540 150" stroke="#FF8A2A" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M120 148 L540 150" stroke="#FFB36B" strokeWidth="9" strokeLinecap="round" opacity=".35" filter="url(#slBlur)" />
            {[460, 486, 512].map((cx) => (
                <circle key={cx} cx={cx} cy="128" r="5" fill="#7FE6FF" />
            ))}
            <circle cx="604" cy="140" r="4" fill="#BFF3FF" />
            <path d="M200 112 L400 114" stroke="#9AA5B6" strokeWidth="2" opacity=".6" />

            {/* Jenny in the cockpit */}
            <g clipPath="url(#slCanopy)">
                <rect x="270" y="40" width="170" height="80" fill="#0A1426" />
                <g transform="translate(352 86) scale(.36) translate(-200 -130)">
                    <circle cx="103" cy="132" r="18" fill="#131a26" stroke="#C9D1DC" strokeWidth="4" />
                    <circle cx="103" cy="132" r="7" fill="#FF8A2A" />
                    <circle cx="297" cy="132" r="18" fill="#131a26" stroke="#C9D1DC" strokeWidth="4" />
                    <circle cx="297" cy="132" r="7" fill="#FF8A2A" />
                    <rect x="105" y="52" width="190" height="158" rx="74" fill="url(#slShell)" />
                    <rect x="123" y="90" width="154" height="86" rx="43" fill="#06090f" />
                    <g className="sl-eyes">
                        <rect x="158" y="114" width="20" height="36" rx="10" fill="#8EEBFF" />
                        <rect x="222" y="114" width="20" height="36" rx="10" fill="#8EEBFF" />
                    </g>
                </g>
                <g className="sl-wave">
                    <path d="M-9 -6 Q-10 -17 -7 -22 Q-5 -27 0 -27 Q5 -27 7 -22 Q10 -17 9 -6 Q8 -3 0 -3 Q-8 -3 -9 -6Z" fill="url(#slShell)" />
                </g>
            </g>
            <path d="M282 112 C292 50 408 44 430 108 Z" fill="url(#slGlass)" stroke="#BFE0FF" strokeWidth="2.5" />
            <path d="M304 84 Q322 62 352 58" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" />
        </svg>
    )
}

const CSS = `
.sl{--thrust:1;position:fixed;inset:0;z-index:2147483000;background:radial-gradient(80% 70% at 50% 50%,#0B1530 0%,#03050C 75%);color:#E8EEF8;font-family:Inter,system-ui,sans-serif;overflow:hidden;transition:opacity .7s ease}
.sl *{box-sizing:border-box}
.sl-warp{position:absolute;inset:0;width:100%;height:100%}
.sl-glow{position:absolute;left:50%;top:48%;width:70vmin;height:40vmin;translate:-50% -50%;background:radial-gradient(closest-side,rgba(255,138,42,.14),transparent);pointer-events:none}
.sl-shiprow{position:absolute;left:0;right:0;top:46%;height:0;display:flex;justify-content:center;align-items:flex-start}
.sl-ship{position:relative;width:min(72vw,600px);aspect-ratio:640/260;translate:0 -50%;will-change:transform}
.sl-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.sl-flames{transform-box:view-box;transform-origin:62px 140px;scale:calc(.25 + var(--thrust) * .75) 1;opacity:calc(.55 + var(--thrust) * .45);animation:sl-flick .08s steps(2) infinite}
@keyframes sl-flick{50%{opacity:.75}}
.sl-rock{position:absolute;inset:0;transform-origin:60% 60%}
.sl-docked .sl-rock,.sl-beam .sl-rock{animation:sl-jolt .7s cubic-bezier(.3,1.5,.5,1)}
@keyframes sl-jolt{0%{rotate:0deg}25%{rotate:-5deg;translate:6px 4px}55%{rotate:2.5deg}80%{rotate:-1deg}100%{rotate:0deg}}
.sl-hover{position:absolute;inset:0}
.sl-docked .sl-hover,.sl-beam .sl-hover{animation:sl-bob 2.2s ease-in-out .6s infinite}
@keyframes sl-bob{50%{translate:0 -8px}}
.sl-shock{position:absolute;left:58%;top:52%;width:30px;aspect-ratio:1;translate:-50% -50%;border-radius:50%;border:2px solid #9fe8ff;opacity:0;pointer-events:none}
.sl-docked .sl-shock{animation:sl-shock .8s ease-out}
@keyframes sl-shock{0%{opacity:.9;scale:1}100%{opacity:0;scale:16}}
.sl-eyes{transform-box:fill-box;transform-origin:center;animation:sl-blink 3.2s infinite}
@keyframes sl-blink{0%,90%,100%{scale:1 1}94%{scale:1 .1}}
.sl-wave{translate:396px 98px;rotate:150deg;transition:rotate .4s,translate .4s}
.sl-docked .sl-wave{translate:396px 84px;rotate:20deg;animation:sl-wave 1.4s ease-in-out .5s infinite}
@keyframes sl-wave{0%,100%{rotate:20deg}50%{rotate:-15deg}}
.sl-ray{position:absolute;left:56%;top:68%;width:16%;height:0;translate:-50% 0;background:linear-gradient(180deg,rgba(191,243,255,.95),rgba(127,230,255,.55) 40%,rgba(47,155,255,0));clip-path:polygon(35% 0,65% 0,100% 100%,0 100%);filter:drop-shadow(0 0 18px #7FE6FF);transition:height .45s ease-in}
.sl-beam .sl-ray,.sl-done .sl-ray{height:120vh}
.sl-done{opacity:0;pointer-events:none}
.sl-text{position:absolute;left:50%;top:calc(46% + min(22vw,150px));translate:-50% 0;display:flex;gap:12px;align-items:baseline;white-space:nowrap;font-size:15px;font-weight:600;color:#CFE0F5;transition:opacity .3s}
.sl-text b{font-size:22px;color:#fff;font-variant-numeric:tabular-nums;text-shadow:0 0 14px #2F9BFF}
.sl-beam .sl-text,.sl-done .sl-text{opacity:0}
.sl-skip{position:absolute;right:24px;bottom:24px;padding:9px 16px;border-radius:99px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.05);color:#CFE0F5;font:600 13px Inter,system-ui,sans-serif;cursor:pointer}
.sl-skip:hover{color:#fff;border-color:#2F9BFF}
.sl-skip:focus-visible{outline:2px solid #fff;outline-offset:2px}
@media (max-width:640px){.sl-ship{width:86vw}.sl-text{font-size:13px;top:calc(46% + 30vw)}}
@media (prefers-reduced-motion:reduce){.sl-flames,.sl-eyes,.sl-hover,.sl-rock,.sl-wave{animation:none!important}}
`

addPropertyControls(ShipLoader, {
    line: { type: ControlType.String, title: "Line", defaultValue: "Jenny is docking…" },
    minDuration: { type: ControlType.Number, title: "Min seconds", min: 0.8, max: 6, step: 0.1, defaultValue: 2.6 },
    oncePerVisit: { type: ControlType.Boolean, title: "Once per visit", defaultValue: true },
})
