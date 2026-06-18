"use client"

interface StatusMessageProps {
  status: string
  message: string
}

export default function StatusMessage({ status, message }: StatusMessageProps) {
  if (status === "success") {
    return (
      <div className="p-4 bg-green-100 text-green-800 rounded-md text-center font-medium animate-in slide-in-from-top duration-300">
        {message}
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-md text-center font-medium animate-in shake duration-300">
        {message}
      </div>
    )
  }

  return null
}
