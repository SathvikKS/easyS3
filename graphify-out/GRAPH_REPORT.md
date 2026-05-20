# Graph Report - easyS3  (2026-05-20)

## Corpus Check
- 68 files · ~21,873 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 533 nodes · 941 edges · 28 communities (25 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1c744c49`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 75 edges
2. `scripts` - 14 edges
3. `Button()` - 14 edges
4. `S3File` - 11 edges
5. `Connection` - 10 edges
6. `IPC Security Documentation` - 10 edges
7. `IPC Security` - 9 edges
8. `easyS3 CLAUDE Agent Guidelines` - 9 edges
9. `easyS3 Agent Guidelines` - 8 edges
10. `GitNexus Guide Skill` - 8 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  src/renderer/src/lib/utils.ts → package.json
- `easyS3 Agent Guidelines` --semantically_similar_to--> `easyS3 CLAUDE Agent Guidelines`  [INFERRED] [semantically similar]
  AGENTS.md → CLAUDE.md
- `IPC Security Documentation` --references--> `Preload Script (contextBridge)`  [EXTRACTED]
  docs/IPC_SECURITY.md → src/preload/index.ts
- `IPC Security Documentation` --references--> `Shared IPC Channel Names`  [EXTRACTED]
  docs/IPC_SECURITY.md → src/shared/ipc.ts
- `IPC Security Documentation` --references--> `IPC Guards (assertTrustedSender)`  [EXTRACTED]
  docs/IPC_SECURITY.md → src/main/ipc-guards.ts

## Hyperedges (group relationships)
- **Electron IPC Security Layer Stack** — renderer_index_html, preload_index_ts, shared_ipc_ts, main_ipc_guards_ts, main_ipc_handlers, concept_ipc_security_pattern [EXTRACTED 0.95]
- **GitNexus Agent Workflow Skills** — skill_gitnexus_cli, skill_gitnexus_debugging, skill_gitnexus_exploring, skill_gitnexus_guide, skill_gitnexus_impact_analysis, skill_gitnexus_refactoring [EXTRACTED 1.00]
- **Electron Build and Distribution Pipeline** — electron_builder_yml_build_config, dev_app_update_yml_auto_update, resources_icon_png, readme_project_overview [INFERRED 0.85]

## Communities (28 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (46): ActionBar(), FileCard(), FileCardProps, FileIcon(), FileIconProps, FileListHeader(), FileRow(), FileRowProps (+38 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (53): ActionBarProps, LayoutToggle(), LayoutToggleProps, SortableHeader(), Crumb, formatPath(), NavBarProps, NavButton() (+45 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (26): api, BucketInfo, buckets, Connection, ConnectionFormValues, connections, ConnectResult, DeleteFileRequest (+18 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (40): author, description, devDependencies, electron, electron-builder, @electron-toolkit/eslint-config-prettier, @electron-toolkit/eslint-config-ts, @electron-toolkit/tsconfig (+32 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (40): registerBucketIpcHandlers(), Connection, ConnectionFormValues, ConnectResult, formatLastSeen(), registerConnectionIpcHandlers(), toConnection(), DownloadItem (+32 more)

### Community 5 - "Community 5"
Cohesion: 0.18
Nodes (21): easyS3 Agent Guidelines, easyS3 CLAUDE Agent Guidelines, Context Isolation Requirement, Content Security Policy for Renderer, Mandatory Impact Analysis Before Edits, GitNexus Code Knowledge Graph, Electron IPC Security Pattern, IPC Security Documentation (+13 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (16): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, class-variance-authority, clsx, electron-store, @electron-toolkit/utils, electron-updater (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (33): AddConnectionDialog(), AddConnectionDialogBody(), AddConnectionDialogProps, DialogBodyProps, FieldDef, FIELDS, SettingsDialog(), SettingsDialogBody() (+25 more)

### Community 9 - "Community 9"
Cohesion: 0.08
Nodes (35): assertTrustedSender(), isTrustedWebContents(), parseOptionalPath(), parseSettingKey(), parseSettingValue(), getAllSettings(), getSetting(), getStore() (+27 more)

### Community 10 - "Community 10"
Cohesion: 0.18
Nodes (10): indexedAt, lastCommit, repoPath, stats, communities, edges, embeddings, files (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.20
Nodes (9): compilerOptions, baseUrl, composite, jsx, paths, extends, include, @/* (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (6): compilerOptions, baseUrl, paths, files, @/*, references

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (5): compilerOptions, composite, types, extends, include

### Community 14 - "Community 14"
Cohesion: 0.40
Nodes (6): Electron + React + TypeScript Application, Dev App Auto-Update Config, Electron Builder Build Configuration, Prettier Configuration, easyS3 Project README, easyS3 Application Icon

### Community 15 - "Community 15"
Cohesion: 0.40
Nodes (6): [javascript], editor.defaultFormatter, [json], editor.defaultFormatter, [typescript], editor.defaultFormatter

### Community 16 - "Community 16"
Cohesion: 0.50
Nodes (3): compounds, configurations, version

### Community 23 - "Community 23"
Cohesion: 0.18
Nodes (10): Always do, Always Do, CLI, easyS3 — Agent guidelines, Electron IPC security, GitNexus — Code Intelligence, graphify, Never do (+2 more)

### Community 24 - "Community 24"
Cohesion: 0.18
Nodes (10): Always do, Always Do, CLI, easyS3 — Agent guidelines, Electron IPC security, GitNexus — Code Intelligence, graphify, Never do (+2 more)

### Community 25 - "Community 25"
Cohesion: 0.18
Nodes (10): Adding a new IPC capability, Architecture, BrowserWindow defaults, code:block1 (Renderer (untrusted)  →  window.api  →  Preload (bridge)  → ), Current channels (settings), IPC Security, Main-process handler rules, Preload rules (+2 more)

### Community 26 - "Community 26"
Cohesion: 0.20
Nodes (9): Build, code:bash ($ npm install), code:bash ($ npm run dev), code:bash (# For windows), Development, easys3, Install, Project Setup (+1 more)

### Community 27 - "Community 27"
Cohesion: 0.26
Nodes (9): BucketsScreen(), BucketsScreenProps, formatBytes(), formatCount(), formatDate(), formatRelative(), STATS, Badge() (+1 more)

## Knowledge Gaps
- **225 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+220 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 1` to `Community 8`, `Community 0`, `Community 27`, `Community 6`?**
  _High betweenness centrality (0.254) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 6` to `Community 3`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **Why does `clsx` connect `Community 6` to `Community 1`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _226 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07589285714285714 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05536568694463431 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._