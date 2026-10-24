import { addPropertyControls, ControlType, RenderTarget } from "framer"
import * as FramerLib from "framer"
import { useState, type CSSProperties } from "react"

type Props = {
    logo: string
    logoVideo: string
    ringBox: string
    boxes: string
    bagPouch: string
    giftBox: string
    giftCard: string
    poster: string
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
    logo: "https://framerusercontent.com/images/glvAdlW9B9aO3vM0wFHzlNCXTw.png",
    logoVideo: "",
    ringBox: "https://framerusercontent.com/images/VqZd6AFrYVbZ3geDOKGgKQ4E.png",
    boxes: "https://framerusercontent.com/images/0MPll5RdN7MYbXH7FYDa50Lhqw.png",
    bagPouch: "https://framerusercontent.com/images/QuVqFlcNCHc394c1k5vH5S3HSk.png",
    giftBox: "https://framerusercontent.com/images/X0hRzUh7CDW9LmXyQJihNqS7ACQ.png",
    giftCard: "https://framerusercontent.com/images/dl9JtRlVKSJ8jwWkaBmoihURQjc.png",
    poster: "https://framerusercontent.com/images/URpAwr0m3i94c66G7ptfladIc.png",
}

// the three ideas inside the mark, pinned where they sit on the logo (% of the 1366 × 768 logo artwork)
const PARTS = [
    {
        id: "peacock",
        name: "The peacock",
        pin: { x: 50, y: 32 },
        glow: { x: 50, y: 36, r: 13 },
        text: "A peacock's side profile rises out of the centre petal. Its head, crest and curved neck are drawn with a single gold line, the same weight as the rest of the mark.",
    },
    {
        id: "v",
        name: "The letter V",
        pin: { x: 50, y: 60 },
        glow: { x: 50, y: 50, r: 15 },
        text: "The peacock's neck and the inner edges of the petals meet in a point at the bottom, so the bird and the brand's initial are the same shape. Read it as a peacock, then as a V.",
    },
    {
        id: "leaves",
        name: "Feathers into leaves",
        pin: { x: 38, y: 50 },
        glow: { x: 50, y: 47, r: 28 },
        text: "Peacock feathers are too detailed to emboss on a ring box, so I simplified them into two pairs of leaves. Leaves are also a motif buyers already know from jewellery, which makes the mark feel familiar.",
    },
]

/**
 * Vaarahi case study: brand identity for a jewellery house (logo, packaging, gift card, social poster).
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 4200
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function VaarahiCaseStudy(props: Props) {
    const { logo = A.logo, logoVideo = A.logoVideo, ringBox = A.ringBox, boxes = A.boxes, bagPouch = A.bagPouch, giftBox = A.giftBox, giftCard = A.giftCard, poster = A.poster, backLink = "/portfolio-2", nextLink = "/case-study/sparky-mascot-redesign", style } = props
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const go = useGo()
    const [part, setPart] = useState<string | null>(null)
    const active = PARTS.find((p) => p.id === part) || null

    const nav = (href: string) => (e: React.MouseEvent) => {
        e.preventDefault()
        go(href)
    }

    // plain render helper (called, not mounted) so images keep their DOM when the mark is explored
    const Img = ({ src, alt, className }: { src: string; alt: string; className?: string }) =>
        src ? <img className={className} src={src} alt={alt} loading="lazy" draggable={false} /> : <span className={"vc-missing " + (className || "")}>{alt}</span>

    return (
        <div className="vc" style={style}>
            <style>{CSS}</style>

            <header className="vc-hero">
                <div className="vc-hero-text">
                    <p className="vc-kicker">Brand identity case study</p>
                    <h1>Vaarahi</h1>
                    <p className="vc-lede">A jewellery house whose logo is a peacock, the letter V and two leaves, drawn as one gold line.</p>
                    <dl className="vc-meta">
                        <div>
                            <dt>Client</dt>
                            <dd>Vaarahi, through PixyGrid</dd>
                        </div>
                        <div>
                            <dt>My role</dt>
                            <dd>Freelance brand designer</dd>
                        </div>
                        <div>
                            <dt>Delivered</dt>
                            <dd>Logo and animation, packaging, gift card, social poster</dd>
                        </div>
                    </dl>
                </div>
                <div className={"vc-hero-art" + (logoVideo && !onCanvas ? " is-video" : "")}>
                    {logoVideo && !onCanvas ? <video src={logoVideo} poster={logo || undefined} autoPlay muted loop playsInline aria-label="Vaarahi logo animation" /> : Img({ src: logo, alt: "Vaarahi logo" })}
                </div>
            </header>

            <section className="vc-brief vc-narrow">
                <h2>The brief</h2>
                <p>PixyGrid asked me for a logo that holds two things at once: a peacock, and the letter V for Vaarahi. It had to work as small as an embossed ring box and as large as a store sign, and the packaging had to feel more precious than the usual jeweller's box.</p>
            </section>

            <section className="vc-mark">
                <div className="vc-mark-head vc-narrow">
                    <h2>One line, three ideas</h2>
                    <p>Tap a part of the mark to see how it is built.</p>
                </div>
                <div className="vc-anatomy">
                    <div className={"vc-logo" + (active ? " is-focus" : "")} style={active ? ({ ["--gx" as any]: active.glow.x + "%", ["--gy" as any]: active.glow.y + "%", ["--gr" as any]: active.glow.r + "%" } as CSSProperties) : undefined}>
                        {Img({ src: logo, alt: "Vaarahi logo" })}
                        <span className="vc-spot" aria-hidden="true" />
                        {PARTS.map((p) => (
                            <button key={p.id} className={"vc-pin" + (part === p.id ? " on" : "")} style={{ left: p.pin.x + "%", top: p.pin.y + "%" }} onClick={() => setPart(part === p.id ? null : p.id)} aria-label={p.name} aria-pressed={part === p.id} />
                        ))}
                    </div>
                    <ul className="vc-parts">
                        {PARTS.map((p) => (
                            <li key={p.id}>
                                <button className={part === p.id ? "on" : ""} onClick={() => setPart(part === p.id ? null : p.id)} onMouseEnter={() => setPart(p.id)} aria-pressed={part === p.id}>
                                    <b>{p.name}</b>
                                    <span>{p.text}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="vc-colour">
                <div className="vc-narrow">
                    <h2>Green, not red</h2>
                    <p>Walk into most jewellery shops and the box is red velvet. I chose a deep forest green with gold foil instead: it reads as an heirloom rather than a gift-shop box, it makes white diamonds and gold look warmer, and it sets Vaarahi apart on a counter full of red.</p>
                </div>
                <div className="vc-swatches">
                    <figure className="vc-swatch vc-red">
                        <span className="vc-velvet" />
                        <figcaption>
                            <b>The usual</b>
                            <span>Red velvet, seen in every jewellery shop</span>
                        </figcaption>
                    </figure>
                    <figure className="vc-swatch vc-green">
                        <span className="vc-velvet">{logo && <img src={logo} alt="" draggable={false} />}</span>
                        <figcaption>
                            <b>Vaarahi</b>
                            <span>Forest green #0B2B1C with antique gold #CEAB4D</span>
                        </figcaption>
                    </figure>
                </div>
            </section>

            <section className="vc-pack">
                <div className="vc-narrow">
                    <h2>The packaging family</h2>
                    <p>Every touchpoint uses the same two colours and the embossed mark, so a ring box, a necklace case and the carry bag look like they came from one maker.</p>
                </div>
                <div className="vc-gallery">
                    <figure className="g-a">
                        {Img({ src: ringBox, alt: "Ring box" })}
                        <figcaption>Ring box, with the mark embossed inside the lid too</figcaption>
                    </figure>
                    <figure className="g-b">
                        {Img({ src: boxes, alt: "Jewellery boxes" })}
                        <figcaption>Velvet cases for rings, necklaces and sets</figcaption>
                    </figure>
                    <figure className="g-c">
                        {Img({ src: bagPouch, alt: "Carry bag and pouch" })}
                        <figcaption>Carry bag and drawstring pouch</figcaption>
                    </figure>
                    <figure className="g-d">
                        {Img({ src: giftBox, alt: "Gift box and patterned bag" })}
                        <figcaption>Gift box with a repeat-pattern paper bag</figcaption>
                    </figure>
                    <figure className="g-e">
                        {Img({ src: giftCard, alt: "Gift card" })}
                        <figcaption>Gift card: “Crafted for your cherished moments”</figcaption>
                    </figure>
                </div>
            </section>

            <section className="vc-market">
                <div className="vc-poster">
                    {Img({ src: poster, alt: "Vaarahi Instagram poster" })}
                </div>
                <div className="vc-market-text">
                    <h2>Taking it to market</h2>
                    <p>The launch poster sells everyday luxury rather than a wedding-only purchase:</p>
                    <blockquote>Not every piece needs an occasion. Some just belong to you.</blockquote>
                    <p>The necklace sits on a green velvet bust that matches the boxes, so the feed, the packaging and the store counter feel like one place. The ruby is the only other colour, kept for the product itself.</p>
                </div>
            </section>

            <section className="vc-close vc-narrow">
                <h2>What this project shows</h2>
                <ul>
                    <li>Turning two required symbols into one simple, ownable mark</li>
                    <li>Designing for tiny embossing and large signage from the start</li>
                    <li>Using colour strategy to stand out in a crowded retail category</li>
                    <li>Extending one identity across packaging, print and social</li>
                </ul>
                <div className="vc-actions">
                    <a className="vc-btn" href={backLink} onClick={nav(backLink)}>
                        Back to the gallery
                    </a>
                    {nextLink && (
                        <a className="vc-btn ghost" href={nextLink} onClick={nav(nextLink)}>
                            Read the Sparky case study
                        </a>
                    )}
                </div>
            </section>
        </div>
    )
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Jost:wght@400;500;600&display=swap");
.vc{box-sizing:border-box;--green:#0B2B1C;--velvet:#123A28;--deep:#071A11;--gold:#CEAB4D;--cream:#EFE6CF;--ruby:#8E1B2C;position:relative;width:100%;max-width:1200px;margin-inline:auto;padding:140px clamp(20px,5vw,72px) 120px;color:var(--cream);background:radial-gradient(120% 60% at 70% 0%,#174a33 0%,var(--green) 45%,var(--deep) 100%);font-family:Jost,system-ui,sans-serif;font-size:17px;line-height:1.65;overflow:hidden}
.vc *{box-sizing:border-box}
.vc h1,.vc h2,.vc blockquote{font-family:"Cormorant Garamond",Georgia,serif;font-weight:600;color:#fff;letter-spacing:-.01em}
.vc h2{margin:0 0 14px;font-size:clamp(30px,3.6vw,44px);line-height:1.1}
.vc p{margin:0 0 14px;color:rgba(239,230,207,.82)}
.vc a{color:inherit}
.vc section{margin-top:clamp(80px,10vw,130px)}
.vc-narrow{max-width:680px}
.vc img,.vc video{display:block;max-width:100%}
.vc-missing{display:grid;place-items:center;min-height:180px;width:100%;border:1px dashed rgba(206,171,77,.5);border-radius:10px;color:rgba(239,230,207,.6);font-size:14px}
/* hero */
.vc-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:clamp(32px,5vw,72px);align-items:center}
.vc-kicker{margin:0 0 6px;font-size:15px;color:var(--gold)}
.vc-hero h1{margin:0;font-size:clamp(72px,11vw,148px);line-height:.9;font-weight:500;letter-spacing:-.02em}
.vc-lede{margin:22px 0 30px;font-size:20px;line-height:1.55;max-width:460px;color:var(--cream)}
.vc-meta{display:grid;gap:12px;margin:0;padding:20px 0 0;border-top:1px solid rgba(206,171,77,.35)}
.vc-meta div{display:grid;grid-template-columns:110px 1fr;gap:12px}
.vc-meta dt{font-size:14px;color:var(--gold)}
.vc-meta dd{margin:0;font-size:15px}
.vc-hero-art{border-radius:22px;overflow:hidden;background:var(--green);box-shadow:0 40px 90px rgba(0,0,0,.45),inset 0 0 0 1px rgba(206,171,77,.25);aspect-ratio:16/9}
.vc-hero-art{position:relative}
.vc-hero-art img,.vc-hero-art .vc-missing{width:100%;height:100%;object-fit:cover}
/* the animation file has a white presentation border; show only its dark panel (54-1296 × 144-734 of 1350 × 780) */
.vc-hero-art.is-video{aspect-ratio:1242/590}
.vc-hero-art.is-video video{position:absolute;max-width:none;width:108.7%;height:132.2%;left:-4.35%;top:-24.41%}
/* the mark, taken apart */
.vc-mark-head p{font-size:15px;color:rgba(239,230,207,.6)}
.vc-anatomy{margin-top:28px;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:clamp(24px,4vw,56px);align-items:center}
.vc-logo{position:relative;border-radius:18px;overflow:hidden;background:var(--green);box-shadow:inset 0 0 0 1px rgba(206,171,77,.2)}
.vc-logo img{width:100%;transition:filter .45s ease}
.vc-spot{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .45s ease;background:radial-gradient(circle at var(--gx,50%) var(--gy,50%),transparent 0,transparent var(--gr,15%),rgba(7,26,17,.78) calc(var(--gr,15%) + 6%))}
.vc-logo.is-focus .vc-spot{opacity:1}
.vc-logo.is-focus img{filter:saturate(1.15) brightness(1.08)}
.vc-pin{all:unset;position:absolute;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;cursor:pointer;background:rgba(206,171,77,.18);box-shadow:inset 0 0 0 1.5px var(--gold);transition:transform .25s,background .25s}
.vc-pin::after{content:"";position:absolute;inset:8px;border-radius:50%;background:var(--gold)}
.vc-pin:hover,.vc-pin.on{transform:scale(1.25);background:rgba(206,171,77,.4)}
.vc-pin:focus-visible,.vc-parts button:focus-visible,.vc-btn:focus-visible{outline:2px solid #fff;outline-offset:3px}
.vc-parts{list-style:none;margin:0;padding:0;display:grid;gap:4px}
.vc-parts button{all:unset;display:block;width:100%;box-sizing:border-box;cursor:pointer;padding:16px 18px;border-radius:12px;border-left:2px solid rgba(206,171,77,.25);transition:background .3s,border-color .3s}
.vc-parts b{display:block;font-family:"Cormorant Garamond",Georgia,serif;font-size:26px;font-weight:600;color:#fff;line-height:1.15}
.vc-parts span{display:block;margin-top:6px;font-size:15.5px;line-height:1.6;color:rgba(239,230,207,.72)}
.vc-parts button:hover,.vc-parts button.on{background:rgba(206,171,77,.08);border-left-color:var(--gold)}
/* green, not red */
.vc-swatches{margin-top:30px;display:grid;grid-template-columns:1fr 1.4fr;gap:18px}
.vc-swatch{margin:0}
.vc-velvet{display:grid;place-items:center;aspect-ratio:4/3;border-radius:18px;overflow:hidden}
.vc-red .vc-velvet{background:radial-gradient(120% 90% at 30% 20%,#b8273d 0%,var(--ruby) 45%,#4d0b16 100%);box-shadow:inset 0 -30px 60px rgba(0,0,0,.35)}
.vc-green .vc-velvet{aspect-ratio:auto;height:100%;min-height:100%;background:radial-gradient(120% 90% at 30% 20%,#1d5a3e 0%,var(--velvet) 50%,var(--green) 100%);box-shadow:inset 0 -30px 60px rgba(0,0,0,.35),inset 0 0 0 1px rgba(206,171,77,.25)}
.vc-green .vc-velvet img{width:70%;mix-blend-mode:lighten}
.vc-green{display:grid;grid-template-rows:1fr auto}
.vc-swatch figcaption{margin-top:12px;display:grid;gap:2px}
.vc-swatch b{font-family:"Cormorant Garamond",Georgia,serif;font-size:24px;font-weight:600;color:#fff}
.vc-swatch span{font-size:14.5px;color:rgba(239,230,207,.65)}
/* packaging */
.vc-gallery{margin-top:30px;display:grid;grid-template-columns:repeat(6,1fr);grid-auto-rows:auto;gap:18px}
.vc-gallery figure{margin:0}
.vc-gallery img,.vc-gallery .vc-missing{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:14px;background:#f4f1ea}
.vc-gallery figcaption{margin-top:10px;font-size:14.5px;color:rgba(239,230,207,.7)}
.g-a{grid-column:span 4}.g-b{grid-column:span 2}.g-c{grid-column:span 2}.g-d{grid-column:span 2}.g-e{grid-column:span 2}
.g-b img,.g-c img,.g-d img,.g-e img{aspect-ratio:1/1}
.g-a img{aspect-ratio:auto;height:100%;max-height:460px}
.g-e img{object-fit:contain;background:var(--green)}
/* market */
.vc-market{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1fr);gap:clamp(28px,5vw,72px);align-items:center}
.vc-poster img,.vc-poster .vc-missing{width:100%;border-radius:16px;box-shadow:0 30px 70px rgba(0,0,0,.45)}
.vc-market blockquote{margin:6px 0 20px;padding-left:20px;border-left:2px solid var(--gold);font-size:clamp(28px,3vw,38px);line-height:1.2;font-style:italic;font-weight:500}
/* close */
.vc-close ul{margin:0 0 30px;padding-left:20px;display:grid;gap:8px}
.vc-close li{color:rgba(239,230,207,.85)}
.vc-close li::marker{color:var(--gold)}
.vc-actions{display:flex;flex-wrap:wrap;gap:12px}
.vc-btn{display:inline-flex;align-items:center;height:48px;padding:0 22px;border-radius:999px;font-size:15px;font-weight:600;text-decoration:none;color:var(--deep);background:var(--gold);transition:transform .25s,box-shadow .25s}
.vc-btn:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(206,171,77,.35)}
.vc-btn.ghost{color:var(--cream);background:transparent;box-shadow:inset 0 0 0 1px rgba(206,171,77,.6)}
@media (max-width:820px){
.vc{padding-top:110px;font-size:16px}
.vc-hero,.vc-anatomy,.vc-market{grid-template-columns:1fr}
.vc-swatches{grid-template-columns:1fr 1fr}
.vc-gallery{grid-template-columns:1fr 1fr}
.g-a{grid-column:span 2}.g-b,.g-c,.g-d,.g-e{grid-column:span 1}
.vc-meta div{grid-template-columns:90px 1fr}
}
@media (prefers-reduced-motion:reduce){.vc-spot,.vc-logo img,.vc-pin,.vc-parts button,.vc-btn{transition:none}}
`

addPropertyControls(VaarahiCaseStudy, {
    logo: { type: ControlType.String, title: "Logo image", defaultValue: "https://framerusercontent.com/images/glvAdlW9B9aO3vM0wFHzlNCXTw.png" },
    logoVideo: { type: ControlType.File, title: "Logo animation", allowedFileTypes: ["mp4", "webm", "mov"] },
    ringBox: { type: ControlType.String, title: "Ring box", defaultValue: "https://framerusercontent.com/images/VqZd6AFrYVbZ3geDOKGgKQ4E.png" },
    boxes: { type: ControlType.String, title: "Jewellery boxes", defaultValue: "https://framerusercontent.com/images/0MPll5RdN7MYbXH7FYDa50Lhqw.png" },
    bagPouch: { type: ControlType.String, title: "Bag and pouch", defaultValue: "https://framerusercontent.com/images/QuVqFlcNCHc394c1k5vH5S3HSk.png" },
    giftBox: { type: ControlType.String, title: "Gift box", defaultValue: "https://framerusercontent.com/images/X0hRzUh7CDW9LmXyQJihNqS7ACQ.png" },
    giftCard: { type: ControlType.String, title: "Gift card", defaultValue: "https://framerusercontent.com/images/dl9JtRlVKSJ8jwWkaBmoihURQjc.png" },
    poster: { type: ControlType.String, title: "Poster", defaultValue: "https://framerusercontent.com/images/URpAwr0m3i94c66G7ptfladIc.png" },
    backLink: { type: ControlType.String, title: "Back link", defaultValue: "/portfolio-2" },
    nextLink: { type: ControlType.String, title: "Next case study", defaultValue: "/case-study/sparky-mascot-redesign" },
})
