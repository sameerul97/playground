import Image from "next/image"
import { getFullPath } from "@/helpers/pathHelper"

export default function Home() {
  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Image
            className="dark:invert"
            src={getFullPath("/next.svg")}
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <h1 className="font-bold">Playground</h1>
        </div>
      </main>
    </div>
  )
}
