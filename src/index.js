import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { Modal } from 'antd'
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import { mainRoutes } from './routes'
import { Provider } from 'react-redux'
import store from './store/index'

const getConfirmation = (message, callback) => {
  Modal.confirm({
    title: message,
    cancelText: '我再想想...',
    okText: '狠心离开！',
    onCancel: () => {
      callback(false);
    },
    onOk: () => {
      callback(true);
    }
  });
};

ReactDOM.render(
  <Provider store={store}>
    <Router getUserConfirmation={getConfirmation}>
      <Switch>
        {mainRoutes.map(route => <Route key={route.path} {...route} />)}

        <Route path="/admin" render={routeProps => <App {...routeProps} />} />

        <Redirect to="/admin" from="/" />
        <Redirect to="/404" />
      </Switch>
    </Router>
  </Provider>,
  document.getElementById('root')
);