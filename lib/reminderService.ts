import type { Reminder } from "./Reminder"

interface ReminderInput {
  userId: string
  type: "medication" | "appointment" | "exam"
  title: string
  description?: string
  datetime: Date | string
}

export async function createReminder(reminderData: ReminderInput) {
  try {
    let formattedDatetime: string

    if (reminderData.datetime instanceof Date) {
      if (isNaN(reminderData.datetime.getTime())) {
        throw new Error("Invalid Date object")
      }
      formattedDatetime = reminderData.datetime.toISOString()
    } else if (typeof reminderData.datetime === "string") {
      const parsedDate = new Date(reminderData.datetime)
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date string")
      }
      formattedDatetime = parsedDate.toISOString()
    } else {
      throw new Error("Invalid datetime format")
    }

    console.log("Sending reminder data:", { ...reminderData, datetime: formattedDatetime })

    const response = await fetch("/api/reminders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...reminderData,
        datetime: formattedDatetime,
      }),
    })

    const responseData = await response.json()

    if (!response.ok || !responseData.success) {
      console.error("Error response:", responseData)
      throw new Error(responseData.error || `Failed to create reminder: ${response.status} ${response.statusText}`)
    }

    console.log("Reminder created successfully:", responseData.data)
    return responseData.data
  } catch (error) {
    console.error("Error creating reminder:", error)
    throw error instanceof Error ? error : new Error("Failed to create reminder")
  }
}

export async function getRemindersForUser(): Promise<Reminder[]> {
  try {
    const response = await fetch("/api/reminders")
    const responseData = await response.json()

    if (!response.ok || !responseData.success) {
      console.error("Error response:", responseData)
      throw new Error(responseData.error || `Failed to fetch reminders: ${response.status} ${response.statusText}`)
    }

    console.log("Fetched reminders:", responseData.data)
    return responseData.data
  } catch (error) {
    console.error("Error fetching reminders:", error)
    throw error instanceof Error ? error : new Error("Failed to fetch reminders")
  }
}

