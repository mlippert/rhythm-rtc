# Change Log for riff-rtc

## [0.3.0](https://github.com/rifflearning/riff-rtc/tree/0.3.0) (2018-06-10)
[Full Changelog](https://github.com/rifflearning/riff-rtc/compare/0.3.0-dev.0...0.3.0)

### Merged pull requests

- [\#3](https://github.com/rifflearning/riff-rtc/pull/3) update packages
  (except build related packages)
- [\#5](https://github.com/rifflearning/riff-rtc/pull/5) Allow configuration
  to be set at runtime instead of statically built into the webpack artifacts
- [mlippert/rhythm-rtc\#2](https://github.com/mlippert/rhythm-rtc/pull/2) update
  feathers packages to match those used by rhythm-server
- [mlippert/rhythm-rtc\#4](https://github.com/mlippert/rhythm-rtc/pull/4) Merge
  updates from jordanreedie's master branch to develop
- [mlippert/rhythm-rtc\#6](https://github.com/mlippert/rhythm-rtc/pull/6) Fix syntax error


### Added

- dataserver path configuration setting. This allows multiple websocket endpoints
  on the same domain, letting the reverse proxy forward them as required)

### Changed

- Configuration settings are supplied to browser at runtime, rather than being
  hardcoded into the artifacts
- Build script supports building development or production artifacts based on
  NODE_ENV value
- Update dependency packages to the latest versions (except build related packages,
  e.g. webpack)
  (will require connecting to a riff-server w/ updated packages (`^0.4.0-dev.2`)
- forked repositories changed _rhythm-_ prefix to _riff-_

### Fixed

- Fix syntax error in browser console on /chat [mlippert/rhythm-rtc\#5](https://github.com/mlippert/rhythm-rtc/issues/5)


## [0.2.0](https://github.com/rifflearning/riff-rtc/tree/0.2.0) (2017-05-17 and prior)
(from `https://github.com/jordanreedie/rhythm-rtc#master` which was
 from `https://github.com/HumanDynamics/rhythm-rtc`)

### Added

- All functionality of rhythm-rtc up until this time. (I am not aware of any distinct
  versions or releases prior to this time. -mjl)
