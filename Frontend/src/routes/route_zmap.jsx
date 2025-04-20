// route_map.ts
import { Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from './route_paths';
import { ROUTE_ELEMENTS } from './route_elements';

export const route_map = [
  {
    path: ROUTE_PATHS.AUTH,
    element: ROUTE_ELEMENTS.AUTH,
    children: [
      { path: 'login', element: ROUTE_ELEMENTS.LOGIN_FORM },
      { path: 'registration', element: ROUTE_ELEMENTS.REGISTRATION_FORM },
      { index: true, element: <Navigate to="login" replace /> },
    ],
  },
  {
    path: ROUTE_PATHS.ROOT,
    element: ROUTE_ELEMENTS.PROTECTED_MAIN,
    children: [
      { index: true, element: ROUTE_ELEMENTS.WELCOME },
      { path: ROUTE_PATHS.CHAT, element: ROUTE_ELEMENTS.CHAT_PAGE },
    ],
  },
  {
    path: ROUTE_PATHS.LOGIN,
    element: <Navigate to={`${ROUTE_PATHS.AUTH}/login`} replace />,
  },
  {
    path: ROUTE_PATHS.REGISTER,
    element: <Navigate to={`${ROUTE_PATHS.AUTH}/registration`} replace />,
  },
  {
    path: ROUTE_PATHS.WILDCARD,
    element: <Navigate to={ROUTE_PATHS.ROOT} replace />,
  },
];