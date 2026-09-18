export default function Loading() {
  return (
    <div className="container-page flex flex-col gap-10 pt-10 pb-18 md:pt-14" aria-busy="true">
      <span className="sr-only" role="status">Chargement des destinations…</span>
      <div className="flex max-w-3xl flex-col gap-4">
        <div className="h-4 w-24 rounded bg-sand" />
        <div className="h-14 w-80 max-w-full rounded bg-sand md:h-18" />
        <div className="h-5 w-2/3 rounded bg-sand" />
      </div>
      <div className="h-32 border-y border-line" />
      <ul className="grid animate-pulse gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="flex flex-col gap-3">
            <div className="hatch aspect-[3/2] rounded" />
            <div className="h-7 w-1/2 rounded bg-sand" />
            <div className="h-4 w-1/3 rounded bg-sand" />
          </li>
        ))}
      </ul>
    </div>
  );
}
