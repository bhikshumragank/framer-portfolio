import { addPropertyControls, ControlType, RenderTarget } from "framer"
import * as FramerLib from "framer"
import { useEffect, useRef, useState, type CSSProperties } from "react"

type Props = {
    heading: string
    email: string
    phone: string
    linkedin: string
    resume: string
    contactLink: string
    wordmark: string
    style?: CSSProperties
}

const LINKS = [
    ["Home", "/"],
    ["About me", "/about-me"],
    ["Portfolio", "/portfolio-2"],
    ["Case studies", "/case-studies"],
    ["Contact", "/contact-us"],
]

// Framer switches pages through its router (in preview and on the live site); a plain URL change breaks in preview
function useGo() {
    // useRouter isn't in Framer's published types, so it is looked up at runtime; links still work without it
    const router = ((FramerLib as any).useRouter?.() ?? null) as any
    return (path: string) => {
        if (/^(https?:|mailto:|tel:)/.test(path)) return void window.open(path, path.startsWith("http") ? "_blank" : "_self", "noopener")
        const [p, hash] = path.split("#")
        const routes = router?.routes || {}
        const id = Object.keys(routes).find((k) => routes[k]?.path === p)
        if (id && typeof router?.navigate === "function") router.navigate(id, hash || "")
        else if (typeof window !== "undefined") window.location.href = path
    }
}

/**
 * Site Footer: the end of the transmission. A call to send a signal, the ways to reach me as console readouts
 * (the email copies on click), and a giant outlined wordmark that lights up wherever the cursor passes.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 720
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function SiteFooter(props: Props) {
    const {
        heading = "Have a project in mind? Send a signal.",
        email = "mragankbhikshu@gmail.com",
        phone = "7500953738",
        linkedin = "https://www.linkedin.com/in/mragankbhikshu/",
        resume = "https://drive.google.com/file/d/1K-UrDUZy-X1NwdQBk0H66urqTp689yEr/view?usp=drive_link",
        contactLink = "/contact-us",
        wordmark = "BHIKSHU",
        style,
    } = props
    const go = useGo()
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const mark = useRef<HTMLDivElement>(null)
    const [copied, setCopied] = useState(false)
    const [time, setTime] = useState("")
    const [narrow, setNarrow] = useState(false)
    const root = useRef<HTMLElement>(null)

    useEffect(() => {
        const el = root.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 760))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // local time in Kharagpur, so visitors know when a reply is likely
    useEffect(() => {
        if (onCanvas) return
        const tick = () => {
            try {
                setTime(new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).format(new Date()))
            } catch (e) {}
        }
        tick()
        const t = setInterval(tick, 30000)
        return () => clearInterval(t)
    }, [onCanvas])

    // the wordmark's light follows the pointer
    const move = (e: React.PointerEvent) => {
        const el = mark.current
        if (!el) return
        const r = el.getBoundingClientRect()
        el.style.setProperty("--x", ((e.clientX - r.left) / r.width) * 100 + "%")
        el.style.setProperty("--y", ((e.clientY - r.top) / r.height) * 100 + "%")
        el.style.setProperty("--a", "1")
    }

    const copy = () => {
        const done = () => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
        }
        try {
            navigator.clipboard.writeText(email).then(done, () => go("mailto:" + email))
        } catch (e) {
            go("mailto:" + email)
        }
    }

    const tel = phone.replace(/[^\d+]/g, "")
    const readouts: { label: string; value: string; action: string; onClick: () => void; href: string }[] = [
        { label: "Email", value: email, action: copied ? "Copied" : "Copy", onClick: copy, href: "mailto:" + email },
        { label: "Phone", value: phone.replace(/^(\d{5})(\d{5})$/, "+91 $1 $2"), action: "Call", onClick: () => go("tel:+91" + tel.replace(/^\+?91/, "")), href: "tel:+91" + tel.replace(/^\+?91/, "") },
        { label: "LinkedIn", value: "in/" + (linkedin.match(/in\/([^/?]+)/)?.[1] || "mragankbhikshu"), action: "Open", onClick: () => go(linkedin), href: linkedin },
        { label: "Résumé", value: "PDF on Google Drive", action: "Download", onClick: () => go(resume), href: resume },
    ]

    return (
        <footer ref={root} className={"sf" + (narrow ? " nr" : "")} style={style}>
            <style>{CSS}</style>
            <span className="sf-led" aria-hidden="true" />

            <div className="sf-top">
                <div className="sf-call">
                    <span className="sf-status">
                        <i />
                        Open to internships · {time ? `${time} in Kharagpur` : "IST"}
                    </span>
                    <h2>{heading}</h2>
                </div>
                <div className="sf-ctas">
                    <a
                        className="sf-btn"
                        href={contactLink}
                        onClick={(e) => {
                            e.preventDefault()
                            go(contactLink)
                        }}
                    >
                        Send a signal <em>→</em>
                    </a>
                    <a
                        className="sf-btn ghost"
                        href={resume}
                        onClick={(e) => {
                            e.preventDefault()
                            go(resume)
                        }}
                    >
                        Download résumé
                    </a>
                </div>
            </div>

            <ul className="sf-readouts">
                {readouts.map((r) => (
                    <li key={r.label}>
                        <a
                            href={r.href}
                            onClick={(e) => {
                                e.preventDefault()
                                r.onClick()
                            }}
                        >
                            <span className="sf-label">{r.label}</span>
                            <b>{r.value}</b>
                            <span className={"sf-act" + (r.action === "Copied" ? " ok" : "")}>{r.action}</span>
                        </a>
                    </li>
                ))}
            </ul>

            <div
                className="sf-mark"
                ref={mark}
                onPointerMove={move}
                onPointerLeave={() => mark.current?.style.setProperty("--a", "0")}
                aria-hidden="true"
            >
                <span className="sf-planet" />
                <span className="sf-word outline">{wordmark}</span>
                <span className="sf-word lit">{wordmark}</span>
            </div>

            <div className="sf-base">
                <span>© {new Date().getFullYear()} Mragank Bhikshu · Product & Brand Designer · IIT Kharagpur</span>
                <nav aria-label="Footer">
                    {LINKS.map(([l, h]) => (
                        <a
                            key={h}
                            href={h}
                            onClick={(e) => {
                                e.preventDefault()
                                go(h)
                            }}
                        >
                            {l}
                        </a>
                    ))}
                </nav>
                <button className="sf-up" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    Back to the bridge <em>↑</em>
                </button>
            </div>
        </footer>
    )
}

const CSS = `
.sf{box-sizing:border-box;position:relative;width:100%;max-width:1200px;margin-inline:auto;padding:72px 40px 28px;overflow:hidden;color:#E8EEF8;font-family:"Plus Jakarta Sans",Inter,system-ui,sans-serif;background:radial-gradient(1px 1px at 12% 22%,#fff6,transparent),radial-gradient(1px 1px at 72% 14%,#fff5,transparent),radial-gradient(1.5px 1.5px at 86% 38%,#cfe4ff99,transparent),radial-gradient(1px 1px at 33% 64%,#fff4,transparent),radial-gradient(1px 1px at 58% 46%,#fff4,transparent),radial-gradient(1px 1px at 6% 78%,#ffd9b066,transparent),#05070b}
.sf *{box-sizing:border-box}
/* the warm LED strip along the top edge, like the edges of the bridge */
.sf-led{position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,#FF9A40 15%,#FFE2B8 50%,#FF9A40 85%,transparent);box-shadow:0 0 18px 2px rgba(255,138,42,.55)}

.sf-top{display:flex;align-items:flex-end;justify-content:space-between;gap:32px}
.sf-status{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:rgba(232,238,248,.65)}
.sf-status i{width:8px;height:8px;border-radius:50%;background:#3BD671;box-shadow:0 0 10px #3BD671;animation:sf-pulse 1.8s ease-in-out infinite}
@keyframes sf-pulse{50%{opacity:.35}}
.sf-call h2{margin:12px 0 0;max-width:15ch;font-size:clamp(34px,4.6vw,60px);line-height:1.02;font-weight:800;letter-spacing:-.035em;color:#fff}
.sf-ctas{display:flex;flex-wrap:wrap;gap:10px;flex:none}
.sf-btn{display:inline-flex;align-items:center;gap:10px;padding:14px 22px;border-radius:99px;font-size:15px;font-weight:700;text-decoration:none;color:#05070b;background:#3cc8ff;box-shadow:0 0 28px rgba(60,200,255,.35);transition:transform .25s,box-shadow .25s}
.sf-btn em,.sf-up em{font-style:normal;transition:transform .25s}
.sf-btn:hover{transform:translateY(-2px);box-shadow:0 0 36px rgba(60,200,255,.5)}
.sf-btn:hover em{transform:translateX(4px)}
.sf-btn.ghost{color:#E8EEF8;background:transparent;box-shadow:inset 0 0 0 1px rgba(232,238,248,.3)}
.sf-btn.ghost:hover{box-shadow:inset 0 0 0 1px #FF9A40,0 0 22px rgba(255,138,42,.25)}

/* the ways to reach me, as readouts on a panel */
.sf-readouts{list-style:none;margin:44px 0 0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;border-radius:18px;overflow:hidden;background:#232731;border:1px solid #232731}
.sf-readouts a{position:relative;display:grid;gap:4px;height:100%;padding:18px 18px 16px;text-decoration:none;color:inherit;background:#0c0f15;transition:background .3s}
.sf-readouts a:hover{background:#111621}
.sf-label{font-size:12px;font-weight:700;color:#FF9A40}
.sf-readouts b{font-size:15.5px;font-weight:700;color:#fff;overflow-wrap:anywhere}
.sf-act{justify-self:start;margin-top:6px;padding:3px 10px;border-radius:99px;font-size:12px;font-weight:700;color:#9fdcff;background:rgba(60,200,255,.1);border:1px solid rgba(60,200,255,.3);transition:all .25s}
.sf-readouts a:hover .sf-act{color:#05070b;background:#3cc8ff}
.sf-act.ok{color:#05070b;background:#3BD671;border-color:#3BD671}

/* the giant wordmark: an outline, with a lit copy revealed in a circle around the pointer */
.sf-mark{--x:50%;--y:50%;--a:0;position:relative;margin:56px -40px 0;display:grid;place-items:center;user-select:none;cursor:default}
.sf-planet{position:absolute;left:50%;bottom:-170%;width:130%;aspect-ratio:3.2;translate:-50% 0;border-radius:50%;background:radial-gradient(closest-side,rgba(47,155,255,.32),rgba(47,155,255,.08) 60%,transparent 72%);box-shadow:inset 0 2px 0 rgba(140,200,255,.35);pointer-events:none}
.sf-word{grid-area:1/1;font-size:clamp(80px,19.5vw,250px);line-height:.86;font-weight:900;letter-spacing:-.05em;white-space:nowrap}
.sf-word.outline{color:transparent;-webkit-text-stroke:1.5px rgba(232,238,248,.22)}
.sf-word.lit{color:transparent;background:radial-gradient(circle at var(--x) var(--y),#fff 0,#9fe8ff 8%,#3cc8ff 18%,#FF9A40 34%,transparent 46%);-webkit-background-clip:text;background-clip:text;opacity:var(--a);transition:opacity .4s ease}

.sf-base{position:relative;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px 24px;margin-top:22px;padding-top:18px;border-top:1px solid rgba(255,255,255,.08);font-size:13px;color:rgba(232,238,248,.55)}
.sf-base nav{display:flex;flex-wrap:wrap;gap:6px 18px}
.sf-base nav a{color:rgba(232,238,248,.75);text-decoration:none;font-weight:600}
.sf-base nav a:hover{color:#fff}
.sf-up{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:8px;font-weight:700;color:#E8EEF8}
.sf-up:hover em{transform:translateY(-3px)}
.sf a:focus-visible,.sf-up:focus-visible{outline:2px solid #fff;outline-offset:3px;border-radius:6px}

/* phones: full-width buttons, the contact readouts as a 2 x 2 grid of tiles, the links as a tidy grid */
.sf.nr{padding:52px 16px calc(22px + env(safe-area-inset-bottom,0px))}
.sf.nr .sf-top{flex-direction:column;align-items:stretch;gap:22px}
.sf.nr .sf-call h2{font-size:36px}
.sf.nr .sf-ctas{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.sf.nr .sf-btn{justify-content:center;padding:14px 12px;font-size:14.5px}
.sf.nr .sf-readouts{margin-top:28px;grid-template-columns:repeat(2,minmax(0,1fr));border-radius:16px}
.sf.nr .sf-readouts a{padding:14px 14px 13px}
.sf.nr .sf-readouts b{font-size:13.5px;line-height:1.35}
.sf.nr .sf-readouts li:first-child,.sf.nr .sf-readouts li:nth-child(4){grid-column:1/-1}
.sf.nr .sf-mark{margin:40px -16px 0}
.sf.nr .sf-word{font-size:22vw}
.sf.nr .sf-base{display:grid;gap:16px;align-items:start}
.sf.nr .sf-base nav{display:grid;grid-template-columns:repeat(3,auto);justify-content:start;gap:10px 22px;font-size:14px}
.sf.nr .sf-up{padding:12px 0}
@media (hover:none){.sf-word.lit{--a:.85;opacity:.85;background:linear-gradient(90deg,transparent 10%,#3cc8ff 40%,#FF9A40 60%,transparent 90%);-webkit-background-clip:text;background-clip:text}}
@media (prefers-reduced-motion:reduce){.sf-status i{animation:none}.sf-word.lit{transition:none}}
`

addPropertyControls(SiteFooter, {
    heading: { type: ControlType.String, title: "Heading", defaultValue: "Have a project in mind? Send a signal." },
    email: { type: ControlType.String, title: "Email", defaultValue: "mragankbhikshu@gmail.com" },
    phone: { type: ControlType.String, title: "Phone", defaultValue: "7500953738" },
    linkedin: { type: ControlType.String, title: "LinkedIn", defaultValue: "https://www.linkedin.com/in/mragankbhikshu/" },
    resume: { type: ControlType.String, title: "Résumé link", defaultValue: "https://drive.google.com/file/d/1K-UrDUZy-X1NwdQBk0H66urqTp689yEr/view?usp=drive_link" },
    contactLink: { type: ControlType.String, title: "Contact link", defaultValue: "/contact-us" },
    wordmark: { type: ControlType.String, title: "Wordmark", defaultValue: "BHIKSHU" },
})
