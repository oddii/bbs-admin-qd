import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Layout from './Layout'
import { adminRoutes } from './routes'


import './index.scss'

function App() {
  return (
    <Layout>
      <Switch>
        {
          adminRoutes.map(route => {
            return route.children
              ? route.children.map(children =>
                <Route
                  key={children.path}
                  {...children}
                  component={children.component} />)
              // render={routeProps => <children.component {...routeProps} }
              : <Route
                key={route.path}
                {...route}
                component={route.component} />
            // render={routeProps => <route.component {...routeProps} }
          })
        }

        <Redirect to={adminRoutes[0].path} from="/admin" exact />
        <Redirect to="/404" />
      </Switch>
    </Layout>
  );
}

export default App;
