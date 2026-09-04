/**
 * Everything inside this frame is the product; everything outside it is
 * instrumentation for whoever is reading the demo. Keeping the two apart is the
 * only reason the page can show the engine without putting debug information on
 * a screen a user would see.
 */
export function Aparelho({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-linha-forte bg-tinta rounded-[46px] border p-[11px] shadow-[0_40px_80px_-45px_rgba(23,21,15,0.6)]">
      <div
        className="bg-superficie relative overflow-hidden rounded-[36px]"
        style={{ aspectRatio: '360 / 730' }}
      >
        <div className="bg-tinta absolute top-2.5 left-1/2 z-30 h-[22px] w-[88px] -translate-x-1/2 rounded-full" />
        {children}
      </div>
    </div>
  )
}
