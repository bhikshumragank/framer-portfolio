import { addPropertyControls, ControlType, RenderTarget } from "framer"
import * as FramerLib from "framer"
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react"

type WingId = "poster" | "animation" | "brand" | "product" | "internship"

type Item = {
    title: string
    wing: WingId
    image?: string
    summary?: string
    role?: string
    tools?: string
    year?: string
    client?: string
    outcome?: string
    video?: string
    link?: string
    caseStudy?: string
    device?: "laptop" | "phone"
    gallery?: string[]
    // "contain" shows the whole image on a brand gradient instead of cropping it to the screen
    fit?: "contain"
    // book pages: the piece stands in the hall as a closed book and opens as a flipbook
    book?: string[]
    // a spiral notebook instead of a bound book: portrait pages, a coil down the middle and an elastic band
    notebook?: boolean
    // internships open on what was done there (projects, numbers, the experience letter), then the work
    intern?: Intern
}

type Intern = {
    company: string
    role: string
    dates: string
    place: string
    summary: string
    metrics?: [string, string][]
    projects: { title: string; text: string; link?: string; label?: string }[]
    letter?: string
    letterNote?: string
}

type Props = {
    heading: string
    intro: string
    items: Item[]
    contactLink: string
    bgEntrance: string
    bgPoster: string
    bgCinema: string
    bgBrand: string
    bgProduct: string
    bgArchive: string
    lightsOff: boolean
    vaarahiVideo: string
    style?: CSSProperties
}

const WINGS: { id: WingId; name: string; color: string; blurb: string }[] = [
    { id: "poster", name: "Poster Wing", color: "#FF4F8B", blurb: "Event posters and illustrations, mostly for Kshitij, IIT Kharagpur's techno-management fest." },
    { id: "animation", name: "Animation Cinema", color: "#2F9BFF", blurb: "Countdown films, mascot reveals and ad films. Pick a film from the strip to put it on the screen." },
    { id: "brand", name: "Brand Studio", color: "#FF8A2A", blurb: "Mascots, logos, merchandise and fest gate designs." },
    { id: "product", name: "Product Lab", color: "#8B5CF6", blurb: "Websites and product work, with full case studies for the Kshitij 2025 website, the chatbot, the conductor ticketing screen and the HR portal." },
    { id: "internship", name: "Internship Archive", color: "#3BD671", blurb: "Three internships: Sonepar India, PixyGrid and Optibase. Open one to see what I did there, then the work." },
]

const FU = "https://framerusercontent.com/images/"
const LIT_KEY = "gallery-lights-on"
const ROOM = (f: string) => FU + f + "?scale-down-to=2048"
const litBefore = () => {
    try {
        return !!sessionStorage.getItem(LIT_KEY)
    } catch (e) {
        return false
    }
}
const DRIVE = "https://drive.google.com/file/d/"
const SPARKY_NET = "https://sparkythemascot.netlify.app/videos/"

// SIPL notebook pages, in order (cover first)
const SIPL: string[] = [
    FU + "e8o1OqG8w58YOnMr9sL00uwc.jpg",
    FU + "3EQWitg9U39qGA5k29l5q7qFj3w.jpg",
    FU + "iPXgahxjMWLhVECKRQDCEDX2US8.jpg",
    FU + "Tbw6LpPXUhty4Xfg4eLXEdIiAbM.jpg",
    FU + "2xoD4XxXhDHkX8mhb1qqQXnhA.jpg",
    FU + "DBOUs3FpwzMtsVXrpXd03Bvjtk.jpg",
    FU + "rzLSNHKm7jrghZuGaviL0llesM.jpg",
    FU + "OjehvVcOqlVaqQCRfzw7WNsI8.jpg",
    FU + "vTwYF5E05cgnPaCvR1O9YHZbFc.jpg",
    FU + "W2J6gs09uJHnOCBFuiKuB89KU1w.jpg",
    FU + "R5yPZ0Y2Y2DC5F67wLMvgQvGu0.jpg",
    FU + "Jj68WixWi85i6pKSEKiTImC4.jpg",
]

// small drawn screens for the Product Lab, so the two newest case studies show their own UI
const svgUri = (svg: string) => "data:image/svg+xml;utf8," + encodeURIComponent(svg)
const CONDUCTOR_SCREEN = svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 760' font-family='Arial,Helvetica,sans-serif'><rect width='360' height='760' fill='#fff'/><rect y='0' width='360' height='28' fill='#fff'/><text x='16' y='19' font-size='13' font-weight='700'>08:42</text><text x='344' y='19' font-size='13' font-weight='700' text-anchor='end'>GPS 4G 76%</text><rect y='28' width='360' height='40' fill='#fff' stroke='#0A0A0A' stroke-width='2'/><text x='16' y='54' font-size='15' font-weight='700'>Route 7</text><text x='344' y='54' font-size='14' text-anchor='end'>47 tickets</text><text x='16' y='92' font-size='12' font-weight='700' letter-spacing='1'>FROM · AUTO</text><text x='16' y='124' font-size='28' font-weight='700'>Prembazar</text><rect x='268' y='82' width='76' height='60' rx='12' fill='none' stroke='#0A0A0A' stroke-width='2'/><text x='306' y='118' font-size='13' font-weight='700' text-anchor='middle'>Change</text><line x1='0' y1='152' x2='360' y2='152' stroke='#0A0A0A' stroke-width='2'/><rect y='154' width='360' height='36' fill='#EFEFEF'/><text x='16' y='177' font-size='12' font-weight='700' letter-spacing='1'>TO · TAP DESTINATION</text>${[["Hijli More", "₹10", 0], ["Salua", "₹15", 1], ["Kalaikunda", "₹15", 0], ["Chowrangi", "₹20", 0], ["Keranitola", "₹25", 0], ["Medinipur", "₹30", 0]].map(([n, f, on], i) => `<g transform='translate(0 ${190 + i * 88})'><rect width='360' height='88' fill='${on ? "#FFD400" : "#fff"}'/><line x1='0' y1='0' x2='360' y2='0' stroke='#0A0A0A' stroke-width='2'/><text x='16' y='52' font-size='24' font-weight='700'>${n}</text><text x='344' y='54' font-size='30' font-weight='700' text-anchor='end'>${f}</text></g>`).join("")}</svg>`
)
const HR_SCREEN = svgUri(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 800' font-family='Arial,Helvetica,sans-serif'><rect width='1280' height='800' fill='#F4F6FA'/><rect width='220' height='800' fill='#14213D'/><text x='28' y='56' font-size='22' font-weight='700' fill='#fff'>Hiring Portal</text>${["Candidates", "Interviews", "Observation forms", "Reports"].map((t, i) => `<rect x='16' y='${96 + i * 52}' width='188' height='40' rx='8' fill='${i ? "transparent" : "#2D4A8A"}'/><text x='32' y='${122 + i * 52}' font-size='16' fill='#fff' opacity='${i ? 0.7 : 1}'>${t}</text>`).join("")}<text x='256' y='64' font-size='28' font-weight='700' fill='#14213D'>Graduate intake 2026</text>${[["Applied", 42, "#94A3B8"], ["Round 1", 18, "#3B82F6"], ["Round 2", 9, "#8B5CF6"], ["Round 3", 5, "#F59E0B"], ["Offer", 2, "#16A34A"]].map(([t, n, c], i) => `<g transform='translate(${256 + i * 200} 100)'><rect width='184' height='660' rx='14' fill='#fff'/><rect x='16' y='18' width='10' height='10' rx='5' fill='${c}'/><text x='34' y='28' font-size='15' font-weight='700' fill='#14213D'>${t}</text><text x='168' y='28' font-size='15' fill='#64748B' text-anchor='end'>${n}</text>${Array.from({ length: Math.max(1, 5 - i) }, (_, k) => `<rect x='14' y='${48 + k * 96}' width='156' height='84' rx='10' fill='#F8FAFC' stroke='#E2E8F0'/><rect x='28' y='${64 + k * 96}' width='${90 - k * 6}' height='10' rx='5' fill='#CBD5E1'/><rect x='28' y='${84 + k * 96}' width='64' height='8' rx='4' fill='#E2E8F0'/><rect x='28' y='${104 + k * 96}' width='48' height='16' rx='8' fill='${c}' opacity='.25'/>`).join("")}</g>`).join("")}</svg>`
)

// the Karma CSR book: 25 of its 69 landscape A4 pages, in order
const KARMA: string[] = [
    FU + "XreFNHHpkPtH9rI8M2qhJrBU0gA.jpg",
    FU + "6VnZyz54tA6qRzXgHzYPvgGSyE.jpg",
    FU + "SMSWNGw48tFmkkiFjCdZwRMbyyI.jpg",
    FU + "4ih782lxeaIgCZCKPT3Lr8fB3us.jpg",
    FU + "wQsHdFOuPDWUQfsOEdiH47Ika4.jpg",
    FU + "eKztObrv6si2RU69PcTpfZf0nk.jpg",
    FU + "xioUjPYoCckSUBfbQPnn2ajfmnw.jpg",
    FU + "tQZjXitheA5dYEO4l5xC4mx2wy8.jpg",
    FU + "Qupu8jGMeXRbyGHWwCDKXyjw.jpg",
    FU + "SNY0OaAqNYo6iYLpEHRPAsor16A.jpg",
    FU + "0ghXmsAY2dzSqsIZPPHPJlO2w.jpg",
    FU + "89rHsjaUM4DzgeMuaiwwAPUaGqc.jpg",
    FU + "8Wzxc4RWj7IwJvQqY79u4igTFBs.jpg",
    FU + "BV3GEhkQK0Daf14KsSBaSSxdmuQ.jpg",
    FU + "LNTSEbF7UMye1iOkonkJejCgoAg.jpg",
    FU + "CtQpnYnxfS9FWCZ1KxdJwLQf1k.jpg",
    FU + "8tX5HtC3tZs9SPxYsHLdLACYFo.jpg",
    FU + "en5PGfjkk7l7vcV3tGNF1S9Wfkc.jpg",
    FU + "HtAHtGJcWz2n84oW1g9ziD5Mloo.jpg",
    FU + "dsRRT6Rudpv58yMauOFKv0cf9g.jpg",
    FU + "kKxA4Bb518exvlibC8vaTTQ7i6s.jpg",
    FU + "bSAzqft8ZTLwYRXsfTZHKy683lE.jpg",
    FU + "UeTW9GmiGcxA2R58GyOh4GP3mNg.jpg",
    FU + "gWGl3G52kb8ap0GVIhYSo9zbDjM.jpg",
    FU + "vlIXBd9FNDKjdwqbgq3WQixrgk.jpg",
]

// layout: the wing bar sits just under the site navigation (measured as --inset) and the room photos
// start ROOM_GAP below that (CSS .eh-bgs uses the same numbers)
const ROOM_GAP = 64
const ZOOM = 2.8

// where the five picture frames sit inside the entrance photo (% of the photo), each showing one of the strongest pieces from its wing
const ENTRANCE_ART: { wing: WingId; image: string; l: number; t: number; w: number; h: number; pos?: string }[] = [
    { wing: "animation", image: FU + "tvuCUs4xEAsf1t58Jp7zNP9rk.png?scale-down-to=1024", l: 45.43, t: 22.32, w: 11.44, h: 16.69 },
    { wing: "brand", image: FU + "RQcO4EDf68E8uu6KCqmQbMUdaH0.png?scale-down-to=1024", l: 48.03, t: 48.7, w: 7.1, h: 15.78 },
    { wing: "poster", image: FU + "Le33vs6QJwrzV0a4AyPfgiLmdm8.png?scale-down-to=1024", l: 61.89, t: 22.1, w: 13.53, h: 38.56, pos: "50% 30%" },
    { wing: "product", image: CONDUCTOR_SCREEN, l: 82.47, t: 18.94, w: 8.46, h: 20.97, pos: "50% 0%" },
    { wing: "internship", image: FU + "KUTLBN0aoxTROG0xNqO39gEZU.jpg?scale-down-to=1024", l: 80.5, t: 48.82, w: 12.68, h: 15.11, pos: "50% 38%" },
]

// Drafted from the portfolio CMS and the CV; edit them in the Items control (or later in the CMS)
const DEFAULT_ITEMS: Item[] = [
    // the Poster Wing shows one folder per client; "All posters" opens every folder into single frames
    {
        wing: "poster",
        title: "Kshitij, IIT Kharagpur",
        image: FU + "VAC5toetwiNCNIblXrw2qZkucA.jpeg",
        gallery: [
            FU + "VAC5toetwiNCNIblXrw2qZkucA.jpeg",
            FU + "oSM6uknVe9WE7CGl1o08LkWAQ.png",
            FU + "5ezdwNyfNFgBhddxC0CkQmlHIuQ.png",
            FU + "Di4X5N1SUy363rMoXvPmI9YqOA.png",
        ],
        summary: "Event posters for Kshitij, IIT Kharagpur's techno-management fest: the illustrated 10 Days to Go countdown, the F1 simulator event, the introductory seminar and design team selection.",
        role: "Design and Media Head",
        tools: "Adobe Illustrator, Photoshop",
        year: "2024",
        client: "Kshitij, IIT Kharagpur",
    },
    {
        wing: "poster",
        title: "Sonepar · Campaigns",
        image: FU + "KUTLBN0aoxTROG0xNqO39gEZU.jpg",
        gallery: [
            FU + "KUTLBN0aoxTROG0xNqO39gEZU.jpg",
            FU + "MQKvoEe9Z3DoJgMY1YrxneqSUo.jpg",
            FU + "kVm2ytbnBP9lbmpFhBH7391iUU.jpg",
            FU + "yABwvHZsdLdDdw87CI0YeaNF4.jpg",
            FU + "1WJTFxefYVXCpPpK8l5v4oS6c0.png",
            FU + "JLvC680vKuSo7Blqbjb36HJ38.jpg",
            FU + "PWYIntWRbPNfzyoPT9dx8qqw.jpg",
        ],
        summary: "Engineer's Day posters in four colourways, a Navratri photo frame, and Top Employer and Star Performer photo-booth frames featuring Sparky.",
        role: "Marketing and Communication Intern",
        year: "2026",
        client: "Sonepar India",
    },
    {
        wing: "poster",
        title: "Sonepar · Events",
        image: FU + "iDLLkHQVWQ5gB1rgQLGWrfaG0.jpg",
        gallery: [
            FU + "iDLLkHQVWQ5gB1rgQLGWrfaG0.jpg",
            FU + "hUpOapdj8ez9JGMGschEPBzj84.jpg",
            FU + "eWXYA3127IoA85vkhcFUnj5f5K4.jpg",
            FU + "Cdi1KKy5zbExLCQyvJ8X9zaJO2I.jpg",
            FU + "1tokvnrfU55fEkqXrCTnK4QPgls.jpg",
            FU + "R3hsi0WMBOfmpWrQtT1mYUagp5U.jpg",
            FU + "iSXezSeOzlyyY0bYfx5i5cKuuRs.jpg",
        ],
        summary: "The “Fast & Forward” event branding with Sparky, and the Automation Expo booth, side panels and standees.",
        role: "Marketing and Communication Intern",
        year: "2026",
        client: "Sonepar India",
        caseStudy: "/case-study/sparky-mascot-redesign",
    },
    {
        wing: "poster",
        title: "Optibase · Returns Wealth",
        image: FU + "iW2TWYG1Rv4XifmJJbqrNPxpXUY.gif",
        gallery: [
            FU + "iW2TWYG1Rv4XifmJJbqrNPxpXUY.gif",
            FU + "kW0y8iJOpCF2afPjpMWmIji6c.png",
            FU + "iGFckcDf9ZXuQxiMNVCZfU.png",
            FU + "SL1qGLNbqcMBu3RORS7UcAWWad8.png",
            FU + "BoufTgiK1VuyaSuCK5zNSioAeY.png",
            FU + "v1TSwHbZTenqOPY5X0YjiLyRC8.png",
            FU + "WBjOtxsO6TeO2a9tfNLif8Tjmvk.png",
            FU + "XVhSl7z5q4H6L8jvfohyRpZn8.png",
            FU + "GHNfxOSgHi2MKSzlVS68TKS5ftw.png",
            FU + "y1nzJuAbR0tvwdmhvpwxPwWfC1c.png",
            FU + "t3S2UK5kOMchOhENHoOXJtv130.png",
        ],
        summary: "The animated app launch poster, the Psychology of Stock Picking carousel, Instagram posts and a free trade card for the Returns Wealth investing app.",
        role: "Design Intern",
        tools: "Adobe Photoshop, Illustrator, After Effects",
        client: "Optibase",
    },
    {
        wing: "poster",
        title: "PixyGrid · Fintech",
        image: FU + "DOSbPAf4FpOHG84eHsLKIxAiqL0.png",
        gallery: [
            FU + "DOSbPAf4FpOHG84eHsLKIxAiqL0.png",
            FU + "MYVZCSr9igyIzAq0w5qALDZP89A.png",
            FU + "2D5OxctLB5kkex9NZFxrsosTSdg.png",
            FU + "mnJwHKATP2YAVFahLTMoweIkJLw.png",
            FU + "wFDtLo8psxJHBeoc4OTYS81vhs.png",
            FU + "c5zTOSnTzbEujXoQajzLJhreTbc.png",
            FU + "hqIyuoPOUqXtu3bqBOnBeXLaWk.png",
            FU + "rLuHfGu89RE8IUTpAeNTaCs8i0.png",
            FU + "4Lg8tsJvtOCEvN2oENA6iv4xnP4.png",
            FU + "VMzr3Eo1BVFVgchaNbRzC5tzBrc.png",
            FU + "79NMfofd4qUwygcJ4H6QoHsb224.png",
            FU + "7KMb5cm89fs0aKGRo4LfyQIOYXQ.png",
            FU + "ccLVQP33lTf86DlJVp1MmGFo.png",
            FU + "jUUAwaUxD0eAjrjShDp4HRLqI.png",
            FU + "fOXk4PGqPTkp4Uyf9r5OBcx5xc.png",
            FU + "yGsywVG54bbqu9D2xe3BkOCby9Q.png",
            FU + "KjrA8FjK3STcaVuedzR2MZHCnc.png",
            FU + "4FyBtb1uYhjc8CTF8CbeMTFjSw.png",
            FU + "qmFjeNTXtl6K8UVrvuecl4kXyD4.png",
            FU + "LtSGTOAvSqpMSR1aBvQCJl0LiTE.png",
            FU + "NNllPH19Km0aSimiO87E82cfkM.png",
            FU + "WljMOStmdyjHUZygc1ozy13nFE.png",
            FU + "rmMZ66LsDFTg4arH7B9VvmweY.png",
            FU + "xR1cOr5fuJgcCNMATWSNYCd9LCE.png",
            FU + "HDEwuWKu7otoWqhMayeJO1ccE.png",
            FU + "YTSUFj4CbGt7hASlzMCymvUxqUs.png",
            FU + "NNgqyNjFwjS3JPIVNG7MzEgxm4.png",
        ],
        summary: "Campaign posters, display ads and data infographics for Dhan, Zerodha, Angel One and Indian Equity Research.",
        role: "Freelance designer, via PixyGrid",
        tools: "Adobe Photoshop, Illustrator, Canva",
        client: "Dhan, Zerodha, Angel One, Indian Equity Research",
    },
    {
        wing: "poster",
        title: "PixyGrid · Brands",
        image: FU + "PhxRPkmL4wP8PTFi8ZNjOWXDFtY.png",
        gallery: [
            FU + "PhxRPkmL4wP8PTFi8ZNjOWXDFtY.png",
            FU + "0s8ciGbkYVwrhomYyJOttgtZEA4.png",
            FU + "j38iBBySgM8gZDwgm3m6p0LoQfk.png",
            FU + "PN2kmS66tPk9DeKpZXnGOlZ2kM.png",
            FU + "bFLPSbzAne5JncgTPBW5gC2Q2Uk.png",
            FU + "9UlKzPzcDGfdSumk4ETjh3TYkU0.png",
            FU + "URpAwr0m3i94c66G7ptfladIc.png",
        ],
        summary: "Social posts and banners for Gold's Gym, Rao & Co, Infinity Driving School and the Vaarahi jewellery launch.",
        role: "Freelance designer, via PixyGrid",
        tools: "Adobe Photoshop, Illustrator, Canva",
        client: "Gold's Gym, Rao & Co, Infinity Driving School, Vaarahi",
    },
    {
        wing: "poster",
        title: "Zero1 by Zerodha",
        image: FU + "Le33vs6QJwrzV0a4AyPfgiLmdm8.png",
        gallery: [
            FU + "Le33vs6QJwrzV0a4AyPfgiLmdm8.png",
            FU + "iwUkhceeMAUuOXQSLtUee5f754E.png",
            FU + "BZKLIWXoSep9sZhthXlxfZUcM.png",
            FU + "WrQqzaf1vo18S6pZ0ltfFfNaU.png",
            FU + "YVdWAOnPQbZDgWCSkp8Zuuwg6Y.png",
            FU + "z8QIdXxqFgEh0DiIUGJEzLYvvj0.png",
            FU + "l0Eb7vHF22h1ujFKXvLeqWsk8A.png",
            FU + "VLMiMdi8WuMPMjgRzBkeUp5ek0.png",
        ],
        summary: "An 8-slide Instagram story about inflation, told through Shah Jahan and the Taj Mahal.",
        role: "Illustrator and copywriter",
        client: "Zero1 by Zerodha",
    },
    { wing: "poster", title: "Personal", image: FU + "krXdwACCv30WTXxyr0Nrqsiyd4Y.png", summary: "A festival illustration about the bond between a brother and a sister.", role: "Illustrator", tools: "Adobe Illustrator", year: "2024" },

    { wing: "animation", title: "30 Days to Go", image: FU + "1bwJmBV2l0ihlb8g67drgPW1kC0.png", link: DRIVE + "1tHp8OaYVf7uBsA1nzHXxkyr0GrwJbhNJ/view", summary: "First film of the Kshitij countdown series.", role: "2D animator", tools: "Adobe After Effects", year: "2024", client: "Kshitij, IIT Kharagpur" },
    { wing: "animation", title: "3 Days to Go", image: FU + "IKhlJMSbeltWKCRgmHMG2jNh47A.png", link: DRIVE + "1BMDNUVXxfT6ohPoi7Q9tO6wElsA6IO5s/view", summary: "Countdown film for the last three days before the fest.", role: "2D animator", tools: "Adobe After Effects", year: "2024", client: "Kshitij, IIT Kharagpur" },
    { wing: "animation", title: "2 Days to Go", image: FU + "an2N6svJPnjbrfYxQMAdZ328JzM.png", link: DRIVE + "1BrgBhIgs2x0aVmKqceWVYHmpeuvrRp8q/view", summary: "Countdown film, two days out.", role: "2D animator", tools: "Adobe After Effects", year: "2024", client: "Kshitij, IIT Kharagpur" },
    { wing: "animation", title: "0 Days to Go", image: FU + "cI88bHpNTbqQKW42G86nYiCWg0.png", link: DRIVE + "1I2PAX_0K0t3S9lKO6iTtAKdf0lIxdCsL/view", summary: "The opening-day film that closed the countdown series.", role: "2D animator", tools: "Adobe After Effects", year: "2024", client: "Kshitij, IIT Kharagpur" },
    { wing: "animation", title: "Mascot Reveal 2025", image: FU + "uJXaMPuKfQjxnOWPFflqdO8ZP44.png", link: DRIVE + "1xG3v8Fwmv_oT5t-ZTyPzhNF8w0yDXdkd/view", summary: "Reveal film introducing the Kshitij 2025 mascot.", role: "2D animator", tools: "Adobe After Effects", year: "2025", client: "Kshitij, IIT Kharagpur" },
    { wing: "animation", title: "Campa Ad Film", image: FU + "ux8HVoknjcfeSjMfaWzvMaqNgE.png", link: DRIVE + "1SZvXst3NmacA28ZexW7FZfcC7iM2Xa-l/view", summary: "Concept advertisement film for Campa.", role: "Director and editor", tools: "Adobe Premiere Pro, After Effects" },
    { wing: "animation", title: "Dragon Perfume", image: FU + "tvuCUs4xEAsf1t58Jp7zNP9rk.png", link: DRIVE + "1lIHmpqC5O7rOnceEsY2ojjA1WQkshBDr/view", summary: "Concept advertisement for a perfume brand.", role: "Director and editor", tools: "Adobe Premiere Pro, After Effects" },
    { wing: "animation", title: "Beast Life Ad Film", image: FU + "qmhl9oytcC6TFDgvmQBiZ79BssM.png", link: DRIVE + "10aYQPqlpe7Q1nWaa8kmWXHbL6Fv0PHa_/view", summary: "Concept advertisement film for Beast Life.", role: "Director and editor", tools: "Adobe Premiere Pro, After Effects" },
    { wing: "animation", title: "Sparky: Relaunch Film", video: SPARKY_NET + "relaunch.mp4", summary: "The film that relaunched Sonepar India's redesigned mascot.", role: "Script, direction and assembly", year: "2026", client: "Sonepar India", caseStudy: "/case-study/sparky-mascot-redesign" },
    { wing: "animation", title: "Sparky: Sustainability Ambassador", video: SPARKY_NET + "sustainability.mp4", summary: "World Environment Day film with Sparky as the sustainability ambassador.", role: "Script, animation and voiceover", year: "2026", client: "Sonepar India", caseStudy: "/case-study/sparky-mascot-redesign" },
    { wing: "animation", title: "Intern Introduction", video: SPARKY_NET + "intern-01.mp4", summary: "Introducing the incoming intern cohort, hosted by Sparky.", role: "Script and animation", year: "2026", client: "Sonepar India", caseStudy: "/case-study/sparky-mascot-redesign" },
    { wing: "animation", title: "Top Employer Announcement", video: SPARKY_NET + "top-employer.mp4", summary: "Employer-brand film announcing the Top Employers certification.", role: "Script and animation", year: "2026", client: "Sonepar India", caseStudy: "/case-study/sparky-mascot-redesign" },
    { wing: "animation", title: "Automation Expo 2026 · 01", video: SPARKY_NET + "automation-expo-01.mp4", summary: "Trade-marketing film for the Automation Expo at the Bombay Exhibition Centre.", role: "Script and animation", year: "2026", client: "Sonepar India", caseStudy: "/case-study/sparky-mascot-redesign" },
    { wing: "animation", title: "Automation Expo 2026 · 02", video: SPARKY_NET + "automation-expo-02.mp4", summary: "Second film in the Automation Expo campaign.", role: "Script and animation", year: "2026", client: "Sonepar India", caseStudy: "/case-study/sparky-mascot-redesign" },

    { wing: "brand", title: "Sparky Mascot Redesign", image: FU + "M1jzH6SoYpgOnN3D60t88vJ3w0.png", caseStudy: "/case-study/sparky-mascot-redesign", summary: "Redesign of Sonepar India's mascot, approved as an official brand element.", role: "Brand designer", tools: "Adobe Illustrator, Photoshop, AI tools", year: "2026", client: "Sonepar India", outcome: "Approved as an official brand element" },
    {
        wing: "brand",
        title: "Kshitij Brand World",
        image: FU + "oDeksNAA3auNn4srcEyOVdYwfmc.png",
        gallery: [FU + "oDeksNAA3auNn4srcEyOVdYwfmc.png", FU + "qJkGj6zVHBeVCwZVW1EDPPGn9c.jpeg", FU + "jrGOR7wY6AsZMtHik9qVYTkblE.png", FU + "mou9Sbefg4sBopu6ki2k3JJ9qE.png"],
        summary: "The Kronos mascot, the Kshitij 2025 logo and the fest's main and Gymkhana gates, designed while leading the design team.",
        role: "Design and Media Head",
        tools: "Adobe Illustrator, Photoshop",
        year: "2024–2025",
        client: "Kshitij, IIT Kharagpur",
        outcome: "Led a 45+ member design team",
    },
    {
        wing: "brand",
        title: "Zero1 by Zerodha · Inflation Story",
        image: FU + "Le33vs6QJwrzV0a4AyPfgiLmdm8.png",
        gallery: [
            FU + "Le33vs6QJwrzV0a4AyPfgiLmdm8.png",
            FU + "iwUkhceeMAUuOXQSLtUee5f754E.png",
            FU + "BZKLIWXoSep9sZhthXlxfZUcM.png",
            FU + "WrQqzaf1vo18S6pZ0ltfFfNaU.png",
            FU + "YVdWAOnPQbZDgWCSkp8Zuuwg6Y.png",
            FU + "z8QIdXxqFgEh0DiIUGJEzLYvvj0.png",
            FU + "l0Eb7vHF22h1ujFKXvLeqWsk8A.png",
            FU + "VLMiMdi8WuMPMjgRzBkeUp5ek0.png",
        ],
        summary: "An 8-slide Instagram comic: Shah Jahan meets a Gen-Z kid and learns the Taj Mahal's ₹3.2 crore would now be over ₹5,000 crore. It ends on: \"Mehngayi rukti nahi. Jo invest nahi karta… woh peeche reh jaata hai.\"",
        role: "Illustrator and copywriter",
        client: "Zero1 by Zerodha",
        outcome: "Carousel story post",
    },
    {
        wing: "brand",
        title: "Vaarahi",
        image: FU + "glvAdlW9B9aO3vM0wFHzlNCXTw.png",
        gallery: [FU + "glvAdlW9B9aO3vM0wFHzlNCXTw.png", FU + "VqZd6AFrYVbZ3geDOKGgKQ4E.png", FU + "0MPll5RdN7MYbXH7FYDa50Lhqw.png", FU + "QuVqFlcNCHc394c1k5vH5S3HSk.png", FU + "X0hRzUh7CDW9LmXyQJihNqS7ACQ.png", FU + "dl9JtRlVKSJ8jwWkaBmoihURQjc.png", FU + "URpAwr0m3i94c66G7ptfladIc.png"],
        caseStudy: "/case-study/vaarahi-brand-identity",
        summary: "Brand identity for a jewellery house: a peacock and the letter V in one gold line, with deep green packaging that stands apart from the usual red box.",
        role: "Freelance brand designer, via PixyGrid",
        tools: "Adobe Illustrator, Photoshop",
        client: "Vaarahi",
        outcome: "Logo, packaging, gift card and social poster",
    },
    {
        wing: "brand",
        title: "Altura Honey",
        image: FU + "RQcO4EDf68E8uu6KCqmQbMUdaH0.png",
        gallery: [FU + "RQcO4EDf68E8uu6KCqmQbMUdaH0.png", FU + "nRZcSGns67ABwx09ZqS38w23Bc.png", FU + "Kc7JAUrYyCG3IyzS4bU4N6ymv8.png", FU + "mdjyxs2uwXJTuQzrnzxbq4y2pZ4.png"],
        caseStudy: "/case-study/altura-honey",
        summary: "Name, logo and hexagonal packaging for a wild Himalayan honey sold in Paris and New York: a mountain, a bee and a honey drop in one mark.",
        role: "Brand and packaging designer",
        tools: "Adobe Illustrator, Photoshop",
        year: "2026",
        client: "General Championship (Social & Cultural), IIT Kharagpur",
        outcome: "3rd place in the brand design event",
    },
    {
        wing: "brand",
        title: "Merch Design Collection",
        image: FU + "FGoxUDjCy3edKDrvO1uRWO9Vo.png",
        gallery: [
            FU + "FGoxUDjCy3edKDrvO1uRWO9Vo.png",
            FU + "NKyWcLWU4CDWurLYiE0JY2Ww2b4.png",
            FU + "k6jF2JcRQnBi2elH6GwoIEuawU.png",
            FU + "6SenKSPAaqsQ8evUGeCJ2iFOF8.png",
            FU + "patQXy5UA1UCLUJ6kNZLoq8K6k.png",
            FU + "5PqWWhRT7nO0qVWAqKDZDLjGA.png",
            FU + "wsXKzS9cZuggSUEXW9bfRQlSZBY.png",
            FU + "iUkc9VyxoLub1iuJawpzl3uquY.png",
            FU + "Re2p4lOvRuvD3PS131dLqzorK7U.png",
            FU + "5M6J39FBptb1hhlz6l0tLDHl3H0.png",
        ],
        caseStudy: "/branding-1",
        summary: "T-shirts and hoodies, the Kshitij 2025 gate designs and logo work, collected in one place.",
        role: "Merch and brand designer",
        tools: "Adobe Illustrator, Photoshop",
        client: "Kshitij, IIT Kharagpur and others",
    },
    ...(KARMA.length
        ? [
              {
                  wing: "brand" as WingId,
                  title: "Karma · CSR Book",
                  image: KARMA[0],
                  book: KARMA,
                  summary: "Sonepar India's CSR book: education, skilling, health, sport for inclusion and the environment, told through the people behind each programme. Turn through 25 of its 69 pages.",
                  role: "Book designer",
                  year: "2026",
                  client: "Sonepar India",
                  outcome: "69-page CSR book",
              },
          ]
        : []),
    ...(SIPL.length
        ? [
              {
                  wing: "brand" as WingId,
                  title: "SIPL Notebook",
                  image: SIPL[0],
                  book: SIPL,
                  notebook: true,
                  summary: "A spiral notebook for Sonepar India: the company story, key figures, purpose and values, partner brands, Masibus products and the office map, with ruled pages for notes. Flip through it.",
                  role: "Notebook designer",
                  year: "2026",
                  client: "Sonepar India",
                  outcome: "Branded notebook for employees and visitors",
              },
          ]
        : []),
    { wing: "brand", title: "Sonepar Excellence Award", image: FU + "PBrEgKURfzfoEPtpwX67tvyNk.jpg", summary: "Trophy design for Sonepar India's Support Function Excellence Award: a lit bulb wired into the Sonepar ring.", role: "Designer", year: "2026", client: "Sonepar India" },
    { wing: "brand", title: "Swadeshi Bytes Logo", image: FU + "75Zcm9dUfl7pjlM2aroSZIenPc.png", summary: "Logo design for Swadeshi Bytes.", role: "Logo designer", tools: "Adobe Illustrator", client: "Swadeshi Bytes" },
    { wing: "brand", title: "Patel Hall T-shirt", image: FU + "uMLufXxkacozRPZLLkC5znbjhU.jpeg", summary: "T-shirt design for Patel Hall of Residence, IIT Kharagpur.", role: "Apparel designer", tools: "Adobe Illustrator", client: "Patel Hall, IIT Kharagpur" },
    { wing: "brand", title: "Competition Logo", image: FU + "KannsXOlRglftS9TMNY3t9AYVY.png", summary: "Logo made for a design competition.", role: "Logo designer", tools: "Adobe Illustrator", client: "Design competition" },

    { wing: "product", title: "Kshitij 2025 3D Website", image: FU + "yOpm7KtRMpUn9pxZutaEMyLgSeQ.png", caseStudy: "/case-study/kshitij-2025-website", link: DRIVE + "1WAleHI__tbjAIZDphnGRzUkaBPhgRqm_/view", device: "laptop", summary: "The Kshitij 2025 homepage as a spaceship you board: a tunnel rush, a hall with a KTJ hologram and six stations, inspired by Raftaar's “Dehshat Ho”. Ideation and design by me, built by the Kshitij tech team. Take the tour in the case study.", role: "Ideation and design", tools: "Figma", year: "2025", client: "Kshitij, IIT Kharagpur", outcome: "50K+ users, retention up 35%" },
    { wing: "product", title: "Sparky AI Assistant", device: "laptop", image: FU + "M1jzH6SoYpgOnN3D60t88vJ3w0.png", fit: "contain", caseStudy: "/case-study/sparky-ai-assistant", summary: "Sonepar India's first website assistant: answers product questions from the whole catalogue, refuses to guess, and turns visitors into sales leads in two taps. Includes the Sparky Hub admin panel.", role: "Product designer and builder", tools: "Figma, Python, n8n, vector search", year: "2026", client: "Sonepar India", outcome: "~92% answer accuracy, live in pilot" },
    { wing: "product", title: "Conductor Ticketing", device: "phone", image: CONDUCTOR_SCREEN, caseStudy: "/case-study/conductor-ticketing", summary: "A ticketing screen for bus conductors that works with one thumb on a moving bus and stays readable in direct sun: two taps to a ticket instead of four or five button presses.", role: "Product designer", tools: "Figma", year: "2026", client: "Nielsen design assignment", outcome: "Two taps to a ticket, clickable prototype" },
    { wing: "product", title: "HR Hiring Portal", device: "laptop", image: HR_SCREEN, caseStudy: "/case-study/hr-hiring-portal", summary: "A login-gated portal that replaced Sonepar India's paper Personal Observation Form: three interview rounds, scheduling, shortlists, candidate emails and printable reports for about 500 candidates a year.", role: "Product designer", tools: "Figma", year: "2026", client: "Sonepar India", outcome: "Paper forms replaced for ~500 candidates a year" },
    { wing: "product", title: "Returns Wealth App", device: "phone", summary: "Investment app flows for Returns Wealth.", role: "Product designer", tools: "Figma", client: "Optibase", outcome: "Drop-off down 22%, offer uptake up 35%" },

    {
        wing: "internship",
        title: "Sonepar India",
        image: FU + "XreFNHHpkPtH9rI8M2qhJrBU0gA.jpg",
        gallery: [
            FU + "M1jzH6SoYpgOnN3D60t88vJ3w0.png",
            FU + "XreFNHHpkPtH9rI8M2qhJrBU0gA.jpg",
            FU + "e8o1OqG8w58YOnMr9sL00uwc.jpg",
            FU + "KUTLBN0aoxTROG0xNqO39gEZU.jpg",
            FU + "iDLLkHQVWQ5gB1rgQLGWrfaG0.jpg",
            FU + "1tokvnrfU55fEkqXrCTnK4QPgls.jpg",
            FU + "R3hsi0WMBOfmpWrQtT1mYUagp5U.jpg",
            FU + "PBrEgKURfzfoEPtpwX67tvyNk.jpg",
            FU + "JLvC680vKuSo7Blqbjb36HJ38.jpg",
            FU + "PWYIntWRbPNfzyoPT9dx8qqw.jpg",
            FU + "1WJTFxefYVXCpPpK8l5v4oS6c0.png",
            FU + "MQKvoEe9Z3DoJgMY1YrxneqSUo.jpg",
        ],
        summary: "Marketing and Communication Intern, May to August 2026: the website's AI assistant, the HR hiring portal, the Sparky platform, AI films, the Karma CSR book and campaign posters.",
        role: "Marketing and Communication Intern",
        tools: "Figma, Adobe Creative Suite, AI video tools",
        year: "May – Aug 2026",
        client: "Sonepar India, Gurugram",
        intern: {
            company: "Sonepar India",
            role: "Marketing and Communication Intern",
            dates: "18 May – 17 August 2026",
            place: "Gurugram, Haryana",
            summary: "Three months in the Marketing and Communication team of Sonepar India, the Indian arm of a global B2B electrical distributor. I worked across product, brand and content: from the website's first AI assistant and an HR portal to the company mascot, its films and its print work.",
            metrics: [
                ["6", "projects named in my experience letter"],
                ["1st", "AI assistant on the company website"],
                ["~500", "candidates a year on the HR portal"],
                ["6", "Sparky films"],
            ],
            projects: [
                { title: "Chatbot development and implementation", text: "Designed and shipped Sparky, the website's first AI assistant: it answers from the product catalogue, refuses to guess, and hands sales a lead in two taps.", link: "/case-study/sparky-ai-assistant", label: "Read the case study" },
                { title: "HR hiring portal development", text: "Turned the paper Personal Observation Form into a login-gated portal with role-based screens, scheduling, candidate emails and printable reports.", link: "/case-study/hr-hiring-portal", label: "Read the case study" },
                { title: "Sparky platform development and support", text: "Redesigned the Sparky mascot into an approved brand element and supported it across events, booths and campaigns.", link: "/case-study/sparky-mascot-redesign", label: "Read the case study" },
                { title: "AI video generation", text: "Scripted and produced the Sparky films: the relaunch, World Environment Day, the intern introduction, Top Employers and the Automation Expo.", link: "#animation", label: "Watch the films" },
                { title: "Creative content creation", text: "The 69-page Karma CSR book, the SIPL notebook, festival campaigns and photo-booth frames.", link: "#brand", label: "See the books" },
                { title: "Professional poster design", text: "Engineer's Day posters, the Navratri frame, the Fast & Forward event branding and the Automation Expo booth.", link: "#poster", label: "See the posters" },
            ],
            letter: FU + "E2paJlJCT5BroHw7RSYWols1rW4.jpg",
            letterNote: "Issued by Sonepar India on 17 August 2026. It confirms the internship from 18 May to 17 August 2026 in Marketing and Communication and lists the six projects above.",
        },
    },
    {
        wing: "internship",
        title: "PixyGrid",
        image: FU + "DOSbPAf4FpOHG84eHsLKIxAiqL0.png",
        gallery: [
            FU + "DOSbPAf4FpOHG84eHsLKIxAiqL0.png",
            FU + "glvAdlW9B9aO3vM0wFHzlNCXTw.png",
            FU + "PhxRPkmL4wP8PTFi8ZNjOWXDFtY.png",
            FU + "MYVZCSr9igyIzAq0w5qALDZP89A.png",
            FU + "VqZd6AFrYVbZ3geDOKGgKQ4E.png",
            FU + "2D5OxctLB5kkex9NZFxrsosTSdg.png",
            FU + "0s8ciGbkYVwrhomYyJOttgtZEA4.png",
            FU + "mnJwHKATP2YAVFahLTMoweIkJLw.png",
            FU + "URpAwr0m3i94c66G7ptfladIc.png",
            FU + "wFDtLo8psxJHBeoc4OTYS81vhs.png",
            FU + "j38iBBySgM8gZDwgm3m6p0LoQfk.png",
            FU + "c5zTOSnTzbEujXoQajzLJhreTbc.png",
            FU + "PN2kmS66tPk9DeKpZXnGOlZ2kM.png",
            FU + "hqIyuoPOUqXtu3bqBOnBeXLaWk.png",
            FU + "bFLPSbzAne5JncgTPBW5gC2Q2Uk.png",
            FU + "rLuHfGu89RE8IUTpAeNTaCs8i0.png",
            FU + "9UlKzPzcDGfdSumk4ETjh3TYkU0.png",
            FU + "4Lg8tsJvtOCEvN2oENA6iv4xnP4.png",
            FU + "VMzr3Eo1BVFVgchaNbRzC5tzBrc.png",
            FU + "79NMfofd4qUwygcJ4H6QoHsb224.png",
            FU + "7KMb5cm89fs0aKGRo4LfyQIOYXQ.png",
            FU + "ccLVQP33lTf86DlJVp1MmGFo.png",
            FU + "jUUAwaUxD0eAjrjShDp4HRLqI.png",
            FU + "fOXk4PGqPTkp4Uyf9r5OBcx5xc.png",
            FU + "yGsywVG54bbqu9D2xe3BkOCby9Q.png",
            FU + "KjrA8FjK3STcaVuedzR2MZHCnc.png",
            FU + "4FyBtb1uYhjc8CTF8CbeMTFjSw.png",
            FU + "qmFjeNTXtl6K8UVrvuecl4kXyD4.png",
            FU + "LtSGTOAvSqpMSR1aBvQCJl0LiTE.png",
            FU + "NNllPH19Km0aSimiO87E82cfkM.png",
            FU + "WljMOStmdyjHUZygc1ozy13nFE.png",
            FU + "rmMZ66LsDFTg4arH7B9VvmweY.png",
            FU + "xR1cOr5fuJgcCNMATWSNYCd9LCE.png",
            FU + "HDEwuWKu7otoWqhMayeJO1ccE.png",
            FU + "YTSUFj4CbGt7hASlzMCymvUxqUs.png",
            FU + "NNgqyNjFwjS3JPIVNG7MzEgxm4.png",
        ],
        summary: "Visual Design Intern, February to April 2026: fintech campaigns for Dhan, Zerodha, Angel One and Indian Equity Research, the Vaarahi jewellery identity and posts for local brands.",
        role: "Visual Design Intern",
        tools: "Adobe Photoshop, Illustrator, Canva",
        year: "Feb – Apr 2026",
        client: "PixyGrid, remote",
        intern: {
            company: "PixyGrid",
            role: "Visual Design Intern",
            dates: "February – April 2026",
            place: "Remote",
            summary: "A design agency internship where I took clients from onboarding to delivery across fintech, jewellery and service brands, adapting each piece to the client's own visual style.",
            metrics: [
                ["35+", "branding visuals"],
                ["4", "fintech and leisure clients"],
                ["1", "full brand identity"],
            ],
            projects: [
                { title: "Fintech campaigns", text: "Campaign posters, display ads and data infographics for Dhan, Zerodha, Angel One and Indian Equity Research.", link: "#poster", label: "See the posters" },
                { title: "Vaarahi brand identity", text: "A peacock and the letter V in one gold line, with deep green packaging, a gift card and the launch poster.", link: "/case-study/vaarahi-brand-identity", label: "Read the case study" },
                { title: "Local brand creatives", text: "Social posts and banners for Gold's Gym, Rao & Co and Infinity Driving School.", link: "#poster", label: "See the posters" },
            ],
        },
    },
    {
        wing: "internship",
        title: "Optibase · Returns Wealth",
        image: FU + "iW2TWYG1Rv4XifmJJbqrNPxpXUY.gif",
        gallery: [
            FU + "iW2TWYG1Rv4XifmJJbqrNPxpXUY.gif",
            FU + "kW0y8iJOpCF2afPjpMWmIji6c.png",
            FU + "iGFckcDf9ZXuQxiMNVCZfU.png",
            FU + "SL1qGLNbqcMBu3RORS7UcAWWad8.png",
            FU + "BoufTgiK1VuyaSuCK5zNSioAeY.png",
            FU + "v1TSwHbZTenqOPY5X0YjiLyRC8.png",
            FU + "WBjOtxsO6TeO2a9tfNLif8Tjmvk.png",
            FU + "XVhSl7z5q4H6L8jvfohyRpZn8.png",
            FU + "GHNfxOSgHi2MKSzlVS68TKS5ftw.png",
            FU + "y1nzJuAbR0tvwdmhvpwxPwWfC1c.png",
            FU + "t3S2UK5kOMchOhENHoOXJtv130.png",
        ],
        summary: "Experience Design Intern, May to July 2025: app flows, landing pages and the launch campaign for the Returns Wealth investing app.",
        role: "Experience Design Intern",
        tools: "Figma, Adobe Photoshop, Illustrator, After Effects",
        year: "May – Jul 2025",
        client: "Optibase Financial, Gurugram",
        intern: {
            company: "Optibase Financial (Returns Wealth)",
            role: "Experience Design Intern",
            dates: "May – July 2025",
            place: "Gurugram, Haryana",
            summary: "I redesigned app flows and landing pages for Returns Wealth, an investing app, and turned market insights into clear stories for first-time investors.",
            metrics: [
                ["−22%", "drop-off"],
                ["+35%", "₹300 offer uptake"],
                ["+40%", "engagement"],
                ["60+", "carousels, reels and visuals"],
            ],
            projects: [
                { title: "App flows and landing pages", text: "Redesigned the app's user flows and landing pages through design reviews with the product team." },
                { title: "Launch and social campaign", text: "The animated launch poster, the Psychology of Stock Picking carousel and educational visuals for investors.", link: "#poster", label: "See the posters" },
            ],
        },
    },
]

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
// page shapes: the Karma book is landscape A4, the SIPL notebook is a tall portrait page
const BOOK_ASPECT = 1.414
const NOTE_ASPECT = 0.636
// Framer's image CDN serves smaller versions on request; big posters would otherwise load at full size
const sized = (src: string | undefined, w: number) => (src && src.startsWith(FU) && !src.includes("?") ? `${src}?scale-down-to=${w}` : src || "")

// bottom edge of the fixed or sticky site bars stacked over the top of the page (0 when there are none):
// the site navigation, and anything fixed directly under it such as a category row
function fixedTop(own: HTMLElement | null) {
    if (typeof document === "undefined") return 0
    let bottom = 0
    for (let pass = 0; pass < 4; pass++) {
        const y = bottom + 4
        let next = bottom
        for (const x of [0.2, 0.35, 0.5, 0.65, 0.8]) {
            let el = document.elementFromPoint(window.innerWidth * x, y) as HTMLElement | null
            while (el && el !== document.body) {
                if (own && (own.contains(el) || el.contains(own))) break
                const pos = getComputedStyle(el).position
                if (pos === "fixed" || pos === "sticky") {
                    const r = el.getBoundingClientRect()
                    if (r.top <= y && r.bottom > y && r.bottom < window.innerHeight * 0.4) next = Math.max(next, r.bottom)
                    break
                }
                el = el.parentElement
            }
        }
        if (next <= bottom) break
        bottom = next
    }
    return Math.round(bottom)
}
const isMp4 = (s?: string) => !!s && /\.mp4(\?|$)/i.test(s)

// a short mechanical switch clack, made with Web Audio so there is no sound file to load
function clack() {
    try {
        const AC = (window as any).AudioContext || (window as any).webkitAudioContext
        if (!AC) return
        const ac = new AC()
        const len = Math.floor(ac.sampleRate * 0.06)
        const buf = ac.createBuffer(1, len, ac.sampleRate)
        const d = buf.getChannelData(0)
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6)
        const src = ac.createBufferSource()
        const f = ac.createBiquadFilter()
        f.type = "bandpass"
        f.frequency.value = 2200
        const g = ac.createGain()
        g.gain.value = 0.5
        src.buffer = buf
        src.connect(f).connect(g).connect(ac.destination)
        src.start()
        window.setTimeout(() => ac.close(), 400)
    } catch (e) {}
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

/**
 * Exhibition Hall: the portfolio as a dark gallery. The page pins and scrolling walks sideways through five
 * wings; each piece lights up under its spotlight as it reaches the middle. Click a piece for a close-up.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 800
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function ExhibitionHall(props: Props) {
    const {
        heading = "The Work Gallery",
        intro = "Five wings, one designer. Walk through posters, films, brands, products and internship work. Click any piece for the full story.",
        items: itemsProp,
        contactLink = "/contact-us",
        bgEntrance = ROOM("PikmceQFVeidEhV02B2IpVm9ZZU.png"),
        bgPoster = ROOM("VVaxnpJJmd5VkSmHHJLmucPUijM.png"),
        bgCinema = ROOM("6LPboue5XtHQ1DK70svzQqlC8.png"),
        bgBrand = ROOM("dF857QrEscGw6pmX0yMdyosSdRw.png"),
        bgProduct = ROOM("GrmBxUXjEXow87JQ2IZksMkBOzw.png"),
        bgArchive = ROOM("1eOi40cO9BzKjHmQVdBGCccpgE.png"),
        lightsOff = true,
        vaarahiVideo,
        style,
    } = props
    // one room photo per wing; the entrance photo shows until the first wing reaches the middle
    const wingBg: Record<WingId, string> = { poster: bgPoster, animation: bgCinema, brand: bgBrand, product: bgProduct, internship: bgArchive }
    const hasBg = !!(bgEntrance || bgPoster || bgCinema || bgBrand || bgProduct || bgArchive)
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const go = useGo()

    const items = useMemo(() => {
        const list = itemsProp && itemsProp.length ? itemsProp : DEFAULT_ITEMS
        const extra: Item[] = vaarahiVideo
            ? [{ wing: "animation", title: "Vaarahi Logo Reveal", video: vaarahiVideo, image: FU + "glvAdlW9B9aO3vM0wFHzlNCXTw.png", summary: "Logo reveal animation for the Vaarahi jewellery brand.", role: "Brand designer and animator", client: "Vaarahi", caseStudy: "/case-study/vaarahi-brand-identity" }]
            : []
        return [...list, ...extra].filter((i) => i && i.title)
    }, [itemsProp, vaarahiVideo])
    // Poster Wing: folders by client, or every poster as its own frame, optionally narrowed to one folder
    const [posterView, setPosterView] = useState<"folders" | "all">("folders")
    const [posterPick, setPosterPick] = useState("all")
    const posterFolders = useMemo(() => items.filter((i) => i.wing === "poster"), [items])
    const posterCount = posterFolders.reduce((n, f) => n + (f.gallery?.length || (f.image ? 1 : 0)), 0)
    const byWing = useMemo(
        () =>
            WINGS.map((w) => {
                let list = items.filter((i) => (i.wing || "poster") === w.id)
                if (w.id === "poster" && posterView === "all")
                    list = list
                        .filter((f) => posterPick === "all" || f.title === posterPick)
                        .flatMap((f) => {
                            const pics = f.gallery && f.gallery.length ? f.gallery : f.image ? [f.image] : []
                            return pics.map((src, k) => ({ ...f, title: pics.length > 1 ? `${f.title} · ${k + 1}` : f.title, image: src, gallery: undefined }))
                        })
                return { ...w, items: list }
            }).filter((w) => w.items.length),
        [items, posterView, posterPick]
    )
    // the order the close-up steps through: whatever the hall is showing right now
    const navList = useMemo(() => byWing.flatMap((w) => w.items), [byWing])
    const stripRef = useRef<HTMLDivElement>(null)

    const root = useRef<HTMLDivElement>(null)
    const stage = useRef<HTMLDivElement>(null)
    const track = useRef<HTMLDivElement>(null)
    const [travel, setTravel] = useState(0)
    const [narrow, setNarrow] = useState(false)
    const [quick, setQuick] = useState(false)
    const [filter, setFilter] = useState<WingId | "all">("all")
    const [active, setActive] = useState(-1)
    const [stageW, setStageW] = useState(0)
    const [lights, setLights] = useState<"off" | "flicker" | "on">(() => (lightsOff && !onCanvas && !litBefore() ? "off" : "on"))
    // the first visit starts zoomed in on the wall switch; after that the switch just toggles the lights
    const [firstVisit, setFirstVisit] = useState(() => lightsOff && !onCanvas && !litBefore())
    const [stageH, setStageH] = useState(0)
    // height of the site navigation if it is fixed over the top of the page, so nothing hides under it
    const [inset, setInset] = useState(0)
    const insetRef = useRef(0)
    const [open, setOpen] = useState<Item | null>(null)
    const [film, setFilm] = useState(0)
    const [aspects, setAspects] = useState<Record<string, number>>({})
    const [shot, setShot] = useState(0)
    // flipbook: the open spread and the page that is mid-turn
    const [spread, setSpread] = useState(0)
    const [turning, setTurning] = useState<"next" | "prev" | null>(null)
    // internship close-up: "what I did" first, then the work; the letter opens on top
    const [iview, setIview] = useState<"about" | "work">("about")
    const [letter, setLetter] = useState(false)
    useEffect(() => {
        setShot(0)
        setSpread(0)
        setTurning(null)
        setIview("about")
        setLetter(false)
    }, [open])
    const bookViews = (pages: string[]) => (narrow ? pages.length : Math.floor(pages.length / 2) + 1)
    const turn = (dir: "next" | "prev") => {
        const pages = open?.book || []
        if (turning || !pages.length) return
        if (dir === "next" && spread >= bookViews(pages) - 1) return
        if (dir === "prev" && spread <= 0) return
        setTurning(dir)
    }
    const turnDone = () => {
        setSpread((n) => n + (turning === "next" ? 1 : -1))
        setTurning(null)
    }

    const grid = quick || narrow
    const films = byWing.find((w) => w.id === "animation")?.items || []

    useEffect(() => {
        const el = root.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 760))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // the hall is as tall as the sideways distance it has to travel, plus one screen
    useLayoutEffect(() => {
        if (grid || onCanvas) return
        const measure = () => {
            const t = track.current
            const s = stage.current
            if (s) {
                setStageW(s.clientWidth)
                setStageH(s.clientHeight)
            }
            if (t && s) setTravel(Math.max(0, t.scrollWidth - s.clientWidth))
            setInset((insetRef.current = fixedTop(root.current)))
        }
        measure()
        const late = window.setTimeout(measure, 800)
        if (typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(measure)
        if (track.current) ro.observe(track.current)
        if (stage.current) ro.observe(stage.current)
        return () => {
            ro.disconnect()
            window.clearTimeout(late)
        }
    }, [grid, onCanvas, byWing.length])

    // scroll walks the track sideways (eased by time); pieces near the middle light up
    useEffect(() => {
        if (grid || onCanvas) return
        let raf = 0
        let x = -1
        let last = performance.now()
        let wingNow = -1
        let frame = 0
        const tick = (now: number) => {
            const dt = Math.min(0.1, (now - last) / 1000)
            last = now
            const r = root.current
            const t = track.current
            const s = stage.current
            if (r && t && s) {
                const rect = r.getBoundingClientRect()
                const span = Math.max(1, rect.height - window.innerHeight)
                const target = clamp01(-rect.top / span) * travel
                x = x < 0 ? target : x + (target - x) * (1 - Math.exp(-dt * 8))
                if (Math.abs(target - x) < 0.05) x = target
                t.style.transform = `translate3d(${-x.toFixed(2)}px,0,0)`
                const mid = s.clientWidth / 2
                const reach = s.clientWidth * 0.42
                t.querySelectorAll<HTMLElement>("[data-lit]").forEach((el) => {
                    const c = el.offsetLeft + el.offsetWidth / 2 - x
                    el.style.setProperty("--lit", clamp01(1 - Math.abs(c - mid) / reach).toFixed(3))
                })
                let w = -1
                t.querySelectorAll<HTMLElement>("[data-wing]").forEach((el, i) => {
                    if (el.offsetLeft - x <= s.clientWidth * 0.45) w = i
                    const sign = el.firstElementChild as HTMLElement | null
                    if (sign) {
                        const pinAt = 24
                        const maxShift = el.offsetWidth - sign.offsetLeft - sign.offsetWidth - 140
                        const shift = Math.min(Math.max(0, pinAt - (el.offsetLeft - x + sign.offsetLeft)), Math.max(0, maxShift))
                        sign.style.transform = shift ? `translate3d(${shift.toFixed(1)}px,0,0)` : ""
                    }
                })
                // the site bars can hide or change height while scrolling; re-check them now and then
                if (++frame % 30 === 0) {
                    const top = fixedTop(r)
                    if (top !== insetRef.current) setInset((insetRef.current = top))
                }
                if (introRef.current && lightsRef.current === "off" && target > 40) switchOn(true)
                if (w !== wingNow) setActive((wingNow = w))
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [grid, onCanvas, travel])

    // the film strip scrolls sideways with the wheel or trackpad while it still has room, then hands the scroll back to the page
    useEffect(() => {
        const s = stripRef.current
        if (!s) return
        const onWheel = (e: WheelEvent) => {
            const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
            const max = s.scrollWidth - s.clientWidth
            if (max <= 0) return
            if ((d > 0 && s.scrollLeft < max - 1) || (d < 0 && s.scrollLeft > 0)) {
                s.scrollLeft += d
                e.preventDefault()
            }
        }
        s.addEventListener("wheel", onWheel, { passive: false })
        return () => s.removeEventListener("wheel", onWheel)
    }, [grid, onCanvas, films.length])

    // close-up: Esc closes, arrows step through the pieces
    useEffect(() => {
        if (!open) return
        const list = navList
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(null)
            if (open.book && (e.key === "ArrowRight" || e.key === "ArrowLeft")) return turn(e.key === "ArrowRight" ? "next" : "prev")
            const i = list.indexOf(open)
            if (e.key === "ArrowRight") setOpen(list[(i + 1) % list.length])
            if (e.key === "ArrowLeft") setOpen(list[(i - 1 + list.length) % list.length])
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open, navList, spread, turning])

    // lights-off entrance: once per visit, the hall starts dark until the switch is flipped (or the visitor scrolls on)
    const lightsRef = useRef(lights)
    lightsRef.current = lights
    const introRef = useRef(firstVisit)
    introRef.current = firstVisit
    const switchOn = (quiet?: boolean) => {
        if (lightsRef.current !== "off") return
        lightsRef.current = "flicker"
        setLights("flicker")
        try {
            sessionStorage.setItem(LIT_KEY, "1")
        } catch (e) {}
        if (!quiet) clack()
        window.setTimeout(() => {
            setLights("on")
            setFirstVisit(false)
        }, 1200)
    }
    const toggleLights = () => {
        if (lightsRef.current === "off") return switchOn()
        if (lightsRef.current === "on") {
            clack()
            setLights("off")
        }
    }

    // the entrance photo sits on the floor of the hall, sized so all five frames show to the right of the text;
    // computed here so the frames, the switch, the text and the zoom line up with it exactly
    const roomTop = inset + ROOM_GAP
    const bh = Math.max(1, stageH - roomTop)
    const bw = bh * 2
    const box = { left: Math.min(0, stageW - bw * 0.97), top: stageH - bh, width: bw, height: bh }
    const textLeft = Math.max(48, stageW * 0.06)
    const framesLeft = box.left + bw * 0.4543
    const plateW = Math.max(22, bw * 0.02)
    const sw = { x: Math.max(textLeft + 300, (textLeft + 340 + framesLeft) / 2), y: box.top + bh * 0.6 }
    const zoomed = firstVisit && lights !== "on"
    const cam: CSSProperties = zoomed && stageW
        ? { transformOrigin: `${sw.x}px ${sw.y}px`, transform: `translate(${stageW / 2 - sw.x}px, ${stageH / 2 - sw.y}px) scale(${ZOOM})` }
        : { transformOrigin: `${sw.x}px ${sw.y}px`, transform: "none" }

    const jumpTo = (i: number) => {
        if (grid) {
            setFilter(byWing[i].id)
            return
        }
        const r = root.current
        const el = track.current?.querySelectorAll<HTMLElement>("[data-wing]")[i]
        if (!r || !el || !travel) return
        const span = r.getBoundingClientRect().height - window.innerHeight
        const p = clamp01((el.offsetLeft - 40) / travel)
        window.scrollTo({ top: window.scrollY + r.getBoundingClientRect().top + p * span, behavior: "smooth" })
    }

    // links like /portfolio-2#poster walk straight to that wing, the old Home anchors included
    const jumpRef = useRef(jumpTo)
    jumpRef.current = jumpTo
    const hashDone = useRef(false)
    useEffect(() => {
        if (onCanvas || (!grid && !travel)) return
        const ALIAS: Record<string, WingId> = {
            poster: "poster",
            "poster-design": "poster",
            animation: "animation",
            "2d-animation": "animation",
            brand: "brand",
            branding: "brand",
            product: "product",
            internship: "internship",
        }
        const go = () => {
            const id = ALIAS[decodeURIComponent(window.location.hash.slice(1)).toLowerCase()]
            const i = id ? byWing.findIndex((w) => w.id === id) : -1
            if (i < 0) return
            switchOn(true)
            // pictures still loading widen the hall, so walk there again once they have settled
            window.setTimeout(() => jumpRef.current(i), 60)
            window.setTimeout(() => jumpRef.current(i), 1600)
        }
        if (!hashDone.current) {
            hashDone.current = true
            go()
        }
        window.addEventListener("hashchange", go)
        return () => window.removeEventListener("hashchange", go)
    }, [onCanvas, grid, travel, byWing])

    const onImg = (key: string) => (e: React.SyntheticEvent<HTMLImageElement>) => {
        const im = e.currentTarget
        if (!im.naturalWidth || aspects[key]) return
        const a = Math.min(1.8, Math.max(0.55, im.naturalWidth / im.naturalHeight))
        setAspects((s) => ({ ...s, [key]: a }))
    }

    const height = onCanvas ? 800 : grid ? undefined : `calc(100vh + ${travel}px)`

    // plain render helpers (called, not mounted) so pieces keep their DOM between renders
    const Book = ({ it, color }: { it: Item; color: string }) => (
        <button key={it.title} className={"eh-art eh-bookobj" + (it.notebook ? " is-note" : "")} data-lit style={{ ["--wc" as any]: color, ["--pa" as any]: it.notebook ? NOTE_ASPECT : BOOK_ASPECT }} onClick={() => setOpen(it)} aria-label={`Open the ${it.notebook ? "notebook" : "book"} ${it.title}`}>
            <span className="eh-cone" aria-hidden="true" />
            <span className="eh-book3d" aria-hidden="true">
                <span className="eh-bcover" style={{ backgroundImage: `url("${sized(it.image, 1024)}")` }} />
                <span className="eh-bspine">
                    <b>{it.title}</b>
                </span>
                <span className="eh-bpages" />
                <span className="eh-bback" />
                {it.notebook && <span className="eh-bcoil" />}
                {it.notebook && <span className="eh-bband" />}
            </span>
            <span className="eh-count-badge eh-bbadge">{it.book!.length} pages</span>
            <span className="eh-plaque">
                <b>{it.title}</b>
                <span>{[it.year, it.client].filter(Boolean).join(" · ")}</span>
            </span>
        </button>
    )

    const Art = ({ it, idx, color }: { it: Item; idx: number; color: string }) => {
        if (it.book && it.book.length) return Book({ it, color })
        const a = aspects[it.title] || 0.78
        return (
            <button key={it.title} className={"eh-art" + (it.gallery && it.gallery.length > 1 ? " is-folder" : "")} data-lit style={{ ["--a" as any]: a, ["--wc" as any]: color }} onClick={() => setOpen(it)} aria-label={`Open ${it.title}`}>
                <span className="eh-cone" aria-hidden="true" />
                <span className="eh-frame">
                    <span className="eh-mat">{it.image ? <img src={sized(it.image, 1024)} alt={it.title} loading="lazy" draggable={false} onLoad={onImg(it.title)} /> : <span className="eh-blank">{it.outcome === "Case study coming soon" ? "Case study coming soon" : "Images coming soon"}</span>}</span>
                    {it.gallery && it.gallery.length > 1 && <span className="eh-count-badge">{it.gallery.length} {it.wing === "poster" ? "posters" : "works"}</span>}
                </span>
                <span className="eh-plaque">
                    <b>{it.title}</b>
                    <span>{[it.year, it.client].filter(Boolean).join(" · ") || WINGS.find((w) => w.id === it.wing)?.name}</span>
                </span>
            </button>
        )
    }

    const Device = ({ it, color }: { it: Item; color: string }) => (
        <button key={it.title} className={"eh-dev eh-" + (it.device || "laptop")} data-lit style={{ ["--wc" as any]: color }} onClick={() => setOpen(it)} aria-label={`Open ${it.title}`}>
            <span className="eh-cone" aria-hidden="true" />
            <span className="eh-screen">
                {it.image ? (
                    <img className={it.fit === "contain" ? "contain" : undefined} src={sized(it.image, 1024)} alt={it.title} loading="lazy" draggable={false} />
                ) : (
                    <span className="eh-ui" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                        <i />
                        <em>{it.caseStudy ? "Read the case study" : "Case study in progress"}</em>
                    </span>
                )}
            </span>
            {it.device !== "phone" && <span className="eh-base" aria-hidden="true" />}
            <span className="eh-plaque">
                <b>{it.title}</b>
                <span>{[it.client, it.year].filter(Boolean).join(" · ")}</span>
            </span>
        </button>
    )

    const Wing = ({ w, i }: { w: (typeof byWing)[number]; i: number }) => (
        <section key={w.id} className={"eh-wing eh-w-" + w.id + (w.id === "poster" && posterView === "all" ? " all-posters" : "")} data-wing style={{ ["--wc" as any]: w.color }} aria-label={w.name}>
            <div className="eh-sign">
                <span className="eh-num">Wing {String(i + 1).padStart(2, "0")}</span>
                <h2>{w.name}</h2>
                <p>{w.blurb}</p>
                <span className="eh-count">{w.id === "poster" ? (posterView === "folders" ? `${posterFolders.length} folders · ${posterCount} posters` : `${w.items.length} posters`) : `${w.items.length} ${w.id === "animation" ? "films" : "pieces"}`}</span>
                {w.id === "poster" && PosterControls()}
            </div>
            {w.id === "animation" ? (
                <div className="eh-cinema">
                    <button className="eh-bigscreen" data-lit onClick={() => films[film] && setOpen(films[film])} aria-label={`Open ${films[film]?.title}`}>
                        <span className="eh-cone eh-proj" aria-hidden="true" />
                        {films[film] && (isMp4(films[film].video) ? <video key={films[film].video} src={films[film].video} muted loop autoPlay playsInline /> : films[film].image && <img src={films[film].image} alt={films[film].title} draggable={false} />)}
                        <span className="eh-now">
                            <i>▶</i> Now showing: <b>{films[film]?.title}</b>
                        </span>
                    </button>
                    <div className="eh-stripwrap">
                        <button className="eh-sarrow" onClick={() => stripRef.current?.scrollBy({ left: -390, behavior: "smooth" })} aria-label="Scroll films left">
                            ‹
                        </button>
                        <div className="eh-strip" role="list" ref={stripRef}>
                            {films.map((f, k) => (
                                <button key={f.title} role="listitem" className={"eh-film" + (k === film ? " on" : "")} onClick={() => setFilm(k)} aria-label={`Show ${f.title}`}>
                                    {f.image ? <img src={sized(f.image, 400)} alt="" loading="lazy" draggable={false} /> : isMp4(f.video) ? <video src={f.video + "#t=1.5"} preload="metadata" muted playsInline /> : <i />}
                                    <span>{f.title}</span>
                                    <small>{f.client || " "}</small>
                                </button>
                            ))}
                        </div>
                        <button className="eh-sarrow" onClick={() => stripRef.current?.scrollBy({ left: 390, behavior: "smooth" })} aria-label="Scroll films right">
                            ›
                        </button>
                    </div>
                    <div className="eh-seats" aria-hidden="true" />
                </div>
            ) : (
                <div className="eh-row">
                    {w.items.map((it, k) => (w.id === "product" ? Device({ it, color: w.color }) : Art({ it, idx: k, color: w.color })))}
                </div>
            )}
            <div className="eh-door" aria-hidden="true" />
        </section>
    )

    return (
        <div ref={root} className={"eh" + (grid ? " is-grid" : "") + (narrow ? " nr" : "") + (hasBg ? " has-bg" : "") + " lights-" + lights + (zoomed ? " is-zoomed" : "")} style={{ ...style, height, ["--inset" as any]: inset + "px" }}>
            <style>{CSS}</style>
            {grid ? (
                <div className="eh-gridview">
                    <header className="eh-ghead">
                        <h1>{heading}</h1>
                        <p>{intro}</p>
                    </header>
                    {Bar()}
                    {filter === "poster" && <div className="eh-gposter">{PosterControls()}</div>}
                    <div className="eh-cards">
                        {(filter === "all" ? navList : byWing.find((w) => w.id === filter)?.items || [])
                            .map((it) => {
                                const w = WINGS.find((x) => x.id === it.wing) || WINGS[0]
                                return (
                                    <button key={it.title} className="eh-card" style={{ ["--wc" as any]: w.color }} onClick={() => setOpen(it)}>
                                        <span className="eh-cimg">{it.image ? <img src={sized(it.image, 800)} alt={it.title} loading="lazy" draggable={false} /> : isMp4(it.video) ? <video src={it.video + "#t=1.5"} preload="metadata" muted playsInline /> : <span className="eh-blank">In the lab</span>}</span>
                                        <span className="eh-ctext">
                                            <i>{w.name}</i>
                                            <b>{it.title}</b>
                                            <span>{it.summary}</span>
                                        </span>
                                    </button>
                                )
                            })}
                    </div>
                </div>
            ) : (
                <div className="eh-stage" ref={stage}>
                    {hasBg ? (
                        <div className="eh-bgs" aria-hidden="true">
                            {byWing.map((w, k) =>
                                wingBg[w.id] ? <div key={w.id} className={"eh-bg" + (active === k ? " on" : "")} style={{ backgroundImage: `url("${wingBg[w.id]}")` }} /> : null
                            )}
                            <div className="eh-vignette" />
                        </div>
                    ) : (
                        <>
                            <div className="eh-ceiling" aria-hidden="true" />
                            <div className="eh-floor" aria-hidden="true" />
                        </>
                    )}
                    {hasBg && bgEntrance && stageW > 0 && (
                        <div className={"eh-cam" + (active === -1 ? " on" : "")} style={cam}>
                            <div className="eh-ent" style={box}>
                                <div className="eh-photo">
                                    <div className="eh-entimg" style={{ backgroundImage: `url("${bgEntrance}")` }} />
                                    {ENTRANCE_ART.map((f) => (
                                        <img key={f.wing} className="eh-entart" src={f.image} alt="" draggable={false} style={{ left: f.l + "%", top: f.t + "%", width: f.w + "%", height: f.h + "%", objectPosition: f.pos }} />
                                    ))}
                                </div>
                            </div>
                            <button
                                className={"eh-wallswitch" + (lights === "off" ? "" : " up")}
                                style={{ left: sw.x - plateW / 2, top: sw.y - plateW * 0.78, width: plateW, height: plateW * 1.56 }}
                                onClick={toggleLights}
                                aria-label={lights === "off" ? "Switch on the gallery lights" : "Switch off the gallery lights"}
                            >
                                <span className="eh-lever" />
                            </button>
                        </div>
                    )}
                    {Bar()}
                    <div className="eh-track" ref={track}>
                        <section className="eh-intro" style={hasBg && stageW ? { width: stageW, paddingTop: Math.max(roomTop + 24, box.top + bh * 0.2), paddingLeft: textLeft } : undefined}>
                            <span className="eh-kicker">Mragank Bhikshu · Portfolio</span>
                            <h1>{heading}</h1>
                            <p>{intro}</p>
                            <span className="eh-walk">
                                Scroll to walk through <i>→</i>
                            </span>
                        </section>
                        {byWing.map((w, i) => Wing({ w, i }))}
                        <section className="eh-exit">
                            <h2>That's the tour.</h2>
                            <p>Like something you saw? I'd love to hear about your project.</p>
                            <a
                                href={contactLink}
                                onClick={(e) => {
                                    e.preventDefault()
                                    go(contactLink)
                                }}
                            >
                                Let's work together <i>→</i>
                            </a>
                        </section>
                    </div>
                    {zoomed && (
                        <button className={"eh-cta" + (lights === "flicker" ? " gone" : "")} style={{ top: stageH / 2 + plateW * ZOOM * 0.78 + 26 }} onClick={() => switchOn()}>
                            <b>Switch on the gallery</b>
                            <span>Flip the switch to light up the work</span>
                        </button>
                    )}
                    {!hasBg && lights !== "on" && <div className="eh-dark" onClick={() => switchOn()} />}
                </div>
            )}
            {open && CloseUp({ it: open })}
        </div>
    )

    function PosterControls() {
        return (
            <div className="eh-pctl">
                <div className="eh-seg" role="group" aria-label="Poster view">
                    <button className={posterView === "folders" ? "on" : ""} onClick={() => setPosterView("folders")} aria-pressed={posterView === "folders"}>
                        Folders
                    </button>
                    <button className={posterView === "all" ? "on" : ""} onClick={() => setPosterView("all")} aria-pressed={posterView === "all"}>
                        All posters
                    </button>
                </div>
                {posterView === "all" && (
                    <div className="eh-pchips">
                        {["all", ...posterFolders.map((f) => f.title)].map((t) => (
                            <button key={t} className={posterPick === t ? "on" : ""} onClick={() => setPosterPick(t)} aria-pressed={posterPick === t}>
                                {t === "all" ? "Everything" : t}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    function Bar() {
        return (
            <nav className="eh-bar" aria-label="Gallery wings">
                {grid && (
                    <button className={"eh-chip" + (filter === "all" ? " on" : "")} style={{ ["--wc" as any]: "#fff" }} onClick={() => setFilter("all")}>
                        All
                    </button>
                )}
                {byWing.map((w, i) => (
                    <button key={w.id} className={"eh-chip" + ((grid ? filter === w.id : active === i) ? " on" : "")} style={{ ["--wc" as any]: w.color }} onClick={() => jumpTo(i)}>
                        <span className="eh-dot" />
                        {w.name}
                    </button>
                ))}
                {!narrow && (
                    <button
                        className={"eh-toggle" + (quick ? " on" : "")}
                        onClick={() => {
                            setQuick((q) => !q)
                            // the page gets much shorter or taller, so bring the top of the gallery back into view
                            const r = root.current
                            if (r) window.scrollTo({ top: Math.max(0, window.scrollY + r.getBoundingClientRect().top - insetRef.current) })
                        }}
                        aria-pressed={quick}
                    >
                        <span className="eh-sw" />
                        Quick view
                    </button>
                )}
            </nav>
        )
    }

    // every page is a whole landscape page: on desktop the book lies open on two of them (the cover starts alone
    // on the right) and a turn lifts one full page over the spine; on phones it shows one page and turns it away
    function Flipbook({ pages, notebook }: { pages: string[]; notebook?: boolean }) {
        const n = pages.length
        const views = bookViews(pages)
        const pg = (k: number) => (k >= 0 && k < n ? sized(pages[k], 1600) : "")
        const page = (src: string, cls: string) => <span className={"eh-page " + cls + (src ? "" : " blank")} style={src ? { backgroundImage: `url("${src}")` } : undefined} />
        let base: React.ReactNode
        let leaf: React.ReactNode = null
        let label: string
        if (narrow) {
            base = page(turning === "next" ? pg(spread + 1) : pg(spread), "solo")
            if (turning === "next") leaf = <span className="eh-leaf solo next" onAnimationEnd={turnDone}>{page(pg(spread), "solo front")}{page("", "solo back paper")}</span>
            if (turning === "prev") leaf = <span className="eh-leaf solo prev" onAnimationEnd={turnDone}>{page(pg(spread - 1), "solo front")}{page("", "solo back paper")}</span>
            label = `Page ${spread + 1} of ${n}`
        } else {
            const L = (v: number) => pg(2 * v - 1)
            const R = (v: number) => pg(2 * v)
            base = (
                <>
                    {page(turning === "prev" ? L(spread - 1) : L(spread), "l")}
                    {page(turning === "next" ? R(spread + 1) : R(spread), "r")}
                </>
            )
            if (turning === "next") leaf = <span className="eh-leaf next" onAnimationEnd={turnDone}>{page(R(spread), "r front")}{page(L(spread + 1), "l back")}</span>
            if (turning === "prev") leaf = <span className="eh-leaf prev" onAnimationEnd={turnDone}>{page(L(spread), "l front")}{page(R(spread - 1), "r back")}</span>
            const lp = 2 * spread
            label = spread === 0 ? "Cover" : lp >= n ? "Back cover" : lp + 1 > n - 1 ? `Page ${lp}` : `Pages ${lp}–${lp + 1} of ${n}`
        }
        const near = narrow ? [spread - 1, spread + 1, spread + 2] : [2 * spread - 3, 2 * spread - 2, 2 * spread + 1, 2 * spread + 2, 2 * spread + 3]
        return (
            <div className="eh-flipwrap">
                <div
                    className={"eh-flip" + (narrow ? " single" : "") + (notebook ? " is-note" : "") + (spread === 0 && !narrow ? " at-cover" : "") + (spread === views - 1 && !narrow ? " at-end" : "")}
                    style={{ ["--pa" as any]: notebook ? NOTE_ASPECT : BOOK_ASPECT }}
                >
                    {base}
                    {leaf}
                    {notebook && <span className="eh-coil" aria-hidden="true" />}
                    <button className="eh-flipzone l" onClick={() => turn("prev")} disabled={spread === 0} aria-label="Previous page" />
                    <button className="eh-flipzone r" onClick={() => turn("next")} disabled={spread === views - 1} aria-label="Next page" />
                </div>
                <div className="eh-flipbar">
                    <button onClick={() => turn("prev")} disabled={spread === 0} aria-label="Previous page">
                        ‹
                    </button>
                    <span>{label}</span>
                    <button onClick={() => turn("next")} disabled={spread === views - 1} aria-label="Next page">
                        ›
                    </button>
                </div>
                {/* the pages around the open spread load early so a turn never shows a blank page */}
                <span className="eh-preload" aria-hidden="true">
                    {near.filter((k) => k >= 0 && k < n).map((k) => (
                        <img key={k} src={pg(k)} alt="" />
                    ))}
                </span>
            </div>
        )
    }

    function InternView({ it }: { it: Item }) {
        const d = it.intern!
        const w = WINGS.find((x) => x.id === it.wing) || WINGS[0]
        const pics = it.gallery && it.gallery.length ? it.gallery : it.image ? [it.image] : []
        // gallery anchors walk the hall to that wing; pages open through the router
        const follow = (href: string) => {
            if (href.startsWith("#")) {
                setOpen(null)
                window.setTimeout(() => (window.location.hash = href.slice(1)), 60)
            } else go(href)
        }
        return (
            <div className="eh-modal" role="dialog" aria-modal="true" aria-label={`${d.company} internship`} onClick={() => setOpen(null)} style={{ ["--wc" as any]: w.color }}>
                <div className="eh-box is-intern" onClick={(e) => e.stopPropagation()}>
                    <header className="eh-ihead">
                        <span className="eh-wtag">
                            <span className="eh-dot" />
                            {w.name}
                        </span>
                        <h3>{d.company}</h3>
                        <p className="eh-irole">
                            {d.role} · {d.dates} · {d.place}
                        </p>
                        <div className="eh-itabs" role="tablist" aria-label={`${d.company} internship`}>
                            <button role="tab" aria-selected={iview === "about"} className={iview === "about" ? "on" : ""} onClick={() => setIview("about")}>
                                What I did
                            </button>
                            <button role="tab" aria-selected={iview === "work"} className={iview === "work" ? "on" : ""} onClick={() => setIview("work")}>
                                The work · {pics.length}
                            </button>
                        </div>
                    </header>
                    {iview === "about" ? (
                        <div className="eh-iabout">
                            <p className="eh-isum">{d.summary}</p>
                            {d.metrics && d.metrics.length > 0 && (
                                <ul className="eh-imetrics">
                                    {d.metrics.map(([v, l]) => (
                                        <li key={l}>
                                            <b>{v}</b>
                                            <span>{l}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <h4>Projects</h4>
                            <ol className="eh-iprojects">
                                {d.projects.map((pr) => (
                                    <li key={pr.title}>
                                        <b>{pr.title}</b>
                                        <span>{pr.text}</span>
                                        {pr.link && <button onClick={() => follow(pr.link!)}>{pr.label || "Open"} →</button>}
                                    </li>
                                ))}
                            </ol>
                            {d.letterNote && (
                                <div className="eh-iletter">
                                    {d.letter && (
                                        <button className="eh-ithumb" onClick={() => setLetter(true)} aria-label="Open the experience letter">
                                            <img src={sized(d.letter, 400)} alt="" />
                                        </button>
                                    )}
                                    <div>
                                        <b>Experience letter</b>
                                        <span>{d.letterNote}</span>
                                        {d.letter && <button onClick={() => setLetter(true)}>View the letter</button>}
                                    </div>
                                </div>
                            )}
                            <button className="eh-btn eh-inext" onClick={() => setIview("work")}>
                                See the work ({pics.length}) →
                            </button>
                        </div>
                    ) : (
                        <div className="eh-view eh-iwork">
                            {pics.length ? <img src={sized(pics[Math.min(shot, pics.length - 1)], 2048)} alt={`${d.company}, piece ${Math.min(shot, pics.length - 1) + 1} of ${pics.length}`} /> : <span className="eh-blank">Images coming soon</span>}
                            {pics.length > 1 && (
                                <div className="eh-thumbs">
                                    {pics.map((src, k) => (
                                        <button key={src} className={k === shot ? "on" : ""} onClick={() => setShot(k)} aria-label={`Image ${k + 1} of ${pics.length}`}>
                                            <img src={sized(src, 256)} alt="" loading="lazy" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {letter && d.letter && (
                        <div className="eh-lbox" onClick={() => setLetter(false)}>
                            <img src={sized(d.letter, 1600)} alt={`Experience letter from ${d.company}`} />
                        </div>
                    )}
                    <button className="eh-x" onClick={() => (letter ? setLetter(false) : setOpen(null))} aria-label={letter ? "Close the letter" : "Close"}>
                        ✕
                    </button>
                </div>
            </div>
        )
    }

    function CloseUp({ it }: { it: Item }) {
        if (it.intern) return InternView({ it })
        const w = WINGS.find((x) => x.id === it.wing) || WINGS[0]
        const i = Math.max(0, navList.findIndex((x) => x.title === it.title))
        const pics = it.gallery && it.gallery.length ? it.gallery : it.image ? [it.image] : []
        const rows: [string, string | undefined][] = [
            ["My role", it.role],
            ["Tools", it.tools],
            ["Year", it.year],
            ["Client", it.client],
            ["Outcome", it.outcome],
        ]
        return (
            <div className="eh-modal" role="dialog" aria-modal="true" aria-label={it.title} onClick={() => setOpen(null)} style={{ ["--wc" as any]: w.color }}>
                <div className={"eh-box" + (it.book ? " is-book" : "")} onClick={(e) => e.stopPropagation()}>
                    <div className="eh-view">
                        {it.book && it.book.length ? (
                            Flipbook({ pages: it.book, notebook: it.notebook })
                        ) : isMp4(it.video) ? (
                            <video key={it.video} src={it.video} controls autoPlay playsInline />
                        ) : pics.length ? (
                            <img src={sized(pics[Math.min(shot, pics.length - 1)], 2048)} alt={it.title} />
                        ) : (
                            <span className="eh-blank">{it.wing === "product" ? "Case study in progress" : it.outcome === "Case study coming soon" ? "Case study coming soon" : "Images coming soon"}</span>
                        )}
                        {pics.length > 1 && !it.book && (
                            <div className="eh-thumbs">
                                {pics.map((src, k) => (
                                    <button key={src} className={k === shot ? "on" : ""} onClick={() => setShot(k)} aria-label={`Image ${k + 1} of ${pics.length}`}>
                                        <img src={sized(src, 256)} alt="" loading="lazy" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <aside className="eh-info">
                        <span className="eh-wtag">
                            <span className="eh-dot" />
                            {w.name}
                        </span>
                        <h3>{it.title}</h3>
                        {it.summary && <p>{it.summary}</p>}
                        <dl>
                            {rows
                                .filter(([, v]) => v)
                                .map(([k, v]) => (
                                    <div key={k}>
                                        <dt>{k}</dt>
                                        <dd>{v}</dd>
                                    </div>
                                ))}
                        </dl>
                        <div className="eh-acts">
                            {it.caseStudy && (
                                <button className="eh-btn" onClick={() => go(it.caseStudy!)}>
                                    View case study →
                                </button>
                            )}
                            {it.link && (
                                <button className={"eh-btn" + (it.caseStudy ? " ghost" : "")} onClick={() => go(it.link!)}>
                                    {it.wing === "animation" || it.wing === "product" ? "Watch it ↗" : "Open ↗"}
                                </button>
                            )}
                        </div>
                    </aside>
                    <button className="eh-x" onClick={() => setOpen(null)} aria-label="Close">
                        ✕
                    </button>
                    <button className="eh-nav eh-prev" onClick={() => setOpen(navList[(i - 1 + navList.length) % navList.length])} aria-label="Previous piece">
                        ‹
                    </button>
                    <button className="eh-nav eh-next" onClick={() => setOpen(navList[(i + 1) % navList.length])} aria-label="Next piece">
                        ›
                    </button>
                </div>
            </div>
        )
    }
}

const CSS = `
.eh{position:relative;width:100%;max-width:1200px;margin-inline:auto;color:#F3F1EC;font-family:Inter,system-ui,sans-serif;background:#09090b}
.eh *{box-sizing:border-box}
.eh button{font:inherit;color:inherit}
/* the hall: pinned under the 90px site navigation, walked sideways */
.eh-stage{position:sticky;top:0;height:100vh;overflow:hidden;background:radial-gradient(120% 70% at 50% 38%,#17171c 0%,#0c0c0f 60%,#070708 100%)}
.eh-ceiling{position:absolute;left:0;right:0;top:150px;height:2px;background:linear-gradient(90deg,transparent,#2a2a30 10%,#2a2a30 90%,transparent);box-shadow:0 1px 0 #000}
.eh-floor{position:absolute;left:0;right:0;bottom:0;height:17%;background:linear-gradient(180deg,#131316 0%,#0a0a0c 100%);border-top:1px solid #1f1f24}
.eh-floor::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 179px,rgba(255,255,255,.025) 179px 180px)}
.eh-track{position:absolute;top:0;bottom:0;left:0;display:flex;align-items:stretch;will-change:transform}
/* wing signs + quick view */
.eh-bar{position:absolute;z-index:5;top:calc(var(--inset,0px) + 14px);transition:top .35s ease,opacity .6s ease .4s;left:50%;translate:-50% 0;display:flex;gap:6px;align-items:center;padding:6px;border-radius:99px;background:rgba(14,14,18,.78);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.08);white-space:nowrap}
.is-grid .eh-bar{position:relative;top:auto;left:auto;translate:none;margin:0 auto 28px;width:max-content;max-width:100%;overflow-x:auto;scrollbar-width:none}
.eh-chip,.eh-toggle{all:unset;display:inline-flex;align-items:center;gap:7px;padding:7px 13px;border-radius:99px;font-size:13px;font-weight:600;color:rgba(255,255,255,.62);cursor:pointer;transition:color .3s,background .3s}
.eh-chip:hover,.eh-toggle:hover{color:#fff}
.eh-chip.on{color:#fff;background:color-mix(in srgb,var(--wc) 18%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--wc) 55%,transparent)}
.eh-dot{width:7px;height:7px;border-radius:50%;background:var(--wc);box-shadow:0 0 8px var(--wc)}
.eh-toggle{margin-left:4px;border-left:1px solid rgba(255,255,255,.1);border-radius:0 99px 99px 0;padding-left:14px}
.eh-sw{position:relative;width:28px;height:16px;border-radius:99px;background:rgba(255,255,255,.15);transition:background .3s}
.eh-sw::after{content:"";position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:#fff;transition:transform .3s}
.eh-toggle.on .eh-sw{background:#2F9BFF}.eh-toggle.on .eh-sw::after{transform:translateX(12px)}
.eh-chip:focus-visible,.eh-toggle:focus-visible,.eh-art:focus-visible,.eh-dev:focus-visible,.eh-film:focus-visible,.eh-card:focus-visible{outline:2px solid #fff;outline-offset:4px}
/* entrance and exit */
.eh-intro,.eh-exit{flex:none;width:min(560px,70vw);display:flex;flex-direction:column;justify-content:center;padding:120px 40px 0 max(40px,6vw)}
.eh-kicker{font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#2F9BFF}
.eh-intro h1{margin:14px 0 16px;font-size:clamp(40px,5.4vw,72px);line-height:1;font-weight:900;letter-spacing:-.04em}
.eh-intro p,.eh-exit p{margin:0;font-size:17px;line-height:1.6;color:rgba(255,255,255,.7);max-width:440px}
.eh-walk{margin-top:28px;display:inline-flex;gap:10px;align-items:center;font-size:14px;font-weight:700;color:#fff}
.eh-walk i{font-style:normal;animation:eh-nudge 1.4s ease-in-out infinite}
@keyframes eh-nudge{50%{transform:translateX(6px)}}
.eh-exit{width:min(620px,80vw);padding-right:8vw}
.eh-exit h2{margin:0 0 12px;font-size:clamp(34px,4vw,54px);font-weight:900;letter-spacing:-.03em}
.eh-exit a{margin-top:26px;align-self:flex-start;display:inline-flex;gap:10px;padding:14px 22px;border-radius:99px;background:#2F9BFF;color:#fff;font-weight:700;text-decoration:none;box-shadow:0 0 30px rgba(47,155,255,.35);transition:transform .25s}
.eh-exit a:hover{transform:translateY(-2px)}
.eh-exit a i{font-style:normal}
/* a wing: sign on the wall, then the pieces, then a doorway */
.eh-wing{flex:none;position:relative;display:flex;align-items:center;gap:clamp(36px,4vw,64px);padding:150px 0 0 clamp(48px,5vw,90px)}
.eh-sign{position:relative;z-index:3;flex:none;width:260px;align-self:center;margin-top:-8vh;will-change:transform;padding:22px 22px 20px;border-radius:6px;background:linear-gradient(160deg,#18181d,#101014);border:1px solid #26262c;box-shadow:0 20px 50px rgba(0,0,0,.5)}
.eh-num{font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--wc)}
.eh-sign h2{margin:8px 0 10px;font-size:30px;line-height:1.05;font-weight:900;letter-spacing:-.03em;color:#fff;text-shadow:0 0 18px color-mix(in srgb,var(--wc) 55%,transparent)}
.eh-sign p{margin:0;font-size:13.5px;line-height:1.55;color:rgba(255,255,255,.62)}
.eh-count{display:inline-block;margin-top:14px;font-size:12px;font-weight:700;color:var(--wc)}
.eh-row{display:flex;align-items:center;gap:clamp(36px,3.5vw,64px)}
.eh-door{flex:none;width:90px;align-self:stretch;margin-left:clamp(32px,4vw,64px);background:linear-gradient(90deg,transparent,#050506 30%,#050506 70%,transparent);border-left:1px solid #1d1d22;border-right:1px solid #1d1d22}
/* a framed piece under its spotlight */
.eh-art,.eh-dev,.eh-bigscreen{all:unset;--lit:0;position:relative;flex:none;cursor:pointer;display:flex;flex-direction:column;align-items:center}
.eh-cone{position:absolute;left:50%;bottom:30%;width:min(520px,170%);height:calc(100vh);translate:-50% 0;background:radial-gradient(60% 100% at 50% 0%,rgba(255,244,226,.20),rgba(255,244,226,.05) 55%,transparent 75%);clip-path:polygon(44% 0,56% 0,100% 100%,0 100%);opacity:calc(.1 + var(--lit) * .9);pointer-events:none;transition:opacity .2s}
.eh-frame{position:relative;height:min(44vh,430px);aspect-ratio:var(--a);padding:9px;background:#0e0e10;border-radius:2px;box-shadow:0 0 0 1px #2c2c31,0 34px 60px rgba(0,0,0,.75),0 0 calc(var(--lit) * 60px) color-mix(in srgb,var(--wc) 25%,transparent);transition:transform .35s cubic-bezier(.2,.7,.2,1)}
.eh-mat{display:block;width:100%;height:100%;padding:7%;background:#ECE7DC;box-shadow:inset 0 2px 6px rgba(0,0,0,.25)}
.eh-mat img{display:block;width:100%;height:100%;object-fit:cover;box-shadow:0 0 0 1px rgba(0,0,0,.15)}
.eh-art:hover .eh-frame{transform:translateY(-6px) scale(1.02)}
.eh-plaque{margin-top:20px;display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 16px;max-width:280px;text-align:center;border-radius:6px;background:#2F9BFF;box-shadow:0 8px 24px rgba(47,155,255,.3)}
.eh-plaque b{font-size:15.5px;font-weight:800;color:#fff;line-height:1.25}
.eh-plaque span{font-size:12.5px;font-weight:500;color:rgba(255,255,255,.88)}
.eh-count-badge{position:absolute;right:16px;bottom:16px;padding:4px 9px;border-radius:99px;font-size:11.5px;font-weight:700;color:#fff;background:rgba(10,10,14,.78);backdrop-filter:blur(6px)}
.eh-thumbs{display:flex;gap:8px;justify-content:safe center;flex-wrap:nowrap;overflow-x:auto;max-width:100%;margin-top:14px;padding:3px;scrollbar-width:thin}
.eh-thumbs button{all:unset;flex:none;cursor:pointer;width:64px;height:48px;border-radius:6px;overflow:hidden;opacity:.55;box-shadow:0 0 0 2px transparent;transition:opacity .2s,box-shadow .2s}
.eh-thumbs button.on{opacity:1;box-shadow:0 0 0 2px var(--wc)}
.eh-thumbs img{width:100%;height:100%;object-fit:cover;display:block}
.eh-box .eh-view{display:flex;flex-direction:column;align-items:center;justify-content:center}
.eh-blank{display:grid;place-items:center;width:100%;height:100%;background:repeating-linear-gradient(45deg,#1a1a20 0 10px,#15151a 10px 20px);color:rgba(255,255,255,.5);font-size:13px;font-weight:600}
/* product lab devices */
.eh-screen{position:relative;display:block;overflow:hidden;background:#0d0d12;border:10px solid #1d1d22;box-shadow:0 0 0 1px #34343b,0 30px 60px rgba(0,0,0,.7),0 0 calc(var(--lit) * 50px) color-mix(in srgb,var(--wc) 35%,transparent);transition:transform .35s}
.eh-laptop .eh-screen{width:min(46vh,440px);aspect-ratio:16/10;border-radius:12px 12px 0 0}
.eh-phone .eh-screen{height:min(46vh,430px);aspect-ratio:9/19;border-radius:30px;border-width:9px}
.eh-screen img{width:100%;height:100%;object-fit:cover}
.eh-screen img.contain{object-fit:contain;padding:5% 0 0;background:radial-gradient(90% 90% at 50% 30%,#009EE3 0%,#27348B 70%)}
.eh-base{display:block;width:calc(min(46vh,440px) * 1.18);height:14px;border-radius:0 0 14px 14px;background:linear-gradient(180deg,#2a2a31,#151519);box-shadow:0 18px 30px rgba(0,0,0,.6)}
.eh-dev:hover .eh-screen{transform:translateY(-6px)}
.eh-ui{position:absolute;inset:0;display:flex;flex-direction:column;gap:8%;padding:10% 9%;background:linear-gradient(160deg,color-mix(in srgb,var(--wc) 22%,#0d0d12),#0d0d12 70%);opacity:calc(.45 + var(--lit) * .55)}
.eh-ui i{display:block;height:9%;border-radius:6px;background:rgba(255,255,255,.1)}
.eh-ui i:nth-child(1){width:45%;background:color-mix(in srgb,var(--wc) 60%,transparent)}
.eh-ui i:nth-child(3){width:75%}.eh-ui i:nth-child(4){width:60%}
.eh-ui em{margin-top:auto;align-self:flex-start;font-style:normal;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:5px 10px;border-radius:99px;color:#fff;background:color-mix(in srgb,var(--wc) 40%,transparent)}
/* animation cinema */
.eh-cinema{position:relative;display:flex;flex-direction:column;align-items:center;gap:22px;margin-top:-2vh}
.eh-bigscreen{width:min(62vw,calc(48vh * 16 / 9),860px);aspect-ratio:16/9;background:#000;border-radius:4px;box-shadow:0 0 0 8px #141418,0 0 0 9px #2a2a30,0 40px 80px rgba(0,0,0,.8),0 0 calc(var(--lit) * 90px) rgba(47,155,255,.25)}
.eh-bigscreen img,.eh-bigscreen video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:4px}
.eh-proj{bottom:auto;top:-60vh;height:60vh;clip-path:polygon(48% 0,52% 0,100% 100%,0 100%);background:linear-gradient(180deg,rgba(150,200,255,.0),rgba(150,200,255,.12))}
.eh-now{position:absolute;left:14px;bottom:14px;display:inline-flex;gap:8px;align-items:center;padding:7px 12px;border-radius:99px;font-size:12.5px;background:rgba(0,0,0,.6);backdrop-filter:blur(8px)}
.eh-now i{font-style:normal;color:#2F9BFF}
.eh-strip{display:flex;gap:10px;min-width:0;overflow-x:auto;padding:4px;scrollbar-width:thin;overscroll-behavior-x:contain}
.eh-film{all:unset;flex:none;cursor:pointer;width:120px;display:flex;flex-direction:column;gap:6px;opacity:.55;transition:opacity .25s,transform .25s}
.eh-film img,.eh-film video,.eh-film > i{display:block;width:120px;aspect-ratio:16/10;object-fit:cover;border-radius:4px;border:2px solid transparent;background:#111;pointer-events:none}
.eh-film small{font-size:10.5px;color:rgba(255,255,255,.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:-4px}
.eh-stripwrap{display:flex;align-items:center;gap:8px;align-self:stretch;width:0;min-width:100%}
.eh-sarrow{all:unset;flex:none;cursor:pointer;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;font-size:22px;line-height:1;color:#fff;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);transition:background .2s}
.eh-sarrow:hover{background:rgba(47,155,255,.35)}
.eh-sarrow:focus-visible{outline:2px solid #fff;outline-offset:2px}
.eh-cimg video{width:100%;height:100%;object-fit:cover;display:block}
/* poster folders: a stack of sheets behind the frame */
.eh-art.is-folder .eh-frame{box-shadow:0 0 0 1px #2c2c31,10px -10px 0 -2px #23232a,20px -20px 0 -4px #18181d,0 34px 60px rgba(0,0,0,.75),0 0 calc(var(--lit) * 60px) color-mix(in srgb,var(--wc) 25%,transparent)}
.eh-pctl{display:grid;gap:10px;margin-top:14px}
/* the poster sign holds the filter, so it sits higher and drops its blurb while every poster is out */
.eh-w-poster .eh-sign{margin-top:0}
.eh-w-poster.all-posters .eh-sign p{display:none}
.eh-seg{display:inline-flex;padding:3px;border-radius:99px;background:rgba(255,255,255,.07);justify-self:start}
.eh-seg button{all:unset;cursor:pointer;padding:6px 12px;border-radius:99px;font-size:12.5px;font-weight:700;color:rgba(255,255,255,.65)}
.eh-seg button.on{background:var(--wc);color:#fff}
.eh-pchips{display:flex;flex-wrap:wrap;gap:6px}
.eh-pchips button{all:unset;cursor:pointer;padding:4px 9px;border-radius:99px;font-size:11.5px;font-weight:600;color:rgba(255,255,255,.7);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}
.eh-pchips button.on{color:#fff;background:color-mix(in srgb,var(--wc) 30%,transparent);box-shadow:inset 0 0 0 1px var(--wc)}
.eh-seg button:focus-visible,.eh-pchips button:focus-visible{outline:2px solid #fff;outline-offset:2px}
.eh-gposter{--wc:#FF4F8B;display:flex;justify-content:center;margin:-12px 0 24px}
.eh-gposter .eh-pctl{justify-items:center;margin:0}
.eh-gposter .eh-seg{justify-self:center}
.eh-gposter .eh-pchips{justify-content:center}
.eh-film span{font-size:11.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.eh-film:hover{opacity:.9}
.eh-film.on{opacity:1}.eh-film.on img{border-color:#2F9BFF;box-shadow:0 0 16px rgba(47,155,255,.5)}
.eh-seats{width:min(62vw,860px);height:26px;background:radial-gradient(circle at 20px 26px,#121216 18px,transparent 19px) 0 0/44px 26px repeat-x;opacity:.9}
/* a book standing in the hall: cover, spine and page edges in 3D */
.eh-bookobj{perspective:1400px}
.eh-book3d{position:relative;display:block;height:min(24vh,240px);aspect-ratio:var(--pa,1.414);transform-style:preserve-3d;transform:rotateY(28deg) rotateX(3deg);transition:transform .6s cubic-bezier(.2,.7,.2,1)}
.eh-bookobj:hover .eh-book3d{transform:rotateY(12deg) rotateX(2deg) translateY(-6px)}
.eh-bcover{position:absolute;inset:0;background-size:cover;background-position:center;border-radius:2px 5px 5px 2px;box-shadow:inset 6px 0 10px -4px rgba(0,0,0,.45),inset -1px 0 0 rgba(255,255,255,.15),0 0 calc(var(--lit) * 60px) color-mix(in srgb,var(--wc) 25%,transparent)}
.eh-bspine{position:absolute;top:0;bottom:0;left:0;width:30px;transform-origin:left center;transform:rotateY(90deg);background:linear-gradient(90deg,#0b2a5c,#163f86 50%,#0b2a5c);display:grid;place-items:center;overflow:hidden}
.eh-bspine b{writing-mode:vertical-rl;transform:rotate(180deg);font-size:11px;font-weight:800;letter-spacing:.08em;color:#fff;white-space:nowrap}
.eh-bpages{position:absolute;top:3px;bottom:3px;right:0;width:28px;transform-origin:right center;transform:rotateY(-90deg);background:repeating-linear-gradient(90deg,#f4f1ea 0 2px,#d9d4c8 2px 3px)}
.eh-bback{position:absolute;inset:0;transform:translateZ(-30px);background:#0b2a5c;border-radius:5px 2px 2px 5px;box-shadow:0 40px 60px rgba(0,0,0,.7)}
.eh-bbadge{position:relative;right:auto;bottom:auto;margin-top:18px}
/* the flipbook in the close-up: the book gets the full width, its details sit underneath */
.eh-box.is-book{grid-template-columns:1fr;width:min(1240px,100%)}
.eh-box.is-book .eh-nav{display:none}
.eh-box.is-book .eh-view{padding:28px 24px 18px}
.eh-box.is-book .eh-info{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);column-gap:36px;row-gap:8px;align-items:start;border-left:0;border-top:1px solid #222228;padding:20px 28px 24px}
.eh-box.is-book .eh-info > *{grid-column:1}
.eh-box.is-book .eh-info dl{grid-column:2;grid-row:1 / span 4;margin:0}
.eh-flipwrap{width:100%;display:grid;gap:12px;justify-items:center}
.eh-flip{position:relative;width:min(100%,calc((100vh - 330px) * var(--pa,1.414) * 2));aspect-ratio:calc(var(--pa,1.414) * 2);perspective:3200px}
.eh-flip.single{width:min(100%,calc((100vh - 330px) * var(--pa,1.414)));aspect-ratio:var(--pa,1.414);perspective:2200px}
/* spiral notebook: rounded outer corners, punched holes along the coil, the coil itself above the turning page */
.eh-bookobj.is-note .eh-book3d{height:min(30vh,300px)}
.eh-bookobj.is-note .eh-bcover{border-radius:3px 10px 10px 3px}
.eh-bookobj.is-note .eh-bspine{background:linear-gradient(90deg,#1b1f2a,#2b3140 50%,#1b1f2a)}
.eh-bookobj.is-note .eh-bspine b{display:none}
.eh-bookobj.is-note .eh-bpages{width:16px}
.eh-bookobj.is-note .eh-bback{transform:translateZ(-16px);background:#1b1f2a;border-radius:10px 3px 3px 10px}
.eh-bcoil{position:absolute;left:-7px;top:4%;bottom:4%;width:16px;transform:translateZ(2px);background:repeating-linear-gradient(180deg,transparent 0 5px,#c9ccd3 5px 7px,#6b7080 7px 9px,transparent 9px 14px);filter:drop-shadow(1px 1px 1px rgba(0,0,0,.6))}
.eh-bband{position:absolute;top:-1px;bottom:-1px;right:12%;width:9px;transform:translateZ(1px);background:linear-gradient(90deg,#0d3a8a,#1f5fd0 50%,#0d3a8a);box-shadow:0 0 0 1px rgba(0,0,0,.25)}
.eh-flip.is-note .eh-page{background-color:#fff}
.eh-flip.is-note .eh-page.blank{background:none;box-shadow:none}
.eh-flip.is-note .eh-page.l{border-radius:10px 0 0 10px}
.eh-flip.is-note .eh-page.r{border-radius:0 10px 10px 0}
.eh-flip.is-note .eh-page.solo{border-radius:0 10px 10px 0}
.eh-flip.is-note .eh-leaf .eh-page.front{border-radius:0 10px 10px 0}
.eh-flip.is-note .eh-leaf.prev .eh-page.front{border-radius:10px 0 0 10px}
.eh-flip.is-note .eh-leaf.next .eh-page.back{border-radius:10px 0 0 10px}
.eh-flip.is-note .eh-leaf.prev .eh-page.back{border-radius:0 10px 10px 0}
.eh-flip.is-note .eh-leaf.solo .eh-page.back{border-radius:10px 0 0 10px}
.eh-flip.is-note .eh-page.paper{background:repeating-linear-gradient(180deg,#fff 0 26px,#d7dde8 26px 27px)}
.eh-coil{position:absolute;z-index:3;top:2.5%;bottom:2.5%;left:50%;width:26px;margin-left:-13px;pointer-events:none;background:repeating-linear-gradient(180deg,transparent 0 6px,#e3e5ea 6px 8px,#8a8f9c 8px 11px,#3c414c 11px 12px,transparent 12px 20px);filter:drop-shadow(0 2px 2px rgba(0,0,0,.5))}
.eh-flip.single .eh-coil{left:0}
.eh-page{position:absolute;top:0;bottom:0;width:50%;background-size:cover;background-position:center;background-color:#f4f1ea;box-shadow:0 24px 50px rgba(0,0,0,.55)}
.eh-page.l{left:0;box-shadow:0 24px 50px rgba(0,0,0,.55),inset -26px 0 30px -24px rgba(0,0,0,.45)}
.eh-page.r{left:50%;box-shadow:0 24px 50px rgba(0,0,0,.55),inset 26px 0 30px -24px rgba(0,0,0,.45)}
.eh-page.solo{left:0;width:100%;box-shadow:0 24px 50px rgba(0,0,0,.55)}
.eh-page.blank{background:none;box-shadow:none}
.eh-page.paper{background:linear-gradient(90deg,#e9e4d8,#f4f1ea)}
.eh-leaf{position:absolute;top:0;bottom:0;width:50%;transform-style:preserve-3d;z-index:2}
.eh-leaf.solo{width:100%}
.eh-leaf.next{left:50%;transform-origin:left center;animation:eh-turn-next .8s cubic-bezier(.45,.05,.3,1) forwards}
.eh-leaf.prev{left:0;transform-origin:right center;animation:eh-turn-prev .8s cubic-bezier(.45,.05,.3,1) forwards}
.eh-leaf.solo.next{left:0}
.eh-leaf.solo.prev{left:0;transform-origin:left center;animation-name:eh-turn-back}
.eh-leaf .eh-page{left:0;width:100%;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.eh-leaf .eh-page.back{transform:rotateY(180deg)}
@keyframes eh-turn-next{to{transform:rotateY(-180deg)}}
@keyframes eh-turn-prev{to{transform:rotateY(180deg)}}
@keyframes eh-turn-back{from{transform:rotateY(-180deg)}to{transform:rotateY(0)}}
.eh-flipzone{all:unset;position:absolute;top:0;bottom:0;width:50%;z-index:4;cursor:pointer}
.eh-flipzone.l{left:0;cursor:w-resize}.eh-flipzone.r{right:0;cursor:e-resize}
.eh-flip.at-cover .eh-flipzone.l,.eh-flip.at-end .eh-flipzone.r{pointer-events:none}
.eh-flipzone[disabled]{cursor:default}
.eh-flipbar{display:flex;align-items:center;gap:14px;font-size:13px;font-weight:600;color:rgba(255,255,255,.75);font-variant-numeric:tabular-nums}
.eh-flipbar button{all:unset;cursor:pointer;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;font-size:22px;background:rgba(255,255,255,.1);color:#fff}
.eh-flipbar button[disabled]{opacity:.3;cursor:default}
.eh-flipbar button:focus-visible,.eh-flipzone:focus-visible{outline:2px solid #fff;outline-offset:2px}
.eh-preload{position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none}
.eh-preload img{width:1px;height:1px}
@media (prefers-reduced-motion:reduce){.eh-leaf.next,.eh-leaf.prev{animation-duration:.01s}}
@media (max-width:760px){.eh-box.is-book .eh-info{grid-template-columns:1fr}.eh-box.is-book .eh-info dl{grid-column:1;grid-row:auto}.eh-box.is-book .eh-view{padding:18px 12px}}
/* room photos: one per wing, crossfading; the track slides in front of them */
.eh-bgs{position:absolute;left:0;right:0;transition:top .35s ease;top:calc(var(--inset,0px) + 64px);bottom:0;z-index:0;pointer-events:none}
.eh-bg{position:absolute;inset:0;background-size:cover;background-position:50% 50%;opacity:0;transition:opacity 1s ease}
.eh-bg.on{opacity:1}
.eh-vignette{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.3),transparent 14%,transparent 86%,rgba(0,0,0,.3))}
/* entrance: the photo with real work in its frames, the wall switch, and the camera that starts zoomed on it */
.eh-cam{position:absolute;inset:0;z-index:0;background:linear-gradient(180deg,#0b0a09,#15120f 70%,#1a1612);opacity:0;pointer-events:none;transition:transform 1.9s cubic-bezier(.65,0,.25,1),opacity 1s ease}
.eh-cam.on{opacity:1;pointer-events:auto}
.eh-ent{position:absolute;pointer-events:none}
.eh-photo{position:absolute;inset:0;transition:filter .5s ease}
.eh-entimg{position:absolute;inset:0;background-size:100% 100%}
.eh-entart{position:absolute;object-fit:cover;display:block;background:#F1E8D6;box-shadow:inset 0 0 0 1px rgba(0,0,0,.2)}
.lights-off .eh-photo{filter:brightness(.08) saturate(.4)}
.lights-flicker .eh-photo{animation:eh-flick 1.2s linear forwards}
@keyframes eh-flick{0%{filter:brightness(.08) saturate(.4)}10%{filter:brightness(.7)}16%{filter:brightness(.1)}26%{filter:brightness(.85)}32%{filter:brightness(.2)}46%{filter:brightness(1)}52%{filter:brightness(.5)}64%,100%{filter:brightness(1)}}
.eh-wallswitch{all:unset;position:absolute;z-index:2;cursor:pointer;border-radius:12%/8%;background:linear-gradient(150deg,#e9c98a,#b8893f 55%,#8a6428);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 -2px 3px rgba(0,0,0,.35),0 4px 10px rgba(0,0,0,.6),0 0 22px rgba(255,200,120,.25)}
.eh-wallswitch::before,.eh-wallswitch::after{content:"";position:absolute;left:50%;width:10%;aspect-ratio:1;translate:-50% 0;border-radius:50%;background:#6d4e1f}
.eh-wallswitch::before{top:8%}.eh-wallswitch::after{bottom:8%}
.eh-wallswitch .eh-lever{position:absolute;left:50%;top:50%;width:26%;height:36%;translate:-50% -50%;border-radius:40%;background:linear-gradient(90deg,#f6e2b6,#c99a4c);box-shadow:0 2px 3px rgba(0,0,0,.45);transform:perspective(40px) rotateX(-35deg) translateY(12%);transition:transform .2s}
.eh-wallswitch.up .eh-lever{transform:perspective(40px) rotateX(35deg) translateY(-12%)}
.eh-wallswitch:focus-visible{outline:2px solid #fff;outline-offset:3px}
.lights-off .eh-wallswitch{animation:eh-glow 2.4s ease-in-out infinite}
@keyframes eh-glow{50%{box-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 -2px 3px rgba(0,0,0,.35),0 4px 10px rgba(0,0,0,.6),0 0 34px rgba(255,200,120,.5)}}
.eh-cta{all:unset;position:absolute;z-index:7;left:50%;translate:-50% 0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;transition:opacity .4s}
.eh-cta b{font-size:24px;font-weight:800;letter-spacing:-.01em;color:#fff;text-shadow:0 0 24px rgba(255,214,150,.35)}
.eh-cta span{font-size:14px;color:rgba(255,255,255,.62)}
.eh-cta.gone{opacity:0;pointer-events:none}
.is-zoomed .eh-track,.is-zoomed .eh-bar{opacity:0;pointer-events:none}
.eh-track{transition:opacity .8s ease .9s}
.has-bg.lights-off:not(.is-zoomed) .eh-track{opacity:.35}
.has-bg .eh-track{z-index:1}
.has-bg .eh-intro{justify-content:flex-start;padding:0}
.has-bg .eh-intro > *{max-width:340px}
.has-bg .eh-intro h1{font-size:clamp(40px,5vw,64px)}
.has-bg .eh-intro p{font-size:15.5px}
.has-bg .eh-wing{padding:calc(var(--inset,0px) + 72px) 0 20vh clamp(48px,5vw,90px)}
.has-bg .eh-frame{height:min(34vh,340px)}
.has-bg .eh-cone{opacity:calc(var(--lit) * .45)}
.has-bg .eh-sign{background:rgba(16,16,20,.72);backdrop-filter:blur(10px)}
.has-bg .eh-door{background:linear-gradient(90deg,transparent,rgba(0,0,0,.3) 40%,rgba(0,0,0,.3) 60%,transparent);border:0}
.has-bg .eh-seats,.has-bg .eh-proj{display:none}
.has-bg .eh-cinema{margin-top:0}
.has-bg .eh-bigscreen{width:min(52vw,calc(36vh * 16 / 9),720px)}
.has-bg .eh-laptop .eh-screen{width:min(40vh,400px)}
.has-bg .eh-phone .eh-screen{height:min(40vh,390px)}
.has-bg .eh-base{width:calc(min(40vh,400px) * 1.18)}
/* no room photos: a plain dark layer stands in for the lights */
.eh-dark{position:absolute;inset:0;z-index:6;background:rgba(0,0,0,.85);cursor:pointer}
.eh:not(.has-bg).lights-off .eh-bar{opacity:0;pointer-events:none}
.eh-track{pointer-events:none}
.eh-track > section{pointer-events:auto}
.eh-track > .eh-intro{pointer-events:none}
/* quick view grid */
.eh-gridview{padding:130px clamp(16px,4vw,48px) 80px}
.eh-ghead{text-align:center;margin:0 auto 28px;max-width:640px}
.eh-ghead h1{margin:0 0 10px;font-size:clamp(34px,5vw,60px);font-weight:900;letter-spacing:-.04em}
.eh-ghead p{margin:0;color:rgba(255,255,255,.68);font-size:16px;line-height:1.6}
.eh-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px}
.eh-card{all:unset;cursor:pointer;display:flex;flex-direction:column;border-radius:14px;overflow:hidden;background:#111115;border:1px solid #222228;transition:transform .25s,border-color .25s}
.eh-card:hover{transform:translateY(-4px);border-color:color-mix(in srgb,var(--wc) 60%,transparent)}
.eh-cimg{display:block;aspect-ratio:4/3;background:#0c0c0f}
.eh-cimg img{width:100%;height:100%;object-fit:cover;display:block}
.eh-ctext{display:flex;flex-direction:column;gap:5px;padding:14px 16px 16px}
.eh-ctext i{font-style:normal;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--wc)}
.eh-ctext b{font-size:16px}
.eh-ctext span{font-size:13.5px;line-height:1.5;color:rgba(255,255,255,.62)}
.eh.nr .eh-gridview{padding-top:110px}
.eh.nr .eh-cards{grid-template-columns:1fr 1fr;gap:12px}
.eh.nr .eh-ctext span{display:none}
/* close-up */
.eh-modal{position:fixed;inset:0;z-index:2147482000;display:grid;place-items:center;padding:24px;background:rgba(4,4,6,.86);backdrop-filter:blur(10px);animation:eh-in .3s ease}
@keyframes eh-in{from{opacity:0}}
.eh-box{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 340px;width:min(1100px,100%);max-height:calc(100vh - 48px);border-radius:16px;overflow:hidden;background:#0f0f13;border:1px solid #26262c;box-shadow:0 40px 120px rgba(0,0,0,.7)}
.eh-view{display:grid;place-items:center;min-height:0;background:#060608;padding:24px}
.eh-view > img,.eh-view > video{max-width:100%;max-height:calc(100vh - 170px);object-fit:contain;display:block;border-radius:4px}
.eh-view .eh-blank{min-height:360px;border-radius:8px}
.eh-info{display:flex;flex-direction:column;gap:14px;padding:30px 26px;overflow:auto;border-left:1px solid #222228}
.eh-wtag{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--wc)}
.eh-info h3{margin:0;font-size:28px;line-height:1.1;font-weight:900;letter-spacing:-.02em}
.eh-info p{margin:0;font-size:15px;line-height:1.6;color:rgba(255,255,255,.75)}
.eh-info dl{margin:4px 0 0;display:flex;flex-direction:column;border-top:1px solid #222228}
.eh-info dl div{display:grid;grid-template-columns:90px 1fr;gap:10px;padding:10px 0;border-bottom:1px solid #1c1c22}
.eh-info dt{font-size:12px;font-weight:600;color:rgba(255,255,255,.45)}
.eh-info dd{margin:0;font-size:13.5px;color:#fff}
.eh-acts{display:flex;flex-wrap:wrap;gap:10px;margin-top:auto;padding-top:8px}
.eh-btn{all:unset;cursor:pointer;padding:11px 18px;border-radius:99px;font-size:14px;font-weight:700;background:var(--wc);color:#0a0a0c}
.eh-btn.ghost{background:transparent;color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.3)}
.eh-x,.eh-nav{all:unset;position:absolute;cursor:pointer;display:grid;place-items:center;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;backdrop-filter:blur(6px)}
.eh-x{top:12px;right:12px;width:36px;height:36px;font-size:14px}
.eh-nav{top:50%;width:42px;height:42px;font-size:26px;translate:0 -50%}
.eh-prev{left:12px}.eh-next{right:352px}
.eh-x:hover,.eh-nav:hover{background:rgba(255,255,255,.15)}
@media (max-width:760px){.eh-box,.eh-box.is-book{grid-template-columns:1fr;max-height:calc(100vh - 24px);overflow:auto}.eh-info{border-left:0;border-top:1px solid #222228}.eh-next,.eh-box.is-book .eh-next{right:12px}.eh-nav{top:30%}.eh-modal{padding:12px}}
/* internship close-up: the story first, then the work */
.eh-box.is-intern{grid-template-columns:1fr;width:min(1000px,100%);overflow:auto}
.eh-ihead{display:grid;gap:8px;padding:28px 30px 0;border-bottom:1px solid #222228}
.eh-ihead h3{margin:0;font-size:clamp(26px,3vw,34px);line-height:1.1;font-weight:900;letter-spacing:-.02em}
.eh-irole{margin:0;font-size:14.5px;color:rgba(255,255,255,.65)}
.eh-itabs{display:flex;gap:22px;margin-top:8px}
.eh-itabs button{all:unset;cursor:pointer;padding:12px 0;font-size:14px;font-weight:700;color:rgba(255,255,255,.55);border-bottom:2px solid transparent}
.eh-itabs button.on{color:#fff;border-color:var(--wc)}
.eh-itabs button:focus-visible,.eh-iprojects button:focus-visible,.eh-iletter button:focus-visible{outline:2px solid #fff;outline-offset:3px}
.eh-iabout{display:grid;gap:18px;padding:24px 30px 30px}
.eh-isum{margin:0;max-width:70ch;font-size:16.5px;line-height:1.6;color:rgba(255,255,255,.82)}
.eh-imetrics{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:10px}
.eh-imetrics li{display:grid;gap:2px;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid #26262c}
.eh-imetrics b{font-size:21px;font-weight:800;color:var(--wc);font-variant-numeric:tabular-nums}
.eh-imetrics span{font-size:12.5px;color:rgba(255,255,255,.6)}
.eh-iabout h4{margin:4px 0 -6px;font-size:13px;font-weight:700;color:rgba(255,255,255,.5)}
.eh-iprojects{list-style:none;counter-reset:pr;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.eh-iprojects li{counter-increment:pr;display:flex;flex-direction:column;gap:6px;padding:16px 18px;border-radius:14px;background:#141419;border:1px solid #26262c}
.eh-iprojects li::before{content:counter(pr,decimal-leading-zero);font-size:12px;font-weight:800;color:var(--wc)}
.eh-iprojects b{font-size:15.5px;line-height:1.3}
.eh-iprojects span{font-size:14px;line-height:1.55;color:rgba(255,255,255,.68)}
.eh-iprojects button{all:unset;cursor:pointer;margin-top:auto;padding-top:6px;font-size:13.5px;font-weight:700;color:var(--wc)}
.eh-iletter{display:flex;gap:16px;align-items:center;padding:16px 18px;border-radius:14px;border:1px dashed color-mix(in srgb,var(--wc) 55%,transparent);background:color-mix(in srgb,var(--wc) 7%,transparent)}
.eh-ithumb{all:unset;display:block;cursor:pointer;flex:none;width:76px;aspect-ratio:.707;border-radius:4px;overflow:hidden;background:#fff;box-shadow:0 8px 20px rgba(0,0,0,.5)}
.eh-ithumb img{display:block;width:100%;height:100%;object-fit:cover}
.eh-iletter > div{display:grid;gap:4px}
.eh-iletter b{font-size:15.5px}
.eh-iletter span{font-size:13.5px;line-height:1.5;color:rgba(255,255,255,.68)}
.eh-iletter > div button{all:unset;cursor:pointer;justify-self:start;font-size:13.5px;font-weight:700;color:var(--wc)}
.eh-inext{justify-self:start}
.eh-iwork{padding:22px}
.eh-iwork > img{max-width:100%;max-height:calc(100vh - 330px);object-fit:contain;display:block;border-radius:4px}
.eh-lbox{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:20px;background:rgba(4,4,6,.94);cursor:zoom-out}
.eh-lbox img{max-width:100%;max-height:calc(100vh - 90px);border-radius:4px;box-shadow:0 30px 80px rgba(0,0,0,.7)}
.eh-box.is-intern .eh-x{z-index:6}
@media (max-width:760px){.eh-iprojects{grid-template-columns:1fr}.eh-ihead{padding:22px 18px 0}.eh-iabout{padding:20px 18px 24px}}
@media (prefers-reduced-motion:reduce){.eh-walk i{animation:none}.eh-modal{animation:none}}
`

addPropertyControls(ExhibitionHall, {
    heading: { type: ControlType.String, title: "Heading", defaultValue: "The Work Gallery" },
    intro: {
        type: ControlType.String,
        title: "Intro",
        displayTextArea: true,
        defaultValue: "Five wings, one designer. Walk through posters, films, brands, products and internship work. Click any piece for the full story.",
    },
    contactLink: { type: ControlType.String, title: "Contact link", defaultValue: "/contact-us" },
    lightsOff: { type: ControlType.Boolean, title: "Start dark", defaultValue: true },
    vaarahiVideo: { type: ControlType.File, title: "Vaarahi reveal", allowedFileTypes: ["mp4", "webm", "mov"] },
    bgEntrance: { type: ControlType.String, title: "Entrance photo", defaultValue: "https://framerusercontent.com/images/PikmceQFVeidEhV02B2IpVm9ZZU.png?scale-down-to=2048" },
    bgPoster: { type: ControlType.String, title: "Poster room", defaultValue: "https://framerusercontent.com/images/VVaxnpJJmd5VkSmHHJLmucPUijM.png?scale-down-to=2048" },
    bgCinema: { type: ControlType.String, title: "Cinema room", defaultValue: "https://framerusercontent.com/images/6LPboue5XtHQ1DK70svzQqlC8.png?scale-down-to=2048" },
    bgBrand: { type: ControlType.String, title: "Brand room", defaultValue: "https://framerusercontent.com/images/dF857QrEscGw6pmX0yMdyosSdRw.png?scale-down-to=2048" },
    bgProduct: { type: ControlType.String, title: "Product room", defaultValue: "https://framerusercontent.com/images/GrmBxUXjEXow87JQ2IZksMkBOzw.png?scale-down-to=2048" },
    bgArchive: { type: ControlType.String, title: "Archive room", defaultValue: "https://framerusercontent.com/images/1eOi40cO9BzKjHmQVdBGCccpgE.png?scale-down-to=2048" },
    items: {
        type: ControlType.Array,
        title: "Pieces",
        description: "Leave empty to show the built-in pieces.",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title", defaultValue: "" },
                wing: {
                    type: ControlType.Enum,
                    title: "Wing",
                    options: ["poster", "animation", "brand", "product", "internship"],
                    optionTitles: ["Poster Wing", "Animation Cinema", "Brand Studio", "Product Lab", "Internship Archive"],
                    defaultValue: "poster",
                },
                image: { type: ControlType.String, title: "Image URL", defaultValue: "" },
                summary: { type: ControlType.String, title: "Summary", displayTextArea: true, defaultValue: "" },
                role: { type: ControlType.String, title: "Role", defaultValue: "" },
                tools: { type: ControlType.String, title: "Tools", defaultValue: "" },
                year: { type: ControlType.String, title: "Year", defaultValue: "" },
                client: { type: ControlType.String, title: "Client", defaultValue: "" },
                outcome: { type: ControlType.String, title: "Outcome", defaultValue: "" },
                video: { type: ControlType.String, title: "Video (mp4)", defaultValue: "" },
                link: { type: ControlType.String, title: "Link", defaultValue: "" },
                caseStudy: { type: ControlType.String, title: "Case study", defaultValue: "" },
                device: { type: ControlType.Enum, title: "Device", options: ["laptop", "phone"], optionTitles: ["Laptop", "Phone"], defaultValue: "laptop" },
            },
        },
        defaultValue: [],
    },
})
