**deprecated**: the config has been moved to EOxHub internal config.

---

# EarthCODE git-clerk config

EarthCODE-specific config for [git-clerk](https://github.com/EOX-A/git-clerk).

Features:

- GH token retrieval
- schema map for all OSC entities (TODO - currently missing: records)
- automation for bootstrapping products (TODO - projects etc)
- custom editors:
  - `OSCEditor` for automatic linking of children/parents
  - `UUIDEditor` - custom editor handling `format:uuid` but not forcing an override if value is already present
  - `TemporalIntervalEditor` - showing two date pickers for temporal intervals
- custom enum generation for dynamically getting available entities from child links
