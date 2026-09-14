import "./style.css";
import { showStartupError } from "./startup-error.js";

// Catch graphics initialization as well as module-loading failures.
import("./workshop.js").catch((error) => {
  console.error(error);
  showStartupError();
});
