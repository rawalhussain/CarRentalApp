export interface IReel {
  id: string
  userAction?: 'like' | 'dislike' | null
  [key: string]: any // Allow additional properties
}

// Define common properties for both videos and live videos
export interface IBaseVideo {
  id: number
  filePath: string
  title?: string | null
  vendorId?: number
  vendorName?: string
  vendorImage?: string
  serviceTypeId?: number
  videoType: 'regular' | 'live' // Added videoType to differentiate
}

// Define type for pre-recorded videos
export interface IVideo extends IBaseVideo {
  totalLikes: number
  totalViews: number
  productId?: number | null
  productName?: string | null
  videoType: 'regular' // Explicitly set the type
}

// Define type for Live Session Products
export interface ILiveSessionProduct {
  productId: number
  productName: string
  price: number
  defaultImageUrl: string
}

// Define type for Live Videos
export interface ILiveVideo extends IBaseVideo {
  fileType: number
  liveSessionProducts?: ILiveSessionProduct[]
  videoType: 'live' // Explicitly set the type
}
