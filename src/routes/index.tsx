import { Button } from '#/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {

  return (
    <div className="grid grid-rows-[4rem_1fr]">
      <div className="flex px-5 py-4 items-center border border-t-neutral-950 border-l-neutral-950 border-r-neutral-950 flex-row justify-between">
        <span className="font-semibold text-xl">Sonant</span>
        <Link to="/app/friends">
          <Button className="cursor-pointer" variant="outline">
            <span>Sign Up</span>
          </Button>
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-y-2">
          <h1 className="text-6xl font-semibold">Sonant</h1>
          <Link to="/app/friends">
            <Button className="cursor-pointer" variant="outline">
              <span>Open Sonant</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )

}
