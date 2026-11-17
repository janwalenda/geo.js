# ⚠️ Legacy-Branch – nicht mergen

Dieser Branch (`feature/subdivide`) ist **eingefroren** und wird nur zu Archivzwecken aufbewahrt.

- Stand: letzter Commit 2023-05-31 ("added some stuff"), 7 Commits nie nach develop gemergt
- Er baut auf der alten API (`Geo2D`, `Geo3D`, `figures/`, `classes/`) auf, die mit
  **v0.1.0** vollständig ersetzt wurde (Mathe-Kern, Szenengraph, Render-Pipeline,
  Canvas-/SVG-Renderer – siehe `develop` bzw. `main`).
- Ein Merge nach `develop` würde den Neubau zurückdrehen. Ideen von hier bitte in einem neuen
  `feature/GEO-<nr>-…`-Branch auf Basis von `develop` neu umsetzen.

Siehe `.cursor/rules/git-flow.mdc`, Abschnitt „Legacy-Branches“.
