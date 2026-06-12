# Graph Report - next-app  (2026-06-12)

## Corpus Check
- 57 files · ~16,938 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 391 nodes · 637 edges · 48 communities (26 shown, 22 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1e154229`
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
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]

## God Nodes (most connected - your core abstractions)
1. `formatApiError()` - 35 edges
2. `connectDB()` - 21 edges
3. `compilerOptions` - 16 edges
4. `getObjectId()` - 15 edges
5. `listProducts()` - 11 edges
6. `getBodyRecord()` - 11 edges
7. `newUserController()` - 11 edges
8. `User` - 11 edges
9. `What You Must Do When Invoked` - 11 edges
10. `UserController` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Next.js Project README` --shares_data_with--> `MongoDB Service in docker-compose.yaml`  [INFERRED]
  README.md → docker-compose.yaml
- `Next.js Project README` --shares_data_with--> `Ignored Dependencies in pnpm-workspace.yaml`  [INFERRED]
  README.md → pnpm-workspace.yaml
- `GET()` --calls--> `formatApiError()`  [INFERRED]
  src/app/api/brands/[id]/route.ts → src/backend/modules/catalog/service.ts
- `PATCH()` --calls--> `formatApiError()`  [INFERRED]
  src/app/api/brands/[id]/route.ts → src/backend/modules/catalog/service.ts
- `DELETE()` --calls--> `formatApiError()`  [INFERRED]
  src/app/api/brands/[id]/route.ts → src/backend/modules/catalog/service.ts

## Import Cycles
- None detected.

## Communities (48 total, 22 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.16
Nodes (12): CreateUserDto, UpdateUserDto, User, UserModelInterface, ModelFactory, UserModelMock, users, AutoIncrement (+4 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (31): newUserController(), HasherInterface, PublicUser, RefreshTokenDto, toPublicUser(), UpdateUserPasswordDto, UserController, Bcrypt (+23 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (25): devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, jest, tailwindcss, @tailwindcss/postcss, ts-jest (+17 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (15): dependencies, bcrypt, @emotion/react, @emotion/styled, jsonwebtoken, mongoose, mongoose-sequence, @mui/material (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (43): DELETE(), GET(), PATCH(), ProductAttributesRouteContext, PUT(), assertProductExists(), createProduct(), createProductVariant() (+35 more)

### Community 6 - "Community 6"
Cohesion: 0.38
Nodes (3): metadata, theme, MuiThemeRegistry()

### Community 7 - "Community 7"
Cohesion: 0.48
Nodes (3): getComments(), Comment, Page()

### Community 8 - "Community 8"
Cohesion: 0.60
Nodes (5): NetworkX Python Library, Pathlib Python Library, Explain Function, Path Function, Query Function

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (4): LoginForm(), LoginFormData, RegisterForm(), RegisterFormData

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (23): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+15 more)

### Community 11 - "Community 11"
Cohesion: 0.67
Nodes (3): MongoDB Service in docker-compose.yaml, Ignored Dependencies in pnpm-workspace.yaml, Next.js Project README

### Community 12 - "Community 12"
Cohesion: 0.67
Nodes (3): Add URL and Watch Folder, Export Options, Extraction Specification

### Community 13 - "Community 13"
Cohesion: 0.09
Nodes (39): GET(), POST(), BodyRecord, CatalogEntityModel, createBrand(), createCategory(), escapeRegex(), getActiveFilter() (+31 more)

### Community 22 - "Community 22"
Cohesion: 0.15
Nodes (18): deactivateBrand(), deactivateCatalogEntity(), deactivateCategory(), getBrand(), getCatalogEntity(), getCategory(), updateBrand(), updateCategory() (+10 more)

### Community 36 - "Community 36"
Cohesion: 0.14
Nodes (12): BrandRecord, BrandSchema, CategoryRecord, CategorySchema, JsonTransformRet, ProductAttributeRecord, ProductAttributeSchema, ProductRecord (+4 more)

### Community 37 - "Community 37"
Cohesion: 0.25
Nodes (7): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 38 - "Community 38"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 39 - "Community 39"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 40 - "Community 40"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 41 - "Community 41"
Cohesion: 0.50
Nodes (3): For /graphify explain, For /graphify path, graphify reference: query, path, explain

### Community 42 - "Community 42"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **157 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+152 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatApiError()` connect `Community 5` to `Community 13`, `Community 22`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `formatApiError()` (e.g. with `DELETE()` and `GET()`) actually correct?**
  _`formatApiError()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _157 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._