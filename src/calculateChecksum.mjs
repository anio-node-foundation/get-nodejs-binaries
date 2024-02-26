import {createReadStream} from "node:fs"
import {createHash} from "node:crypto"

export default function(file_path) {
	return new Promise((resolve, reject) => {
		const hash = createHash("sha256")

		hash.setEncoding("hex")

		createReadStream(file_path)
		.pipe(hash)
		.on("finish", () => {
			resolve(hash.read())
		})
		.on("error", reject)
	})
}
