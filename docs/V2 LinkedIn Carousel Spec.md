# LinkedIn Carousel / Document Post Specification

**Status:** Draft v0.1 — V2 feature specification (V1 carousel work moved out of the core V1 scope)  
**Purpose:** Preserve the carousel/document-post decisions made during product discovery as a separate specification for future implementation. This document is not part of the current V1 feature scope. Decisions explicitly marked as later/P1 are treated as V3 unless re-opened and changed in a later product round.  
**Date of Creation:** September 5, 2026

---

## Scope

The LinkedIn carousel/document-post builder is **not part of SkillTrail V1**.

SkillTrail V1 should keep LinkedIn publishing simple:

```text
User provides context
        ↓
AI writes LinkedIn post
        ↓
User optionally adds post media
        ↓
Preview
        ↓
Publish / Schedule
```

The carousel/document-post feature is preserved here for **V2** planning.

Capabilities explicitly stated as later/P1 or otherwise deferred beyond V2 are marked **V3** below.

---

# V2 — Locked Decisions

## Q1. Supported carousel/document workflows

**Decision: D**

V2 should support all three workflows:

1. Create a document/carousel manually from scratch.
2. Provide content to AI and have AI create the initial carousel/document.
3. Upload an existing PDF and either use it as-is or work with it inside SkillTrail.

```text
Manual creation
AI-assisted creation
Existing PDF import
```

---

## Q2. Existing PDF handling

**Decision: C**

An uploaded PDF can either be:

- published as-is, or
- imported into the carousel editor.

```text
Upload PDF
    ↓
Choose workflow
    ├── Publish as-is
    └── Edit in Carousel Builder
```

---

## Q3. Editor model

**Decision: C — Hybrid**

The editor should combine:

- structured templates/layouts
- flexible element editing

SkillTrail should not attempt to become a full Canva/Figma-style unrestricted design tool.

---

## Q4. PDF import model

**Decision: C — Both**

Imported PDF pages should support:

- editable reconstruction where possible
- flattened-page fallback where reconstruction is not possible

```text
PDF page
   ├── Editable reconstruction
   └── Flattened fallback
```

---

## Q5. AI generation

**Decision: B**

AI should generate:

- slide/document content
- layout recommendations

AI does not merely generate text; it can also suggest an appropriate slide layout/template.

---

## Q6. Individual slide editing

**Decision: B**

Users can:

- choose a template/layout
- edit the elements within that layout

This includes editing text and image placement rather than requiring users to build every layout from scratch.

---

## Q7. Duplicate slide

**Decision: A — Yes**

Users can duplicate an individual slide.

---

## Q8. Duplicate entire carousel/document

**Decision: A — Yes**

Users can duplicate an entire carousel/document to create a new editable version.

---

## Q9. Preserve original PDF + create independent SkillTrail document

**Decision: C — Both**

When importing an existing PDF:

- preserve the original uploaded PDF
- also create an independent SkillTrail document when the user chooses the editable/AI-assisted workflow

Additional locked behavior:

```text
Upload PDF
   ↓
Keep original PDF
   ↓
Ask whether AI assistance is wanted
   ├── Yes → create/edit SkillTrail document
   └── No  → original document remains the publishing source
```

The editable SkillTrail version takes priority when the user chooses the editable/AI-assisted route.

The user can later decide not to use AI intervention and publish the original document instead.

---

## Q10. Re-edit and republish imported documents

**Decision: A — Yes**

Imported documents remain usable after the initial import.

The user can later:

- reopen the document
- edit it
- change its LinkedIn publishing details
- republish it

---

## Q11. Page dimensions

**Decision: D — User chooses**

For newly created documents, the user can choose the page orientation/dimensions rather than being forced into a single fixed format.

---

## Q12. Consistency of dimensions

**Decision: C**

New SkillTrail-created documents use one consistent page size throughout the document.

Imported PDFs preserve their native page dimensions.

---

## Q13. Template system

**Decision: C**

V2 should support:

- a template/layout library
- user-created reusable templates

A user should be able to save a customized layout as a reusable template.

---

## Q14. Change layout after slide creation

**Decision: A — Yes**

A user can change the layout of an already-created slide.

Existing content should be preserved/mapped into the new layout where reasonably possible.

---

## Q15. Visual styling controls

**Decision: A — Basic**

V2 styling controls should remain intentionally limited to essentials such as:

- font
- font size
- font weight
- alignment
- spacing
- background
- text color

Advanced design controls are outside this V2 scope.

---

## Q18. Image capabilities

V2 slide/image handling supports:

- upload images
- crop
- resize
- reposition
- rotate

---

## Q19. Non-image visual elements

**Decision: C**

V2 should not provide a large library of arbitrary graphical elements.

Slides are primarily based on:

```text
Text + Images
```

---

## Q20. Code blocks

**Decision: C — Yes, but very simple**

V2 should provide a simple code-block element suitable for developer content.

It is not intended to be a full code editor.

---

## Q21. AI slide-count recommendation

**Decision: C**

AI may recommend the number of slides.

The user must be able to:

- accept the recommendation
- change the number of slides

```text
AI recommends: 7 slides
        ↓
User confirms or changes
```

---

## Q22. AI regeneration

**Decision: C — Both**

The user can:

- regenerate an individual slide
- regenerate the entire carousel/document

---

# V3 — Deferred Decisions

## Q16. User-uploaded fonts

**Decision: C — Later/P1**

Custom user-uploaded fonts are deferred beyond V2.

Target:

**V3**

---

## Q17. Logo / brand mark

**Decision: Not in V1**

Logo/brand-mark support is intentionally not part of the current V1 scope and is deferred beyond the initial carousel implementation.

Target:

**V3**

---

## Q23. AI visual-layout transformation

**Decision: C — Later/P1**

AI should eventually be able to change/recommend a different visual layout while preserving the same content.

Example:

```text
Same content
     ↓
AI recommends:
"Try this as a big-number layout"
```

Target:

**V3**

---

# Additional Decisions Already Established for the Carousel Feature

These points were established in the earlier carousel discussions and remain preserved here for future specification work.

## Structured slide model

The carousel/document is conceptually:

```text
LinkedIn Document
│
├── Document settings / overall style
│
├── Slide 1
│    ├── structured content
│    ├── layout
│    └── optional media
│
├── Slide 2
│    ├── structured content
│    ├── layout
│    └── optional media
│
└── Slide N
     ├── structured content
     ├── layout
     └── optional media
```

AI-generated slides should remain structured/editable rather than becoming flattened AI-generated slide images.

---

## Manual creation remains supported

The carousel feature must support a completely manual workflow in addition to AI-assisted creation.

The user should not be forced to use AI.

---

## Editing operations

The previously established desired slide operations include:

```text
+ Add slide
Delete
Move / Reorder
Edit
Upload images
Crop images
```

These are preserved for the V2 implementation.

---

## Relationship to the SkillTrail content model

The carousel/document should eventually fit into the existing content architecture:

```text
Content
   ↓
Composition
   ↓
Platform Draft
   ↓
Publication
```

The carousel is a LinkedIn-specific composition/draft format rather than a replacement for the general content model.

---

# V1 Boundary

The current V1 LinkedIn workflow remains intentionally simple:

```text
Context / notes / screenshots
           ↓
        AI draft
           ↓
LinkedIn normal post
           ↓
Optional post media
           ↓
Preview
           ↓
Publish / Schedule
```

The following are **not part of V1**:

- carousel/document builder
- PDF editing/import workflow
- slide editor
- carousel templates
- carousel-specific AI generation
- carousel slide regeneration
- carousel PDF export/publishing workflow

These are preserved for future implementation in this specification.

---

# Future Open Questions for V2

When carousel development actually begins, the following can be re-opened and finalized:

- exact PDF output/export pipeline
- exact LinkedIn document title behavior
- carousel/document caption relationship
- exact preview experience
- document save/draft lifecycle
- slide minimum/maximum limits
- exact supported page sizes/aspect ratios
- PDF reconstruction technology and fallback behavior
- template architecture
- rendering technology
- accessibility/text extraction considerations
- final relationship between carousel slides and reusable media
- undo behavior inside the carousel editor
- final scheduling/publication semantics for LinkedIn documents

These are intentionally not treated as locked implementation details yet.

---

# Versioning Rule

For future product rounds:

- **V2** = decisions explicitly locked for the carousel/document feature.
- **V3** = capabilities explicitly stated as later/P1 or otherwise deferred beyond V2.
- A later product decision can supersede any item in this document; when that happens, update this specification rather than silently changing the core V1 specification.
