import { useToasts } from "react-toast-notifications"
import { google } from "googleapis"

export default function GoogleDrive({ setFile, setFileBlob }: any) {
  const { addToast } = useToasts()
  const CLIENT_ID = import.meta.env.CLIENT_ID
  const CLIENT_SECRET = import.meta.env.CLIENT_SECRET
  const REDIRECT_URI = import.meta.env.REDIRECT_URI
  const REFRESH_TOKEN = import.meta.env.REFRESH_TOKEN

  const oauth2client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  )

  oauth2client.setCredentials({ refresh_token: REFRESH_TOKEN })

  const drive = google.drive({
    version: "v3",
    auth: oauth2client,
  })

  async function uploadToGoogleDrive(file: { name: any; type: any }) {
    const res = await drive.files.create({
      requestBody: {
        name: file.name,
        mimeType: file.type,
      },
      media: {
        mimeType: file.type,
        body: file,
      },
    })
    if ((res.status = 200)) {
      addToast("Upload succeeded", { appearance: "success", autoDismiss: true })
    }
  }

  return (
    <>
      <label
        className="flex items-center justify-center font-raleway cursor-pointer w-[25%] h-[50px] bg-transparent border border-neutral rounded-2xl"
        htmlFor="drive"
      >
        <img src="/drive.png" alt="drive logo" className="w-12" />
        <span className="text-dark text-lg">Drive</span>
      </label>
      <input
        id="drive"
        name="file"
        type="file"
        hidden
        onChange={async e => {
          const file = e.currentTarget.files?.[0]
          if (file) {
            setFile(file)
            const reader = new FileReader()
            reader.onload = event => {
              setFileBlob(event.target?.result?.toString() ?? undefined)
            }
            try {
              await uploadToGoogleDrive(file)
            } catch (error) {
              addToast(`Error while processing image:`, {
                appearance: "error",
                autoDismiss: true,
              })
            }
            reader.readAsDataURL(file)
          }
        }}
      />
    </>
  )
}
