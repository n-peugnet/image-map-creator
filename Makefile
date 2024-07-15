build: node_modules
	webpack --env dev

dist: node_modules
	webpack --env prod

watch: node_modules
	webpack --env dev --watch

node_modules: package.json package-lock.json
	npm install
	touch $@

release-patch release-minor release-major: release-%: dist
	npm version $* --tag-version-prefix=
	git push
	git push --tags
	TAG=$$(git describe --tags --abbrev=0); gh release create $$TAG && gh release upload $$TAG dist/*.js
	npm publish

clean:
	rm -rf dist node_modules

.PHONY: build dist watch clean
