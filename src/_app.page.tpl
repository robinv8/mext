import '../global.scss';
import '@utils/OA_Show';
import type { AppProps } from 'next/app';
import { wrapper, makeStore } from '@utils/dva';
import { FC } from 'react';
import { Provider } from 'react-redux';
import '@fortawesome/fontawesome-pro/css/all.css';
import Layout from '../layouts';
import { useParams, useLocation, getRoute } from '@sf';
const store = makeStore();

const WrappedApp: FC<AppProps> = ({ Component, pageProps }) => {
  const params = useParams();
  const location = useLocation();
  const routes = getRoute(location.pathname);
  const hasSubRoutes = routes.filter(({ route }) => route.routes).length > 0;
  if (hasSubRoutes && routes[routes.length - 1].route.path !== '*') {
    return (
      <Provider store={store}>
        <Layout>
          <Component {...pageProps} match={{ params }} location={location} />
        </Layout>
      </Provider>
    );
  } else {
    return (
      <Provider store={store}>
        <Component {...pageProps} match={{ params }} location={location} />
      </Provider>
    );
  }
};

export default wrapper.withRedux(WrappedApp);
