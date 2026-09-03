## Releases

How to release

- update CHANGELOG.md
- update the version in package.json
- commit with "vX.X.X"
- add a tag with `git tag vX.X.X`
- push the commit and tag with `git push origin && git push origin --tags`
- bun run build
- npm publish
- create a release on github


