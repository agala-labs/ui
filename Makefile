.PHONY: bump-charts publish-charts release-charts

# Bump @agala-labs/charts version, commit, and tag.
# Usage:
#   make bump-charts          # patch bump (default)
#   make bump-charts BUMP=minor
#   make bump-charts BUMP=major
bump-charts:
	@test -f packages/charts/package.json || (echo "Error: packages/charts/ not found — are you on the right branch?"; exit 1) && \
	V=$$(npm version $(or $(BUMP),patch) -w packages/charts | grep -o 'v[0-9]\+\.[0-9]\+\.[0-9]\+') && \
	git add packages/charts/package.json package-lock.json && \
	git commit -m "chore(charts): release $$V" && \
	git tag "charts-$$V" && \
	echo "Bumped @agala-labs/charts $$V"

# Build and publish @agala-labs/charts (handles auth yourself).
publish-charts:
	cd packages/charts && npm run build && npm publish

# One-shot: bump + publish (version, commit, tag, build, publish).
release-charts:
	$(MAKE) bump-charts
	$(MAKE) publish-charts
