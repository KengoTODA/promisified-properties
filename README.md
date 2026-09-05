# promisified-properties

Handle .properties file via promisified and typed API. Designed to follow [the spec defined by Java](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/Properties.html).

![](https://github.com/KengoTODA/promisified-properties/workflows/.github/workflows/build.yml/badge.svg)
[![npm](https://badgen.net/npm/v/promisified-properties)](https://www.npmjs.com/package/promisified-properties)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Development

Use the Node.js version specified in [.nvmrc](.nvmrc) and the pnpm version
specified by `packageManager` in [package.json](package.json). Enable Corepack
once, then install the locked dependencies and run the checks:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm test --run
pnpm pack
```

`pnpm-workspace.yaml` requires dependencies to be at least three days old,
checks the exact pnpm version, rejects unreviewed dependency build scripts,
and rejects publication trust downgrades. Review dependency build scripts
before explicitly allowing them in the workspace configuration. Commit
`pnpm-lock.yaml` whenever dependencies change.
