import { render } from "preact";
import { LocationProvider } from "preact-iso";
import "bootstrap/dist/css/bootstrap.min.css";
import { App } from "./app.tsx";

render(
  <LocationProvider>
    <App />
  </LocationProvider>,
  document.getElementById("app")!,
);
