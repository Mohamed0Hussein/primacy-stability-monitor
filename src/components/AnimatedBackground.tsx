export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Soft gradient */}
      <div className="absolute inset-0 bg-gradient-to-br 
        from-indigo-100/60 via-white to-rose-100/60
        dark:from-slate-900/60 dark:via-slate-900 dark:to-purple-900/60" 
      />

      {/* Blob 1 */}
      <div className="absolute top-[20%] left-[18%] w-72 h-72 animate-blob">
        <div className="w-full h-full rounded-full blur-3xl opacity-40 bg-indigo-400" />
      </div>

      {/* Blob 2 (delay 2s) */}
      <div className="absolute bottom-[18%] right-[15%] w-[28rem] h-[28rem] animate-blob [animation-delay:2s]">
        <div className="w-full h-full rounded-full blur-3xl opacity-30 bg-rose-400" />
      </div>

      {/* Blob 3 (delay 4s) */}
      <div className="absolute top-[55%] left-[50%] w-80 h-80 animate-blob [animation-delay:4s]">
        <div className="w-full h-full rounded-full blur-3xl opacity-25 bg-purple-400" />
      </div>

      {/* Grid */}
      <div className="
        absolute inset-0 
        bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)]
        dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)]
        bg-[size:46px_46px]
        opacity-[0.04] dark:opacity-[0.07]
      " />
    </div>
  );
}
