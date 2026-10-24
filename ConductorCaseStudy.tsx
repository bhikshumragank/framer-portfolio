import { addPropertyControls, ControlType } from "framer"
import * as FramerLib from "framer"
import { useEffect, useRef, useState, type CSSProperties } from "react"

type Props = {
    figmaLink: string
    prototypeLink: string
    backLink: string
    nextLink: string
    processNote: string
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

/* ---------- sample route (illustration only) ---------- */

const ROUTE: { n: string; st: number }[] = [
    { n: "Kharagpur Station", st: 0 },
    { n: "Inda", st: 0 },
    { n: "Prembazar", st: 1 },
    { n: "Hijli More", st: 1 },
    { n: "Salua", st: 2 },
    { n: "Kalaikunda", st: 2 },
    { n: "Chowrangi", st: 3 },
    { n: "Keranitola", st: 4 },
    { n: "Medinipur Bus Stand", st: 5 },
]
type PaxType = "Adult" | "Child" | "Pass"
const adultFare = (from: number, to: number) => 10 + 5 * Math.max(0, ROUTE[to].st - ROUTE[from].st)
const unitFare = (from: number, to: number, t: PaxType) => (t === "Pass" ? 0 : t === "Child" ? Math.ceil(adultFare(from, to) / 10) * 5 : adultFare(from, to))
const rupee = (n: number) => "₹" + n.toLocaleString("en-IN")

type Screen = "pick" | "board" | "pay" | "cash" | "done" | "fail" | "shift"
type Method = "cash" | "upi" | "card" | "pass"

const SCREENS: { id: Screen; name: string; tag: string; notes: string[] }[] = [
    {
        id: "pick",
        name: "Pick destination",
        tag: "Tap 1",
        notes: [
            "FROM fills itself with the last stop the bus halted at, not the live GPS point, because tickets are often issued after the bus has moved on.",
            "No typing: only the stops still ahead, in route order, each with its fare. One tap goes straight to payment.",
            "Passenger type and count default to 1 Adult, so the common case never touches them.",
        ],
    },
    {
        id: "board",
        name: "Confirm boarding stop",
        tag: "Correction",
        notes: [
            "Opens when the conductor taps Change, or on its own when GPS is weak.",
            "Only three likely answers (previous, last, next stop) as 88 px targets. The full list is one tap further.",
            "Yellow is kept for alerts and the main action, so it always means look here.",
        ],
    },
    {
        id: "pay",
        name: "Take payment",
        tag: "Tap 2",
        notes: [
            "The fare is 60 px so the passenger can read it too, with no shouting over the engine.",
            "UPI and card need no tap from the conductor: the QR is already on screen and the machine detects the payment.",
            "Cash is the most common payment, so it gets the biggest button, at the bottom in thumb reach.",
        ],
    },
    {
        id: "cash",
        name: "Cash and change",
        tag: "Cash path",
        notes: [
            "Note buttons instead of a number pad: the conductor taps what was handed over, with no mental maths.",
            "The change to return is a 64 px figure on yellow, readable at arm's length in sun.",
            "Exact prints straight away, so the common case stays at two taps.",
        ],
    },
    {
        id: "done",
        name: "Ticket printed",
        tag: "Automatic",
        notes: [
            "Prints on its own once payment is confirmed. There is no print tap for UPI or card.",
            "A vibration and a beep confirm it, so the conductor never has to look down.",
            "Returns to Tap 1 after 3 seconds; Next now skips the wait in a rush.",
        ],
    },
    {
        id: "fail",
        name: "Payment not confirmed",
        tag: "Edge case",
        notes: [
            "A moving bus drops signal often, so the conductor is never left on an endless spinner.",
            "Switching to cash is the main way out, so it keeps the yellow button.",
            "The machine keeps checking in the background, so a late UPI payment never charges the passenger twice.",
        ],
    },
    {
        id: "shift",
        name: "End-of-shift summary",
        tag: "Shift end",
        notes: [
            "Splits the day by payment type, so the cash bag can be counted against one number.",
            "Pending UPI is shown separately, so late payments don't make the bag look short.",
            "One button closes the shift and prints the report for the depot.",
        ],
    },
]

/* ---------- icons ---------- */

const Pin = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
        <circle cx="12" cy="9.5" r="2.5" />
    </svg>
)
const Bars = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="15" width="3.5" height="6" rx="1" />
        <rect x="8.5" y="11" width="3.5" height="10" rx="1" />
        <rect x="14" y="7" width="3.5" height="14" rx="1" />
        <rect x="19.5" y="3" width="3" height="18" rx="1" opacity=".35" />
    </svg>
)
const Batt = ({ low }: { low?: boolean }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="18" height="10" rx="2" />
        <rect x="4" y="9" width={low ? 5 : 11} height="6" fill="currentColor" stroke="none" />
        <path d="M22 10v4" />
    </svg>
)
const Back = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 5l-7 7 7 7" />
    </svg>
)
const Swap = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 4v14M3 14l4 4 4-4M17 20V6M13 10l4-4 4 4" />
    </svg>
)
const Note = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.8" />
        <path d="M6 9.5v5M18 9.5v5" />
    </svg>
)
const Printer = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
        <path d="M6 9V3h12v6" />
        <rect x="3" y="9" width="18" height="8" rx="2" />
        <path d="M7 14h10v7H7z" />
    </svg>
)
const Contactless = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M6 8.5a5 5 0 0 1 0 7M9.5 6a9 9 0 0 1 0 12M13 3.5a13 13 0 0 1 0 17" />
        <rect x="16" y="7" width="6" height="10" rx="1.5" />
    </svg>
)
const Warn = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 3l10 18H2z" />
        <path d="M12 10v5M12 18v.5" />
    </svg>
)

// a placeholder QR (not scannable), drawn the same way every time
function Qr() {
    let seed = 7187
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648
    const inFinder = (x: number, y: number) => (x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16)
    const cells: JSX.Element[] = []
    for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) if (!inFinder(x, y) && rnd() < 0.47) cells.push(<rect key={x + "-" + y} x={x} y={y} width="1" height="1" />)
    const f = (x: number, y: number) => (
        <g key={"f" + x + y}>
            <rect x={x} y={y} width="7" height="7" />
            <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
            <rect x={x + 2} y={y + 2} width="3" height="3" />
        </g>
    )
    return (
        <svg className="ct-qr" viewBox="-2 -2 29 29" shapeRendering="crispEdges" role="img" aria-label="UPI QR code (placeholder)">
            <rect x="-2" y="-2" width="29" height="29" fill="#fff" />
            <g fill="#000">
                {cells}
                {f(0, 0)}
                {f(18, 0)}
                {f(0, 18)}
            </g>
        </svg>
    )
}

/**
 * Conductor ticketing case study: a two-tap ticketing screen for bus conductors, with a working prototype of
 * all seven screens, a Sunlight / Night switch for the whole page and a thumb-zone overlay.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 9000
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function ConductorCaseStudy(props: Props) {
    const {
        figmaLink = "https://www.figma.com/design/kM58HsuvTKv79b8sjYYdpP",
        prototypeLink = "https://www.figma.com/proto/kM58HsuvTKv79b8sjYYdpP?node-id=11-1012&starting-point-node-id=11-1012",
        backLink = "/portfolio-2#product",
        nextLink = "/case-study/hr-hiring-portal",
        processNote = "How this was made: the observations, the two-tap idea and the design decisions are mine. I used AI assistance to lay out the screens and build this prototype faster, then reviewed and edited every screen.",
        style,
    } = props
    const go = useGo()
    const nav = (href: string) => (e: React.MouseEvent) => {
        e.preventDefault()
        go(href)
    }

    const [night, setNight] = useState(false)
    const [thumb, setThumb] = useState(false)

    /* ---------- prototype state ---------- */
    const [screen, setScreen] = useState<Screen>("pick")
    const [from, setFrom] = useState(2)
    const [boardPick, setBoardPick] = useState(2)
    const [pax, setPax] = useState<PaxType>("Adult")
    const [count, setCount] = useState(1)
    const [dest, setDest] = useState(4)
    const [method, setMethod] = useState<Method>("cash")
    const [given, setGiven] = useState(0)
    const [wait, setWait] = useState(10)
    const [nextIn, setNextIn] = useState(3)
    const [pressed, setPressed] = useState(-1)
    const [toast, setToast] = useState("")
    const [book, setBook] = useState({ tickets: 47, cash: 760, upi: 400, card: 80, no: 47 })
    const [last, setLast] = useState({ fare: 30, change: 0, method: "cash" as Method, no: 48, time: "08:43" })
    const protoRef = useRef<HTMLElement>(null)
    const devRef = useRef<HTMLDivElement>(null)
    const [k, setK] = useState(1)

    const fare = unitFare(from, dest, pax) * count
    const ahead = ROUTE.map((s, i) => ({ ...s, i })).slice(from + 1, from + 7)
    const total = book.cash + book.upi + book.card

    // the device keeps its real size (392 px wide) and scales down on narrow screens
    useEffect(() => {
        const el = devRef.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => setK(Math.min(1, e.contentRect.width / 392)))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // payment screen: wait 10 s for UPI, then say so
    useEffect(() => {
        if (screen !== "pay") return
        setWait(10)
        const t = window.setInterval(() => setWait((w) => w - 1), 1000)
        return () => window.clearInterval(t)
    }, [screen])
    useEffect(() => {
        if (screen === "pay" && wait <= 0) setScreen("fail")
    }, [wait, screen])

    // ticket screen: back to Tap 1 after 3 s
    useEffect(() => {
        if (screen !== "done") return
        setNextIn(3)
        const t = window.setInterval(() => setNextIn((n) => n - 1), 1000)
        return () => window.clearInterval(t)
    }, [screen, last.no])
    useEffect(() => {
        if (screen === "done" && nextIn <= 0) nextPassenger()
    }, [nextIn, screen])

    useEffect(() => {
        if (!toast) return
        const t = window.setTimeout(() => setToast(""), 2200)
        return () => window.clearTimeout(t)
    }, [toast])

    const nextPassenger = () => {
        setPax("Adult")
        setCount(1)
        setGiven(0)
        setPressed(-1)
        setScreen("pick")
    }
    const issue = (m: Method, change = 0) => {
        const no = book.no + 1
        setBook((b) => ({ ...b, tickets: b.tickets + 1, no, cash: b.cash + (m === "cash" ? fare : 0), upi: b.upi + (m === "upi" ? fare : 0), card: b.card + (m === "card" ? fare : 0) }))
        setLast({ fare, change, method: m, no, time: "08:43" })
        setMethod(m)
        setScreen("done")
    }
    const pickStop = (i: number) => {
        setPressed(i)
        setDest(i)
        window.setTimeout(() => {
            setPressed(-1)
            if (unitFare(from, i, pax) === 0) {
                const no = book.no + 1
                setBook((b) => ({ ...b, tickets: b.tickets + 1, no }))
                setLast({ fare: 0, change: 0, method: "pass", no, time: "08:43" })
                setMethod("pass")
                setScreen("done")
            } else setScreen("pay")
        }, 160)
    }
    // jump straight to a screen from the index, with sensible sample data
    const show = (id: Screen) => {
        setToast("")
        if (id === "board") setBoardPick(from)
        if (id === "cash") setGiven(Math.max(50, Math.ceil(fare / 50) * 50))
        if (id === "done") setLast({ fare, change: 0, method: "upi", no: book.no + 1, time: "08:43" })
        if (id === "done") setMethod("upi")
        setScreen(id)
    }
    const openScreen = (id: Screen) => {
        show(id)
        protoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    const Status = ({ warn, time = "08:42", low }: { warn?: string; time?: string; low?: boolean }) => (
        <div className="ct-sb">
            <span>{time}</span>
            <span className="ct-sb-r">
                {warn === "gps" ? (
                    <span className="warn">GPS weak</span>
                ) : (
                    <>
                        <Pin />
                        GPS
                    </>
                )}
                {warn === "net" ? (
                    <span className="warn">No network</span>
                ) : (
                    <>
                        <Bars />
                        4G
                    </>
                )}
                <Batt low={low} />
                {low ? "31%" : "76%"}
            </span>
        </div>
    )
    const Top = ({ title, sub, onBack }: { title: string; sub: string; onBack: () => void }) => (
        <div className="ct-topbar">
            <button className="ct-back" onClick={onBack}>
                <Back />
                Back
            </button>
            <div className="ct-tbt">
                <b>{title}</b>
                <span>{sub}</span>
            </div>
        </div>
    )
    const paxLabel = `${count} ${pax}`
    const route = `${ROUTE[from].n} → ${ROUTE[dest].n}`

    const renderScreen = () => {
        switch (screen) {
            case "pick":
                return (
                    <>
                        <Status />
                        <button className="ct-trip" onClick={() => show("shift")} aria-label="Open the shift summary">
                            <span>
                                <b>Route 7</b> · Bus 2187
                            </span>
                            <span>
                                {book.tickets} tickets · {rupee(total)}
                            </span>
                        </button>
                        <button className="ct-from" onClick={() => show("board")}>
                            <span>
                                <span className="ct-lbl">
                                    <Pin />
                                    From · auto
                                </span>
                                <span className="ct-from-name">{ROUTE[from].n}</span>
                                <span className="ct-meta">Last stop · 2 min ago</span>
                            </span>
                            <span className="ct-from-chg">
                                <Swap />
                                Change
                            </span>
                        </button>
                        <div className="ct-pax">
                            <div className="ct-seg" role="group" aria-label="Passenger type">
                                {(["Adult", "Child", "Pass"] as PaxType[]).map((t) => (
                                    <button key={t} className={pax === t ? "on" : ""} aria-pressed={pax === t} onClick={() => setPax(t)}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div className="ct-ctr">
                                <button aria-label="Fewer passengers" onClick={() => setCount((c) => Math.max(1, c - 1))}>
                                    –
                                </button>
                                <span className="ct-ctr-n" aria-live="polite">
                                    {count}
                                </span>
                                <button aria-label="More passengers" onClick={() => setCount((c) => Math.min(9, c + 1))}>
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="ct-to-h">
                            <span className="ct-lbl">To · tap destination</span>
                            <span className="ct-lbl">Fare · {paxLabel}</span>
                        </div>
                        <div className="ct-stops">
                            {ahead.map((s) => (
                                <button key={s.n} className={"ct-stop" + (pressed === s.i ? " pressed" : "")} onClick={() => pickStop(s.i)}>
                                    <span>
                                        <span className="ct-stop-n">{s.n}</span>
                                        <span className="ct-meta">{s.i === from + 1 ? "Next stop" : s.i === ROUTE.length - 1 ? "Terminus" : `Stage ${s.st}`}</span>
                                    </span>
                                    <span className="ct-fare">{rupee(unitFare(from, s.i, pax) * count)}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )
            case "board": {
                const opts = [from - 1, from, from + 1].filter((i) => i >= 0 && i < ROUTE.length - 1)
                return (
                    <>
                        <Status warn="gps" />
                        <Top title="Boarding stop" sub="Fare updates on selection" onBack={() => setScreen("pick")} />
                        <div className="ct-banner">
                            <Warn />
                            GPS signal weak. Confirm the stop
                        </div>
                        <div className="ct-q">Where did the passenger board?</div>
                        <div className="ct-qsub">Previous, last and next stop on Route 7</div>
                        {opts.map((i) => (
                            <button key={i} className={"ct-opt" + (boardPick === i ? " on" : "")} aria-pressed={boardPick === i} onClick={() => setBoardPick(i)}>
                                <span>
                                    <span className="ct-stop-n">{ROUTE[i].n}</span>
                                    <span className="ct-meta">{i === from ? "Last stop · GPS" : i < from ? "Previous stop" : "Next stop"}</span>
                                </span>
                                <span className="ct-radio">{boardPick === i && <i />}</span>
                            </button>
                        ))}
                        <button className="ct-btn-o" onClick={() => setToast("The full stop list isn't part of this prototype")}>
                            Show all {ROUTE.length} route stops
                        </button>
                        <button
                            className="ct-cta black"
                            onClick={() => {
                                setFrom(boardPick)
                                if (dest <= boardPick) setDest(boardPick + 1)
                                setScreen("pick")
                            }}
                        >
                            Confirm · {ROUTE[boardPick].n}
                        </button>
                    </>
                )
            }
            case "pay":
                return (
                    <>
                        <Status time="08:43" />
                        <Top title={route} sub={paxLabel} onBack={() => setScreen("pick")} />
                        <div className="ct-total">
                            <span className="ct-lbl">Total fare</span>
                            <span className="ct-amt">{rupee(fare)}</span>
                        </div>
                        <button className="ct-qrcard" onClick={() => issue("upi")} aria-label="Simulate a UPI payment">
                            <Qr />
                            <span className="ct-qrt">Scan to pay {rupee(fare)} with UPI</span>
                            <span className="ct-wait">
                                <i className="ct-dot" />
                                Waiting for payment · {Math.max(0, wait)} s
                            </span>
                        </button>
                        <button className="ct-tapcard" onClick={() => issue("card")} aria-label="Simulate a card tap">
                            <Contactless />
                            <span>
                                <b>Or tap card on the back</b>
                                <span>NCMC / RuPay contactless</span>
                            </span>
                        </button>
                        <button
                            className="ct-cta yellow"
                            onClick={() => {
                                setGiven(0)
                                setScreen("cash")
                            }}
                        >
                            <Note />
                            Cash · {rupee(fare)}
                        </button>
                    </>
                )
            case "cash": {
                const notes = [50, 100, 200, 500].filter((n) => n > fare)
                return (
                    <>
                        <Status time="08:43" />
                        <Top title={`Cash · fare ${rupee(fare)}`} sub={`${route} · ${paxLabel}`} onBack={() => setScreen("pay")} />
                        <div className="ct-lbl ct-pad">Note given by passenger</div>
                        <div className="ct-grid">
                            <button className="ct-key" onClick={() => issue("cash", 0)}>
                                <small>Exact</small>
                                {rupee(fare)}
                            </button>
                            {notes.map((n) => (
                                <button key={n} className={"ct-key" + (given === n ? " on" : "")} aria-pressed={given === n} onClick={() => setGiven(n)}>
                                    {rupee(n)}
                                </button>
                            ))}
                            <button className="ct-key" onClick={() => setToast("Number entry isn't part of this prototype")}>
                                <small>Other</small>Enter
                            </button>
                        </div>
                        {given > 0 ? (
                            <div className="ct-change">
                                <div className="ct-lbl">Return to passenger</div>
                                <div className="ct-big">{rupee(given - fare)}</div>
                                <div className="ct-meta">
                                    {rupee(given)} received − {rupee(fare)} fare
                                </div>
                            </div>
                        ) : (
                            <div className="ct-change empty">
                                <div className="ct-lbl">Return to passenger</div>
                                <div className="ct-meta">Tap the note you were handed</div>
                            </div>
                        )}
                        <button className="ct-cta black" disabled={!given} onClick={() => issue("cash", given - fare)}>
                            <Printer />
                            Print ticket
                        </button>
                    </>
                )
            }
            case "done":
                return (
                    <>
                        <Status time="08:43" />
                        <div className="ct-trip">
                            <span>
                                <b>Route 7</b> · Bus 2187
                            </span>
                            <span>
                                {book.tickets} tickets · {rupee(total)}
                            </span>
                        </div>
                        <div className="ct-done">
                            <div className="ct-check">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                                </svg>
                            </div>
                            <h3>{last.method === "pass" ? "Pass checked" : `Paid · ${rupee(last.fare)} ${last.method === "upi" ? "UPI" : last.method === "card" ? "card" : "cash"}`}</h3>
                            <p>
                                Printing ticket
                                {last.change > 0 && (
                                    <>
                                        {" "}
                                        · give <b>{rupee(last.change)}</b> change
                                    </>
                                )}
                            </p>
                            <div className="ct-ticket">
                                <div className="c">CITY BUS · ROUTE 7</div>
                                <div className="r">
                                    <span>Ticket</span>
                                    <span>7-{String(last.no).padStart(4, "0")}</span>
                                </div>
                                <div className="r">
                                    <span>10 Oct 2026</span>
                                    <span>{last.time}</span>
                                </div>
                                <hr />
                                <div className="r">
                                    <span>From</span>
                                    <span>{ROUTE[from].n}</span>
                                </div>
                                <div className="r">
                                    <span>To</span>
                                    <span>{ROUTE[dest].n}</span>
                                </div>
                                <div className="r">
                                    <span>
                                        {pax} × {count}
                                    </span>
                                    <span>
                                        {rupee(unitFare(from, dest, pax))} × {count}
                                    </span>
                                </div>
                                <hr />
                                <div className="r tot">
                                    <span>Total · {last.method === "upi" ? "UPI" : last.method === "card" ? "Card" : last.method === "pass" ? "Pass" : "Cash"}</span>
                                    <span>{rupee(last.fare)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="ct-next">
                            <div className="ct-next-row">
                                <span>Next passenger in {Math.max(0, nextIn)} s</span>
                                <span>Vibrate + beep</span>
                            </div>
                            <div className="ct-bar">
                                <i key={last.no} />
                            </div>
                        </div>
                        <div className="ct-row2">
                            <button className="ct-btn-o" onClick={() => setToast("Reprinting ticket")}>
                                Reprint
                            </button>
                            <button className="ct-btn-o" onClick={nextPassenger}>
                                Next now
                            </button>
                        </div>
                    </>
                )
            case "fail":
                return (
                    <>
                        <Status time="08:44" warn="net" />
                        <Top title={route} sub={paxLabel} onBack={() => setScreen("pay")} />
                        <div className="ct-fail">
                            <div className="ct-warn-ic">!</div>
                            <h3>UPI payment not confirmed</h3>
                            <p>No confirmation after 10 seconds. Ask the passenger if money left their account. The machine keeps checking for 2 minutes.</p>
                            <div className="ct-info">
                                <span className="ct-lbl">Still due</span>
                                <b>{rupee(fare)}</b>
                            </div>
                        </div>
                        <button
                            className="ct-cta yellow tight"
                            onClick={() => {
                                setGiven(0)
                                setScreen("cash")
                            }}
                        >
                            <Note />
                            Take cash instead
                        </button>
                        <button className="ct-btn-o" onClick={() => issue("upi")}>
                            Check again
                        </button>
                        <button className="ct-link" onClick={nextPassenger}>
                            Cancel ticket
                        </button>
                    </>
                )
            case "shift":
                return (
                    <>
                        <Status time="14:02" low />
                        <Top title="Shift summary" sub="06:00 to 14:00 · Route 7" onBack={() => setScreen("pick")} />
                        <div className="ct-tiles">
                            <div className="ct-tile">
                                <span className="ct-lbl">Tickets</span>
                                <b>{book.tickets}</b>
                            </div>
                            <div className="ct-tile">
                                <span className="ct-lbl">Collected</span>
                                <b>{rupee(total)}</b>
                            </div>
                        </div>
                        <div className="ct-split">
                            <div className="r">
                                <span>Cash</span>
                                <b>{rupee(book.cash)}</b>
                            </div>
                            <div className="r">
                                <span>UPI</span>
                                <b>{rupee(book.upi)}</b>
                            </div>
                            <div className="r">
                                <span>Card (NCMC)</span>
                                <b>{rupee(book.card)}</b>
                            </div>
                            <div className="r">
                                <span>UPI pending</span>
                                <b>0</b>
                            </div>
                        </div>
                        <div className="ct-bag">
                            <span className="ct-lbl">Cash in bag should be</span>
                            <b>{rupee(book.cash)}</b>
                        </div>
                        <button
                            className="ct-cta black"
                            onClick={() => {
                                setToast("Shift closed. Report printed for the depot")
                                setBook({ tickets: 0, cash: 0, upi: 0, card: 0, no: book.no })
                                setScreen("pick")
                            }}
                        >
                            Close shift · Print report
                        </button>
                    </>
                )
        }
    }

    const cur = SCREENS.find((s) => s.id === screen) || SCREENS[0]

    return (
        <article className={"ct" + (night ? " night" : "")} style={style}>
            <style>{CSS}</style>

            {/* ---------- hero ---------- */}
            <header className="ct-hero">
                <div className="ct-hero-top">
                    <a className="ct-crumb" href={backLink} onClick={nav(backLink)}>
                        ← Product Lab
                    </a>
                    <div className="ct-mode" role="group" aria-label="Page theme">
                        <button className={!night ? "on" : ""} aria-pressed={!night} onClick={() => setNight(false)}>
                            Sunlight
                        </button>
                        <button className={night ? "on" : ""} aria-pressed={night} onClick={() => setNight(true)}>
                            Night
                        </button>
                    </div>
                </div>
                <p className="ct-kicker">Product design case study · Conductor ticketing</p>
                <h1>Two taps to a ticket</h1>
                <p className="ct-lede">
                    A ticketing screen for bus conductors who work with one thumb, on a moving bus, in direct sun. Older machines take four to five presses per ticket. This one takes two: pick the destination, take the payment. The ticket prints by itself.
                </p>
                <div className="ct-taps" aria-label="Presses per ticket, before and after">
                    <div className="ct-taprow">
                        <span className="ct-taplbl">Older machines</span>
                        <span className="ct-keys">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <i key={n} className={n === 5 ? "maybe" : ""}>
                                    {n}
                                </i>
                            ))}
                        </span>
                        <span className="ct-tapnote">four to five presses, stops keyed in by hand</span>
                    </div>
                    <div className="ct-taprow">
                        <span className="ct-taplbl">This design</span>
                        <span className="ct-keys">
                            <i className="y">Destination</i>
                            <i className="y">Payment</i>
                            <i className="ghost">Ticket prints</i>
                        </span>
                        <span className="ct-tapnote">two taps; UPI and card need no tap at all from the conductor</span>
                    </div>
                </div>
                <dl className="ct-meta-row">
                    <div>
                        <dt>Role</dt>
                        <dd>Product designer, solo</dd>
                    </div>
                    <div>
                        <dt>Context</dt>
                        <dd>Design assignment for Nielsen's product design internship</dd>
                    </div>
                    <div>
                        <dt>When</dt>
                        <dd>October 2026</dd>
                    </div>
                    <div>
                        <dt>Deliverables</dt>
                        <dd>Seven screens in Figma, clickable prototype</dd>
                    </div>
                </dl>
            </header>

            {/* ---------- brief ---------- */}
            <section className="ct-sec ct-brief">
                <div>
                    <h2>The brief</h2>
                    <p>Nielsen offered two briefs. I picked the conductor one, because every constraint in it is physical: you can't design around a moving bus with a nicer colour.</p>
                </div>
                <blockquote>
                    Design a digital ticketing interface for bus conductors that supports one-handed use in a moving bus, rapid ticket selection, and visibility in high-glare environments.
                    <cite>Nielsen, assignment brief</cite>
                </blockquote>
                <ul className="ct-three">
                    <li>
                        <b>One hand</b>
                        <span>The other hand is busy, so every tap comes from one thumb.</span>
                    </li>
                    <li>
                        <b>A moving bus</b>
                        <span>Braking and potholes turn small targets and gestures into mistakes.</span>
                    </li>
                    <li>
                        <b>High glare</b>
                        <span>Midday sun washes out low-contrast colour and thin type.</span>
                    </li>
                </ul>
            </section>

            {/* ---------- observation ---------- */}
            <section className="ct-sec ct-split2">
                <div>
                    <h2>What a conductor's hands are doing</h2>
                    <p>I started from what I had seen on buses, before opening Figma.</p>
                </div>
                <div className="ct-obs">
                    <p>
                        <b>One hand holds the machine. The other holds the cash bag,</b> or grabs the rail when the bus brakes. Whatever the screen asks for, it gets from one thumb.
                    </p>
                    <p>
                        <b>Some conductors still use older button machines</b> that take four to five presses per ticket, with stops keyed in by hand. Newer touch machines still ask where the passenger boarded and where they're going.
                    </p>
                    <p>
                        <b>Filling in the boarding stop is a headache,</b> and the least necessary step: the machine already knows where the bus is.
                    </p>
                    <p className="ct-insight">The conductor shouldn't have to tell the machine anything it can work out on its own.</p>
                </div>
            </section>

            {/* ---------- idea ---------- */}
            <section className="ct-sec">
                <h2>The idea: two screens, two taps</h2>
                <p className="ct-narrow">FROM fills itself from GPS with the nearest stand. The conductor only picks TO. The next screen shows a UPI QR, with a card tap below it; when the payment lands, the ticket prints. Nothing else on either screen.</p>
                <ol className="ct-flow">
                    <li className="y">
                        <b>Tap 1</b>
                        <span>Pick destination</span>
                    </li>
                    <li className="y">
                        <b>Tap 2</b>
                        <span>Take payment</span>
                    </li>
                    <li>
                        <b>Automatic</b>
                        <span>Ticket prints</span>
                    </li>
                    <li>
                        <b>3 seconds</b>
                        <span>Back to Tap 1</span>
                    </li>
                </ol>
            </section>

            {/* ---------- edge cases ---------- */}
            <section className="ct-sec">
                <h2>Where two taps could break</h2>
                <p className="ct-narrow">Two taps is the happy path. I listed the ways a real trip could break it and gave each one its own screen, without adding a tap to the common case.</p>
                <div className="ct-edges">
                    {[
                        { t: "GPS is weak, or the bus has moved on", d: "FROM uses the last stop the bus halted at, not the live point. When GPS is weak, a screen offers the three likely stops.", s: "board" as Screen },
                        { t: "The passenger pays cash", d: "Note buttons for what was handed over and the change in large type. Exact fare still prints on the second tap.", s: "cash" as Screen },
                        { t: "The network drops mid-payment", d: "After 10 seconds the conductor gets three ways out: take cash, check again, or cancel. Background checks stop double charges.", s: "fail" as Screen },
                        { t: "Children, groups and passes", d: "Passenger type and count sit above the stop list, defaulting to 1 Adult. A pass skips payment entirely.", s: "pick" as Screen },
                        { t: "Counting the bag at the end of the day", d: "The shift summary splits takings by payment type, so the cash bag is checked against one number.", s: "shift" as Screen },
                    ].map((e) => (
                        <article key={e.t}>
                            <h3>{e.t}</h3>
                            <p>{e.d}</p>
                            <button onClick={() => openScreen(e.s)}>Open this screen</button>
                        </article>
                    ))}
                </div>
            </section>

            {/* ---------- prototype ---------- */}
            <section className="ct-sec ct-proto" ref={protoRef as any} aria-label="Working prototype">
                <div className="ct-proto-dev" ref={devRef}>
                    <div className="ct-scaler" style={{ height: 784 * k }}>
                        <div className={"ct-device" + (thumb ? " thumb" : "")} style={{ transform: `scale(${k})` }}>
                            <div className="ct-printer" />
                            <div className="ct-screen" aria-live="polite">
                                {renderScreen()}
                                {toast && <div className="ct-toast">{toast}</div>}
                                <div className="ct-tz" aria-hidden="true">
                                    <div className="hard">
                                        <span>Hard to reach</span>
                                    </div>
                                    <div className="ok">
                                        <span>Stretch</span>
                                    </div>
                                    <div className="easy">
                                        <span>Easy thumb reach</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="ct-proto-side">
                    <h2>Try it</h2>
                    <p>Every screen works. Tap a stop, then the QR (it pretends the passenger paid), the card strip or Cash. Wait 10 seconds on the payment screen to see the network failure.</p>
                    <div className="ct-index" role="tablist" aria-label="Screens">
                        {SCREENS.map((s, i) => (
                            <button key={s.id} role="tab" aria-selected={screen === s.id} className={screen === s.id ? "on" : ""} onClick={() => show(s.id)}>
                                <i>{i + 1}</i>
                                {s.name}
                            </button>
                        ))}
                    </div>
                    <div className="ct-toggles">
                        <button className={night ? "on" : ""} aria-pressed={night} onClick={() => setNight((n) => !n)}>
                            Night mode
                        </button>
                        <button className={thumb ? "on" : ""} aria-pressed={thumb} onClick={() => setThumb((t) => !t)}>
                            Thumb zone
                        </button>
                    </div>
                    <div className="ct-curnote">
                        <span className={"ct-tag" + (cur.tag.startsWith("Tap") ? " tap" : "")}>{cur.tag}</span>
                        <h3>{cur.name}</h3>
                        <ul>
                            {cur.notes.map((n) => (
                                <li key={n}>{n}</li>
                            ))}
                        </ul>
                    </div>
                    <p className="ct-small">The route, stops and fares are sample data around Kharagpur, for illustration. The QR is a placeholder.</p>
                </div>
            </section>

            {/* ---------- decisions ---------- */}
            <section className="ct-sec">
                <h2>Designing for one thumb, a moving bus and the sun</h2>
                <div className="ct-dec">
                    <div>
                        <h3>One hand</h3>
                        <ul>
                            <li>Everything tapped often sits in the lower two thirds of the screen. Switch on Thumb zone in the prototype to check.</li>
                            <li>No swipes and no long presses. A single tap does everything.</li>
                            <li>76 px stop rows and an 80 px main button, well above the usual 48 px minimum.</li>
                        </ul>
                    </div>
                    <div>
                        <h3>A moving bus</h3>
                        <ul>
                            <li>No typing anywhere in the main flow.</li>
                            <li>Only the stops still ahead, in route order, so the list is short and always in the same order.</li>
                            <li>The ticket prints itself, and a vibration and beep confirm it without looking.</li>
                        </ul>
                    </div>
                    <div>
                        <h3>High glare</h3>
                        <ul>
                            <li>Black on white with 2 px lines in Sunlight mode: 19.8 to 1 contrast.</li>
                            <li>22 to 28 px type for stops and fares. The fare is 60 px so the passenger can read it too.</li>
                            <li>Yellow only for the main action and alerts, so it always means look here.</li>
                        </ul>
                    </div>
                    <div>
                        <h3>Speed</h3>
                        <ul>
                            <li>Back to Tap 1 three seconds after printing. Next now skips the wait.</li>
                            <li>UPI and card payments are detected, so the conductor doesn't tap to confirm them.</li>
                            <li>Exact cash prints on the second tap, like UPI.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ---------- foundations ---------- */}
            <section className="ct-sec">
                <h2>Foundations</h2>
                <p className="ct-narrow">Eight colours, each with one job. Contrast ratios are against the screen they sit on in Sunlight mode.</p>
                <div className="ct-swatches">
                    {[
                        ["Paper White", "#FFFFFF", "Screen background in Sunlight mode. White reflects the most light, so the screen fights glare instead of losing to it.", "Base"],
                        ["Ink Black", "#0A0A0A", "Text, 2 px lines and the main dark button.", "19.8 : 1"],
                        ["Muted Grey", "#3B3B3B", "Secondary lines like Next stop. Still dark enough to read in sun.", "11.2 : 1"],
                        ["Soft Grey", "#EFEFEF", "Header bands and progress tracks: separation without another line.", "17.2 : 1 with ink"],
                        ["Signal Yellow", "#FFD400", "The main action and alerts only, always with black text.", "13.8 : 1 with ink"],
                        ["Success Green", "#0B7A35", "Paid and printed.", "5.5 : 1"],
                        ["Alert Red", "#B3261E", "Payment problems and warnings in the status bar.", "6.5 : 1"],
                        ["UPI Blue", "#1A47B8", "The waiting dot on the UPI panel, matching what passengers see in payment apps.", "8.0 : 1"],
                    ].map(([n, h, why, c]) => (
                        <div key={n} className="ct-sw">
                            <span className="ct-chip" style={{ background: h }} />
                            <b>{n}</b>
                            <code>{h}</code>
                            <span className="ct-cr">{c}</span>
                            <p>{why}</p>
                        </div>
                    ))}
                </div>
                <div className="ct-type">
                    <div>
                        <span className="ct-spec">Il1 O0 S5 B8 ₹30</span>
                        <h3>Atkinson Hyperlegible</h3>
                        <p>Made by the Braille Institute for low-vision readers. Characters that are easy to confuse, like I, l and 1 or O and 0, are drawn differently, which matters when a fare is read in a glance under glare. Free to use.</p>
                    </div>
                    <div>
                        <span className="ct-spec mono">7-0048 ₹15 × 2</span>
                        <h3>IBM Plex Mono</h3>
                        <p>Only on the printed ticket. Fixed-width figures line up in columns, like a thermal receipt.</p>
                    </div>
                    <div className="ct-scale">
                        {[
                            ["60", "Fare"],
                            ["28", "Boarding stop, headings"],
                            ["22", "Stop rows"],
                            ["17", "Body"],
                            ["13", "Labels"],
                        ].map(([s, l]) => (
                            <div key={s}>
                                <b style={{ fontSize: Math.min(Number(s), 44) }}>{s}</b>
                                <span>{l}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------- iteration ---------- */}
            <section className="ct-sec">
                <h2>What changed after review</h2>
                <p className="ct-narrow">Reviewing the first full pass screen by screen, I found five places where the words or sizes didn't match what the conductor needed.</p>
                <div className="ct-iter">
                    {[
                        ["Labels", "12 px uppercase labels", "13 px", "Labels like TOTAL FARE were too small to read in glare."],
                        ["UPI wait", "Waiting · confirms automatically", "Waiting for payment · 10 s", "The conductor now knows when to offer cash instead."],
                        ["Payment failure", "The machine keeps checking", "Ask the passenger if money left their account", "Stops a conductor taking cash from someone who already paid."],
                        ["Next passenger", "Next passenger in 2 s", "Next passenger in 3 s", "The words now match what the screen actually does."],
                        ["Other note", "₹ __", "Other · Enter", "A blank amount didn't say what tapping it would do."],
                    ].map(([t, a, b, why]) => (
                        <div key={t} className="ct-it">
                            <h3>{t}</h3>
                            <div className="ct-ba">
                                <span className="was">{a}</span>
                                <span className="now">{b}</span>
                            </div>
                            <p>{why}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------- testing ---------- */}
            <section className="ct-sec">
                <h2>How I'd test it</h2>
                <p className="ct-narrow">I haven't run these yet. This is the plan for putting the design in front of conductors, and what would tell me it works.</p>
                <div className="ct-table" role="table" aria-label="Test plan">
                    <div className="h" role="row">
                        <span role="columnheader">Test</span>
                        <span role="columnheader">What I'd measure</span>
                        <span role="columnheader">It works if</span>
                    </div>
                    {[
                        ["Ride along on two routes, peak and off-peak", "Presses and seconds per ticket on today's machines, and how conductors hold the bag", "I have a baseline to beat"],
                        ["Five conductors, the prototype on a phone, standing in a moving bus", "Taps per ticket, seconds per ticket, wrong-stop tickets", "Exact cash and UPI tickets take two taps and under 5 seconds, with no wrong stops"],
                        ["Read the fare and change outdoors at noon", "Correct reads at arm's length, Sunlight mode against a standard light theme", "Every reading is right first time"],
                        ["One-handed reach", "Where thumbs land during a run of tickets", "No frequent tap needs a second hand or a grip change"],
                        ["Network drop during payment", "Which way out the conductor picks, and whether anyone pays twice", "Nobody is charged twice"],
                    ].map(([a, b, c]) => (
                        <div key={a} role="row">
                            <span role="cell">{a}</span>
                            <span role="cell">{b}</span>
                            <span role="cell">{c}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------- reflection ---------- */}
            <section className="ct-sec ct-split2">
                <div>
                    <h2>What I'd do next</h2>
                </div>
                <div className="ct-obs">
                    <p>The two-tap idea came from watching conductors, but it hasn't met one yet. Before polishing more screens I'd run the ride-along and the moving-bus test, with a real route, real stops and real fares in place of my sample data.</p>
                    <p>Open questions for a pilot: how fast the printer is, what the depot needs in the shift report, and whether conductors trust a UPI payment the machine detected without them.</p>
                    {processNote && <p className="ct-process">{processNote}</p>}
                </div>
            </section>

            {/* ---------- links ---------- */}
            <footer className="ct-end">
                <div className="ct-links">
                    {figmaLink && (
                        <a href={figmaLink} target="_blank" rel="noopener">
                            Open the Figma file
                        </a>
                    )}
                    {prototypeLink && (
                        <a href={prototypeLink} target="_blank" rel="noopener">
                            Play the Figma prototype
                        </a>
                    )}
                </div>
                <div className="ct-next-cs">
                    <a href={backLink} onClick={nav(backLink)}>
                        ← Back to the Product Lab
                    </a>
                    {nextLink && (
                        <a className="go" href={nextLink} onClick={nav(nextLink)}>
                            Next case study: HR Hiring Portal →
                        </a>
                    )}
                </div>
            </footer>
        </article>
    )
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=IBM+Plex+Mono:wght@400;600&display=swap");
.ct{box-sizing:border-box;--bg:#FFFFFF;--ink:#0A0A0A;--mute:#3B3B3B;--soft:#EFEFEF;--y:#FFD400;--good:#0B7A35;--bad:#B3261E;--upi:#1A47B8;--line:#0A0A0A;
  --s-bg:#FFFFFF;--s-ink:#0A0A0A;--s-mute:#3B3B3B;--s-soft:#EFEFEF;--s-line:#0A0A0A;--s-good:#0B7A35;--s-bad:#B3261E;--s-upi:#1A47B8;
  position:relative;width:100%;max-width:1200px;margin-inline:auto;padding:140px clamp(20px,5vw,72px) 110px;background:var(--bg);color:var(--ink);font-family:"Atkinson Hyperlegible",system-ui,sans-serif;font-size:18px;line-height:1.55;overflow:clip;transition:background .35s,color .35s}
.ct.night{--bg:#000000;--ink:#FFFFFF;--mute:#C9C9C9;--soft:#1C1C1C;--line:#FFFFFF;--good:#3DDC84;--bad:#FF6B5E;--upi:#8FB0FF;
  --s-bg:#000000;--s-ink:#FFFFFF;--s-mute:#D6D6D6;--s-soft:#1C1C1C;--s-line:#FFFFFF;--s-good:#3DDC84;--s-bad:#FF6B5E;--s-upi:#8FB0FF}
.ct *{box-sizing:border-box}
:where(.ct) button{font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;text-align:left}
.ct button:focus-visible,.ct a:focus-visible{outline:3px solid var(--y);outline-offset:3px}
.ct h1,.ct h2,.ct h3{margin:0;font-weight:700;letter-spacing:-.015em;color:var(--ink)}
.ct p{margin:0 0 14px}
.ct a{color:inherit}
.ct-sec{margin-top:clamp(88px,10vw,140px)}
.ct-sec > h2,.ct-split2 h2,.ct-brief h2,.ct-proto-side h2{font-size:clamp(30px,3.6vw,46px);line-height:1.08;margin-bottom:18px}
.ct-narrow{max-width:680px;color:var(--mute)}
.ct-small{font-size:14px;color:var(--mute)}
/* hero */
.ct-hero-top{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:48px}
.ct-crumb{font-weight:700;text-decoration:none;font-size:16px}
.ct-crumb:hover{text-decoration:underline}
.ct-mode{display:flex;border:2px solid var(--line);border-radius:12px;overflow:hidden}
.ct-mode button{padding:10px 18px;font-weight:700;font-size:15px}
.ct-mode button.on{background:var(--ink);color:var(--bg)}
.ct-kicker{font-size:16px;font-weight:700;color:var(--mute)}
.ct-hero h1{font-size:clamp(52px,8.4vw,120px);line-height:.95;letter-spacing:-.035em;max-width:10ch}
.ct-lede{margin-top:28px!important;max-width:640px;font-size:clamp(19px,1.8vw,22px);line-height:1.5}
.ct-taps{margin-top:44px;display:grid;gap:14px;padding:26px;border:2px solid var(--line);border-radius:20px}
.ct-taprow{display:grid;grid-template-columns:150px auto 1fr;gap:18px;align-items:center}
.ct-taplbl{font-weight:700;font-size:16px}
.ct-keys{display:flex;gap:8px;flex-wrap:wrap}
.ct-keys i{font-style:normal;display:grid;place-items:center;min-width:52px;height:52px;padding:0 14px;border:2px solid var(--line);border-radius:12px;font-weight:700;font-size:17px;background:var(--soft)}
.ct-keys i.maybe{border-style:dashed;background:none}
.ct-keys i.y{background:var(--y);color:#0A0A0A;border-color:#0A0A0A}
.ct-keys i.ghost{border-style:dashed;background:none;color:var(--mute)}
.ct-tapnote{font-size:15px;color:var(--mute)}
.ct-meta-row{margin:36px 0 0;display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding:22px 0;border-top:2px solid var(--line);border-bottom:2px solid var(--line)}
.ct-meta-row dt{font-size:14px;font-weight:700;color:var(--mute);margin-bottom:4px}
.ct-meta-row dd{margin:0;font-size:16px;line-height:1.45}
/* brief */
.ct-brief{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:24px clamp(28px,5vw,64px);align-items:start}
.ct-brief > div p{color:var(--mute)}
.ct-brief blockquote{margin:0;padding:26px 28px;border-radius:20px;background:var(--y);color:#0A0A0A;font-size:clamp(20px,2vw,25px);line-height:1.4;font-weight:700}
.ct-brief cite{display:block;margin-top:14px;font-size:14px;font-style:normal;font-weight:400}
.ct-three{grid-column:1/-1;list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.ct-three li{padding:22px;border:2px solid var(--line);border-radius:16px;display:grid;gap:6px}
.ct-three b{font-size:21px}
.ct-three span{color:var(--mute);font-size:16px}
/* two column text */
.ct-split2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);gap:24px clamp(28px,5vw,64px)}
.ct-split2 > div > p{color:var(--mute)}
.ct-obs p{font-size:19px;line-height:1.6}
.ct-insight{margin-top:24px!important;padding:18px 22px;border-left:6px solid var(--y);font-size:clamp(21px,2vw,25px)!important;font-weight:700;line-height:1.35!important}
.ct-process{margin-top:26px!important;padding-top:18px;border-top:2px solid var(--soft);font-size:15px!important;color:var(--mute)}
/* idea flow */
.ct-flow{list-style:none;margin:30px 0 0;padding:0;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.ct-flow li{position:relative;padding:20px 22px;border:2px solid var(--line);border-radius:16px;display:grid;gap:4px}
.ct-flow li.y{background:var(--y);color:#0A0A0A;border-color:#0A0A0A}
.ct-flow b{font-size:14px}
.ct-flow span{font-size:21px;font-weight:700}
.ct-flow li:not(:last-child)::after{content:"";position:absolute;right:-12px;top:50%;width:12px;height:2px;background:var(--line)}
/* edges */
.ct-edges{margin-top:30px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:16px}
.ct-edges article{display:flex;flex-direction:column;padding:24px;border:2px solid var(--line);border-radius:18px}
.ct-edges h3{font-size:21px;line-height:1.25;margin-bottom:10px}
.ct-edges p{color:var(--mute);font-size:16px}
.ct-edges button{margin-top:auto;align-self:flex-start;padding:10px 16px;border:2px solid var(--line);border-radius:10px;font-weight:700;font-size:15px}
.ct-edges button:hover{background:var(--y);color:#0A0A0A;border-color:#0A0A0A}
/* prototype */
.ct-proto{display:grid;grid-template-columns:392px minmax(0,1fr);gap:clamp(28px,5vw,64px);align-items:start;scroll-margin-top:90px}
.ct-proto-dev{width:100%;max-width:392px}
.ct-scaler{position:relative;width:100%}
.ct-device{position:absolute;left:0;top:0;width:392px;padding:40px 16px 24px;background:#202022;border-radius:34px;box-shadow:0 18px 40px rgba(0,0,0,.25);transform-origin:0 0}
.ct-printer{position:absolute;top:14px;left:50%;transform:translateX(-50%);width:200px;height:12px;border-radius:6px;background:#0B0B0C}
.ct-proto-side p{color:var(--mute)}
.ct-index{display:grid;gap:6px;margin:22px 0 16px}
.ct-index button{display:flex;align-items:center;gap:12px;padding:10px 14px;border:2px solid transparent;border-radius:12px;font-weight:700;font-size:16px}
.ct-index button i{font-style:normal;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;border:2px solid var(--line);font-size:14px}
.ct-index button:hover{border-color:var(--soft)}
.ct-index button.on{border-color:var(--line)}
.ct-index button.on i{background:var(--y);color:#0A0A0A;border-color:#0A0A0A}
.ct-toggles{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:22px}
.ct-toggles button{padding:10px 16px;border:2px solid var(--line);border-radius:10px;font-weight:700;font-size:15px}
.ct-toggles button.on{background:var(--ink);color:var(--bg)}
.ct-curnote{padding:22px;border-radius:18px;background:var(--soft);margin-bottom:16px}
.ct-tag{display:inline-block;font-size:13px;font-weight:700;background:var(--ink);color:var(--bg);border-radius:6px;padding:4px 9px}
.ct-tag.tap{background:var(--y);color:#0A0A0A}
.ct-curnote h3{font-size:22px;margin:10px 0 8px}
.ct-curnote ul{margin:0;padding-left:20px;font-size:16px;display:grid;gap:6px}
/* the machine's screen */
.ct-screen{width:360px;height:720px;border-radius:14px;overflow:hidden;position:relative;background:var(--s-bg);color:var(--s-ink);display:flex;flex-direction:column;font-size:16px;line-height:1.25;--line:var(--s-line)}
.ct-screen svg{width:20px;height:20px;flex:none}
.ct-sb{height:28px;flex:none;display:flex;justify-content:space-between;align-items:center;padding:0 16px;font-size:13px;font-weight:700}
.ct-sb-r{display:flex;gap:6px;align-items:center}
.ct-sb-r svg{width:14px;height:14px}
.ct-sb .warn{color:var(--s-bad)}
.ct-trip{width:100%;height:40px;flex:none;display:flex!important;justify-content:space-between;align-items:center;padding:0 16px!important;font-size:14px;border-bottom:2px solid var(--s-line)!important}
.ct-trip b{font-size:15px}
.ct-lbl{font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;display:flex;gap:6px;align-items:center}
.ct-lbl svg{width:14px;height:14px}
.ct-pad{padding:16px 16px 10px}
.ct-meta{display:block;font-size:14px;color:var(--s-mute);margin-top:2px}
.ct-from{width:100%;height:84px;flex:none;display:flex!important;align-items:center;justify-content:space-between;padding:10px 16px!important;border-bottom:2px solid var(--s-line)!important}
.ct-from > span:first-child{display:block}
.ct-from-name{display:block;font-size:28px;font-weight:700;line-height:1.1;margin-top:3px}
.ct-from-chg{width:76px;height:60px;border:2px solid var(--s-line);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:13px;font-weight:700}
.ct-pax{height:72px;flex:none;display:flex;gap:8px;padding:10px 16px;border-bottom:2px solid var(--s-line)}
.ct-seg{flex:1;display:flex;border:2px solid var(--s-line);border-radius:12px;overflow:hidden}
.ct-seg button{flex:1;text-align:center!important;font-size:16px;font-weight:700;border-right:2px solid var(--s-line)!important}
.ct-seg button:last-child{border-right:0!important}
.ct-seg button.on{background:var(--s-ink);color:var(--s-bg)}
.ct-ctr{display:flex;align-items:stretch;border:2px solid var(--s-line);border-radius:12px;overflow:hidden}
.ct-ctr button{width:46px;font-size:28px;font-weight:700;text-align:center!important;line-height:1}
.ct-ctr-n{width:38px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;border-left:2px solid var(--s-line);border-right:2px solid var(--s-line)}
.ct-to-h{height:36px;flex:none;display:flex;justify-content:space-between;align-items:center;padding:0 16px;background:var(--s-soft)}
.ct-stops{flex:1;display:flex;flex-direction:column}
.ct-stop{width:100%;height:76px;flex:none;display:flex!important;justify-content:space-between;align-items:center;padding:0 16px!important;border-top:2px solid var(--s-line)!important}
.ct-stop > span:first-child{display:block}
.ct-stop-n{display:block;font-size:22px;font-weight:700;line-height:1.15}
.ct-fare{font-size:28px;font-weight:700}
.ct-stop.pressed,.ct-stop:active{background:var(--y);color:#0A0A0A}
.ct-stop.pressed .ct-meta,.ct-stop:active .ct-meta{color:#0A0A0A}
.ct-topbar{height:60px;flex:none;display:flex;align-items:center;gap:12px;padding:0 12px;border-bottom:2px solid var(--s-line)}
.ct-back{height:44px;padding:0 14px 0 10px!important;border:2px solid var(--s-line)!important;border-radius:10px;display:flex!important;align-items:center;gap:6px;font-weight:700;font-size:16px}
.ct-tbt{display:flex;flex-direction:column;font-size:14px;line-height:1.25;min-width:0}
.ct-tbt b{font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ct-cta{margin:auto 16px 16px!important;height:80px;flex:none;border-radius:16px;display:flex!important;align-items:center;justify-content:center;gap:12px;font-size:24px;font-weight:700;text-align:center!important}
.ct-cta svg{width:28px;height:28px}
.ct-cta.yellow{background:var(--y);color:#0A0A0A;border:2px solid #0A0A0A!important}
.ct-cta.black{background:var(--s-ink);color:var(--s-bg)}
.ct-cta.tight{margin:20px 16px 12px!important}
.ct-cta[disabled]{opacity:.35;cursor:default}
.ct-btn-o{margin:0 16px 12px!important;height:60px;flex:none;border:2px solid var(--s-line)!important;border-radius:14px;display:flex!important;align-items:center;justify-content:center;gap:10px;font-size:18px;font-weight:700}
.ct-link{margin:0 16px 16px!important;height:44px;flex:none;display:flex!important;align-items:center;justify-content:center;font-size:16px;font-weight:700;text-decoration:underline}
.ct-banner{flex:none;display:flex;gap:10px;align-items:center;background:var(--y);color:#0A0A0A;padding:12px 16px;font-size:16px;font-weight:700;border-bottom:2px solid #0A0A0A}
.ct-q{font-size:24px;font-weight:700;line-height:1.2;padding:18px 16px 4px}
.ct-qsub{font-size:15px;color:var(--s-mute);padding:0 16px 14px}
.ct-opt{margin:0 16px 10px!important;height:88px;flex:none;border:2px solid var(--s-line)!important;border-radius:14px;display:flex!important;align-items:center;justify-content:space-between;padding:0 16px!important}
.ct-opt > span:first-child{display:block}
.ct-opt .ct-stop-n{font-size:24px}
.ct-radio{width:30px;height:30px;border-radius:50%;border:3px solid var(--s-line);display:flex;align-items:center;justify-content:center}
.ct-opt.on{background:var(--s-ink);color:var(--s-bg)}
.ct-opt.on .ct-meta{color:var(--s-bg)}
.ct-opt.on .ct-radio{border-color:var(--s-bg)}
.ct-opt.on .ct-radio i{width:14px;height:14px;border-radius:50%;background:var(--y)}
.ct-total{flex:none;display:flex;align-items:flex-end;justify-content:space-between;padding:12px 16px 14px;border-bottom:2px solid var(--s-line)}
.ct-amt{font-size:60px;font-weight:700;line-height:.95}
.ct-qrcard{margin:14px 16px 0!important;flex:none;border:2px solid #0A0A0A!important;border-radius:16px;padding:14px!important;display:flex!important;flex-direction:column;align-items:center;gap:8px;background:#FFFFFF!important;color:#0A0A0A!important}
.ct-qr{width:172px!important;height:172px!important;display:block}
.ct-qrt{font-size:18px;font-weight:700}
.ct-wait{font-size:14px;display:flex;align-items:center;gap:8px;color:#2A2A2A}
.ct-dot{width:10px;height:10px;border-radius:50%;background:#1A47B8;animation:ct-pulse 1.2s ease-in-out infinite}
@keyframes ct-pulse{0%,100%{opacity:1}50%{opacity:.25}}
.ct-tapcard{margin:12px 16px 0!important;height:64px;flex:none;border:2px dashed var(--s-line)!important;border-radius:14px;display:flex!important;align-items:center;gap:12px;padding:0 14px!important}
.ct-tapcard svg{width:30px;height:30px}
.ct-tapcard b{display:block;font-size:17px}
.ct-tapcard span span{font-size:13px;color:var(--s-mute)}
.ct-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:0 16px;flex:none}
.ct-key{height:72px;border:2px solid var(--s-line)!important;border-radius:12px;display:flex!important;flex-direction:column;align-items:center;justify-content:center;font-size:24px;font-weight:700;text-align:center!important;line-height:1.1}
.ct-key small{font-size:12px;letter-spacing:.06em;text-transform:uppercase}
.ct-key.on{background:var(--s-ink);color:var(--s-bg)}
.ct-change{margin:16px 16px 0;flex:none;background:var(--y);color:#0A0A0A;border:2px solid #0A0A0A;border-radius:16px;padding:14px 16px;min-height:132px}
.ct-change .ct-big{font-size:64px;font-weight:700;line-height:1;margin-top:6px}
.ct-change .ct-meta{color:#0A0A0A}
.ct-change.empty{background:none;color:var(--s-ink);border:2px dashed var(--s-line)}
.ct-change.empty .ct-meta{color:var(--s-mute);margin-top:12px;font-size:16px}
.ct-done{flex:1;display:flex;flex-direction:column;align-items:center;padding:20px 16px 0;text-align:center}
.ct-check{width:84px;height:84px;border-radius:50%;background:var(--s-good);display:flex;align-items:center;justify-content:center;flex:none}
.ct-check svg{width:46px!important;height:46px!important}
.ct-done h3{margin:12px 0 2px;font-size:28px;color:var(--s-ink)}
.ct-done p{margin:0;font-size:17px;color:var(--s-mute)}
.ct-done p b{color:var(--s-ink)}
.ct-ticket{margin-top:14px;width:100%;background:#FFFFFF;color:#0A0A0A;border:2px solid #0A0A0A;border-radius:6px;padding:12px 14px;font-family:"IBM Plex Mono",monospace;font-size:13px;line-height:1.55;text-align:left}
.ct-ticket .r{display:flex;justify-content:space-between;gap:8px}
.ct-ticket .c{text-align:center;font-weight:600}
.ct-ticket hr{border:0;border-top:2px dashed #0A0A0A;margin:6px 0}
.ct-ticket .tot{font-size:16px;font-weight:600}
.ct-next{margin:auto 16px 0;flex:none}
.ct-next-row{display:flex;justify-content:space-between;font-size:15px;font-weight:700;margin-bottom:8px}
.ct-bar{height:10px;border-radius:5px;background:var(--s-soft);overflow:hidden;border:2px solid var(--s-line)}
.ct-bar i{display:block;height:100%;background:var(--s-ink);animation:ct-fill 3s linear forwards}
@keyframes ct-fill{from{width:0}to{width:100%}}
.ct-row2{display:flex;gap:10px;margin:14px 16px 16px;flex:none}
.ct-row2 .ct-btn-o{margin:0!important;flex:1}
.ct-fail{flex:1;display:flex;flex-direction:column;align-items:center;padding:24px 16px 0;text-align:center}
.ct-warn-ic{width:84px;height:84px;border-radius:50%;border:4px solid var(--s-bad);color:var(--s-bad);display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:700;flex:none}
.ct-fail h3{margin:14px 0 6px;font-size:28px;line-height:1.15;color:var(--s-ink)}
.ct-fail p{margin:0;font-size:16px;color:var(--s-mute);line-height:1.4}
.ct-info{margin-top:16px;width:100%;border:2px solid var(--s-line);border-radius:14px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;text-align:left}
.ct-info b{font-size:28px}
.ct-tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:14px 16px 6px;flex:none}
.ct-tile{border:2px solid var(--s-line);border-radius:14px;padding:12px 14px}
.ct-tile b{display:block;font-size:34px;line-height:1.1;margin-top:4px}
.ct-split{flex:none;padding:0 16px}
.ct-split .r{display:flex;justify-content:space-between;align-items:center;height:52px;border-bottom:2px solid var(--s-line);font-size:18px}
.ct-split .r b{font-size:22px}
.ct-bag{margin:14px 16px 0;flex:none;background:var(--y);color:#0A0A0A;border:2px solid #0A0A0A;border-radius:14px;padding:12px 16px}
.ct-bag b{display:block;font-size:34px;margin-top:2px}
.ct-toast{position:absolute;left:16px;right:16px;top:76px;z-index:6;padding:12px 14px;border-radius:12px;background:var(--s-ink);color:var(--s-bg);font-weight:700;font-size:15px;text-align:center;animation:ct-in .2s ease-out}
@keyframes ct-in{from{opacity:0;transform:translateY(-6px)}}
.ct-tz{display:none;position:absolute;inset:0;pointer-events:none;flex-direction:column;z-index:5}
.ct-device.thumb .ct-tz{display:flex}
.ct-tz div{position:relative;border-top:2px dashed rgba(0,0,0,.55)}
.ct-tz div:first-child{border-top:0}
.ct-tz span{position:absolute;right:8px;top:8px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:#141414;color:#fff;padding:3px 6px;border-radius:4px}
.ct-tz .hard{height:30%;background:rgba(200,40,40,.2)}
.ct-tz .ok{height:22%;background:rgba(255,180,0,.22)}
.ct-tz .easy{flex:1;background:rgba(20,150,70,.2)}
/* decisions */
.ct-dec{margin-top:30px;display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.ct-dec > div{padding:26px;border:2px solid var(--line);border-radius:18px}
.ct-dec h3{font-size:24px;margin-bottom:12px}
.ct-dec ul{margin:0;padding-left:20px;display:grid;gap:8px;font-size:17px}
/* foundations */
.ct-swatches{margin-top:28px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.ct-sw{padding:16px;border:2px solid var(--line);border-radius:16px;display:grid;grid-template-columns:auto 1fr;column-gap:12px;row-gap:2px;align-content:start}
.ct-chip{grid-row:span 2;width:48px;height:48px;border-radius:10px;border:2px solid var(--line)}
.ct-sw b{font-size:17px;align-self:end}
.ct-sw code{font-family:"IBM Plex Mono",monospace;font-size:14px;color:var(--mute)}
.ct-cr{grid-column:1/-1;margin-top:12px;font-size:13px;font-weight:700}
.ct-sw p{grid-column:1/-1;margin:4px 0 0;font-size:14.5px;color:var(--mute);line-height:1.45}
.ct-type{margin-top:16px;display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:14px}
.ct-type > div{padding:22px;border:2px solid var(--line);border-radius:16px}
.ct-type p{font-size:15.5px;color:var(--mute);margin:8px 0 0}
.ct-type h3{font-size:20px;margin-top:14px}
.ct-spec{display:block;font-size:clamp(34px,3.6vw,46px);font-weight:700;line-height:1.05;letter-spacing:.01em}
.ct-spec.mono{font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:clamp(24px,2.4vw,30px)}
.ct-scale{display:grid;gap:8px;align-content:start}
.ct-scale > div{display:flex;align-items:baseline;gap:12px;border-bottom:2px solid var(--soft);padding-bottom:6px}
.ct-scale b{line-height:1;min-width:2.2em}
.ct-scale span{font-size:15px;color:var(--mute)}
/* iteration */
.ct-iter{margin-top:28px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:14px}
.ct-it{padding:22px;border:2px solid var(--line);border-radius:16px}
.ct-it h3{font-size:19px;margin-bottom:12px}
.ct-ba{display:grid;gap:6px;margin-bottom:12px}
.ct-ba span{padding:9px 12px;border-radius:10px;font-weight:700;font-size:16px}
.ct-ba .was{background:var(--soft);color:var(--mute);text-decoration:line-through;text-decoration-thickness:2px}
.ct-ba .now{background:var(--y);color:#0A0A0A}
.ct-it p{margin:0;font-size:15.5px;color:var(--mute)}
/* test plan */
.ct-table{margin-top:28px;border:2px solid var(--line);border-radius:18px;overflow:hidden}
.ct-table > div{display:grid;grid-template-columns:1.1fr 1.3fr 1fr;gap:20px;padding:16px 22px;border-top:2px solid var(--soft);font-size:16px}
.ct-table > div:first-child{border-top:0}
.ct-table .h{background:var(--ink);color:var(--bg);font-weight:700;font-size:15px}
.ct-table > div:not(.h) span:first-child{font-weight:700}
/* end */
.ct-end{margin-top:clamp(88px,10vw,140px);padding-top:28px;border-top:2px solid var(--line);display:grid;gap:22px}
.ct-links,.ct-next-cs{display:flex;gap:12px;flex-wrap:wrap;justify-content:space-between}
.ct-links{justify-content:flex-start}
.ct-links a,.ct-next-cs a{padding:14px 20px;border:2px solid var(--line);border-radius:12px;font-weight:700;text-decoration:none}
.ct-links a:hover,.ct-next-cs a:hover{background:var(--soft)}
.ct-next-cs a.go{background:var(--y);color:#0A0A0A;border-color:#0A0A0A}
@media (max-width:980px){
  .ct-swatches{grid-template-columns:repeat(2,1fr)}
  .ct-type{grid-template-columns:1fr}
  .ct-proto{grid-template-columns:1fr}
  .ct-proto-dev{margin-inline:auto}
}
@media (max-width:760px){
  .ct{padding-top:110px;font-size:17px}
  .ct-meta-row{grid-template-columns:1fr 1fr}
  .ct-brief,.ct-split2{grid-template-columns:1fr}
  .ct-three,.ct-flow,.ct-dec{grid-template-columns:1fr}
  .ct-flow li:not(:last-child)::after{display:none}
  .ct-taprow{grid-template-columns:1fr;gap:8px}
  .ct-taps{padding:18px}
  .ct-table > div{grid-template-columns:1fr;gap:4px}
  .ct-table .h{display:none!important}
  .ct-hero-top{margin-bottom:32px}
}
@media (max-width:480px){.ct-swatches{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.ct,.ct-dot,.ct-toast{transition:none;animation:none}.ct-bar i{animation-duration:.01s}}
`

addPropertyControls(ConductorCaseStudy, {
    figmaLink: { type: ControlType.String, title: "Figma file", defaultValue: "https://www.figma.com/design/kM58HsuvTKv79b8sjYYdpP" },
    prototypeLink: { type: ControlType.String, title: "Figma prototype", defaultValue: "https://www.figma.com/proto/kM58HsuvTKv79b8sjYYdpP?node-id=11-1012&starting-point-node-id=11-1012" },
    backLink: { type: ControlType.String, title: "Back link", defaultValue: "/portfolio-2#product" },
    nextLink: { type: ControlType.String, title: "Next case study", defaultValue: "/case-study/hr-hiring-portal" },
    processNote: {
        type: ControlType.String,
        title: "Process note",
        displayTextArea: true,
        defaultValue: "How this was made: the observations, the two-tap idea and the design decisions are mine. I used AI assistance to lay out the screens and build this prototype faster, then reviewed and edited every screen.",
    },
})
