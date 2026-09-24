import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg-primary)] p-4">
      <div className="text-center max-w-md">
        <p className="text-7xl font-bold text-[var(--color-accent)] tabular-nums">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-[var(--color-text-primary)] text-balance">
          页面不存在
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] text-pretty">
          你访问的链接可能已失效，或模型不存在
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-8 px-5 h-10 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
