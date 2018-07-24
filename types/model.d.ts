declare interface User {
  displayName: string
  photoURL: string
  email: string
}

type FirestoreDateType = {
  toDate: () => Date,
}

type FirestoreTimestamp = {
  seconds: number,
  nanoseconds: number,
}

declare interface PartyCommonProps {
  id?: string
  category: Category
  title: string
  description: string
  destinationName: string
  playName: string
  isDelivery: boolean
  maxPartyMember: number
  joinners: string[]
  createdBy: string
  createdAt: FirestoreTimestamp
}

declare interface Party extends PartyCommonProps {
  dueDateTime: FirestoreDateType | null
  partyTime: FirestoreDateType
  fetchedJoinners?: User[]
}

declare interface PartyFormData extends PartyCommonProps {
  partyTimeDate: Date
  dueDateTimeDate: Date | null
}

declare interface CategoryMeta {
  isRestaurant: boolean
  isDeliverable: boolean
  isTravel: boolean
  isPlaying: boolean
  hasDueDateTime?: boolean
}

declare interface Destination extends CategoryMeta {
  id: string
  partyCreatedCount: number
}

declare interface PartyCommentFormData {
  id?: string
  partyId: string
  content: string
  user: User
}

declare interface PartyComment extends PartyCommentFormData {  
  isDisplay: boolean
  isEdited: boolean  
  createdAt: {
    toDate: Function
  }
  createdBy: string
  updatedAt?: {
    toDate: Function
  }  
}

declare interface Category extends CategoryMeta {
  id: string,
  name: string,
  emoji: string,
}
