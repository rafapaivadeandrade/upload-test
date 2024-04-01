import { useToasts } from "react-toast-notifications"
import { Dropbox } from "dropbox"

export default function DropBox({ setFile, setFileBlob }: any) {
  const { addToast } = useToasts()
  const upload_dropbox = import.meta.env.VITE_ACCESS_TOKEN

  const dbx = new Dropbox({
    accessToken: upload_dropbox,
  })

  async function uploadToDropbox(file: { name: string }) {
    const res = await dbx.filesUpload({
      path: "/" + file.name,
      contents: file,
    })
    if ((res.status = 200)) {
      addToast("Upload succeeded", { appearance: "success", autoDismiss: true })
    }
  }

  return (
    <>
      <label
        className="flex items-center justify-center font-raleway cursor-pointer w-[25%] h-[50px] bg-transparent border border-neutral rounded-2xl"
        htmlFor="dropbox"
      >
        <img src="/dropbox.jpg" alt="dropbox logo" className="w-20" />
        <span className="text-dark text-lg -ml-5">Dropbox</span>
      </label>
      <input
        id="dropbox"
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
              await uploadToDropbox(file)
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
