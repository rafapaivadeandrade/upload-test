import { setup } from "twind"
import { virtualSheet } from "twind/sheets"

export const { tw } = setup({
  mode: "silent",
  hash: false,
  sheet: virtualSheet(),
})
