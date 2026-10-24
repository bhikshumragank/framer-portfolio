import { addPropertyControls, ControlType, RenderTarget } from "framer"
import * as FramerLib from "framer"
import { useEffect, useRef, useState, type CSSProperties } from "react"

type Props = {
    heading: string
    intro: string
    email: string
    whatsapp: string
    linkedin: string
    resume: string
    style?: CSSProperties
}

const NEEDS = ["Product / UX design", "Brand identity", "Website", "Motion & video", "Posters & social", "Internship or job role"]
const TIMES = ["As soon as possible", "2–4 weeks", "1–3 months", "Flexible"]
const BUDGETS = ["Not sure yet", "Under ₹25k", "₹25k–1L", "₹1L+"]
const NEXT = [
    { t: "I read your brief", d: "Usually the same day. If it's a fit, I reply with a few questions." },
    { t: "A short call", d: "Twenty minutes to agree on the goal, the scope and the timeline." },
    { t: "First direction", d: "A plan and first sketches, so you see where it's heading before anything is final." },
]

// Framer switches pages through its router (in preview and on the live site); a plain URL change breaks in preview
function useGo() {
    // useRouter isn't in Framer's published types, so it is looked up at runtime; links still work without it
    const router = ((FramerLib as any).useRouter?.() ?? null) as any
    return (path: string) => {
        if (/^(https?:|mailto:|tel:)/.test(path)) return void window.open(path, path.startsWith("http") ? "_blank" : "_self", "noopener")
        const routes = router?.routes || {}
        const id = Object.keys(routes).find((k) => routes[k]?.path === path)
        if (id && typeof router?.navigate === "function") router.navigate(id, "")
        else if (typeof window !== "undefined") window.location.href = path
    }
}

// Jenny's head, small, for the reception desk
function Jenny() {
    return (
        <svg className="sr-jenny" viewBox="0 0 200 170" aria-hidden="true">
            <defs>
                <linearGradient id="srShell" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FAFCFF" />
                    <stop offset=".55" stopColor="#D5DCE6" />
                    <stop offset="1" stopColor="#9AA5B6" />
                </linearGradient>
                <filter id="srGlow" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="3" result="b" />
                    <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <circle cx="22" cy="86" r="14" fill="#131a26" stroke="#C9D1DC" strokeWidth="3" />
            <circle cx="22" cy="86" r="5" fill="#FF8A2A" filter="url(#srGlow)" />
            <circle cx="178" cy="86" r="14" fill="#131a26" stroke="#C9D1DC" strokeWidth="3" />
            <circle cx="178" cy="86" r="5" fill="#FF8A2A" filter="url(#srGlow)" />
            <rect x="24" y="14" width="152" height="140" rx="62" fill="url(#srShell)" />
            <path d="M54 30 Q100 14 146 30" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="4" strokeLinecap="round" />
            <rect x="40" y="50" width="120" height="70" rx="35" fill="#070b13" />
            <g className="sr-eyes" filter="url(#srGlow)">
                <rect x="70" y="68" width="16" height="30" rx="8" fill="#8EEBFF" />
                <rect x="114" y="68" width="16" height="30" rx="8" fill="#8EEBFF" />
            </g>
        </svg>
    )
}

/**
 * Signal Room: the contact page as the ship's reception office. Jenny greets the visitor at the desk with the direct
 * channels; beside it a mission brief is filled in by tapping chips and typing, a live preview shows the message,
 * and it goes out on WhatsApp or by email, already written.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 1100
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function SignalRoom(props: Props) {
    const {
        heading = "Signal room",
        intro = "Have a project, a role or a question? Brief me here and it reaches me directly, already written.",
        email = "mragankbhikshu@gmail.com",
        whatsapp = "917500953738",
        linkedin = "https://www.linkedin.com/in/mragankbhikshu/",
        resume = "https://drive.google.com/file/d/1K-UrDUZy-X1NwdQBk0H66urqTp689yEr/view?usp=drive_link",
        style,
    } = props
    const go = useGo()
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const root = useRef<HTMLElement>(null)
    const [narrow, setNarrow] = useState(false)
    const [time, setTime] = useState("")
    const [needs, setNeeds] = useState<string[]>([])
    const [name, setName] = useState("")
    const [reach, setReach] = useState("")
    const [org, setOrg] = useState("")
    const [when, setWhen] = useState("")
    const [budget, setBudget] = useState("")
    const [msg, setMsg] = useState("")
    const [tried, setTried] = useState(false)
    const [sent, setSent] = useState<"" | "whatsapp" | "email">("")
    const [copied, setCopied] = useState("")

    useEffect(() => {
        const el = root.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 820))
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

    const toggle = (n: string) => setNeeds((xs) => (xs.includes(n) ? xs.filter((x) => x !== n) : [...xs, n]))

    const lines = [
        `Hi Mragank, I'm ${name.trim() || "…"}${org.trim() ? ` from ${org.trim()}` : ""}.`,
        needs.length ? `I'm looking for: ${needs.join(", ")}.` : "",
        when ? `Timeline: ${when}.` : "",
        budget ? `Budget: ${budget}.` : "",
        msg.trim() ? `\n${msg.trim()}` : "",
        reach.trim() ? `\nYou can reach me at ${reach.trim()}.` : "",
    ].filter(Boolean)
    const brief = lines.join("\n")
    const missing = [!name.trim() && "your name", !needs.length && "what you need", !msg.trim() && "a short message"].filter(Boolean) as string[]
    const ready = missing.length === 0

    const send = (via: "whatsapp" | "email") => {
        setTried(true)
        if (!ready) return
        const subject = `Project brief from ${name.trim()}${needs.length ? ` · ${needs[0]}` : ""}`
        if (via === "whatsapp") window.open(`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(brief)}`, "_blank", "noopener")
        else window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(brief)}`
        setSent(via)
    }
    const copy = (text: string, key: string) => {
        try {
            navigator.clipboard.writeText(text).then(() => {
                setCopied(key)
                setTimeout(() => setCopied(""), 1800)
            })
        } catch (e) {}
    }

    const chips = (list: string[], on: (x: string) => boolean, pick: (x: string) => void, label: string) => (
        <div className="sr-chips" role="group" aria-label={label}>
            {list.map((x) => (
                <button key={x} type="button" className={on(x) ? "on" : ""} aria-pressed={on(x)} onClick={() => pick(x)}>
                    {x}
                </button>
            ))}
        </div>
    )

    const channels = [
        { k: "Email", v: email, a: copied === "email" ? "Copied" : "Copy", on: () => copy(email, "email"), href: "mailto:" + email },
        { k: "WhatsApp", v: "+91 " + whatsapp.replace(/\D/g, "").replace(/^91/, "").replace(/^(\d{5})(\d{5})$/, "$1 $2"), a: "Chat", on: () => go(`https://wa.me/${whatsapp.replace(/\D/g, "")}`), href: `https://wa.me/${whatsapp.replace(/\D/g, "")}` },
        { k: "LinkedIn", v: "in/" + (linkedin.match(/in\/([^/?]+)/)?.[1] || "mragankbhikshu"), a: "Open", on: () => go(linkedin), href: linkedin },
        { k: "Résumé", v: "PDF on Google Drive", a: "View", on: () => go(resume), href: resume },
    ].filter((c) => c.href && !/wa\.me\/$/.test(c.href))

    return (
        <section ref={root} className={"sr" + (narrow ? " nr" : "")} style={style} aria-label={heading}>
            <style>{CSS}</style>
            <header className="sr-head">
                <span className="sr-status">
                    <i />
                    Open to internships and freelance · {time ? `${time} in Kharagpur` : "IST"}
                </span>
                <h1>{heading}</h1>
                <p>{intro}</p>
            </header>

            <div className="sr-grid">
                {/* the reception desk */}
                <aside className="sr-desk">
                    <div className="sr-host">
                        <Jenny />
                        <div className="sr-say">
                            <b>Jenny · reception</b>
                            <span>Welcome aboard. Tell me what you're building and I'll get it to Mragank. He usually replies within a day.</span>
                        </div>
                    </div>
                    <ul className="sr-channels">
                        {channels.map((c) => (
                            <li key={c.k}>
                                <a
                                    href={c.href}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        c.on()
                                    }}
                                >
                                    <span className="sr-k">{c.k}</span>
                                    <b>{c.v}</b>
                                    <span className={"sr-act" + (c.a === "Copied" ? " ok" : "")}>{c.a}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className="sr-hours">
                        <div>
                            <b>Replies</b>
                            <span>within 24 hours</span>
                        </div>
                        <div>
                            <b>Based in</b>
                            <span>IIT Kharagpur, India</span>
                        </div>
                        <div>
                            <b>Works</b>
                            <span>remote, worldwide</span>
                        </div>
                    </div>
                </aside>

                {/* the mission brief */}
                <div className="sr-brief">
                    {sent ? (
                        <div className="sr-sent" role="status">
                            <span className="sr-ring" aria-hidden="true" />
                            <h2>Signal sent</h2>
                            <p>
                                {sent === "whatsapp" ? "WhatsApp opened with your brief written in. Press send there and it's with me." : "Your email app opened with the brief written in. Press send there and it's with me."} I usually reply
                                within a day.
                            </p>
                            <div className="sr-sentacts">
                                <button type="button" className="sr-btn ghost" onClick={() => copy(brief, "brief")}>
                                    {copied === "brief" ? "Brief copied" : "Copy the brief"}
                                </button>
                                <button type="button" className="sr-btn ghost" onClick={() => setSent("")}>
                                    Edit the brief
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form
                            className="sr-form"
                            onSubmit={(e) => {
                                e.preventDefault()
                                send("whatsapp")
                            }}
                        >
                            <div className="sr-step">
                                <span className="sr-n">01</span>
                                <div>
                                    <h2>What do you need?</h2>
                                    <p className="sr-hint">Pick one or more.</p>
                                    {chips(NEEDS, (x) => needs.includes(x), toggle, "What you need")}
                                </div>
                            </div>
                            <div className="sr-step">
                                <span className="sr-n">02</span>
                                <div>
                                    <h2>About you</h2>
                                    <div className="sr-fields">
                                        <label>
                                            <span>Your name</span>
                                            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aditi Rao" autoComplete="name" />
                                        </label>
                                        <label>
                                            <span>Email or phone</span>
                                            <input value={reach} onChange={(e) => setReach(e.target.value)} placeholder="So I can reply" autoComplete="email" />
                                        </label>
                                        <label className="wide">
                                            <span>Company or team (optional)</span>
                                            <input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="e.g. a startup, a fest, an agency" autoComplete="organization" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="sr-step">
                                <span className="sr-n">03</span>
                                <div>
                                    <h2>Timeline and budget</h2>
                                    <p className="sr-hint">Both optional.</p>
                                    {chips(TIMES, (x) => when === x, (x) => setWhen((w) => (w === x ? "" : x)), "Timeline")}
                                    {chips(BUDGETS, (x) => budget === x, (x) => setBudget((b) => (b === x ? "" : x)), "Budget")}
                                </div>
                            </div>
                            <div className="sr-step">
                                <span className="sr-n">04</span>
                                <div>
                                    <h2>Your message</h2>
                                    <label className="sr-msg">
                                        <span className="sr-sr">Your message</span>
                                        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} placeholder="What are you building, and what would a great result look like?" />
                                    </label>
                                </div>
                            </div>

                            <div className="sr-preview" aria-live="polite">
                                <span className="sr-k">Transmission preview</span>
                                <pre>{brief}</pre>
                            </div>

                            {tried && !ready && <p className="sr-miss">Add {missing.join(", ").replace(/, ([^,]*)$/, " and $1")} to send.</p>}
                            <div className="sr-acts">
                                <button type="submit" className="sr-btn">
                                    Send on WhatsApp <em>→</em>
                                </button>
                                <button type="button" className="sr-btn ghost" onClick={() => send("email")}>
                                    Send by email
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <ol className="sr-next" aria-label="What happens next">
                {NEXT.map((x, i) => (
                    <li key={x.t}>
                        <span className="sr-n">{String(i + 1).padStart(2, "0")}</span>
                        <b>{x.t}</b>
                        <span>{x.d}</span>
                    </li>
                ))}
            </ol>
        </section>
    )
}

const CSS = `
.sr{box-sizing:border-box;position:relative;width:100%;max-width:1200px;margin-inline:auto;padding:56px 40px 90px;color:#E8EEF8;font-family:"Plus Jakarta Sans",Inter,system-ui,sans-serif;background:radial-gradient(1px 1px at 12% 18%,#fff6,transparent),radial-gradient(1px 1px at 78% 10%,#fff5,transparent),radial-gradient(1.5px 1.5px at 90% 44%,#cfe4ff99,transparent),radial-gradient(1px 1px at 30% 70%,#fff4,transparent),radial-gradient(60% 40% at 80% 0%,rgba(47,155,255,.12),transparent 70%),#05070b}
.sr *{box-sizing:border-box}
.sr-head{max-width:720px;margin-bottom:40px}
.sr-status{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:rgba(232,238,248,.65)}
.sr-status i{width:8px;height:8px;border-radius:50%;background:#3BD671;box-shadow:0 0 10px #3BD671;animation:sr-pulse 1.8s ease-in-out infinite}
@keyframes sr-pulse{50%{opacity:.35}}
.sr-head h1{margin:14px 0 12px;font-size:clamp(44px,6vw,84px);line-height:.95;font-weight:800;letter-spacing:-.04em;color:#3cc8ff;text-transform:uppercase}
.sr-head p{margin:0;font-size:17px;line-height:1.6;color:rgba(232,238,248,.72)}

.sr-grid{display:grid;grid-template-columns:minmax(0,380px) minmax(0,1fr);gap:24px;align-items:start}

/* the reception desk */
.sr-desk{position:sticky;top:110px;display:grid;gap:14px;padding:22px;border-radius:24px;background:linear-gradient(180deg,#14171e,#0c0e13);border:1px solid #262a33;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 30px 80px rgba(0,0,0,.55)}
.sr-desk::before{content:"";position:absolute;left:22px;right:22px;top:0;height:2px;border-radius:2px;background:linear-gradient(90deg,transparent,#FF9A40,#FFE2B8,#FF9A40,transparent);box-shadow:0 0 14px rgba(255,138,42,.6)}
.sr-host{display:flex;gap:14px;align-items:flex-start}
.sr-jenny{flex:none;width:64px;height:56px;filter:drop-shadow(0 0 14px rgba(111,224,255,.35))}
.sr-eyes{transform-box:fill-box;transform-origin:center;animation:sr-blink 5s infinite}
@keyframes sr-blink{0%,93%,100%{scale:1 1}95.5%{scale:1 .1}}
.sr-say{display:grid;gap:4px;padding:12px 14px;border-radius:4px 16px 16px 16px;background:rgba(10,14,22,.9);border:1px solid rgba(111,224,255,.35);font-size:14px;line-height:1.5;color:#EAF4FF}
.sr-say b{font-size:12px;font-weight:800;color:#7FE6FF}
.sr-channels{list-style:none;margin:0;padding:0;display:grid;gap:1px;border-radius:16px;overflow:hidden;background:#232731;border:1px solid #232731}
.sr-channels a{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto auto;column-gap:10px;row-gap:2px;align-items:center;padding:13px 14px;text-decoration:none;color:inherit;background:#0c0f15;transition:background .3s}
.sr-channels a:hover{background:#111621}
.sr-k{font-size:12px;font-weight:700;color:#FF9A40}
.sr-channels b{grid-column:1;font-size:14.5px;font-weight:700;color:#fff;overflow-wrap:anywhere}
.sr-act{grid-column:2;grid-row:1 / span 2;padding:5px 12px;border-radius:99px;font-size:12px;font-weight:700;color:#9fdcff;background:rgba(60,200,255,.1);border:1px solid rgba(60,200,255,.3);transition:all .25s}
.sr-channels a:hover .sr-act{color:#05070b;background:#3cc8ff}
.sr-act.ok{color:#05070b;background:#3BD671;border-color:#3BD671}
.sr-hours{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.sr-hours div{display:grid;gap:2px;padding:10px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07)}
.sr-hours b{font-size:11.5px;font-weight:700;color:rgba(232,238,248,.5)}
.sr-hours span{font-size:13px;font-weight:600;color:#fff;line-height:1.35}

/* the mission brief */
.sr-brief{position:relative;padding:8px 26px 26px;border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.012));border:1px solid rgba(111,224,255,.16)}
.sr-step{display:grid;grid-template-columns:44px minmax(0,1fr);gap:8px;padding:20px 0;border-bottom:1px solid rgba(255,255,255,.07)}
.sr-n{font-size:13px;font-weight:800;color:#3cc8ff;font-variant-numeric:tabular-nums;padding-top:4px}
.sr-step h2{margin:0;font-size:20px;line-height:1.25;font-weight:800;letter-spacing:-.01em;color:#fff}
.sr-hint{margin:4px 0 0;font-size:13px;color:rgba(232,238,248,.55)}
.sr-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.sr-chips button{all:unset;cursor:pointer;padding:9px 14px;border-radius:99px;font-size:14px;font-weight:600;color:rgba(232,238,248,.8);background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);transition:all .2s}
.sr-chips button:hover{border-color:rgba(60,200,255,.5);color:#fff}
.sr-chips button.on{color:#05070b;background:#3cc8ff;border-color:#3cc8ff;box-shadow:0 0 18px rgba(60,200,255,.35)}
.sr-chips + .sr-chips{margin-top:10px}
.sr-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
.sr-fields .wide{grid-column:1/-1}
.sr label{display:grid;gap:6px}
.sr label > span{font-size:12.5px;font-weight:700;color:rgba(232,238,248,.6)}
.sr input,.sr textarea{all:unset;box-sizing:border-box;width:100%;padding:13px 14px;border-radius:12px;font-size:15px;line-height:1.5;color:#fff;background:#0b0e14;border:1px solid #262b35;transition:border-color .2s,box-shadow .2s}
.sr textarea{min-height:120px;white-space:pre-wrap;margin-top:12px}
.sr input::placeholder,.sr textarea::placeholder{color:rgba(232,238,248,.35)}
.sr input:focus,.sr textarea:focus{border-color:#3cc8ff;box-shadow:0 0 0 3px rgba(60,200,255,.18)}
.sr-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.sr-preview{margin-top:22px;padding:14px 16px;border-radius:14px;background:#070a10;border:1px dashed rgba(111,224,255,.3)}
.sr-preview pre{margin:6px 0 0;font:500 13.5px/1.6 "Plus Jakarta Sans",Inter,system-ui,sans-serif;white-space:pre-wrap;color:rgba(232,238,248,.85)}
.sr-miss{margin:14px 0 0;font-size:14px;font-weight:600;color:#FFB36B}
.sr-acts{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.sr-btn{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:10px;padding:14px 22px;border-radius:99px;font-size:15px;font-weight:700;color:#05070b;background:#3cc8ff;box-shadow:0 0 28px rgba(60,200,255,.35);transition:transform .25s,box-shadow .25s}
.sr-btn em{font-style:normal;transition:transform .25s}
.sr-btn:hover{transform:translateY(-2px);box-shadow:0 0 36px rgba(60,200,255,.5)}
.sr-btn:hover em{transform:translateX(4px)}
.sr-btn.ghost{color:#E8EEF8;background:transparent;box-shadow:inset 0 0 0 1px rgba(232,238,248,.3)}
.sr-btn.ghost:hover{box-shadow:inset 0 0 0 1px #FF9A40,0 0 22px rgba(255,138,42,.25)}
.sr button:focus-visible,.sr a:focus-visible{outline:2px solid #fff;outline-offset:3px}
.sr-sent{display:grid;justify-items:start;gap:12px;padding:40px 6px 18px}
.sr-ring{width:56px;height:56px;border-radius:50%;border:2px solid #3BD671;box-shadow:0 0 0 0 rgba(59,214,113,.5);animation:sr-ping 1.8s ease-out infinite}
@keyframes sr-ping{70%,100%{box-shadow:0 0 0 22px rgba(59,214,113,0)}}
.sr-sent h2{margin:0;font-size:30px;font-weight:800;color:#fff}
.sr-sent p{margin:0;max-width:52ch;font-size:15.5px;line-height:1.6;color:rgba(232,238,248,.8)}
.sr-sentacts{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px}

/* what happens next */
.sr-next{list-style:none;margin:36px 0 0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.sr-next li{display:grid;gap:6px;padding:18px;border-radius:18px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07)}
.sr-next b{font-size:16px;font-weight:800;color:#fff}
.sr-next li > span:last-child{font-size:14px;line-height:1.55;color:rgba(232,238,248,.65)}

/* phones and narrow windows: one column, the desk first */
.sr.nr{padding:28px 16px 64px}
.sr.nr .sr-head{margin-bottom:26px}
.sr.nr .sr-head h1{font-size:44px}
.sr.nr .sr-head p{font-size:15.5px}
.sr.nr .sr-grid{grid-template-columns:minmax(0,1fr)}
.sr.nr .sr-desk{position:relative;top:auto;padding:18px}
.sr.nr .sr-brief{padding:4px 16px 18px}
.sr.nr .sr-step{grid-template-columns:30px minmax(0,1fr)}
.sr.nr .sr-fields{grid-template-columns:minmax(0,1fr)}
.sr.nr .sr-chips button{font-size:13.5px;padding:9px 12px}
.sr.nr .sr-acts{display:grid;grid-template-columns:minmax(0,1fr)}
.sr.nr .sr-btn{justify-content:center}
.sr.nr .sr-next{grid-template-columns:minmax(0,1fr)}
@media (prefers-reduced-motion:reduce){.sr-status i,.sr-eyes,.sr-ring{animation:none}}
`

addPropertyControls(SignalRoom, {
    heading: { type: ControlType.String, title: "Heading", defaultValue: "Signal room" },
    intro: { type: ControlType.String, title: "Intro", displayTextArea: true, defaultValue: "Have a project, a role or a question? Brief me here and it reaches me directly, already written." },
    email: { type: ControlType.String, title: "Email", defaultValue: "mragankbhikshu@gmail.com" },
    whatsapp: { type: ControlType.String, title: "WhatsApp number", description: "With country code, digits only", defaultValue: "917500953738" },
    linkedin: { type: ControlType.String, title: "LinkedIn", defaultValue: "https://www.linkedin.com/in/mragankbhikshu/" },
    resume: { type: ControlType.String, title: "Résumé link", defaultValue: "https://drive.google.com/file/d/1K-UrDUZy-X1NwdQBk0H66urqTp689yEr/view?usp=drive_link" },
})
