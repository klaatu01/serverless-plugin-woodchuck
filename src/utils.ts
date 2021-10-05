import { Arch } from "./types"

export const getArch = (providerArch: Arch, fn: any) => {
  return !!fn.architecture ? fn.architecture : (!!providerArch ? providerArch : "x86_64")
}
