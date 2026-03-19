# git-clerk-config

Configuration service for [git-clerk](https://github.com/EOX-A/git-clerk) — the GitHub-based metadata editor used by ESA's [ESA Open Science Catalog](https://opensciencedata.esa.int) platform. This project provides the **Open Science Catalog (OSC) Editor** configuration, enabling users to create, edit, and manage [STAC](https://stacspec.org/) metadata records for the [open-science-catalog-metadata](https://github.com/ESA-EarthCODE/open-science-catalog-metadata) repository.

## How It Works

Rather than bundling configuration into the git-clerk editor itself, this project serves configuration as **live ES modules over HTTP**. The git-clerk front-end dynamically imports these modules at runtime, allowing independent deployment and updates without redeploying the editor.

## Project Structure

```
git-clerk-config/
├── osc-config.mjs              # Main OSC configuration module (browser entry point)
├── osc.html                    # STAC Browser preview iframe page to preview
├── osc/                        # Modular configuration modules
│   ├── helpers.js              # Shared utilities (slugify, base64, URL validation)
│   ├── schema-map/
│   │   └── create-schema-map.js          # STAC entity-to-schema path mappings
│   ├── automation/
│   │   ├── create-automation.js          # Aggregates all automation definitions
│   │   ├── add-entities.js               # "Add Product" / "Add Project" workflows
│   │   ├── add-file.js                   # "Add external OSC file" workflow
│   │   ├── add-experiment.js             # "Add OSC experiment" bundle workflow
│   │   ├── add-var-proj-prod-bundle.js   # "Add Variable, Project & Product" bundle
│   │   └── edit-file.js                  # "Open external file" workflow
│   ├── custom-editor-interface/
│   │   ├── create-custom-editor-interfaces.js  # Aggregates all custom editors
│   │   ├── osc-editor.js                # Select-based editor for OSC entity fields
│   │   ├── temporal-interval-editor.js   # Date-range picker editor
│   │   ├── string-editor.js             # Auto-timestamp "updated" field editor
│   │   ├── operation.js                 # Bidirectional link select/unselect/save
│   │   └── handle-file-content-update.js # Fetches file content from GitHub on selection
│   └── generate-enums/
│       └── create-generate-enums.js      # Dynamic enum population from catalog data
│   └── i18n/
│       └── create-i18n.js              # Add 18n config related to OSC
└── package.json
```

## Configuration Modules

The configuration is organized into four main areas, each exposed on `globalThis` for git-clerk to consume:

### Schema Map (`globalThis.schemaMap`)

Maps file paths to JSON Schema URLs for 7 OSC entity types: **eo-missions**, **experiments**, **products**, **projects**, **themes**, **variables**, and **workflows**. Each entity has both a parent catalog schema and a child item schema, with optional preview URLs and JSON form options.

### Automations (`globalThis.automation`)

Multi-step workflows for creating and editing STAC metadata records:

| Automation                          | Description                                                                             |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| **Add Product**                     | Creates a `collection.json` under `products/<slug>/` and links it in the parent catalog |
| **Add Project**                     | Creates a `collection.json` under `projects/<slug>/` and links it in the parent catalog |
| **Add File**                        | Adds an external OSC file with STAC extension injection and link fixup                  |
| **Add Experiment**                  | Bundle workflow creating product + workflow + experiment in one operation               |
| **Add Variable, Project & Product** | Bundle workflow creating all three entities from external content                       |
| **Edit File**                       | Opens an external file for editing in the current branch                                |

### Custom Editor Interfaces (`globalThis.customEditorInterfaces`)

Custom form editors built on top of `@json-editor/json-editor` for specialized STAC fields:

- **OSCEditor** — Select dropdowns populated with enum values from catalog data, with bidirectional STAC link management
- **TemporalIntervalEditor** — Date-range picker outputting ISO 8601 timestamps
- **OSCStringEditor** — Auto-sets the `updated` field to the current timestamp

### Generate Enums (`globalThis.generateEnums`)

An async function that dynamically fetches catalog data from GitHub at runtime to populate dropdown options, ensuring the editor always shows current entity options.

### Internationalization (i18n) (`globalThis.i18n`)

A configurable object that defines translation messages for the Git Clerk, exposed via `globalThis.i18n` and supporting languages out of the box and easily extendable to additional languages by adding message sets keyed by locale code.

## Usage

The configuration can be loaded by git-clerk via dynamic import:

```javascript
import OSCConfiguration from "https://esa-earthcode.github.io/git-clerk-config/osc-config.mjs";

// Apply ghConfig before OSCConfiguration
OSCConfiguration();
```
