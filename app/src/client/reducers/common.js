export function createReducer(handlers, fallback) {
  return (state, action) => {
    const handler = handlers[action.type];
    if (handler) {
      const typedHandler = action.error ? handler.failure : handler.success;
      return (typedHandler || handler)(state, action.payload, action.meta);
    }
    if (typeof fallback === 'function') {
      return fallback(state, action);
    }
    return state || fallback;
  };
}
