import { addPropertyControls, ControlType } from "framer"
import * as FramerLib from "framer"
import { useState, type CSSProperties } from "react"

type Props = {
    logo: string
    labelFront: string
    labelBack: string
    lid: string
    backLink: string
    nextLink: string
    style?: CSSProperties
}

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

// project images uploaded to Framer
const A = {
    logo: "https://framerusercontent.com/images/RQcO4EDf68E8uu6KCqmQbMUdaH0.png",
    labelFront: "https://framerusercontent.com/images/nRZcSGns67ABwx09ZqS38w23Bc.png",
    labelBack: "https://framerusercontent.com/images/Kc7JAUrYyCG3IyzS4bU4N6ymv8.png",
    lid: "https://framerusercontent.com/images/mdjyxs2uwXJTuQzrnzxbq4y2pZ4.png",
}

// the three symbols in the mark, pinned where they sit on the logo (% of the square logo artwork)
const PARTS = [
    {
        id: "mountain",
        name: "The mountain",
        idea: "Raw",
        pin: { x: 28, y: 30 },
        glow: { x: 50, y: 24, r: 30 },
        text: "Three Himalayan peaks crown the mark. They say where the honey comes from, and that it arrives raw: nothing between the mountain and the jar.",
    },
    {
        id: "bee",
        name: "The bee",
        idea: "Wild",
        pin: { x: 50, y: 61 },
        glow: { x: 50, y: 61, r: 10 },
        text: "A finely engraved wild bee sits at the centre. It stands for the wild part of the brief: honey made by free bees at altitude, not on a farm.",
    },
    {
        id: "drop",
        name: "The drop",
        idea: "Pure",
        pin: { x: 63, y: 48 },
        glow: { x: 50, y: 55, r: 21 },
        text: "The drop flows down out of the mountain line and holds the bee inside it. It ties the ecosystem together, mountain, bee and honey, and its clear shape reads as purity.",
    },
]

const STORY =
    "Altura means height. The mark is built from three things every jar carries with it. The mountain is where the honey comes from: untouched peaks, so the honey arrives raw. The bee is the wild: honey made by free bees, not farms. The drop joins them, flowing out of the mountain with the bee held inside, a single clear shape for purity. The label and the wooden lid are hexagons, the shape of every honeycomb cell, so the jar becomes a piece of the hive. Warm paper, earth brown and one line of honey gold keep it quiet, premium and pure."

/**
 * Altura Honey case study: the brand design event at IIT Kharagpur's 2026 General Championship (3rd place), for a premium wild Himalayan honey (name, logo, flat packaging, brand story).
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 4200
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function AlturaCaseStudy(props: Props) {
    const { logo: logoP, labelFront: frontP, labelBack: backP, lid: lidP, backLink = "/portfolio-2", nextLink = "/case-study/vaarahi-brand-identity", style } = props
    const logo = logoP || A.logo
    const labelFront = frontP || A.labelFront
    const labelBack = backP || A.labelBack
    const lid = lidP || A.lid
    const go = useGo()
    const [part, setPart] = useState<string | null>(null)
    const [side, setSide] = useState<"front" | "back">("front")
    const active = PARTS.find((p) => p.id === part) || null

    const nav = (href: string) => (e: React.MouseEvent) => {
        e.preventDefault()
        go(href)
    }

    // plain render helper (called, not mounted) so images keep their DOM when the mark is explored
    const Img = ({ src, alt, className }: { src: string; alt: string; className?: string }) =>
        src ? <img className={className} src={src} alt={alt} loading="lazy" draggable={false} /> : <span className={"ah-missing " + (className || "")}>{alt}</span>

    return (
        <div className="ah" style={style}>
            <style>{CSS}</style>

            <header className="ah-hero">
                <div className="ah-hero-text">
                    <p className="ah-kicker">Brand design event · General Championship 2026, IIT Kharagpur</p>
                    <h1>Altura Honey</h1>
                    <p className="ah-lede">Wild honey from the high Himalayas, made for luxury boutiques in Paris and New York. A mountain, a bee and a drop of honey in one mark.</p>
                    <dl className="ah-meta">
                        <div>
                            <dt>Brief</dt>
                            <dd>“The Himalayan Honey Co.”: name, logo, flat packaging and brand story</dd>
                        </div>
                        <div>
                            <dt>My role</dt>
                            <dd>Brand and packaging designer</dd>
                        </div>
                        <div>
                            <dt>Delivered</dt>
                            <dd>Name, logo, jar label front and back, hexagonal wooden lid</dd>
                        </div>
                        <div>
                            <dt>Result</dt>
                            <dd>3rd place in the brand design event</dd>
                        </div>
                    </dl>
                </div>
                <div className="ah-hero-art">
                    <span className="ah-hex" aria-hidden="true" />
                    {Img({ src: logo, alt: "Altura Honey logo" })}
                </div>
            </header>

            <section className="ah-brief ah-narrow">
                <h2>The brief</h2>
                <p>A group of mountaineers is starting a premium honey brand that sources wild honey from the high altitudes of the Himalayas. It will sell in luxury boutiques in Paris and New York, so it has to feel premium, wild and pure, all at once.</p>
                <ul className="ah-words" aria-label="The three brand words">
                    <li>Premium</li>
                    <li>Wild</li>
                    <li>Pure</li>
                </ul>
            </section>

            <section className="ah-name ah-narrow">
                <h2>A name with altitude</h2>
                <p>The working title was “The Himalayan Honey Co.”, which describes the product but sounds like a co-operative. I named it Altura, from the word for height: short, easy to say in Paris or New York, and it puts the mountain in the name before anyone reads the label.</p>
            </section>

            <section className="ah-mark">
                <div className="ah-narrow">
                    <h2>Three symbols, three words</h2>
                    <p className="ah-hint">Tap a part of the mark to see what it stands for.</p>
                </div>
                <div className="ah-anatomy">
                    <div className={"ah-logo" + (active ? " is-focus" : "")} style={active ? ({ ["--gx" as any]: active.glow.x + "%", ["--gy" as any]: active.glow.y + "%", ["--gr" as any]: active.glow.r + "%" } as CSSProperties) : undefined}>
                        {Img({ src: logo, alt: "Altura Honey logo" })}
                        <span className="ah-spot" aria-hidden="true" />
                        {PARTS.map((p) => (
                            <button key={p.id} className={"ah-pin" + (part === p.id ? " on" : "")} style={{ left: p.pin.x + "%", top: p.pin.y + "%" }} onClick={() => setPart(part === p.id ? null : p.id)} aria-label={p.name} aria-pressed={part === p.id} />
                        ))}
                    </div>
                    <ul className="ah-parts">
                        {PARTS.map((p) => (
                            <li key={p.id}>
                                <button className={part === p.id ? "on" : ""} onClick={() => setPart(part === p.id ? null : p.id)} onMouseEnter={() => setPart(p.id)} aria-pressed={part === p.id}>
                                    <em>{p.idea}</em>
                                    <b>{p.name}</b>
                                    <span>{p.text}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="ah-hexwhy">
                <div className="ah-narrow">
                    <h2>Why a hexagon</h2>
                    <p>Bees build every cell of the honeycomb as a hexagon. So instead of a round label, the jar wears a hexagon on the front and the back, and the wooden lid is cut as a hexagon too. Seen from above, the jar is one cell of the hive.</p>
                </div>
                <div className="ah-comb" aria-hidden="true">
                    {[4, 3, 4].map((n, row) => (
                        <div key={row} className="ah-comb-row">
                            {Array.from({ length: n }).map((_, i) => (
                                <i key={i} className={row === 1 && i === 1 ? "on" : ""} />
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            <section className="ah-pack">
                <div className="ah-narrow">
                    <h2>The flat packaging</h2>
                    <p>The label is laid out flat as two hexagons, front and back, with the lid design beside them. Flip the label to read both sides.</p>
                </div>
                <div className="ah-flat">
                    <div className="ah-label">
                        <div className={"ah-flip" + (side === "back" ? " is-back" : "")}>
                            <div className="ah-face ah-front">{Img({ src: labelFront, alt: "Front label: Wild Himalayan Honey, 250 g" })}</div>
                            <div className="ah-face ah-back">{Img({ src: labelBack, alt: "Back label: story, ingredients and nutrition facts" })}</div>
                        </div>
                        <div className="ah-switch" role="group" aria-label="Label side">
                            <button className={side === "front" ? "on" : ""} onClick={() => setSide("front")} aria-pressed={side === "front"}>
                                Front
                            </button>
                            <button className={side === "back" ? "on" : ""} onClick={() => setSide("back")} aria-pressed={side === "back"}>
                                Back
                            </button>
                        </div>
                    </div>
                    <div className="ah-notes">
                        {side === "front" ? (
                            <>
                                <h3>Front</h3>
                                <p>The mark leads, then one serif line: Wild Himalayan Honey. A single line of honey gold for “Single-Origin Himalayan Harvest”, and the weight. Nothing else competes on a boutique shelf.</p>
                            </>
                        ) : (
                            <>
                                <h3>Back</h3>
                                <p>A short harvest story in gold, then the three promises in capitals: raw, unfiltered, high altitude harvest. Ingredients, maker and nutrition facts sit in two calm columns above the barcode.</p>
                            </>
                        )}
                        <figure className="ah-lid">
                            {Img({ src: lid, alt: "Hexagonal oak lid with the engraved logo" })}
                            <figcaption>The lid: solid oak cut as a hexagon, with the mark laser-engraved. Wood keeps the jar natural and gives it weight in the hand.</figcaption>
                        </figure>
                    </div>
                </div>
            </section>

            <section className="ah-colour">
                <div className="ah-narrow">
                    <h2>Colour</h2>
                    <p>Four colours taken from the product itself: paper and wood for the natural feel, earth brown for the line work, and honey gold used only for the drop and a single line of text.</p>
                </div>
                <ul className="ah-swatches">
                    <li style={{ ["--c" as any]: "#F5EADB" }}>
                        <b>Raw paper</b>
                        <span>#F5EADB</span>
                    </li>
                    <li style={{ ["--c" as any]: "#5A3A1C" }} className="dk">
                        <b>Earth brown</b>
                        <span>#5A3A1C</span>
                    </li>
                    <li style={{ ["--c" as any]: "#E0A106" }}>
                        <b>Honey gold</b>
                        <span>#E0A106</span>
                    </li>
                    <li style={{ ["--c" as any]: "#B8936A" }}>
                        <b>Oak</b>
                        <span>#B8936A</span>
                    </li>
                </ul>
            </section>

            <section className="ah-story">
                <h2>The brand story</h2>
                <blockquote>{STORY}</blockquote>
            </section>

            <section className="ah-close ah-narrow">
                <h2>What this project shows</h2>
                <ul>
                    <li>Turning three brief words into three symbols in one mark</li>
                    <li>Naming a brand for an international luxury audience</li>
                    <li>Letting the product’s own world, the honeycomb, decide the packaging shape</li>
                    <li>Writing the brand story that explains the design</li>
                </ul>
                <div className="ah-actions">
                    <a className="ah-btn" href={backLink} onClick={nav(backLink)}>
                        Back to the gallery
                    </a>
                    {nextLink && (
                        <a className="ah-btn ghost" href={nextLink} onClick={nav(nextLink)}>
                            Read the Vaarahi case study
                        </a>
                    )}
                </div>
            </section>
        </div>
    )
}

const HEX = "polygon(25% 3%,75% 3%,100% 50%,75% 97%,25% 97%,0 50%)"

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Marcellus&family=Lato:ital,wght@0,400;0,700;1,400&display=swap");
.ah{box-sizing:border-box;--paper:#F5EADB;--paper2:#EDE0CC;--bark:#5A3A1C;--ink:#3B2612;--honey:#E0A106;--oak:#B8936A;--sage:#9FAA93;position:relative;width:100%;max-width:1200px;margin-inline:auto;padding:140px clamp(20px,5vw,72px) 120px;color:var(--ink);background:var(--paper);font-family:Lato,system-ui,sans-serif;font-size:17px;line-height:1.65;overflow:hidden}
.ah *{box-sizing:border-box}
.ah h1,.ah h2,.ah h3{font-family:Marcellus,Georgia,serif;font-weight:400;color:var(--bark);letter-spacing:.01em}
.ah h2{margin:0 0 14px;font-size:clamp(30px,3.6vw,44px);line-height:1.12}
.ah h3{margin:0 0 8px;font-size:26px}
.ah p{margin:0 0 14px;color:rgba(59,38,18,.82)}
.ah a{color:inherit}
.ah section{margin-top:clamp(80px,10vw,130px)}
.ah-narrow{max-width:680px}
.ah img{display:block;max-width:100%}
.ah-missing{display:grid;place-items:center;min-height:180px;width:100%;border:1px dashed rgba(90,58,28,.4);border-radius:10px;color:rgba(90,58,28,.6);font-size:14px;text-align:center;padding:12px}
/* hero */
.ah-hero{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:clamp(32px,5vw,72px);align-items:center}
.ah-kicker{margin:0 0 8px;font-size:15px;font-weight:700;color:#B07D05}
.ah-hero h1{margin:0;font-size:clamp(60px,8.4vw,112px);line-height:1}
.ah-lede{margin:44px 0 30px;font-size:20px;line-height:1.55;max-width:470px;color:var(--ink)}
.ah-meta{display:grid;gap:12px;margin:0;padding:20px 0 0;border-top:1px solid rgba(90,58,28,.25)}
.ah-meta div{display:grid;grid-template-columns:100px 1fr;gap:12px}
.ah-meta dt{font-size:14px;font-weight:700;color:#B07D05}
.ah-meta dd{margin:0;font-size:15px}
.ah-hero-art{position:relative;display:grid;place-items:center;aspect-ratio:1/1.0}
.ah-hex{position:absolute;inset:2%;clip-path:${HEX};background:radial-gradient(80% 80% at 50% 35%,#FFF8EC,var(--paper2));box-shadow:none}
.ah-hex::after{content:"";position:absolute;inset:0;clip-path:${HEX};box-shadow:inset 0 0 0 1px rgba(90,58,28,.2)}
.ah-hero-art img,.ah-hero-art .ah-missing{position:relative;width:80%}
/* brief */
.ah-words{list-style:none;margin:26px 0 0;padding:0;display:flex;gap:12px;flex-wrap:wrap}
.ah-words li{display:grid;place-items:center;width:112px;aspect-ratio:1.12;clip-path:${HEX};background:var(--bark);color:var(--paper);font-family:Marcellus,Georgia,serif;font-size:19px}
.ah-words li:nth-child(2){background:var(--honey);color:var(--ink)}
.ah-words li:nth-child(3){background:#fff;color:var(--bark);box-shadow:inset 0 0 0 1px var(--bark)}
/* the mark, taken apart */
.ah-hint{font-size:15px;color:rgba(59,38,18,.6)}
.ah-anatomy{margin-top:28px;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:clamp(24px,4vw,56px);align-items:center}
.ah-logo{position:relative;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 0 0 1px rgba(90,58,28,.15),0 30px 60px rgba(90,58,28,.12)}
.ah-logo img{width:100%;transition:filter .45s ease}
.ah-spot{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .45s ease;background:radial-gradient(circle at var(--gx,50%) var(--gy,50%),transparent 0,transparent var(--gr,15%),rgba(245,234,219,.86) calc(var(--gr,15%) + 6%))}
.ah-logo.is-focus .ah-spot{opacity:1}
.ah-pin{all:unset;position:absolute;width:28px;height:28px;margin:-14px 0 0 -14px;cursor:pointer;clip-path:${HEX};background:var(--honey);transition:transform .25s}
.ah-pin::after{content:"";position:absolute;inset:7px;clip-path:${HEX};background:#fff}
.ah-pin:hover,.ah-pin.on{transform:scale(1.3)}
.ah-pin.on::after{background:var(--bark)}
.ah-pin:focus-visible,.ah-parts button:focus-visible,.ah-btn:focus-visible,.ah-switch button:focus-visible{outline:2px solid var(--bark);outline-offset:3px}
.ah-parts{list-style:none;margin:0;padding:0;display:grid;gap:4px}
.ah-parts button{all:unset;display:block;width:100%;box-sizing:border-box;cursor:pointer;padding:16px 18px;border-radius:12px;border-left:2px solid rgba(90,58,28,.2);transition:background .3s,border-color .3s}
.ah-parts em{font-style:normal;font-size:13px;font-weight:700;color:#B07D05}
.ah-parts b{display:block;font-family:Marcellus,Georgia,serif;font-size:26px;font-weight:400;color:var(--bark);line-height:1.15}
.ah-parts span{display:block;margin-top:6px;font-size:15.5px;line-height:1.6;color:rgba(59,38,18,.75)}
.ah-parts button:hover,.ah-parts button.on{background:rgba(224,161,6,.1);border-left-color:var(--honey)}
/* why a hexagon */
.ah-hexwhy{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.8fr);gap:clamp(24px,4vw,56px);align-items:center}
.ah-comb{justify-self:center;width:min(100%,360px);--cw:clamp(60px,19vw,84px)}
.ah-comb-row{display:flex;justify-content:center;gap:6px}
.ah-comb-row + .ah-comb-row{margin-top:calc(var(--cw) * -0.27)}
.ah-comb i{flex:none;display:block;width:var(--cw);aspect-ratio:1/1.155;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);background:rgba(224,161,6,.2)}
.ah-comb i:nth-child(even){background:rgba(224,161,6,.32)}
.ah-comb i.on{background:var(--honey)}
/* flat packaging */
.ah-flat{margin-top:34px;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:clamp(28px,4vw,56px);align-items:start}
.ah-label{display:flex;flex-direction:column;align-items:center;gap:18px;perspective:1600px}
.ah-flip{position:relative;width:100%;aspect-ratio:1/1;transform-style:preserve-3d;transition:transform .9s cubic-bezier(.6,0,.2,1)}
.ah-flip.is-back{transform:rotateY(180deg)}
.ah-face{position:absolute;inset:0;display:grid;place-items:center;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.ah-face img{width:100%;filter:drop-shadow(0 24px 34px rgba(90,58,28,.22))}
.ah-back{transform:rotateY(180deg)}
.ah-switch{display:inline-flex;padding:4px;border-radius:999px;background:var(--paper2);box-shadow:inset 0 0 0 1px rgba(90,58,28,.15)}
.ah-switch button{all:unset;cursor:pointer;padding:8px 22px;border-radius:999px;font-size:15px;font-weight:700;color:rgba(59,38,18,.65);transition:background .3s,color .3s}
.ah-switch button.on{background:var(--bark);color:var(--paper)}
.ah-notes{padding-top:clamp(0px,4vw,40px)}
.ah-lid{margin:28px 0 0}
.ah-lid img,.ah-lid .ah-missing{width:100%;max-width:360px;aspect-ratio:1/1;object-fit:cover;border-radius:16px}
.ah-lid figcaption{margin-top:12px;font-size:15px;color:rgba(59,38,18,.72);max-width:420px}
/* colour */
.ah-swatches{list-style:none;margin:30px 0 0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,190px));gap:18px}
.ah-swatches li{position:relative;display:flex;flex-direction:column;gap:2px;aspect-ratio:1.12/1;padding:16px;clip-path:${HEX};background:rgba(90,58,28,.3);text-align:center;align-items:center;justify-content:center}
.ah-swatches li::before{content:"";position:absolute;inset:1.5px;clip-path:${HEX};background:var(--c)}
.ah-swatches b,.ah-swatches span{position:relative}
.ah-swatches b{font-family:Marcellus,Georgia,serif;font-weight:400;font-size:19px;color:var(--ink)}
.ah-swatches span{font-size:13.5px;color:rgba(59,38,18,.7)}
.ah-swatches li.dk b,.ah-swatches li.dk span{color:var(--paper)}
/* story */
.ah-story{padding:clamp(36px,5vw,64px);border-radius:22px;background:var(--bark);color:var(--paper)}
.ah-story h2{color:#F3C75A}
.ah-story blockquote{margin:0;max-width:760px;font-family:Marcellus,Georgia,serif;font-size:clamp(20px,2.1vw,25px);line-height:1.6;color:var(--paper)}
/* close */
.ah-close ul{margin:0 0 30px;padding-left:20px;display:grid;gap:8px}
.ah-close li::marker{color:var(--honey)}
.ah-actions{display:flex;flex-wrap:wrap;gap:12px}
.ah-btn{display:inline-flex;align-items:center;height:48px;padding:0 22px;border-radius:999px;font-size:15px;font-weight:700;text-decoration:none;color:var(--paper);background:var(--bark);transition:transform .25s,box-shadow .25s}
.ah-btn:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(90,58,28,.3)}
.ah-btn.ghost{color:var(--bark);background:transparent;box-shadow:inset 0 0 0 1px rgba(90,58,28,.5)}
@media (max-width:820px){
.ah{padding-top:110px;font-size:16px}
.ah-hero,.ah-anatomy,.ah-hexwhy,.ah-flat{grid-template-columns:1fr}
.ah-swatches{grid-template-columns:1fr 1fr}
.ah-meta div{grid-template-columns:90px 1fr}
.ah-words li{width:92px;font-size:17px}
}
@media (prefers-reduced-motion:reduce){.ah-flip,.ah-spot,.ah-logo img,.ah-pin,.ah-parts button,.ah-btn{transition:none}}
`

addPropertyControls(AlturaCaseStudy, {
    logo: { type: ControlType.Image, title: "Logo" },
    labelFront: { type: ControlType.Image, title: "Label front" },
    labelBack: { type: ControlType.Image, title: "Label back" },
    lid: { type: ControlType.Image, title: "Lid" },
    backLink: { type: ControlType.String, title: "Back link", defaultValue: "/portfolio-2" },
    nextLink: { type: ControlType.String, title: "Next case study", defaultValue: "/case-study/vaarahi-brand-identity" },
})
