import { Metadata } from "next"

import { Experience } from "./experience"

export const metadata: Metadata = {
  title: "Stranger Things Season 5 Web Experience",
}

export default function App() {
  return (
    <main className="w-full overflow-x-auto bg-black">
      <Experience />
    </main>
  )
}
