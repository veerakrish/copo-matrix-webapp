# CO-PO-PSO Matrix Web Application

A modern web application for generating Course Outcome (CO) to Program Outcome (PO) and Program Specific Outcome (PSO) mapping matrices for CSE programs, following NBA-style assessment standards.

## ✨ Features

- **Course Input**: Enter course name, code, and multiple Course Outcomes (COs) with K-levels
- **Automatic Mapping**: Intelligent correlation between COs and POs/PSOs based on competency and performance indicator matching
- **K-Level Comparison**: Automatic calculation of correlation values (3, 2, 1, or blank) based on K-level comparison
- **Syllabus Integration**: Upload course syllabus (PDF/DOCX/TXT) for enhanced, context-aware justifications
- **AI-Powered Justifications**: Uses Mistral AI for generating precise, single-sentence justifications
- **PSO Support**: Includes Program Specific Outcomes (PSO1-PSO3) mapping
- **Average Calculation**: Automatic calculation of average correlation values per PO/PSO
- **DOCX Export**: Download the complete matrix as an editable Word document
- **Dark Theme**: Beautiful, modern dark UI for better user experience

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Mistral AI API key (optional, for enhanced justifications)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/copo-matrix-webapp.git
   cd copo-matrix-webapp
   ```

2. **Install dependencies**:
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and add your MISTRALAI_API_KEY
   ```

4. **Run the application**:
   ```bash
   npm run dev
   ```

   This starts:
   - Backend server on `http://localhost:5001`
   - Frontend development server on `http://localhost:3000`

## 📖 Usage

1. Open the application in your browser (`http://localhost:3000`)
2. Enter **Course Name** and **Course Code**
3. (Optional) Upload course syllabus for enhanced justifications
4. Add **Course Outcomes (COs)**:
   - Each CO needs a description
   - Select Knowledge Level (K1-K6) from dropdown
   - Add/remove COs as needed
5. Click **"Generate CO-PO Matrix"**
6. View the generated matrix with color-coded correlations
7. Review detailed reasoning and justifications
8. Click **"Download as DOCX"** to export the matrix

## 🎯 K-Level Mapping

- **K1**: Remember
- **K2**: Understand
- **K3**: Apply
- **K4**: Analyze
- **K5**: Evaluate
- **K6**: Create

## 📊 Correlation Values

- **3** (Green): CO K-level > PO/PSO K-level (exceeds expectations)
- **2** (Yellow): CO K-level = PO/PSO K-level (meets expectations)
- **1** (Red): CO K-level < PO/PSO K-level (partially meets, but still satisfies)
- **Blank (-)**: No meaningful correlation found

## 🏗️ Technology Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **AI Integration**: Mistral AI (for justifications)
- **Document Generation**: docx library
- **File Processing**: pdf-parse, mammoth

## 📁 Project Structure

```
copo_new_webapp/
├── server/
│   ├── index.js          # Express server & API routes
│   ├── poData.js         # PO/PSO data structure
│   ├── copoLogic.js      # CO-PO correlation logic
│   ├── mistralService.js # Mistral AI integration
│   ├── syllabusParser.js # Syllabus text extraction
│   └── docxGenerator.js  # DOCX document generator
├── client/
│   ├── src/
│   │   ├── App.jsx       # Main React component
│   │   ├── main.jsx      # React entry point
│   │   └── index.css     # Styles (dark theme)
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env.example          # Environment variables template
├── render.yaml           # Render deployment config
├── vercel.json           # Vercel deployment config
├── netlify.toml          # Netlify deployment config
└── package.json
```

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options:

**Option 1: Render (Full Stack)**
- Backend: Render Web Service
- Frontend: Render Static Site

**Option 2: Vercel + Render**
- Frontend: Vercel
- Backend: Render

**Option 3: Netlify + Railway**
- Frontend: Netlify
- Backend: Railway

All platforms offer free tiers suitable for this application.

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
```env
MISTRALAI_API_KEY=your_mistral_api_key_here
PORT=5001
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env)**:
```env
VITE_API_URL=http://localhost:5001
```

### Customizing POs/PSOs

Edit `server/poData.js` to modify:
- Program Outcomes (PO1-PO11)
- Program Specific Outcomes (PSO1-PSO3)
- Competencies and Performance Indicators
- Required K-levels

## 📝 API Endpoints

- `GET /api/po-data` - Returns all PO/PSO data
- `POST /api/upload-syllabus` - Upload and parse syllabus file
- `POST /api/generate-matrix` - Generate CO-PO-PSO matrix
- `POST /api/download-docx` - Download matrix as DOCX

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is created for educational and institutional use.

## 🙏 Acknowledgments

- NBA (National Board of Accreditation) standards
- Mistral AI for LLM integration
- All open-source libraries used in this project
