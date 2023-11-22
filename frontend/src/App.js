import "./App.css";
import TextEditor from "./TextEditor.js";
import { Navigate, Route, Routes } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

function App() {
  return (
    <div className="App">
      <h1>Autosave Document Editor</h1>

      <Routes>
        <Route
          path="/"
          exact
          element={<Navigate to={`/docs/${uuidV4()}`} replace />}
        />
        <Route path="/docs/:id" element={<TextEditor />} />
      </Routes>
    </div>
  );
}

export default App;
