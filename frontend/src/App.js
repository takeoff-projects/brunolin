// import logo from './logo.svg';
// import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import ButtonAppBar  from "./AppBar";
import Container  from "@mui/material/Container";
import UploadPage from "./UploadPage";
import ProductsPage from "./ProductsPage";

function App() {
  console.log(process.env)
  console.log(process.env.REACT_APP_API_URL)
  return (
  <Router>
  
   <Container maxWidth="xl" disableGutters={true}>
     <ButtonAppBar />

     <Switch>
          <Route path="/upload">
            <UploadPage/>
          </Route>
          <Route path="/products">
          <ProductsPage/>
          </Route>
          <Route path="/etl">
          <UploadPage/>
          </Route>
          <Route path="/">
          <UploadPage/>
          </Route>
      </Switch>
  

     </Container>
  </Router>
  );
}

export default App;
