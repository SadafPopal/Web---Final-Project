# Pocket Classroom — Final Project

Author: Sadaf Popal

## Overview
Pocket Classroom is a single-page web app for creating, storing, and studying small learning "capsules" — each capsule contains notes, flashcards, and quiz questions. Data is saved to LocalStorage and the app supports import/export JSON.

## Folder structure
pocket-classroom/
├─ index.html
├─ css/styles.css
├─ js/
│ ├─ main.js
│ ├─ storage.js
│ ├─ library.js
│ ├─ author.js
│ ├─ learn.js
│ └─ ui.js
├─ samples/sample-capsule.json
└─ assets/


## Features (assignment mapping)
- Library: list capsules, search, import/export, delete.
- Author: create/edit metadata, notes, add/remove/reorder flashcards, add quiz questions, autosave.
- Learn: Notes, Flashcards (flip with Space, mark known), Quiz (scoring; best score saved).
- Storage keys:
  - `pc_capsules_index`
  - `pc_capsule_<id>`
  - `pc_progress_<id>`
- JSON schema: `pocket-classroom/v1`
- Keyboard shortcuts: `n` (new), `/` (search), `[` (library), `]` (learn), `Space` (flip)
- Accessibility: semantic elements + aria attributes


## The link of my Demo:
https://drive.google.com/file/d/1eMBHOUaUDBeAz5e_jKL9CidtO_jr7lzb/view?usp=drivesdk




