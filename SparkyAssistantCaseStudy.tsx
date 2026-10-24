import { addPropertyControls, ControlType } from "framer"
import * as FramerLib from "framer"
import { useEffect, useRef, useState, type CSSProperties } from "react"

type Props = {
    sparky: string
    liveLink: string
    backLink: string
    mascotLink: string
    style?: CSSProperties
}

// Framer switches pages through its router (in preview and on the live site); a plain URL change breaks in preview
function useGo() {
    // useRouter isn't in Framer's published types, so it is looked up at runtime; links still work without it
    const router = ((FramerLib as any).useRouter?.() ?? null) as any
    return (path: string) => {
        if (/^https?:/.test(path)) return void window.open(path, "_blank", "noopener")
        const [p, hash] = path.split("#")
        const routes = router?.routes || {}
        const id = Object.keys(routes).find((k) => routes[k]?.path === p)
        if (id && typeof router?.navigate === "function") router.navigate(id, hash || "")
        else if (typeof window !== "undefined") window.location.href = path
    }
}

const SPARKY = "https://framerusercontent.com/images/M1jzH6SoYpgOnN3D60t88vJ3w0.png?scale-down-to=512"

/* ---------- the chat prototype ---------- */

type Intent = "partner" | "masibus" | "other"
type Msg =
    | { id: number; who: "user"; text: string }
    | { id: number; who: "bot"; kind: "text"; text: string; more?: boolean }
    | { id: number; who: "bot"; kind: "refuse" }
    | { id: number; who: "bot"; kind: "form"; intent: Intent }
    | { id: number; who: "bot"; kind: "confirm"; name: string }
    | { id: number; who: "bot"; kind: "already" }
type Lead = { id: number; name: string; intent: Intent; context: string; time: string }

// the real copy from the Sparky widget
const OPTIONS: { id: Intent; title: string; sub: string; reply: string }[] = [
    {
        id: "partner",
        title: "Sonepar Partner's Products",
        sub: "ABB, Siemens, Schneider, Rockwell and more",
        reply: "Great choice. We supply products from 35+ partner brands including ABB, Siemens, Schneider and Rockwell. Share your details and our specialist will get back to you.",
    },
    {
        id: "masibus",
        title: "Sonepar Brand Products",
        sub: "Masibus, our manufacturing vertical",
        reply: "Masibus is our own manufacturing vertical: controllers, scanners, calibrators, transmitters and more. Share your details and our specialist will get back to you.",
    },
    { id: "other", title: "Something else", sub: "Ask me anything about Sonepar India", reply: "Sure, ask me anything about Sonepar India, our products, partners or solutions." },
]

const ASK: { q: string; a?: string }[] = [
    { q: "do you have that masibus iiot gateway thing", a: "The MSG-21 Masibus IIoT Gateway connects Modbus serial and TCP devices to MQTT servers over cellular or WAN." },
    { q: "who won the cricket match yesterday" },
]

const INTENT_TAG: Record<Intent, { label: string; high: boolean }> = {
    partner: { label: "Partner Products", high: true },
    masibus: { label: "Masibus", high: true },
    other: { label: "General", high: false },
}

/* ---------- the confidence gate ---------- */

// illustrative retrieval scores, chosen to show the trade-off the threshold controls
const PROBES: { q: string; score: number; valid: boolean; ok: string; bad?: string }[] = [
    { q: "do you have that masibus iiot gateway thing", score: 0.86, valid: true, ok: "Answers with the MSG-21 gateway and its page" },
    { q: "TC5396 temperature controller", score: 0.71, valid: true, ok: "Exact product code, matched as an identifier" },
    { q: "how many verticals does Sonepar have?", score: 0.48, valid: false, ok: "Stays quiet: the answer isn't verified yet", bad: "Invents “six” from an unrelated phrase on the site" },
    { q: "who won the cricket match yesterday", score: 0.12, valid: false, ok: "Refuses and offers a callback", bad: "Makes up a match result" },
]

/* ---------- the Hub ---------- */

type HubTab = "home" | "analytics" | "live" | "leads" | "responses" | "faqs" | "knowledge" | "sites"
const HUB_NAV: { group?: string; id?: HubTab; label: string }[] = [
    { id: "home", label: "Control center" },
    { id: "analytics", label: "Analytics" },
    { id: "live", label: "Live chat" },
    { id: "leads", label: "Leads" },
    { group: "Sparky", label: "Sparky" },
    { id: "responses", label: "Responses" },
    { id: "faqs", label: "FAQs and gaps" },
    { id: "knowledge", label: "Knowledge base" },
    { group: "Connections", label: "Connections" },
    { id: "sites", label: "Websites and API keys" },
]
const HUB_NOTES: Record<HubTab, { title: string; text: string }> = {
    home: { title: "Stopping never breaks a website", text: "Start and stop Sparky's four parts from one button. When it is stopped, the widget shows a maintenance message and still collects callbacks, so a customer never meets a dead chat box." },
    analytics: { title: "The numbers marketing asks for", text: "Open rate, leads, answer rate, reply time, busiest hours and traffic per website, so the team can see whether Sparky is earning its place on the page." },
    live: { title: "A human, without losing the lead", text: "When Sparky can't help, a visitor can ask for an expert. Accepting the chat pauses Sparky and shows the whole conversation so far. If nobody accepts in two minutes, the visitor gets the callback form instead." },
    leads: { title: "Context travels with every lead", text: "Each lead is tagged by intent and carries the conversation behind it, so the specialist opens the call already knowing the topic. Filter, add notes, set status, export to CSV." },
    responses: { title: "Every word, editable without code", text: "Greetings, fallbacks and confirmations used to live inside the workflow tool. Now marketing edits them here and tests the result instantly in the Try it box." },
    faqs: { title: "Every failure becomes a fix", text: "Questions Sparky couldn't answer are collected here. One click turns a gap into an FAQ, so the assistant gets better from real traffic instead of guesses." },
    knowledge: { title: "Fresh, but never unchecked", text: "Crawls compare page fingerprints and only re-index what changed. Pages that mention partners, verticals, awards or leadership wait in a review queue before Sparky can quote them." },
    sites: { title: "One assistant, many websites", text: "Each website gets its own key, locked to its domain, plus a ready-made WordPress plugin. Masibus and Sonepar run the same Sparky with separate analytics." },
}

const nowTime = () => {
    const d = new Date()
    return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0")
}

/**
 * Sparky AI assistant case study: a lead-generating, knowledge-answering chatbot for Sonepar India,
 * with a working chat prototype, the confidence gate and the Sparky Hub admin panel.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 9000
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function SparkyAssistantCaseStudy(props: Props) {
    const { sparky = SPARKY, liveLink = "https://sparkythechatbot.netlify.app/", backLink = "/portfolio-2", mascotLink = "/case-study/sparky-mascot-redesign", style } = props
    const go = useGo()
    const nav = (href: string) => (e: React.MouseEvent) => {
        e.preventDefault()
        go(href)
    }

    /* chat prototype state */
    const [msgs, setMsgs] = useState<Msg[]>([])
    const [path, setPath] = useState<Intent | null>(null)
    const [typing, setTyping] = useState(false)
    const [asked, setAsked] = useState<string[]>([])
    const [submitted, setSubmitted] = useState(false)
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [formErr, setFormErr] = useState("")
    const [leads, setLeads] = useState<Lead[]>([])
    const [fresh, setFresh] = useState(-1)
    const nextId = useRef(1)
    const timers = useRef<number[]>([])
    const chatRef = useRef<HTMLDivElement>(null)
    const lastAsk = useRef("")
    useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])
    useEffect(() => {
        const c = chatRef.current
        if (c) c.scrollTo({ top: c.scrollHeight, behavior: "smooth" })
    }, [msgs, typing])

    const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))
    const say = (m: any) => setMsgs((s) => [...s, { ...m, id: nextId.current++ }])
    const botSay = (m: any, ms = 750) => {
        setTyping(true)
        later(() => {
            setTyping(false)
            say({ who: "bot", ...m })
        }, ms)
    }
    const offerForm = (intent: Intent) => (submitted ? botSay({ kind: "already" }, 500) : botSay({ kind: "form", intent }, 500))

    const pick = (o: (typeof OPTIONS)[number]) => {
        setPath(o.id)
        say({ who: "user", text: o.title })
        botSay({ kind: "text", text: o.reply })
        if (o.id !== "other") later(() => offerForm(o.id), 900)
    }
    const ask = (a: (typeof ASK)[number]) => {
        lastAsk.current = a.q
        setAsked((s) => [...s, a.q])
        say({ who: "user", text: a.q })
        if (a.a) botSay({ kind: "text", text: a.a, more: true }, 1100)
        else botSay({ kind: "refuse" }, 900)
    }
    const submit = (intent: Intent) => {
        if (!name.trim() || !phone.trim()) return setFormErr("Please enter your name and phone number.")
        setFormErr("")
        setSubmitted(true)
        const first = name.trim().split(" ")[0]
        setMsgs((s) => s.map((m) => (m.who === "bot" && m.kind === "form" ? { id: m.id, who: "bot", kind: "confirm", name: first } : m)) as Msg[])
        const id = nextId.current++
        const context = intent === "other" ? `Asked: “${lastAsk.current || "general question"}”` : `Chose ${INTENT_TAG[intent].label} on the welcome screen`
        later(() => {
            setLeads((l) => [{ id, name: name.trim(), intent, context, time: nowTime() }, ...l])
            setFresh(id)
        }, 600)
    }
    const restart = () => {
        timers.current.forEach((t) => window.clearTimeout(t))
        timers.current = []
        setMsgs([])
        setPath(null)
        setTyping(false)
        setAsked([])
        setSubmitted(false)
        setName("")
        setPhone("")
        setFormErr("")
        setLeads([])
        lastAsk.current = ""
    }

    /* confidence gate state */
    const [gate, setGate] = useState(0.6)

    /* hub state */
    const [tab, setTab] = useState<HubTab>("home")
    const [running, setRunning] = useState(true)
    const [liveState, setLiveState] = useState<"waiting" | "accepted" | "ended">("waiting")
    const [greeting, setGreeting] = useState("Welcome to Sonepar. I'm Sparky, your digital buddy. What are you looking for today?")
    const [fallback, setFallback] = useState("I couldn't find this in Sonepar India's knowledge base. Our team can help directly. Would you like a callback?")
    const [gaps, setGaps] = useState(["does sonepar deliver to nepal", "warranty on abb drives", "masibus calibrator rental"])
    const [faqs, setFaqs] = useState<string[]>([])
    const [crawl, setCrawl] = useState<"idle" | "running" | "done">("idle")
    const [review, setReview] = useState<"pending" | "approved" | "rejected">("pending")
    const [leadOpen, setLeadOpen] = useState(0)
    const startCrawl = () => {
        setCrawl("running")
        later(() => setCrawl("done"), 1600)
    }

    const Avatar = (cls: string) => <span className={"sa-av " + cls}>{sparky ? <img src={sparky} alt="" draggable={false} /> : null}</span>

    /* ---------- render helpers (called, not mounted) ---------- */

    const Bubble = (m: Msg, intentForForm: Intent | null) => {
        if (m.who === "user")
            return (
                <div key={m.id} className="w-row me">
                    <span className="w-b me">{m.text}</span>
                </div>
            )
        const inner =
            m.kind === "text" ? (
                <>
                    {m.text}
                    {m.more && <span className="w-more">View More ↗</span>}
                </>
            ) : m.kind === "refuse" ? (
                <>
                    I couldn't find this in Sonepar India's knowledge base. Our team can help directly. Would you like a callback?
                    <button className="w-cta" onClick={() => offerForm("other")}>
                        Request callback
                    </button>
                </>
            ) : m.kind === "already" ? (
                <span className="w-ok">You've already shared your details. Our specialist will call you within 24 hours.</span>
            ) : m.kind === "confirm" ? (
                <span className="w-ok">
                    <b>Thank you, {m.name}.</b> Our support team will call you within 24 hours.
                </span>
            ) : (
                <div className="w-form">
                    <b>Request a Callback</b>
                    <span className="w-tag">Two quick details and we'll call you.</span>
                    <label>
                        <span>
                            Full Name <i>*</i>
                        </span>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                    </label>
                    <label>
                        <span>
                            Phone Number <i>*</i>
                        </span>
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone number" inputMode="tel" />
                    </label>
                    {formErr && <span className="w-err">{formErr}</span>}
                    <button className="w-submit" onClick={() => submit(m.kind === "form" ? m.intent : intentForForm || "other")}>
                        Submit
                    </button>
                </div>
            )
        return (
            <div key={m.id} className="w-row">
                {Avatar("sm")}
                <span className={"w-b" + (m.kind === "form" ? " form" : "")}>{inner}</span>
            </div>
        )
    }

    const Widget = () => (
        <div className="w">
            <div className="w-head">
                <span className="w-id">
                    {Avatar("hd")}
                    <span>
                        <b>Sparky</b>
                        <small>Chat with Sparky</small>
                    </span>
                </span>
                <span className="w-icons" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
                    </svg>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                </span>
            </div>
            <div className="w-chat" ref={chatRef}>
                <div className={"w-welcome" + (path ? " small" : "")}>
                    {Avatar("lg")}
                    <h4>Welcome to Sonepar</h4>
                    <p>I'm Sparky, your digital buddy.</p>
                    {!path && <p className="w-q">What are you looking for today?</p>}
                    {!path && (
                        <div className="w-opts">
                            {OPTIONS.map((o, i) => (
                                <button key={o.id} className="w-opt" onClick={() => pick(o)}>
                                    <span className="w-num">{i + 1}</span>
                                    <span>
                                        <b>{o.title}</b>
                                        <small>{o.sub}</small>
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {msgs.map((m) => Bubble(m, path))}
                {typing && (
                    <div className="w-row">
                        {Avatar("sm")}
                        <span className="w-b w-typing" aria-label="Sparky is typing">
                            <i />
                            <i />
                            <i />
                        </span>
                    </div>
                )}
            </div>
            {path === "other" && (
                <div className="w-chips">
                    {ASK.filter((a) => !asked.includes(a.q)).map((a) => (
                        <button key={a.q} onClick={() => ask(a)} disabled={typing}>
                            {a.q}
                        </button>
                    ))}
                </div>
            )}
            <div className="w-input">
                <span>{path === "other" ? "Tap a question above to send it" : "Type your message…"}</span>
                <span className="w-send" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17 17 7M7 7h10v10" />
                    </svg>
                </span>
            </div>
        </div>
    )

    const Inbox = () => (
        <div className="sa-inbox">
            <div className="sa-inbox-head">
                <b>Sales team inbox</b>
                <span>{leads.length ? `${leads.length} new` : "Waiting"}</span>
            </div>
            {leads.length === 0 ? (
                <p className="sa-inbox-empty">Leads you create in the chat land here, tagged and timestamped, the way they reach the sales sheet and the high-intent email.</p>
            ) : (
                leads.map((l) => (
                    <div key={l.id} className={"sa-lead" + (fresh === l.id ? " fresh" : "")}>
                        <div className="sa-lead-top">
                            <b>{l.name}</b>
                            <span>{l.time}</span>
                        </div>
                        <span className={"sa-pill" + (INTENT_TAG[l.intent].high ? " hi" : "")}>
                            {INTENT_TAG[l.intent].high ? "High intent · " : ""}
                            {INTENT_TAG[l.intent].label}
                        </span>
                        <span className="sa-lead-ctx">{l.context}</span>
                        <span className="sa-lead-route">{INTENT_TAG[l.intent].high ? "Master sheet + high-intent sheet + email alert" : "Master sheet"}</span>
                    </div>
                ))
            )}
            <button className="sa-restart" onClick={restart}>
                Restart the demo
            </button>
        </div>
    )

    const HubScreen = () => {
        if (tab === "home")
            return (
                <>
                    <div className="h-kpis">
                        {[
                            ["Widget loads today", "412", "pages where Sparky appeared"],
                            ["Conversations today", "58", "171 messages"],
                            ["Leads today", "9", "callback requests"],
                            ["Answer rate today", "91%", "knowledge questions answered"],
                        ].map(([l, v, s], i) => (
                            <div key={l} className={"h-kpi" + (i === 2 ? " hi" : "")}>
                                <span>{l}</span>
                                <b>{running ? v : "–"}</b>
                                <small>{s}</small>
                            </div>
                        ))}
                    </div>
                    <div className="h-card">
                        <div className="h-card-head">
                            <b>Services</b>
                            <button className={"h-btn" + (running ? " ghost" : "")} onClick={() => setRunning((r) => !r)}>
                                {running ? "Stop Sparky" : "Start Sparky"}
                            </button>
                        </div>
                        {["Retrieval API", "Answer workflow (n8n)", "Language model", "Secure tunnel"].map((s) => (
                            <div key={s} className="h-svc">
                                <span className={"h-dot" + (running ? " on" : "")} />
                                {s}
                                <small>{running ? "Running" : "Stopped"}</small>
                            </div>
                        ))}
                        {!running && <p className="h-warn">Sparky is stopped. Visitors see the maintenance message and can still request a callback.</p>}
                    </div>
                </>
            )
        if (tab === "analytics") {
            const hours = [2, 1, 1, 1, 2, 4, 7, 10, 13, 12, 11, 9, 8, 10, 12, 11, 9, 7, 6, 5, 6, 7, 5, 3]
            return (
                <>
                    <div className="h-kpis">
                        {[
                            ["Widget loads", "8,940", "14% opened the chat"],
                            ["Conversations", "1,216", "3,480 visitor messages"],
                            ["Leads", "164", "97 high intent · 13% of chats"],
                            ["Answer rate", "91%", "avg reply 2.4 s"],
                        ].map(([l, v, s], i) => (
                            <div key={l} className={"h-kpi" + (i === 2 ? " hi" : "")}>
                                <span>{l}</span>
                                <b>{v}</b>
                                <small>{s}</small>
                            </div>
                        ))}
                    </div>
                    <div className="h-split">
                        <div className="h-card">
                            <b>Busiest hours</b>
                            <div className="h-bars">
                                {hours.map((h, i) => (
                                    <i key={i} style={{ height: h * 7 + "%" }} className={i === 22 ? "late" : ""} title={`${i}:00`} />
                                ))}
                            </div>
                            <small className="h-axis">
                                <span>00</span>
                                <span>12</span>
                                <span>23</span>
                            </small>
                        </div>
                        <div className="h-card">
                            <b>Leads by intent</b>
                            {[
                                ["Partner Products", 46],
                                ["Masibus", 31],
                                ["General", 23],
                            ].map(([k, v]) => (
                                <div key={k as string} className="h-meter">
                                    <span>{k}</span>
                                    <i>
                                        <em style={{ width: v + "%" }} />
                                    </i>
                                    <small>{v}%</small>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )
        }
        if (tab === "live")
            return (
                <div className="h-card">
                    {liveState === "waiting" ? (
                        <div className="h-live-req">
                            <span className="h-dot red on" />
                            <div>
                                <b>A visitor on masibus.com wants an expert</b>
                                <small>Asked about calibrator rental · waiting 0:34 · falls back to the callback form at 2:00</small>
                            </div>
                            <button className="h-btn" onClick={() => setLiveState("accepted")}>
                                Accept chat
                            </button>
                        </div>
                    ) : liveState === "accepted" ? (
                        <>
                            <div className="h-card-head">
                                <b>Live with visitor · masibus.com</b>
                                <span className="h-paused">Sparky paused</span>
                            </div>
                            <div className="h-convo">
                                <span className="v">do you rent out calibrators?</span>
                                <span className="s">I couldn't find this in Sonepar India's knowledge base. Our team can help directly.</span>
                                <span className="v">talk to an expert</span>
                                <span className="me">Hi, this is the Masibus team. Yes, we can arrange that. Which model do you need?</span>
                            </div>
                            <button className="h-btn ghost" onClick={() => setLiveState("ended")}>
                                End chat
                            </button>
                        </>
                    ) : (
                        <div className="h-live-req">
                            <span className="h-dot on" />
                            <div>
                                <b>Chat ended. Sparky has taken over again.</b>
                                <small>The conversation is saved on the visitor's lead.</small>
                            </div>
                            <button className="h-btn ghost" onClick={() => setLiveState("waiting")}>
                                Replay
                            </button>
                        </div>
                    )}
                </div>
            )
        if (tab === "leads") {
            const rows = [
                { n: "Rahul S.", t: "High intent · Partner Products", s: "New", c: "Chose Partner Products · asked for ABB drives" },
                { n: "Priya K.", t: "High intent · Masibus", s: "Called", c: "Asked about the MSG-21 IIoT gateway" },
                { n: "Aman V.", t: "General", s: "New", c: "Asked about delivery outside India" },
            ]
            return (
                <div className="h-card">
                    <div className="h-card-head">
                        <b>Leads</b>
                        <span className="h-tools">
                            <span>Filter</span>
                            <span>Export CSV</span>
                        </span>
                    </div>
                    {rows.map((r, i) => (
                        <button key={r.n} className={"h-lead" + (leadOpen === i ? " open" : "")} onClick={() => setLeadOpen(i)}>
                            <b>{r.n}</b>
                            <span className={"sa-pill" + (r.t.startsWith("High") ? " hi" : "")}>{r.t}</span>
                            <small className={"h-status " + r.s.toLowerCase()}>{r.s}</small>
                            {leadOpen === i && <span className="h-lead-ctx">{r.c}. Open the conversation, add a note or change the status.</span>}
                        </button>
                    ))}
                </div>
            )
        }
        if (tab === "responses")
            return (
                <div className="h-split">
                    <div className="h-card">
                        <label className="h-field">
                            Greeting
                            <textarea value={greeting} onChange={(e) => setGreeting(e.target.value)} rows={3} />
                        </label>
                        <label className="h-field">
                            Nothing found
                            <textarea value={fallback} onChange={(e) => setFallback(e.target.value)} rows={3} />
                        </label>
                    </div>
                    <div className="h-card h-try">
                        <b>Try it</b>
                        <span className="h-try-b">{greeting || "…"}</span>
                        <span className="h-try-u">who won the cricket match</span>
                        <span className="h-try-b">{fallback || "…"}</span>
                    </div>
                </div>
            )
        if (tab === "faqs")
            return (
                <div className="h-split">
                    <div className="h-card">
                        <b>Questions Sparky couldn't answer</b>
                        {gaps.length === 0 && <p className="h-muted">No open gaps.</p>}
                        {gaps.map((g) => (
                            <div key={g} className="h-gap">
                                <span>“{g}”</span>
                                <button
                                    className="h-btn sm"
                                    onClick={() => {
                                        setGaps((s) => s.filter((x) => x !== g))
                                        setFaqs((s) => [g, ...s])
                                    }}
                                >
                                    Turn into FAQ
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="h-card">
                        <b>FAQs</b>
                        {faqs.length === 0 ? <p className="h-muted">Turn a gap into an FAQ and it appears here, ready for an answer.</p> : faqs.map((f) => <div key={f} className="h-faq">“{f}”<small>Answer drafted, waiting for sign-off</small></div>)}
                    </div>
                </div>
            )
        if (tab === "knowledge")
            return (
                <>
                    <div className="h-card">
                        <div className="h-card-head">
                            <b>Knowledge base</b>
                            <button className="h-btn" onClick={startCrawl} disabled={crawl === "running"}>
                                {crawl === "running" ? "Crawling…" : "Crawl now"}
                            </button>
                        </div>
                        <div className="h-progress">
                            <i className={crawl} />
                        </div>
                        <p className="h-muted">{crawl === "done" ? "412 pages checked · 6 changed and re-indexed · 1 held for review" : crawl === "running" ? "Comparing page fingerprints…" : "4,929 chunks indexed · next scheduled crawl tonight at 02:00"}</p>
                    </div>
                    {crawl === "done" && (
                        <div className="h-card">
                            <b>Review queue</b>
                            <div className="h-gap">
                                <span>
                                    /about-us/awards
                                    <small>Mentions “awards”, a sensitive word. Held before Sparky can quote it.</small>
                                </span>
                                {review === "pending" ? (
                                    <span className="h-pair">
                                        <button className="h-btn sm" onClick={() => setReview("approved")}>
                                            Approve
                                        </button>
                                        <button className="h-btn sm ghost" onClick={() => setReview("rejected")}>
                                            Reject
                                        </button>
                                    </span>
                                ) : (
                                    <small className={"h-status " + (review === "approved" ? "called" : "new")}>{review === "approved" ? "Live" : "Rejected"}</small>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )
        return (
            <div className="h-card">
                {[
                    ["Sonepar India", "soneparindia.com", "6,120 loads"],
                    ["Masibus", "masibus.com", "2,820 loads"],
                ].map(([n, d, t]) => (
                    <div key={n} className="h-site">
                        <b>{n}</b>
                        <small>Key locked to {d}</small>
                        <span>{t}</span>
                        <span className="h-pair">
                            <button className="h-btn sm ghost">Replace key</button>
                            <button className="h-btn sm ghost">WordPress plugin</button>
                        </span>
                    </div>
                ))}
            </div>
        )
    }

    const note = HUB_NOTES[tab]

    return (
        <div className="sa" style={style}>
            <style>{CSS}</style>

            {/* hero */}
            <header className="sa-hero">
                <div className="sa-hero-text">
                    <p className="sa-kicker">Case study 02 · Sonepar India</p>
                    <h1>Sparky, the assistant that knows when to stay quiet</h1>
                    <p className="sa-lede">I designed and built Sonepar India's first website assistant: it answers product questions from the whole catalogue, refuses to guess, and turns a curious visitor into a qualified sales lead in two taps.</p>
                </div>
                <div className="sa-hero-art" aria-hidden="true">
                    <div className="sa-glow" />
                    {sparky && <img src={sparky} alt="" draggable={false} />}
                    <span className="sa-float f1">Two taps to a lead</span>
                    <span className="sa-float f2">“I couldn't find this…” — by design</span>
                </div>
                <dl className="sa-meta">
                    <div>
                        <dt>Role</dt>
                        <dd>Product designer and builder, end to end</dd>
                    </div>
                    <div>
                        <dt>Team</dt>
                        <dd>Me, with the HR Head as sponsor and the sales team as users</dd>
                    </div>
                    <div>
                        <dt>Timeline</dt>
                        <dd>2026 · two phases · live in pilot</dd>
                    </div>
                    <div>
                        <dt>Scope</dt>
                        <dd>Conversation design, UI, retrieval pipeline, lead routing, admin hub</dd>
                    </div>
                </dl>
                <ul className="sa-stats">
                    <li>
                        <b>~92%</b>
                        <span>answer accuracy</span>
                    </li>
                    <li>
                        <b>2</b>
                        <span>taps to a qualified lead</span>
                    </li>
                    <li>
                        <b>4,929</b>
                        <span>knowledge chunks</span>
                    </li>
                    <li>
                        <b>24h</b>
                        <span>callback promise</span>
                    </li>
                </ul>
            </header>

            {/* overview */}
            <section className="sa-sec">
                <h2 className="sa-h2">Overview</h2>
                <div className="sa-tldr">
                    <div>
                        <h3>Problem</h3>
                        <p>Sonepar India's website had no way to ask a question. A buyer looking for a product code at 11 p.m. left with nothing, and the sales team never knew they were there.</p>
                    </div>
                    <div>
                        <h3>What I did</h3>
                        <p>Turned the Sparky mascot into a working assistant: an intent-first chat that captures leads, a retrieval system that answers from the real catalogue, and the Hub, where the team runs it all.</p>
                    </div>
                    <div>
                        <h3>Outcome</h3>
                        <p>Live in pilot on the Sonepar landing page. Around 92% answer accuracy, off-topic questions refused, and every lead tagged and routed to sales in seconds.</p>
                    </div>
                </div>
            </section>

            {/* the ask */}
            <section className="sa-sec sa-ask">
                <div className="sa-narrow">
                    <h2 className="sa-h2">The ask</h2>
                    <p className="sa-big">A mascot on a poster became a product with a job description.</p>
                    <p>I had already redesigned Sparky as Sonepar India's mascot. Then the HR Head of India asked a question that changed what Sparky was for.</p>
                </div>
                <blockquote className="sa-quote">
                    “If Sparky is the face of the brand, it shouldn't just wave from a poster. It should help the person who lands on our site at 11 p.m. looking for a product code.”
                    <cite>HR Head, Sonepar India</cite>
                </blockquote>
            </section>

            {/* who it serves */}
            <section className="sa-sec">
                <div className="sa-narrow">
                    <h2 className="sa-h2">Who it serves</h2>
                    <p>One assistant had to satisfy three very different people. Every screen in this project traces back to one of them.</p>
                </div>
                <div className="sa-people">
                    <article>
                        <span className="sa-ptag">Wants to buy</span>
                        <h3>The buyer</h3>
                        <p>Knows roughly what they need: a brand, a category, sometimes a code. Wants a person to call them back, not a conversation.</p>
                        <span className="sa-pneed">Sparky: two taps, two fields, a call within 24 hours</span>
                    </article>
                    <article>
                        <span className="sa-ptag">Wants to know</span>
                        <h3>The engineer</h3>
                        <p>Researching a part, asking in their own words, often loosely or with typos. Needs a precise answer and the product page.</p>
                        <span className="sa-pneed">Sparky: meaning-based search over the whole catalogue</span>
                    </article>
                    <article>
                        <span className="sa-ptag">Runs it</span>
                        <h3>The sales and marketing team</h3>
                        <p>Needs warm leads with context, control over what Sparky says, and confidence it will never embarrass the brand.</p>
                        <span className="sa-pneed">Sparky Hub: leads, responses, review and live chat</span>
                    </article>
                </div>
            </section>

            {/* phase 1 */}
            <section className="sa-sec">
                <div className="sa-narrow">
                    <h2 className="sa-h2">What the first version taught me</h2>
                    <p>There was no assistant, so I built a quick one first: a keyword bot that scanned for expected words and returned a fixed reply. It proved people would use it, and showed exactly where it broke.</p>
                </div>
                <div className="sa-compare">
                    <div>
                        <span className="sa-ctag">Phase 1 · keyword prototype</span>
                        <ul>
                            <li>Matched words, not meaning</li>
                            <li>A different phrasing fell through to a generic reply, or nothing</li>
                            <li>Visitors had to guess the right keyword</li>
                            <li>No route from interest to a lead</li>
                        </ul>
                    </div>
                    <div className="new">
                        <span className="sa-ctag">Phase 2 · the assistant</span>
                        <ul>
                            <li>Understands paraphrases, typos and follow-ups</li>
                            <li>Searches about 5,000 chunks of real catalogue content</li>
                            <li>Refuses to guess below a confidence line</li>
                            <li>Two-tap leads, routed to sales automatically</li>
                        </ul>
                    </div>
                </div>
                <p className="sa-insight">The insight: for a distributor with thousands of products across five verticals, the gap between matching words and understanding meaning is the gap between a captured lead and a lost one.</p>
            </section>

            {/* principles */}
            <section className="sa-sec">
                <div className="sa-narrow">
                    <h2 className="sa-h2">Design principles</h2>
                    <p>Every decision, from the retrieval engine to the colour of a button, was measured against three rules.</p>
                </div>
                <ol className="sa-rules">
                    <li>
                        <h3>Accuracy over eagerness</h3>
                        <p>A confident wrong answer is worse than an honest “I don't know”. Silence is a feature, not a failure.</p>
                    </li>
                    <li>
                        <h3>Talk like a colleague</h3>
                        <p>No “according to the knowledge base”. Short, warm, confident sentences, the way someone on the sales floor would reply.</p>
                    </li>
                    <li>
                        <h3>Every reply moves toward a relationship</h3>
                        <p>Sparky is the top of the sales funnel. Curiosity should become a contactable lead without the visitor ever feeling pushed.</p>
                    </li>
                </ol>
            </section>

            {/* decision 1 */}
            <section className="sa-sec">
                <div className="sa-narrow">
                    <p className="sa-dec">Decision 1</p>
                    <h2 className="sa-h2">Invert the funnel: sort intent before the first message</h2>
                    <p>Most chatbots open on an empty text box and make the visitor do the work. Sparky opens on three choices, so a buyer can become a lead before typing a word.</p>
                </div>
                <div className="sa-flows">
                    <div className="sa-flow old">
                        <span className="sa-flow-name">A typical support bot</span>
                        <ol>
                            {["Open chat", "Type a question", "Read the answer", "Ask again", "Find the contact form", "Fill 5+ fields"].map((s) => (
                                <li key={s}>{s}</li>
                            ))}
                        </ol>
                    </div>
                    <div className="sa-flow new">
                        <span className="sa-flow-name">Sparky</span>
                        <ol>
                            {["Pick a path", "Name and phone", "Qualified lead"].map((s) => (
                                <li key={s}>{s}</li>
                            ))}
                        </ol>
                    </div>
                </div>
                <p className="sa-trade">
                    <b>The trade-off.</b> I removed the business-unit dropdown and the “describe your requirement” box. The specialist loses a typed brief, but gains it back from the path the visitor chose and the conversation attached to the lead. Every field removed is a visitor retained.
                </p>

                <div className="sa-proto">
                    <div className="sa-proto-copy">
                        <h3>Try it</h3>
                        <p>This is a working copy of the widget, with Sparky's real copy. Pick a path, ask a question, request a callback, and watch the lead reach the sales inbox.</p>
                        <ul className="sa-try">
                            <li>Choose 1 or 2 to see the two-tap lead</li>
                            <li>Choose 3 to ask a product question, then an off-topic one</li>
                        </ul>
                    </div>
                    {Widget()}
                    {Inbox()}
                </div>
            </section>

            {/* decision 2 */}
            <section className="sa-sec">
                <div className="sa-narrow">
                    <p className="sa-dec">Decision 2</p>
                    <h2 className="sa-h2">From matching words to understanding meaning</h2>
                    <p>Behind the friendly surface is a retrieval system. I crawled the full Sonepar and Masibus catalogue, cleaned it, and turned it into a searchable index, so a visitor can ask in their own words and still land on the right product.</p>
                </div>
                <ol className="sa-pipe">
                    <li>
                        <b>Crawl</b>
                        <span>Sonepar and Masibus websites and product documents</span>
                    </li>
                    <li>
                        <b>Clean and chunk</b>
                        <span>4,929 knowledge chunks</span>
                    </li>
                    <li>
                        <b>Search two ways</b>
                        <span>Meaning search, plus exact matching for product codes like TC5396 or 8208-XP</span>
                    </li>
                    <li>
                        <b>Re-rank</b>
                        <span>Best matches first; off-topic results dropped</span>
                    </li>
                    <li className="gate">
                        <b>Confidence gate</b>
                        <span>Answer in Sparky's voice, or stay quiet and offer a callback</span>
                    </li>
                </ol>
                <p className="sa-trade">
                    <b>Why two kinds of search.</b> Meaning search is great at “that gateway thing” but can blur product codes into look-alikes. Codes are treated as exact identifiers and never approximated, because a near-miss part number is worse than no answer.
                </p>
            </section>

            {/* decision 3 */}
            <section className="sa-sec">
                <div className="sa-narrow">
                    <p className="sa-dec">Decision 3</p>
                    <h2 className="sa-h2">The feature I'm proudest of is silence</h2>
                    <p>Anyone can make a bot that always answers. The real design problem was deciding when Sparky should refuse. Before the gate existed, an unguarded version was asked “how many verticals?” and confidently invented “six” from an unrelated phrase on the site.</p>
                </div>
                <div className="sa-gate">
                    <div className="sa-gate-ctl">
                        <label htmlFor="sa-gate">
                            Confidence line <b>{gate.toFixed(2)}</b>
                        </label>
                        <input id="sa-gate" type="range" min={0.05} max={0.95} step={0.01} value={gate} onChange={(e) => setGate(parseFloat(e.target.value))} />
                        <span className="sa-gate-hint">Drag it. Too low and Sparky starts inventing answers; too high and it refuses questions it could answer.</span>
                    </div>
                    <div className="sa-probes">
                        {PROBES.map((p) => {
                            const answers = p.score >= gate
                            const state = answers ? (p.valid ? "good" : "bad") : p.valid ? "lost" : "good"
                            const text = answers ? (p.valid ? p.ok : p.bad) : p.valid ? "Refuses a question it could have answered" : p.ok
                            return (
                                <div key={p.q} className={"sa-probe " + state}>
                                    <span className="sa-probe-q">“{p.q}”</span>
                                    <span className="sa-probe-bar">
                                        <i style={{ width: p.score * 100 + "%" }} />
                                        <em style={{ left: gate * 100 + "%" }} />
                                    </span>
                                    <span className="sa-probe-out">
                                        <b>{state === "good" ? "Right call" : state === "bad" ? "Hallucination" : "Lost answer"}</b>
                                        {text}
                                    </span>
                                </div>
                            )
                        })}
                        <small className="sa-note">Match scores are illustrative. The real line was calibrated on test questions, and a re-ranking layer pushed accuracy to about 92%.</small>
                    </div>
                </div>
                <p className="sa-trade">
                    <b>A second safety net.</b> Some facts, like how many verticals Sonepar has, carry the company's name. Those curated answers sit behind a human sign-off gate and stay withheld until someone verifies them.
                </p>
            </section>

            {/* the hub */}
            <section className="sa-sec">
                <div className="sa-narrow">
                    <p className="sa-dec">Decision 4</p>
                    <h2 className="sa-h2">Design for the people who run it: the Sparky Hub</h2>
                    <p>A pilot dies when every change needs the person who built it. I designed the Hub so marketing and sales can run Sparky themselves: see what's happening, edit what it says, take over a chat, and keep its knowledge fresh and safe. Every website talks to the Hub, which checks the key, logs the visit, decides the intent and routes the reply.</p>
                </div>
                <div className="sa-hub">
                    <div className="h">
                        <aside className="h-side">
                            <span className="h-logo">
                                {Avatar("xs")}
                                Sparky Hub
                            </span>
                            {HUB_NAV.map((n) =>
                                n.group ? (
                                    <span key={n.label} className="h-group">
                                        {n.label}
                                    </span>
                                ) : (
                                    <button key={n.id} className={"h-nav" + (tab === n.id ? " on" : "")} onClick={() => setTab(n.id!)}>
                                        {n.label}
                                        {n.id === "live" && liveState === "waiting" && <span className="h-badge">1</span>}
                                    </button>
                                )
                            )}
                        </aside>
                        <div className="h-main">
                            <div className="h-top">
                                <b>{HUB_NAV.find((n) => n.id === tab)?.label}</b>
                                <span className="h-sample">Sample data</span>
                            </div>
                            {HubScreen()}
                        </div>
                    </div>
                    <div className="sa-hub-note">
                        <h3>{note.title}</h3>
                        <p>{note.text}</p>
                        <span className="sa-hub-hint">Click through the sections on the left to see each screen.</span>
                    </div>
                </div>
            </section>

            {/* craft */}
            <section className="sa-sec">
                <div className="sa-narrow">
                    <h2 className="sa-h2">The craft</h2>
                    <p>The widget had to feel like part of Sonepar the instant it appeared, and stay effortless on any screen.</p>
                </div>
                <div className="sa-craft">
                    {[
                        ["Fly-in entrance", "Sparky sweeps in, waves and docks as the chat bubble: motion that earns attention without blocking the page."],
                        ["Brand-true palette", "Sonepar navy #27348B and cyan #009EE3, carried straight from the website. The mascot is the avatar."],
                        ["Conversation memory", "“Any other meters apart from this one?” is understood in context, not treated as a new question."],
                        ["Never asks twice", "Once a visitor shares details, later prompts reassure instead of asking again."],
                        ["Fully responsive", "Near full screen on a phone, comfortable on a laptop, scaled up on large monitors."],
                        ["Graceful when down", "If the engine is stopped, the widget shows a maintenance note and still takes callbacks."],
                    ].map(([t, d]) => (
                        <div key={t}>
                            <h3>{t}</h3>
                            <p>{d}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* results */}
            <section className="sa-sec sa-results">
                <div className="sa-narrow">
                    <h2 className="sa-h2">Where it stands</h2>
                    <p className="sa-big">From a poster mascot to a working product carrying the Sonepar name.</p>
                    <p>Sparky is live in pilot, hosted and answering real questions on the Sonepar landing page.</p>
                </div>
                <ul className="sa-stats big">
                    <li>
                        <b>~92%</b>
                        <span>answer accuracy after re-ranking</span>
                    </li>
                    <li>
                        <b>4,929</b>
                        <span>knowledge chunks indexed</span>
                    </li>
                    <li>
                        <b>2</b>
                        <span>taps from hello to a lead</span>
                    </li>
                    <li>
                        <b>5</b>
                        <span>intents routed automatically</span>
                    </li>
                </ul>
            </section>

            {/* reflection */}
            <section className="sa-sec">
                <div className="sa-reflect">
                    <div>
                        <h2 className="sa-h2">What I learned</h2>
                        <ul>
                            <li>
                                <b>Trust is the product.</b> Users forgive “I don't know”; a brand never recovers from a confident wrong answer.
                            </li>
                            <li>
                                <b>Fewer fields beat smarter forms.</b> The context a form asks for can usually be inferred from the path a person took.
                            </li>
                            <li>
                                <b>Internal tools are product too.</b> The Hub decides whether the pilot survives after its builder moves on.
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="sa-h2">What's next</h2>
                        <ul>
                            <li>Measure lead-to-sale conversion across the pilot, not just leads captured</li>
                            <li>Move from a temporary tunnel to a fixed domain before Masibus goes live</li>
                            <li>Bring PDFs and new product codes into the scheduled crawl automatically</li>
                        </ul>
                    </div>
                </div>
            </section>

            <footer className="sa-end">
                <p>It started with a redesign. Case study 01 is where Sparky was born; this was giving that voice something to say.</p>
                <div className="sa-actions">
                    <a className="sa-btn" href={mascotLink} onClick={nav(mascotLink)}>
                        Read case study 01: the mascot
                    </a>
                    <a className="sa-btn ghost" href={liveLink} onClick={nav(liveLink)}>
                        See the full write-up ↗
                    </a>
                    <a className="sa-btn ghost" href={backLink} onClick={nav(backLink)}>
                        Back to the gallery
                    </a>
                </div>
            </footer>
        </div>
    )
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
.sa{box-sizing:border-box;--bg:#05080F;--panel:#0B1120;--ink:#E8EEF8;--mute:#93A1B8;--blue:#2F9BFF;--neon:#FF8A2A;--line:rgba(255,255,255,.08);--navy:#27348B;--cyan:#009EE3;position:relative;width:100%;max-width:1200px;margin-inline:auto;padding:140px clamp(20px,5vw,72px) 110px;background:var(--bg);color:var(--ink);font-family:Inter,"Inter Display",system-ui,sans-serif;font-size:17px;line-height:1.6;overflow:clip}
.sa *{box-sizing:border-box}
:where(.sa) button{font:inherit;color:inherit}
.sa h1,.sa h2,.sa h3,.sa h4{margin:0;color:#fff;letter-spacing:-.02em}
.sa p{margin:0 0 14px;color:var(--mute)}
.sa a{color:inherit}
.sa-sec{margin-top:clamp(96px,11vw,150px)}
.sa-narrow{max-width:700px}
.sa-h2{font-size:clamp(30px,3.6vw,46px);line-height:1.08;font-weight:800;margin-bottom:16px!important}
.sa-big{font-size:clamp(22px,2.4vw,28px)!important;line-height:1.35;color:var(--ink)!important;font-weight:600;letter-spacing:-.01em}
.sa-dec{margin:0 0 10px!important;font-size:14px;font-weight:700;color:var(--neon)!important}
.sa-kicker{margin:0 0 18px!important;font-size:14px;font-weight:600;color:var(--blue)!important}
/* hero */
.sa-hero{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:24px clamp(24px,4vw,56px);align-items:center}
.sa-hero h1{font-size:clamp(42px,5.6vw,76px);line-height:1;font-weight:800;letter-spacing:-.035em}
.sa-lede{margin-top:24px!important;font-size:19px;line-height:1.6;max-width:600px;color:#C6D1E3!important}
.sa-hero-art{position:relative;height:100%;min-height:360px;display:grid;place-items:center}
.sa-glow{position:absolute;inset:8% 4%;border-radius:50%;background:radial-gradient(circle,rgba(47,155,255,.35),rgba(47,155,255,0) 65%)}
.sa-hero-art img{position:relative;height:min(420px,46vh);width:auto;filter:drop-shadow(0 30px 50px rgba(0,0,0,.55))}
.sa-float{position:absolute;padding:9px 14px;border-radius:14px;font-size:13.5px;font-weight:600;background:rgba(15,22,40,.86);border:1px solid var(--line);backdrop-filter:blur(8px);white-space:nowrap}
.sa-float.f1{left:0;top:18%;color:#fff}
.sa-float.f2{right:0;bottom:16%;color:var(--neon)}
.sa-meta{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin:28px 0 0;padding:24px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.sa-meta dt{font-size:13px;font-weight:600;color:var(--blue);margin-bottom:6px}
.sa-meta dd{margin:0;font-size:15px;line-height:1.5;color:var(--ink)}
.sa-stats{grid-column:1/-1;list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.sa-stats b{display:block;font-size:clamp(34px,4vw,52px);font-weight:800;letter-spacing:-.03em;color:#fff;font-variant-numeric:tabular-nums;line-height:1.05}
.sa-stats span{font-size:14.5px;color:var(--mute)}
.sa-stats.big{margin-top:36px}
.sa-stats.big li{padding:24px;border-radius:18px;background:var(--panel);border:1px solid var(--line)}
/* overview */
.sa-tldr{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(20px,3vw,40px)}
.sa-tldr h3{font-size:18px;margin-bottom:10px;color:var(--blue)}
.sa-tldr p{color:#C6D1E3}
/* ask */
.sa-ask{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(28px,5vw,64px);align-items:center}
.sa-quote{margin:0;padding:30px 32px;border-radius:20px;background:linear-gradient(160deg,#0F1A33,#0A1122);border:1px solid var(--line);font-size:clamp(19px,1.9vw,23px);line-height:1.5;color:#fff;font-weight:500}
.sa-quote cite{display:block;margin-top:16px;font-size:14px;font-style:normal;font-weight:600;color:var(--blue)}
/* people */
.sa-people{margin-top:30px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.sa-people article{display:flex;flex-direction:column;padding:26px;border-radius:20px;background:var(--panel);border:1px solid var(--line)}
.sa-ptag{font-size:13px;font-weight:700;color:var(--neon);margin-bottom:10px}
.sa-people h3{font-size:22px;margin-bottom:10px}
.sa-pneed{margin-top:auto;padding-top:14px;border-top:1px solid var(--line);font-size:14.5px;font-weight:600;color:var(--ink)}
/* compare */
.sa-compare{margin-top:30px;display:grid;grid-template-columns:1fr 1fr;gap:18px}
.sa-compare > div{padding:26px;border-radius:20px;border:1px solid var(--line);background:rgba(255,255,255,.02)}
.sa-compare > div.new{background:linear-gradient(160deg,rgba(47,155,255,.14),rgba(47,155,255,.03));border-color:rgba(47,155,255,.35)}
.sa-ctag{display:block;font-size:14px;font-weight:700;color:var(--mute);margin-bottom:14px}
.new .sa-ctag{color:var(--blue)}
.sa-compare ul{margin:0;padding-left:20px;display:grid;gap:8px;color:var(--ink);font-size:16px}
.sa-compare li::marker{color:var(--mute)}
.sa-insight{margin-top:26px!important;max-width:760px;font-size:19px;line-height:1.55;color:#fff!important;padding-left:18px;border-left:3px solid var(--neon)}
/* rules */
.sa-rules{list-style:none;margin:30px 0 0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:18px;counter-reset:r}
.sa-rules li{counter-increment:r;padding:26px;border-radius:20px;background:var(--panel);border:1px solid var(--line)}
.sa-rules li::before{content:counter(r);display:grid;place-items:center;width:34px;height:34px;margin-bottom:16px;border-radius:50%;background:rgba(47,155,255,.15);color:var(--blue);font-weight:800}
.sa-rules h3{font-size:20px;margin-bottom:10px}
/* flows */
.sa-flows{margin-top:30px;display:grid;gap:14px}
.sa-flow{display:grid;grid-template-columns:190px 1fr;gap:18px;align-items:center;padding:18px 22px;border-radius:18px;border:1px solid var(--line)}
.sa-flow.new{border-color:rgba(255,138,42,.45);background:rgba(255,138,42,.06)}
.sa-flow-name{font-size:15px;font-weight:700;color:var(--mute)}
.sa-flow.new .sa-flow-name{color:var(--neon)}
.sa-flow ol{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:10px 26px;align-items:center}
.sa-flow li{position:relative;padding:7px 13px;border-radius:99px;font-size:14.5px;font-weight:600;color:var(--ink);background:rgba(255,255,255,.05)}
.sa-flow li:not(:first-child)::before{content:"";position:absolute;left:-20px;top:50%;width:14px;height:1px;background:rgba(255,255,255,.3)}
.sa-flow.new li{background:var(--neon);color:#170B00}
.sa-flow.new li:not(:first-child)::before{background:var(--neon)}
.sa-trade{margin-top:24px!important;max-width:780px;font-size:16px;color:#C6D1E3!important}
.sa-trade b{color:#fff}
/* prototype */
.sa-proto{margin-top:40px;display:grid;grid-template-columns:minmax(0,.9fr) 360px minmax(0,1fr);gap:clamp(20px,3vw,36px);align-items:start;padding:clamp(22px,3vw,36px);border-radius:26px;background:radial-gradient(120% 100% at 50% 0%,#101C38,#070C18);border:1px solid var(--line)}
.sa-proto-copy h3{font-size:26px;margin-bottom:10px}
.sa-try{margin:8px 0 0;padding-left:18px;display:grid;gap:6px;font-size:15px;color:var(--ink)}
.sa-try li::marker{color:var(--neon)}
/* widget (Sonepar brand) */
.w{display:flex;flex-direction:column;height:560px;border-radius:22px;overflow:hidden;background:#F4F7FC;color:#111A2E;box-shadow:0 30px 70px rgba(0,0,0,.5);font-size:14px;line-height:1.45}
.w-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:linear-gradient(135deg,var(--navy),#1F5FB4 60%,var(--cyan))}
.w-id{display:flex;align-items:center;gap:10px;color:#fff}
.w-id b{display:block;font-size:15px}
.w-id small{font-size:12px;opacity:.85}
.w-icons{display:flex;gap:12px;align-items:center}
.sa-av{flex:none;display:block;border-radius:50%;overflow:hidden;background:#DCE8FA}
.sa-av img{width:100%;height:100%;object-fit:cover;object-position:50% 8%;transform:scale(1.9);transform-origin:50% 12%}
.sa-av.hd{width:36px;height:36px;box-shadow:0 0 0 2px rgba(255,255,255,.6)}
.sa-av.sm{width:26px;height:26px}
.sa-av.xs{width:22px;height:22px}
.sa-av.lg{width:64px;height:64px;margin:0 auto 8px;box-shadow:0 6px 16px rgba(39,52,139,.25)}
.w-chat{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin}
.w-welcome{text-align:center;padding:4px 2px 6px}
.w-welcome h4{color:var(--navy);font-size:19px;letter-spacing:-.01em}
.w-welcome p{margin:4px 0 0;color:#5B688A;font-size:13.5px}
.w-welcome .w-q{margin-top:12px;color:#111A2E;font-weight:600}
.w-welcome.small .sa-av.lg{width:44px;height:44px}
.w-welcome.small h4{font-size:16px}
.w-opts{display:grid;gap:8px;margin-top:12px;text-align:left}
.w-opt{all:unset;cursor:pointer;display:flex;gap:10px;align-items:center;padding:11px 12px;border-radius:14px;background:#fff;border:1px solid #E2E8F3;transition:border-color .2s,transform .2s,box-shadow .2s}
.w-opt:hover{border-color:var(--cyan);transform:translateY(-1px);box-shadow:0 6px 16px rgba(0,158,227,.15)}
.w-opt:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}
.w-num{flex:none;display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--navy);color:#fff;font-size:12.5px;font-weight:700}
.w-opt b{display:block;font-size:13.5px;color:#111A2E}
.w-opt small{font-size:12px;color:#5B688A}
.w-row{display:flex;gap:8px;align-items:flex-end;animation:w-in .3s ease}
.w-row.me{justify-content:flex-end}
@keyframes w-in{from{opacity:0;transform:translateY(6px)}}
.w-b{max-width:82%;padding:9px 12px;border-radius:16px 16px 16px 4px;background:#fff;border:1px solid #E2E8F3;color:#111A2E}
.w-b.me{border-radius:16px 16px 4px 16px;background:var(--navy);border-color:var(--navy);color:#fff}
.w-b.form{width:82%}
.w-more{display:table;margin-top:8px;padding:5px 11px;border-radius:99px;background:rgba(0,158,227,.12);color:#0677B0;font-weight:600;font-size:12.5px}
.w-cta{all:unset;cursor:pointer;display:inline-block;margin-top:9px;padding:7px 13px;border-radius:99px;background:var(--navy);color:#fff;font-size:12.5px;font-weight:600}
.w-cta:focus-visible,.w-submit:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}
.w-ok{display:block;color:#145C3E}
.w-ok b{color:#111A2E}
.w-form{display:grid;gap:7px}
.w-form > b{color:var(--navy);font-size:14.5px}
.w-tag{font-size:12px;color:#5B688A;margin-top:-4px}
.w-form label{display:grid;gap:3px;font-size:12px;font-weight:600;color:#33405F}
.w-form label i{font-style:normal;color:#D64550}
.w-form input{font:inherit;font-size:13px;padding:8px 10px;border-radius:10px;border:1px solid #D9E2F2;background:#fff;color:#111A2E;outline:none}
.w-form input:focus{border-color:var(--cyan);box-shadow:0 0 0 3px rgba(0,158,227,.15)}
.w-err{font-size:12px;color:#D64550}
.w-submit{all:unset;cursor:pointer;text-align:center;padding:9px;border-radius:10px;background:linear-gradient(135deg,var(--navy),var(--cyan));color:#fff;font-weight:700;font-size:13px}
.w-typing{display:flex;gap:4px;padding:12px 14px}
.w-typing i{width:6px;height:6px;border-radius:50%;background:#8394B4;animation:w-dot 1s infinite}
.w-typing i:nth-child(2){animation-delay:.15s}.w-typing i:nth-child(3){animation-delay:.3s}
@keyframes w-dot{50%{transform:translateY(-4px);opacity:.5}}
.w-chips{display:flex;flex-direction:column;gap:6px;padding:8px 12px 0}
.w-chips button{all:unset;cursor:pointer;padding:8px 12px;border-radius:12px;background:#fff;border:1px dashed var(--cyan);color:#0677B0;font-size:12.5px;font-weight:600}
.w-chips button[disabled]{opacity:.5;cursor:default}
.w-input{display:flex;align-items:center;gap:8px;margin:10px 12px 12px;padding:6px 6px 6px 14px;border-radius:99px;background:#fff;border:1px solid #E2E8F3;color:#8394B4;font-size:13px}
.w-input span:first-child{flex:1}
.w-send{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--navy),var(--cyan))}
/* inbox */
.sa-inbox{display:flex;flex-direction:column;gap:10px;min-height:560px}
.sa-inbox-head{display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:1px solid var(--line)}
.sa-inbox-head b{color:#fff;font-size:16px}
.sa-inbox-head span{font-size:13px;font-weight:600;color:var(--neon)}
.sa-inbox-empty{font-size:14.5px;line-height:1.55}
.sa-lead{display:grid;gap:6px;padding:14px;border-radius:14px;background:var(--panel);border:1px solid var(--line)}
.sa-lead.fresh{animation:sa-drop .6s cubic-bezier(.2,.8,.2,1);border-color:rgba(255,138,42,.5)}
@keyframes sa-drop{from{opacity:0;transform:translateY(-14px) scale(.98)}}
.sa-lead-top{display:flex;justify-content:space-between}
.sa-lead-top b{color:#fff}
.sa-lead-top span{font-size:12.5px;color:var(--mute);font-variant-numeric:tabular-nums}
.sa-pill{justify-self:start;padding:3px 9px;border-radius:99px;font-size:12px;font-weight:700;background:rgba(255,255,255,.08);color:var(--ink)}
.sa-pill.hi{background:rgba(255,138,42,.16);color:var(--neon)}
.sa-lead-ctx{font-size:13.5px;color:var(--ink)}
.sa-lead-route{font-size:12.5px;color:var(--mute)}
.sa-restart{all:unset;cursor:pointer;margin-top:auto;align-self:flex-start;font-size:13.5px;font-weight:600;color:var(--blue)}
.sa-restart:focus-visible{outline:2px solid var(--blue);outline-offset:3px}
/* pipeline */
.sa-pipe{list-style:none;margin:32px 0 0;padding:0;display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.sa-pipe li{position:relative;display:flex;flex-direction:column;gap:6px;padding:20px 18px;border-radius:18px;background:var(--panel);border:1px solid var(--line)}
.sa-pipe li:not(:last-child)::after{content:"";position:absolute;right:-12px;top:50%;width:12px;height:2px;background:rgba(47,155,255,.5)}
.sa-pipe b{color:#fff;font-size:16px}
.sa-pipe span{font-size:13.5px;line-height:1.5;color:var(--mute)}
.sa-pipe li.gate{border-color:rgba(255,138,42,.5);background:rgba(255,138,42,.07)}
.sa-pipe li.gate b{color:var(--neon)}
/* gate */
.sa-gate{margin-top:32px;display:grid;grid-template-columns:280px 1fr;gap:clamp(20px,3vw,40px);padding:clamp(22px,3vw,32px);border-radius:24px;background:var(--panel);border:1px solid var(--line)}
.sa-gate-ctl label{display:flex;justify-content:space-between;font-weight:700;color:#fff;margin-bottom:12px}
.sa-gate-ctl label b{color:var(--neon);font-variant-numeric:tabular-nums}
.sa-gate-ctl input{width:100%;accent-color:var(--neon)}
.sa-gate-hint{display:block;margin-top:12px;font-size:14px;line-height:1.55;color:var(--mute)}
.sa-probes{display:grid;gap:12px}
.sa-probe{display:grid;grid-template-columns:minmax(0,1.1fr) 140px minmax(0,1.3fr);gap:14px;align-items:center;padding:12px 14px;border-radius:14px;border:1px solid var(--line);transition:background .25s,border-color .25s}
.sa-probe-q{font-size:14px;color:var(--ink)}
.sa-probe-bar{position:relative;height:8px;border-radius:99px;background:rgba(255,255,255,.08)}
.sa-probe-bar i{position:absolute;inset:0 auto 0 0;border-radius:99px;background:var(--blue)}
.sa-probe-bar em{position:absolute;top:-5px;width:2px;height:18px;background:var(--neon);transition:left .1s}
.sa-probe-out{font-size:13.5px;line-height:1.45;color:var(--mute)}
.sa-probe-out b{display:block;font-size:13px}
.sa-probe.good b{color:#3BD671}
.sa-probe.bad{border-color:rgba(255,77,90,.5);background:rgba(255,77,90,.07)}
.sa-probe.bad b{color:#FF6B75}
.sa-probe.lost{border-color:rgba(255,190,70,.45);background:rgba(255,190,70,.06)}
.sa-probe.lost b{color:#FFC14D}
.sa-note{font-size:12.5px;color:var(--mute)}
/* hub (Sonepar admin, light) */
.sa-hub{margin-top:34px;display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:clamp(20px,3vw,36px);align-items:start}
.h{display:grid;grid-template-columns:190px minmax(0,1fr);min-height:470px;border-radius:20px;overflow:hidden;background:#F4F7FC;color:#33405F;font-size:13.5px;line-height:1.45;box-shadow:0 30px 70px rgba(0,0,0,.5)}
.h-side{display:flex;flex-direction:column;gap:2px;padding:16px 10px;background:#fff;border-right:1px solid #E2E8F3}
.h-logo{display:flex;align-items:center;gap:8px;padding:2px 8px 14px;font-weight:800;color:var(--navy);font-size:14.5px}
.h-group{padding:12px 10px 4px;font-size:11.5px;font-weight:700;color:#8394B4}
.h-nav{all:unset;cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-radius:10px;color:#33405F;font-weight:500}
.h-nav:hover{background:#F4F7FC}
.h-nav.on{background:rgba(39,52,139,.08);color:var(--navy);font-weight:700}
.h-nav:focus-visible{outline:2px solid var(--cyan)}
.h-badge{display:grid;place-items:center;min-width:18px;height:18px;border-radius:99px;background:#D64550;color:#fff;font-size:11px;font-weight:700}
.h-main{display:flex;flex-direction:column;gap:12px;padding:16px;min-width:0}
.h-top{display:flex;justify-content:space-between;align-items:center}
.h-top b{font-size:18px;color:#111A2E}
.h-sample{font-size:11.5px;font-weight:700;padding:3px 8px;border-radius:99px;background:#FFF3DC;color:#B5720C}
.h-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.h-kpi{display:grid;gap:2px;padding:12px;border-radius:14px;background:#fff;box-shadow:0 1px 2px rgba(17,26,46,.04),0 8px 24px rgba(17,26,46,.06)}
.h-kpi span{font-size:11.5px;font-weight:600;color:#5B688A}
.h-kpi b{font-size:22px;color:#111A2E;font-variant-numeric:tabular-nums}
.h-kpi small{font-size:11px;color:#8394B4}
.h-kpi.hi{background:linear-gradient(135deg,var(--navy),var(--cyan))}
.h-kpi.hi span,.h-kpi.hi b,.h-kpi.hi small{color:#fff}
.h-card{display:grid;gap:8px;padding:14px;border-radius:14px;background:#fff;box-shadow:0 1px 2px rgba(17,26,46,.04),0 8px 24px rgba(17,26,46,.06)}
.h-card > b{color:#111A2E}
.h-card-head{display:flex;justify-content:space-between;align-items:center;gap:10px}
.h-card-head b{color:#111A2E}
.h-btn{all:unset;cursor:pointer;padding:7px 13px;border-radius:10px;background:var(--navy);color:#fff;font-size:12.5px;font-weight:700;white-space:nowrap}
.h-btn.ghost{background:#fff;color:var(--navy);box-shadow:inset 0 0 0 1px #D9E2F2}
.h-btn.sm{padding:5px 10px;font-size:12px}
.h-btn[disabled]{opacity:.6;cursor:default}
.h-btn:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}
.h-svc{display:flex;align-items:center;gap:9px;padding:8px 0;border-top:1px solid #EEF2F8;color:#111A2E}
.h-svc small{margin-left:auto;color:#8394B4}
.h-dot{width:9px;height:9px;border-radius:50%;background:#C9D3E5}
.h-dot.on{background:#1F9E6B;box-shadow:0 0 0 4px rgba(31,158,107,.15)}
.h-dot.red.on{background:#D64550;box-shadow:0 0 0 4px rgba(214,69,80,.18);animation:h-pulse 1.4s infinite}
@keyframes h-pulse{50%{box-shadow:0 0 0 8px rgba(214,69,80,.05)}}
.h-warn{margin:4px 0 0!important;padding:9px 11px;border-radius:10px;background:#FFF3DC;color:#8A5A0A!important;font-size:12.5px}
.h-split{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.h-bars{display:flex;align-items:flex-end;gap:3px;height:110px;padding-top:6px}
.h-bars i{flex:1;border-radius:3px 3px 0 0;background:rgba(0,158,227,.35)}
.h-bars i.late{background:var(--navy)}
.h-axis{display:flex;justify-content:space-between;font-size:11px;color:#8394B4}
.h-meter{display:grid;grid-template-columns:110px 1fr 36px;gap:8px;align-items:center;font-size:12.5px}
.h-meter i{display:block;height:8px;border-radius:99px;background:#EEF2F8;overflow:hidden}
.h-meter em{display:block;height:100%;background:linear-gradient(90deg,var(--navy),var(--cyan))}
.h-meter small{text-align:right;color:#5B688A}
.h-live-req{display:flex;align-items:center;gap:12px}
.h-live-req div{flex:1;display:grid;gap:2px}
.h-live-req b{color:#111A2E}
.h-live-req small{font-size:12px;color:#5B688A}
.h-paused{font-size:11.5px;font-weight:700;padding:3px 8px;border-radius:99px;background:#FDE8EA;color:#D64550}
.h-convo{display:flex;flex-direction:column;gap:6px;padding:10px;border-radius:12px;background:#F4F7FC}
.h-convo span{max-width:80%;padding:7px 10px;border-radius:12px;font-size:12.5px}
.h-convo .v{align-self:flex-start;background:#fff;border:1px solid #E2E8F3;color:#111A2E}
.h-convo .s{align-self:flex-start;background:#EEF2F8;color:#5B688A;font-style:italic}
.h-convo .me{align-self:flex-end;background:var(--navy);color:#fff}
.h-tools{display:flex;gap:8px}
.h-tools span{font-size:12px;font-weight:600;padding:4px 9px;border-radius:8px;box-shadow:inset 0 0 0 1px #D9E2F2;color:var(--navy)}
.h-lead{all:unset;cursor:pointer;display:grid;grid-template-columns:110px 1fr auto;gap:8px;align-items:center;padding:10px 6px;border-top:1px solid #EEF2F8}
.h-lead b{color:#111A2E}
.h-lead .sa-pill{background:#EEF2F8;color:#33405F}
.h-lead .sa-pill.hi{background:#FFF0E3;color:#C25E0C}
.h-lead.open{background:#F8FAFE;border-radius:10px}
.h-lead-ctx{grid-column:1/-1;font-size:12.5px;color:#5B688A}
.h-status{font-size:11.5px;font-weight:700;padding:3px 8px;border-radius:99px}
.h-status.new{background:#E6F5FC;color:#0677B0}
.h-status.called{background:#E3F5EC;color:#1F9E6B}
.h-field{display:grid;gap:5px;font-size:12px;font-weight:700;color:#33405F}
.h-field textarea{font:inherit;font-size:13px;font-weight:400;padding:8px 10px;border-radius:10px;border:1px solid #D9E2F2;color:#111A2E;resize:vertical;outline:none}
.h-field textarea:focus{border-color:var(--cyan);box-shadow:0 0 0 3px rgba(0,158,227,.15)}
.h-try{align-content:start;background:#F8FAFE}
.h-try span{max-width:88%;padding:8px 11px;border-radius:12px;font-size:12.5px}
.h-try-b{justify-self:start;background:#fff;border:1px solid #E2E8F3;color:#111A2E}
.h-try-u{justify-self:end;background:var(--navy);color:#fff}
.h-gap{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 0;border-top:1px solid #EEF2F8;color:#111A2E}
.h-gap small{display:block;font-size:12px;color:#5B688A}
.h-faq{display:grid;gap:2px;padding:9px 0;border-top:1px solid #EEF2F8;color:#111A2E;animation:w-in .3s ease}
.h-faq small{font-size:12px;color:#1F9E6B}
.h-muted{margin:0!important;font-size:12.5px;color:#8394B4!important}
.h-pair{display:flex;gap:6px}
.h-progress{height:6px;border-radius:99px;background:#EEF2F8;overflow:hidden}
.h-progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--navy),var(--cyan))}
.h-progress i.running{width:100%;transition:width 1.6s ease}
.h-progress i.done{width:100%}
.h-site{display:grid;grid-template-columns:1fr auto;gap:2px 10px;padding:10px 0;border-top:1px solid #EEF2F8}
.h-site b{color:#111A2E}
.h-site small{grid-column:1;font-size:12px;color:#5B688A}
.h-site > span:nth-of-type(1){grid-column:2;grid-row:1;font-size:12px;color:#5B688A}
.h-site .h-pair{grid-column:1/-1;margin-top:6px}
.sa-hub-note{position:sticky;top:120px;padding:24px;border-radius:20px;background:var(--panel);border:1px solid var(--line)}
.sa-hub-note h3{font-size:20px;margin-bottom:10px}
.sa-hub-hint{display:block;margin-top:6px;font-size:13px;color:var(--blue)}
/* craft */
.sa-craft{margin-top:30px;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:20px;overflow:hidden}
.sa-craft > div{padding:24px;background:var(--bg)}
.sa-craft h3{font-size:17px;margin-bottom:8px}
.sa-craft p{font-size:15px;margin:0}
/* reflect */
.sa-reflect{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,64px)}
.sa-reflect ul{margin:0;padding-left:20px;display:grid;gap:12px;color:#C6D1E3}
.sa-reflect li::marker{color:var(--neon)}
.sa-reflect b{color:#fff}
/* end */
.sa-end{margin-top:clamp(96px,11vw,150px);padding-top:40px;border-top:1px solid var(--line)}
.sa-end p{max-width:620px;font-size:18px;color:var(--ink)}
.sa-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px}
.sa-btn{display:inline-flex;align-items:center;height:48px;padding:0 22px;border-radius:999px;font-size:15px;font-weight:700;text-decoration:none;color:#fff;background:var(--blue);transition:transform .25s,box-shadow .25s}
.sa-btn:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(47,155,255,.35)}
.sa-btn.ghost{background:transparent;box-shadow:inset 0 0 0 1px rgba(255,255,255,.25)}
.sa-btn:focus-visible{outline:2px solid #fff;outline-offset:3px}
@media (max-width:980px){
.sa-proto{grid-template-columns:1fr 1fr}
.sa-proto-copy{grid-column:1/-1}
.sa-pipe{grid-template-columns:1fr 1fr}
.sa-pipe li::after{display:none}
.sa-hub{grid-template-columns:1fr}
.sa-hub-note{position:static}
}
@media (max-width:760px){
.sa{padding-top:110px;font-size:16px}
.sa-hero,.sa-ask,.sa-reflect,.sa-compare,.sa-gate{grid-template-columns:1fr}
.sa-hero-art{min-height:300px}
.sa-meta,.sa-stats{grid-template-columns:1fr 1fr}
.sa-tldr,.sa-people,.sa-rules,.sa-craft{grid-template-columns:1fr}
.sa-flow{grid-template-columns:1fr}
.sa-proto{grid-template-columns:1fr}
.sa-inbox{min-height:0}
.sa-probe{grid-template-columns:1fr}
.h{grid-template-columns:1fr}
.h-side{flex-direction:row;flex-wrap:nowrap;overflow-x:auto;border-right:0;border-bottom:1px solid #E2E8F3;padding:10px}
.h-logo,.h-group{display:none}
.h-nav{white-space:nowrap}
.h-kpis{grid-template-columns:1fr 1fr}
.h-split{grid-template-columns:1fr}
}
@media (prefers-reduced-motion:reduce){.w-row,.sa-lead.fresh,.h-faq{animation:none}.w-typing i,.h-dot.red.on{animation:none}.sa-btn,.w-opt{transition:none}}
`

addPropertyControls(SparkyAssistantCaseStudy, {
    sparky: { type: ControlType.String, title: "Sparky image", defaultValue: SPARKY },
    liveLink: { type: ControlType.String, title: "Full write-up", defaultValue: "https://sparkythechatbot.netlify.app/" },
    backLink: { type: ControlType.String, title: "Back link", defaultValue: "/portfolio-2" },
    mascotLink: { type: ControlType.String, title: "Mascot case study", defaultValue: "/case-study/sparky-mascot-redesign" },
})
