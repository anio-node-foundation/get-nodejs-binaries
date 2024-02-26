import os from "node:os"
import mapArchAndPlatform from "./mapArchAndPlatform.mjs"

export default async function(version) {
	const arch_platform_identifier = mapArchAndPlatform(
		os.platform(), os.arch(), version
	).link

	return `https://nodejs.org/dist/${version}/${arch_platform_identifier}.tar.gz`
}
