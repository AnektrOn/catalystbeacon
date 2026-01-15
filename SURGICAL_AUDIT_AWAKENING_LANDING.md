# Surgical Code Audit: AwakeningLandingPage.jsx
## Line-by-Line Actionable Changes (Rajdhani retained for lowercase body copy)

---

* **Line 281:** `<Link to="/login" className="hidden md:block text-sm font-rajdhani tracking-widest text-gray-400 hover:text-cyan-200 transition-colors uppercase">`
    * 🔴 **Error:** Header link applies `uppercase` + `tracking-widest` even though it sits next to lowercase Rajdhani copy.
    * 🟢 **Fix:** `<Link to="/login" className="hidden md:block text-sm font-cinzel tracking-wide text-gray-400 hover:text-cyan-200 transition-colors">`

---

* **Line 286:** `INITIALIZE`
    * 🔴 **Error:** CTA copy is all caps; the surrounding paragraphs use sentence case.
    * 🟢 **Fix:** `Initialize`

---

* **Line 332:** `BEGIN THE JOURNEY`
    * 🔴 **Error:** Primary hero CTA is fully uppercase, breaking tonal consistency.
    * 🟢 **Fix:** `Begin the Journey`

---

* **Line 371:** `<p className="font-rajdhani text-xl text-gray-400 uppercase tracking-widest">`
    * 🔴 **Error:** Subtitle relies on `uppercase` + `tracking-widest` despite being prose.
    * 🟢 **Fix:** `<p className="font-cinzel text-xl text-gray-400 tracking-wide">`

---

* **Line 528:** `stage: "01. INITIALIZE",`
    * 🔴 **Error:** Phase labels are hard uppercase, yet they function as descriptive sentences.
    * 🟢 **Fix:** `stage: "01. Initialize",`

---

* **Line 541:** `stage: "02. AWAKENING",`
    * 🔴 **Error:** Same uppercase issue as above.
    * 🟢 **Fix:** `stage: "02. Awakening",`

---

* **Line 554:** `stage: "03. ASCENSION",`
    * 🔴 **Error:** Same uppercase issue as above.
    * 🟢 **Fix:** `stage: "03. Ascension",`

---

* **Line 573:** `stage: "04. MASTERY",`
    * 🔴 **Error:** Same uppercase issue as above.
    * 🟢 **Fix:** `stage: "04. Mastery",`

---

* **Line 929:** `START FREE`
    * 🔴 **Error:** Pricing CTA is fully uppercase.
    * 🟢 **Fix:** `Start Free`

---

* **Line 958:** `UPGRADE SYSTEM`
    * 🔴 **Error:** Pricing CTA is fully uppercase.
    * 🟢 **Fix:** `Upgrade System`

---

* **Line 974:** `<div className="flex gap-10 text-sm font-rajdhani text-gray-400 tracking-[0.15em] uppercase">`
    * 🔴 **Error:** Footer links reuse uppercase + tight tracking in body copy.
    * 🟢 **Fix:** `<div className="flex gap-10 text-sm font-cinzel text-gray-400 tracking-wide">`

---

## Summary

**Total Issues Found:** 10 (all uppercase/tracking adjustments)
- **Uppercase CTAs:** 5 instances (`INITIALIZE`, `BEGIN THE JOURNEY`, `START FREE`, `UPGRADE SYSTEM`, `Full Access` badge remains uppercase by design)
- **Stage labels:** 4 instances that should read as sentence fragments
- **Footer letter spacing:** 1 occurrence of `uppercase` + `tracking-[0.15em]`
- **Rajdhani usage:** Intentional for lowercase copy; no additional changes required beyond the above
# Surgical Code Audit: AwakeningLandingPage.jsx
## Line-by-Line Actionable Changes

---

* **Line 37:** `border border-white/10 text-[#e0e0e0] font-rajdhani`
  * 🔴 **Error:** Font override (Rajdhani) in NeomorphicCard base styles. Should inherit default Cinzel.
  * 🟢 **Fix:** `border border-white/10 text-[#e0e0e0]`

---

* **Line 135:** `font-family: 'Rajdhani', sans-serif;`
  * 🔴 **Error:** Global body font override contradicts global config (Cinzel should be default).
  * 🟢 **Fix:** `font-family: 'Cinzel', serif;`

---

* **Line 281:** `<Link to="/login" className="hidden md:block text-sm font-rajdhani tracking-widest text-gray-400 hover:text-cyan-200 transition-colors uppercase">`
  * 🔴 **Error:** Font override (Rajdhani) + Unnecessary uppercase class on navigation link + tracking-widest on body text.
  * 🟢 **Fix:** `<Link to="/login" className="hidden md:block text-sm font-cinzel tracking-wide text-gray-400 hover:text-cyan-200 transition-colors">`

---

* **Line 286:** `INITIALIZE`
  * 🔴 **Error:** Hardcoded uppercase text in button. Should be sentence case.
  * 🟢 **Fix:** `Initialize`

---

* **Line 316:** `className={`text-6xl md:text-8xl font-bold mb-8 leading-tight font-rajdhani text-white ${glitchActive ? 'glitch' : ''}`}`
  * 🔴 **Error:** Font override (Rajdhani) on H1. Should use font-cinzel or remove to inherit default.
  * 🟢 **Fix:** `className={`text-6xl md:text-8xl font-bold mb-8 leading-tight font-cinzel text-white ${glitchActive ? 'glitch' : ''}`}`

---

* **Line 323:** `className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-light font-rajdhani tracking-wide leading-relaxed"`
  * 🔴 **Error:** Font override (Rajdhani) on body paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-light tracking-wide leading-relaxed"`

---

* **Line 332:** `BEGIN THE JOURNEY`
  * 🔴 **Error:** Hardcoded uppercase text in button. Should be sentence case.
  * 🟢 **Fix:** `Begin the Journey`

---

* **Line 336:** `className="btn-ethereal-text rounded-full px-8 py-8 text-lg font-rajdhani"`
  * 🔴 **Error:** Font override (Rajdhani) on button. Should inherit default or use font-cinzel.
  * 🟢 **Fix:** `className="btn-ethereal-text rounded-full px-8 py-8 text-lg font-cinzel"`

---

* **Line 371:** `className="font-rajdhani text-xl text-gray-400 uppercase tracking-widest"`
  * 🔴 **Error:** Font override (Rajdhani) + Unnecessary uppercase class on subtitle + tracking-widest on body text.
  * 🟢 **Fix:** `className="font-cinzel text-xl text-gray-400 tracking-wide"`

---

* **Line 385:** `className="space-y-6 font-rajdhani text-lg text-gray-500"`
  * 🔴 **Error:** Font override (Rajdhani) on list items. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="space-y-6 text-lg text-gray-500"`

---

* **Line 411:** `className="space-y-6 font-rajdhani text-lg text-gray-300"`
  * 🔴 **Error:** Font override (Rajdhani) on list items. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="space-y-6 text-lg text-gray-300"`

---

* **Line 441:** `className="text-xl md:text-2xl font-rajdhani text-gray-300 leading-relaxed"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-xl md:text-2xl text-gray-300 leading-relaxed"`

---

* **Line 444:** `className="text-lg md:text-xl font-rajdhani text-gray-400 leading-relaxed"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-lg md:text-xl text-gray-400 leading-relaxed"`

---

* **Line 447:** `className="text-lg md:text-xl font-rajdhani text-cyan-200 leading-relaxed font-semibold"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-lg md:text-xl text-cyan-200 leading-relaxed font-semibold"`

---

* **Line 453:** `className="text-base md:text-lg font-rajdhani text-gray-400"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-base md:text-lg text-gray-400"`

---

* **Line 456:** `className="text-base md:text-lg font-rajdhani text-gray-400"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-base md:text-lg text-gray-400"`

---

* **Line 459:** `className="text-base md:text-lg font-rajdhani text-gray-400"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-base md:text-lg text-gray-400"`

---

* **Line 465:** `className="text-lg md:text-xl font-rajdhani text-white leading-relaxed"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-lg md:text-xl text-white leading-relaxed"`

---

* **Line 485:** `className="text-base font-rajdhani text-gray-300 leading-relaxed"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-base text-gray-300 leading-relaxed"`

---

* **Line 492:** `className="text-lg md:text-xl font-rajdhani text-gray-300 mb-6 italic"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-lg md:text-xl text-gray-300 mb-6 italic"`

---

* **Line 495:** `className="text-lg md:text-xl font-rajdhani text-cyan-200 font-semibold"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-lg md:text-xl text-cyan-200 font-semibold"`

---

* **Line 501:** `className="btn-ethereal-text rounded-full px-8 py-4 text-base font-rajdhani"`
  * 🔴 **Error:** Font override (Rajdhani) on button. Should inherit default or use font-cinzel.
  * 🟢 **Fix:** `className="btn-ethereal-text rounded-full px-8 py-4 text-base font-cinzel"`

---

* **Line 517:** `className="font-rajdhani text-xl text-gray-400"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-xl text-gray-400"`

---

* **Line 528:** `stage: "01. INITIALIZE",`
  * 🔴 **Error:** Hardcoded uppercase text in stage label. Should be sentence case.
  * 🟢 **Fix:** `stage: "01. Initialize",`

---

* **Line 541:** `stage: "02. AWAKENING",`
  * 🔴 **Error:** Hardcoded uppercase text in stage label. Should be sentence case.
  * 🟢 **Fix:** `stage: "02. Awakening",`

---

* **Line 554:** `stage: "03. ASCENSION",`
  * 🔴 **Error:** Hardcoded uppercase text in stage label. Should be sentence case.
  * 🟢 **Fix:** `stage: "03. Ascension",`

---

* **Line 573:** `stage: "04. MASTERY",`
  * 🔴 **Error:** Hardcoded uppercase text in stage label. Should be sentence case.
  * 🟢 **Fix:** `stage: "04. Mastery",`

---

* **Line 599:** `className={`text-lg md:text-xl font-bold font-rajdhani tracking-widest ${step.color} text-shadow-glow flex-1`}`
  * 🔴 **Error:** Font override (Rajdhani) + tracking-widest on body text (stage heading).
  * 🟢 **Fix:** `className={`text-lg md:text-xl font-bold font-cinzel tracking-wide ${step.color} text-shadow-glow flex-1`}`

---

* **Line 602:** `className={`text-base md:text-lg font-semibold font-rajdhani mb-3 md:mb-4 ${step.color}`}`
  * 🔴 **Error:** Font override (Rajdhani) on subtitle. Should inherit default Cinzel.
  * 🟢 **Fix:** `className={`text-base md:text-lg font-semibold mb-3 md:mb-4 ${step.color}`}`

---

* **Line 603:** `className="text-gray-300 font-rajdhani leading-relaxed text-sm md:text-base mb-3 md:mb-4"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-gray-300 leading-relaxed text-sm md:text-base mb-3 md:mb-4"`

---

* **Line 606:** `className="text-gray-400 font-rajdhani leading-relaxed text-sm md:text-base"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-gray-400 leading-relaxed text-sm md:text-base"`

---

* **Line 613:** `className="text-gray-300 font-rajdhani text-xs md:text-sm italic"`
  * 🔴 **Error:** Font override (Rajdhani) on text. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-gray-300 text-xs md:text-sm italic"`

---

* **Line 621:** `className="text-gray-300 font-rajdhani leading-relaxed text-sm md:text-base mt-auto pt-3 md:pt-4 border-t border-white/10 italic"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-gray-300 leading-relaxed text-sm md:text-base mt-auto pt-3 md:pt-4 border-t border-white/10 italic"`

---

* **Line 634:** `className="text-xl md:text-2xl font-rajdhani text-gray-300 leading-relaxed mb-2"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-2"`

---

* **Line 637:** `className="text-xl md:text-2xl font-rajdhani text-cyan-200 font-semibold"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-xl md:text-2xl text-cyan-200 font-semibold"`

---

* **Line 645:** `className="btn-ethereal-text rounded-full px-8 py-4 text-base font-rajdhani"`
  * 🔴 **Error:** Font override (Rajdhani) on button. Should inherit default or use font-cinzel.
  * 🟢 **Fix:** `className="btn-ethereal-text rounded-full px-8 py-4 text-base font-cinzel"`

---

* **Line 661:** `className="text-xl md:text-2xl font-rajdhani text-gray-400 mb-6"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-xl md:text-2xl text-gray-400 mb-6"`

---

* **Line 669:** `className="text-lg md:text-xl font-rajdhani text-gray-400"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-lg md:text-xl text-gray-400"`

---

* **Line 672:** `className="text-lg md:text-xl font-rajdhani text-gray-400"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-lg md:text-xl text-gray-400"`

---

* **Line 675:** `className="text-xl md:text-2xl font-rajdhani text-cyan-200 font-semibold"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-xl md:text-2xl text-cyan-200 font-semibold"`

---

* **Line 687:** `className="text-lg md:text-xl font-rajdhani text-gray-300 mb-4"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-lg md:text-xl text-gray-300 mb-4"`

---

* **Line 690:** `className="text-xl md:text-2xl font-rajdhani text-cyan-200 font-semibold mb-6 italic"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-xl md:text-2xl text-cyan-200 font-semibold mb-6 italic"`

---

* **Line 694:** `className="text-base md:text-lg font-rajdhani text-gray-400"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-base md:text-lg text-gray-400"`

---

* **Line 697:** `className="text-base md:text-lg font-rajdhani text-gray-400"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-base md:text-lg text-gray-400"`

---

* **Line 716:** `phase: "DECONDITIONING",`
  * 🔴 **Error:** Hardcoded uppercase text in phase name. Should be sentence case.
  * 🟢 **Fix:** `phase: "Deconditioning",`

---

* **Line 730:** `phase: "REORIENTATION",`
  * 🔴 **Error:** Hardcoded uppercase text in phase name. Should be sentence case.
  * 🟢 **Fix:** `phase: "Reorientation",`

---

* **Line 745:** `phase: "INTEGRATION",`
  * 🔴 **Error:** Hardcoded uppercase text in phase name. Should be sentence case.
  * 🟢 **Fix:** `phase: "Integration",`

---

* **Line 759:** `phase: "EXPANSION",`
  * 🔴 **Error:** Hardcoded uppercase text in phase name. Should be sentence case.
  * 🟢 **Fix:** `phase: "Expansion",`

---

* **Line 809:** `className={`text-xl md:text-2xl font-bold font-rajdhani tracking-wide ${phase.color}`}`
  * 🔴 **Error:** Font override (Rajdhani) on phase heading. Should use font-cinzel.
  * 🟢 **Fix:** `className={`text-xl md:text-2xl font-bold font-cinzel tracking-wide ${phase.color}`}`

---

* **Line 812:** `className={`text-base md:text-lg font-rajdhani ${phase.color} font-medium`}`
  * 🔴 **Error:** Font override (Rajdhani) on subtitle. Should inherit default Cinzel.
  * 🟢 **Fix:** `className={`text-base md:text-lg ${phase.color} font-medium`}`

---

* **Line 819:** `className="text-gray-300 font-rajdhani text-sm md:text-base leading-relaxed"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-gray-300 text-sm md:text-base leading-relaxed"`

---

* **Line 828:** `className="text-gray-400 font-rajdhani text-sm leading-relaxed flex-1"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-gray-400 text-sm leading-relaxed flex-1"`

---

* **Line 838:** `className="text-gray-300 font-rajdhani text-sm mb-3 font-medium"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-gray-300 text-sm mb-3 font-medium"`

---

* **Line 845:** `className={`font-rajdhani text-sm ${phase.color}`}`
  * 🔴 **Error:** Font override (Rajdhani) on text. Should inherit default Cinzel.
  * 🟢 **Fix:** `className={`text-sm ${phase.color}`}`

---

* **Line 856:** `className={`font-rajdhani text-sm leading-relaxed ${phase.color} italic`}`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className={`text-sm leading-relaxed ${phase.color} italic`}`

---

* **Line 866:** `className="md:hidden mt-4 flex items-center gap-2 text-gray-400 hover:text-cyan-200 transition-colors text-sm font-rajdhani w-full"`
  * 🔴 **Error:** Font override (Rajdhani) on button text. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="md:hidden mt-4 flex items-center gap-2 text-gray-400 hover:text-cyan-200 transition-colors text-sm font-cinzel w-full"`

---

* **Line 884:** `className="text-xl md:text-2xl font-rajdhani text-gray-300 leading-relaxed"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-xl md:text-2xl text-gray-300 leading-relaxed"`

---

* **Line 887:** `className="text-xl md:text-2xl font-rajdhani text-cyan-200 font-semibold mt-2"`
  * 🔴 **Error:** Font override (Rajdhani) on paragraph. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-xl md:text-2xl text-cyan-200 font-semibold mt-2"`

---

* **Line 917:** `INITIATE`
  * 🔴 **Error:** Hardcoded uppercase text in tier heading. Should be sentence case.
  * 🟢 **Fix:** `Initiate`

---

* **Line 922:** `className="flex items-center gap-4 text-gray-400 font-rajdhani"`
  * 🔴 **Error:** Font override (Rajdhani) on list items. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="flex items-center gap-4 text-gray-400"`

---

* **Line 929:** `START FREE`
  * 🔴 **Error:** Hardcoded uppercase text in button. Should be sentence case.
  * 🟢 **Fix:** `Start Free`

---

* **Line 936:** `FULL ACCESS`
  * 🔴 **Error:** Hardcoded uppercase text in badge. Should be sentence case.
  * 🟢 **Fix:** `Full Access`

---

* **Line 940:** `ARCHITECT`
  * 🔴 **Error:** Hardcoded uppercase text in tier heading. Should be sentence case.
  * 🟢 **Fix:** `Architect`

---

* **Line 951:** `className="flex items-center gap-4 text-white font-rajdhani"`
  * 🔴 **Error:** Font override (Rajdhani) on list items. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="flex items-center gap-4 text-white"`

---

* **Line 958:** `UPGRADE SYSTEM`
  * 🔴 **Error:** Hardcoded uppercase text in button. Should be sentence case.
  * 🟢 **Fix:** `Upgrade System`

---

* **Line 972:** `className="text-gray-500 font-rajdhani text-sm tracking-wide"`
  * 🔴 **Error:** Font override (Rajdhani) on footer text. Should inherit default Cinzel.
  * 🟢 **Fix:** `className="text-gray-500 text-sm tracking-wide"`

---

* **Line 974:** `className="flex gap-10 text-sm font-rajdhani text-gray-400 tracking-[0.15em] uppercase"`
  * 🔴 **Error:** Font override (Rajdhani) + Unnecessary uppercase class on footer navigation links + excessive tracking.
  * 🟢 **Fix:** `className="flex gap-10 text-sm font-cinzel text-gray-400 tracking-wide"`

---

## Summary

**Total Issues Found:** 68
- **Font Override Issues:** 50 instances of `font-rajdhani` that should be removed or changed to `font-cinzel`
- **Hardcoded Uppercase Text:** 13 instances that should be sentence case
- **Unnecessary Uppercase Classes:** 3 instances (lines 281, 371, 974)
- **Tracking Issues:** 3 instances of `tracking-widest` that should be `tracking-wide` (lines 281, 371, 599)
- **Global Style Override:** 1 instance (line 135)
