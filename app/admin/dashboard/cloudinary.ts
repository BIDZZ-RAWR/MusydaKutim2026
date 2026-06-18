const CLOUD_NAME = "dbm4jijlg"
const UPLOAD_PRESET = "Musyran"

export const uploadToCloudinary = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", UPLOAD_PRESET)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  })

  const data = await response.json()

  if (data.secure_url) {
    return data.secure_url as string
  } else {
    throw new Error(data.error?.message || "Gagal mendapatkan URL dari Cloudinary.")
  }
}
