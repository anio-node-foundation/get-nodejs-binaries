import {
	getAvailableVersions,
	getDownloadURL,
	download
} from "../src/index.mjs"

const versions = await getAvailableVersions()
const link = await getDownloadURL(versions[0])

console.log(
	await download(versions[0])
)
