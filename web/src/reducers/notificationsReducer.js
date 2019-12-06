export default (
  state = [],
  action,
) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return [...state, action.notification];
    case 'REMOVE_NOTIFICATION':
      return state.filter((notification) => notification.id !== action.id);
    default:
      return state;
  }
};
