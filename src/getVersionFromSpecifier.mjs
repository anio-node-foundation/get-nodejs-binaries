function normalizeVersionSpecifier(str) {
	if (str.startsWith("v")) {
		str = str.slice(1)
	}

	let tmp = str.split(".")
	let major = null, minor = null, bugfix = null

	if (tmp.length >= 1 && tmp[0].length) {
		major = parseInt(tmp[0], 10)
	}

	if (tmp.length >= 2 && tmp[1].length) {
		minor = parseInt(tmp[1], 10)
	}

	if (tmp.length >= 3 && tmp[2].length) {
		bugfix = parseInt(tmp[2], 10)
	}

	return {major, minor, bugfix}
}

function compareVersions(specifier, version) {
	version = normalizeVersionSpecifier(version)

	if (specifier.major !== null) {
		if (specifier.major !== version.major) {
			return false
		}
	}

	if (specifier.minor !== null) {
		if (specifier.minor !== version.minor) {
			return false
		}
	}

	if (specifier.bugfix !== null) {
		if (specifier.bugfix !== version.bugfix) {
			return false
		}
	}

	return true
}

export default function(versions, specifier_str) {
	if (specifier_str === "latest") {
		return versions[0]
	}

	const specifier = normalizeVersionSpecifier(specifier_str)

	for (const version of versions) {
		if (compareVersions(specifier, version)) {
			return version
		}
	}

	throw new Error(`No version that matches specifier '${specifier_str}'.`)
}
