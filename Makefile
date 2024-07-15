ESBUILD ?= esbuild

define ESBUILDCMD
$(ESBUILD) src/p5.image-map-creator.ts \
	--outfile=dist/image-map-creator.bundle.js \
	--bundle --sourcemap
endef

build: node_modules
	$(ESBUILDCMD)

dist: node_modules
	$(ESBUILDCMD) --minify --sourcemap

types: node_modules
	node_modules/.bin/tsc --emitDeclarationOnly

watch: node_modules
	$(ESBUILDCMD) --watch

node_modules: package.json package-lock.json
	npm install
	touch $@

release-patch release-minor release-major: release-%: dist types
	npm version $* --tag-version-prefix=
	git push
	git push --tags
	TAG=$$(git describe --tags --abbrev=0); gh release create $$TAG && gh release upload $$TAG dist/*.js
	npm publish

clean:
	rm -rf dist node_modules

.PHONY: build dist types watch clean
