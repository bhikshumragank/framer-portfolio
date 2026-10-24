import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import * as FramerLib from "framer"
import { useEffect, useRef, useState, type CSSProperties } from "react"

type Project = {
    title: string
    sector: string
    color: string
    icon: "chat" | "dash" | "form" | "mascot" | "film"
    text: string
    image: string
    link: string
}

type Role = {
    company: string
    role: string
    place: string
    dates: string
    kind: string
    color: string
    current: boolean
    summary: string
    metrics: string
    points: string
}

type Award = { title: string; detail: string }

type Props = {
    sign: string
    eyebrow: string
    intro: string
    stats: string
    roles: Role[]
    projects: Project[]
    projectsHeading: string
    awards: Award[]
    ctaHeading: string
    contactLabel: string
    contactLink: string
    cvLabel: string
    cvLink: string
    linkedinLink: string
    neonColor: string
    blueColor: string
    background: string
    style?: CSSProperties
}

const DEFAULT_ROLES: Role[] = [
    {
        company: "Sonepar India",
        role: "Marketing and Communication Intern",
        place: "Gurugram, Haryana",
        dates: "May 2026 – Aug 2026",
        kind: "Internship",
        color: "#FF8A2A",
        current: true,
        summary:
            "Product, brand and visual design for the Indian arm of a global B2B electrical distributor, from the website's first AI assistant to the company mascot.",
        metrics: "1st|AI chatbot on the website;~500|candidates a year on the HR portal;70+|visuals on one system;6|brand films",
        points: "",
    },
    {
        company: "PixyGrid",
        role: "Visual Design Intern",
        place: "Remote",
        dates: "Feb 2026 – Apr 2026",
        kind: "Internship",
        color: "#2F9BFF",
        current: false,
        summary: "Took clients from onboarding to delivery across fintech, jewellery and service brands.",
        metrics: "35+|branding visuals;4|fintech and leisure clients",
        points:
            "Designed social creatives for Angel One, Indian Equity Research, Dhan App and Joy and Water Park\nAdapted visual styles across finance, lifestyle and service industries while keeping each brand consistent",
    },
    {
        company: "Optibase Financial (Returns Wealth)",
        role: "Experience Design Intern",
        place: "Gurugram, Haryana",
        dates: "May 2025 – Jul 2025",
        kind: "Internship",
        color: "#8B5CF6",
        current: false,
        summary: "Redesigned app flows and landing pages for an investing app, and turned market insights into clear stories.",
        metrics: "−22%|drop-off;+35%|₹300 offer uptake;+40%|engagement",
        points:
            "Redesigned app user flows and landing pages through design reviews with the product team\nDesigned 60+ carousels, reels and educational visuals for investors",
    },
    {
        company: "Kshitij, IIT Kharagpur",
        role: "Design and Media Head",
        place: "Kharagpur",
        dates: "Aug 2024 – Feb 2025",
        kind: "Leadership",
        color: "#FF4F8B",
        current: false,
        summary: "Led branding, media and the website for Asia's largest tech fest.",
        metrics: "45+|designers led;50K+|website users;200+|posters, videos and assets",
        points:
            "Set creative direction across 50+ events for 40K+ participants\nDirected UI and UX for the fest's 3D website: flows, wireframes and a visual system, lifting retention by 35%",
    },
    {
        company: "Technology Students' Gymkhana, IIT Kharagpur",
        role: "Secretary, Design",
        place: "Kharagpur",
        dates: "Aug 2023 – Apr 2024",
        kind: "Leadership",
        color: "#2F9BFF",
        current: false,
        summary: "Ran digital media for the institute's biggest student events.",
        metrics: "150+|events;2,000+|magazine copies;50K|social reach",
        points: "Managed media for Inter IIT, General Championship and Open IIT\nLed six designers on Illumination Magazine for freshmen",
    },
]

const DEFAULT_PROJECTS: Project[] = [
    {
        title: "AI Chatbot",
        sector: "Product",
        color: "#8B5CF6",
        icon: "chat",
        text: "Designed and shipped the website's first AI chatbot end to end, evolving a keyword prototype into a retrieval-augmented (RAG) assistant for company, career and product questions. Live in pilot.",
        image: "",
        link: "",
    },
    {
        title: "Admin Dashboard",
        sector: "Product",
        color: "#8B5CF6",
        icon: "dash",
        text: "Information architecture for the chatbot's admin side: role-based login, analytics, leads, FAQs and live chat.",
        image: "",
        link: "",
    },
    {
        title: "HR Hiring Portal",
        sector: "Product",
        color: "#8B5CF6",
        icon: "form",
        text: "A login-gated portal that digitises the Personal Observation Form for about 500 candidates a year, with a 3-round interview workflow, scheduling, shortlisting, emails and printable reports.",
        image: "",
        link: "",
    },
    {
        title: "Sparky the Mascot",
        sector: "Brand",
        color: "#FF8A2A",
        icon: "mascot",
        text: "Redesigned the dated corporate mascot as Sparky, approved by management as an official brand element.",
        image: "https://framerusercontent.com/images/M1jzH6SoYpgOnN3D60t88vJ3w0.png",
        link: "/case-study/sparky-mascot-redesign",
    },
    {
        title: "Events and Brand Films",
        sector: "Visual",
        color: "#2F9BFF",
        icon: "film",
        text: "70+ visuals and 6 brand films on one visual system, scaled across 6+ national B2B industry events.",
        image: "",
        link: "",
    },
]

const DEFAULT_AWARDS: Award[] = [
    { title: "2nd Runner-Up", detail: "Hero MotoCorp Design Challenge, out of 5,000+ teams (2024)" },
    { title: "Silver ×2", detail: "GC Ad Design, IIT Kharagpur (2023–24, 2024–25)" },
    { title: "Bronze ×2", detail: "GC Thermocol and Clay Modelling (2023–24, 2024–25)" },
]

const ICONS: Record<string, JSX.Element> = {
    chat: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5h16v10H9l-5 4V5z" />
            <path d="M8 9h8M8 12h5" />
        </svg>
    ),
    dash: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 9h18M9 9v11" />
            <path d="M12 17l2-3 2 2 3-4" />
        </svg>
    ),
    form: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path d="M9 3v3h6V3" />
            <path d="M8.5 11l1.5 1.5 3-3M14.5 11h1.5M8.5 16h7" />
        </svg>
    ),
    mascot: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L5 13h6l-1 9 8-11h-6l1-9z" />
        </svg>
    ),
    film: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="14" height="14" rx="2" />
            <path d="M17 10l4-2v8l-4-2" />
            <path d="M9 9.5v5l4-2.5-4-2.5z" />
        </svg>
    ),
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

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
const pairs = (s: string) =>
    (s || "")
        .split(";")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
            const [a, ...b] = p.split("|")
            return { value: a.trim(), label: b.join("|").trim() }
        })
const lines = (s: string) =>
    (s || "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)

/**
 * Experience Timeline: a neon tube runs down the page and lights up role by role as you scroll, like
 * current flowing through it. The current role (Sonepar) opens out into project tiles.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 3200
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function ExperienceTimeline(props: Props) {
    const {
        sign = "Experience",
        eyebrow = "Where I've worked",
        intro = "Three internships across B2B, fintech and agency work, and two years leading design at IIT Kharagpur.",
        stats = "3|internships;45+|person team led;50K+|website users;Top 3|of 5,000+ teams",
        roles: rolesProp = DEFAULT_ROLES,
        projects = DEFAULT_PROJECTS,
        projectsHeading = "What I built at Sonepar",
        awards = DEFAULT_AWARDS,
        ctaHeading = "Like what you see? Let's build something together.",
        contactLabel = "Let's work together",
        contactLink = "/contact-us",
        cvLabel = "Download CV",
        cvLink = "",
        linkedinLink = "https://www.linkedin.com/in/mragankbhikshu/",
        neonColor = "#FF8A2A",
        blueColor = "#2F9BFF",
        background = "#05080F",
        style,
    } = props

    // the Sonepar internship ended on 17 August 2026; a saved copy that still says "Present" shows the real dates
    const roles = rolesProp.map((r) => (/sonepar/i.test(r.company || "") && /present/i.test(r.dates || "") ? { ...r, dates: DEFAULT_ROLES[0].dates } : r))
    const isStatic = useIsStaticRenderer()
    const go = useGo()
    const root = useRef<HTMLDivElement>(null)
    const track = useRef<HTMLDivElement>(null)
    const fill = useRef<HTMLDivElement>(null)
    const nodes = useRef<(HTMLDivElement | null)[]>([])
    const [lit, setLit] = useState<boolean[]>(() => roles.map(() => isStatic))
    const [signOn, setSignOn] = useState(isStatic)
    const [narrow, setNarrow] = useState(false)
    const [open, setOpen] = useState<number | null>(null)

    // narrow layout follows the component's own width, so it works in any breakpoint
    useEffect(() => {
        const el = root.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 760))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // sign flickers on when the section comes into view
    useEffect(() => {
        if (isStatic) return
        const el = root.current
        if (!el || typeof IntersectionObserver === "undefined") return setSignOn(true)
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setSignOn(true)
                    io.disconnect()
                }
            },
            { rootMargin: "0px 0px -25% 0px" }
        )
        io.observe(el)
        return () => io.disconnect()
    }, [isStatic])

    // the tube fills with the scroll; each role lights when the current reaches its node
    useEffect(() => {
        if (isStatic) return
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        let raf = 0
        let shown = 0
        let last = ""
        const tick = () => {
            const t = track.current
            if (t) {
                const r = t.getBoundingClientRect()
                const vh = window.innerHeight
                const target = clamp01((vh * 0.62 - r.top) / Math.max(1, r.height))
                shown = reduce ? target : shown + (target - shown) * 0.12
                if (fill.current) fill.current.style.transform = `scaleY(${shown})`
                const reach = r.top + shown * r.height
                const next = nodes.current.map((n) => (n ? n.getBoundingClientRect().top + 10 <= reach + 1 : false))
                const key = next.map((b) => (b ? 1 : 0)).join("")
                if (key !== last) {
                    last = key
                    setLit((prev) => next.map((b, i) => b || prev[i] || false))
                }
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [isStatic, roles.length])

    const css = `
.et{--neon:${neonColor};--blue:${blueColor};box-sizing:border-box;position:relative;width:100%;background:${background};color:#E8EEF8;font-family:Inter,"Inter Display",system-ui,sans-serif;overflow:hidden;padding:120px 72px 120px}
.et *{box-sizing:border-box}
.et::before{content:"";position:absolute;inset:0;pointer-events:none;background:
 radial-gradient(900px 500px at 15% 0%,rgba(0,110,206,.16),transparent 60%),
 radial-gradient(700px 600px at 100% 40%,color-mix(in srgb,var(--neon) 9%,transparent),transparent 65%),
 repeating-linear-gradient(90deg,rgba(255,255,255,.012) 0 1px,transparent 1px 120px)}
.et-in{position:relative;max-width:1060px;margin:0 auto}
.et-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:var(--blue);font-weight:600}
.et-eyebrow::before{content:"";width:28px;height:1px;background:var(--blue)}
.et-sign{margin:22px 0 0;font-weight:800;font-size:clamp(56px,9vw,124px);line-height:1;letter-spacing:-.03em;color:#2a1c12;-webkit-text-stroke:1.5px color-mix(in srgb,var(--neon) 35%,#3a2a1e);transition:color .2s}
.et-sign.on{color:#FFF3E8;-webkit-text-stroke:1.5px var(--neon);text-shadow:0 0 6px var(--neon),0 0 18px var(--neon),0 0 42px color-mix(in srgb,var(--neon) 70%,transparent),0 0 90px color-mix(in srgb,var(--neon) 45%,transparent);animation:et-flick 1.4s steps(1,end) both}
@keyframes et-flick{0%{opacity:.15}8%{opacity:1}12%{opacity:.2}20%{opacity:1}26%{opacity:.35}30%,100%{opacity:1}}
.et-intro{margin:26px 0 0;max-width:620px;font-size:19px;line-height:1.6;color:#A9B6CB}
.et-stats{margin:56px 0 0;display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.et-stat{padding:22px 22px 20px;border-radius:18px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);backdrop-filter:blur(8px)}
.et-stat b{display:block;font-size:38px;font-weight:800;letter-spacing:-.03em;color:#fff}
.et-stat span{display:block;margin-top:4px;font-size:14px;color:#8E9BB1}
.et-tl{position:relative;margin-top:110px;padding-left:84px}
.et-tube{position:absolute;left:26px;top:8px;bottom:0;width:4px;border-radius:4px;background:rgba(255,255,255,.06);box-shadow:inset 0 0 0 1px rgba(255,255,255,.04)}
.et-fill{position:absolute;inset:0;border-radius:4px;transform-origin:50% 0;transform:scaleY(0);background:linear-gradient(#FFD9B8,var(--neon) 30%,var(--neon));box-shadow:0 0 8px var(--neon),0 0 22px var(--neon),0 0 48px color-mix(in srgb,var(--neon) 60%,transparent)}
.et-role{position:relative;padding-bottom:72px}
.et-role:last-child{padding-bottom:0}
.et-node{position:absolute;left:-70px;top:6px;width:24px;height:24px;border-radius:50%;background:${background};border:2px solid rgba(255,255,255,.14);transition:border-color .4s,box-shadow .4s}
.et-node::after{content:"";position:absolute;inset:5px;border-radius:50%;background:rgba(255,255,255,.12);transition:background .4s}
.et-role.on .et-node{border-color:var(--c);box-shadow:0 0 10px var(--c),0 0 26px color-mix(in srgb,var(--c) 60%,transparent)}
.et-role.on .et-node::after{background:var(--c)}
.et-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 16px;opacity:.28;transition:opacity .6s}
.et-role.on .et-head{opacity:1}
.et-company{margin:0;font-size:34px;font-weight:800;letter-spacing:-.025em;color:#55606f;transition:color .5s,text-shadow .5s}
.et-role.on .et-company{color:#fff;text-shadow:0 0 22px color-mix(in srgb,var(--c) 45%,transparent)}
.et-now{display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:99px;font-size:12px;font-weight:700;letter-spacing:.12em;color:var(--neon);border:1px solid color-mix(in srgb,var(--neon) 50%,transparent);background:color-mix(in srgb,var(--neon) 10%,transparent)}
.et-now::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--neon);box-shadow:0 0 8px var(--neon);animation:et-pulse 1.6s ease-in-out infinite}
@keyframes et-pulse{50%{opacity:.3}}
.et-meta{margin-top:8px;display:flex;flex-wrap:wrap;gap:6px 18px;font-size:15px;color:#8E9BB1;opacity:.35;transition:opacity .6s}
.et-role.on .et-meta{opacity:1}
.et-meta strong{color:#D7E0EE;font-weight:600}
.et-kind{color:var(--c)}
.et-card{margin-top:22px;padding:28px;border-radius:22px;background:linear-gradient(160deg,rgba(255,255,255,.055),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(10px);opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.7,.2,1),border-color .5s}
.et-role.on .et-card{opacity:1;transform:none;border-color:color-mix(in srgb,var(--c) 28%,rgba(255,255,255,.08))}
.et-sum{margin:0;font-size:17px;line-height:1.6;color:#C3CEDF;max-width:760px}
.et-metrics{margin-top:22px;display:flex;flex-wrap:wrap;gap:12px}
.et-metric{flex:1 1 150px;padding:16px 18px;border-radius:14px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.06)}
.et-metric b{display:block;font-size:30px;font-weight:800;letter-spacing:-.03em;color:var(--c);text-shadow:0 0 18px color-mix(in srgb,var(--c) 40%,transparent)}
.et-metric span{display:block;margin-top:2px;font-size:13.5px;line-height:1.4;color:#9AA7BC}
.et-points{margin:20px 0 0;padding:0;list-style:none;display:grid;gap:10px}
.et-points li{position:relative;padding-left:22px;font-size:15.5px;line-height:1.55;color:#AEBACD}
.et-points li::before{content:"";position:absolute;left:2px;top:.62em;width:8px;height:2px;border-radius:2px;background:var(--c);box-shadow:0 0 6px var(--c)}
.et-ph{margin:30px 0 14px;font-size:13px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:#8E9BB1}
.et-tiles{display:grid;grid-template-columns:repeat(6,1fr);gap:14px}
.et-tile{grid-column:span 2;position:relative;display:flex;flex-direction:column;border-radius:18px;overflow:hidden;background:rgba(5,8,15,.6);border:1px solid rgba(255,255,255,.07);cursor:pointer;text-align:left;color:inherit;font:inherit;padding:0;transition:transform .35s cubic-bezier(.2,.7,.2,1),border-color .35s,box-shadow .35s}
.et-tile:nth-child(4),.et-tile:nth-child(5){grid-column:span 3}
.et-tile:hover,.et-tile:focus-visible,.et-tile.open{transform:translateY(-4px);border-color:color-mix(in srgb,var(--t) 55%,transparent);box-shadow:0 18px 50px -20px color-mix(in srgb,var(--t) 70%,transparent);outline:none}
.et-art{position:relative;height:150px;display:grid;place-items:center;background:radial-gradient(120% 90% at 50% 110%,color-mix(in srgb,var(--t) 26%,transparent),transparent 70%),#0A0F1A;border-bottom:1px solid rgba(255,255,255,.06)}
.et-art img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.et-art img.fit{inset:10px 0 0;height:calc(100% - 10px);object-fit:contain;object-position:50% 100%;filter:drop-shadow(0 8px 20px color-mix(in srgb,var(--t) 50%,transparent));transition:transform .4s}
.et-tile:hover .et-art img.fit{transform:scale(1.06) translateY(-3px)}
.et-art svg{width:58px;height:58px;color:var(--t);filter:drop-shadow(0 0 6px var(--t)) drop-shadow(0 0 16px var(--t))}
.et-tag{position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:99px;font-size:11.5px;font-weight:700;letter-spacing:.06em;color:var(--t);background:rgba(5,8,15,.75);border:1px solid color-mix(in srgb,var(--t) 45%,transparent)}
.et-tb{padding:16px 18px 18px;display:flex;flex-direction:column;gap:8px;flex:1}
.et-tt{font-size:18px;font-weight:700;color:#fff;letter-spacing:-.01em}
.et-tx{font-size:14px;line-height:1.55;color:#9AA7BC;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.et-tile.open .et-tx{-webkit-line-clamp:unset}
.et-more{margin-top:auto;padding-top:6px;font-size:13.5px;font-weight:600;color:var(--t)}
.et-more a{color:inherit;text-decoration:none}
.et-soon{color:#6F7B90;font-weight:500}
.et-awards{margin-top:110px}
.et-h3{margin:0 0 20px;font-size:13px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;color:var(--blue)}
.et-plaques{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.et-plaque{padding:22px;border-radius:18px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03)}
.et-plaque b{display:block;font-size:24px;font-weight:800;color:#fff;letter-spacing:-.02em}
.et-plaque span{display:block;margin-top:6px;font-size:14.5px;line-height:1.5;color:#9AA7BC}
.et-cta{margin-top:110px;padding:48px;border-radius:28px;text-align:center;background:radial-gradient(80% 140% at 50% 120%,color-mix(in srgb,var(--neon) 22%,transparent),transparent 70%),rgba(255,255,255,.03);border:1px solid color-mix(in srgb,var(--neon) 28%,rgba(255,255,255,.08))}
.et-cta h3{margin:0 auto;max-width:640px;font-size:34px;line-height:1.25;font-weight:800;letter-spacing:-.025em;color:#fff}
.et-btns{margin-top:28px;display:flex;flex-wrap:wrap;justify-content:center;gap:12px}
.et-btn{display:inline-flex;align-items:center;gap:8px;padding:15px 24px;border-radius:99px;font-size:16px;font-weight:700;text-decoration:none;transition:transform .25s,box-shadow .25s}
.et-btn:hover{transform:translateY(-2px)}
.et-btn.pri{background:var(--neon);color:#1A0E04;box-shadow:0 0 0 1px var(--neon),0 0 24px color-mix(in srgb,var(--neon) 60%,transparent)}
.et-btn.sec{color:#E8EEF8;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.04)}
.et.nr{padding:80px 20px}
.et.nr .et-intro{font-size:17px}
.et.nr .et-stats{grid-template-columns:repeat(2,1fr);margin-top:40px}
.et.nr .et-stat b{font-size:30px}
.et.nr .et-tl{margin-top:72px;padding-left:40px}
.et.nr .et-tube{left:8px}
.et.nr .et-node{left:-41px;width:20px;height:20px}
.et.nr .et-company{font-size:26px}
.et.nr .et-card{padding:20px}
.et.nr .et-tiles,.et.nr .et-plaques{grid-template-columns:1fr}
.et.nr .et-tile,.et.nr .et-tile:nth-child(4),.et.nr .et-tile:nth-child(5){grid-column:auto}
.et.nr .et-awards,.et.nr .et-cta{margin-top:72px}
.et.nr .et-cta{padding:32px 20px}
.et.nr .et-cta h3{font-size:26px}
@media (prefers-reduced-motion:reduce){.et-sign.on{animation:none}.et-card{transition:none}}
`

    const statList = pairs(stats)

    return (
        <div ref={root} className={"et" + (narrow ? " nr" : "")} style={style}>
            <style>{css}</style>
            <div className="et-in">
                <div className="et-eyebrow">{eyebrow}</div>
                <h2 className={"et-sign" + (signOn ? " on" : "")}>{sign}</h2>
                {intro && <p className="et-intro">{intro}</p>}
                {statList.length > 0 && (
                    <div className="et-stats">
                        {statList.map((s, i) => (
                            <div className="et-stat" key={i}>
                                <b>{s.value}</b>
                                <span>{s.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="et-tl" ref={track}>
                    <div className="et-tube" aria-hidden="true">
                        <div className="et-fill" ref={fill} style={isStatic ? { transform: "none" } : undefined} />
                    </div>
                    {roles.map((r, i) => {
                        const m = pairs(r.metrics)
                        const pts = lines(r.points)
                        const on = isStatic || lit[i]
                        return (
                            <div
                                key={i}
                                className={"et-role" + (on ? " on" : "")}
                                style={{ ["--c" as any]: r.color || neonColor }}
                            >
                                <div className="et-node" ref={(el) => { nodes.current[i] = el }} aria-hidden="true" />
                                <div className="et-head">
                                    <h3 className="et-company">{r.company}</h3>
                                    {r.current && <span className="et-now">{/present|now/i.test(r.dates) ? "NOW" : "LATEST"}</span>}
                                </div>
                                <div className="et-meta">
                                    <strong>{r.role}</strong>
                                    <span>{r.dates}</span>
                                    <span>{r.place}</span>
                                    <span className="et-kind">{r.kind}</span>
                                </div>
                                <div className="et-card">
                                    {r.summary && <p className="et-sum">{r.summary}</p>}
                                    {m.length > 0 && (
                                        <div className="et-metrics">
                                            {m.map((x, j) => (
                                                <div className="et-metric" key={j}>
                                                    <b>{x.value}</b>
                                                    <span>{x.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {pts.length > 0 && (
                                        <ul className="et-points">
                                            {pts.map((p, j) => (
                                                <li key={j}>{p}</li>
                                            ))}
                                        </ul>
                                    )}
                                    {r.current && projects.length > 0 && (
                                        <>
                                            <div className="et-ph">{projectsHeading}</div>
                                            <div className="et-tiles">
                                                {projects.map((p0, j) => {
                                                    // saved instances may hold blank links or images; fall back to the built-in ones by title
                                                    const d = DEFAULT_PROJECTS.find((x) => x.title === p0.title)
                                                    const p = { ...p0, link: p0.link || d?.link || "", image: p0.image || d?.image || "" }
                                                    return (
                                                    <div
                                                        key={j}
                                                        role="button"
                                                        tabIndex={0}
                                                        aria-expanded={open === j}
                                                        className={"et-tile" + (open === j ? " open" : "")}
                                                        style={{ ["--t" as any]: p.color || neonColor }}
                                                        onClick={() => (p.link ? go(p.link) : setOpen(open === j ? null : j))}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" || e.key === " ") {
                                                                e.preventDefault()
                                                                if (p.link) go(p.link)
                                                                else setOpen(open === j ? null : j)
                                                            }
                                                        }}
                                                    >
                                                        <div className="et-art">
                                                            {p.image ? (
                                                                <img src={p.image} alt={p.title} loading="lazy" className={/\.png($|\?)/i.test(p.image) ? "fit" : ""} />
                                                            ) : (
                                                                ICONS[p.icon] || ICONS.chat
                                                            )}
                                                            <span className="et-tag">{p.sector}</span>
                                                        </div>
                                                        <div className="et-tb">
                                                            <div className="et-tt">{p.title}</div>
                                                            <div className="et-tx">{p.text}</div>
                                                            <div className="et-more">
                                                                {p.link ? (
                                                                    <a
                                                                            href={p.link}
                                                                            onClick={(e) => {
                                                                                e.preventDefault()
                                                                                e.stopPropagation()
                                                                                go(p.link)
                                                                            }}
                                                                        >
                                                                        Read case study →
                                                                    </a>
                                                                ) : open === j ? (
                                                                    <span className="et-soon">Case study coming soon</span>
                                                                ) : (
                                                                    "Read more +"
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    )
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {awards.length > 0 && (
                    <div className="et-awards">
                        <h3 className="et-h3">Awards and recognition</h3>
                        <div className="et-plaques">
                            {awards.map((a, i) => (
                                <div className="et-plaque" key={i}>
                                    <b>{a.title}</b>
                                    <span>{a.detail}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="et-cta">
                    <h3>{ctaHeading}</h3>
                    <div className="et-btns">
                        {contactLink && (
                            <a
                                className="et-btn pri"
                                href={contactLink}
                                onClick={(e) => {
                                    if (!contactLink.startsWith("/")) return
                                    e.preventDefault()
                                    go(contactLink)
                                }}
                            >
                                {contactLabel} →
                            </a>
                        )}
                        {cvLink && (
                            <a className="et-btn sec" href={cvLink} target="_blank" rel="noopener">
                                {cvLabel}
                            </a>
                        )}
                        {linkedinLink && (
                            <a className="et-btn sec" href={linkedinLink} target="_blank" rel="noopener">
                                LinkedIn
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

addPropertyControls(ExperienceTimeline, {
    sign: { type: ControlType.String, title: "Neon sign", defaultValue: "Experience" },
    eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "Where I've worked" },
    intro: {
        type: ControlType.String,
        title: "Intro",
        displayTextArea: true,
        defaultValue: "Three internships across B2B, fintech and agency work, and two years leading design at IIT Kharagpur.",
    },
    stats: {
        type: ControlType.String,
        title: "Stats",
        description: "value|label; value|label",
        displayTextArea: true,
        defaultValue: "3|internships;45+|person team led;50K+|website users;Top 3|of 5,000+ teams",
    },
    roles: {
        type: ControlType.Array,
        title: "Roles",
        defaultValue: DEFAULT_ROLES,
        control: {
            type: ControlType.Object,
            controls: {
                company: { type: ControlType.String, title: "Company" },
                role: { type: ControlType.String, title: "Role" },
                place: { type: ControlType.String, title: "Place" },
                dates: { type: ControlType.String, title: "Dates" },
                kind: { type: ControlType.String, title: "Kind" },
                color: { type: ControlType.Color, title: "Color" },
                current: { type: ControlType.Boolean, title: "Current" },
                summary: { type: ControlType.String, title: "Summary", displayTextArea: true },
                metrics: { type: ControlType.String, title: "Metrics", description: "value|label; value|label", displayTextArea: true },
                points: { type: ControlType.String, title: "Points", description: "One per line", displayTextArea: true },
            },
        },
    },
    projectsHeading: { type: ControlType.String, title: "Projects title", defaultValue: "What I built at Sonepar" },
    projects: {
        type: ControlType.Array,
        title: "Projects",
        defaultValue: DEFAULT_PROJECTS,
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title" },
                sector: { type: ControlType.String, title: "Sector" },
                color: { type: ControlType.Color, title: "Color" },
                icon: {
                    type: ControlType.Enum,
                    title: "Icon",
                    options: ["chat", "dash", "form", "mascot", "film"],
                    optionTitles: ["Chat", "Dashboard", "Form", "Mascot", "Film"],
                },
                text: { type: ControlType.String, title: "Text", displayTextArea: true },
                image: { type: ControlType.String, title: "Image URL" },
                link: { type: ControlType.String, title: "Case study link" },
            },
        },
    },
    awards: {
        type: ControlType.Array,
        title: "Awards",
        defaultValue: DEFAULT_AWARDS,
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title" },
                detail: { type: ControlType.String, title: "Detail" },
            },
        },
    },
    ctaHeading: { type: ControlType.String, title: "CTA heading", defaultValue: "Like what you see? Let's build something together." },
    contactLabel: { type: ControlType.String, title: "Contact label", defaultValue: "Let's work together" },
    contactLink: { type: ControlType.String, title: "Contact link", defaultValue: "/contact-us" },
    cvLabel: { type: ControlType.String, title: "CV label", defaultValue: "Download CV" },
    cvLink: { type: ControlType.String, title: "CV link", defaultValue: "" },
    linkedinLink: { type: ControlType.String, title: "LinkedIn", defaultValue: "https://www.linkedin.com/in/mragankbhikshu/" },
    neonColor: { type: ControlType.Color, title: "Neon", defaultValue: "#FF8A2A" },
    blueColor: { type: ControlType.Color, title: "Blue", defaultValue: "#2F9BFF" },
    background: { type: ControlType.Color, title: "Background", defaultValue: "#05080F" },
})
