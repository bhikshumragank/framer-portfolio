import { addPropertyControls, ControlType } from "framer"
import * as FramerLib from "framer"
import { useState, type CSSProperties } from "react"

type Props = {
    heading: string
    intro: string
    compact: boolean
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

const FU = "https://framerusercontent.com/images/"
const svgUri = (svg: string) => "data:image/svg+xml;utf8," + encodeURIComponent(svg)

// drawn covers for the two case studies whose real screens are interactive on their own pages
const CONDUCTOR = svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 520' font-family='Arial,Helvetica,sans-serif'><rect width='360' height='520' rx='26' fill='#202022'/><rect x='14' y='30' width='332' height='476' rx='12' fill='#fff'/><text x='30' y='60' font-size='11' font-weight='700' letter-spacing='1'>FROM · AUTO</text><text x='30' y='92' font-size='26' font-weight='700'>Prembazar</text><line x1='14' y1='112' x2='346' y2='112' stroke='#0A0A0A' stroke-width='2'/><rect x='14' y='114' width='332' height='30' fill='#EFEFEF'/><text x='30' y='134' font-size='11' font-weight='700' letter-spacing='1'>TO · TAP DESTINATION</text>${[["Hijli More", "₹10", 0], ["Salua", "₹15", 1], ["Kalaikunda", "₹15", 0], ["Chowrangi", "₹20", 0], ["Keranitola", "₹25", 0]].map(([n, f, on], i) => `<g transform='translate(14 ${144 + i * 72})'><rect width='332' height='72' fill='${on ? "#FFD400" : "#fff"}'/><line x1='0' y1='0' x2='332' y2='0' stroke='#0A0A0A' stroke-width='2'/><text x='16' y='44' font-size='22' font-weight='700'>${n}</text><text x='316' y='46' font-size='26' font-weight='700' text-anchor='end'>${f}</text></g>`).join("")}</svg>`
)
const HR = svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 420' font-family='Arial,Helvetica,sans-serif'><rect width='640' height='420' rx='14' fill='#F4F6FA'/><rect width='120' height='420' rx='14' fill='#14213D'/><text x='18' y='36' font-size='13' font-weight='700' fill='#fff'>Hiring Portal</text>${["Pipeline", "Schedule", "Emails", "Reports"].map((t, i) => `<rect x='10' y='${58 + i * 34}' width='100' height='26' rx='6' fill='${i ? "transparent" : "#2D4A8A"}'/><text x='20' y='${76 + i * 34}' font-size='11' fill='#fff' opacity='${i ? 0.7 : 1}'>${t}</text>`).join("")}${[["Applied", "#64748B"], ["Round 1", "#2563EB"], ["Round 2", "#7C3AED"], ["Round 3", "#B45309"]].map(([t, c], i) => `<g transform='translate(${136 + i * 124} 30)'><rect width='112' height='370' rx='10' fill='#fff'/><circle cx='16' cy='18' r='5' fill='${c}'/><text x='26' y='22' font-size='11' font-weight='700' fill='#14213D'>${t}</text>${Array.from({ length: 4 - i }, (_, k) => `<rect x='10' y='${36 + k * 70}' width='92' height='60' rx='8' fill='#F8FAFC' stroke='#E2E8F0'/><rect x='20' y='${48 + k * 70}' width='56' height='8' rx='4' fill='#CBD5E1'/><rect x='20' y='${64 + k * 70}' width='36' height='12' rx='6' fill='${c}' opacity='.3'/>`).join("")}</g>`).join("")}</svg>`
)

type Study = { title: string; line: string; kind: "Product" | "Brand"; client: string; year: string; href: string; cover: string; bg: string; ink: string; fit?: "cover" | "contain"; tags: string[] }

const STUDIES: Study[] = [
    { title: "Kshitij 2025 Website", line: "A fest homepage you board like a spaceship, with the real 3D site playable inside the case study.", kind: "Product", client: "Kshitij, IIT Kharagpur", year: "2025", href: "/case-study/kshitij-2025-website", cover: FU + "yOpm7KtRMpUn9pxZutaEMyLgSeQ.png?scale-down-to=1024", bg: "#05070b", ink: "#4FE3D0", fit: "cover", tags: ["3D website", "Website tour", "50K+ visitors"] },
    { title: "Sparky AI Assistant", line: "A website assistant that answers from the catalogue, refuses to guess, and turns visitors into leads in two taps.", kind: "Product", client: "Sonepar India", year: "2026", href: "/case-study/sparky-ai-assistant", cover: FU + "M1jzH6SoYpgOnN3D60t88vJ3w0.png?scale-down-to=1024", bg: "radial-gradient(90% 90% at 50% 30%,#009EE3 0%,#27348B 75%)", ink: "#fff", fit: "contain", tags: ["AI chatbot", "Admin panel", "Prototype"] },
    { title: "Conductor Ticketing", line: "Two taps to a ticket, for a conductor with one free thumb on a moving bus in direct sun.", kind: "Product", client: "Nielsen design assignment", year: "2026", href: "/case-study/conductor-ticketing", cover: CONDUCTOR, bg: "#FFD400", ink: "#0A0A0A", fit: "contain", tags: ["Mobile", "Accessibility", "7 screens"] },
    { title: "HR Hiring Portal", line: "A paper observation form turned into a login-gated portal for about 500 candidates a year.", kind: "Product", client: "Sonepar India", year: "2026", href: "/case-study/hr-hiring-portal", cover: HR, bg: "#DDE3F0", ink: "#14213D", fit: "contain", tags: ["Enterprise", "State model", "Roles"] },
    { title: "Sparky Mascot Redesign", line: "Sonepar India's mascot rebuilt into an approved brand element, with films, events and campaigns.", kind: "Brand", client: "Sonepar India", year: "2026", href: "/case-study/sparky-mascot-redesign", cover: FU + "t7q3mSPCeYCeYPrX8sd8TuoEuwc.png?scale-down-to=1024", bg: "linear-gradient(160deg,#0B1A3A,#05080F)", ink: "#fff", fit: "contain", tags: ["Mascot", "Brand films", "Events"] },
    { title: "Vaarahi", line: "A peacock and the letter V in one gold line, with deep green packaging for a jewellery house.", kind: "Brand", client: "Vaarahi, via PixyGrid", year: "2026", href: "/case-study/vaarahi-brand-identity", cover: FU + "VqZd6AFrYVbZ3geDOKGgKQ4E.png?scale-down-to=1024", bg: "#0F3B2A", ink: "#F3E3B5", fit: "contain", tags: ["Logo", "Packaging", "Gift card"] },
    { title: "Altura Honey", line: "Name, logo and hexagonal packaging for a wild Himalayan honey sold in Paris and New York.", kind: "Brand", client: "GC 2026 · 3rd place", year: "2026", href: "/case-study/altura-honey", cover: FU + "nRZcSGns67ABwx09ZqS38w23Bc.png?scale-down-to=1024", bg: "#F5EADB", ink: "#3A2410", fit: "contain", tags: ["Naming", "Logo", "Packaging"] },
    { title: "Merch Design Collection", line: "T-shirts, hoodies, fest gates and logos for Kshitij, IIT Kharagpur and others.", kind: "Brand", client: "Kshitij, IIT Kharagpur", year: "2024–2025", href: "/branding-1", cover: FU + "FGoxUDjCy3edKDrvO1uRWO9Vo.png?scale-down-to=1024", bg: "#1A1A1F", ink: "#fff", fit: "contain", tags: ["Apparel", "Gates", "Logos"] },
]

/**
 * Case Study Shelf: every case study in one place, filterable by product or brand. Used on Home and on
 * the /case-studies page.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 1400
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function CaseStudyShelf(props: Props) {
    const { heading = "Case studies", intro = "Three product case studies and four brand projects, each told from the problem to the decisions that shaped it.", compact = false, style } = props
    const go = useGo()
    const [kind, setKind] = useState<"All" | "Product" | "Brand">("All")
    const list = STUDIES.filter((s) => kind === "All" || s.kind === kind)
    const count = (k: "Product" | "Brand") => STUDIES.filter((s) => s.kind === k).length

    return (
        <section className={"cs" + (compact ? " compact" : "")} style={style} aria-labelledby="cs-h">
            <style>{CSS}</style>
            <header className="cs-head">
                <div>
                    <h2 id="cs-h">{heading}</h2>
                    {intro && <p>{intro}</p>}
                </div>
                <div className="cs-filter" role="group" aria-label="Show">
                    {(["All", "Product", "Brand"] as const).map((k) => (
                        <button key={k} className={kind === k ? "on" : ""} aria-pressed={kind === k} onClick={() => setKind(k)}>
                            {k === "All" ? `All ${STUDIES.length}` : `${k} ${count(k)}`}
                        </button>
                    ))}
                </div>
            </header>
            <div className="cs-grid">
                {list.map((s, i) => (
                    <a
                        key={s.href}
                        href={s.href}
                        className={"cs-card" + (list.length > 3 && (i === 0 || i === list.length - 1) ? " lead" : "")}
                        onClick={(e) => {
                            e.preventDefault()
                            go(s.href)
                        }}
                    >
                        <span className="cs-cover" style={{ background: s.bg }}>
                            <img src={s.cover} alt="" loading="lazy" draggable={false} className={s.fit === "contain" ? "contain" : ""} />
                            <span className="cs-kind" style={{ color: s.ink, borderColor: s.ink }}>
                                {s.kind}
                            </span>
                        </span>
                        <span className="cs-text">
                            <span className="cs-meta">
                                {s.client} · {s.year}
                            </span>
                            <b>{s.title}</b>
                            <span className="cs-line">{s.line}</span>
                            <span className="cs-tags">
                                {s.tags.map((t) => (
                                    <i key={t}>{t}</i>
                                ))}
                            </span>
                            <span className="cs-go">
                                Read the case study <em aria-hidden="true">→</em>
                            </span>
                        </span>
                    </a>
                ))}
            </div>
        </section>
    )
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
.cs{box-sizing:border-box;position:relative;width:100%;max-width:1200px;margin-inline:auto;padding:140px clamp(20px,5vw,64px) 110px;background:#05080F;color:#E8EEF8;font-family:Inter,system-ui,sans-serif}
.cs.compact{padding:90px clamp(20px,5vw,64px) 90px;background:#000}
.cs *{box-sizing:border-box}
:where(.cs) button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
.cs-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:20px 40px;margin-bottom:34px}
.cs-head h2{margin:0 0 10px;font-size:clamp(34px,4.6vw,60px);line-height:1;font-weight:800;letter-spacing:-.035em;color:#fff}
.cs-head p{margin:0;max-width:560px;font-size:17px;line-height:1.6;color:#93A1B8}
.cs-filter{display:flex;gap:4px;padding:4px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}
.cs-filter button{padding:9px 16px;border-radius:10px;font-size:14px;font-weight:600;color:#93A1B8;transition:color .2s,background .2s}
.cs-filter button:hover{color:#fff}
.cs-filter button.on{background:#2F9BFF;color:#fff}
.cs-filter button:focus-visible,.cs-card:focus-visible{outline:2px solid #fff;outline-offset:3px}
.cs-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.cs-card{display:flex;flex-direction:column;border-radius:20px;overflow:hidden;background:#0B1120;border:1px solid rgba(255,255,255,.08);color:inherit;text-decoration:none;transition:transform .3s cubic-bezier(.2,.7,.2,1),border-color .3s}
.cs-card:hover{transform:translateY(-4px);border-color:rgba(47,155,255,.45)}
.cs-cover{position:relative;display:block;aspect-ratio:4/3;overflow:hidden}
.cs-cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .5s cubic-bezier(.2,.7,.2,1)}
.cs-cover img.contain{object-fit:contain;padding:8% 10%}
.cs-card:hover .cs-cover img{transform:scale(1.03)}
.cs-kind{position:absolute;left:14px;top:14px;padding:4px 10px;border-radius:99px;border:1.5px solid;font-size:12px;font-weight:700}
.cs-text{display:flex;flex-direction:column;gap:8px;padding:20px 22px 22px;flex:1}
.cs-meta{font-size:13px;color:#7F8CA3}
.cs-text b{font-size:22px;line-height:1.2;font-weight:700;letter-spacing:-.02em;color:#fff}
.cs-line{font-size:15px;line-height:1.55;color:#AEB9CC}
.cs-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.cs-tags i{font-style:normal;font-size:12px;font-weight:600;padding:3px 9px;border-radius:99px;background:rgba(255,255,255,.06);color:#C6D1E3}
.cs-go{margin-top:auto;padding-top:12px;font-size:14px;font-weight:700;color:#2F9BFF}
.cs-go em{font-style:normal;display:inline-block;transition:transform .25s}
.cs-card:hover .cs-go em{transform:translateX(4px)}
/* with more than three cards, the first and last span two columns so every row is full */
.cs-card.lead{grid-column:span 2;flex-direction:row}
.cs-card.lead .cs-cover{flex:1.25;aspect-ratio:auto;min-height:320px}
.cs-card.lead .cs-text{flex:1;justify-content:center;padding:28px}
.cs-card.lead .cs-text b{font-size:30px}
.cs-card.lead .cs-line{font-size:16.5px}
@media (max-width:980px){.cs-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:640px){
  .cs{padding-top:110px}
  .cs.compact{padding-top:70px}
  .cs-grid{grid-template-columns:1fr}
  .cs-card.lead{grid-column:auto;flex-direction:column}
  .cs-card.lead .cs-cover{min-height:0;aspect-ratio:4/3}
  .cs-card.lead .cs-text b{font-size:22px}
}
@media (prefers-reduced-motion:reduce){.cs-card,.cs-cover img,.cs-go em{transition:none}}
`

addPropertyControls(CaseStudyShelf, {
    heading: { type: ControlType.String, title: "Heading", defaultValue: "Case studies" },
    intro: { type: ControlType.String, title: "Intro", displayTextArea: true, defaultValue: "Four product case studies and four brand projects, each told from the problem to the decisions that shaped it." },
    compact: { type: ControlType.Boolean, title: "On Home", defaultValue: false, description: "Less top padding and a black background, to sit inside the Home page" },
})
