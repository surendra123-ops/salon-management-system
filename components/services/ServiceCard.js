"use client"

const CATEGORY_IMAGES = {
  "men's hair cut": "https://images.pexels.com/photos/9992818/pexels-photo-9992818.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  "foam shave": "https://images.pexels.com/photos/4947276/pexels-photo-4947276.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  "head massage": "https://www.shioya-hair.com/head-spa/upload_images/headspa_img06.jpg",
  "d-tan": "https://images.pexels.com/photos/4586721/pexels-photo-4586721.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  "facials": "https://images.pexels.com/photos/34930097/pexels-photo-34930097.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  "hair spa": "https://images.pexels.com/photos/7755680/pexels-photo-7755680.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  "full body massage": "https://images.pexels.com/photos/5888130/pexels-photo-5888130.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  "makeup": "https://images.pexels.com/photos/33580447/pexels-photo-33580447.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  "eyebrows": "https://divinebeautylounge.com.au/uploads/1722500629_3f6d59fa6383eed9baea.webp",
  "waxing": "https://images.pexels.com/photos/35103884/pexels-photo-35103884.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  "hydro facial": "https://images.pexels.com/photos/4586746/pexels-photo-4586746.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  "pedicure": "https://images.pexels.com/photos/34930123/pexels-photo-34930123.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  // Fallbacks for similar categories
  haircut: "https://images.pexels.com/photos/9992818/pexels-photo-9992818.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  facial: "https://images.pexels.com/photos/34930097/pexels-photo-34930097.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  massage: "https://images.pexels.com/photos/5888130/pexels-photo-5888130.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  default: "https://images.pexels.com/photos/33580447/pexels-photo-33580447.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
}

const getCategoryImage = (category, name) => {
  // Try exact match on category first
  const categoryKey = (category || "").toLowerCase().trim()
  if (CATEGORY_IMAGES[categoryKey]) return CATEGORY_IMAGES[categoryKey]

  // Try exact match on name
  const nameKey = (name || "").toLowerCase().trim()
  if (CATEGORY_IMAGES[nameKey]) return CATEGORY_IMAGES[nameKey]

  // Try partial match on name
  const nameLower = (name || "").toLowerCase()
  for (const [keyword, url] of Object.entries(CATEGORY_IMAGES)) {
    if (nameLower.includes(keyword)) return url
  }

  // Try partial match on category
  for (const [keyword, url] of Object.entries(CATEGORY_IMAGES)) {
    if (categoryKey.includes(keyword)) return url
  }

  return CATEGORY_IMAGES.default
}

const ServiceCard = ({ service, onEdit, onDelete }) => {
  const imageUrl = service.image || getCategoryImage(service.category, service.name)

  return (
    <div className="bg-card rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="relative h-44 bg-background overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={service.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-primary truncate">{service.name}</h3>
        <p className="text-lg font-bold text-button-primary mt-auto pt-2">
          ₹{Number(service.price).toLocaleString("en-IN")}
        </p>

        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => onEdit(service)}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-secondary hover:text-button-primary hover:bg-accent-total-bg rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => onDelete(service)}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default ServiceCard
