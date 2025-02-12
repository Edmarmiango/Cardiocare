import Image from "next/image"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import type { User } from "@prisma/client"

interface UserAvatarProps {
  user: Pick<User, "name" | "profileImage">
  className?: string
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  console.log("UserAvatar props:", { user, className })

  const imageUrl = user.profileImage || "/placeholder.svg"
  const name = user.name || "User"


  return (
    <Avatar className={className}>
      {imageUrl !== "/placeholder.svg" ? (
        <div className="relative aspect-square h-full w-full">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={`${name}'s profile picture`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="rounded-full object-cover"
            onError={(e) => {
              console.error("Error loading image:", e)
              ;(e.target as HTMLImageElement).src = "/placeholder.svg"
            }}
          />
        </div>
      ) : (
        <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
      )}
    </Avatar>
  )
}

