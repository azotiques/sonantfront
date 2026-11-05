import { Link } from "@tanstack/react-router";
import { Users2 } from "lucide-react";

export function FriendsButton() {
  return (
    <div>
      <Link to="/app/friends">
        <button className="flex cursor-pointer h-14 gap-x-2 w-full p-2 items-center rounded-md hover:bg-sidebar-accent">
          <div className="flex gap-x-2 flex-row rounded-md items-center text-left text-sm leading-tight">
            <Users2 />
            <span className="truncate font-semibold">
              Friends
            </span>
          </div>
        </button>
      </Link>
    </div>
  )
}
