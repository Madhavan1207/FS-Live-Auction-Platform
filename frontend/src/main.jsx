import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { store } from "./store/store.js";
import "./index.css";

// Redux's <Provider> (global listings/bids store, Experiment 3) sits
// alongside AuthContext's <AuthProvider> (auth/role state, Experiment 2).
// They manage different slices of state and don't interfere with each
// other — a component can use useContext for "who am I" and useSelector
// for "what are the listings" at the same time.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
