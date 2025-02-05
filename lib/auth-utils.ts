import { randomBytes } from "crypto"

export function generateState() {
  return randomBytes(32).toString("hex")
}

export function validateState(savedState: string | undefined, receivedState: string | undefined): boolean {
  if (!savedState || !receivedState) {
    return false
  }
  return savedState === receivedState
}

