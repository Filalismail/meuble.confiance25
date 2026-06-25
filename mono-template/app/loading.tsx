export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#FF5722]/20 border-t-[#FF5722] rounded-full animate-spin" />
        <p className="text-sm text-neutral-400">Chargement...</p>
      </div>
    </div>
  )
}
