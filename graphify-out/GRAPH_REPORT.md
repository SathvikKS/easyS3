# Graph Report - easyS3  (2026-05-20)

## Corpus Check
- 68 files · ~23,618 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 547 nodes · 1096 edges · 29 communities (26 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `def4f149`
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
- [[_COMMUNITY_Community 28|Community 28]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 78 edges
2. `Button()` - 17 edges
3. `S3File` - 15 edges
4. `Connection` - 14 edges
5. `scripts` - 14 edges
6. `AppSettings` - 11 edges
7. `Bucket` - 11 edges
8. `BucketsScreen()` - 10 edges
9. `IPC Security Documentation` - 10 edges
10. `LayoutMode` - 9 edges

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

## Communities (29 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (38): ActionBar(), FileCard(), FileCardProps, FileIcon(), FileIconProps, FileListHeader(), FileRow(), FileRowProps (+30 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (57): AddConnectionDialogBody(), AddConnectionDialogProps, DialogBodyProps, FieldDef, FIELDS, SortableHeader(), PreviewPanelProps, PreviewResult (+49 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (36): getSettings(), getSettingsSync(), setDownloadPath(), setDownloadPrompt(), setFetchBucketStats(), setTheme(), api, BucketInfo (+28 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (40): author, description, devDependencies, electron, electron-builder, @electron-toolkit/eslint-config-prettier, @electron-toolkit/eslint-config-ts, @electron-toolkit/tsconfig (+32 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (56): parseId(), registerBucketIpcHandlers(), Connection, ConnectionFormValues, ConnectResult, formatLastSeen(), registerConnectionIpcHandlers(), toConnection() (+48 more)

### Community 5 - "Community 5"
Cohesion: 0.19
Nodes (20): easyS3 Agent Guidelines, easyS3 CLAUDE Agent Guidelines, Context Isolation Requirement, Content Security Policy for Renderer, Mandatory Impact Analysis Before Edits, GitNexus Code Knowledge Graph, Electron IPC Security Pattern, IPC Security Documentation (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (16): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, class-variance-authority, clsx, electron-store, @electron-toolkit/utils, electron-updater (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (26): AddConnectionDialog(), FileViewer(), SettingsDialog(), TabBar(), TabBarProps, applyThemeClass(), initialState, resolveAppliedTheme() (+18 more)

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (21): BucketInfo, Connection, ConnectionFormValues, ConnectResult, DeleteFileRequest, DownloadItem, DownloadJobRequest, EasyS3Api (+13 more)

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
Cohesion: 0.29
Nodes (11): useDebouncedValue(), BucketsScreen(), BucketsScreenProps, filterBuckets(), formatBytes(), formatCount(), formatDate(), formatRelative() (+3 more)

### Community 28 - "Community 28"
Cohesion: 0.24
Nodes (9): ActionBarProps, LayoutToggle(), LayoutToggleProps, Crumb, formatPath(), NavBarProps, NavButton(), NavButtonProps (+1 more)

## Knowledge Gaps
- **211 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+206 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 1` to `Community 0`, `Community 6`, `Community 8`, `Community 27`, `Community 28`?**
  _High betweenness centrality (0.273) - this node is a cross-community bridge._
- **Why does `AppSettings` connect `Community 2` to `Community 9`, `Community 4`?**
  _High betweenness centrality (0.189) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 6` to `Community 3`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _212 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08350168350168351 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05622489959839357 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05939716312056738 - nodes in this community are weakly interconnected._