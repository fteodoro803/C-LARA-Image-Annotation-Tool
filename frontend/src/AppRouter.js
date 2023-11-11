import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import App from "./App";
import ImageDetailPage from "./ImageDetailPage";
import MapToolPage from "./MapToolPage";
import MapToolPageWithLasso from "./MapToolPageWithLasso";

function AppRouter() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/image-detail" component={ImageDetailPage} />
          <Route path="/map-tool" component={MapToolPage} />

          {/*<Route path="/map-tool" component={MapToolPageWithLasso} />*/}
      </Switch>
    </Router>
  );
}

export default AppRouter;