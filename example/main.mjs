import {
	getAvailableVersions,
	getDownloadURL,
	download,
	getVersionFromSpecifier
} from "../src/index.mjs"

const versions = await getAvailableVersions()
const link = await getDownloadURL(versions[0])

console.log(
	getVersionFromSpecifier(versions, "v19")
)

console.log(
	await download(versions[0])
)
