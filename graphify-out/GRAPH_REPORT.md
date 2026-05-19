# Graph Report - .  (2026-05-19)

## Corpus Check
- Corpus is ~17,536 words - fits in a single context window. You may not need a graph.

## Summary
- 389 nodes · 666 edges · 23 communities (20 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_File Browser UI Components|File Browser UI Components]]
- [[_COMMUNITY_Dialog & Form Logic|Dialog & Form Logic]]
- [[_COMMUNITY_IPC Security & Settings Handlers|IPC Security & Settings Handlers]]
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_S3 Connection Management|S3 Connection Management]]
- [[_COMMUNITY_Agent & Security Guidelines|Agent & Security Guidelines]]
- [[_COMMUNITY_Dev Toolchain|Dev Toolchain]]
- [[_COMMUNITY_ShadcnUI Aliases|Shadcn/UI Aliases]]
- [[_COMMUNITY_Theme System|Theme System]]
- [[_COMMUNITY_Navigation & Layout|Navigation & Layout]]
- [[_COMMUNITY_GitNexus Index Metadata|GitNexus Index Metadata]]
- [[_COMMUNITY_Web TypeScript Config|Web TypeScript Config]]
- [[_COMMUNITY_Root TypeScript Config|Root TypeScript Config]]
- [[_COMMUNITY_Node TypeScript Config|Node TypeScript Config]]
- [[_COMMUNITY_Build & Distribution|Build & Distribution]]
- [[_COMMUNITY_VS Code Editor Settings|VS Code Editor Settings]]
- [[_COMMUNITY_VS Code Launch Config|VS Code Launch Config]]
- [[_COMMUNITY_Claude Code Permissions|Claude Code Permissions]]
- [[_COMMUNITY_VS Code Extensions|VS Code Extensions]]
- [[_COMMUNITY_App Icon|App Icon]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 61 edges
2. `scripts` - 14 edges
3. `Button()` - 11 edges
4. `IPC Security Documentation` - 10 edges
5. `S3File` - 9 edges
6. `easyS3 CLAUDE Agent Guidelines` - 9 edges
7. `Connection` - 8 edges
8. `easyS3 Agent Guidelines` - 8 edges
9. `GitNexus Guide Skill` - 8 edges
10. `stats` - 7 edges

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

## Communities (23 total, 3 thin omitted)

### Community 0 - "File Browser UI Components"
Cohesion: 0.06
Nodes (47): AddConnectionDialog(), FileCard(), FileCardProps, FileIcon(), FileIconProps, FileListHeader(), FileRow(), FileRowProps (+39 more)

### Community 1 - "Dialog & Form Logic"
Cohesion: 0.06
Nodes (44): AddConnectionDialogBody(), AddConnectionDialogProps, DialogBodyProps, FieldDef, FIELDS, SettingsDialogProps, THEME_OPTIONS, cn() (+36 more)

### Community 2 - "IPC Security & Settings Handlers"
Cohesion: 0.08
Nodes (31): assertTrustedSender(), isTrustedWebContents(), parseOptionalPath(), parseSettingKey(), parseSettingValue(), getAllSettings(), getSetting(), getStore() (+23 more)

### Community 3 - "Runtime Dependencies"
Cohesion: 0.06
Nodes (33): author, dependencies, @aws-sdk/client-s3, class-variance-authority, clsx, electron-store, @electron-toolkit/utils, electron-updater (+25 more)

### Community 4 - "S3 Connection Management"
Cohesion: 0.12
Nodes (21): Connection, ConnectionFormValues, ConnectResult, formatLastSeen(), registerConnectionIpcHandlers(), toConnection(), registerIpcHandlers(), registerSettingsIpcHandlers() (+13 more)

### Community 5 - "Agent & Security Guidelines"
Cohesion: 0.18
Nodes (21): easyS3 Agent Guidelines, easyS3 CLAUDE Agent Guidelines, Context Isolation Requirement, Content Security Policy for Renderer, Mandatory Impact Analysis Before Edits, GitNexus Code Knowledge Graph, Electron IPC Security Pattern, IPC Security Documentation (+13 more)

### Community 6 - "Dev Toolchain"
Cohesion: 0.10
Nodes (20): devDependencies, electron, electron-builder, @electron-toolkit/eslint-config-prettier, @electron-toolkit/eslint-config-ts, @electron-toolkit/tsconfig, electron-vite, eslint (+12 more)

### Community 7 - "Shadcn/UI Aliases"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 8 - "Theme System"
Cohesion: 0.15
Nodes (13): SettingsDialogBody(), applyThemeClass(), initialState, resolveAppliedTheme(), ThemeProvider(), ThemeProviderContext, ThemeProviderProps, ThemeProviderState (+5 more)

### Community 9 - "Navigation & Layout"
Cohesion: 0.16
Nodes (11): ActionBar(), ActionBarProps, LayoutToggle(), LayoutToggleProps, Crumb, NavBar(), NavBarProps, NavButton() (+3 more)

### Community 10 - "GitNexus Index Metadata"
Cohesion: 0.18
Nodes (10): indexedAt, lastCommit, repoPath, stats, communities, edges, embeddings, files (+2 more)

### Community 11 - "Web TypeScript Config"
Cohesion: 0.20
Nodes (9): compilerOptions, baseUrl, composite, jsx, paths, extends, include, @/* (+1 more)

### Community 12 - "Root TypeScript Config"
Cohesion: 0.29
Nodes (6): compilerOptions, baseUrl, paths, files, @/*, references

### Community 13 - "Node TypeScript Config"
Cohesion: 0.33
Nodes (5): compilerOptions, composite, types, extends, include

### Community 14 - "Build & Distribution"
Cohesion: 0.40
Nodes (6): Electron + React + TypeScript Application, Dev App Auto-Update Config, Electron Builder Build Configuration, Prettier Configuration, easyS3 Project README, easyS3 Application Icon

### Community 15 - "VS Code Editor Settings"
Cohesion: 0.40
Nodes (6): [javascript], editor.defaultFormatter, [json], editor.defaultFormatter, [typescript], editor.defaultFormatter

### Community 16 - "VS Code Launch Config"
Cohesion: 0.50
Nodes (3): compounds, configurations, version

## Knowledge Gaps
- **155 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+150 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Dialog & Form Logic` to `File Browser UI Components`, `Navigation & Layout`, `Runtime Dependencies`, `Theme System`?**
  _High betweenness centrality (0.287) - this node is a cross-community bridge._
- **Why does `clsx` connect `Runtime Dependencies` to `Dialog & Form Logic`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _156 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `File Browser UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05926251097453907 - nodes in this community are weakly interconnected._
- **Should `Dialog & Form Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.06321334503950835 - nodes in this community are weakly interconnected._
- **Should `IPC Security & Settings Handlers` be split into smaller, more focused modules?**
  _Cohesion score 0.08478513356562137 - nodes in this community are weakly interconnected._
- **Should `Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._