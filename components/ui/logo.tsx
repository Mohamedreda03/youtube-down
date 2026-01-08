export function Logo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-2 font-bold text-xl tracking-tighter ${className}`}
    >
      <div className="relative flex items-center justify-center w-8 h-8 text-primary">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <rect width="32" height="32" rx="8" className="fill-primary" />
          <path
            d="M21.5 15.134C22.1667 15.5189 22.1667 16.4811 21.5 16.866L13.25 21.6291C12.5833 22.014 11.75 21.5329 11.75 20.7631L11.75 11.2369C11.75 10.4671 12.5833 9.98598 13.25 10.3709L21.5 15.134Z"
            className="fill-primary-foreground"
          />
        </svg>
      </div>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
        Tube<span className="text-primary">Down</span>
      </span>
    </div>
  );
}
