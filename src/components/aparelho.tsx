/**
 * Everything inside this frame is the product; everything outside it is
 * instrumentation for whoever is reading the demo. Keeping the two apart is the
 * only reason the page can show the engine without putting debug information on
 * a screen a user would see.
 */
export function Aparelho({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* The light the screen throws on the page. Nothing else here is lit. */}
      <div
        aria-hidden
        className="bg-tinta/8 absolute -inset-10 -z-10 rounded-full blur-3xl"
      />

      <div className="relative rounded-[46px] border border-[rgb(244_241_234/0.16)] bg-[#050506] p-[11px] shadow-[0_50px_90px_-40px_rgba(0,0,0,0.9),inset_0_1px_0_rgb(244_241_234/0.14)]">
        <div
          className="relative overflow-hidden rounded-[36px] bg-[#0d0d0f]"
          style={{ aspectRatio: '360 / 730' }}
        >
          <div className="absolute top-2.5 left-1/2 z-30 h-[22px] w-[88px] -translate-x-1/2 rounded-full bg-[#050506]" />
          {children}
        </div>
      </div>
    </div>
  )
}
