import {execFile} from "node:child_process"
import os from "node:os"
import path from "node:path"
import createRandomIdentifier from "@anio-js-core-foundation/create-random-identifier"
import fs from "node:fs"

import getAvailableVersions from "./getAvailableVersions.mjs"
import getDownloadURL from "./getDownloadURL.mjs"
import mapArchAndPlatform from "./mapArchAndPlatform.mjs"
import calculateChecksum from "./calculateChecksum.mjs"

//
// todo: replace with fetch()
//
function downloadFileViaCURL(url) {
	return new Promise((resolve, reject) => {
		const file_dest_path = path.join(
			os.tmpdir(), createRandomIdentifier(32)
		)

		execFile("curl", [
			url, "--output", file_dest_path
		], {
			stdio: "pipe"
		}, (error, stdout, stderr) => {
			if (error) {
				reject(error)
			} else {
				resolve(file_dest_path)
			}
		})
	})
}

function extractArchiveWithTar(tar_file) {
	return new Promise((resolve, reject) => {
		const dir_dest_path = path.join(
			os.tmpdir(), createRandomIdentifier(32)
		)

		fs.mkdirSync(dir_dest_path)

		execFile("tar", [
			"-xzf", tar_file, "-C", "."
		], {
			cwd: dir_dest_path,
			stdio: "pipe"
		}, (error, stdout, stderr) => {
			if (error) {
				reject(error)
			} else {
				resolve(dir_dest_path)
			}
		})
	})
}

async function getChecksums(version, arch_platform_identifier) {
	//
	const response = await fetch(`https://nodejs.org/dist/${version}/SHASUMS256.txt`)
	const body = await response.text()
	const entries = body.split("\n")

	let target_checksum = ""

	for (const entry of entries) {
		const fields = entry.trim().split(" ").filter(p => p.length)

		if (fields.length !== 2) continue

		const [checksum, file_name] = fields

		if (file_name === `${arch_platform_identifier}.tar.gz`) {
			target_checksum = checksum

			break
		}
	}

	if (target_checksum.length !== 64) {
		throw new Error(`Unable to get correct checksum for download.`)
	}

	return target_checksum
}

//
// todo: cleanup on error
//
export default async function(version) {
	const versions = await getAvailableVersions()

	if (!versions.includes(version)) {
		throw new Error(`No such version '${version}'.`)
	}

	const arch_platform_identifier = mapArchAndPlatform(
		os.platform(), os.arch(), version
	).link

	const file_checksum = await getChecksums(version, arch_platform_identifier)

	const url = await getDownloadURL(version)
	const tmp_file = await downloadFileViaCURL(url)

	const local_checksum = await calculateChecksum(tmp_file)

	if (file_checksum !== local_checksum) {
		throw new Error(`Checksum error <${file_checksum} != ${local_checksum}>.`)
	}

	const tmp_dir = await extractArchiveWithTar(tmp_file)

	fs.unlinkSync(tmp_file)

	return path.join(
		tmp_dir, arch_platform_identifier
	)
}
