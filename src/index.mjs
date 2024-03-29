import impl_getAvailableVersions from "./getAvailableVersions.mjs"
import impl_getDownloadURL from "./getDownloadURL.mjs"
import impl_download from "./download.mjs"
import impl_getVersionFromSpecifier from "./getVersionFromSpecifier.mjs"

export const getAvailableVersions = impl_getAvailableVersions
export const getDownloadURL = impl_getDownloadURL
export const download = impl_download
export const getVersionFromSpecifier = impl_getVersionFromSpecifier

export default {
	getAvailableVersions,
	getDownloadURL,
	download,
	getVersionFromSpecifier
}
