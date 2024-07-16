ESBUILD ?= node_modules/.bin/esbuild
TSC     ?= node_modules/.bin/tsc

define ESBUILDCMD
$(ESBUILD) src/p5.image-map-creator.ts \
	--outfile=dist/image-map-creator.bundle.js \
	--bundle --sourcemap --target=es2016
endef

define ESBUILDNPMCMD
$(ESBUILD) src/p5.image-map-creator.ts \
	--outdir=dist --bundle \
	--external:downloadjs \
	--external:quicksettings \
	--external:undo-manager
endef

build: node_modules
	$(ESBUILDCMD)

dist: node_modules
	$(ESBUILDCMD) --minify
	$(ESBUILDNPMCMD)
	$(ESBUILDNPMCMD) --format=esm --out-extension:.js=.mjs

types: node_modules
	$(TSC) --emitDeclarationOnly

watch: node_modules
	$(ESBUILDCMD) --watch

node_modules: package.json package-lock.json
	npm install
	touch $@

.PHONY: release-patch release-minor release-major
release-patch release-minor release-major: release-%: dist types
	npm version $* --tag-version-prefix=
	git push
	git push --tags
	TAG=$$(git describe --tags --abbrev=0); gh release create $$TAG && gh release upload $$TAG dist/*.bundle.*
	npm publish

check: node_modules
	$(TSC) --noEmit

clean:
	rm -rf dist node_modules

.PHONY: build dist types watch check clean
