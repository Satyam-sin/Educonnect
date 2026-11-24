# CHS Explorer — Mega Web Project

A scalable, multi-page HTML/CSS/JS/JSON web portal for **CHS Entrance Exam** preparation featuring a **CHS Explorer Home Page (`index.html`)** and the full **160-MCQ Interactive Quiz** for **Class 8 New NCERT SST Part 1, Chapter 5 (`universal-adult-franchise-indias-electoral-system.html`)**.

## Navigation Flow

1. Open **`index.html`** (**CHS Explorer** Home Page):
   - **BOOKS** square: Lists all 6 CHS subjects (`SST`, `Science`, `Maths`, `English`, `Hindi`, `GK`) ready for future notes/books.
   - **QUIZ** square: Click **QUIZ** → click **SST** → click **Part 1** → view all 7 official NCERT Class 8 Part 1 chapters → click **Chapter 5: Universal Franchise and India's Electoral System** to launch the 160-MCQ Quiz!
2. **Synced Settings Across Every Page:**
   - Every page shares the same CSS and `localStorage` settings via `js/theme.js` — changing **Font Size (`11px`–`26px` slider)**, **Dark/Light Mode**, **6 Color Themes**, or **Font Style** on the Home Page automatically carries over to the Quiz Page (and vice versa).
   - **Home Page Settings** hides Quiz-only options and adds Home-specific controls (**Grid/List Subject Tiles**, **Show "Soon" Badges**, **Auto-Hide Header**, **High Contrast Borders**, **Smooth Animations**).
   - **Quiz Page Settings** adds **Text-to-Speech (`🔊 Listen` + Voice Speed Slider)**, **Sound Effects**, and **Answer Check Mode (Instant ✓/✗ vs Submit at End)**.
