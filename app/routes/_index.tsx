import {
  DataFunctionArgs,
  json,
  unstable_parseMultipartFormData,
  type MetaFunction,
  unstable_createMemoryUploadHandler,
} from "@remix-run/node"
import { useToasts } from "react-toast-notifications"
import { useState, useCallback } from "react"
import { Form, useSubmit } from "@remix-run/react"
import { GoUpload } from "react-icons/go"
import cloudinary from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  // cloud_name: "djdheokru",
  cloud_name: process.env.CLOUD_KEY,
  // api_key: "916189674925129",
  api_key: process.env.API_KEY,
  // api_secret: "zEfasMTonc42C1LiWqzAHft4DQg",
  api_secret: process.env.API_SECRET,
})

const MAX_SIZE = 1024 * 1024 * 5

export async function loader({ request }: DataFunctionArgs) {
  return json({})
}

export async function action({ request }: DataFunctionArgs) {
  const formData = await unstable_parseMultipartFormData(
    request,
    unstable_createMemoryUploadHandler({ maxPartSize: MAX_SIZE })
  )

  const data = Object.fromEntries(formData)

  return json({ data })
}

export const meta: MetaFunction = () => {
  return [
    { title: "Upload Test App" },
    { name: "description", content: "Welcome to Upload Test!" },
  ]
}

export default function Index() {
  const { addToast } = useToasts()
  const [fileImage, setFile] = useState<File | null>(null)
  const [fileImageBlob, setFileBlob] = useState<string | undefined>(undefined)

  const submit = useSubmit()

  const uploadFile = async (file: File, simulate: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000))

    if (simulate === "success") {
      addToast("Upload succeeded", { appearance: "success", autoDismiss: true })
    } else if (simulate === "fail") {
      addToast("Upload failed", { appearance: "error", autoDismiss: true })
    } else if (simulate === "cancel") {
      addToast("Upload cancelled", { appearance: "warning", autoDismiss: true })
    } else if (simulate === "pause") {
      addToast("Upload paused", { appearance: "info", autoDismiss: true })
    } else {
      addToast("Unknown simulation", { appearance: "error", autoDismiss: true })
    }
  }

  const uploadToCloudinary = async (file: string | Blob) => {
    const formData = new FormData()
    formData.append("picture", file)
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/djdheokru/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    )

    if (!response.ok) {
      addToast("Failed to upload image to Cloudinary", {
        appearance: "error",
        autoDismiss: true,
      })
    }

    const data = await response.json()
    return data.secure_url // Return the secure URL of the uploaded image
  }

  const onFinish = useCallback(
    async (values: any) => {
      if (!navigator.onLine) {
        addToast("Network is offline. Please check your connection.", {
          appearance: "error",
          autoDismiss: true,
        })
        return
      }
      const { image } = values
      if (!image || !image.file) {
        addToast("Please select an image", {
          appearance: "error",
          autoDismiss: true,
        })
        return
      }

      const file = image.file

      try {
        //Upload file without server
        const responseLocal = await uploadFile(file, "success")
        const formDataLocal = new FormData()
        formDataLocal.append("picture", file)
        submit(formDataLocal, {
          method: "post",
          encType: "multipart/form-data",
        })

        // Upload file to Cloudinary(Third Party)
        const imageUrl = await uploadToCloudinary(file)

        addToast(`Upload to Cloudinary succeeded,Link: ${imageUrl}`, {
          appearance: "success",
          autoDismiss: true,
        })

        //Upload file with mock server
        const formData = new FormData()
        formData.append("picture", file)
        const response = await fetch("http://localhost:3000/uploads", {
          method: "POST",
          body: formData,
        })
        if (!response.ok) {
          addToast("Upload failed to server", {
            appearance: "error",
            autoDismiss: true,
          })
        }
      } catch (error: any) {
        addToast(`Upload failed: ${error.message}`, {
          appearance: "error",
          autoDismiss: true,
        })
      }
    },
    [submit, addToast]
  )

  return !fileImage ? (
    <div className="flex justify-center items-center h-screen">
      <div className="mx-auto p-6 bg-white shadow-md rounded-3xl h-[70%] w-[60%]">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-raleway font-bold text-dark">
            Upload a property photo
          </h1>
          <span className="text-xs text-dark font-raleway font-medium w-[38%]">
            First impressions matter. Choose a photo that best represent your
            property.
          </span>
        </div>
        <Form
          className="w-full h-[250px]"
          method="post"
          encType="multipart/form-data"
        >
          <div
            className={`mt-6 bg-transparent w-full h-[100%] gap-8 flex flex-col justify-center items-center font-bold border border-dashed border-neutral rounded-2xl`}
          >
            <GoUpload color="#71737F" size={20} />
            <label className="text-dark">Import photo from:</label>
            <div className="flex gap-8 w-full px-8 items-center justify-center">
              <label
                className="flex items-center font-raleway justify-center cursor-pointer w-[25%] h-[50px] bg-transparent border border-neutral rounded-2xl"
                htmlFor="profilePhoto"
              >
                <span className="text-main text-lg">Keeps</span>
              </label>
              <label className="cursor-pointer w-[25%] h-[50px] bg-transparent border border-neutral rounded-2xl"></label>
              <label className="cursor-pointer w-[25%] h-[50px] bg-transparent border border-neutral rounded-2xl"></label>
            </div>
            <span className="text-sm font-normal text-neutral">
              Photo must be less than <b>5MB</b> and be a <b>JPG</b> or{" "}
              <b>PNG</b>
            </span>
            <input
              id="profilePhoto"
              type="file"
              hidden
              onChange={async e => {
                const file = e.currentTarget.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  setFile(file)
                  reader.onload = event => {
                    setFileBlob(event.target?.result?.toString() ?? undefined)
                  }
                  try {
                    await onFinish({ image: { file } })
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
          </div>
        </Form>
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center h-screen">
      <div className="mx-auto p-6 bg-white shadow-md rounded-3xl h-[60%] w-[60%]">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-raleway font-bold text-dark">
            Upload a property photo
          </h1>
          <span className="text-xs text-dark font-raleway font-medium w-[38%]">
            First impressions matter. Choose a photo that best represent your
            property.
          </span>
        </div>
        {/* <Form
          method="post"
          encType="multipart/form-data"
          onSubmit={event => {
            event.preventDefault()

            const formData = new FormData()
            if (fileImage) {
              formData.append("picture", fileImage)
              submit(formData, {
                method: "post",
                encType: "multipart/form-data",
              })
            }
          }}
        > */}
        <label
          className={`cursor-pointer mt-6 bg-transparent w-full h-[80%] gap-[10px] flex flex-col justify-center items-center font-bold rounded-2xl border-neutral relative`}
          htmlFor="profilePhoto"
        >
          <input
            id="profilePhoto"
            type="file"
            hidden
            onChange={async e => {
              const file = e.currentTarget.files?.[0]
              if (file) {
                const reader = new FileReader()
                setFile(file)
                reader.onload = event => {
                  setFileBlob(event.target?.result?.toString() ?? undefined)
                }
                try {
                  // Call onFinish function with the selected image
                  await onFinish({ image: { file } })
                } catch (error) {
                  console.error("Error while processing image:", error)
                }
                reader.readAsDataURL(file)
              }
            }}
          />
          <img src={fileImageBlob} className="w-full h-full rounded-2xl" />
        </label>
        {/* </Form> */}
      </div>
    </div>
  )
}
