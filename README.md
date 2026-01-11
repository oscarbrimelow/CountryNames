# 🌍 World Map Quiz

<div align="center">
  <h3>Test your geographical knowledge with this interactive map game!</h3>
  <p>Identify countries, learn facts, and beat the clock.</p>
  
  [Play Now](https://oscarbrimelow.github.io/CountryNames/) · [Report Bug](https://github.com/oscarbrimelow/CountryNames/issues) · [Request Feature](https://github.com/oscarbrimelow/CountryNames/issues)
</div>

---

## 📖 About The Project

World Map Quiz is a fast-paced, interactive geography game designed to help you learn world countries. Built with a modern tech stack but designed for simplicity, it requires **no build step** and runs directly in the browser.

### ✨ Key Features

- **🗺️ Interactive Map:** Fully zoomable and pannable SVG map powered by `react-simple-maps`.
- **⌨️ Smart Typing:** 
  - **Fuzzy Matching:** Typo forgiveness (e.g., "Afganistan" is accepted).
  - **Aliases:** Accepts common alternative names (e.g., "USA", "UK").
- **🚩 Flag Streak Bonus:**
  - Get 5 correct answers in a row to trigger a Flag Challenge.
  - Identify the flag correctly for **+15 seconds**!
- **📊 Learning Bank:**
  - See which countries you missed.
  - Read interesting facts about every country.
  - Track your "Recent Finds" in real-time.
- **📱 Responsive Design:** Works on desktop and mobile.
- **🎨 Beautiful UI:** Glassmorphism effects, smooth Framer Motion animations, and Dark Mode.
- **📤 Shareable Results:** Copy a "Wordle-style" result grid to share your score with friends.

---

## 🎮 How to Play

1.  **Start the Game:** Choose your region (Global, Europe, Asia, etc.) and time limit.
2.  **Type Country Names:** Enter names in the input box at the bottom.
3.  **Explore:** The map automatically highlights found countries in **Green**.
4.  **Bonuses:** Watch for the "Flag Bonus" popup in the top-left corner.
5.  **Game Over:** Review your stats, see missed countries in **Red**, and share your score!

---

## 🛠️ Built With

This project uses a unique "No-Build" architecture for maximum portability and simplicity.

*   ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) **React 18** (Loaded via ESM CDN)
*   ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) **Tailwind CSS** (Script CDN)
*   **React Simple Maps** (D3-geo visualization)
*   **Framer Motion** (Production-grade animations)
*   **Lucide React** (Beautiful iconography)

---

## 🚀 Getting Started

To run this project locally, you don't need `npm install` or `npm run dev`.

1.  **Clone the repo**
    ```sh
    git clone https://github.com/oscarbrimelow/CountryNames.git
    ```
2.  **Run a local server**
    You cannot open `index.html` directly due to CORS rules with ES Modules. Use a simple server:
    
    *   **VS Code:** Install "Live Server" extension and click "Go Live".
    *   **Python:** `python -m http.server 8000`
    *   **Node:** `npx serve .`

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Made with ❤️ by Oscar Brimelow</p>
</div>
