import { addPropertyControls, ControlType } from "framer"
import * as FramerLib from "framer"
import { useState, type CSSProperties } from "react"

type Props = {
    backLink: string
    nextLink: string
    nextLabel: string
    note: string
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

/* ---------- the candidate state machine ---------- */

type Role = "hr" | "panel"
type State = "applied" | "r1" | "r1done" | "r2" | "r2done" | "r3" | "r3done" | "selected" | "rejected"
type Action = { id: string; label: string; to: State; role: Role; email?: "invite" | "regret" | "offer" | "resched"; kind?: "primary" | "danger" | "plain"; round?: number }

const STATE_INFO: Record<State, { label: string; tone: string; step: number }> = {
    applied: { label: "Applied", tone: "slate", step: 0 },
    r1: { label: "Round 1 scheduled", tone: "blue", step: 1 },
    r1done: { label: "Round 1 form in", tone: "violet", step: 1 },
    r2: { label: "Round 2 scheduled", tone: "blue", step: 2 },
    r2done: { label: "Round 2 form in", tone: "violet", step: 2 },
    r3: { label: "Round 3 scheduled", tone: "blue", step: 3 },
    r3done: { label: "Round 3 form in", tone: "violet", step: 3 },
    selected: { label: "Selected", tone: "green", step: 4 },
    rejected: { label: "Not selected", tone: "red", step: -1 },
}

// every state lists only the moves that make sense from it, and who is allowed to make them
const MOVES: Record<State, Action[]> = {
    applied: [
        { id: "s1", label: "Schedule Round 1", to: "r1", role: "hr", email: "invite", kind: "primary", round: 1 },
        { id: "x", label: "Reject", to: "rejected", role: "hr", email: "regret", kind: "danger" },
    ],
    r1: [
        { id: "f1", label: "Submit Round 1 form", to: "r1done", role: "panel", kind: "primary", round: 1 },
        { id: "rs1", label: "Reschedule", to: "r1", role: "hr", email: "resched", kind: "plain", round: 1 },
    ],
    r1done: [
        { id: "s2", label: "Shortlist for Round 2", to: "r2", role: "hr", email: "invite", kind: "primary", round: 2 },
        { id: "x", label: "Reject", to: "rejected", role: "hr", email: "regret", kind: "danger" },
    ],
    r2: [
        { id: "f2", label: "Submit Round 2 form", to: "r2done", role: "panel", kind: "primary", round: 2 },
        { id: "rs2", label: "Reschedule", to: "r2", role: "hr", email: "resched", kind: "plain", round: 2 },
    ],
    r2done: [
        { id: "s3", label: "Shortlist for Round 3", to: "r3", role: "hr", email: "invite", kind: "primary", round: 3 },
        { id: "x", label: "Reject", to: "rejected", role: "hr", email: "regret", kind: "danger" },
    ],
    r3: [
        { id: "f3", label: "Submit Round 3 form", to: "r3done", role: "panel", kind: "primary", round: 3 },
        { id: "rs3", label: "Reschedule", to: "r3", role: "hr", email: "resched", kind: "plain", round: 3 },
    ],
    r3done: [
        { id: "sel", label: "Select", to: "selected", role: "hr", email: "offer", kind: "primary" },
        { id: "x", label: "Reject", to: "rejected", role: "hr", email: "regret", kind: "danger" },
    ],
    selected: [],
    rejected: [],
}

const SLOTS = ["Mon 10:00", "Tue 14:30", "Thu 11:00"]
const CRITERIA = ["Communication", "Subject knowledge", "Problem solving", "Attitude", "Team fit"]

const emailFor = (kind: Action["email"], name: string, round?: number, slot?: string) => {
    const first = name.split(" ")[0]
    switch (kind) {
        case "invite":
            return { subject: `Interview Round ${round}: ${slot}`, body: `Dear ${first},\n\nThank you for your interest in the Graduate Engineer Trainee programme. You are invited to Round ${round} of the interview on ${slot}, at the Gurugram office.\n\nPlease bring a printed copy of your CV and a photo ID.\n\nRegards,\nTalent Acquisition, Sonepar India` }
        case "resched":
            return { subject: `New time for Round ${round}: ${slot}`, body: `Dear ${first},\n\nYour Round ${round} interview has moved to ${slot}. Everything else stays the same.\n\nRegards,\nTalent Acquisition, Sonepar India` }
        case "regret":
            return { subject: "Your application to Sonepar India", body: `Dear ${first},\n\nThank you for the time you gave to our interview process. We won't be taking your application further this year.\n\nWe wish you the best,\nTalent Acquisition, Sonepar India` }
        case "offer":
            return { subject: "Next steps: your offer from Sonepar India", body: `Dear ${first},\n\nWe're happy to tell you that you have been selected. HR will call you this week with the offer letter and joining details.\n\nRegards,\nTalent Acquisition, Sonepar India` }
    }
    return null
}

/**
 * HR Hiring Portal case study: the paper Personal Observation Form turned into a login-gated portal, with an
 * interactive candidate state machine, role-based actions, generated emails and a printable report.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 8000
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function HrPortalCaseStudy(props: Props) {
    const {
        backLink = "/portfolio-2#product",
        nextLink = "/case-study/conductor-ticketing",
        nextLabel = "Conductor Ticketing",
        note = "The portal is internal and login-gated, so the screens on this page are recreations made for this case study. Candidate names and form fields are illustrative.",
        style,
    } = props
    const go = useGo()
    const nav = (href: string) => (e: React.MouseEvent) => {
        e.preventDefault()
        go(href)
    }

    /* hero: paper or portal */
    const [paper, setPaper] = useState(true)

    /* simulator */
    const NAME = "Ananya Rao"
    const [role, setRole] = useState<Role>("hr")
    const [state, setState] = useState<State>("applied")
    const [slot, setSlot] = useState(0)
    const [log, setLog] = useState<{ t: string; who: string; what: string }[]>([{ t: "09:02", who: "System", what: "Application received from the careers page" }])
    const [mail, setMail] = useState<{ subject: string; body: string } | null>(null)
    const [scores, setScores] = useState<Record<number, number[]>>({})
    const [draft, setDraft] = useState<number[]>([0, 0, 0, 0, 0])
    const [rec, setRec] = useState<"" | "Proceed" | "Hold" | "Reject">("")
    const [formErr, setFormErr] = useState("")
    const [report, setReport] = useState(false)
    const clock = () => {
        const n = log.length
        return `${String(9 + Math.floor(n / 2)).padStart(2, "0")}:${n % 2 ? "40" : "05"}`
    }

    const curRound = state === "r1" ? 1 : state === "r2" ? 2 : state === "r3" ? 3 : 0
    const act = (a: Action) => {
        if (a.role !== role) return
        if (a.id.startsWith("f")) {
            if (draft.some((d) => !d) || !rec) return setFormErr("Rate all five and pick a recommendation before submitting.")
            setScores((s) => ({ ...s, [a.round!]: draft }))
            setDraft([0, 0, 0, 0, 0])
            setRec("")
            setFormErr("")
        }
        const s = a.id.startsWith("rs") ? (slot + 1) % SLOTS.length : slot
        if (a.id.startsWith("rs")) setSlot(s)
        const m = a.email ? emailFor(a.email, NAME, a.round, SLOTS[s]) : null
        setMail(m)
        setLog((l) => [
            ...l,
            {
                t: clock(),
                who: a.role === "hr" ? "HR" : "Panel",
                what: a.id.startsWith("f") ? `Round ${a.round} observation form submitted (${rec})` : a.label + (a.round && !a.id.startsWith("f") ? ` · ${SLOTS[s]}` : "") + (m ? " · email sent" : ""),
            },
        ])
        setState(a.to)
    }
    const reset = () => {
        setState("applied")
        setSlot(0)
        setLog([{ t: "09:02", who: "System", what: "Application received from the careers page" }])
        setMail(null)
        setScores({})
        setDraft([0, 0, 0, 0, 0])
        setRec("")
        setFormErr("")
        setReport(false)
    }
    const info = STATE_INFO[state]
    const moves = MOVES[state]
    const avg = (r: number) => (scores[r] ? (scores[r].reduce((a, b) => a + b, 0) / scores[r].length).toFixed(1) : "–")

    /* role views */
    const [view, setView] = useState<Role>("hr")

    return (
        <article className="hp" style={style}>
            <style>{CSS}</style>

            {/* ---------- hero ---------- */}
            <header className="hp-hero">
                <a className="hp-crumb" href={backLink} onClick={nav(backLink)}>
                    ← Product Lab
                </a>
                <div className="hp-hero-grid">
                    <div>
                        <p className="hp-kicker">Product design case study · Sonepar India</p>
                        <h1>Hiring without the paper chase</h1>
                        <p className="hp-lede">
                            Sonepar India ran graduate hiring on a paper Personal Observation Form that travelled by hand through three interview rounds, for about 500 candidates a year. I designed the login-gated portal that replaced it: role-based screens, one clear state for every candidate, and the scheduling, shortlists, emails and reports that used to happen around the paper.
                        </p>
                    </div>
                    <div className="hp-swap">
                        <div className="hp-seg" role="group" aria-label="Show the form as">
                            <button className={paper ? "on" : ""} aria-pressed={paper} onClick={() => setPaper(true)}>
                                On paper
                            </button>
                            <button className={!paper ? "on" : ""} aria-pressed={!paper} onClick={() => setPaper(false)}>
                                In the portal
                            </button>
                        </div>
                        {paper ? (
                            <div className="hp-paper" aria-label="Recreated paper observation form">
                                <div className="hp-paper-h">
                                    <b>Personal Observation Form</b>
                                    <span>Round ___</span>
                                </div>
                                <div className="hp-hand">
                                    <span>Candidate</span>
                                    <i>Ananya Rao</i>
                                </div>
                                <div className="hp-hand">
                                    <span>Panel</span>
                                    <i>R. Mehta, S. K…</i>
                                </div>
                                {CRITERIA.slice(0, 4).map((c, i) => (
                                    <div key={c} className="hp-hand">
                                        <span>{c}</span>
                                        <i>{["Good", "4 / 5 ?", "ok", ""][i]}</i>
                                    </div>
                                ))}
                                <div className="hp-hand tall">
                                    <span>Remarks</span>
                                    <i>Confident. Check notice period w/ HR</i>
                                </div>
                                <span className="hp-coffee" aria-hidden="true" />
                                <span className="hp-sticky">Round 2 on Tue? Call her</span>
                            </div>
                        ) : (
                            <div className="hp-portal" aria-label="Recreated portal form">
                                <div className="hp-portal-h">
                                    <span className="hp-chip violet">Round 1 form</span>
                                    <b>Ananya Rao</b>
                                    <span>Panel: R. Mehta, S. Kapoor · Mon 10:00</span>
                                </div>
                                {CRITERIA.map((c, i) => (
                                    <div key={c} className="hp-rate-row">
                                        <span>{c}</span>
                                        <span className="hp-dots">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <i key={n} className={n <= [4, 4, 3, 5, 4][i] ? "on" : ""} />
                                            ))}
                                        </span>
                                    </div>
                                ))}
                                <div className="hp-portal-f">
                                    <span className="hp-chip green">Proceed</span>
                                    <span>Saved · visible to HR</span>
                                </div>
                            </div>
                        )}
                        <p className="hp-cap">Recreation. {paper ? "One sheet, one place, handwriting and margin notes." : "The same form: structured, complete, and in front of whoever needs it next."}</p>
                    </div>
                </div>
                <dl className="hp-meta">
                    <div>
                        <dt>Role</dt>
                        <dd>Product designer</dd>
                    </div>
                    <div>
                        <dt>Company</dt>
                        <dd>Sonepar India, 2026</dd>
                    </div>
                    <div>
                        <dt>Scale</dt>
                        <dd>About 500 candidates a year, three interview rounds</dd>
                    </div>
                    <div>
                        <dt>My work</dt>
                        <dd>Process mapping, roles and journeys, state model, screens</dd>
                    </div>
                </dl>
            </header>

            {/* ---------- problem ---------- */}
            <section className="hp-sec">
                <h2>A form that can only be in one place</h2>
                <p className="hp-narrow">On paper, the observation form was the hiring system. Every round depended on the sheet getting to the next room, and everything around it (who is next, who to email, what to report) lived in people's heads and inboxes.</p>
                <ol className="hp-journey">
                    {[
                        ["Print", "HR prints a form for each candidate and round."],
                        ["Interview", "The panel scores by hand and writes remarks."],
                        ["Carry", "The sheet goes to HR, then to the next round's panel."],
                        ["Collate", "HR reads every sheet to decide who moves on."],
                        ["Email", "Invites and regrets are written one by one."],
                        ["Report", "Results are typed up again for the final report."],
                    ].map(([t, d], i) => (
                        <li key={t}>
                            <b>
                                {i + 1}. {t}
                            </b>
                            <span>{d}</span>
                        </li>
                    ))}
                </ol>
                <div className="hp-breaks">
                    <div>
                        <h3>Status lives nowhere</h3>
                        <p>To know where a candidate stands, someone has to find their sheet.</p>
                    </div>
                    <div>
                        <h3>Forms arrive half filled</h3>
                        <p>Paper can't insist on a score or a recommendation before it leaves the room.</p>
                    </div>
                    <div>
                        <h3>The same work, done twice</h3>
                        <p>Scores written once are read again for decisions and typed again for reports and emails.</p>
                    </div>
                </div>
            </section>

            {/* ---------- roles ---------- */}
            <section className="hp-sec hp-roles">
                <div>
                    <h2>Two jobs, two portals behind one login</h2>
                    <p>HR runs the process. Interview panels judge candidates. They need different screens, so after sign-in each role only sees what it acts on.</p>
                    <div className="hp-seg" role="group" aria-label="Signed in as">
                        <button className={view === "hr" ? "on" : ""} aria-pressed={view === "hr"} onClick={() => setView("hr")}>
                            Signed in as HR
                        </button>
                        <button className={view === "panel" ? "on" : ""} aria-pressed={view === "panel"} onClick={() => setView("panel")}>
                            Signed in as panel
                        </button>
                    </div>
                    <ul className="hp-needs">
                        {(view === "hr"
                            ? ["See every candidate's state at a glance", "Schedule rounds and move many candidates at once", "Send invites and regrets without writing them", "Print the final report"]
                            : ["See only today's interviews", "Fill the observation form for their round", "Can't move candidates or see other panels' scores first"]
                        ).map((n) => (
                            <li key={n}>{n}</li>
                        ))}
                    </ul>
                </div>
                <div className="hp-app" aria-label={`Recreated ${view === "hr" ? "HR" : "panel"} home screen`}>
                    <aside>
                        <b>Hiring Portal</b>
                        {(view === "hr" ? ["Pipeline", "Schedule", "Emails", "Reports", "Users"] : ["Today", "My forms"]).map((n, i) => (
                            <span key={n} className={i === 0 ? "on" : ""}>
                                {n}
                            </span>
                        ))}
                    </aside>
                    <div className="hp-app-main">
                        {view === "hr" ? (
                            <>
                                <div className="hp-app-top">
                                    <b>Graduate intake 2026</b>
                                    <span className="hp-btn">Schedule selected (3)</span>
                                </div>
                                <div className="hp-board">
                                    {[
                                        ["Applied", "slate", 4],
                                        ["Round 1", "blue", 3],
                                        ["Round 2", "violet", 2],
                                        ["Round 3", "amber", 1],
                                    ].map(([t, c, n]) => (
                                        <div key={t as string}>
                                            <span className={"hp-chip " + c}>{t}</span>
                                            {Array.from({ length: n as number }, (_, k) => (
                                                <i key={k} className={t === "Applied" && k < 3 ? "sel" : ""}>
                                                    <em />
                                                    <em />
                                                </i>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="hp-app-top">
                                    <b>Today · 3 interviews</b>
                                </div>
                                {[
                                    ["10:00", "Ananya Rao", "Round 1", "Form due"],
                                    ["11:30", "Karthik Iyer", "Round 1", "Form due"],
                                    ["14:30", "Meera Joshi", "Round 2", "Submitted"],
                                ].map(([t, n, r, s]) => (
                                    <div key={n} className="hp-today">
                                        <span>{t}</span>
                                        <b>{n}</b>
                                        <span>{r}</span>
                                        <span className={"hp-chip " + (s === "Submitted" ? "green" : "blue")}>{s}</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* ---------- state machine ---------- */}
            <section className="hp-sec" aria-label="Candidate state simulator">
                <h2>One candidate, one state</h2>
                <p className="hp-narrow">The core of the design is a state model. Every candidate is in exactly one state, every state offers only the moves that make sense from it, and each move knows who may make it and which email it sends. Move a sample candidate through it.</p>
                <ol className="hp-steps" aria-label="Progress">
                    {["Applied", "Round 1", "Round 2", "Round 3", "Selected"].map((s, i) => (
                        <li key={s} className={(info.step >= i ? "done" : "") + (info.step === i ? " cur" : "") + (state === "rejected" ? " out" : "")}>
                            {s}
                        </li>
                    ))}
                </ol>
                <div className="hp-sim">
                    <div className="hp-card">
                        <div className="hp-card-h">
                            <div>
                                <b>{NAME}</b>
                                <span>Graduate Engineer Trainee · B.Tech Electrical</span>
                            </div>
                            <span className={"hp-chip " + info.tone}>{info.label}</span>
                        </div>
                        <div className="hp-as">
                            <span>Acting as</span>
                            <div className="hp-seg sm" role="group" aria-label="Acting as">
                                <button className={role === "hr" ? "on" : ""} aria-pressed={role === "hr"} onClick={() => setRole("hr")}>
                                    HR
                                </button>
                                <button className={role === "panel" ? "on" : ""} aria-pressed={role === "panel"} onClick={() => setRole("panel")}>
                                    Panel
                                </button>
                            </div>
                        </div>

                        {curRound > 0 && role === "panel" && (
                            <div className="hp-form">
                                <b>Round {curRound} observation form</b>
                                {CRITERIA.map((c, i) => (
                                    <div key={c} className="hp-rate-row">
                                        <span>{c}</span>
                                        <span className="hp-dots" role="radiogroup" aria-label={c}>
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <button
                                                    key={n}
                                                    role="radio"
                                                    aria-checked={draft[i] === n}
                                                    aria-label={`${c} ${n} of 5`}
                                                    className={n <= draft[i] ? "on" : ""}
                                                    onClick={() => setDraft((d) => d.map((v, k) => (k === i ? n : v)))}
                                                />
                                            ))}
                                        </span>
                                    </div>
                                ))}
                                <div className="hp-recs" role="radiogroup" aria-label="Recommendation">
                                    {(["Proceed", "Hold", "Reject"] as const).map((r) => (
                                        <button key={r} role="radio" aria-checked={rec === r} className={rec === r ? "on" : ""} onClick={() => setRec(r)}>
                                            {r}
                                        </button>
                                    ))}
                                </div>
                                {formErr && <p className="hp-err">{formErr}</p>}
                                <p className="hp-hint">Earlier rounds' scores stay hidden until this form is submitted, so one panel doesn't anchor the next.</p>
                            </div>
                        )}
                        {curRound > 0 && role === "hr" && <p className="hp-wait">Waiting for the Round {curRound} panel to submit their form. Switch to Panel to fill it in.</p>}

                        <div className="hp-moves">
                            {moves.map((a) => (
                                <button key={a.id} className={"hp-move " + (a.kind || "plain")} disabled={a.role !== role} onClick={() => act(a)} title={a.role !== role ? `Only ${a.role === "hr" ? "HR" : "the panel"} can do this` : undefined}>
                                    {a.label}
                                    {a.role !== role && <small>{a.role === "hr" ? "HR only" : "Panel only"}</small>}
                                </button>
                            ))}
                            {(state === "selected" || state === "rejected") && (
                                <>
                                    <button className="hp-move primary" onClick={() => setReport(true)}>
                                        Print report
                                    </button>
                                    <button className="hp-move plain" onClick={reset}>
                                        Start again
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="hp-log">
                            <b>History</b>
                            <ol>
                                {log
                                    .slice()
                                    .reverse()
                                    .map((l, i) => (
                                        <li key={i}>
                                            <span>{l.t}</span>
                                            <em>{l.who}</em>
                                            {l.what}
                                        </li>
                                    ))}
                            </ol>
                        </div>
                    </div>
                    <div className="hp-side">
                        <div className="hp-mail" aria-live="polite">
                            <b>Last email sent</b>
                            {mail ? (
                                <>
                                    <div className="hp-mail-h">
                                        <span>To: ananya.rao@example.com</span>
                                        <strong>{mail.subject}</strong>
                                    </div>
                                    <pre>{mail.body}</pre>
                                </>
                            ) : (
                                <p className="hp-empty">No email yet. Scheduling, rejecting or selecting sends one from a template, filled with the candidate's details.</p>
                            )}
                        </div>
                        <div className="hp-rounds">
                            <b>Round scores</b>
                            {[1, 2, 3].map((r) => (
                                <div key={r}>
                                    <span>Round {r}</span>
                                    <strong>{avg(r)}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {report && (
                    <div className="hp-report-wrap" role="dialog" aria-modal="true" aria-label="Printable report" onClick={() => setReport(false)}>
                        <div className="hp-report" onClick={(e) => e.stopPropagation()}>
                            <div className="hp-report-h">
                                <div>
                                    <b>Candidate report</b>
                                    <span>Graduate intake 2026 · Sonepar India</span>
                                </div>
                                <button onClick={() => setReport(false)} aria-label="Close report">
                                    ×
                                </button>
                            </div>
                            <table>
                                <tbody>
                                    <tr>
                                        <th>Candidate</th>
                                        <td>{NAME}</td>
                                    </tr>
                                    <tr>
                                        <th>Outcome</th>
                                        <td>{info.label}</td>
                                    </tr>
                                    {[1, 2, 3].map((r) => (
                                        <tr key={r}>
                                            <th>Round {r}</th>
                                            <td>{scores[r] ? CRITERIA.map((c, i) => `${c} ${scores[r][i]}`).join(" · ") + ` (avg ${avg(r)})` : "Not reached"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <ol className="hp-report-log">
                                {log.map((l, i) => (
                                    <li key={i}>
                                        {l.t} · {l.who} · {l.what}
                                    </li>
                                ))}
                            </ol>
                            <p className="hp-cap">Printable and laid out like a paper record, so nobody has to type the results again.</p>
                        </div>
                    </div>
                )}
            </section>

            {/* ---------- decisions ---------- */}
            <section className="hp-sec">
                <h2>Decisions and what they cost</h2>
                <div className="hp-dec">
                    {[
                        ["Show only valid next moves", "Buttons come from the candidate's state, so nobody can schedule Round 3 for someone who never sat Round 2. The cost: an exception, like skipping a round, needs an HR override instead of a click."],
                        ["Make the form refuse to leave half done", "Every score and a recommendation are required before submit. Panels lose the freedom to leave a box blank, and HR stops chasing missing scores."],
                        ["Hide earlier scores from later panels", "Each panel judges fresh and sees earlier rounds only after submitting. HR still sees everything."],
                        ["Write emails from templates, sent by the state change", "Moving a candidate sends the matching email with their name, round and time filled in. Templates read less personal than hand-written mail, so the wording stays short and plain."],
                        ["Act on many candidates at once", "With about 500 candidates a year, HR selects a group and schedules or rejects them together, and each still gets their own email."],
                        ["Keep the report looking like paper", "The printable report reads like the paper record people are used to, so moving to the portal doesn't change what gets filed."],
                    ].map(([t, d]) => (
                        <div key={t}>
                            <h3>{t}</h3>
                            <p>{d}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------- measure ---------- */}
            <section className="hp-sec hp-two">
                <div>
                    <h2>What I'd measure</h2>
                    <p>These are the signals I'd track to see whether the portal is doing its job.</p>
                </div>
                <ul className="hp-measure">
                    <li>
                        <b>Interview to decision</b>
                        <span>Days from a round's interview to the shortlist or regret going out.</span>
                    </li>
                    <li>
                        <b>Forms submitted the same day</b>
                        <span>Share of observation forms in on the day of the interview.</span>
                    </li>
                    <li>
                        <b>Emails written by hand</b>
                        <span>Every one is a missing template or a state the model doesn't cover.</span>
                    </li>
                    <li>
                        <b>HR overrides</b>
                        <span>Frequent overrides mean the state model is too strict somewhere.</span>
                    </li>
                </ul>
            </section>

            <section className="hp-sec hp-two">
                <div>
                    <h2>What I learned</h2>
                </div>
                <div className="hp-learn">
                    <p>The screens were the easy part. The real design work was the state model: what each state means, who may move a candidate, and what should happen automatically at each step. Once that model was clear, most screens followed from it.</p>
                    {note && <p className="hp-note">{note}</p>}
                </div>
            </section>

            <footer className="hp-end">
                <a href={backLink} onClick={nav(backLink)}>
                    ← Back to the Product Lab
                </a>
                {nextLink && (
                    <a className="go" href={nextLink} onClick={nav(nextLink)}>
                        Next case study: {nextLabel} →
                    </a>
                )}
            </footer>
        </article>
    )
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&family=Caveat:wght@500;700&display=swap");
.hp{box-sizing:border-box;--bg:#F4F6FA;--panel:#FFFFFF;--ink:#14213D;--mute:#56607A;--line:#DCE1EA;--brand:#27348B;--brand-2:#E8EBF7;
  --slate:#64748B;--blue:#2563EB;--violet:#7C3AED;--amber:#B45309;--green:#15803D;--red:#B91C1C;
  position:relative;width:100%;max-width:1200px;margin-inline:auto;padding:140px clamp(20px,5vw,72px) 110px;background:var(--bg);color:var(--ink);font-family:"Public Sans",system-ui,sans-serif;font-size:17px;line-height:1.6;overflow:clip}
.hp *{box-sizing:border-box}
:where(.hp) button{font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;text-align:left}
.hp button:focus-visible,.hp a:focus-visible{outline:3px solid var(--brand);outline-offset:2px}
.hp h1,.hp h2,.hp h3{margin:0;color:var(--ink);letter-spacing:-.02em}
.hp p{margin:0 0 14px}
.hp a{color:inherit}
.hp-sec{margin-top:clamp(88px,10vw,140px)}
.hp-sec > h2,.hp-two h2,.hp-roles h2{font-size:clamp(30px,3.4vw,44px);line-height:1.1;font-weight:800;margin-bottom:16px}
.hp-narrow{max-width:700px;color:var(--mute)}
.hp-cap{margin:10px 0 0!important;font-size:13.5px;color:var(--mute)}
/* chips */
.hp-chip{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font-size:13px;font-weight:700;white-space:nowrap;background:color-mix(in srgb,var(--c) 12%,#fff);color:var(--c)}
.hp-chip::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--c)}
.hp-chip.slate{--c:var(--slate)}.hp-chip.blue{--c:var(--blue)}.hp-chip.violet{--c:var(--violet)}.hp-chip.amber{--c:var(--amber)}.hp-chip.green{--c:var(--green)}.hp-chip.red{--c:var(--red)}
/* segmented control */
.hp-seg{display:inline-flex;padding:4px;border-radius:12px;background:var(--brand-2);gap:4px}
.hp-seg button{padding:8px 14px;border-radius:9px;font-weight:700;font-size:14.5px;color:var(--brand)}
.hp-seg button.on{background:var(--brand);color:#fff}
.hp-seg.sm button{padding:5px 12px;font-size:13.5px}
/* hero */
.hp-crumb{display:inline-block;font-weight:700;font-size:15px;text-decoration:none;margin-bottom:40px}
.hp-crumb:hover{text-decoration:underline}
.hp-hero-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:32px clamp(28px,5vw,64px);align-items:start}
.hp-kicker{font-size:15px;font-weight:700;color:var(--brand)}
.hp-hero h1{font-size:clamp(44px,6vw,80px);line-height:1;font-weight:800;letter-spacing:-.035em}
.hp-lede{margin-top:24px!important;font-size:clamp(18px,1.6vw,20px);line-height:1.6;color:#2B3654}
.hp-swap{display:grid;gap:14px;justify-items:start}
.hp-paper{position:relative;width:100%;min-height:380px;padding:26px 26px 30px;background:#FDFDFB;border:1px solid #D9D6CC;box-shadow:0 1px 0 #ECEAE3,0 18px 40px -18px rgba(20,33,61,.35);transform:rotate(-1.2deg);font-family:"Public Sans",sans-serif}
.hp-paper-h{display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid #14213D;padding-bottom:8px;margin-bottom:12px}
.hp-paper-h b{font-size:16px;letter-spacing:.02em}
.hp-paper-h span{font-size:13px}
.hp-hand{display:grid;grid-template-columns:140px 1fr;align-items:end;gap:10px;padding:6px 0;border-bottom:1px dashed #B9B5A8;font-size:13px;color:#4A4F5E}
.hp-hand i{font-family:Caveat,cursive;font-style:normal;font-size:22px;line-height:1;color:#1F3A8A}
.hp-hand.tall{min-height:64px;align-items:start}
.hp-coffee{position:absolute;right:30px;bottom:26px;width:86px;height:86px;border-radius:50%;border:6px solid rgba(146,94,48,.18);box-shadow:inset 0 0 0 3px rgba(146,94,48,.07)}
.hp-sticky{position:absolute;right:-12px;top:70px;width:130px;padding:12px;background:#FFE58A;transform:rotate(4deg);font-family:Caveat,cursive;font-size:20px;line-height:1.1;color:#3F3A1E;box-shadow:0 8px 16px -6px rgba(0,0,0,.25)}
.hp-portal{width:100%;min-height:380px;padding:22px;background:var(--panel);border-radius:18px;border:1px solid var(--line);box-shadow:0 18px 40px -18px rgba(20,33,61,.35);display:grid;gap:8px;align-content:start}
.hp-portal-h{display:grid;gap:4px;margin-bottom:8px}
.hp-portal-h .hp-chip{justify-self:start}
.hp-portal-h b{font-size:20px}
.hp-portal-h span:last-child{font-size:14px;color:var(--mute)}
.hp-portal-f{display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:12px;border-top:1px solid var(--line);font-size:13.5px;color:var(--mute)}
.hp-rate-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:6px 0;font-size:15px}
.hp-dots{display:flex;gap:6px}
.hp-dots i,.hp-dots button{width:22px;height:22px;border-radius:6px;border:2px solid var(--line);background:#fff;display:block}
.hp-dots i.on,.hp-dots button.on{background:var(--brand);border-color:var(--brand)}
.hp-dots button:hover{border-color:var(--brand)}
.hp-meta{margin:44px 0 0;display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding:22px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.hp-meta dt{font-size:13.5px;font-weight:700;color:var(--brand);margin-bottom:4px}
.hp-meta dd{margin:0;font-size:15.5px;line-height:1.45}
/* journey */
.hp-journey{list-style:none;margin:30px 0 0;padding:0;display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
.hp-journey li{padding:16px;border-radius:14px;background:var(--panel);border:1px solid var(--line);display:grid;gap:6px;align-content:start}
.hp-journey b{font-size:15px}
.hp-journey span{font-size:14px;color:var(--mute);line-height:1.45}
.hp-breaks{margin-top:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.hp-breaks > div{padding:22px;border-radius:16px;background:var(--brand);color:#fff}
.hp-breaks h3{color:#fff;font-size:19px;margin-bottom:8px}
.hp-breaks p{margin:0;color:rgba(255,255,255,.82);font-size:15.5px}
/* roles */
.hp-roles{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:28px clamp(28px,5vw,56px);align-items:start}
.hp-roles > div > p{color:var(--mute)}
.hp-needs{margin:20px 0 0;padding-left:20px;display:grid;gap:6px}
.hp-app{display:grid;grid-template-columns:150px 1fr;min-height:330px;border-radius:18px;overflow:hidden;border:1px solid var(--line);background:var(--panel);box-shadow:0 18px 40px -20px rgba(20,33,61,.3)}
.hp-app aside{background:var(--ink);color:#fff;padding:18px 12px;display:grid;gap:4px;align-content:start;font-size:14px}
.hp-app aside b{font-size:15px;margin:0 6px 12px}
.hp-app aside span{padding:8px 10px;border-radius:8px;color:rgba(255,255,255,.72)}
.hp-app aside span.on{background:rgba(255,255,255,.12);color:#fff}
.hp-app-main{padding:18px;display:grid;gap:12px;align-content:start;min-width:0}
.hp-app-top{display:flex;justify-content:space-between;align-items:center;gap:10px}
.hp-btn{padding:6px 12px;border-radius:8px;background:var(--brand);color:#fff;font-size:13px;font-weight:700;white-space:nowrap}
.hp-board{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.hp-board > div{display:grid;gap:6px;align-content:start;padding:8px;border-radius:10px;background:var(--bg)}
.hp-board .hp-chip{font-size:11.5px;padding:2px 8px;justify-self:start}
.hp-board i{display:grid;gap:5px;padding:9px;border-radius:8px;background:#fff;border:1px solid var(--line)}
.hp-board i.sel{border-color:var(--brand);box-shadow:inset 0 0 0 1px var(--brand)}
.hp-board em{display:block;height:6px;border-radius:3px;background:#D5DAE5}
.hp-board em + em{width:60%;background:#E6E9F0}
.hp-today{display:grid;grid-template-columns:52px 1fr auto auto;gap:10px;align-items:center;padding:10px 12px;border-radius:10px;border:1px solid var(--line);font-size:14px}
/* simulator */
.hp-steps{list-style:none;margin:28px 0 18px;padding:0;display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.hp-steps li{position:relative;padding:10px 12px;border-radius:10px;background:var(--panel);border:1px solid var(--line);font-size:14px;font-weight:700;color:var(--mute)}
.hp-steps li.done{color:var(--brand);border-color:color-mix(in srgb,var(--brand) 40%,#fff)}
.hp-steps li.cur{background:var(--brand);color:#fff;border-color:var(--brand)}
.hp-steps li.out{opacity:.45}
.hp-sim{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:16px;align-items:start}
.hp-card,.hp-mail,.hp-rounds{padding:22px;border-radius:18px;background:var(--panel);border:1px solid var(--line)}
.hp-card-h{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding-bottom:14px;border-bottom:1px solid var(--line)}
.hp-card-h b{display:block;font-size:20px}
.hp-card-h span{font-size:14px;color:var(--mute)}
.hp-as{display:flex;align-items:center;gap:12px;margin:14px 0;font-size:14px;font-weight:700;color:var(--mute)}
.hp-form{padding:16px;border-radius:14px;background:var(--bg);margin-bottom:14px}
.hp-form > b{display:block;margin-bottom:6px}
.hp-recs{display:flex;gap:8px;margin-top:10px}
.hp-recs button{padding:7px 14px;border-radius:9px;border:1.5px solid var(--line);background:#fff;font-weight:700;font-size:14px}
.hp-recs button.on{border-color:var(--brand);background:var(--brand);color:#fff}
.hp-err{margin:10px 0 0!important;color:var(--red);font-size:14px;font-weight:600}
.hp-hint{margin:10px 0 0!important;font-size:13.5px;color:var(--mute)}
.hp-wait{padding:12px 14px;border-radius:12px;background:var(--brand-2);color:var(--brand);font-size:14.5px;font-weight:600}
.hp-moves{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 16px}
.hp-move{display:inline-flex;flex-direction:column;padding:10px 16px;border-radius:10px;font-weight:700;font-size:15px;border:1.5px solid var(--line);background:#fff}
.hp-move small{font-size:11.5px;font-weight:600;opacity:.8}
.hp-move.primary{background:var(--brand);border-color:var(--brand);color:#fff}
.hp-move.danger{color:var(--red);border-color:color-mix(in srgb,var(--red) 35%,#fff)}
.hp-move[disabled]{opacity:.45;cursor:not-allowed}
.hp-log b,.hp-mail > b,.hp-rounds > b{display:block;font-size:14px;color:var(--mute);margin-bottom:8px}
.hp-log ol{list-style:none;margin:0;padding:0;display:grid;gap:6px;max-height:190px;overflow:auto}
.hp-log li{display:grid;grid-template-columns:44px 56px 1fr;gap:8px;font-size:14px;line-height:1.4}
.hp-log li span{color:var(--mute);font-variant-numeric:tabular-nums}
.hp-log li em{font-style:normal;font-weight:700;color:var(--brand)}
.hp-side{display:grid;gap:16px}
.hp-mail-h{display:grid;gap:2px;padding:10px 12px;border-radius:10px;background:var(--bg);font-size:13.5px;color:var(--mute)}
.hp-mail-h strong{color:var(--ink);font-size:15px}
.hp-mail pre{margin:10px 0 0;white-space:pre-wrap;font:inherit;font-size:14.5px;line-height:1.55}
.hp-empty{color:var(--mute);font-size:14.5px;margin:0!important}
.hp-rounds > div{display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid var(--line);font-size:15px}
.hp-rounds strong{font-variant-numeric:tabular-nums}
.hp-report-wrap{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background:rgba(20,33,61,.55)}
.hp-report{width:min(680px,100%);max-height:calc(100vh - 40px);overflow:auto;padding:30px;background:#fff;color:#14213D;border-radius:6px;box-shadow:0 30px 60px rgba(0,0,0,.35)}
.hp-report-h{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #14213D;padding-bottom:10px;margin-bottom:12px}
.hp-report-h b{display:block;font-size:20px}
.hp-report-h span{font-size:13.5px;color:var(--mute)}
.hp-report-h button{font-size:26px;line-height:1;padding:0 6px}
.hp-report table{width:100%;border-collapse:collapse;font-size:14px}
.hp-report th{text-align:left;width:120px;padding:8px 10px 8px 0;vertical-align:top;color:var(--mute);font-weight:600;border-bottom:1px solid var(--line)}
.hp-report td{padding:8px 0;border-bottom:1px solid var(--line)}
.hp-report-log{margin:14px 0 0;padding-left:18px;font-size:13px;color:var(--mute);display:grid;gap:3px}
/* decisions */
.hp-dec{margin-top:28px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.hp-dec > div{padding:22px;border-radius:16px;background:var(--panel);border:1px solid var(--line)}
.hp-dec h3{font-size:18px;line-height:1.3;margin-bottom:8px}
.hp-dec p{margin:0;font-size:15.5px;color:var(--mute)}
/* measure + learn */
.hp-two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);gap:24px clamp(28px,5vw,64px)}
.hp-two > div > p{color:var(--mute)}
.hp-measure{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.hp-measure li{display:grid;gap:2px;padding:16px 18px;border-radius:14px;background:var(--panel);border:1px solid var(--line)}
.hp-measure span{font-size:15px;color:var(--mute)}
.hp-learn p{font-size:18px}
.hp-note{margin-top:22px!important;padding:14px 16px;border-radius:12px;background:var(--brand-2);color:var(--brand);font-size:14.5px!important;font-weight:600}
.hp-end{margin-top:clamp(88px,10vw,140px);padding-top:26px;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
.hp-end a{padding:14px 20px;border-radius:12px;border:1.5px solid var(--line);background:var(--panel);font-weight:700;text-decoration:none}
.hp-end a.go{background:var(--brand);border-color:var(--brand);color:#fff}
@media (max-width:980px){
  .hp-journey{grid-template-columns:repeat(3,1fr)}
  .hp-dec{grid-template-columns:repeat(2,1fr)}
  .hp-roles,.hp-sim{grid-template-columns:1fr}
}
@media (max-width:760px){
  .hp{padding-top:110px;font-size:16px}
  .hp-hero-grid,.hp-two{grid-template-columns:1fr}
  .hp-meta{grid-template-columns:1fr 1fr}
  .hp-journey,.hp-breaks,.hp-dec{grid-template-columns:1fr}
  .hp-steps{grid-template-columns:1fr 1fr}
  .hp-app{grid-template-columns:1fr}
  .hp-app aside{display:flex;flex-wrap:wrap;gap:4px}
  .hp-app aside b{width:100%;margin-bottom:4px}
  .hp-board{grid-template-columns:repeat(2,minmax(0,1fr))}
  .hp-sticky{right:4px;top:auto;bottom:-14px}
  .hp-hand{grid-template-columns:110px 1fr}
  .hp-today{grid-template-columns:44px 1fr auto}
  .hp-today > span:nth-child(3){display:none}
}
`

addPropertyControls(HrPortalCaseStudy, {
    backLink: { type: ControlType.String, title: "Back link", defaultValue: "/portfolio-2#product" },
    nextLink: { type: ControlType.String, title: "Next case study", defaultValue: "/case-study/conductor-ticketing" },
    nextLabel: { type: ControlType.String, title: "Next title", defaultValue: "Conductor Ticketing" },
    note: {
        type: ControlType.String,
        title: "Recreation note",
        displayTextArea: true,
        defaultValue: "The portal is internal and login-gated, so the screens on this page are recreations made for this case study. Candidate names and form fields are illustrative.",
    },
})
