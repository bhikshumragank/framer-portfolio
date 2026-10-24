import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import * as FramerLib from "framer"
import { useEffect, useRef, useState, type CSSProperties } from "react"

type Props = {
    photo: string
    whoText: string
    doIntro: string
    nowText: string
    nowLinkLabel: string
    nowLink: string
    stats: string
    style?: CSSProperties
}

const AREAS = [
    { name: "Product Design", color: "#8B5CF6", link: "/portfolio-2#product" },
    { name: "Brand Design", color: "#FF8A2A", link: "/portfolio-2#branding" },
    { name: "Visual Design", color: "#2F9BFF", link: "/portfolio-2#2d-animation" },
    { name: "Graphic Design", color: "#FF4F8B", link: "/portfolio-2#poster-design" },
]

// each step also moves the photo and pins a short label on it, so a step change is visible at a glance
const STEPS = [
    { n: "01", label: "Who I am", color: "#2F9BFF", chip: "Product & brand designer", pose: "scale(1.02)" },
    { n: "02", label: "What I do", color: "#8B5CF6", chip: "Four design areas", pose: "scale(1.16) translate(-3%, 5%)" },
    { n: "03", label: "Latest role", color: "#FF8A2A", chip: "Sonepar India · 2026", pose: "scale(1.1) translate(3%, -2%)" },
]

// a paragraph as words that rise in one after another whenever the step changes
const words = (text: string) =>
    (text || "").split(/(\s+)/).map((w, i) =>
        /^\s+$/.test(w) ? (
            w
        ) : (
            <span key={i} className="as-w" style={{ ["--i" as any]: Math.min(i / 2, 40) }}>
                {w}
            </span>
        )
    )

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

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
 * About Story: the photo stays put while the text beside it steps through who I am, what I do and what I'm
 * doing now as the visitor scrolls. Each step recolours the glow, moves the photo, swaps the label on it,
 * rolls a big step number and brings the words in one by one, so the change reads even out of the corner of
 * the eye. On phones it becomes a plain stack: the photo card, then one card per step.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 2400
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function AboutStory(props: Props) {
    const {
        photo = "https://framerusercontent.com/images/AjYLWj1oL1HZXhsM7gwxBOdt3A4.png",
        whoText = "Product Designer building user-centric digital products for fintech, enterprise B2B and AI-powered tools. I take features end to end, from user needs and business requirements to wireframes, high-fidelity prototypes and shipped interfaces, working closely with engineers, product managers and clients using Figma and Adobe Creative Suite.",
        doIntro = "I design across four areas, and most projects use all of them at once.",
        nowText = "Marketing & Communication Intern at Sonepar India: shipping the website's first AI chatbot, an HR hiring portal and the Sparky brand. Dual degree at IIT Kharagpur, graduating May 2027.",
        nowLinkLabel = "Read the Sparky case study",
        nowLink = "/case-study/sparky-mascot-redesign",
        stats = "100+|Projects Completed;7+|Domains;300+|Visuals",
        style,
    } = props

    const isStatic = useIsStaticRenderer()
    const go = useGo()
    const root = useRef<HTMLDivElement>(null)
    const bar = useRef<HTMLDivElement>(null)
    const [step, setStep] = useState(0)
    const [narrow, setNarrow] = useState(false)

    useEffect(() => {
        const el = root.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 760))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // when the section heading above is pinned too, the stage pins just below it instead of under it
    useEffect(() => {
        let el: HTMLElement | null = root.current
        if (!el || typeof ResizeObserver === "undefined") return
        for (let i = 0; i < 5 && el && !el.previousElementSibling; i++) el = el.parentElement
        const head = el?.previousElementSibling as HTMLElement | null
        if (!head) return
        const update = () => {
            const cs = getComputedStyle(head)
            const pinned = cs.position === "sticky"
            const top = pinned ? (parseFloat(cs.top) || 0) + head.offsetHeight + 12 : 0
            root.current?.style.setProperty("--pin", top ? top + "px" : "")
        }
        const ro = new ResizeObserver(update)
        ro.observe(head)
        update()
        return () => ro.disconnect()
    }, [])

    useEffect(() => {
        if (!narrow) return
        let el: HTMLElement | null = root.current
        for (let i = 0; i < 5 && el && !el.previousElementSibling; i++) el = el.parentElement
        const head = el?.previousElementSibling as HTMLElement | null
        if (!head || getComputedStyle(head).position !== "sticky") return
        head.style.position = "relative"
        head.style.top = "auto"
        head.style.transform = ""
        return () => {
            head.style.position = ""
            head.style.top = ""
        }
    }, [narrow])

    // scroll position picks the step; the progress line follows the scroll exactly (the browser pins the stage).
    // A pinned section heading above rides along with the stage: it stays put while the steps play, and leaves
    // with the stage when the story ends instead of hanging on and covering the photo.
    useEffect(() => {
        if (isStatic || narrow) return
        let raf = 0
        let last = -1
        let headEl: HTMLElement | null = root.current
        for (let i = 0; i < 5 && headEl && !headEl.previousElementSibling; i++) headEl = headEl.parentElement
        const head = (headEl?.previousElementSibling as HTMLElement | null) || null
        let shift = 0
        const tick = () => {
            const el = root.current
            if (head && el) {
                const st = el.querySelector(".as-stage")?.getBoundingClientRect()
                const hr = head.getBoundingClientRect()
                if (st && getComputedStyle(head).position === "sticky") {
                    const natural = hr.top - shift
                    const want = st.top - 12 - hr.height
                    const next = Math.min(0, want - natural)
                    if (Math.abs(next - shift) > 0.5) {
                        shift = next
                        head.style.transform = shift ? `translateY(${shift.toFixed(1)}px)` : ""
                    }
                }
            }
            if (el) {
                const r = el.getBoundingClientRect()
                const travel = Math.max(1, r.height - window.innerHeight)
                const p = clamp01(-r.top / travel)
                const s = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length))
                if (s !== last) setStep((last = s))
                if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => {
            cancelAnimationFrame(raf)
            if (head) head.style.transform = ""
        }
    }, [isStatic, narrow])

    const jump = (i: number) => {
        const el = root.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const travel = Math.max(1, r.height - window.innerHeight)
        window.scrollTo({ top: window.scrollY + r.top + travel * ((i + 0.5) / STEPS.length), behavior: "smooth" })
    }

    const statList = (stats || "")
        .split(";")
        .map((x) => x.trim())
        .filter(Boolean)
        .map((x) => {
            const [v, ...l] = x.split("|")
            return { v: v.trim(), l: l.join("|").trim() }
        })

    const color = STEPS[step].color

    const areaLinks = (focusable: boolean) => (
        <div className="as-areas">
            {AREAS.map((a) => (
                <a
                    key={a.name}
                    href={a.link}
                    style={{ ["--ac" as any]: a.color }}
                    tabIndex={focusable ? 0 : -1}
                    onClick={(e) => {
                        e.preventDefault()
                        go(a.link)
                    }}
                >
                    {a.name}
                    <i>→</i>
                </a>
            ))}
        </div>
    )
    const nowLinkEl = (focusable: boolean) =>
        nowLink && (
            <a
                className="as-link"
                href={nowLink}
                tabIndex={focusable ? 0 : -1}
                onClick={(e) => {
                    e.preventDefault()
                    go(nowLink)
                }}
            >
                {nowLinkLabel} <i>→</i>
            </a>
        )

    // phones: the photo card with name and numbers, then the three steps as cards, all in the normal page flow
    if (narrow)
        return (
            <div ref={root} className="as nr" style={{ ...style, height: "auto" }}>
                <style>{CSS}</style>
                <div className="as-m">
                    <div className="as-mhero">
                        {photo && <img src={photo} alt="Mragank Bhikshu" draggable={false} />}
                        <div className="as-badge">
                            <span className="as-dot" />
                            <div>
                                <b>Mragank Bhikshu</b>
                                <span>Product & Brand Designer · IIT Kharagpur</span>
                            </div>
                        </div>
                    </div>
                    {statList.length > 0 && (
                        <div className="as-mstats">
                            {statList.map((x, i) => (
                                <div key={i}>
                                    <b>{x.v}</b>
                                    <span>{x.l}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {STEPS.map((x, i) => (
                        <section key={x.n} className="as-mcard" style={{ ["--c" as any]: x.color }}>
                            <span className="as-mnum" aria-hidden="true">
                                {x.n}
                            </span>
                            <span className="as-mlabel">
                                <i>{x.n}</i>
                                {x.label}
                            </span>
                            {i === 0 && (
                                <>
                                    <h3>Who I am</h3>
                                    <p>{whoText}</p>
                                </>
                            )}
                            {i === 1 && (
                                <>
                                    <h3>What I do</h3>
                                    <p>{doIntro}</p>
                                    {areaLinks(true)}
                                </>
                            )}
                            {i === 2 && (
                                <>
                                    <h3>
                                        Latest role <span className="as-live">Open to internships</span>
                                    </h3>
                                    <p>{nowText}</p>
                                    {nowLinkEl(true)}
                                </>
                            )}
                        </section>
                    ))}
                </div>
            </div>
        )

    return (
        <div ref={root} className="as" style={{ ...style, height: "212vh", ["--c" as any]: color }}>
            <style>{CSS}</style>
            <div className="as-stage">
                <div className="as-grid">
                    <div className="as-photo">
                        <div className="as-card">
                            {photo && <img src={photo} alt="Mragank Bhikshu" draggable={false} style={{ transform: STEPS[step].pose }} />}
                            <span className="as-sweep" key={"sw" + step} />
                            <span className="as-chip" key={"ch" + step}>
                                <i>{STEPS[step].n}</i>
                                {STEPS[step].chip}
                            </span>
                            <div className="as-badge">
                                <span className="as-dot" />
                                <div>
                                    <b>Mragank Bhikshu</b>
                                    <span>Product & Brand Designer · IIT Kharagpur</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="as-right">
                        <span className="as-num" key={"n" + step} aria-hidden="true">
                            {STEPS[step].n}
                        </span>
                        <div className="as-steps">
                            <div className="as-track">
                                <div className="as-fill" ref={bar} />
                            </div>
                            {STEPS.map((s, i) => (
                                <button key={s.n} className={"as-step" + (i === step ? " on" : i < step ? " done" : "")} style={{ ["--sc" as any]: s.color }} onClick={() => jump(i)}>
                                    <span>{s.n}</span>
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <div className="as-panes">
                            <section className={"as-pane" + (step === 0 ? " on" : "")} aria-hidden={step !== 0}>
                                <h3>Who I am</h3>
                                <p key={"p0" + step}>{step === 0 ? words(whoText) : whoText}</p>
                            </section>
                            <section className={"as-pane" + (step === 1 ? " on" : "")} aria-hidden={step !== 1}>
                                <h3>What I do</h3>
                                <p key={"p1" + step}>{step === 1 ? words(doIntro) : doIntro}</p>
                                {areaLinks(step === 1)}
                            </section>
                            <section className={"as-pane" + (step === 2 ? " on" : "")} aria-hidden={step !== 2}>
                                <h3>
                                    Latest role <span className="as-live">Open to internships</span>
                                </h3>
                                <p key={"p2" + step}>{step === 2 ? words(nowText) : nowText}</p>
                                {nowLinkEl(step === 2)}
                            </section>
                        </div>

                        <div className="as-next" aria-hidden="true">
                            <span className="as-mouse">
                                <i />
                            </span>
                            {step < STEPS.length - 1 ? `Keep scrolling · ${STEPS[step + 1].label} next` : "That's me. Scroll on for the work"}
                        </div>

                        {statList.length > 0 && (
                            <div className="as-stats">
                                {statList.map((s, i) => (
                                    <div key={i}>
                                        <b>{s.v}</b>
                                        <span>{s.l}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const CSS = `
.as{position:relative;width:100%;height:100%;color:#fff;font-family:"Plus Jakarta Sans",Inter,system-ui,sans-serif;--c:#2F9BFF}
.as *{box-sizing:border-box}
/* pinned below the 90px navigation bar (or below the pinned heading, see --pin); content sits at the top so it stays close to the heading */
.as-stage{position:sticky;top:var(--pin,96px);height:calc(100vh - var(--pin,96px));display:flex;align-items:flex-start;padding:0 0 24px}
.as-grid{width:100%;display:grid;grid-template-columns:auto minmax(0,1fr);gap:56px;align-items:start}
.as-photo{position:relative;height:min(calc(100vh - var(--pin,96px) - 40px),500px);aspect-ratio:.74}
.as-photo::before{content:"";position:absolute;left:50%;top:50%;width:150%;aspect-ratio:1;translate:-50% -50%;border-radius:50%;background:radial-gradient(closest-side,color-mix(in srgb,var(--c) 48%,transparent),color-mix(in srgb,var(--c) 14%,transparent) 55%,transparent 72%);transition:background .8s ease;pointer-events:none}
.as-card{position:relative;width:100%;height:100%;border-radius:24px;overflow:hidden;background:#151a24;box-shadow:0 0 0 1px color-mix(in srgb,var(--c) 40%,rgba(255,255,255,.08)),0 24px 60px rgba(0,0,0,.55);transition:box-shadow .8s ease}
.as-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:50% 35%;transition:transform 1.1s cubic-bezier(.2,.7,.2,1)}
/* a band of light crosses the photo on every step change, and the label on the photo is swapped */
.as-sweep{position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(105deg,transparent 35%,color-mix(in srgb,var(--c) 55%,#fff) 50%,transparent 65%);mix-blend-mode:screen;opacity:0;animation:as-sweep 1s ease-out}
@keyframes as-sweep{0%{opacity:.75;transform:translateX(-100%)}100%{opacity:0;transform:translateX(100%)}}
.as-chip{position:absolute;left:14px;top:14px;z-index:2;display:inline-flex;align-items:center;gap:8px;padding:7px 12px 7px 8px;border-radius:99px;font-size:12.5px;font-weight:700;color:#fff;background:rgba(8,12,22,.7);backdrop-filter:blur(10px);border:1px solid color-mix(in srgb,var(--c) 60%,transparent);box-shadow:0 0 20px color-mix(in srgb,var(--c) 35%,transparent);animation:as-chip .6s cubic-bezier(.3,1.4,.5,1) both}
.as-chip i{font-style:normal;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;font-size:10.5px;background:var(--c);color:#06090f}
@keyframes as-chip{from{opacity:0;transform:translateY(-10px) scale(.9)}}
/* the big step number behind the text rolls up each time */
.as-num{position:absolute;right:0;top:-34px;z-index:0;font-size:150px;line-height:1;font-weight:800;letter-spacing:-.06em;color:transparent;-webkit-text-stroke:1.5px color-mix(in srgb,var(--c) 70%,transparent);opacity:.5;pointer-events:none;animation:as-num .7s cubic-bezier(.2,.8,.2,1) both}
@keyframes as-num{from{opacity:0;transform:translateY(40px)}}
.as-w{display:inline-block;animation:as-w .55s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i) * 18ms)}
@keyframes as-w{from{opacity:0;filter:blur(6px);transform:translateY(8px)}}
.as-next{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600;color:rgba(255,255,255,.55)}
.as-mouse{position:relative;width:16px;height:24px;border-radius:10px;border:1.5px solid rgba(255,255,255,.45)}
.as-mouse i{position:absolute;left:50%;top:5px;width:2px;height:5px;margin-left:-1px;border-radius:2px;background:var(--c);animation:as-wheel 1.6s ease-in-out infinite}
@keyframes as-wheel{60%{transform:translateY(6px);opacity:0}}
.as-card::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 60%,rgba(5,8,15,.9));pointer-events:none}
.as-badge{position:absolute;left:14px;right:14px;bottom:14px;z-index:1;display:flex;align-items:center;gap:12px;padding:11px 13px;border-radius:14px;background:rgba(8,12,22,.62);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.12)}
.as-badge b{display:block;font-size:14.5px;font-weight:700}
.as-badge span{display:block;margin-top:2px;font-size:12px;color:rgba(255,255,255,.7)}
.as-dot{flex:none;width:9px;height:9px;border-radius:50%;background:#3BD671;box-shadow:0 0 10px #3BD671;animation:as-pulse 1.8s ease-in-out infinite}
@keyframes as-pulse{50%{opacity:.35}}
.as-right{position:relative;min-width:0;display:flex;flex-direction:column;gap:26px}
.as-right > :not(.as-num){position:relative;z-index:1}
/* step tabs with a progress bar underneath */
.as-steps{position:relative;display:flex;flex-wrap:wrap;gap:8px;padding-bottom:14px}
.as-track{position:absolute;left:0;right:0;bottom:0;height:2px;border-radius:2px;background:rgba(255,255,255,.1);overflow:hidden}
.as-fill{position:absolute;inset:0;border-radius:2px;transform-origin:0 50%;transform:scaleX(0);background:var(--c);box-shadow:0 0 10px var(--c);transition:background .6s}
.as-step{all:unset;display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:99px;font-size:13.5px;font-weight:600;color:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.1);cursor:pointer;transition:color .4s,background .4s,border-color .4s}
.as-step span{font-variant-numeric:tabular-nums;font-size:11.5px;font-weight:700;color:rgba(255,255,255,.35);transition:color .4s}
.as-step:hover{color:rgba(255,255,255,.85)}
.as-step.done{color:rgba(255,255,255,.7)}
.as-step.on{color:#fff;background:color-mix(in srgb,var(--sc) 16%,transparent);border-color:color-mix(in srgb,var(--sc) 60%,transparent)}
.as-step.on span{color:var(--sc)}
.as-step:focus-visible{outline:2px solid #fff;outline-offset:3px}
/* panes share one grid cell, so the block is exactly as tall as the longest pane */
.as-panes{display:grid}
.as-pane{grid-area:1/1;opacity:0;transform:translateY(16px);transition:opacity .45s ease,transform .55s cubic-bezier(.2,.7,.2,1);pointer-events:none;visibility:hidden}
.as-pane.on{opacity:1;transform:none;pointer-events:auto;visibility:visible}
.as-pane h3{display:flex;align-items:center;gap:12px;margin:0 0 12px;font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-.02em;color:var(--c);transition:color .6s}
.as-pane p{margin:0;font-size:17px;line-height:1.7;color:rgba(255,255,255,.85);max-width:600px}
.as-live{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#FF8A2A;border:1px solid rgba(255,138,42,.5);background:rgba(255,138,42,.1)}
.as-live::before{content:"";width:6px;height:6px;border-radius:50%;background:#FF8A2A;box-shadow:0 0 8px #FF8A2A;animation:as-pulse 1.4s ease-in-out infinite}
.as-areas{margin-top:18px;display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:560px}
.as-areas a{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-radius:14px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;background:color-mix(in srgb,var(--ac) 12%,rgba(255,255,255,.02));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--ac) 55%,transparent);transition:transform .25s,box-shadow .25s}
.as-areas a i{font-style:normal;color:var(--ac);transition:transform .25s}
.as-areas a:hover{transform:translateY(-2px);box-shadow:inset 0 0 0 1.5px var(--ac),0 0 24px color-mix(in srgb,var(--ac) 40%,transparent)}
.as-areas a:hover i{transform:translateX(4px)}
.as-link{display:inline-flex;align-items:center;gap:8px;margin-top:18px;font-size:15px;font-weight:700;color:#FF8A2A;text-decoration:none}
.as-link i{font-style:normal;transition:transform .25s}
.as-link:hover i{transform:translateX(4px)}
.as-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;max-width:600px}
.as-stats div{padding:14px 16px;border-radius:14px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08)}
.as-stats b{display:block;font-size:26px;font-weight:800;letter-spacing:-.02em;color:#2F9BFF}
.as-stats span{display:block;margin-top:2px;font-size:13px;color:rgba(255,255,255,.7)}
/* phones: the photo card, a row of numbers, then one card per step */
/* the Home container already pads each side by 30px; the cards reach out to a 16px gutter */
.as-m{display:grid;gap:14px;padding:8px 0 28px;margin-inline:-14px}
.as-mhero{position:relative;width:100%;aspect-ratio:4/5;max-height:440px;border-radius:24px;overflow:hidden;background:#151a24;box-shadow:0 0 0 1px rgba(47,155,255,.35),0 24px 60px rgba(0,0,0,.55)}
.as-mhero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 30%}
.as-mhero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(5,8,15,.92));pointer-events:none}
.as-mstats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.as-mstats div{padding:12px 10px;border-radius:14px;text-align:center;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08)}
.as-mstats b{display:block;font-size:20px;font-weight:800;letter-spacing:-.02em;color:#2F9BFF}
.as-mstats span{display:block;margin-top:2px;font-size:11.5px;line-height:1.3;color:rgba(255,255,255,.65)}
.as-mcard{position:relative;overflow:hidden;padding:20px 18px 22px;border-radius:20px;background:linear-gradient(160deg,color-mix(in srgb,var(--c) 12%,#0d111a),#0b0e15 70%);border:1px solid color-mix(in srgb,var(--c) 35%,rgba(255,255,255,.06))}
.as-mnum{position:absolute;right:10px;top:-8px;font-size:84px;line-height:1;font-weight:800;letter-spacing:-.06em;color:transparent;-webkit-text-stroke:1.2px color-mix(in srgb,var(--c) 70%,transparent);opacity:.45;pointer-events:none}
.as-mlabel{position:relative;display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700;color:rgba(255,255,255,.75)}
.as-mlabel i{font-style:normal;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;font-size:10.5px;background:var(--c);color:#06090f}
.as-mcard h3{position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:12px 0 8px;font-size:22px;line-height:1.2;font-weight:800;letter-spacing:-.02em;color:var(--c)}
.as-mcard p{position:relative;margin:0;font-size:15px;line-height:1.65;color:rgba(255,255,255,.85)}
.as-mcard .as-areas{gap:8px;margin-top:16px}
.as-mcard .as-areas a{font-size:13.5px;padding:12px 12px}
.as-mcard .as-link{margin-top:14px}
@media (prefers-reduced-motion:reduce){.as-pane,.as-photo::before,.as-card,.as-fill,.as-card img{transition:none}.as-dot,.as-live::before,.as-sweep,.as-chip,.as-num,.as-w,.as-mouse i{animation:none}}
`

addPropertyControls(AboutStory, {
    photo: { type: ControlType.String, title: "Photo URL", defaultValue: "https://framerusercontent.com/images/AjYLWj1oL1HZXhsM7gwxBOdt3A4.png" },
    whoText: {
        type: ControlType.String,
        title: "Who I am",
        displayTextArea: true,
        defaultValue:
            "Product Designer building user-centric digital products for fintech, enterprise B2B and AI-powered tools. I take features end to end, from user needs and business requirements to wireframes, high-fidelity prototypes and shipped interfaces, working closely with engineers, product managers and clients using Figma and Adobe Creative Suite.",
    },
    doIntro: { type: ControlType.String, title: "What I do", displayTextArea: true, defaultValue: "I design across four areas, and most projects use all of them at once." },
    nowText: {
        type: ControlType.String,
        title: "Doing now",
        displayTextArea: true,
        defaultValue:
            "Marketing & Communication Intern at Sonepar India: shipping the website's first AI chatbot, an HR hiring portal and the Sparky brand. Dual degree at IIT Kharagpur, graduating May 2027.",
    },
    nowLinkLabel: { type: ControlType.String, title: "Now link label", defaultValue: "Read the Sparky case study" },
    nowLink: { type: ControlType.String, title: "Now link", defaultValue: "/case-study/sparky-mascot-redesign" },
    stats: { type: ControlType.String, title: "Stats", description: "value|label; value|label", defaultValue: "100+|Projects Completed;7+|Domains;300+|Visuals" },
})
