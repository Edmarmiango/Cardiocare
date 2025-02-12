export interface Reminder {
    id: string
    title: string
    description: string
    datetime: string
    type: "medication" | "appointment" | "exam"
  }
  
  