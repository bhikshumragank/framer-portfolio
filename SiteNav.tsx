import { addPropertyControls, ControlType, RenderTarget } from "framer"
import * as FramerLib from "framer"
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react"

type Props = {
    name: string
    role: string
    status: string
    logo: string
    links: string
    ctaLabel: string
    ctaLink: string
    hideOld: boolean
    style?: CSSProperties
}

const FU = "https://framerusercontent.com/images/"

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

// the pages visited in this tab, so Back can return to the real previous page
const TRAIL_KEY = "mb-trail"
const readTrail = (): string[] => {
    try {
        return JSON.parse(sessionStorage.getItem(TRAIL_KEY) || "[]")
    } catch (e) {
        return []
    }
}
const writeTrail = (t: string[]) => {
    try {
        sessionStorage.setItem(TRAIL_KEY, JSON.stringify(t.slice(-30)))
    } catch (e) {}
}
// where Back goes when the visitor arrived straight on a page: a case study goes up to the case studies, anything else home
const parentOf = (p: string) => (p.startsWith("/case-study/") ? "/case-studies" : "/")
const PAGE_NAMES: [RegExp, string][] = [
    [/^\/$/, "Home"],
    [/^\/about-me/, "About"],
    [/^\/portfolio/, "Portfolio"],
    [/^\/case-studies/, "Case studies"],
    [/^\/case-study\//, "Case study"],
    [/^\/contact/, "Contact"],
]
const pageName = (p: string) => PAGE_NAMES.find(([re]) => re.test(p))?.[1] || "Back"

const parseLinks = (s: string) =>
    (s || "")
        .split(";")
        .map((x) => x.trim())
        .filter(Boolean)
        .map((x) => {
            const [label, ...rest] = x.split("|")
            return { label: label.trim(), href: (rest.join("|") || "/").trim() }
        })

/**
 * Site Nav: a floating glass navigation bar. A glowing pill slides to the hovered link and rests on the
 * current page; the bar tightens as the page scrolls; phones get a full-screen menu. On every page but Home a
 * Back button returns to the previous page (or, for a visitor who landed there directly, the page above it).
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 90
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function SiteNav(props: Props) {
    const {
        name = "Mragank Bhikshu",
        role = "Product & Brand Designer",
        status = "Open to internships",
        logo = FU + "OVIbwLc0OkY2CjHqs3AbXGXSw.png",
        links = "Home|/;About me|/about-me;Portfolio|/portfolio-2",
        ctaLabel = "Let's talk",
        ctaLink = "/contact-us",
        hideOld = true,
        style,
    } = props
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const go = useGo()
    const items = parseLinks(links)

    const bar = useRef<HTMLDivElement>(null)
    const list = useRef<HTMLDivElement>(null)
    const [path, setPath] = useState("/")
    const [hover, setHover] = useState<number | null>(null)
    const [pill, setPill] = useState<{ x: number; w: number } | null>(null)
    const [scrolled, setScrolled] = useState(false)
    const [narrow, setNarrow] = useState(false)
    const [menu, setMenu] = useState(false)
    const [prev, setPrev] = useState<string | null>(null)

    // current page: Framer changes the URL without reloading, so watch it
    useEffect(() => {
        if (onCanvas) return
        let last = ""
        const check = () => {
            const p = window.location.pathname.replace(/\/+$/, "") || "/"
            if (p === last) return
            setPath((last = p))
            // keep the trail of pages: stepping back onto the previous page pops, anything else is a new step
            const t = readTrail()
            if (t[t.length - 1] !== p) {
                if (t[t.length - 2] === p) t.pop()
                else t.push(p)
            }
            writeTrail(t)
            setPrev(t.length > 1 ? t[t.length - 2] : null)
        }
        check()
        const t = window.setInterval(check, 400)
        window.addEventListener("popstate", check)
        return () => {
            window.clearInterval(t)
            window.removeEventListener("popstate", check)
        }
    }, [onCanvas])

    useEffect(() => {
        if (onCanvas) return
        const onScroll = () => setScrolled(window.scrollY > 24)
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [onCanvas])

    useEffect(() => {
        const el = bar.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 820))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const current = items.findIndex((l) => (l.href === "/" ? path === "/" : path === l.href || path.startsWith(l.href + "/")))
    const target = hover ?? (current >= 0 ? current : null)

    // the highlight pill slides under the hovered link, and rests on the current page
    useLayoutEffect(() => {
        const box = list.current
        if (!box || target === null) return setPill(null)
        const a = box.querySelectorAll<HTMLElement>("[data-link]")[target]
        if (a) setPill({ x: a.offsetLeft, w: a.offsetWidth })
    }, [target, narrow, links, path])

    // close the phone menu on navigation, and stop the page scrolling behind it
    useEffect(() => setMenu(false), [path])
    useEffect(() => {
        if (!menu) return
        const html = document.documentElement
        const prev = html.style.overflow
        html.style.overflow = "hidden"
        return () => {
            html.style.overflow = prev
        }
    }, [menu])

    const back = () => {
        setMenu(false)
        if (prev && window.history.length > 1) window.history.back()
        else go(parentOf(path))
    }
    const backTo = prev || parentOf(path)
    const showBack = !onCanvas && path !== "/"

    const nav = (href: string) => (e: React.MouseEvent) => {
        e.preventDefault()
        setMenu(false)
        go(href)
    }

    return (
        <div ref={bar} className={"sn" + (scrolled ? " is-scrolled" : "") + (narrow ? " nr" : "") + (menu ? " is-open" : "")} style={style}>
            <style>{CSS}</style>
            {/* the previous navigation bar is a shared layer on every page; this bar replaces it */}
            {hideOld && !onCanvas && <style>{`[data-framer-name="Navbar"]{display:none!important}`}</style>}
            <div className="sn-bar">
                {showBack && (
                    <button className="sn-back" onClick={back} aria-label={`Back to ${pageName(backTo)}`} title={`Back to ${pageName(backTo)}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M15 5l-7 7 7 7" />
                        </svg>
                        {!narrow && <span>Back</span>}
                    </button>
                )}
                <a className="sn-brand" href="/" onClick={nav("/")} aria-label={`${name}, home`}>
                    <span className="sn-logo">{logo && <img src={logo} alt="" draggable={false} />}</span>
                    <span className="sn-id">
                        <b>{name}</b>
                        <span>
                            {status && <i className="sn-dot" />}
                            {narrow ? role.split(" ")[0] + " designer" : status || role}
                        </span>
                    </span>
                </a>

                {!narrow && (
                    <nav className="sn-links" ref={list} onMouseLeave={() => setHover(null)} aria-label="Main">
                        {pill && <span className="sn-pill" style={{ transform: `translateX(${pill.x}px)`, width: pill.w }} aria-hidden="true" />}
                        {items.map((l, i) => (
                            <a
                                key={l.href + l.label}
                                data-link
                                href={l.href}
                                className={i === current ? "on" : ""}
                                aria-current={i === current ? "page" : undefined}
                                onMouseEnter={() => setHover(i)}
                                onFocus={() => setHover(i)}
                                onBlur={() => setHover(null)}
                                onClick={nav(l.href)}
                            >
                                {l.label}
                            </a>
                        ))}
                    </nav>
                )}

                <div className="sn-end">
                    {ctaLabel && (
                        <a className={"sn-cta" + (path === ctaLink ? " on" : "")} href={ctaLink} onClick={nav(ctaLink)}>
                            {ctaLabel}
                            <i aria-hidden="true">→</i>
                        </a>
                    )}
                    {narrow && (
                        <button className="sn-burger" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label={menu ? "Close menu" : "Open menu"}>
                            <span />
                            <span />
                        </button>
                    )}
                </div>
            </div>

            {narrow && (
                <div className="sn-menu" aria-hidden={!menu}>
                    {[...items, ...(ctaLabel ? [{ label: ctaLabel, href: ctaLink }] : [])].map((l, i) => (
                        <a key={l.href + l.label} href={l.href} onClick={nav(l.href)} tabIndex={menu ? 0 : -1} style={{ transitionDelay: menu ? `${80 + i * 50}ms` : "0ms" }} className={path === l.href ? "on" : ""}>
                            <span>{String(i + 1).padStart(2, "0")}</span>
                            {l.label}
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
}

const CSS = `
.sn{box-sizing:border-box;position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:0 16px;font-family:Inter,system-ui,sans-serif;color:#F3F1EC;pointer-events:none}
.sn *{box-sizing:border-box}
.sn a{color:inherit;text-decoration:none}
.sn-bar{pointer-events:auto;position:relative;z-index:2;width:100%;max-width:1168px;height:66px;display:flex;align-items:center;gap:16px;padding:0 10px 0 12px;border-radius:20px;background:rgba(14,14,18,.55);backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);border:1px solid rgba(255,255,255,.08);box-shadow:0 10px 40px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.06);transition:height .35s ease,background .35s ease,border-color .35s ease,box-shadow .35s ease}
.is-scrolled .sn-bar{height:58px;background:rgba(10,10,13,.82);border-color:rgba(255,255,255,.1);box-shadow:0 14px 44px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.06)}
/* brand */
.sn-brand{display:flex;align-items:center;gap:11px;min-width:0;padding:6px 10px 6px 6px;border-radius:14px;transition:background .25s}
.sn-brand:hover{background:rgba(255,255,255,.05)}
.sn-logo{position:relative;flex:none;width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,rgba(47,155,255,.35),rgba(47,155,255,.06) 70%);box-shadow:inset 0 0 0 1px rgba(47,155,255,.35);overflow:hidden;transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.sn-logo img{width:86%;height:86%;object-fit:contain;transition:transform .45s cubic-bezier(.2,.8,.2,1)}
.sn-brand:hover .sn-logo img{transform:rotate(-8deg) scale(1.08)}
.sn-id{display:flex;flex-direction:column;gap:2px;min-width:0}
.sn-id b{font-size:15px;font-weight:800;letter-spacing:-.01em;white-space:nowrap}
.sn-id span{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:500;color:rgba(255,255,255,.58);white-space:nowrap}
.sn-dot{width:7px;height:7px;border-radius:50%;background:#3BD671;box-shadow:0 0 0 0 rgba(59,214,113,.6);animation:sn-ping 2s ease-out infinite}
@keyframes sn-ping{0%{box-shadow:0 0 0 0 rgba(59,214,113,.55)}70%,100%{box-shadow:0 0 0 7px rgba(59,214,113,0)}}
/* back to the previous page */
.sn-back{all:unset;flex:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px;height:42px;padding:0 14px 0 10px;margin-right:-6px;border-radius:13px;font-size:13.5px;font-weight:700;color:rgba(255,255,255,.85);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);transition:background .25s,color .25s,border-color .25s}
.sn-back svg{width:18px;height:18px;transition:transform .25s}
.sn-back:hover{color:#fff;background:rgba(47,155,255,.16);border-color:rgba(47,155,255,.5)}
.sn-back:hover svg{transform:translateX(-3px)}
.sn-back:focus-visible{outline:2px solid #fff;outline-offset:3px}
.nr .sn-back{width:42px;padding:0;justify-content:center;margin-right:-8px}
/* links with a sliding highlight */
.sn-links{position:relative;display:flex;align-items:center;gap:2px;margin:0 auto;padding:5px;border-radius:14px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06)}
.sn-pill{position:absolute;left:0;top:5px;bottom:5px;border-radius:10px;background:linear-gradient(180deg,rgba(47,155,255,.28),rgba(47,155,255,.14));box-shadow:inset 0 0 0 1px rgba(47,155,255,.55),0 0 22px rgba(47,155,255,.25);transition:transform .4s cubic-bezier(.3,.9,.3,1),width .4s cubic-bezier(.3,.9,.3,1)}
.sn-links a{position:relative;z-index:1;padding:9px 18px;border-radius:10px;font-size:14px;font-weight:600;color:rgba(255,255,255,.66);transition:color .25s}
.sn-links a:hover,.sn-links a.on{color:#fff}
.sn-links a:focus-visible,.sn-cta:focus-visible,.sn-brand:focus-visible,.sn-burger:focus-visible,.sn-menu a:focus-visible{outline:2px solid #fff;outline-offset:3px}
/* call to action */
.sn-end{display:flex;align-items:center;gap:8px;margin-left:auto}
.sn-cta{display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px;border-radius:13px;font-size:14px;font-weight:700;color:#fff;background:linear-gradient(180deg,#45a6ff,#1f86f0);box-shadow:0 8px 24px rgba(47,155,255,.35),inset 0 1px 0 rgba(255,255,255,.3);transition:transform .25s,box-shadow .25s}
.sn-cta i{font-style:normal;transition:transform .25s}
.sn-cta:hover{transform:translateY(-1px);box-shadow:0 12px 30px rgba(47,155,255,.5),inset 0 1px 0 rgba(255,255,255,.3)}
.sn-cta:hover i{transform:translateX(3px)}
.sn-cta.on{box-shadow:0 0 0 2px rgba(255,255,255,.7),0 8px 24px rgba(47,155,255,.4)}
.is-scrolled .sn-cta{height:40px}
/* phones */
.nr .sn-bar{max-width:none;padding:0 8px}
.nr .sn-cta{height:40px;padding:0 14px;font-size:13px}
.nr .sn-cta i{display:none}
.nr .sn-bar{gap:8px}
.nr .sn-cta{white-space:nowrap}
.nr .sn-back + .sn-brand .sn-id{display:none}
.nr .sn-back + .sn-brand{padding-right:6px}
.sn-burger{all:unset;cursor:pointer;width:44px;height:44px;border-radius:12px;display:grid;place-content:center;gap:6px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08)}
.sn-burger span{display:block;width:18px;height:2px;border-radius:2px;background:#fff;transition:transform .3s ease}
.is-open .sn-burger span:first-child{transform:translateY(4px) rotate(45deg)}
.is-open .sn-burger span:last-child{transform:translateY(-4px) rotate(-45deg)}
.sn-menu{pointer-events:none;position:fixed;inset:0;z-index:1;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:100px 28px 40px;background:rgba(6,6,9,.94);backdrop-filter:blur(16px);opacity:0;transition:opacity .35s ease}
.is-open .sn-menu{pointer-events:auto;opacity:1}
.sn-menu a{display:flex;align-items:baseline;gap:14px;padding:12px 4px;font-size:34px;font-weight:800;letter-spacing:-.03em;border-bottom:1px solid rgba(255,255,255,.08);opacity:0;transform:translateY(14px);transition:opacity .4s ease,transform .45s cubic-bezier(.2,.8,.2,1),color .2s}
.sn-menu a span{font-size:13px;font-weight:700;color:#2F9BFF;letter-spacing:.1em}
.sn-menu a.on{color:#2F9BFF}
.is-open .sn-menu a{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.sn-pill,.sn-bar,.sn-menu,.sn-menu a{transition:none}.sn-dot{animation:none}}
`

addPropertyControls(SiteNav, {
    name: { type: ControlType.String, title: "Name", defaultValue: "Mragank Bhikshu" },
    role: { type: ControlType.String, title: "Role", defaultValue: "Product & Brand Designer" },
    status: { type: ControlType.String, title: "Status", defaultValue: "Open to internships" },
    logo: { type: ControlType.String, title: "Logo URL", defaultValue: "https://framerusercontent.com/images/OVIbwLc0OkY2CjHqs3AbXGXSw.png" },
    links: { type: ControlType.String, title: "Links", description: "Label|/path; Label|/path", defaultValue: "Home|/;About me|/about-me;Portfolio|/portfolio-2" },
    ctaLabel: { type: ControlType.String, title: "Button", defaultValue: "Let's talk" },
    ctaLink: { type: ControlType.String, title: "Button link", defaultValue: "/contact-us" },
    hideOld: { type: ControlType.Boolean, title: "Hide old navbar", defaultValue: true },
})
