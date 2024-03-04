import {execFile} from "node:child_process"
import os from "node:os"
import path from "node:path"

import nodeFsUtils from "@anio-node-foundation/fs-utils"

import fs from "node:fs"
import {Readable} from "node:stream"
import {finished} from "node:stream/promises"

import getAvailableVersions from "./getAvailableVersions.mjs"
import getDownloadURL from "./getDownloadURL.mjs"
import mapArchAndPlatform from "./mapArchAndPlatform.mjs"

async function downloadFile(url) {
	const file_dest_path = await nodeFsUtils.generateTemporaryPathName()

	const response = await fetch(url)

	const stream = fs.createWriteStream(file_dest_path)

	const body = Readable.fromWeb(response.body)

	body.pipe(stream)

	await finished(body)

	return file_dest_path
}

function extractArchiveWithTar(tar_file) {
	return new Promise((resolve, reject) => {
		const dir_dest_path = nodeFsUtils.generateTemporaryPathName.sync()

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

	let temp_archive_file = null, temp_directory = null

	try {
		temp_archive_file = await downloadFile(url)

		const local_checksum = await nodeFsUtils.hashFile(temp_archive_file, "sha256")

		if (file_checksum !== local_checksum) {
			throw new Error(`Checksum error <${file_checksum} != ${local_checksum}>.`)
		}

		temp_directory = await extractArchiveWithTar(temp_archive_file)

		await nodeFsUtils.remove(temp_archive_file)

		return {
			path: path.join(temp_directory, arch_platform_identifier),
			async cleanup() {
				await nodeFsUtils.remove(temp_directory)
			}
		}
	} catch (error) {
		//
		// remove temporary items
		//
		if (temp_archive_file !== null) await nodeFsUtils.remove(temp_archive_file)
		if (temp_directory !== null) await nodeFsUtils.remove(temp_directory)

		throw error
	}
}
