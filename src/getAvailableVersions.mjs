import os from "node:os"
import mapArchAndPlatform from "./mapArchAndPlatform.mjs"

export default async function() {
	let ret = []

	const arch_platform_identifier = mapArchAndPlatform(os.platform(), os.arch()).file

	const response = await fetch("https://nodejs.org/dist/index.tab")
	const list = await response.text()
	// first line is description
	const entries = list.split("\n").slice(1)

	for (const entry of entries) {
		const fields = entry.split("\t")

		if (2 >= fields.length) continue

		const [version, date, files_str] = fields
		const files = files_str.split(",")

		if (!files.includes(arch_platform_identifier)) continue

		ret.push(version)
	}

	return ret
}
