import fs from "fs/promises"

export function storeData(data: any) {
  return fs.writeFile("db.json", JSON.stringify({ uploads: data || [] }))
}
