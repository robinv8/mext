import "regenerator-runtime/runtime";
import { createWrapper } from 'next-redux-wrapper';
import { create } from 'dva-core';
import createLoading from 'dva-loading';
import dvaImmer from 'dva-immer';
{{{ RegisterModelImports }}}
let app;
let store;
let dispatch;

function createApp(opt) {
  app = create(opt);
  app.use(dvaImmer());
  app.use(createLoading({}));
  {{{ RegisterModels }}}
  global.registered = true;
  app.start();
  store = app._store;
  app.getStore = () => store;
  dispatch = store.dispatch;
  app.dispatch = dispatch;
  return app;
}
const isBrowser = () => {
  return typeof window !== 'undefined';
};
const getDvaData = () => {
  const dataStr = document.getElementById('__NEXT_DATA__')
  const data = JSON.parse(dataStr.innerText)
  return data
}
const dvaApp = createApp({
  ...(isBrowser() ? getDvaData().props.pageProps : { initialState: {} })
});
const makeStore = () => {
  return dvaApp.getStore();
};

export const wrapper = createWrapper(makeStore);
