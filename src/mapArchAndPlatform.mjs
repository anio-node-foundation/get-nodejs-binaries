export default function(platform, arch, ver = "") {
	if (platform === "linux") {
		switch (arch) {
			case "x64":
				return {file: "linux-x64", link: `node-${ver}-linux-x64`}

			case "arm64":
				return {file: "linux-arm64", link: `node-${ver}-linux-arm64`}
		}
	} else if (platform === "darwin") {
		switch (arch) {
			case "x64":
				return {file: "osx-x64-tar", link: `node-${ver}-darwin-x64`}

			case "arm64":
				return {file: "osx-arm64-tar", link: `node-${ver}-darwin-arm64`}
		}
	}

	throw new Error(`Unsupported platform/arch combination.`)
}
