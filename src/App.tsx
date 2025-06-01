import MainRouter from "./routers/MainRouter";
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <>
      <Toaster position="top-center" />
      <MainRouter />
    </>
  );
}

export default App;
