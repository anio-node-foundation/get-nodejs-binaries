# @anio-js-foundation/node-download-node

```js
import {
	getAvailableVersions,
	getDownloadURL,
	download
} from "@anio-js-foundation/node-download-node"

const versions = await getAvailableVersions()
const link = await getDownloadURL(versions[0])

//
// returns local path to extracted tar.gz
//
console.log(
	await download(versions[0])
)
```
